const { v4: uuidv4 } = require('uuid');
const DictionaryDishModel = require('../../models/dictionaryDish.model');
const path = require('path');
const fs = require('fs');
const { addVectorSyncJob } = require('../../services/vectorQueue.service');
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../utils/AppError');

const getDictionaryDishes = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const sortKey = req.query.sortKey || 'created_at';
    const sortOrder = req.query.sortOrder || 'DESC';
    const offset = (page - 1) * limit;

    const dishes = await DictionaryDishModel.getAll(limit, offset, search, sortKey, sortOrder);
    const total = await DictionaryDishModel.countAll(search);

    res.status(200).json({ data: dishes, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

const createDictionaryDish = asyncHandler(async (req, res) => {
    const adminId = req.user.id;
    const dishId = uuidv4();
    const { original_name, english_name, description, history, country, latitude, longitude, eateries } = req.body;

    if (!original_name) throw new AppError('Tên món ăn không được để trống', 400);

        let image_url = null;
        if (req.file) {
            image_url = req.file.filename;
            const tempPath = req.file.path;
            const targetDir = path.join(__dirname, '../../public/dictionarydish', dishId);
            const targetPath = path.join(targetDir, image_url);
            try {
                if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
                fs.renameSync(tempPath, targetPath);
            } catch (moveError) {
                console.error('Lỗi di chuyển ảnh từ điển:', moveError);
            }
        }

        await DictionaryDishModel.createDish({
            dish_id: dishId,
            admin_id: adminId,
            original_name, english_name, description, history, country, image_url,
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null
        });

        if (eateries) {
            try {
                const parsedEateries = JSON.parse(eateries);
                if (parsedEateries.length > 0) {
                    const eateriesData = parsedEateries.map(e => ({ eatery_id: uuidv4(), name: e.name, address: e.address }));
                    await DictionaryDishModel.addEateries(dishId, eateriesData);
                }
            } catch (err) {
                console.error('Lỗi parse eateries:', err);
            }
        }

        addVectorSyncJob(dishId, 'dish', 'upsert');

    res.status(201).json({ message: 'Tạo món ăn thành công', dishId });
});

const updateDictionaryDish = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { original_name, english_name, description, history, country, latitude, longitude, eateries } = req.body;

    let updateData = {
        original_name, english_name, description, history, country,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null
    };

        if (req.file) updateData.image_url = req.file.filename;
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        await DictionaryDishModel.updateDish(id, updateData);

        if (eateries) {
            try {
                const parsedEateries = JSON.parse(eateries);
                await DictionaryDishModel.deleteEateriesByDishId(id);
                if (parsedEateries.length > 0) {
                    const eateriesData = parsedEateries.map(e => ({ eatery_id: uuidv4(), name: e.name, address: e.address }));
                    await DictionaryDishModel.addEateries(id, eateriesData);
                }
            } catch (err) {
                console.error('Lỗi parse eateries update:', err);
            }
        }

    addVectorSyncJob(id, 'dish', 'upsert');

    res.status(200).json({ message: 'Cập nhật món ăn thành công' });
});

const deleteDictionaryDish = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await DictionaryDishModel.deleteDish(id);
    const targetDir = path.join(__dirname, '../../public/dictionarydish', id);
    if (fs.existsSync(targetDir)) fs.rmSync(targetDir, { recursive: true, force: true });
    addVectorSyncJob(id, 'dish', 'delete');
    res.status(200).json({ message: 'Xóa món ăn thành công' });
});

module.exports = { getDictionaryDishes, createDictionaryDish, updateDictionaryDish, deleteDictionaryDish };
