# Сервис дашборда

Сервис для получения данных отчета на основе входной даты.

## Установка и запуск

1. Установите зависимости:
```
npm install
```

2. Создайте файл `.env` в корне проекта со следующими переменными:
```
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_SERVER=your_db_server
DB_NAME=your_db_name
PORT=3001
```

3. Запустите сервис:
```
npm start
```

Для разработки используйте:
```
npm run dev
```

## API Endpoints

### Получение отчета по дате

```
GET /api/dashboard/report?date=DD.MM.YYYY&warehouse=CODE
```

#### Параметры запроса:
- `date` - дата в формате DD.MM.YYYY (обязательный)
- `warehouse` - код склада (необязательный, по умолчанию '0K3')

#### Пример запроса:
```
GET /api/dashboard/report?date=16.05.2025&warehouse=0K3
```

#### Пример успешного ответа:
```json
[
  {
    "required_date": "2025-05-16T00:00:00.000Z",
    "status": "Готов к отгрузке",
    "picking_count": 10,
    "not_shipped_count": 5,
    "picked_not_shipped_places": 25,
    "picked_not_shipped_volume": 2.5,
    "in_transit_count": 3,
    "in_transit_places": 15,
    "in_transit_volume": 1.5,
    "status5_count": 2,
    "status5_places": 10,
    "status5_volume": 1.0
  }
]
```

### Получение списка складов

```
GET /api/dashboard/warehouses
```

#### Параметры запроса:
- `date` - дата в формате DD.MM.YYYY (необязательно, по умолчанию 01.01.2024)

#### Пример запроса:
```
GET /api/dashboard/warehouses
```

#### Пример успешного ответа:
```json
[
  {
    "warehouse_name": "Склад 1",
    "warehouse_code": "SK1"
  },
  {
    "warehouse_name": "Склад 2",
    "warehouse_code": "SK2"
  }
]
``` 