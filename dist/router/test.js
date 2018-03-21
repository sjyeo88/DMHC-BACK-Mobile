"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
let router = express.Router();
const fs = require("fs");
module.exports = function (app) {
    router.get("/", (req, res) => {
        let result = 'Result';
        let getConfirmEmailString2 = (file, opt) => {
            let result;
            fs.readFile(file, 'utf-8', (err, data) => {
                if (err)
                    console.log(err);
                else {
                    if (opt) {
                        for (let i = 0; i < opt.length; i++) {
                            let re = new RegExp('<#' + i.toString() + '\\s.*\\s=>');
                            data = data.replace(re, opt[i]);
                        }
                    }
                    result = data;
                }
            });
            return result;
        };
        let a = ['AAA', 'BBB', 'CCC'];
        let opt = {};
        getConfirmEmailString2('assets/welcome.html', a);
        res.status(300).send(result);
    });
    return router;
};
