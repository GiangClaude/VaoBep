const express = require('express');
const userController = require('../controllers/user.controllers');
const router = express.Router();
const {protect} = require('../controllers/auth.controllers');

router.get('/me', protect, userController.getMyProfile);

router.put('/change-password', protect, userController.updatePassword)

router.get('/search', userController.searchUsers);

module.exports = router;