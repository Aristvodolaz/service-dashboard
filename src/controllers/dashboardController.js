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
 * Контроллер для получения отчета по дате с группировкой по РСД
 */
exports.getReportByDateWithRSD = async (req, res, next) => {
  try {
    const { startDate, endDate, warehouseId } = req.query;
    
    // Проверяем наличие обязательных параметров
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        message: 'Необходимо указать начальную (startDate) и конечную (endDate) даты в формате DD.MM.YYYY' 
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
    const reportData = await dashboardService.getReportByDateWithRSD(
      startDate, 
      endDate, 
      warehouseId ? parseInt(warehouseId) : undefined
    );
    
    // Возвращаем успешный ответ с данными
    res.status(200).json(reportData);
  } catch (error) {
    next(error);
  }
};

/**
 * Контроллер для получения отчета по дате без группировки по РСД
 */
exports.getReportByDateWithoutRSD = async (req, res, next) => {
  try {
    const { startDate, endDate, warehouseId } = req.query;
    
    // Проверяем наличие обязательных параметров
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        message: 'Необходимо указать начальную (startDate) и конечную (endDate) даты в формате DD.MM.YYYY' 
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
    const reportData = await dashboardService.getReportByDateWithoutRSD(
      startDate, 
      endDate, 
      warehouseId ? parseInt(warehouseId) : undefined
    );
    
    // Возвращаем успешный ответ с данными
    res.status(200).json(reportData);
  } catch (error) {
    next(error);
  }
}; 