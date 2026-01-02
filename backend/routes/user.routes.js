const express = require('express');
const userController = require('../controllers/user.controllers');
const router = express.Router();
const upload = require('../config/multer.config');
const {protect} = require('../controllers/auth.controllers');

router.get('/me', protect, userController.getMyProfile);
router.get('/search', userController.searchUsers);


router.put('/me', protect, upload.single('avatar'), userController.updateUserProfile);
router.put('/change-password', protect, userController.updatePassword)


module.exports = router;