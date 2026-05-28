const TagService = require('../services/tag.service');
const asyncHandler = require('../utils/asyncHandler');

const getAllTags = asyncHandler(async (req, res, next) => {
    const tags = await TagService.getAllTags();

    res.status(200).json({
        success: true,
        data: tags
    });
});

module.exports = {
    getAllTags
};