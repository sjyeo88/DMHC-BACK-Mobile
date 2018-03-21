// export interface UserDATA {
//   idPATIENT_USER:[number, undefined],
//   email:string,
//   password:any,
//   password_a:number,
//   password_q:string,
//   name:string,
//   birth:string,
//   phone:string,
//   idJOBS:string,
//   idDEPT:number,
//   status: number,
//   license_path:string,
//   join_date:[string, undefined],
//   last_login_date:string,
//   salt:string,
//   // file:any[]
// }

export interface HASH {
  name: string;
  text: string;
  idEXPERT_USER: number;
}

export interface SBJTS {
  idSBJTS:number,
  idSB_SBJT_CONF:number,
  idPATIENT_USER:number,
  status:number,
  command:string,
  PUSH_TIME:Date,
  REPUSH_TIME:Date,
  result:string,
  ADD_TIME:Date,
  FINISHED_TIME:Date,
  repush:number,
  type:number,
  img_path:string,
  push?:number,
}

export interface SBJTS_READY extends SBJTS {
  idSBJTS_READY:number,
}



export interface SB_SBJT_CONF {
  idSB_SBJT_CONF:number,
  idSBJT_CONF_ALL:number,
  title:string,
  command:string,
  type_create_condition:number,
  conf_create_condition_01:number,
  conf_create_condition_02:number,
  conf_create_condition_03:number,
  conf_create_condition_04:number,
  type_create_num:number,
  conf_create_num_01:number,
  conf_create_num_02:string,
  conf_create_num_03:number,
  conf_push_time_01:string,
  conf_push_time_02:string,
  type_repush_time:number,
  conf_repush_time_01:number,
  type_input:number,
  conf_input_01:number,
  conf_input_02:number,
  conf_input_03:number,
  conf_input_04:string,
  conf_input_05:number,
  type_stop:number,
  conf_stop_01:number,
  conf_stop_02:number,
  type_del:number,
  conf_del_01:number,
  conf_del_02:number,
  idx:number,
}

export interface JOINED_SB_SBJT_CONF extends SB_SBJT_CONF {
  idPATIENT_USER: number;
  idEXPERT_USER:number;
  JOIN_DATE: Date;
}
