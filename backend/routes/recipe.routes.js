const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipe.controllers');
const {protect} = require('../controllers/auth.controllers');

router.post('/create', protect, recipeController.createRecipe);

router.get('/', recipeController.getRecipes);
router.get('/recently', recipeController.getRecentlyRecipes);
router.get('/feature', recipeController.getFeatureRecipes);
router.get('/:recipeId', recipeController.getRecipeById);


router.put('/update/:recipeId', protect, recipeController.updateRecipe);

router.delete('/delete/:recipeId',protect, recipeController.deleteRecipe);

module.exports = router;