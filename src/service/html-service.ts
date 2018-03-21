import { ServerConfig } from "../configure/config";
import { MailService } from "../service/mail-service"
import  path  = require('path');
import  fs = require('fs');

export class HTMLtoStringService  {
  public result:string = 'Initial'
  public subject:string;
  public to:string;
  public from:string;
  public ceOption = {
      id: '',
      name: '',
      email: '',
      job: '',
      dept: '',
      phone: '',
  };
  constructor(subject,  to?) {
    this.subject = subject;
    this.to = to;
  }

  public getConfirmEmailString2(file,  opt?:string[],) {
    let result:string
    fs.readFile(file, 'utf-8', (err, data)=>{
      if(err) console.log(err);
      else {
        // console.log(data);
        if(opt) {
          for (let i=0; i < opt.length; i++) {
            let re =new RegExp('<#' + i.toString() + '\\s.*\\s=>', 'g');
            // console.log(data.replace(re, opt[i]));
            data = data.replace(re, opt[i]);
          }
            this.result = data;
        } else {
            this.result = data;
        }
            let ms = new MailService()
            if (this.to) {
              ms.setMailDirection(this.to);
            }
            ms.sendMail(ms.setMailOptions(
            this.subject,
            this.result,
            true
            ));
      }
    })
  }
}
