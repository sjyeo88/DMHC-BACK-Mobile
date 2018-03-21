"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mail_service_1 = require("../service/mail-service");
const fs = require("fs");
class HTMLtoStringService {
    constructor(subject, to) {
        this.result = 'Initial';
        this.ceOption = {
            id: '',
            name: '',
            email: '',
            job: '',
            dept: '',
            phone: '',
        };
        this.subject = subject;
        this.to = to;
    }
    getConfirmEmailString2(file, opt) {
        let result;
        fs.readFile(file, 'utf-8', (err, data) => {
            if (err)
                console.log(err);
            else {
                if (opt) {
                    for (let i = 0; i < opt.length; i++) {
                        let re = new RegExp('<#' + i.toString() + '\\s.*\\s=>', 'g');
                        data = data.replace(re, opt[i]);
                    }
                    this.result = data;
                }
                else {
                    this.result = data;
                }
                let ms = new mail_service_1.MailService();
                if (this.to) {
                    ms.setMailDirection(this.to);
                }
                ms.sendMail(ms.setMailOptions(this.subject, this.result, true));
            }
        });
    }
}
exports.HTMLtoStringService = HTMLtoStringService;
