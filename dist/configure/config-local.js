"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ServerConfig {
    constructor() {
        this.dbSetting = {
            host: '13.125.58.139',
            user: 'root',
            password: '!dutkak3',
            port: 3306,
            database: 'DMHC',
        };
        this.jwt_password = 'test';
    }
}
exports.ServerConfig = ServerConfig;
