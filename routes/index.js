const express = require("express");
const Posts = require("./posts");
const Likes = require("./likes");
const Comments = require("./comments");

const router = express.Router();

router.use('/posts/', Posts);
router.use('/comments/', Comments);
router.use('/likes/', Likes);

module.exports = router;
