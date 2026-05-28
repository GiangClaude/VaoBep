const UserModel = require('../../models/user.model');
const RecipeModel = require('../../models/recipe.model');
const ArticleModel = require('../../models/article.model');
const DictionaryDishModel = require('../../models/dictionaryDish.model');
const IngredientModel = require('../../models/ingredient.model');
const asyncHandler = require('../../utils/asyncHandler');

const getDashboardStats = asyncHandler(async (req, res) => {
    const totalUsers = await UserModel.countUsers('');
    const totalRecipes = await RecipeModel.countAllRecipes('');
    const totalArticles = await ArticleModel.countAllArticles('');
    const totalDishes = await DictionaryDishModel.countAllDishes('');
    const totalIngredients = await IngredientModel.countAllIngredients('');

    const avgRecipePerUser = totalUsers > 0 ? (totalRecipes / totalUsers).toFixed(2) : 0;

    const userGrowth = await UserModel.getUserGrowthStats(30);
    const recipeGrowth = await RecipeModel.getRecipeGrowthStats(30);
    const recipeDistribution = await RecipeModel.getRecipeStatusDistribution();
    const userRoleDistribution = await UserModel.getUserRoleDistribution();

    res.status(200).json({
        summary: { users: totalUsers, recipes: totalRecipes, articles: totalArticles, ingredients: totalIngredients, dishes: totalDishes, avgRecipePerUser: parseFloat(avgRecipePerUser) },
        charts: { userGrowth, recipeGrowth, recipeDistribution, userRoleDistribution },
        message: 'Get stats successfully'
    });
});

module.exports = { getDashboardStats };
