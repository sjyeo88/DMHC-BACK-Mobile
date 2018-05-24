import * as schedule from 'node-schedule';
import * as DBI from '../interfaces/userdata.interface'
import request = require("request");
import { ServerConfig } from "../configure/config"
let mysql = require('mysql');
let schedule = require('node-schedule');


enum GenTiming {
  Daily,
  Weekly,
  Monthly,
}

enum InputType {
  simpleInput,    //0
  recordInput,    //1
  selectInput,    //2
  dailyActivity,  //3
  weeklyActivity, //4
  tableInput,     //5
  lecture,        //6
  survey,         //7
}

export class SubjectManger {
  private dbcon
  public testHashes = []
  public config = new ServerConfig()
  constructor(conn) {
    this.dbcon = conn
    console.log('Assign schduler is started at ' + new Date().toISOString())
    // this.applySubject();
    // this.getNowInDB();
    schedule.scheduleJob('0 0 2 * * *', ()=>{ this.genAssignByDaily() });
    schedule.scheduleJob('0 0 3 1 * *', ()=>{ this.genAssignByMonthly() });
    schedule.scheduleJob('0 0 4 * * 0', ()=>{ this.genAssignByWeekly() });
    schedule.scheduleJob('0 */15 * * * *',()=>{ this.applySubject() });
    schedule.scheduleJob('0 */10 * * * *', ()=>{ this.delAssignByNum(); });
    schedule.scheduleJob('0 */10 * * * *', ()=>{ this.delAssignByTime() });
  }


  public genAssignByDaily() {
    Promise.all([this.getSubjectConfigure(GenTiming.Daily), this.getSubjects()])
    .then(datas =>{ return this.subjectFilter(datas); })
    .then(configs =>{ return this.genSubjects(configs) })
    .then(sbjts=>{ this.insertSbjtReady(sbjts); return sbjts})
    .then(sbjts=>{ console.log(sbjts.length + ' Assigns are generated at ' + new Date() + ' daily. '); })
  }

  public genAssignByWeekly() {
    Promise.all([this.getSubjectConfigure(GenTiming.Weekly), this.getSubjects()])
    .then(datas =>{ return this.subjectFilter(datas); })
    .then(configs =>{return this.genSubjects(configs) })
    .then(sbjts=>{ this.insertSbjtReady(sbjts); return sbjts})
    .then(sbjts=>{ console.log(sbjts.length + ' Assigns are generated at ' + new Date() + ' weekly. '); })
    .catch(err=>{ console.log(err); })
  }

  public genAssignByMonthly() {
    Promise.all([this.getSubjectConfigure(GenTiming.Monthly), this.getSubjects()])
    .then(datas =>{ return this.subjectFilter(datas); })
    .then(configs =>{return this.genSubjects(configs) })
    .then(sbjts=>{ this.insertSbjtReady(sbjts); return sbjts })
    .then(sbjts=>{ console.log(sbjts.length + ' Assigns are generated at ' + new Date() + ' monthly. '); })
    .catch(err=>{ console.log(err); })

  }

  public genAssignNowAll(idPATIENT_USER) {
    console.log('works?')
    Promise.all([this.getSubjectConfigurePerson(idPATIENT_USER), this.getSubjects()])
    .then(datas =>{  return this.subjectFilter(datas);  })
    .then(configs =>{ ; return this.genSubjects(configs, true) })
    .then(sbjts=>{ this.insertSubjects(sbjts); return sbjts })
    .catch(err=>{ console.log(err); })
  }

  public delAssignByTime() {
    Promise.all([this.getSubjectConfigure(), this.getSubjects(), ])
    .then(sbjts=>{ return this.sbjtDelFilterByTime(sbjts) })
    .then(sbjts=>{ this.delSbjts(sbjts); return sbjts })
    .then(sbjts => { console.log(sbjts.length + ' Assigns are deleted at ' + new Date() + 'by time'); })
    .catch(err=>{ console.log(err); })
  }

  public delAssignByNum () {
    Promise.all([this.getSubjectConfigure(), this.getUnFinishedSbjt(), ])
    .then(datas =>{ return this.sbjtDelFilterByNum(datas)})
    .then(sbjts => { this.delSubjtsByNum(sbjts); return sbjts })
    .then(sbjts => { console.log(sbjts.length + ' Assigns are deleted at ' + new Date() + 'by number'); })
    .catch(err=>{ console.log(err); })
  }

