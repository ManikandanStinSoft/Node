const db = require('../config/dbConfig');

const createAdmin = (admin) => {
    return db.query(
        'INSERT INTO ADMIN SET ?',
        [admin]
    );
};

const getAllAdmins = () => {
    return db.query('SELECT * FROM ADMIN');
};

const updateAdmin = (id, admin) => {
    return db.query(
        'UPDATE ADMIN SET ? WHERE id = ?',
        [admin, id]
    );
};

const deleteAdmin = (id) => {
    return db.query('DELETE FROM ADMIN WHERE id = ?', [id]);
};

const getAdminById = (id) => {
    return db.query('SELECT * FROM ADMIN WHERE id = ?', [id]);
};

const getAdminByEmailAndPassword = (email, password) => {
    return db.query('SELECT * FROM ADMIN WHERE email = ? AND password = ?', [email, password]);
};

const getAdminByMobile = (mobile) => {
    return db.query("SELECT * FROM ADMIN WHERE mobile = ?", [mobile]);
  };
  

module.exports = {
    createAdmin,
    getAllAdmins,
    updateAdmin,
    deleteAdmin,
    getAdminById,
    getAdminByEmailAndPassword,
    getAdminByMobile
};
