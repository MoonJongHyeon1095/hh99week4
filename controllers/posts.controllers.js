const logger = require('../config/winston');
const PostService = require('../services/posts.services');


class PostsController {
    postService = new PostService();
  
    //게시글목록조회 : 토큰필요 없음.
    getPosts = async (req, res, next) => {
      const posts = await this.postService.findAllPost();
  
      res.status(200).json({ data: posts });
    };

    //게시글상세조회 : 토큰필요없음.
    getPostById = async (req, res, next) => {
        const { postId } = req.params;
        const post = await this.postService.findPostById(postId);
    
        res.status(200).json({ data: post });
      };
    
    //게시물 생성 : 토큰필요
    createPost = async(req,res,next)=> {
        const {userId} = res.locals.user;
        const {nickname} = res.locals.user;
        logger.debug(userId);
        logger.debug(nickname);
        const { title, content } = req.body;

        if (!userId || !title || !content) { // TODO: Joi를 사용하지 않음
            res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });
            return;
        }

        // 서비스 계층에 구현된 createPost 로직을 실행합니다.
        const createPostData = await this.postService.createPost(
            userId,
            nickname,
            title,
            content
          );
        res.status(201).json({ data: createPostData, message: "게시글을 생성하였습니다."});
    };
    
    updatePost = async (req, res, next) => {
        const { postId } = req.params;
        const { userId } = res.locals.user;
        const { title, content } = req.body;

        if (!postId || !userId || !title || !content) { // TODO: Joi를 사용하지 않음
            res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });
            return;
          }
    
        const updatePost = await this.postService.updatePost(
          postId,
          userId,
          title,
          content
        );
        res.status(200).json({ data: updatePost, message : "게시글을 수정하였습니다."});
    };

    deletePost = async (req, res, next) => {
            const { postId } = req.params;
            const { userId } = res.locals.user;
        
            const deletePost = await this.postService.deletePost(postId, userId);
        
            res.status(200).json({ data: deletePost, message : "게시글을 삭제하였습니다."});
          };
  };
    
      


module.exports = PostsController;