  public applySubject() {
    this.getPendingSubjects()
    .then(sbjts=>{
      this.insertSubjects(sbjts);
      return sbjts
    })
    .then(sbjts=>{
      this.delSbjtReady(sbjts);
      return sbjts
    })
    .then(sbjts=>{
      this.pushProvider(this.genPushInfo(sbjts));
      console.log(' Assigns are pushed at ' + new Date());
    })
    .catch(err=>{ console.log(err); })
  }

  public getNowInDB() {
    let Q:string = 'SELECT NOW()'
    this.dbcon.query(Q, (err, result)=>{
      if(err) {
        console.log(Q);
        console.log(err);
      } else {
        console.log(result)
      }
    })
  }

  public getSubjectConfigure(opt?):Promise<DBI.JOINED_SB_SBJT_CONF[]> {
    return new Promise((resolve, reject)=>{
      let Q:string = ' SELECT PATIENT_USER.JOIN_DATE, PATIENT_USER.idPATIENT_USER, SB_SBJT_CONF.* ,PATIENT_USER.idEXPERT_USER FROM PATIENT_USER '
      + ' JOIN SB_SBJT_CONF ON SB_SBJT_CONF.idSBJT_CONF_ALL = PATIENT_USER.idSBJT_CONF_ALL '
      if(opt !== undefined) {
        Q += ' WHERE SB_SBJT_CONF.type_create_num = ' + mysql.escape(opt);
      }
      this.dbcon.query(Q, (err, result)=>{
        if(err) {
          console.log(Q);
          console.log(err);
        } else {
          resolve(result);
        }
      })
    })
  }

  public getSubjectConfigurePerson(idPATIENT_USER):Promise<DBI.JOINED_SB_SBJT_CONF[]> {
    return new Promise((resolve, reject)=>{
      let Q:string = ' SELECT PATIENT_USER.JOIN_DATE, PATIENT_USER.idPATIENT_USER, SB_SBJT_CONF.* ,PATIENT_USER.idEXPERT_USER FROM PATIENT_USER '
      + ' JOIN SB_SBJT_CONF ON SB_SBJT_CONF.idSBJT_CONF_ALL = PATIENT_USER.idSBJT_CONF_ALL '
      + ' WHERE PATIENT_USER.idPATIENT_USER = ' + mysql.escape(idPATIENT_USER);
      this.dbcon.query(Q, (err, result)=>{
        if(err) {
          console.log(Q);
          console.log(err);
        } else {
          resolve(result);
        }
      })
    })
  }

  public subjectFilter(values:[DBI.JOINED_SB_SBJT_CONF[], any[]]):Promise<DBI.JOINED_SB_SBJT_CONF[]> {
    return new Promise((resolve, reject)=>{
      let totSubjects = values[0];
      let totSbjs = values[1];
      let today = new Date();
      resolve(
        totSubjects.filter(confObj=>{
          let firstAssignDate:Date = this.getFirstAssignDate(confObj.idSB_SBJT_CONF, confObj.idPATIENT_USER, totSbjs);
          let finishedAssignNum:number = this.getFinishedNumber(confObj.idSB_SBJT_CONF, confObj.idPATIENT_USER, totSbjs);
          let stopCondition:boolean = true;
          if((confObj.type_stop === 1) &&  //제시 후 N일 경과 했을때 Gen Stop
            ((today.getTime() - firstAssignDate.getTime()) > 1000*3600*24*confObj.conf_stop_01)) {
              stopCondition = false
          } else if ((confObj.type_stop === 2) &&
                    (finishedAssignNum > confObj.conf_stop_02)) { //N개 완료했을 때 Gen Stop
              stopCondition = false
          }
          switch(confObj.type_create_condition) {
            case 0: //내담자 과제 등록 시 과제 생성
              return true && stopCondition ;
            case 1: //지정된 날짜 이후로 과제 생성
              let tgtDate = confObj.JOIN_DATE;
              tgtDate.setDate(tgtDate.getDate() + confObj.conf_create_condition_01);
              return new Date().getTime() > tgtDate.getTime() ? true && stopCondition  : false;
            case 2: //내담자 전체 과제 지정된 횟 수 이상 수행 후 해당 과재 생성
              return totSbjs.filter(sbObj=>{
                return (sbObj.status === 1) && (confObj.idPATIENT_USER === sbObj.idPATIENT_USER);
              }).length >= confObj.conf_create_condition_01 && stopCondition
            case 3: //내담자 지정된 과제 지정된 횟 수 이상 수행 후 해당 과재 생성
              {
                let numEndSubject = totSbjs.filter(sbObj=>{
                  return (confObj.idPATIENT_USER === sbObj.idPATIENT_USER)
                  && (sbObj.idSBJT_CONF_ALL === confObj.conf_create_condition_04)
                  && (sbObj.status === 1);
                }).length
                return numEndSubject >= confObj.conf_create_condition_01 && stopCondition;
              }
          }
        })
      )
    })
  }

