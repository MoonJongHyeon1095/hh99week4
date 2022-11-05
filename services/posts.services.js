const PostRepository = require('../repositories/posts.repository');

class PostService {
  postRepository = new PostRepository();

    //게시글목록조회 : 토큰필요 없음.
  findAllPost = async () => {
    const allPost = await this.postRepository.findAllPost();

    allPost.sort((a, b) => {
      return b.likes - a.likes;
    });

    return allPost.map((post) => {
        return {
          postId: post.postId,
          userId: post.userId,
          nickname: post.nickname,
          title: post.title,
          likes: post.likes,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
        };
      });
    }

    //게시글 상세 조회 : 토큰필요 없음. 
    findPostById = async (postId) => {
        const findPost = await this.postRepository.findPostById(postId);
    
        return {
          postId: findPost.postId,
          userId: findPost.userId,
          nickname: findPost.nickname,
          title: findPost.title,
          content: findPost.content,
          likes: findPost.likes,
          createdAt: findPost.createdAt,
          updatedAt: findPost.updatedAt,
        };
      };

      //게시물 생성 : 토큰 필요
      createPost = async (userId, nickname, title, content) => {
        const createPostData = await this.postRepository.createPost(
            userId,
            nickname,
             title,
             content
        );
            
        return {
          postId: createPostData.null,
          userId: createPostData.userId,
          nickname: createPostData.nickname,
          title: createPostData.title,
          content: createPostData.content,
          createdAt: createPostData.createdAt,
          updatedAt: createPostData.updatedAt,
        };
      };

      updatePost = async (postId, userId, title, content) => {
        const findPost = await this.postRepository.findPostById(postId);
        if (!findPost) throw new Error("Post doesn't exist");
    
        await this.postRepository.updatePost(postId, userId, title, content);
    
        const updatePost = await this.postRepository.findPostById(postId);
    
        return {
          postId: updatePost.postId,
          userId: updatePost.userId,
          nickname: updatePost.nickname,
          title: updatePost.title,
          content: updatePost.content,
          likes: updatePost.likes,
          createdAt: updatePost.createdAt,
          updatedAt: updatePost.updatedAt,
        };
      };

      deletePost = async (postId, userId) => {
        const findPost = await this.postRepository.findPostById(postId);
        if (!findPost) throw new Error("Post doesn't exist");

        await this.postRepository.deletePost(postId, userId);
    
        return {
          postId: findPost.postId,
          userId: findPost.userId,
          nickname: findPost.nickname,
          title: findPost.title,
          content: findPost.content,
          likes : findPost.likes,
          createdAt: findPost.createdAt,
          updatedAt: findPost.updatedAt,
        };
      };
      

      
}


module.exports = PostService;