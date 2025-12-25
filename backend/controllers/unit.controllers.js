const db = require('../config/db'); 
const UnitModel = require('../models/unit.model');

// 2. Định nghĩa pool bằng cách lấy từ đối tượng db
const pool = db.pool;

const getAllUnits = async (req, res) => {
    try {
        // Gọi hàm Model bạn vừa thêm ở bước 1
        const result = await UnitModel.getAllUnits(); 
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi khi lấy danh sách đơn vị' });
    }
}

module.exports = {
    getAllUnits
};