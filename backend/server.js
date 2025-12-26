require('dotenv').config(); 

const express = require('express');
const cors = require('cors');
const db = require('./config/db'); // Import module database
const path = require('path');
const app = express();
const port = process.env.PORT || 5000; // Cổng cho backend


// Sử dụng CORS để cho phép frontend truy cập
app.use(cors());
// Sử dụng express.json() để parse body của request dưới dạng JSON
app.use(express.json());
//Cho phép xem file public/user
app.use('/uploads', express.static(path.join(__dirname, 'public/user')));
app.use('/public', express.static(path.join(__dirname, 'public')));

const authRoutes = require('./routes/auth.routes');
const recipeRoutes = require('./routes/recipe.routes');
const userRoutes = require('./routes/user.routes');
const ingredientRoutes = require('./routes/ingredients.routes');
const unitRoutes = require('./routes/unit.routes');

const tagRoutes = require('./routes/tag.routes');
const interactionRoutes = require('./routes/interaction.routes');

// Kiểm tra kết nối database khi khởi động server
db.testDbConnection();

// Route Xác thực
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/user', userRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/units', unitRoutes);


app.use('/api/tags', tagRoutes);
app.use('/api/interaction', interactionRoutes);

app.use((req, res, next) => {
    res.status(404).json({ error: 'Route not found' });
})

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

app.use ((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Khởi động server
app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
});