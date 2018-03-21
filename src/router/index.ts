import * as express from "express";
let router = express.Router();

/* GET home page. */
module.exports = function(app):express.Router{
  router.get("/", (req:express.Request, res:express.Response) => {
    res.send('매일마음건강-API!');
  });
  return router
}
