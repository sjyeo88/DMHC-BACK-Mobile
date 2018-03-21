"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let mysql = require('mysql');
class SubjectManger {
    constructor() {
    }
    getSubjectConfigure() {
        let Q = ' SELECT * FROM PATIENT_USER '
            + ' JOIN SB_SBJT_CONF ON SB_SBJT_CONF.idSBJT_CONF_ALL = PATIENT_USER.idSBJT_CONF_ALL ';
        mysql.query(Q, (err, result) => {
            if (err) {
                console.log(err);
            }
            else {
                console.log(result);
            }
        });
    }
}
exports.SubjectManger = SubjectManger;
