'use strict';
const {Model} = require('sequelize');

/**
 * @param {import("sequelize").Sequelize} sequelize - Sequelize
 * @param {import("sequelize").DataTypes} DataTypes - Sequelize Column DataTypes
 * @return {Model} - Sequelize Model
 * **/
module.exports = (sequelize, DataTypes) => {
  class Comments extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Posts,{foreignKey: 'postId'});
      this.belongsTo(models.Users,{foreignKey: 'userId'});
    }
  }
  Comments.init({
    commentId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      unique: true,
      type: DataTypes.INTEGER,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        // 관계를 맺는다.
        model: 'Users', // Users 테이블의
        key: 'userId', // userId 컬럼과
      },
    },
    postId:  {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        // 관계를 맺는다.
        model: 'Posts', // Users 테이블의
        key: 'postId', // userId 컬럼과
      },
      onDelete: 'cascade', // Users 테이블의 데이터가 사라질 경우 게시글도 naver Cafe도 사라진다.
    },
    nickname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false,
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
    modelName: 'Comments',
  });
  return Comments;
};