'use strict';

/* Data Access Object (DAO) module for accessing accessories data */

const db = require('./db');

const convertAccessoriesFromDbRecord = async (record) => {

    const neededAccessories = await this.getNeededAccessories(record.accessory_id);
    const incompatibleAccessories = await this.getIncompatibleAccessories(record.accessory_id);

    return {
        accessory_id: record.accessory_id,
        name: record.name,
        price: record.price,
        quantity: record.quantity,
        needed_id: neededAccessories.needed_id ? neededAccessories.needed_id : null,
        incompatible_id: incompatibleAccessories.incompatible_id ? incompatibleAccessories.incompatible_id : null
    };
}



exports.getListAccessories = () => {
    return new Promise( async (resolve, reject) => {
        const sql = 'SELECT accessory_id, name, price, quantity FROM accessories ORDER BY accessory_id';
        db.all(sql, async (err, rows) => {
            if (err) {
                reject(err);
                return;
            }

            const accessories = await Promise.all(rows.map( (e) => { return convertAccessoriesFromDbRecord(e); }));
            resolve(accessories);
            
        });

        
    });
};




const getAccessorybyId = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT accessory_id, name, price, quantity FROM accessories WHERE accessory_id = ?';
        db.get(sql, [id], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            try {
                if (row) {
                    const accessory = convertAccessoriesFromDbRecord(row);
                    resolve(accessory);
                } else {
                    resolve({});
                }
            } catch (err) {
                reject(err);
            }

            
        });
    });
};


exports.updateAccessoryQuantity = (id, quantity) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE accessories SET quantity = ? WHERE accessory_id = ? ';
        db.run(sql, [quantity, id], async function (err) {
            if (err) {
                reject({"error": err});
            }
            try{
                const updatedAccessory = getAccessorybyId(id);
                resolve(updatedAccessory);
            } catch (err){
                reject(err);
            }

        });
    });
}



exports.getNeededAccessories = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT needed_id FROM accNeedAcc WHERE current_id = ?';
        db.get(sql, [id], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            if (row) {
                resolve({needed_id: row.needed_id});
            } else {
                resolve({});
            }
        });
    });
};

exports.getIncompatibleAccessories = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM incompatibleAccessories WHERE id_1=? OR id_2=?';
        db.get(sql, [id,id], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            if (row) {
                resolve({incompatible_id: (id===row.id_1 ? row.id_2 : row.id_1)});
            } else {
                resolve({});
            }
        });
    });
}