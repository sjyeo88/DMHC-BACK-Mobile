"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
const errorHandler = require("errorhandler");
const logger = require("morgan");
let cors = require('cors');
const mysql = require("mysql");
const MySQLStore = require("express-mysql-session");
const passport = require("passport");
const StrategyConfig = require("./auth-strategy");
const config_1 = require("./configure/config");
const fileUpload = require("express-fileupload");
const session = require("express-session");
const sbjt_manager_1 = require("./service/sbjt-manager");
"use strict";
class Server {
    constructor() {
        this.configure = new config_1.ServerConfig();
        this.config = function () {
            this.app.use(express.static(path.join(__dirname, "public")));
            this.app.use(function (req, res, next) {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, cred, key");
                res.header("Access-Control-Allow-Credentials", "false");
                res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
                next();
            });
            this.app.use(logger("dev"));
            this.app.use(bodyParser.json());
            this.app.use(bodyParser.urlencoded({
                extended: false,
            }));
            this.app.use(cookieParser(this.setInput.password));
            this.app.use(fileUpload());
            this.app.use(session({
                secret: this.setInput.password,
                resave: true,
                saveUninitialized: true,
                store: this.sqlStore
            }));
            this.app.use(passport.initialize());
            this.app.use(passport.session());
            this.app.use((err, req, res, next) => {
                err.status = 404;
                next(err);
            });
            this.app.use(errorHandler());
        };
        this.routes = function () {
            let auth = require("./router/auth")(this);
            let index = require("./router/index")(this);
            let data = require("./router/getdata")(this);
            let img = require("./router/img")(this);
            this.app.use(this.configure.perpose + '/auth', auth);
            this.app.use(this.configure.perpose + '/', index);
            this.app.use(this.configure.perpose + '/data', data);
            this.app.use(this.configure.perpose + '/img', img);
        };
        console.log('Server Started!');
        this.setInput = this.configure.dbSetting;
        this.sqlStore = new MySQLStore(this.setInput);
        this.conn = mysql.createConnection(this.setInput);
        this.conn.connect(function (err) {
            if (err) {
                console.error('mysql connection error');
                console.error(err);
                throw err;
            }
            else {
                console.log("DATABASE Connected");
            }
        });
        this.SubMan = new sbjt_manager_1.SubjectManger(this.conn);
        this.app = express();
        this.config();
        this.routes();
        this.strategy = new StrategyConfig.AuthStrategy(this);
    }
    static bootstrap() {
        return new Server();
    }
    api() {
    }
}
exports.Server = Server;
