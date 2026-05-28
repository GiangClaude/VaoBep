const UnitService = require('../services/unit.service');
const asyncHandler = require('../utils/asyncHandler');

const getAllUnits = asyncHandler(async (req, res) => {
    const result = await UnitService.getAllUnits();
    
    // Giữ nguyên định dạng trả về cũ
    res.json(result);
});

module.exports = {
    getAllUnits
};