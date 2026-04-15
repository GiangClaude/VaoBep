const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbot.controllers');
const rateLimit = require('../middlewares/rateLimit.middleware');
const safety = require('../middlewares/safety.middleware');

// Main chat endpoint
router.post('/', rateLimit.perUserLimit, safety.loadRules, chatbotController.handleChat);

module.exports = router;
