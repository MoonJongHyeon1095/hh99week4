const express = require("express");
const {Comments} = require("../models");
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware");

//댓글 목록 조회
router.get("/:postId", async (req, res) => {
  try {
    const postId = req.params.postId;

    if (!postId) { // TODO: Joi를 사용하지 않음
      res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });
      return;
    }

    const comments = await Comments.findAll({ 
        where: {postId: postId}, 
        order: [["createdAt", "DESC"]]
    })

    let resultList = [];

    for (const comment of comments) {
      resultList.push({
        commentId: comment.commentId,
        userId: comment.userId,
        nickname: comment.nickname,
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,   
      });
    }

    res.status(200).json({ data: resultList });
  } catch (error) {
    const message = `${req.method} ${req.originalUrl} : ${error.message}`;
    console.log(message);
    res.status(400).json({ message });
  }
});

//댓글 생성
router.post("/:postId", authMiddleware, async (req, res) => {
  try {
    const postId = req.params.postId;
    const {user}  = res.locals;
    const content = req.body["content"];

    if (!content) { // TODO: Joi를 사용하지 않음
      res.status(400).json({ message: '댓글 내용을 입력해주세요.' });
      return;
    }

    if (!postId || !user.userId ) { // TODO: Joi를 사용하지 않음
      res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });
      return;
    }


    await Comments.create({ postId:postId, userId:user.userId, nickname:user.nickname, content:content });

    res.status(201).json({ message: "댓글을 생성하였습니다." });
  } catch (error) {
    const message = `${req.method} ${req.originalUrl} : ${error.message}`;
    console.log(message);
    res.status(400).json({ message });
  }
});

// 댓글 수정
router.put("/:commentId",authMiddleware, async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const {user}= res.locals;
    const content = req.body["content"];

    if (!content) { // TODO: Joi를 사용하지 않음
      res.status(400).json({ message: '댓글 내용을 입력해주세요.' });
      return;
    }

    const isYours = await Comments.findOne({
        where : {userId:user.userId}
    })
    if (!isYours) { // TODO: Joi를 사용하지 않음
        res.status(400).json({ message: '당신이 쓴 댓글이 아닌걸요.' });
        return;
      }

    const isExist = await Comments.findByPk( commentId );
    if (!isExist) {
      res.status(404).json({ message: '댓글 조회에 실패하였습니다.' });
      return;
    }

    await Comments.update(
        { content:content },
        
        {where : {commentId:commentId}});

    res.status(201).json({ message: "댓글을 수정하였습니다." });
  } catch (error) {
    const message = `${req.method} ${req.originalUrl} : ${error.message}`;
    console.log(message);
    res.status(400).json({ message });
  }
});

// 댓글 삭제
router.delete("/:commentId",authMiddleware, async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const {user}= res.locals

    const isYours = await Comments.findOne({
        where : {userId:user.userId}
    })
    if (!isYours) { // TODO: Joi를 사용하지 않음
        res.status(400).json({ message: '당신이 쓴 댓글이 아닌걸요.' });
        return;
      }

    const isExist = await Comments.findByPk( commentId );

    if (!isExist) {
      res.status(404).json({ message: '댓글 조회에 실패하였습니다.' });
      return;
    }

    await Comments.destroy({ where: {commentId:commentId} });
    res.status(201).json({ message: "댓글을 삭제하였습니다." });
  } catch (error) {
    const message = `${req.method} ${req.originalUrl} : ${error.message}`;
    console.log(message);
    res.status(400).json({ message });
  }
});

module.exports = router;
