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
          attributes: {exclude: ["createdAt", "updatedAt", "likes"]}, 
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

//좋아요 등록 및 취소
router.put("/:postId", authMiddleware, async (req, res) => {
  const {postId} = req.params;
  const {user} = res.locals;
  console.log(user);
  const currentLike = req.body["like"];    

  const isExist = await Posts.findByPk(postId);
  if (!isExist) {
  res.status(404).json({ message: '게시글 조회에 실패하였습니다.' });
  return;
  }

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

module.exports = router;
