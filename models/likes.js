'use strict';
const {Model} = require('sequelize');

/**
 * @param {import("sequelize").Sequelize} sequelize - Sequelize
 * @param {import("sequelize").DataTypes} DataTypes - Sequelize Column DataTypes
 * @return {Model} - Sequelize Model
 * **/
module.exports = (sequelize, DataTypes) => {
  class Likes extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Users, {foreignKey: 'userId'});

      this.belongsTo(models.Posts,{foreignKey: 'postId'});
    }
  }
  Likes.init(
  {
    likeId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        // 관계를 맺는다.
        model: 'Posts', // Users 테이블의
        key: 'postId', // userId 컬럼과
      },
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
    nickname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    likes: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 0,
    },
    isLike: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
    modelName: 'Likes',
  });
  return Likes;
};