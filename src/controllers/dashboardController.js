const dashboardService = require('../services/dashboardService');

// Контроллер для получения отчета по дате
exports.getReportByDate = async (req, res, next) => {
  try {
    // Получаем дату из параметров запроса
    const { date } = req.query;
    
    // Проверяем наличие даты
    if (!date) {
      return res.status(400).json({ message: 'Необходимо указать дату в формате DD.MM.YYYY' });
    }
    
    // Проверяем формат даты
    const dateRegex = /^\d{2}.\d{2}.\d{4}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ message: 'Некорректный формат даты. Используйте формат DD.MM.YYYY' });
    }
    
    // Получаем данные отчета через сервис
    const reportData = await dashboardService.getReportByDate(date);
    
    // Возвращаем успешный ответ с данными
    res.status(200).json(reportData);
  } catch (error) {
    // Передаем ошибку middleware обработки ошибок
    next(error);
  }
}; 