  public sbjtDelFilterByTime(values:[DBI.JOINED_SB_SBJT_CONF[], any[]]):Promise<DBI.SBJTS[]> {
    return new Promise((resolve, reject)=>{
      let totSubjects = values[0];
      let totSbjs = values[1];
      let today = new Date();
      resolve(totSbjs.filter((sbjtObj, idx, self)=>{
        let tgtConf = this.tgtSbjtConf(sbjtObj.idSB_SBJT_CONF, totSubjects)
        if(tgtConf && tgtConf.type_del === 2) {
          if(((today.getTime() - sbjtObj.PUSH_TIME.getTime()) > 1000*3600*24*tgtConf.conf_del_02)) {
            return true;
          }
        }
      }))
    })
  }

  public sbjtDelFilterByNum(values:[DBI.JOINED_SB_SBJT_CONF[], any[]]):Promise<{idSB_SBJT_CONF:number, idPATIENT_USER:number ,delNum:number}[]> {
    return new Promise((resolve, reject)=>{
      let totSubjects = values[0];
      let totSbjs = values[1];
      let today = new Date();
      let result:{idSB_SBJT_CONF:number, idPATIENT_USER:number ,delNum:number}[] = [];
      totSbjs.forEach(obj=>{
        let tgtConf = this.tgtSbjtConf(obj.idSB_SBJT_CONF, totSubjects)
        if(tgtConf && tgtConf.type_del === 1) {
          if(obj.count > tgtConf.conf_del_01) {
            result.push({idSB_SBJT_CONF:obj.idSB_SBJT_CONF, idPATIENT_USER:obj.idPATIENT_USER ,delNum:(obj.count - tgtConf.conf_del_01)});
          }
        }
      })
      resolve(result);
    })
  }

  public tgtSbjtConf(idSB_SBJT_CONF, totSubjects):DBI.JOINED_SB_SBJT_CONF {
    return totSubjects.filter(obj=>{
      return obj.idSB_SBJT_CONF === idSB_SBJT_CONF
    })[0]
  }

  public getFirstAssignDate(idSB_SBJT_CONF, idPATIENT_USER, subjtes:DBI.SBJTS[]) {
    let result = subjtes.filter(obj =>{
      return (obj.idSB_SBJT_CONF === idSB_SBJT_CONF) && (obj.idPATIENT_USER === idPATIENT_USER)
    })[0]
    return result ? result.PUSH_TIME : new Date();
  }

  public getFinishedNumber(idSB_SBJT_CONF, idPATIENT_USER, subjtes:DBI.SBJTS[]) {
    let result = subjtes.filter(obj =>{
      return ((obj.status === 3) || (obj.status === 1)) &&
      (obj.idSB_SBJT_CONF === idSB_SBJT_CONF) &&
      (obj.idPATIENT_USER === idPATIENT_USER)
    })
    return result ? result.length : 0;
  }

