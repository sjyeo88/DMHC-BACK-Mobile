import * as express from "express";
let router = express.Router();
import fs = require("fs")
import { ServerConfig } from "../configure/config"



module.exports = function(app):express.Router{
//Need to adding type of 'app'
  let config = new ServerConfig()
  let path =require("path");
    router.get(
    //Get Registered Jobs
    "/:userid/license_img",
    (req:express.Request, res:express.Response) => {
      let id = req.params.userid;
      let imgPath = path.join(config.assetPath, 'userfiles', id, 'license_img');
      fs.readFile(imgPath, (err, data) => {
        if(err) { res.status(404) }
        else {
          res.writeHead(200, { 'Content-Type': 'image/*' });
          res.end(data);
        }
      })
    })
    router.get(
    //Get Registered Jobs
    "/:userid/license.tmp",
    (req:express.Request, res:express.Response) => {
      let id = req.params.userid;
      let imgPath = path.join(config.assetPath, 'userfiles', id, 'license_img.tmp');
      fs.readFile(imgPath, (err, data) => {
        if(err) { res.status(404) }
        else {
          res.writeHead(200, { 'Content-Type': 'image/*' });
          res.end(data);
        }
      })
    })
    router.get(
    //Get Registered Jobs
    "/dmhc_logo",
    (req:express.Request, res:express.Response) => {
      let id = req.params.userid;
      let imgPath = path.join(config.assetPath, 'img', 'dmhc_logo.png');
      fs.readFile(imgPath, (err, data) => {
        if(err) { res.status(404).send(err) }
        else {
          res.writeHead(200, { 'Content-Type': 'image/*' });
          res.end(data);
        }
      })
    })

    router.get(
    //Get Registered Jobs
    "/tmp/:img",
    (req:express.Request, res:express.Response) => {
      let id = req.params.userid;
      let imgPath = path.join(config.assetPath, 'img', 'tmp', req.params.img);
      fs.readFile(imgPath, (err, data) => {
        if(err) { res.status(404).send(err) }
        else {
          res.writeHead(200, { 'Content-Type': 'image/*' });
          res.end(data);
        }
      })
    })

    router.get(
    //Get Registered Jobs
    "/",
    (req:express.Request, res:express.Response) => {
        res.send('Test')
      })

    return router;
}
