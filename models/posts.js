'use strict';
const {Model} = require('sequelize');

/**
 * @param {import("sequelize").Sequelize} sequelize - Sequelize
 * @param {import("sequelize").DataTypes} DataTypes - Sequelize Column DataTypes
 * @return {Model} - Sequelize Model
 * **/
module.exports = (sequelize, DataTypes) => {
  class Posts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Users,{
        foreignKey: 'userId',
      });
      this.hasMany(models.Comments,{
        as: 'Comments',
        foreignKey: 'postId',
      });
      this.hasMany(models.Likes,{
        as: 'Likes',
        foreignKey: 'postId',
      })
    }
  }
  Posts.init(
    {
    postId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      unique:true,
      type: DataTypes.INTEGER,
    },
    userId:  {
      type: DataTypes.INTEGER,
      allowNull: false, 
      //주의. 여기서 unique를 쓰면 userId하나가 post 하나만 써야 한다는게 되어버린다.
      references: {
        // 관계를 맺는다.
        model: 'Users', // Users 테이블의
        key: 'userId', // userId 컬럼과
      },
      onDelete: 'cascade', // Users 테이블의 데이터가 사라질 경우 게시글도 사라진다.
    },
    nickname: {
      type: DataTypes.STRING,
      allowNull:false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    likes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, 
  {
    sequelize,
    modelName: 'Posts',
  
  });
  return Posts;
};