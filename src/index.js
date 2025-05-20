const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Загрузка переменных окружения
dotenv.config();

// Инициализация Express
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Импорт маршрутов
const dashboardRoutes = require('./routes/dashboardRoutes');

// Применение маршрутов
app.use('/api/dashboard', dashboardRoutes);

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Произошла ошибка сервера', error: err.message });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
}); 