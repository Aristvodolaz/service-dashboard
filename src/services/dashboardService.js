const sql = require('mssql');
const dbConfig = require('../config/database');

/**
 * Получение отчета по дате
 * @param {string} date - Дата в формате DD.MM.YYYY
 * @returns {Promise<Array>} - Данные отчета
 */
exports.getReportByDate = async (date) => {
  try {
    // Подключаемся к базе данных
    const pool = await sql.connect(dbConfig);
    
    // Формируем SQL запрос с подстановкой даты
    const query = `
      SELECT * FROM OPENQUERY(
        OW,
        'SELECT 
          reqst_recpt_date AS "required_date",
          status AS "status",
          COUNT(CASE WHEN trans_status = 2 THEN 1 END) AS "picking_count",
          COUNT(CASE WHEN trans_status = 4 AND to_id IS NULL THEN 1 END) AS "not_shipped_count",
          SUM(CASE WHEN trans_status = 4 AND to_id IS NULL THEN std_cartons ELSE 0 END) AS "picked_not_shipped_places",
          SUM(CASE WHEN trans_status = 4 AND to_id IS NULL THEN volume ELSE 0 END) / 1000000 AS "picked_not_shipped_volume",
          COUNT(CASE WHEN to_id IS NOT NULL AND trans_status <> 5 THEN 1 END) AS "in_transit_count",
          SUM(CASE WHEN to_id IS NOT NULL AND trans_status <> 5 THEN std_cartons ELSE 0 END) AS "in_transit_places",
          SUM(CASE WHEN to_id IS NOT NULL AND trans_status <> 5 THEN volume ELSE 0 END) / 1000000 AS "in_transit_volume",
          COUNT(CASE WHEN trans_status = 5 THEN 1 END) AS "status5_count",
          SUM(CASE WHEN trans_status = 5 THEN std_cartons ELSE 0 END) AS "status5_places",
          SUM(CASE WHEN trans_status = 5 THEN volume ELSE 0 END) / 1000000 AS "status5_volume"
        FROM (
          SELECT
            wh.trans_status,
            wh.transfer_num,
            wh.deliv_id_client,
            vp_ord.to_id,
            vp_ord.volume,
            vp_ord.transfer_num as vp_transfer_num,
            vp_ord.reestr_id as vp_reestr_id,
            ord.reqst_recpt_date,
            ord.status,
            ord.every_day_num_date,
            s.std_cartons
          FROM elite.whse_t_h$ wh
          LEFT JOIN elite.v_reestr_ord_k1$ vp_ord ON vp_ord.transfer_num = wh.transfer_num
          LEFT JOIN elite.v_reestr_ord_k1$ ord ON ord.reestr_id = wh.deliv_id_client
          LEFT JOIN elite.ship$ s ON s.deliv_id = vp_ord.reestr_id
          WHERE wh.trans_type = 4
          AND wh.to_whse_code = ''0K3''
          AND ord.every_day_num_date > TO_DATE(''${date}'', ''DD.MM.YYYY'')
        )
        GROUP BY reqst_recpt_date, status'
      )`;
    
    // Выполняем запрос
    const result = await pool.request().query(query);
    
    // Возвращаем результаты
    return result.recordset;
  } catch (error) {
    console.error('Ошибка в сервисе getReportByDate:', error);
    throw error;
  }
}; 