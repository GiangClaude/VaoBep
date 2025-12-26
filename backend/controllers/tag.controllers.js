const TagModel = require('../models/tag.model');

const getAllTags = async (req, res) => {
    try {
        const tags = await TagModel.getAll();
        return res.status(200).json({
            success: true,
            data: tags
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy danh sách tags: " + error.message
        });
    }
};

module.exports = {
    getAllTags
};