  public delSubjtsByNum(delSubjts:{idSB_SBJT_CONF:number, idPATIENT_USER:number ,delNum:number}[]) {
    delSubjts.forEach(obj=> {
      let Q:string = ' UPDATE SBJTS ';
      Q += ' INNER JOIN (SELECT idSBJTS FROM SBJTS '
      Q += ' WHERE idSB_SBJT_CONF = ' + mysql.escape(obj.idSB_SBJT_CONF) + ' AND ';
      Q += ' idPATIENT_USER = ' + mysql.escape(obj.idPATIENT_USER) + ' AND ';
      Q += ' SBJTS.status = ' + mysql.escape(0)
      Q += ' ORDER BY PUSH_TIME ASC LIMIT ' + mysql.escape(obj.delNum)  + ' ) '
      Q += ' AS ranked ON SBJTS.idSBJTS = ranked.idSBJTS SET SBJTS.status = 2;'
        this.dbcon.query(Q, (err, result)=>{
          if(err) {
            console.log(Q);
            console.log(err)
          } else {
            // console.log(result);
            // Promise.resolve(result);
          }
        })
    })
  }

  public getUnFinishedSbjt():Promise<{idSBJTS:number, idSB_SBJT_CONF:number, idPATIENT_USER:number, count:number}[]> {
    return new Promise((resolve, reject)=>{
      let Q:string = ' SELECT idSBJTS, idSB_SBJT_CONF, idPATIENT_USER, '
      Q += ' COUNT(idSB_SBJT_CONF) as count FROM DMHC.SBJTS '
      Q += ' WHERE status = 0 GROUP BY idSB_SBJT_CONF, idPATIENT_USER; ';
      this.dbcon.query(Q, (err, result)=>{
        if(err) {
          reject(err);
          console.log(Q);
          console.log(err)
        } else {
          resolve(result)
        }
      })
    })
  }

  public getSubjects():Promise<{idPATIENT_USER:number, status:number}[]> {
    return new Promise((resolve, reject)=>{
      let Q:string = ' SELECT '
      + ' SBJTS.idPATIENT_USER, SBJTS.status, SBJTS.idSB_SBJT_CONF, SB_SBJT_CONF.idSBJT_CONF_ALL, PUSH_TIME FROM SBJTS '
      + ' JOIN SB_SBJT_CONF ON SBJTS.idSB_SBJT_CONF = SB_SBJT_CONF.idSB_SBJT_CONF '
      + ' ORDER BY SBJTS.PUSH_TIME ASC '
      this.dbcon.query(Q, (err, result)=>{
        if(err) {
          reject(err);
          console.log(Q);
          console.log(err)
        } else {
          resolve(result)
        }
      })
    })
  }

  public getDelSubjects():Promise<{idPATIENT_USER:number, status:number}[]> {
    return new Promise((resolve, reject)=>{
      let Q:string = ' SELECT '
      + ' SBJTS.idPATIENT_USER, SBJTS.status, SBJTS.idSB_SBJT_CONF, SB_SBJT_CONF.idSBJT_CONF_ALL, PUSH_TIME FROM SBJTS '
      + ' JOIN SB_SBJT_CONF ON SBJTS.idSB_SBJT_CONF = SB_SBJT_CONF.idSB_SBJT_CONF '
      + ' GROUP BY SBJTS.idSB_SBJT_CONF '
      this.dbcon.query(Q, (err, result)=>{
        if(err) {
          reject(err);
          console.log(Q);
          console.log(err)
        } else {
          resolve(result)
        }
      })
    })
  }

  public getPendingSubjects():Promise<DBI.SBJTS_READY[]> {
    return new Promise((resolve, reject)=>{
      let Q:string = ' SELECT SBJTS_READY.*, PATIENT_USER.push FROM SBJTS_READY ';
      Q += ' JOIN PATIENT_USER ON SBJTS_READY.idPATIENT_USER = PATIENT_USER.idPATIENT_USER '
      Q += ' WHERE PUSH_TIME > ' + mysql.escape(new Date(new Date().getTime()-30*1000).toISOString());
      Q += ' AND PUSH_TIME < ' + mysql.escape(new Date(new Date().getTime()+30*1000).toISOString());
      this.dbcon.query(Q, (err, result)=>{
        if(err) {
          reject(err);
          console.log(Q);
          console.log(err)
        } else {
          resolve(result)
        }
      })
    })
  }

