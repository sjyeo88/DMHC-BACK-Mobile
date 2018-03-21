import * as express from "express";
import * as pbkdf2Password from "pbkdf2-password";
import * as moment from "moment";
import * as passport from "passport";
import * as session from "express-session";
import * as fs from "fs";
import * as mkdirp from 'mkdirp'

import request = require("request");

import { ServerConfig, setInputInterface } from "../configure/config"
import { HTMLtoStringService } from "../service/html-service"

let LocalStrategy  = require("passport-local")
let FaceboockStrategy = require("passport-facebook")
let passwdGen = require("generate-password")
// let jwt = require("jwt-simple")

let router = express.Router();
let hasher:pbkdf2Password  = pbkdf2Password();
import fileUpload = require('express-fileupload')
let mysql = require('mysql');
let jwt = require('jsonwebtoken');



module.exports = function(app):express.Router{
//Need to adding type of 'app'
  let config = new ServerConfig();
  let path = require('path')

  router.use(function timeLog(req:express.Request,
                     res:express.Response,
                     next:express.NextFunction):void
    {
      console.log('Time', Date.now());
      next();
    }
  );

  router.get("con");

  router.post(
    "/register",
    (req:express.Request, res:express.Response) => {
      hasher({password:req.body.password},
         (err:string, pass:string, salt:string, hash:string) => {
            let user = {
              idPATIENT_USER: undefined,
              idSBJT_CONF_ALL: undefined,
              email: req.body.email,
              password: hash,
              password_q: req.body.password_q,
              password_a: req.body.password_a,
              name: req.body.name,
              birth: req.body.birth,
              phone: req.body.phone,
              gender: req.body.gender,
              salt: salt,
              fcm_token: req.body.fcm_token,
            };
      //
            let Q:string = ' INSERT INTO PATIENT_USER '
            + ' (idEXPERT_USER, email, password, password_q, password_a, name, birth, phone, gender, salt, fcm_token ,JOIN_DATE ) '
            + ' VALUES ( '
              + mysql.escape(req.body.idEXPERT_USER) + ' , '
              + mysql.escape(req.body.email) + ' , '
              + mysql.escape(hash) + ' , '
              + mysql.escape(req.body.password_q) + ' , '
              + mysql.escape(req.body.password_a) + ' , '
              + mysql.escape(req.body.name) + ' , '
              + mysql.escape(req.body.birth) + ' , '
              + mysql.escape(req.body.phone) + ' , '
              + mysql.escape(req.body.gender) + ' , '
              + mysql.escape(salt) + ' , '
              + mysql.escape(req.body.fcm_token) + ' , '
              + 'NOW()'
            + ' ) '
            app.conn.query(Q, (err, result) => {
              if(err) {
                console.log(err);
                console.log(err);
                res.status(500).send(result);
              } else {
                app.SubMan.genAssignNowAll(result.insertId);
                res.status(200).send(result);
              }
            })
      }) //end of hasher
    })

    router.post('/local',
    (req:express.Request, res:express.Response) => {
      console.log(req.body);
      let email:string = req.body.email;
      let pwd:string = req.body.password;
      let sql = 'SELECT * FROM PATIENT_USER WHERE email= ' + mysql.escape(email);
      app.conn.query(sql, email, (err, result) => {
        if(err){
          return res.status(500).send(err);
        }
        let user = result[0];
        if(result.length === 0) {
          return res.status(401).send({success: false});;
        }
        hasher({password:pwd, salt:user.salt}, (err, pass, salt, hash)=>{
          if(hash === user.password){
            let token = jwt.sign({id: user.idPATIENT_USER}, config.jwt_password);
            res.status(200).json({success:true, token:token })
          } else {
            res.status(401).send({success: false});;
          }
        });
      });
    });

    router.get('/welcome', ensureAuthenticated,
    (req:express.Request, res:express.Response) => {
      res.status(200).send(req.session);
    })

    router.get('/fail',
      (req:express.Request, res:express.Response) => {
        res.status(401).send('fail');
      }
    )

    router.get('/check', ensureAuthenticated,
      (req:express.Request, res:express.Response) => {
        res.status(200).send({idEXPERT_USER:req.user.idEXPERT_USER, fcm_token:req.user.fcm_token});
    })

    router.put('/fcm', ensureAuthenticated,
      (req:express.Request, res:express.Response) => {
        console.log(req.body)
        let Q:string = ' UPDATE PATIENT_USER SET '
        + ' fcm_token = ' + mysql.escape(req.body.fcm_token)
        + ' WHERE idPATIENT_USER = ' + mysql.escape(req.user.idPATIENT_USER);
        app.conn.query(Q, (err, result)=>{
          if(err) {
            res.status(500).send(err);
            console.log(err);
            console.log(Q);
          } else {
            res.status(200).send('store success');
          }
        })
        // res.status(200).send({idEXPERT_USER:req.user.idEXPERT_USER, fcm_token:req.user.fcm_token});
    })

    router.post('/password', ensureAuthenticated,
      (req:express.Request, res:express.Response) => {
        let password = req.body.password
        console.log(req.body)
        hasher({password:password, salt:req.user.salt}, (err, pass, salt, hash)=>{
          console.log('password', password)
          console.log('salt', req.user.salt)
          console.log('hash', hash)
          if(hash === req.user.password){
            res.status(200).send(true)
          } else {
            res.status(200).send(false)
          }
        })
    })

    router.put('/new_password', ensureAuthenticated,
      (req:express.Request, res:express.Response) => {
        hasher({password:req.body.newPassword}, (err:string, pass:string, salt:string, hash:string) => {
          let Q:string = ' UPDATE PATIENT_USER SET '
          Q += ' password = ' + mysql.escape(hash) + ' , ';
          Q += ' salt = ' + mysql.escape(salt);
          Q += ' WHERE idPATIENT_USER = ' + mysql.escape(req.user.idPATIENT_USER);
          app.conn.query(Q, (err, result)=>{
            if(err) {
              res.status(500).send(err);
              console.log(err);
              console.log(Q);
            } else {
              res.status(200).send(result);
            }
          })
        })
    })

    router.delete('/signout', ensureAuthenticated,
      (req:express.Request, res:express.Response) => {
        let Q1: string = ' SELECT idSBJTS FROM SBJTS '
        Q1 += ' WHERE idPATIENT_USER = ' + mysql.escape(req.user.idPATIENT_USER)
        app.conn.query(Q1, (err1, result1)=>{
          if(err1) {
            res.status(500).send(err1);
            console.log(err1);
            console.log(Q1);
          } else {
            result1.forEach(obj=>{
              let imgPath = path.join(config.assetPath, 'img', 'assign', obj.idSBJTS + '.png')
              fs.exists(imgPath, result=>{ if(result) { fs.unlink(imgPath, err=>{}) }
              })
            })
              let Q1:string = ' DELETE t1, t2, t3 FROM '
              Q1 += ' SBJTS t1 '
              Q1 += ' LEFT JOIN SBJTS_READY t2 ON t1.idPATIENT_USER = t2.idPATIENT_USER '
              Q1 += ' LEFT JOIN SURVEY_RESULT t3 ON t2.idPATIENT_USER = t3.idPATIENT_USER '
              Q1 += ' WHERE t1.idPATIENT_USER = ' + mysql.escape(req.user.idPATIENT_USER)
              app.conn.query(Q1, (err1, result1)=>{
                if(err1) {
                  res.status(500).send(err1);
                  console.log(err1);
                  console.log(Q1);
                } else {
                  let Q2:string = ' DELETE FROM PATIENT_USER '
                  Q2 += ' WHERE idPATIENT_USER = ' + mysql.escape(req.user.idPATIENT_USER)
                  app.conn.query(Q2, (err2, result2)=>{
                    if(err2) {
                      res.status(500).send(err2);
                      console.log(err2);
                      console.log(Q2);
                    } else {
                      res.status(200).send(result2);
                    }
                  })
                }
              })
          }
        });
    })

    router.post('/email',
      (req:express.Request, res:express.Response) => {
        let Q: string = ' SELECT email FROM PATIENT_USER ';
        Q += ' WHERE name = ' + mysql.escape(req.body.name) + ' AND ';
        Q += ' gender = ' + mysql.escape(req.body.gender) + ' AND ';
        Q += ' birth = ' + mysql.escape(req.body.birth);
        if(req.body.phone) {
          Q += ' AND phone = ' + mysql.escape(req.body.phone);
        }
        app.conn.query(Q, (err, result)=>{
          if(err) {
            res.status(500).send(err)
            console.log(err);
            console.log(Q);
          } else {
            res.status(200).send(result);
          }
        })
    })

    router.post('/password/quest',
      (req:express.Request, res:express.Response) => {
        let Q: string = ' SELECT password_q FROM PATIENT_USER ';
        Q += ' WHERE email = ' + mysql.escape(req.body.email) + ' AND ';
        Q += ' name = ' + mysql.escape(req.body.name) + ' AND ';
        Q += ' phone = ' + mysql.escape(req.body.phone);
        app.conn.query(Q, (err, result)=>{
          if(err) {
            res.status(500).send(err)
            console.log(err);
            console.log(Q);
          } else {
            res.status(200).send(result);
          }
        })
    })

    router.post('/reconfig/password',
      (req:express.Request, res:express.Response) => {
        console.log(req.body)
        let newPassword = passwdGen.generate({
          length: 10,
          numbers: true,
        })

        let Q1: string = ' SELECT email, password_a, password_q FROM PATIENT_USER ';
        Q1 += ' WHERE email = ' + mysql.escape(req.body.email) + ' AND ';
        Q1 += ' name = ' + mysql.escape(req.body.name) + ' AND ';
        Q1 += ' phone = ' + mysql.escape(req.body.phone);
        app.conn.query(Q1, (err, result)=>{
          if(err) {
            res.status(500).send(err)
            console.log(err);
            console.log(Q1);
          } else {
            if(result.length === 0) {
              res.status(200).send({success:1});
            } else {
              if(result[0].password_a == req.body.password_a && result[0].password_q == req.body.password_q) {
                hasher({password:newPassword}, (err:string, pass:string, salt:string, hash:string) => {
                  let Q2: string = ' UPDATE PATIENT_USER SET '
                  Q2 += ' password = ' + mysql.escape(hash) + ' , '
                  Q2 += ' salt = ' + mysql.escape(salt)
                  Q2 += ' WHERE email = ' + mysql.escape(result[0].email);
                  app.conn.query(Q2, (err2, result2)=>{
                    if(err2) {
                      res.status(500).send({success:0});
                    } else {
                      let html = new HTMLtoStringService('매일마음관리 앱 비밀번호가 변경되었습니다.', result[0].email)
                      let opt = [
                        config.fullDomain + '/img/dmhc_logo',
                        newPassword
                      ]
                      html.getConfirmEmailString2('./assets/mail-schematic/new-password.html', opt)
                      res.status(200).send({success:0});
                    }
                  })
                })
              } else {
                res.status(200).send({success:2});
              }
            }
          }
        })
    })

    function ensureAuthenticated(req, res, next) {
      if(req.headers.cred === 'null') {
        console.log('header-null')
        res.status(401).send(null);
      }
      else {
        console.log('header-not-null')
        let cred = jwt.verify(req.headers.cred, config.jwt_password)
        let sql = 'SELECT * FROM PATIENT_USER WHERE idPATIENT_USER=' + mysql.escape(cred.id);
        app.conn.query(sql,  (err, results)=>{
          if(err){
            res.status(500).send(err);
            console.log(err);
          } else {
            if(results.length===0) {
              res.status(401).send(null);
            } else {
              req.user = results[0];
              console.log(req.user)
              next();
            }
          }
        })
      }
    }
  return router;
}; //end of module
