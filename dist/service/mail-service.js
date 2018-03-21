"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer = require("nodemailer");
const config_1 = require("../configure/config");
class MailService {
    constructor() {
        this.config = new config_1.ServerConfig();
        this.from = 'DMHC Admin <kusmilab.dmhc@gmail.com>';
        this.to = 'kusmilab.dmhc@gmail.com';
        this.smtpTransport = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: 'kusmilab.dmhc',
                pass: this.config.adminMailPassword,
            }
        });
    }
    setMailDirection(to) {
        this.to = to;
    }
    setMailOptions(subject, source, opt1) {
        let mailOptions = {
            from: this.from,
            to: this.to,
            subject: subject,
        };
        if (!opt1) {
            mailOptions['text'] = source;
        }
        else {
            mailOptions['html'] = source;
        }
        return mailOptions;
    }
    sendMail(options) {
        this.smtpTransport.sendMail(options, (err, res) => {
            if (err) {
                console.log(err);
            }
        });
    }
}
exports.MailService = MailService;
