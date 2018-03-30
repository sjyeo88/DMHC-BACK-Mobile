"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
let router = express.Router();
const mysql = require("mysql");
const config_1 = require("../configure/config");
const fs = require("fs");
let jwt = require('jsonwebtoken');
module.exports = function (app) {
    let config = new config_1.ServerConfig();
    let path = require('path');
    router.use(function timeLog(req, res, next) {
        console.log('Time', Date.now());
        next();
    });
    router.post("/register/experts", (req, res) => {
        let Q = 'SELECT idEXPERT_USER, name, idDEPT FROM EXPERT_USER '
            + ' WHERE name = ' + mysql.escape(req.body.name) + ' AND '
            + ' idJOBS = ' + mysql.escape(req.body.idJOBS) + ' AND '
            + ' idDEPT = ' + mysql.escape(req.body.idDEPT);
        app.conn.query(Q, (err, result) => {
            if (err) {
                console.log(err);
                console.log(Q);
                res.status(500).send(err);
            }
            else {
                console.log(Q);
                res.status(200).send(result);
            }
        });
    });
    router.post("/register/patient/:email", (req, res) => {
        let Q = 'SELECT idPATIENT_USER FROM PATIENT_USER '
            + ' WHERE email = ' + mysql.escape(req.params.email);
        app.conn.query(Q, (err, result) => {
            if (err) {
                console.log(err);
                console.log(Q);
                res.status(500).send(err);
            }
            else {
                console.log(Q);
                res.status(200).send(result);
            }
        });
    });
    router.get("/register/depts", (req, res) => {
        let Q = 'SELECT idDEPT, name FROM DEPT';
        app.conn.query(Q, (err, result) => {
            if (err) {
                console.log(err);
                console.log(Q);
                res.status(500).send(err);
            }
            else {
                res.status(200).send(result);
            }
        });
    });
    router.get("/register/jobs", (req, res) => {
        let Q = 'SELECT idJOBS, name FROM JOBS';
        app.conn.query(Q, (err, result) => {
            if (err) {
                console.log(err);
                console.log(Q);
                res.status(500).send(err);
            }
            else {
                res.status(200).send(result);
            }
        });
    });
    router.get("/assign/date/:date", ensureAuthenticated, (req, res) => {
        let fromTime = req.params.date.slice(0, 19).replace('T', ' ');
        let toTimeTmp = new Date(req.params.date);
        toTimeTmp.setDate(toTimeTmp.getDate() + 1);
        let toTime = toTimeTmp.toISOString().slice(0, 19).replace('T', ' ');
        let Q = ' SELECT * FROM SBJTS '
            + ' WHERE idPATIENT_USER = ' + mysql.escape(req.user.idPATIENT_USER) + ' AND '
            + ' status <> ' + mysql.escape(2) + ' AND '
            + ' status <> ' + mysql.escape(3) + ' AND '
            + " PUSH_TIME BETWEEN " + mysql.escape(fromTime) + ' AND ' + mysql.escape(toTime)
            + ' ORDER BY PUSH_TIME DESC ';
        app.conn.query(Q, (err, result) => {
            if (err) {
                console.log(err);
                console.log(Q);
                res.status(500).send(err);
            }
            else {
                res.status(200).send(result);
            }
        });
    });
    router.put("/assign/repush/:idSBJTS/:status", ensureAuthenticated, (req, res) => {
        let Q = ' UPDATE SBJTS '
            + ' SET repush = ' + mysql.escape(req.params.status)
            + ' WHERE idSBJTS = ' + mysql.escape(req.params.idSBJTS);
        app.conn.query(Q, (err, result) => {
            if (err) {
                console.log(err);
                console.log(Q);
                res.status(500).send(err);
            }
            else {
                res.status(200).send(result);
            }
        });
    });
    router.put("/assign/simple/", ensureAuthenticated, (req, res) => {
        console.log(req.body);
        let Q = ' UPDATE SBJTS '
            + ' SET result = ' + mysql.escape(req.body.answer) + ' , '
            + ' status = ' + mysql.escape(1) + ' , '
            + ' FINISHED_TIME = NOW() '
            + ' WHERE idSBJTS = ' + mysql.escape(req.body.idSBJTS);
        app.conn.query(Q, (err, result) => {
            if (err) {
                console.log(err);
                console.log(Q);
                res.status(500).send(err);
            }
            else {
                res.status(200).send(result);
            }
        });
    });
    router.put("/assign/normal/:idSBJTS", ensureAuthenticated, (req, res) => {
        if (req.body.assignImg) {
            let base64Data = req.body.assignImg.replace(/^data:image\/png;base64,/, "");
            let binaryData = new Buffer(base64Data, 'base64').toString('binary');
            let imgPath = path.join(config.assetPath, 'img', 'assign', req.params.idSBJTS + '.png');
            require('fs').writeFile(imgPath, base64Data, 'base64', (err) => {
                if (err) {
                    res.status(500).send(err);
                }
                else {
                    let Q = ' UPDATE SBJTS '
                        + ' SET result = ' + mysql.escape(req.body.data) + ' , '
                        + ' status = ' + mysql.escape(1) + ' , '
                        + ' img_path = ' + mysql.escape(imgPath) + ' , '
                        + ' FINISHED_TIME = NOW() '
                        + ' WHERE idSBJTS = ' + mysql.escape(req.params.idSBJTS);
                    app.conn.query(Q, (err, result) => {
                        if (err) {
                            console.log(err);
                            console.log(Q);
                            res.status(500).send(err);
                        }
                        else {
                            res.status(200).send(result);
                        }
                    });
                }
            });
        }
        else {
            console.log(req.body.data);
            let Q = ' UPDATE SBJTS '
                + ' SET result = ' + mysql.escape(req.body.data) + ' , '
                + ' status = ' + mysql.escape(1) + ' , '
                + ' FINISHED_TIME = NOW() '
                + ' WHERE idSBJTS = ' + mysql.escape(req.params.idSBJTS);
            app.conn.query(Q, (err, result) => {
                if (err) {
                    console.log(err);
                    console.log(Q);
                    res.status(500).send(err);
                }
                else {
                    res.status(200).send(result);
                }
            });
        }
    });
    router.put("/assign/lecture/:idSBJTS", ensureAuthenticated, (req, res) => {
        console.log(req.body.data);
        let Q = ' UPDATE SBJTS '
            + ' SET '
            + ' status = ' + mysql.escape(1) + ' , '
            + ' FINISHED_TIME = NOW() '
            + ' WHERE idSBJTS = ' + mysql.escape(req.params.idSBJTS);
        app.conn.query(Q, (err, result) => {
            if (err) {
                console.log(err);
                console.log(Q);
                res.status(500).send(err);
            }
            else {
                res.status(200).send(result);
            }
        });
    });
    router.get("/assign/normal/img/:idSBJTS", (req, res) => {
        let imgPath = path.join(config.assetPath, 'img', 'assign', req.params.idSBJTS + '.png');
        console.log(imgPath);
        fs.readFile(imgPath, (err, data) => {
            if (err) {
                res.status(404).send('Not found image');
            }
            else {
                res.writeHead(200, { 'Content-Type': 'image/png' });
                res.end(data);
            }
        });
    });
    router.get("/assign/simple/:idSBJTS", ensureAuthenticated, (req, res) => {
        console.log(req.body);
        let Q = ' SELECT result FROM SBJTS '
            + ' WHERE idSBJTS = ' + mysql.escape(req.body.idSBJTS);
        app.conn.query(Q, (err, result) => {
            if (err) {
                console.log(err);
                console.log(Q);
                res.status(500).send(err);
            }
            else {
                res.status(200).send(result);
            }
        });
    });
    router.get("/assign/:idSBJTS", ensureAuthenticated, (req, res) => {
        let Q = ' SELECT SB_SBJT_CONF.* FROM SBJTS '
            + ' JOIN SB_SBJT_CONF ON SBJTS.idSB_SBJT_CONF = SB_SBJT_CONF.idSB_SBJT_CONF '
            + ' WHERE SBJTS.idSBJTS = ' + mysql.escape(req.params.idSBJTS);
        app.conn.query(Q, (err, result) => {
            if (err) {
                console.log(err);
                console.log(Q);
                res.status(500).send(err);
            }
            else {
                res.status(200).send(result);
            }
        });
    });
    router.get("/assign/survey/:idSB_SBJT_CONF", ensureAuthenticated, (req, res) => {
        let Q = ' SELECT * FROM SURVEY_CONF '
            + ' JOIN SURVEY_CONF_OBJECT ON SURVEY_CONF.idSURVEY = SURVEY_CONF_OBJECT.idSURVEY '
            + ' WHERE SURVEY_CONF.idSURVEY = '
            + ' (SELECT conf_input_05 FROM SB_SBJT_CONF WHERE type_input = 7 AND '
            + ' idSB_SBJT_CONF = ' + mysql.escape(req.params.idSB_SBJT_CONF) + ')'
            + ' ORDER BY num ASC ';
        app.conn.query(Q, (err, result) => {
            if (err) {
                console.log(err);
                console.log(Q);
                res.status(500).send(err);
            }
            else {
                res.status(200).send(result);
            }
        });
    });
    router.post("/assign/survey", ensureAuthenticated, (req, res) => {
        console.log(req.body);
        let Q1 = ' INSERT INTO SURVEY_RESULT '
            + ' (idPATIENT_USER, idSBJTS, idSURVEY, POINT) '
            + ' VALUES ( '
            + mysql.escape(req.user.idPATIENT_USER) + ' , '
            + mysql.escape(req.body.idSBJTS) + ' , '
            + mysql.escape(req.body.idSURVEY) + ' , '
            + mysql.escape(req.body.POINT) + ' ) '
            + ' ON DUPLICATE KEY UPDATE '
            + ' idPATIENT_USER = ' + mysql.escape(req.user.idPATIENT_USER) + ' , '
            + ' idSURVEY = ' + mysql.escape(req.body.idSURVEY) + ' , '
            + ' POINT = ' + mysql.escape(req.body.POINT);
        app.conn.query(Q1, (err1, result1) => {
            if (err1) {
                console.log(err1);
                console.log(Q1);
                res.status(500).send(err1);
            }
            else {
                let Q2 = ' UPDATE SBJTS SET '
                    + ' status = ' + mysql.escape(1) + ','
                    + ' FINISHED_TIME = NOW() '
                    + ' WHERE idSBJTS = ' + mysql.escape(req.body.idSBJTS);
                app.conn.query(Q2, (err2, result2) => {
                    if (err1) {
                        console.log(err2);
                        console.log(Q2);
                        res.status(500).send(err2);
                    }
                    else {
                        res.status(200).send(result2);
                    }
                });
            }
        });
    });
    router.get("/assign/lecture/:idSB_SBJT_CONF", ensureAuthenticated, (req, res) => {
        let Q = ' SELECT LECTURE_ALL.* '
            + ' FROM LECTURE_ALL '
            + ' INNER JOIN SBJT_CONF_ALL ON SBJT_CONF_ALL.idLECTURE = LECTURE_ALL.idLECTURE '
            + ' INNER JOIN SB_SBJT_CONF ON SB_SBJT_CONF.idSBJT_CONF_ALL = SBJT_CONF_ALL.idSBJT_CONF_ALL '
            + ' WHERE SB_SBJT_CONF.idSB_SBJT_CONF = ' + mysql.escape(req.params.idSB_SBJT_CONF);
        app.conn.query(Q, (err, result) => {
            if (err) {
                console.log(err);
                console.log(Q);
                res.status(500).send(err);
            }
            else {
                res.status(200).send(result);
            }
        });
    });
    router.get("/assign/lecture/pdf/:title", ensureAuthenticated, (req, res) => {
        let path = config.fileStoragePath + "/userfiles/" +
            req.user.idEXPERT_USER + '/lectures/' +
            req.params.title + "/";
        let fileName = req.params.title + '.pdf';
        fs.readFile(path + fileName, (err, data) => {
            if (err) {
                res.status(500).send(err);
            }
            else {
                res.contentType('application/pdf');
                res.send(data);
            }
        });
    });
    router.get("/assign/lecture/html/:idLECTURE", ensureAuthenticated, (req, res) => {
        let Q = ' SELECT * '
            + ' FROM LECTURE_HTML '
            + ' WHERE idLECTURE = ' + mysql.escape(req.params.idLECTURE);
        app.conn.query(Q, (err, result) => {
            if (err) {
                console.log(err);
                console.log(Q);
                res.status(500).send(err);
            }
            else {
                res.status(200).send(result);
            }
        });
    });
    router.get("/survey/result/all/:year", ensureAuthenticated, (req, res) => {
        let Q = " SELECT SURVEY_CONF.idSURVEY, title, POINT, PUSH_TIME FROM DMHC.SURVEY_RESULT ";
        Q += " JOIN SBJTS ON SBJTS.idSBJTS = SURVEY_RESULT.idSBJTS ";
        Q += " JOIN SURVEY_CONF ON SURVEY_CONF.idSURVEY = SURVEY_RESULT.idSURVEY ";
        Q += " WHERE SBJTS.idPATIENT_USER = " + mysql.escape(req.user.idPATIENT_USER) + " AND ";
        Q += " PUSH_TIME LIKE ";
        Q += mysql.escape(req.params.year + "%");
        app.conn.query(Q, (err, result) => {
            if (err) {
                console.log(err);
                console.log(Q);
                res.status(500).send(err);
            }
            else {
                res.status(200).send(result);
            }
        });
    });
    router.get("/assign/result/all", ensureAuthenticated, (req, res) => {
        let Q = "SELECT * FROM ";
        Q += "(SELECT count(if(status=1, 1, null)) as month_fin, count(if(status=0, 1, null)) as month_unfin, DATE_FORMAT(CONVERT_TZ(PUSH_TIME, 'UTC', 'Asia/Seoul'), '%Y-%c-') as month FROM DMHC.SBJTS ";
        Q += ' WHERE idPATIENT_USER = ' + mysql.escape(req.user.idPATIENT_USER);
        Q += ' group by month) as monthes ';
        Q += " JOIN (SELECT count(if(status=0, 1, null)) as date_unfin, count(if(status=1, 1, null)) as date_fin, DATE_FORMAT(CONVERT_TZ(PUSH_TIME, 'UTC', 'Asia/Seoul'), '%Y-%c-%d') as date  FROM DMHC.SBJTS";
        Q += ' WHERE idPATIENT_USER = ' + mysql.escape(req.user.idPATIENT_USER);
        Q += " group by date) as dates ";
        Q += "ON dates.date like CONCAT('%', monthes.month, '%')";
        app.conn.query(Q, (err, result) => {
            if (err) {
                console.log(err);
                console.log(Q);
                res.status(500).send(err);
            }
            else {
                res.status(200).send(result);
            }
        });
    });
    router.get("/push", ensureAuthenticated, (req, res) => {
        let Q = ' SELECT push '
            + ' FROM PATIENT_USER '
            + ' WHERE idPATIENT_USER = ' + mysql.escape(req.user.idPATIENT_USER);
        app.conn.query(Q, (err, result) => {
            if (err) {
                console.log(err);
                console.log(Q);
                res.status(500).send(err);
            }
            else {
                res.status(200).send(result);
            }
        });
    });
    router.put("/push/on", ensureAuthenticated, (req, res) => {
        let Q = ' UPDATE PATIENT_USER ';
        Q += ' SET push = ' + mysql.escape(1);
        Q += ' WHERE idPATIENT_USER = ' + mysql.escape(req.user.idPATIENT_USER);
        app.conn.query(Q, (err, result) => {
            if (err) {
                console.log(err);
                console.log(Q);
                res.status(500).send(err);
            }
            else {
                res.status(200).send(result);
            }
        });
    });
    router.put("/push/off", ensureAuthenticated, (req, res) => {
        let Q = ' UPDATE PATIENT_USER ';
        Q += ' SET push = ' + mysql.escape(0);
        Q += ' WHERE idPATIENT_USER = ' + mysql.escape(req.user.idPATIENT_USER);
        app.conn.query(Q, (err, result) => {
            if (err) {
                console.log(err);
                console.log(Q);
                res.status(500).send(err);
            }
            else {
                res.status(200).send(result);
            }
        });
    });
    router.get("/user", ensureAuthenticated, (req, res) => {
        console.log('user', req.user);
        let Q = ' SELECT PATIENT_USER.email, ';
        Q += " password_q, ";
        Q += " PATIENT_USER.name, ";
        Q += " PATIENT_USER.gender, ";
        Q += " CONVERT_TZ(PATIENT_USER.birth, 'UTC', 'Asia/Seoul') as birth, ";
        Q += " PATIENT_USER.phone, ";
        Q += " PATIENT_USER.password_q, ";
        Q += " PATIENT_USER.password_a, ";
        Q += " PATIENT_USER.idEXPERT_USER, ";
        Q += " EXPERT_USER.name as e_name, ";
        Q += " EXPERT_USER.idJOBS, ";
        Q += " EXPERT_USER.idDEPT ";
        Q += " FROM PATIENT_USER JOIN EXPERT_USER ";
        Q += " ON PATIENT_USER.idEXPERT_USER = EXPERT_USER.idEXPERT_USER ";
        Q += ' WHERE idPATIENT_USER = ' + mysql.escape(req.user.idPATIENT_USER);
        app.conn.query(Q, (err, result) => {
            if (err) {
                console.log(err);
                console.log(Q);
                res.status(500).send(err);
            }
            else {
                if (result.length === 0) {
                    res.status(500).send(result);
                }
                else {
                    res.status(200).send(result);
                }
            }
        });
    });
    router.put("/user/email", ensureAuthenticated, (req, res) => {
        let Q = ' UPDATE PATIENT_USER SET ';
        Q += ' email = ' + mysql.escape(req.body.email);
        Q += ' WHERE idPATIENT_USER = ' + mysql.escape(req.user.idPATIENT_USER);
        app.conn.query(Q, (err, result) => {
            if (err) {
                console.log(err);
                console.log(Q);
                res.status(500).send(err);
            }
            else {
                res.status(200).send(result);
            }
        });
    });
    router.put("/user/gender", ensureAuthenticated, (req, res) => {
        let Q = ' UPDATE PATIENT_USER SET ';
        Q += ' gender = ' + mysql.escape(req.body.gender);
        Q += ' WHERE idPATIENT_USER = ' + mysql.escape(req.user.idPATIENT_USER);
        app.conn.query(Q, (err, result) => {
            if (err) {
                console.log(err);
                console.log(Q);
                res.status(500).send(err);
            }
            else {
                res.status(200).send(result);
            }
        });
    });
    router.put("/user/birth", ensureAuthenticated, (req, res) => {
        let Q = ' UPDATE PATIENT_USER SET ';
        Q += ' birth = ' + mysql.escape(req.body.birth);
        Q += ' WHERE idPATIENT_USER = ' + mysql.escape(req.user.idPATIENT_USER);
        app.conn.query(Q, (err, result) => {
            if (err) {
                console.log(err);
                console.log(Q);
                res.status(500).send(err);
            }
            else {
                res.status(200).send(result);
            }
        });
    });
    router.put("/user/phone", ensureAuthenticated, (req, res) => {
        let Q = ' UPDATE PATIENT_USER SET ';
        Q += ' phone = ' + mysql.escape(req.body.phone);
        Q += ' WHERE idPATIENT_USER = ' + mysql.escape(req.user.idPATIENT_USER);
        app.conn.query(Q, (err, result) => {
            if (err) {
                console.log(err);
                console.log(Q);
                res.status(500).send(err);
            }
            else {
                res.status(200).send(result);
            }
        });
    });
    router.put("/user/password/qa", ensureAuthenticated, (req, res) => {
        let Q = ' UPDATE PATIENT_USER SET ';
        Q += ' password_q = ' + mysql.escape(req.body.password_q) + ' , ';
        Q += ' password_a = ' + mysql.escape(req.body.password_a);
        Q += ' WHERE idPATIENT_USER = ' + mysql.escape(req.user.idPATIENT_USER);
        app.conn.query(Q, (err, result) => {
            if (err) {
                console.log(err);
                console.log(Q);
                res.status(500).send(err);
            }
            else {
                res.status(200).send(result);
            }
        });
    });
    router.put("/user/expert/:idEXPERT_USER", ensureAuthenticated, (req, res) => {
        let Q = ' UPDATE PATIENT_USER SET ';
        Q += ' idEXPERT_USER = ' + mysql.escape(req.params.idEXPERT_USER) + ' , ';
        Q += ' idSBJT_CONF_ALL = ' + mysql.escape(1);
        Q += ' WHERE idPATIENT_USER = ' + mysql.escape(req.user.idPATIENT_USER);
        app.conn.query(Q, (err, result) => {
            if (err) {
                console.log(err);
                console.log(Q);
                res.status(500).send(err);
            }
            else {
                res.status(200).send(result);
            }
        });
    });
    router.get("/assign/now/:idPATIENT_USER", (req, res) => {
        app.SubMan.genAssignNowAll(req.params.idPATIENT_USER);
    });
    function ensureAuthenticated(req, res, next) {
        if (req.headers.cred === 'null') {
            console.log('header-null');
            res.status(401).send(null);
        }
        else {
            console.log('header-not-null');
            let cred = jwt.verify(req.headers.cred, config.jwt_password);
            let sql = 'SELECT * FROM PATIENT_USER WHERE idPATIENT_USER=' + mysql.escape(cred.id);
            app.conn.query(sql, (err, results) => {
                if (err) {
                    res.status(500).send(err);
                    console.log(err);
                }
                else {
                    if (results.length === 0) {
                        res.status(401).send(null);
                    }
                    else {
                        req.user = results[0];
                        next();
                    }
                }
            });
        }
    }
    return router;
};
