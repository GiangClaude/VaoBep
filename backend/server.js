require('dotenv').config(); 
require('./services/vectorQueue.service');

const express = require('express');
const cors = require('cors');
const db = require('./config/db'); // Import module database
const path = require('path');
const app = express();
const port = process.env.PORT || 5000; // Cổng cho backend
const AppError = require('./utils/AppError');
const errorHandler = require('./middlewares/error.middleware');

// Sử dụng CORS để cho phép frontend truy cập
app.use(cors());
// Sử dụng express.json() để parse body của request dưới dạng JSON
// VỊ TRÍ: backend/server.js (Chỗ cấu hình middleware)

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
//Cho phép xem file public/user
app.use('/uploads', express.static(path.join(__dirname, 'public/user')));
app.use('/public', express.static(path.join(__dirname, 'public')));

const authRoutes = require('./routes/auth.routes');
const recipeRoutes = require('./routes/recipe.routes');
const articleRoutes = require('./routes/article.routes');
const userRoutes = require('./routes/user.routes');
const ingredientRoutes = require('./routes/ingredients.routes');
const menuRoutes = require('./routes/menu.routes');
const unitRoutes = require('./routes/unit.routes');
const adminRoutes = require('./routes/admin.routes');
const tagRoutes = require('./routes/tag.routes');
const interactionRoutes = require('./routes/interaction.routes');
const dictionaryDishRoutes = require('./routes/dictionaryDish.routes');
// const chatbotRoutes = require('./routes/chatbot.routes');
const leaderboardRoutes = require('./routes/leaderboard.routes');
const rewardRoutes = require('./routes/reward.routes');
const inventoryRoutes = require('./routes/inventory.routes');

const AiRoutes = require('./routes/ai.routes');
// const recipeAiRoutes = require('./routes/recipeAi.routes');
const extensionRoutes = require('./routes/extension.routes');
// Kiểm tra kết nối database khi khởi động server
db.testDbConnection();

// Route Xác thực
app.use('/api/auth', authRoutes);
app.use('/api/extension', extensionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/user', userRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/interaction', interactionRoutes);
app.use('/api/dictionary-dishes', dictionaryDishRoutes);
// Chatbot route
app.use('/api/ai', AiRoutes);
// app.use('/api/chat', chatbotRoutes);
// app.use('/api/recipe-ai', recipeAiRoutes);


app.get('/api/users', async (req, res) => {
    try {
        const users = await db.getAllUsers();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/users/:id', async (req, res) => {
    try {
        const user = await db.getUserById(req.params.id);
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.use((req, res, next) => {
    next(new AppError(`Không tìm thấy đường dẫn ${req.originalUrl} trên máy chủ`, 404));
});

app.use(errorHandler);

// Khởi động server
app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
});