  public getFcmToken(idPATIENT_USER):Promise<string> {
    return new Promise((resolve, reject)=>{
      let Q:string = ' SELECT fcm_token FROM PATIENT_USER'
      + ' WHERE idPATIENT_USER = ' + mysql.escape(idPATIENT_USER)
      this.dbcon.query(Q, (err, result)=>{
        if(err) {
          reject(err);
          console.log(Q);
          console.log(err)
        } else {
          resolve(result[0].fcm_token)
        }
      })
    })
  }

  public insertSbjtReady(sbjtsReady:DBI.SBJTS_READY[]) {
      sbjtsReady.forEach(obj =>{
        this.getExpertUser(obj.idPATIENT_USER)
        .then(idEXPERT_USER=>{
          return this.genCommands(obj.command, idEXPERT_USER)
        })
        .then(command =>{
          obj.command = command;
          let Q:string = " INSERT INTO SBJTS_READY SET ? "
          this.dbcon.query(Q, obj, (err, result)=>{
            if(err) {
              console.log(err);
              console.log(Q);
            } else {
              // console.log(result);
            }
          })
        })
      })
  }

  public delSbjtReady(sbjts:DBI.SBJTS_READY[]) {
      sbjts.forEach(obj =>{
        let Q:string = " DELETE FROM SBJTS_READY "
        + ' WHERE idSBJTS_READY = ' + mysql.escape(obj.idSBJTS_READY)
        this.dbcon.query(Q, obj, (err, result)=>{
          if(err) {
            console.log(err);
            console.log(Q);
          } else {
            // obj.idSBJTS_READY = null;
          }
        })
      })
  }

  public delSbjts(sbjts:DBI.SBJTS[]) {
    sbjts.forEach(obj =>{
        let Q:string = " UPDATE SBJTS SET status = " + mysql.escape(2)
        + ' WHERE idSBJTS = ' + mysql.escape(obj.idSBJTS)
        this.dbcon.query(Q, obj, (err, result)=>{
          if(err) {
            console.log(err);
            console.log(Q);
          } else {
            // console.log(result);
          }
        })
    })
  }

  public insertSubjects(sbjtsReady:DBI.SBJTS_READY[]) {
      sbjtsReady.forEach(obj =>{
        this.getExpertUser(obj.idPATIENT_USER)
        .then(idEXPERT_USER=>{
          return this.genCommands(obj.command, idEXPERT_USER)
        })
        .then(command=>{
          let sbjts:DBI.SBJTS = {
            idSBJTS:undefined,
            idSB_SBJT_CONF:obj.idSB_SBJT_CONF,
            idPATIENT_USER:obj.idPATIENT_USER,
            status:obj.status,
            command:command,
            PUSH_TIME:obj.PUSH_TIME,
            REPUSH_TIME:obj.PUSH_TIME,
            result:'',
            ADD_TIME:obj.ADD_TIME,
            FINISHED_TIME:obj.FINISHED_TIME,
            repush:obj.repush,
            type:obj.type,
            img_path:'',
          }
          let Q:string = " INSERT INTO SBJTS SET ? "
          this.dbcon.query(Q, sbjts, (err, result)=>{
            if(err) {
              console.log(err);
              console.log(Q);
            } else {
              // console.log(result);
            }
          })
        })
      })
  }

