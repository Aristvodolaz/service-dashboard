const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Route for getting report by date
router.get('/report', dashboardController.getReportByDate);

// Route for getting warehouses list
router.get('/warehouses', dashboardController.getWarehousesList);

// Route for getting report with RSD grouping
router.get('/report/with-rsd', dashboardController.getReportByDateWithRSD);

// Route for getting report without RSD grouping
router.get('/report/without-rsd', dashboardController.getReportByDateWithoutRSD);

module.exports = router; 