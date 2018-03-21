"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const passwords_1 = require("./password/passwords");
class ServerConfig {
    constructor() {
        this.jwt_password = passwords_1.security.jwt_password;
        this.assetPath = 'assets';
        this.fileStoragePath = './assets';
        this.domain = 'https://dailymhc.com';
        this.frontDomain = 'https://dailymhc:4200';
        this.perpose = '/mobile/api';
        this.fullDomain = this.domain + this.perpose;
        this.adminMailPassword = passwords_1.security.adminMailPassword;
        this.fcmApiKey = passwords_1.security.fcmApiKey;
        this.dbSetting = {
            host: passwords_1.security.sqlHost,
            user: 'root',
            password: passwords_1.security.sqlPassword,
            port: 3306,
            database: passwords_1.security.sqlDB,
        };
    }
}
exports.ServerConfig = ServerConfig;
