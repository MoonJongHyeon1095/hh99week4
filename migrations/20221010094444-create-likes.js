'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    /**
   * @param {import("sequelize").QueryInterface} queryInterface - Sequelize Query Interface
   * @param {import("sequelize")} Sequelize - Sequelize
   * **/
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Likes', {
      likeId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.DataTypes.INTEGER,
      },
      postId: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        reference: {
          model : 'Posts',
          key : 'postId',
        },
        onDelete: 'cascade'
      },
      userId: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        reference: {
          model: 'Users',
          key: 'userId'
        },
        onDelte: 'cascade',
      },
      nickname: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      title: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      isLike: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DataTypes.DATE,
        defaultValue: Sequelize.DataTypes.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DataTypes.DATE,
        defaultValue: Sequelize.DataTypes.NOW,
      }
    });
  },
    /**
   * @param {import("sequelize").QueryInterface} queryInterface - Sequelize Query Interface
   * @param {import("sequelize")} Sequelize - Sequelize
   * **/
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Likes');
    //await queryInterface.removeColumn('Likes', 'likes')
    
  }
};