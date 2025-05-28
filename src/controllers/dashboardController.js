const dashboardService = require('../services/dashboardService');

// Контроллер для получения отчета по дате
exports.getReportByDate = async (req, res, next) => {
  try {
    // Получаем параметры из запроса
    const { startDate, endDate, warehouse } = req.query;
    
    // Проверяем наличие обязательных параметров
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        message: 'Необходимо указать начальную (startDate) и конечную (endDate) даты в формате DD.MM.YYYY' 
      });
    }

    if (!warehouse) {
      return res.status(400).json({ 
        message: 'Необходимо указать код склада (warehouse)' 
      });
    }
    
    // Проверяем формат дат
    const dateRegex = /^\d{2}.\d{2}.\d{4}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return res.status(400).json({ 
        message: 'Некорректный формат даты. Используйте формат DD.MM.YYYY для обеих дат' 
      });
    }

    // Проверяем, что начальная дата не больше конечной
    const startDateObj = new Date(startDate.split('.').reverse().join('-'));
    const endDateObj = new Date(endDate.split('.').reverse().join('-'));
    
    if (startDateObj > endDateObj) {
      return res.status(400).json({ 
        message: 'Начальная дата не может быть больше конечной' 
      });
    }
    
    // Получаем данные отчета через сервис
    const reportData = await dashboardService.getReportByDate(startDate, endDate, warehouse);
    
    // Возвращаем успешный ответ с данными
    res.status(200).json(reportData);
  } catch (error) {
    // Передаем ошибку middleware обработки ошибок
    next(error);
  }
};

// Контроллер для получения списка складов
exports.getWarehousesList = async (req, res, next) => {
  try {
    // Получаем дату из параметров запроса (необязательно)
    const { date } = req.query;
    
    let warehousesData;
    
    if (date) {
      // Проверяем формат даты, если она передана
      const dateRegex = /^\d{2}.\d{2}.\d{4}$/;
      if (!dateRegex.test(date)) {
        return res.status(400).json({ message: 'Некорректный формат даты. Используйте формат DD.MM.YYYY' });
      }
      
      // Получаем данные складов через сервис с указанной датой
      warehousesData = await dashboardService.getWarehousesList(date);
    } else {
      // Получаем данные складов через сервис с датой по умолчанию
      warehousesData = await dashboardService.getWarehousesList();
    }
    
    // Возвращаем успешный ответ с данными
    res.status(200).json(warehousesData);
  } catch (error) {
    // Передаем ошибку middleware обработки ошибок
    next(error);
  }
};

/**
 * Controller for getting report with RSD grouping
 */
exports.getReportByDateWithRSD = async (req, res, next) => {
  try {
    const { startDate, endDate, warehouseId } = req.query;
    
    // Check required parameters
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        message: 'Start date (startDate) and end date (endDate) in DD.MM.YYYY format are required' 
      });
    }

    // Check warehouseId format
    if (warehouseId && isNaN(parseInt(warehouseId))) {
      return res.status(400).json({
        message: 'Warehouse ID must be a number'
      });
    }

    // Check date format
    const dateRegex = /^\d{2}.\d{2}.\d{4}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return res.status(400).json({ 
        message: 'Invalid date format. Use DD.MM.YYYY format for both dates' 
      });
    }

    // Check if start date is not greater than end date
    const startDateObj = new Date(startDate.split('.').reverse().join('-'));
    const endDateObj = new Date(endDate.split('.').reverse().join('-'));
    
    if (startDateObj > endDateObj) {
      return res.status(400).json({ 
        message: 'Start date cannot be greater than end date' 
      });
    }
    
    // Get report data through service
    const reportData = await dashboardService.getReportByDateWithRSD(
      startDate, 
      endDate, 
      warehouseId ? parseInt(warehouseId) : undefined
    );
    
    // Return successful response with data
    res.status(200).json(reportData);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for getting report without RSD grouping
 */
exports.getReportByDateWithoutRSD = async (req, res, next) => {
  try {
    const { startDate, endDate, warehouseId } = req.query;
    
    // Check required parameters
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        message: 'Start date (startDate) and end date (endDate) in DD.MM.YYYY format are required' 
      });
    }

    // Check warehouseId format
    if (warehouseId && isNaN(parseInt(warehouseId))) {
      return res.status(400).json({
        message: 'Warehouse ID must be a number'
      });
    }

    // Check date format
    const dateRegex = /^\d{2}.\d{2}.\d{4}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return res.status(400).json({ 
        message: 'Invalid date format. Use DD.MM.YYYY format for both dates' 
      });
    }

    // Check if start date is not greater than end date
    const startDateObj = new Date(startDate.split('.').reverse().join('-'));
    const endDateObj = new Date(endDate.split('.').reverse().join('-'));
    
    if (startDateObj > endDateObj) {
      return res.status(400).json({ 
        message: 'Start date cannot be greater than end date' 
      });
    }
    
    // Get report data through service
    const reportData = await dashboardService.getReportByDateWithoutRSD(
      startDate, 
      endDate, 
      warehouseId ? parseInt(warehouseId) : undefined
    );
    
    // Return successful response with data
    res.status(200).json(reportData);
  } catch (error) {
    next(error);
  }
}; 