  public genSubjects(configs:DBI.JOINED_SB_SBJT_CONF[], now?:boolean):Promise<DBI.SBJTS_READY[]> {
    let target:DBI.SBJTS_READY[] = [];
    let moment = new Date();
    return new Promise((resolve, reject)=>{
      let genDays:Array<Date> = [];
      configs.forEach(obj=>{
        let subjectNum = obj.conf_create_num_01;
        let genTimeType = obj.type_create_num;
        switch(genTimeType) {
          case GenTiming.Daily:
            genDays = [moment]
          break;
          case GenTiming.Weekly:
            genDays = this.getNowWeekday(JSON.parse(obj.conf_create_num_02))
          break;
          case GenTiming.Monthly:
            let lastDay = new Date(moment.getFullYear(), moment.getMonth()+1, 0).getDate()
            let confDay = obj.conf_create_num_03;
            if(confDay > lastDay) {
              genDays = [new Date(moment.getFullYear(), moment.getMonth(), lastDay)];
            } else {
              genDays = [new Date(moment.getFullYear(), moment.getMonth(), confDay)];
            }
          break;
          default:
            genDays = [];
          break;
        }
        genDays.forEach(day=>{
          for(let i = 0; i < subjectNum; i++) {
            let timeOpt = {
              fromTime:new Date(obj.conf_push_time_01),
              toTime:new Date(obj.conf_push_time_02),
              genday: day,
            }
            let pushTime = this.getPushTime(timeOpt)
            if(now) {
              pushTime = new Date(moment.getTime()-9*3600*1000);
            }

            if(pushTime.getTime() >= moment.getTime()-9*3600*1000) {
              target.push({
                idSBJTS_READY:undefined,
                idSBJTS:undefined,
                idSB_SBJT_CONF:obj.idSB_SBJT_CONF,
                idPATIENT_USER:obj.idPATIENT_USER,
                status:0,
                command: obj.command,
                PUSH_TIME:pushTime,
                REPUSH_TIME:pushTime,
                result:'',
                ADD_TIME: new Date(moment.getTime()-9*3600*1000),
                FINISHED_TIME:undefined,
                repush:obj.type_repush_time,
                type:this.getAssignType(obj.type_input),
                img_path:'',
              })
            }
          }
        })
      })
      resolve(target);
    })
  }


  public genPushInfo(sbjts:DBI.SBJTS[]) {
    let tgtPush = []
    sbjts.filter(obj=>{ return obj.push === 1})
    .forEach((obj, idx, self)=>{
      let item = {
        idPATIENT_USER: obj.idPATIENT_USER,
        length: self.filter(oobj=>{ return obj.idPATIENT_USER === oobj.idPATIENT_USER}).length
      }
      // console.log(checkAvailability(tgtPush, item), item);
      if(checkAvailability(tgtPush, item)) {
        tgtPush.push(item);
      }
    })

    function checkAvailability(arr, val:Object) {
      return arr.every(function(arrVal) {
          return JSON.stringify(val)!== JSON.stringify(arrVal);
      });
    }
    return tgtPush;
  }

  public pushProvider(pushInfo) {
    pushInfo.forEach(obj => {
      this.getFcmToken(obj.idPATIENT_USER)
      .then(token=>{
        let msg = { "to" : token,
         "collapse_key" : "type_a",
         "notification" : {
             "body" : "과제 " + obj.length + ' 개 가 도착했습니다. ',
             "sound": "default",
             "title": "새 과제가 도착했습니다.",
             "badge":"1",
             "click_action":"fcm.ACTION.HELLO"
         },
         "content_available": false,
         "priority":"high"
        }
        request.post({
          url: 'https://fcm.googleapis.com/fcm/send',
          headers: {
            'Authorization':'key=' + this.config.fcmApiKey,
            'Content-type':'application/json'
          },
          body: JSON.stringify(msg),
        })
      })
    });
  }



  public getAssignType(inputType):number {
    switch(inputType) {
      case InputType.simpleInput:
        return 0;
      case InputType.dailyActivity:
        return 0;
      case InputType.weeklyActivity:
        return 0;
      case InputType.tableInput:
        return 0;
      case InputType.lecture:
        return 2;
      case InputType.survey:
        return 1;
      default:
        return 0;
    }
  }

  getPushTime(times:{fromTime:Date, toTime:Date, genday:Date}) {
    let timeList:Array<Date> = [];
    let result:Date;
    let fromTime = new Date(
      times.genday.getFullYear(),
      times.genday.getMonth(),
      times.genday.getDate(),
      times.fromTime.getHours(),
      times.fromTime.getMinutes(),
      times.fromTime.getSeconds(),
    ).getTime()

    let toTime = new Date(
      times.genday.getFullYear(),
      times.genday.getMonth(),
      times.genday.getDate(),
      times.toTime.getHours(),
      times.toTime.getMinutes(),
      times.toTime.getSeconds(),
    ).getTime()

    if(fromTime !== toTime) {
      for(let i=fromTime; i < toTime; i+=1000*60*15) {
        timeList.push(new Date(i))
      }
    } else {
      timeList.push(new Date(fromTime))
    }

    let idx = Math.floor(Math.random() * (timeList.length - 0) + 0)
    return timeList[idx];
  }

