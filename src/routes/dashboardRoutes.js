const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Маршрут для получения данных отчета по дате
router.get('/report', dashboardController.getReportByDate);

// Маршрут для получения списка складов
router.get('/warehouses', dashboardController.getWarehousesList);

// Маршрут для получения отчета с группировкой по РСД
router.get('/report/with-rsd', dashboardController.getReportByDateWithRSD);

// Маршрут для получения отчета без группировки по РСД
router.get('/report/without-rsd', dashboardController.getReportByDateWithoutRSD);

module.exports = router; 