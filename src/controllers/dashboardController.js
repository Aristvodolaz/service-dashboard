const dashboardService = require('../services/dashboardService');

// Контроллер для получения отчета по дате
exports.getReportByDate = async (req, res, next) => {
  try {
    // Получаем дату и код склада из параметров запроса
    const { date, warehouse } = req.query;
    
    // Проверяем наличие даты
    if (!date) {
      return res.status(400).json({ message: 'Необходимо указать дату в формате DD.MM.YYYY' });
    }
    
    // Проверяем формат даты
    const dateRegex = /^\d{2}.\d{2}.\d{4}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ message: 'Некорректный формат даты. Используйте формат DD.MM.YYYY' });
    }
    
    // Получаем данные отчета через сервис с указанием даты и кода склада
    const reportData = await dashboardService.getReportByDate(date, warehouse);
    
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