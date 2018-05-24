//Remove 0 on file names
import { security } from './password/passwords'

export interface setInputInterface {
  host:string,
  user:string,
  password:string,
  port:number,
  database:string
}

export class ServerConfig {
  public jwt_password:string = security.jwt_password;
  public assetPath:string = 'assets'
  public fileStoragePath:string = './assets'
  public expertFileStoragePath:string = './assets-expert'
  public domain:string = 'http://localhost:3000'
  public frontDomain:string = 'https://dailymhc.com'
  public perpose:string = '/mobile/api' //When Upload server make to ''
  public fullDomain = this.domain + this.perpose;
  public adminMailPassword:string = security.adminMailPassword;
  public fcmApiKey:string = security.fcmApiKey;

  dbSetting:setInputInterface = {
    host:  security.sqlHost,
    user: 'root',
    password: security.sqlPassword,
    port: 3306,
    database: security.sqlDB,
  }
  constructor() {}
}
