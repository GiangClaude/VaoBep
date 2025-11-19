require('dotenv').config(); 

const express = require('express');
const cors = require('cors');
const db = require('./config/db'); // Import module database

const app = express();
const port = process.env.PORT || 5000; // Cổng cho backend


// Sử dụng CORS để cho phép frontend truy cập
app.use(cors());
// Sử dụng express.json() để parse body của request dưới dạng JSON
app.use(express.json());

const authRoutes = require('./routes/auth.routes');
const recipeRoutes = require('./routes/recipe.routes');
const userRoutes = require('./routes/user.routes');

// Kiểm tra kết nối database khi khởi động server
db.testDbConnection();

// Route Xác thực
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/user', userRoutes);
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