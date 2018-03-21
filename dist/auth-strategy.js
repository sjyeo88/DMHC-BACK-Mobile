"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const passport = require("passport");
const pbkdf2Password = require("pbkdf2-password");
let LocalStrategy = require("passport-local").Strategy;
let hasher = pbkdf2Password();
let mysql = require('mysql');
class AuthStrategy {
    constructor(app) {
        passport.serializeUser((user, done) => {
            done(null, user);
        });
        passport.deserializeUser((id, done) => {
            let sql = 'SELECT * FROM PATIENT_USER WHERE idPATIENT_USER=' +
                mysql.escape(id);
            app.conn.query(sql, [id], (err, results) => {
                if (err) {
                    done(null, null);
                }
                else {
                    done(null, results[0]);
                }
            });
        });
        passport.use(new LocalStrategy({
            usernameField: "email",
            passwordField: "password",
        }, function (email, password, done) {
            let mail = email;
            let pwd = password;
            let sql = 'SELECT * FROM PATIENT_USER WHERE email= ' + mysql.escape(email);
            app.conn.query(sql, email, (err, results) => {
                if (err) {
                    return done(err);
                }
                let user = results[0];
                if (!results.length) {
                    return done(null, null);
                }
                hasher({ password: pwd, salt: user.salt }, (err, pass, salt, hash) => {
                    if (hash === user.password) {
                        return done(null, user.idPATIENT_USER);
                    }
                    else {
                        return done(null, null);
                    }
                });
            });
        }));
    }
}
exports.AuthStrategy = AuthStrategy;
