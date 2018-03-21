import nodemailer = require('nodemailer');
import { ServerConfig } from "../configure/config"

export class MailService {
  config = new ServerConfig();
  public from:string = 'DMHC Admin <kusmilab.dmhc@gmail.com>';
  public to:string = 'kusmilab.dmhc@gmail.com';

  constructor() {}

  public setMailDirection(to) {
    this.to = to;
  }

  public smtpTransport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: 'kusmilab.dmhc',
          pass: this.config.adminMailPassword,
        }
  })

  public setMailOptions(subject:string, source:string, opt1?:boolean){
    let mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
    }
    if (!opt1) {
      mailOptions['text'] = source;
    } else {
      mailOptions['html'] = source;
    }
    return mailOptions;
  }

  public sendMail(options) {
    this.smtpTransport.sendMail(options, (err, res) => {
      if(err) {
        console.log(err);
        // return res.status(500).send(err);
      }
      // else { res.status(200).send('success') }
    })
  }

}
