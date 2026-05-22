// VỊ TRÍ TẠO FILE MỚI: backend/routes/recipeAi.routes.js

const express = require('express');
const router = express.Router();
const recipeAiController = require('../controllers/recipeAi.controllers');
const rateLimit = require('../middlewares/rateLimit.middleware');

// Route 1: Tóm tắt công thức (Có Rate Limit chống spam)
router.post('/analyze', rateLimit.perUserLimit, recipeAiController.analyzeRecipe);

// Route 2: Chat QA về công thức (Có Rate Limit chống spam)
router.post('/chat', rateLimit.perUserLimit, recipeAiController.chatAboutRecipe);

module.exports = router;