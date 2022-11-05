const express = require("express");
const authMiddleware = require("../middlewares/auth-middleware");
//const { Users } = require("../models");
//const { Posts } = require("../models");
const router = express.Router();

const PostsController = require('../controllers/posts.controllers');
const postsController = new PostsController();

router.get('/', postsController.getPosts);
router.get('/:postId', postsController.getPostById);
router.post('/',authMiddleware, postsController.createPost);
router.put('/:postId',authMiddleware, postsController.updatePost);
router.delete('/:postId',authMiddleware, postsController.deletePost);

/***
 * 3계층 아키텍쳐 패턴 적용. 기능 이전.
 *  
//게시글목록조회 : 토큰필요 없음.
router.get("/", async (req, res) => {
  try {
    let posts = await Posts.findAll({
        order: [['createdAt', 'DESC']]
    })
    let resultList = [];

    for (const post of posts) {
      resultList.push({
        postId: post.postId,
        userId: post.userId,
        nickname: post.nickname, 
        title: post.title,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        likes : post.likes,
      });
    }

    res.status(200).json({ data: resultList });
  } catch (error) {
    const message = `${req.method} ${req.originalUrl} : ${error.message}`;
    console.log(message);
    res.status(400).json({ message });
  }
});
*/

/**
 *3계층 아키텍쳐 패턴 적용. 기능 이전.
 *  
 
//게시글 상세 조회 : 토큰필요 없음.
router.get("/:postId", async (req, res) => {
  try {
    const postNum = req.params.postId;

    if (!postNum) { // TODO: Joi를 사용하지 않음
      res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });
      return;
    }

    const post = await Posts.findOne({ 
        where: {
            postId:postNum 
        }, 
        include: [{ //associate 이후 include 실험
          model : Users,
          key: 'userId',
          attributes:['userId', 'nickname', 'createdAt','updatedAt']
        }],
    });

    // const result = {
    //   postId: post.postId,
    //   userId: post.userId,
    //   nickname: post.nickname,
    //   title: post.title,
    //   content: post.content,
    //   createdAt: post.createdAt,
    //   updatedAt: post.updatedAt,
    //   likes: post.likes,
    // };

    res.status(200).json({ data: post });
  } catch (error) {
    const message = `${req.method} ${req.originalUrl} : ${error.message}`;
    console.log(message);
    res.status(400).json({ message });
  }
});
*/

/** 
//개시글 생성 : 토큰 필요
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {user} = res.locals;
    console.log(user)
    console.log(user.userId)
    console.log(user.nickname)
    const title = req.body["title"];
    const content = req.body["content"];

    if (!user || !title || !content) { // TODO: Joi를 사용하지 않음
      res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });
      return;
    }

    await Posts.create({ userId:user.userId, nickname:user.nickname, title, content });

    res.status(201).json({ message: "게시글을 생성하였습니다." });
  } catch (error) {
    const message = `${req.method} ${req.originalUrl} : ${error.message}`;
    console.log(message);
    res.status(400).json({ message });
  }
});
*/


/**
 * 
 *
//게시글 수정
router.put("/:postId", authMiddleware, async (req, res) => {
    const postId = req.params.postId;
    const {userId} = res.locals.user;
    const title = req.body["title"];
    const content = req.body["content"];     
    
    try { 

    if (!postId || !userId || !title || !content) { // TODO: Joi를 사용하지 않음
      res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });
      return;
    }

    const isExist = await Posts.findByPk(postId);

    if (!isExist) {
      res.status(404).json({ message: '게시글 조회에 실패하였습니다.' });
      return;
    }

    await Posts.update(
        {userId:userId, title:title, content:content},
        
        {where : {postId:postId}});

    res.status(201).json({ message: "게시글을 수정하였습니다." });

  } catch (error) {
    const message = `${req.method} ${req.originalUrl} : ${error.message}`;
    console.log(message);
    res.status(400).json({ message });
  }
});


// 게시글 삭제
router.delete("/:postId",authMiddleware, async (req, res) => {
  try {
    const postId = req.params.postId;
    const {userId} = res.locals.user;

    const isExist = await Posts.findByPk( postId );

    if (!isExist || !postId) {
      res.status(404).json({ message: '게시글 조회에 실패하였습니다.' });
      return;
    }

    await Posts.destroy({ where: {postId:postId} });
    res.status(201).json({ message: "게시글을 삭제하였습니다." });
    
  } catch (error) {
    const message = `${req.method} ${req.originalUrl} : ${error.message}`;
    console.log(message);
    res.status(400).json({ message });
  }
});
*/

module.exports = router;
