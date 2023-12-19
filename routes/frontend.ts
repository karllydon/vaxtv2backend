import * as bodyParser from "body-parser";
import * as express from "express";
import { Logger } from "../logger/logger";
import { VaxStats } from "../app/services/vaxstats";
import { PageSpeed } from "../app/services/pageSpeed";
import { Jira } from "../app/services/jira";
import { Google } from "../app/services/google";
import { Crawler } from "../app/services/crawler";

const redis = require('../redisConnection/redisConnection');
const google = new Google();
const crawler = new Crawler();

const axios = require("axios");
const fs = require("fs");
const moment = require("moment");
var cors = require("cors");

const dotenv = require("dotenv");
dotenv.config();

const dbhost = process.env.VAX_DBHOST;
const dbpassword = process.env.VAX_DBPASSWORD;
const dbuser = process.env.VAX_DBUSER;
const db = process.env.VAX_DBNAME;

class Frontend {
  public express: express.Application;
  public logger: Logger;

  // array to hold users
  public pages: any[];

  constructor() {
    this.express = express();
    this.middleware();
    this.routes();
    this.pages = [];
    this.logger = new Logger();
  }

  // Configure Express middleware.
  private middleware(): void {
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));
    this.express.use(
      cors({
        methods: ["AUTHORIZATION", "OPTIONS", "GET", "POST", "DELETE"],
        headers: ["*"],
        origins: ["*"],
        credentials: true,
        optionSuccessStatus: 200,
      })
    );
  }

  private routes(): void {
    this.express.get("/vax_sales_30", cors(), (req, res, next) => {
      this.logger.info("frontend::vax_sales last 30 queried");
      redis
        .get("vax-tv:vax-stats-30")
        .then((response: any) => {
          this.logger.info("frontend:::vax sales last 30 stats attained");
          res.json(JSON.parse(response));
        })
        .catch((error: any) => {
          this.logger.error("could not get vax stats for last 30: " + error);
        });
    });

    this.express.get("/careline_sales_30", cors(), (req, res, next) => {
      this.logger.info("frontend::vax_sales last 30 queried");
      redis
        .get("vax-tv:careline-stats-30")
        .then((response: any) => {
          this.logger.info("frontend:::careline sales last 30 stats attained");
          res.json(JSON.parse(response));
        })
        .catch((error: any) => {
          this.logger.error(
            "could not get careline stats for last 30: " + error
          );
        });
    });

    this.express.get("/vax_sales_today", cors(), async (req, res, next) => {
      this.logger.info("frontend::vax_sales_today queried");
      redis
        .get("vax-tv:vax-stats-today")
        .then((response: any) => {
          this.logger.info("frontend:::vax_sales_today stats attained");
          res.json(JSON.parse(response));
        })
        .catch((error: any) => {
          this.logger.error("could not get vax stats for today: " + error);
        });
    });

    this.express.get(
      "/careline_sales_today",
      cors(),
      async (req, res, next) => {
        this.logger.info("frontend::careline_sales_today queried");
        redis
          .get("vax-tv:careline-stats-today")
          .then((response: any) => {
            this.logger.info("frontend:::careline_sales_today stats attained");
            res.json(JSON.parse(response));
          })
          .catch((error: any) => {
            this.logger.error(
              "could not get careline stats for today: " + error
            );
          });
      }
    );

    this.express.get("/careline_bestsellers", cors(), (req, res, next) => {
      this.logger.info("frontend::careline bestsellers queried");
      redis
        .get("vax-tv:careline-bestsellers")
        .then((response: any) => {
          this.logger.info("frontend:::careline bestsellers attained");
          res.json(JSON.parse(response));
        })
        .catch((error: any) => {
          this.logger.error("could not get careline bestsellers: " + error);
        });
    });

    this.express.get("/page_speed/:url", cors(), (req, res, next) => {
      this.logger.info("frontend::pagespeed queried for url" + req.params.url);
      redis
        .get("vax-tv:page-speed:" + req.params.url)
        .then((response: any) => {
          this.logger.info("frontend:::pagespeed stats attained");
          res.json(response);
        })
        .catch((error: any) => {
          this.logger.error(
            "could not get page speed for url " + req.params.url + ": " + error
          );
        });
    });

    this.express.get("/vax_bestsellers", cors(), (req, res, next) => {
      this.logger.info("frontend::bestsellers queried");
      redis
        .get("vax-tv:vax-bestsellers")
        .then((response: any) => {
          this.logger.info("frontend:::vax bestsellers attained");
          res.json(JSON.parse(response));
        })
        .catch((error: any) => {
          this.logger.error("could not get vax bestsellers: " + error);
        });
    });

    this.express.get("/jira_sprint_details", cors(), async (req, res, next) => {
      this.logger.info("frontend::jira sprint details queried");
      redis
        .get("vax-tv:jira:sprint-details")
        .then((response: any) => {
          this.logger.info("frontend:::jira sprint details stats attained");
          res.json(JSON.parse(response));
        })
        .catch((error: any) => {
          this.logger.error(
            "could not get jira current sprint stats: " + error
          );
        });
    });

    this.express.get(
      "/jira_backlog_details",
      cors(),
      async (req, res, next) => {
        this.logger.info("frontend::jira backlog details queried");
        redis
          .get("vax-tv:jira:backlog-details")
          .then((response: any) => {
            this.logger.info("frontend:::jira backlog details stats attained");
            res.json(JSON.parse(response));
          })
          .catch((error: any) => {
            this.logger.error(
              "could not get jira current backlog stats: " + error
            );
          });
      }
    );

    this.express.get(
      "/jira_dev_open_tickets",
      cors(),
      async (req, res, next) => {
        this.logger.info("frontend::jira dev details queried");
        redis
          .get("vax-tv:jira:dev-tickets")
          .then((response: any) => {
            this.logger.info("frontend:::jira sprint details stats attained");
            res.json(JSON.parse(response));
          })
          .catch((error: any) => {
            this.logger.error(
              "jira::could not get jira dev open tickets stats: " + error
            );
          });
      }
    );
    this.express.get(
      "/jira_dtn_open_tickets",
      cors(),
      async (req, res, next) => {
        this.logger.info("frontend::jira dtn details queried");
        redis
          .get("vax-tv:jira:dtn-tickets")
          .then((response: any) => {
            this.logger.info("frontend:::jira dtn details stats attained");
            res.json(JSON.parse(response));
          })
          .catch((error: any) => {
            this.logger.error(
              "jira::could not get jira dtn open tickets stats: " + error
            );
          });
      }
    );

    this.express.get("/xl", cors(), async (req, res, next) => {
      this.logger.info("frontend::xl data queried");
      redis
        .get("vax-tv:excel-data")
        .then((response: any) => {
          this.logger.info("frontend:::xl data attained");
          res.json(JSON.parse(response));
        })
        .catch((error: any) => {
          this.logger.error("could not get xl data: " + error);
        });
    });

    this.express.get("/jira_burndown", cors(), async (req, res, next) => {
      this.logger.info("frontend::jira burndown details queried");
      redis
        .get("vax-tv:jira:burndown-details")
        .then((response: any) => {
          this.logger.info("frontend:::jira burndown details stats attained");
          res.json(JSON.parse(response));
        })
        .catch((error: any) => {
          this.logger.error(
            "jira::could not get jira burndown stats: " + error
          );
        });
    });

    this.express.get("/xl", cors(), async (req, res, next) => {
      this.logger.info("frontend::xl data queried");
      redis
        .get("vax-tv:excel-data")
        .then((response: any) => {
          this.logger.info("frontend:::xl data attained");
          res.json(JSON.parse(response));
        })
        .catch((error: any) => {
          this.logger.error("could not get xl data: " + error);
        });
    });

    this.express.get("/google", cors(), async (req, res, next) => {
      this.logger.info("frontend::google data queried");
      redis
        .get("vax-tv:google:active-users")
        .then((response: any) => {
          this.logger.info("frontend:::google data attained");
          res.json(JSON.parse(response));
        })
        .catch((error: any) => {
          this.logger.error("could not get google data: " + error);
        });
    });

    this.express.get("/crawler", cors(), async (req, res, next) => {
      this.logger.info("frontend::crawler queried");
      crawler
        .StatusScreenshot()
        .then((result: any) => {
          res.set("Content-Type", "image/png");
          res.send(result);
        })
        .catch((error) => {
          res.json({ message: "error: " + error });
        });
    });

    this.express.get("/screenshot", cors(), async (req, res, next) => {
      this.logger.info("frontend::crawler queried");
      var status = fs.readFileSync("screenshot.png", "base64");
      res.set("Content-Type", "text/plain");
      res.send(`data:image/png;base64,${status}`);
    });

    this.express.get("/usersInfo", cors(), async (req,res,next) =>{
      this.logger.info("frontend::users info queried");
      redis
        .get("vax-tv:info:active-users")
        .then((response: any) => {
          this.logger.info("frontend:::users info data attained");
          res.json(JSON.parse(response));
        })
        .catch((error: any) => {
          this.logger.error("could not get user info data: " + error);
        });
    })

  }

  


}

export default new Frontend().express;
