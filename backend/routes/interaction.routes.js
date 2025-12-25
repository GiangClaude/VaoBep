const express = require('express');
const router = express.Router();
const interactionController = require('../controllers/interaction.controllers');
const { protect } = require('../controllers/auth.controllers');

// Nhóm Like & Save
router.post('/like', protect, interactionController.toggleLike);
router.post('/save', protect, interactionController.toggleSave);

// Nhóm Comment
router.post('/comment', protect, interactionController.postComment);
router.get('/comments', interactionController.getComments); // Không cần protect nếu cho khách xem cmt

// Nhóm Rating
router.post('/rate', protect, interactionController.ratePost);

// Nhóm Follow
router.post('/follow', protect, interactionController.followUser);

// Check trạng thái (để frontend tô màu nút)
router.get('/state', protect, interactionController.getInteractionState);

module.exports = router;