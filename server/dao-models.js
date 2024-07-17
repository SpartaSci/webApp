'use strict';

/* Data Access Object (DAO) module for accessing models data */

const db = require('./db');

const convertModelsFromDbRecord = (record) => {
    return {
        model_id: record.model_id,
        power: record.power,
        cost: record.cost,
        maxAcc: record.maxAcc,
    };
}



exports.getModels = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM models';
        db.all(sql, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }

            const models = rows.map((e) => { return convertModelsFromDbRecord(e);});

            resolve(models);
        });
    });
};


exports.getModelById = (model_id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM models WHERE model_id = ?';
        db.get(sql, [model_id], (err, row) => {
            if (err) {
                reject(err);
                return;
            }

            if (row) {
                resolve(convertModelsFromDbRecord(row));
            } else {
                resolve({});
            }
        });
    });
}







