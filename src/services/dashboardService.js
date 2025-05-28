const sql = require('mssql');
const dbConfig = require('../config/database');

/**
 * Получение отчета по диапазону дат
 * @param {string} startDate - Начальная дата в формате DD.MM.YYYY
 * @param {string} endDate - Конечная дата в формате DD.MM.YYYY
 * @param {string} warehouseCode - Код склада
 * @returns {Promise<Array>} - Данные отчета
 */
exports.getReportByDate = async (startDate, endDate, warehouseCode) => {
  try {
    // Подключаемся к базе данных
    const pool = await sql.connect(dbConfig);
    
    // Формируем SQL запрос с подстановкой даты
    const query = `
      SELECT * FROM OPENQUERY(
        OW,
        'SELECT 
          rsd_code as "rsd",
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
            ord.rsd_code,
            wh.trans_status,
            wh.transfer_num,
            wh.deliv_id_client,
            vp_ord.to_id,
            vp_ord.volume,
            vp_ord.transfer_num as vp_transfer_num,
            vp_ord.reestr_id as vp_reestr_id,
            ord.reqst_recpt_date,
            ord.status,
            s.std_cartons
          FROM elite.whse_t_h$ wh
          LEFT JOIN elite.v_reestr_ord_k1$ vp_ord ON vp_ord.transfer_num = wh.transfer_num
          LEFT JOIN elite.v_reestr_ord_k1$ ord ON ord.reestr_id = wh.deliv_id_client
          LEFT JOIN elite.ship$ s ON s.deliv_id = vp_ord.reestr_id
          WHERE wh.trans_type = 4
          AND wh.to_whse_code = ''${warehouseCode}''
          AND ord.reqst_recpt_date BETWEEN TO_DATE(''${startDate}'', ''DD.MM.YYYY'') AND TO_DATE(''${endDate}'', ''DD.MM.YYYY'')
        )
        GROUP BY rsd_code, reqst_recpt_date, status'
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

/**
 * Получение списка складов
 * @param {string} [date='01.01.2024'] - Дата начала в формате DD.MM.YYYY
 * @returns {Promise<Array>} - Список складов
 */
exports.getWarehousesList = async (date = '01.01.2024') => {
  try {
    // Подключаемся к базе данных
    const pool = await sql.connect(dbConfig);
    
    // Формируем SQL запрос
    const query = `
           SELECT *  FROM OPENQUERY(
        OW,
        'SELECT  NAME AS "warehouse_name", id AS "warehouse_code"  from  wms.warehouse where 
		whtype_id = 0 and logistic_junc_level = 1')
       `;
    
    // Выполняем запрос
    const result = await pool.request().query(query);
    
    // Возвращаем результаты
    return result.recordset;
  } catch (error) {
    console.error('Ошибка в сервисе getWarehousesList:', error);
    throw error;
  }
};

/**
 * Получение отчета по диапазону дат с группировкой по РСД
 * @param {string} startDate - Начальная дата в формате DD.MM.YYYY
 * @param {string} endDate - Конечная дата в формате DD.MM.YYYY
 * @param {number} [warehouseId=300] - ID склада
 * @returns {Promise<Array>} - Данные отчета
 */
exports.getReportByDateWithRSD = async (startDate, endDate, warehouseId = 300) => {
  try {
    const pool = await sql.connect(dbConfig);
    
    const query = `
      SELECT * FROM OPENQUERY(
        OW,'WITH warehouse_hierarchy AS (
    SELECT w.id, w.e_code
    FROM warehouse w
    WHERE w.whtype_id = 3
    CONNECT BY PRIOR w.id = w.parent_id
  START WITH w.id = ${warehouseId}
)
SELECT
    w.id,
    w.e_code,
    ord.rsd_code,
    ord.reqst_recpt_date треб_дата_ЗНД,
    ord.status статус_ЗНД,
    count(case when wh.trans_status = 2 then 1 end) as количество_ВП_комплектация,
    count(case when wh.trans_status = 4 and vp_ord.to_id is null then 1 end) as количество_ВП_НЕ_отгружено,
    sum(case when wh.trans_status = 4 and vp_ord.to_id is null then s.std_cartons else 0 end) as количество_мест_скомлпектовано_НЕ_отгружено,
    sum(case when wh.trans_status = 4 and vp_ord.to_id is null then vp_ord.volume else 0 end)/1000000 as объем_ЗнД_скомлпектовано_НЕ_отгружено,
    count(case when vp_ord.to_id is not null and wh.trans_status <> 5 then 1 end) as количество_ВП_в_пути,
    sum(case when vp_ord.to_id is not null and wh.trans_status <> 5 then s.std_cartons else 0 end) as количество_мест_в_пути,
    sum(case when vp_ord.to_id is not null and wh.trans_status <> 5 then vp_ord.volume else 0 end)/1000000 as объем_ВП_в_пути,
    sum(case when ord.status = 0 then s.std_cartons else 0 end) as количество_мест_ЗНД_0,
    sum(case when ord.status = 0 then vp_ord.volume else 0 end)/1000000 as объем_ЗНД_0,
    count(case when wh.trans_status = 5 then 1 end) as количество_ВП_статус5,
    sum(case when wh.trans_status = 5 then s.std_cartons else 0 end) as количество_мест_статус5,
    sum(case when wh.trans_status = 5 then vp_ord.volume else 0 end)/1000000 as объем_ВП_статус5
FROM elite.whse_t_h$ wh
JOIN warehouse_hierarchy wh_hier ON wh.to_whse_code = wh_hier.e_code
LEFT JOIN wms.d_transfer tr ON tr.e_id = wh.transfer_num
LEFT JOIN elite.v_reestr_ord_k1$ vp_ord ON vp_ord.transfer_num = wh.transfer_num
LEFT JOIN lcb.cargo c ON c.elite_id = vp_ord.reestr_id AND c.elite_task_type_id = 10
LEFT JOIN elite.v_reestr_ord_k1$ ord ON ord.reestr_id = wh.deliv_id_client
LEFT JOIN elite.v_ord$ o ON o.ord_id = ord.ord_id
LEFT JOIN elite.ship$ s ON s.deliv_id = vp_ord.reestr_id
LEFT JOIN wms.warehouse w ON w.e_code = wh.to_whse_code
WHERE
    wh.trans_type = 4
AND ord.reqst_recpt_date BETWEEN TO_DATE(''${startDate}'', ''DD.MM.YYYY'') AND TO_DATE(''${endDate}'', ''DD.MM.YYYY'')
GROUP BY
    ord.rsd_code,
    ord.reqst_recpt_date,
    ord.status,
    w.parent_id,
    w.id,
    w.e_code'
      )`;
    
    const result = await pool.request().query(query);
    return result.recordset;
  } catch (error) {
    console.error('Ошибка в сервисе getReportByDateWithRSD:', error);
    throw error;
  }
};

/**
 * Получение отчета по диапазону дат без группировки по РСД
 * @param {string} startDate - Начальная дата в формате DD.MM.YYYY
 * @param {string} endDate - Конечная дата в формате DD.MM.YYYY
 * @param {number} [warehouseId=300] - ID склада
 * @returns {Promise<Array>} - Данные отчета
 */
exports.getReportByDateWithoutRSD = async (startDate, endDate, warehouseId = 300) => {
  try {
    const pool = await sql.connect(dbConfig);
    
    const query = `
      SELECT * FROM OPENQUERY(
        OW,'WITH warehouse_hierarchy AS (
    SELECT w.id, w.e_code
    FROM warehouse w
    WHERE w.whtype_id = 3
    CONNECT BY PRIOR w.id = w.parent_id
  START WITH w.id = ${warehouseId}
)
SELECT
    w.id,
    w.e_code,
    ord.reqst_recpt_date треб_дата_ЗНД,
    ord.status статус_ЗНД,
    count(case when wh.trans_status = 2 then 1 end) as количество_ВП_комплектация,
    count(case when wh.trans_status = 4 and vp_ord.to_id is null then 1 end) as количество_ВП_НЕ_отгружено,
    sum(case when wh.trans_status = 4 and vp_ord.to_id is null then s.std_cartons else 0 end) as количество_мест_скомлпектовано_НЕ_отгружено,
    sum(case when wh.trans_status = 4 and vp_ord.to_id is null then vp_ord.volume else 0 end)/1000000 as объем_ЗнД_скомлпектовано_НЕ_отгружено,
    count(case when vp_ord.to_id is not null and wh.trans_status <> 5 then 1 end) as количество_ВП_в_пути,
    sum(case when vp_ord.to_id is not null and wh.trans_status <> 5 then s.std_cartons else 0 end) as количество_мест_в_пути,
    sum(case when vp_ord.to_id is not null and wh.trans_status <> 5 then vp_ord.volume else 0 end)/1000000 as объем_ВП_в_пути,
    sum(case when ord.status = 0 then s.std_cartons else 0 end) as количество_мест_ЗНД_0,
    sum(case when ord.status = 0 then vp_ord.volume else 0 end)/1000000 as объем_ЗНД_0,
    count(case when wh.trans_status = 5 then 1 end) as количество_ВП_статус5,
    sum(case when wh.trans_status = 5 then s.std_cartons else 0 end) as количество_мест_статус5,
    sum(case when wh.trans_status = 5 then vp_ord.volume else 0 end)/1000000 as объем_ВП_статус5
FROM elite.whse_t_h$ wh
JOIN warehouse_hierarchy wh_hier ON wh.to_whse_code = wh_hier.e_code
LEFT JOIN wms.d_transfer tr ON tr.e_id = wh.transfer_num
LEFT JOIN elite.v_reestr_ord_k1$ vp_ord ON vp_ord.transfer_num = wh.transfer_num
LEFT JOIN lcb.cargo c ON c.elite_id = vp_ord.reestr_id AND c.elite_task_type_id = 10
LEFT JOIN elite.v_reestr_ord_k1$ ord ON ord.reestr_id = wh.deliv_id_client
LEFT JOIN elite.v_ord$ o ON o.ord_id = ord.ord_id
LEFT JOIN elite.ship$ s ON s.deliv_id = vp_ord.reestr_id
LEFT JOIN wms.warehouse w ON w.e_code = wh.to_whse_code
WHERE
    wh.trans_type = 4
AND ord.reqst_recpt_date BETWEEN TO_DATE(''${startDate}'', ''DD.MM.YYYY'') AND TO_DATE(''${endDate}'', ''DD.MM.YYYY'')
GROUP BY
    ord.reqst_recpt_date,
    ord.status,
    w.parent_id,
    w.id,
    w.e_code'
      )`;
    
    const result = await pool.request().query(query);
    return result.recordset;
  } catch (error) {
    console.error('Ошибка в сервисе getReportByDateWithoutRSD:', error);
    throw error;
  }
}; 