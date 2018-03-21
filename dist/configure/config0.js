"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ServerConfig {
    constructor() {
        this.dbSetting = {
            host: '',
            user: '',
            password: '',
            port: 3306,
            database: 'USER',
        };
        this.jwt_password = 'test';
    }
}
exports.ServerConfig = ServerConfig;
