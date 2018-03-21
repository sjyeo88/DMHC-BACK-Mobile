import * as passport from "passport"
import * as pbkdf2Password from "pbkdf2-password"
import * as moment from "moment"

let LocalStrategy  = require("passport-local").Strategy;
let hasher:pbkdf2Password  = pbkdf2Password();
let mysql = require('mysql')

export class AuthStrategy {
    constructor(app){
    passport.serializeUser((user, done) => {
      done(null, user);
    });

    passport.deserializeUser((id, done) => {
      let sql = 'SELECT * FROM PATIENT_USER WHERE idPATIENT_USER=' +
      mysql.escape(id);
      app.conn.query(sql, [id], (err, results)=>{
        if(err){
          done(null, null);
        } else {
          done(null, results[0]);
        }
      });
    });

    passport.use(new LocalStrategy(
      {
         usernameField:"email",
         passwordField:"password",
      },
      function(email:string, password:string, done:any){
        // console.log('test');
        let mail:string = email;
        let pwd:string = password;
        // console.log('mail', mail);
        // console.log('pwd', pwd);
        let sql = 'SELECT * FROM PATIENT_USER WHERE email= ' + mysql.escape(email);
        app.conn.query(sql, email, (err, results) => {
          if(err){
            return done(err);
          }
          let user = results[0];
          if(!results.length) {
            return done(null, null);
          }
          // console.log(results);
          // console.log(user);
          hasher({password:pwd, salt:user.salt}, (err, pass, salt, hash)=>{
              // console.log('salt', salt);
              // console.log('password', password);
              // console.log('hash', hash);
            if(hash === user.password){
              // console.log('test')
              return done(null, user.idPATIENT_USER);
            } else {
              return done(null, null);
            }
          });
        });
      }
    ));
  }

}
