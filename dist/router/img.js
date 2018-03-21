"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
let router = express.Router();
const fs = require("fs");
const config_1 = require("../configure/config");
module.exports = function (app) {
    let config = new config_1.ServerConfig();
    let path = require("path");
    router.get("/:userid/license_img", (req, res) => {
        let id = req.params.userid;
        let imgPath = path.join(config.assetPath, 'userfiles', id, 'license_img');
        fs.readFile(imgPath, (err, data) => {
            if (err) {
                res.status(404);
            }
            else {
                res.writeHead(200, { 'Content-Type': 'image/*' });
                res.end(data);
            }
        });
    });
    router.get("/:userid/license.tmp", (req, res) => {
        let id = req.params.userid;
        let imgPath = path.join(config.assetPath, 'userfiles', id, 'license_img.tmp');
        fs.readFile(imgPath, (err, data) => {
            if (err) {
                res.status(404);
            }
            else {
                res.writeHead(200, { 'Content-Type': 'image/*' });
                res.end(data);
            }
        });
    });
    router.get("/dmhc_logo", (req, res) => {
        let id = req.params.userid;
        let imgPath = path.join(config.assetPath, 'img', 'dmhc_logo.png');
        fs.readFile(imgPath, (err, data) => {
            if (err) {
                res.status(404).send(err);
            }
            else {
                res.writeHead(200, { 'Content-Type': 'image/*' });
                res.end(data);
            }
        });
    });
    router.get("/tmp/:img", (req, res) => {
        let id = req.params.userid;
        let imgPath = path.join(config.assetPath, 'img', 'tmp', req.params.img);
        fs.readFile(imgPath, (err, data) => {
            if (err) {
                res.status(404).send(err);
            }
            else {
                res.writeHead(200, { 'Content-Type': 'image/*' });
                res.end(data);
            }
        });
    });
    router.get("/", (req, res) => {
        res.send('Test');
    });
    return router;
};
