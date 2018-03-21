"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const config_1 = require("../configure/config");
let router = express.Router();
module.exports = function (app) {
    let config = new config_1.ServerConfig();
    router.use(function timeLog(req, res, next) {
        console.log('Time', Date.now());
        next();
    });
    router.get("/jobs", (req, res) => {
        let insertUser_Q = 'SELECT * from JOBS';
        app.conn.query(insertUser_Q, (err, result) => {
            if (err) {
                console.log(err);
                res.status(500);
                res.json({ success: false, msg: 'Failed to Save' });
            }
            else {
                res.json({ success: true, data: result });
            }
        });
    });
    return router;
};
