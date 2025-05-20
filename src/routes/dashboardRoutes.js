const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Маршрут для получения данных отчета по дате
router.get('/report', dashboardController.getReportByDate);

// Маршрут для получения списка складов
router.get('/warehouses', dashboardController.getWarehousesList);

module.exports = router; 