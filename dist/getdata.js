"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
let router = express.Router();
module.exports = function (app) {
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
                res.json(result);
            }
        });
    });
    router.get("/depts", (req, res) => {
        let insertUser_Q = 'SELECT * from DEPT';
        app.conn.query(insertUser_Q, (err, result) => {
            if (err) {
                console.log(err);
                res.status(500);
                res.json({ success: false, msg: 'Failed to Save' });
            }
            else {
                res.json(result);
            }
        });
    });
    router.get("/users", (req, res) => {
        let Query = 'SELECT idEXPERT_USER , email FROM EXPERT_USER';
        console.log(Query);
        app.conn.query(Query, (err, result) => {
            if (err) {
                console.log(err);
                res.status(500);
                res.json({ success: false, msg: 'Failed to Save' });
            }
            else {
                res.json(result);
            }
        });
    });
    return router;
};