  getNowWeekday(dayConfig:Array<number>):Array<Date> {
    const currentDay = new Date();
    const theYear = currentDay.getFullYear();
    const theMonth = currentDay.getMonth();
    const theDate  = currentDay.getDate();
    const theDayOfWeek = currentDay.getDay();

    let thisWeek = [];

    for(var i=0; i<7; i++) {
      let resultDay = new Date(theYear, theMonth, theDate + (i - theDayOfWeek));
      let yyyy = resultDay.getFullYear().toString();
      let mm = (resultDay.getMonth() + 1).toString();
      let dd = (resultDay.getDate()).toString();

      mm = mm.length === 1 ? '0' + mm : mm;
      dd = dd.length === 1 ? '0' + dd : dd;
      if(dayConfig.indexOf(i) >= 0) {
        thisWeek.push(new Date(yyyy + '-' + mm + '-' + dd))
      }
    }
    return thisWeek
  }

  getHash(hash:string, idEXPERT_USER:number):Promise<any> {
    let result = []
    let Q:string  = ' SELECT HASH_SUB.text FROM HASH_TREE INNER JOIN HASH_SUB ON HASH_TREE.dece = HASH_SUB.idHASH ';
    Q += ' WHERE ance = (SELECT idHASH FROM HASH WHERE name = ' + mysql.escape(hash)  + ' AND '
    Q += ' idEXPERT_USER = '+ mysql.escape(idEXPERT_USER) + '); '
    return new Promise(resolve =>{
      this.dbcon.query(Q, (err, result)=>{
        if(err) {
          console.log(err);
          console.log(Q);
        } else {
          if(result.length > 0) {
            return resolve({value: result[Math.floor(Math.random() * (result.length - 0) + 0)].text, type:true})
          } else {
            return resolve({value:hash, type:true})
          }
        }
      })
    })
  }

  getExpertUser(idPATIENT_USER:number):Promise<number> {
    let result = []
    let Q:string  = ' SELECT idEXPERT_USER FROM PATIENT_USER WHERE idPATIENT_USER = ' + mysql.escape(idPATIENT_USER)
    return new Promise(resolve =>{
      this.dbcon.query(Q, (err, result)=>{
        if(err) {
          console.log(err);
          console.log(Q);
        } else {
          return resolve(result[0].idEXPERT_USER)
        }
      })
    })
  }

  genCommands(command:string, idEXPERT_USER:number):Promise<string> {
    let parseCom = command.split(' ');
    return Promise.all(parseCom.map(obj =>{
      if(/^#/.test(obj)) {
        return this.getHash(obj, idEXPERT_USER);
      } else {
        return {value:obj + ' ', type:false};
      }
    }))
    .then(values=>{
      let hashIdx = values.reduce((prev, cu, idx)=>{
        if(cu.type) prev.push(idx);
        return prev;
      }, [])

      hashIdx.forEach(obj=>{
        let nextObj = values[obj+1]
        if(nextObj) {
          let hashObj = values[obj];
          // let nextWord = nextObj.value;
          this.josaChanger({hash: hashObj, josa:nextObj});
        }
      })
      return values.map(obj=>{ return obj.value }).join('');
    })
    .then(command=>{
      return command;
    })
    .catch(obj=>{
      return command;
    })
  }

  josaChanger(wordSet) {
    let code = wordSet.hash.value.charCodeAt(wordSet.hash.value.length-1) - 44032;
    let josaTable = [
      //전철, 과자
      ['을', '를'],
      ['이', '가'],
      ['은', '는'],
      ['과', '와'],
      ['이란', '란'],
      ['이든지', '든지'],
      ['이나마', '나마'],
      ['이야말로', '야말로'],
    ]

    if(code < 0 || code >11171) return null;
    if(code % 28 === 0) {
      //받침 없음
      josaTable.forEach(obj=>{
        wordSet.josa.value = wordSet.josa.value.replace(RegExp(obj[0]), obj[1]);
      })
    } else {
      //받침 있음
      josaTable.forEach(obj=>{
        wordSet.josa.value = wordSet.josa.value.replace(RegExp(obj[1]), obj[0]);
      })
    }
    // console.log(word, josa);

  }
}
