//Core Modules
import * as express from "express";
import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as path from "path";
import errorHandler = require("errorhandler");
import methodOverride = require("method-override");
import * as logger from "morgan";
let cors = require('cors')

//Model Modules
import * as mysql from "mysql";
import * as MySQLStore from "express-mysql-session"

//Auth Modules
// import * as passport from "passport"
// import LocalStrategy =require("passport-local")
// import StrategyConfig = require("./auth-strategy")
import { ServerConfig, setInputInterface } from "./configure/config"
import fileUpload = require('express-fileupload')

// let cookieSession = require('cookie-session');
import cookieSession = require('cookie-session');
import * as session from "express-session"

//Scheduler module
import { SubjectManger } from './service/sbjt-manager'


"use strict";



export class Server {

  public app;
  public conn;
  public sqlStore;
  public setInput;
  public auth;
  public strategy;
  public configure = new ServerConfig()
  public SubMan;
  //private hasher:pbkdf2Password = new pbkdf2Password();
  public static bootstrap() {
    return new Server();
  }



  constructor() {
    //app start
    console.log('Server Started!');
    this.setInput = this.configure.dbSetting;
    this.sqlStore = new MySQLStore(this.setInput);
    this.conn = mysql.createConnection(this.setInput);
    this.conn.connect(function(err){
      if (err) {
        console.error('mysql connection error');
        console.error(err);
        throw err;
      } else {
        console.log("DATABASE Connected");
      }
    });

    this.SubMan = new SubjectManger(this.conn)

    this.app  = express();
    //configure application
    this.config();

    //add routes
    this.routes();

    //External Modules
    //add config of auth-strategy
    // this.strategy = new StrategyConfig.AuthStrategy(this);
  }

  public api():void {
    //empty for now
  }

  public config = function():void {
    // this.app.use(cors());
    this.app.use(express.static(path.join(__dirname, "public")));

    this.app.use(function(req, res, next) {
      // res.header("Access-Control-Allow-Origin", "http://192.168.1.2:8100");
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, cred, key");
      res.header("Access-Control-Allow-Credentials", "false");
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
      next();
    });
    //use logger middlware
    this.app.use(logger("dev"));


    //use json form parser middlware
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({
      extended: false,
    }));

    this.app.use(cookieParser(this.setInput.password));
    //use fileupload
    this.app.use(fileUpload());
    //use query string parser middlware
    this.app.use(session({
        secret:this.setInput.password,
        resave: true,
        saveUninitialized: true,
        // cookie: {
        //   secure:true,
        // },
        store: this.sqlStore
    }));

    // this.app.use(passport.initialize());
    // this.app.use(passport.session());

    //use override middlware
    //this.app.use(methodOverride());
    //catch 404 and forward to error handler
    this.app.use((err: any, req: express.Request,
                  res: express.Response,
                  next: express.NextFunction) =>
    {
        err.status = 404;
        next(err);
    });

    //error handling
    this.app.use(errorHandler());
  }


  public routes = function():void {
    let auth = require("./router/auth")(this);
    let index = require("./router/index")(this);
    let data= require("./router/getdata")(this);
    let img= require("./router/img")(this);
    this.app.use(this.configure.perpose  + '/auth', auth);
    this.app.use(this.configure.perpose  + '/', index);
    this.app.use(this.configure.perpose  + '/data', data);
    this.app.use(this.configure.perpose  + '/img', img);
  }


}
