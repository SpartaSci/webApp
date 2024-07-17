'use strict';

/* Data Access Object (DAO) module for accessing configurations data */

const db = require('./db');
const {response} = require("express");

const convertConfigurationFromDbRecord = (record, accessories) => {

    const configuration = {
        user_id: record.user_id,
        model_id: record.model_id,
        accessories: accessories[0] === null ? [] : accessories
    };
    return configuration;
}

exports.getConfiguration = (userId) => {
    return new Promise(async (resolve, reject) => {
        const sql = 'SELECT c.user_id, c.model_id, a.accessory_id FROM configurations c LEFT JOIN accPerConf a ON a.user_id==c.user_id WHERE c.user_id=?';
        db.all(sql, [userId], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                if (rows.length === 0) {
                    resolve({});
                } else {
                    const accessories = [];
                    for (let i = 0; i < rows.length; i++) { 
                        accessories.push(rows[i].accessory_id);
                    }
                    try {
                        const configuration = convertConfigurationFromDbRecord(rows[0], accessories);
                        resolve(configuration);    
                    } catch (err) {
                        reject(err);
                    }
                }
            }
        });
    });
};





const addConfiguration = (user_id, model_id) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO configurations(user_id, model_id) VALUES(?,?)';
        db.run(sql, [user_id,model_id], function (err) {
            if(err){
                reject(err);
            } else {
                resolve();
            }
        });
    });
}
const addAccessory = (user_id, accessory_id) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO accPerConf(user_id, accessory_id) VALUES(?,?)';
    
        db.run(sql, [user_id, accessory_id], function (err) {
            if(err){
                reject(err);
            } else {
                resolve()
            }
        })
        
    });
}

exports.createConfiguration = async (configuration) => {

    await addConfiguration(configuration.user_id, configuration.model_id).catch((err) => {throw err});

    const accessories = configuration.accessories;
    for( let accessory_id of accessories){
        await addAccessory(configuration.user_id, accessory_id).catch((err) => {throw err});
    }
        
}




const deleteFromConf = (user_id) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM accPerConf WHERE user_id=?';
        db.run(sql, [user_id], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(user_id);
            }
        });

    });
} 

const deleteFromAccPerConf = (user_id) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM configurations WHERE user_id=?';
        db.run(sql, [user_id], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(user_id);
            }
        });
    });
} 

// per cancellare la configurazione serve eliminare gli accessori nella tabella accPerConf e poi la configurazione nella tabella configurations
exports.deleteConfiguration = async(user_id) => {
    
    await deleteFromConf(user_id).catch(err => {throw err});

    await deleteFromAccPerConf(user_id).catch(err => {throw err});


}



