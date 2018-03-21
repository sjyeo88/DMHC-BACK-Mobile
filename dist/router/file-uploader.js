"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
let router = express.Router();
module.exports = function (app) {
    router.use(function timeLog(req, res, next) {
        console.log('Time', Date.now());
        next();
    });
    router.get("/jobs");
    return router;
};
