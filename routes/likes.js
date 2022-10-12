const express = require("express");
const authMiddleware = require("../middlewares/auth-middleware");
const { Op } = require("sequelize");
const { Posts } = require("../models");
const { Likes } = require("../models");
const router = express.Router();

//좋아요 게시글 조회 : 로그인 필요
router.get("/",authMiddleware, async (req, res) => {
    const {user} = res.locals;
    console.log(user.userId) // 1 (userId 숫자)
    try {
        const likeList = await Likes.findAll({
          where: {userId : user.userId}, 
          order: [['likes', 'DESC']],
          attributes: {exclude: ["createdAt", "updatedAt"]}, 
          //attribute[]로 하나하나 배열 안에 열거해도 된다. attribute 안에서 exclude로 일종의 부정신학을 해도 된다.
          //like field의 likes는 특정 유저와 특정 포스트의 좋아요가 눌릴때에만 업데이트 된다. 
          //likes 카운트 자체는 아래에서 Posts 테이블에서 매번 꺼내오므로 최신이 맞지만, 
          //Likes 테이블은 특정 유저와 특정 포스트에 따라 겁나게 많고, 그 중 불려나온 것만 그때그때 likes 업데이트가 된다.(사실 N대N 관계 사이에 낑겨있기 때문이다.)
          //카운트는 Posts테이블에서 누산되고 있는 likes가 정확하다. 그러므로 exclude로 배제했다.

          include: [{ 
            model: Posts, 
            key: 'postId', 
            attributes:['createdAt', 'updatedAt', 'likes' ] 
          }],
        });
        console.log(likeList);
        
        // let result = [];
        // for(const like of likeList){
        //   if(like.likes >=1){
        //     result.push({
        //         userId: like.userId,
        //         postId: like.postId,
        //         nickname: like.nickname, 
        //         title: like.title,
        //         createdAt: like.createdAt,
        //         updatedAt: like.updatedAt,
        //         likes : like.likes,
        //       });
        //   }}
      res.status(200).json({ data: likeList });

    } catch (error) {
      const message = `${req.method} ${req.originalUrl} : ${error.message}`;
      console.log(message);
      res.status(400).json({ message });
    }
  });

/**좋아요 등록 및 취소
 * 처음에는 Likes테이블에 기록된 좋아요 여부(isLike)와 클라이언트로부터 들어온 현재 좋아요 (currentLike)를 생각하여,
 * 각각 1.true true 일 떄 변화 없음. / 2.true false일 때 -1. / 3.false true일 때 +1. / 4.false false일 때 변화없음.
 * 이라고 했던 거다.
 * 그런데 그런거를 서버에서 생각할 이유가 사실... 없잖아. 2번과 3번의 경우만 그냥 들어온다고 생각하면 된다. 1번과 4번은 아예 안들어오는 거다.
 * 사정이 그러니, 걍 isLike만 조건문을 돌린다. !isLike 조건이 내가 고민한 false->true 의 변화를 표현해낸다.
 * 걍 이 put method 가 호출되는 것만으로, isLike가 false 혹은 null이면 조건문에서 true로 변하여 좋아요를 누른다.
 * isLike가 true면 조건문에서 false로 변하여 좋아요를 취소하고 테이블을 날려버린다.
 * 
 * 이 얼마나 지혜로운가....(자뻑아님. 내가 짠 코드가 아니라 동료의 코드다.)
 * 코드로 정동情動을 포착하려면 경우의 수를 따질 수밖에 없다고 생각한 나는 바보였다.
 * 
 * 그리고 이 불안정하기 짝이 없는 Likes table은 그때 그때 만들거나 없애버린다.
 * 
 * 
*/
router.put("/:postId", authMiddleware, async (req, res) => {
  
  try{
  const {postId} = req.params;
  const {user} = res.locals;  

  const isExist = await Posts.findByPk(postId);
  if (!isExist) {
  res.status(404).json({ message: '게시글 조회에 실패하였습니다.' });
  return;
  }

  const isLike = await Likes.findOne({
    where: { postId, userId: user.userId },
  });

  if (!isLike) {
    await Likes.create({ postId, userId: user.userId, nickname:user.nickname, title:isExist.title, isLike:true });
    await Posts.increment({ likes: 1 }, { where: { postId } });
    return res.status(201).send({ msg: "좋아요 하셨습니다." });
  } else {
    await Likes.destroy({ where: { postId, userId: user.userId } });
    await Posts.decrement({ likes: 1 }, { where: { postId } });
    return res.status(200).send({ msg: "좋아요를 취소하였습니다." });
  }
} catch (err) {
  console.error(err);
  res.status(500).json({ errorMessage: err.message });
}
});

/** 
 * 6가지 경우의 수를 다루며 Likes 테이블을 업데이트 하고자 했던 장구하고 미련한 계획의 흔적.
 * 
 * 
 try { 
    //Posts 테이블 지금 게시글의 좋아요 숫자
    let likeCount = isExist.likes;

    //해당 로그인 유저에 대한 like table이 없다면?
    const likeExist = await Likes.findOne({
       where :{userId:user.userId, postId:postId}
    });
    
    if(!likeExist){
      currentLike ? likeCount+=1 : likeCount;

      await Posts.update({likes:likeCount},{where : {postId:postId}});
      await Likes.create({userId:user.userId, postId:postId, nickname:user.nickname, title:isExist.title, likes:likeCount, isLike:currentLike});  
      if(currentLike==true){
        return res.status(201).json({ message: "와! 이 게시글에 좋아요를 처음으로 등록." }); // false true +1
      }else{
        return res.status(201).json({}); // false false 변화 없음
      }
    }
    
    if(currentLike==true){ 

      likeExist.islike ? likeCount : likeCount+=1;

      await Posts.update({likes:likeCount},{where : {postId:postId}});
      await Likes.update({likes:likeCount, isLike:currentLike},  {where :{userId:user.userId, postId:postId}});
      if(likeExist.islike==false){
        return res.status(201).json({message : "게시글 좋아요를 등록했습니다."}); // false true +1
      }else{
        return res.status(201).json({}); // true true 변화없음
      }

    }else if(currentLike==false) {

      likeExist.isLike ? likeCount-=1 : likeCount;
      
      await Posts.update({likes:likeCount},{where : {postId:postId}});
      await Likes.update({likes:likeCount, isLike:currentLike},  {where :{userId:user.userId, postId:postId}});
      
      if(likeExist.islike==true){
        return res.status(201).json({message : "게시글 좋아요를 취소했습니다."});  // true false -1
      }else{
        return res.status(201).json({}); // false false 변화없음
      }
    }
            
  } catch (error) {
    const message = `${req.method} ${req.originalUrl} : ${error.message}`;
    logger.info(message);
    res.status(400).json({ message });
  }
});
*/

module.exports = router;
