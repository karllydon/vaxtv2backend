const cron = require("node-cron");
const https = require("https");

import { Logger } from "../logger/logger";
import { VaxStats } from "../app/services/vaxstats";
import { PageSpeed } from "../app/services/pageSpeed";
import { Jira } from "../app/services/jira";
import { XlsImport } from "../app/services/xlsImport";
import { Google } from "../app/services/google";
import { Crawler } from "../app/services/crawler";

var redis = require("../redisConnection/redisConnection");
redis.connect();

export class Cronner {
  agent: object;
  requestArr: string[];
  logger: Logger;

  constructor() {
    this.agent = new https.Agent({
      rejectUnauthorized: false,
    });
    this.logger = new Logger();
  }

  public launch = () => {
    this.queryDB();
    this.queryDBToday();
    this.queryBestSellers();
    this.queryPageSpeeds();
    this.queryCurrSprint();
    this.queryUsersInfo();
    this.queryDevTickets();
    this.importXl();
    this.queryStatus();

    cron.schedule("*/1 * * * *", () => {
      this.queryDBToday();
      this.queryPageSpeeds();
    });

    cron.schedule("*/30 * * * *", () => {
      this.queryUsersInfo();
      this.queryStatus();
      this.queryDevTickets();
    });

    cron.schedule("0 12 */1 * *", () => {
      this.queryDB();
      this.queryBestSellers();
      this.queryCurrSprint();
      this.importXl();
    });
  };
  public queryDB = async () => {
    let vaxstats = new VaxStats();
    let response: any = await vaxstats.getOrderStats("vax");
    this.logger.info("cronner::redis setting vax stats 30");
    await redis.set("vax-tv:vax-stats-30", JSON.stringify(response));
    this.logger.info("cronner::redis set vax stats 30");
    let response2 = await vaxstats.getOrderStats("careline");
    this.logger.info("cronner::redis setting careline stats 30");
    await redis.set("vax-tv:careline-stats-30", JSON.stringify(response2));
    this.logger.info("cronner::redis set careline stats 30");
  };

  public queryDBToday = async () => {
    let vaxstats = new VaxStats();
    let response: any = await vaxstats.getTodayStats("vax");
    this.logger.info("cronner::redis setting vax stats today");
    await redis.set("vax-tv:vax-stats-today", JSON.stringify(response));
    this.logger.info("cronner::redis set vax stats today");

    let response2: any = await vaxstats.getTodayStats("careline");
    this.logger.info("cronner::redis setting careline stats today");
    await redis.set("vax-tv:careline-stats-today", JSON.stringify(response2));
    this.logger.info("cronner::redis set careline stats today");
  };

  public queryBestSellers = async () => {
    let vaxstats = new VaxStats();
    let response = await vaxstats.getBestsellers("vax");
    this.logger.info("cronner::redis setting vax bestsellers");
    await redis.set("vax-tv:vax-bestsellers", JSON.stringify(response));
    this.logger.info("cronner::redis set vax bestsellers");
    let response2: any = await vaxstats.getBestsellers("careline");
    this.logger.info("cronner::redis setting careline bestsellers");
    await redis.set("vax-tv:careline-bestsellers", JSON.stringify(response2));
    this.logger.info("cronner::redis set careline bestsellers");
  };

  public queryPageSpeeds = async () => {
    let pagespeeds = new PageSpeed();
    let response = await pagespeeds.getPageSpeed("www.oreck.co.uk");
    this.logger.info("cronner::redis setting page speeds");
    await redis.set(
      "vax-tv:page-speed:www.oreck.co.uk",
      JSON.stringify(response)
    );
    this.logger.info("cronner::redis set page speeds");
  };

  public queryCurrSprint = async () => {
    let jira = new Jira();
    let response = await jira.getCurrentSprintDetails();
    this.logger.info("cronner::redis setting current sprint details");
    await redis.set("vax-tv:jira:sprint-details", JSON.stringify(response));
    this.logger.info("cronner::redis set current sprint details");

    let response2 = await jira.getBacklogTickets();
    this.logger.info("cronner::redis setting backlog tickets");
    await redis.set("vax-tv:jira:backlog-details", JSON.stringify(response2));
    this.logger.info("cronner::redis set backlog tickets");

    let response3 = await jira.getBurndownData();
    this.logger.info("cronner::redis setting burndown details");
    await redis.set("vax-tv:jira:burndown-details", JSON.stringify(response3));
    this.logger.info("cronner::redis set burndown details");
  };
  public queryDevTickets = async () => {
    let jira = new Jira();
    let response = await jira.getDeveloperOpenTickets();
    this.logger.info("cronner::redis setting dev tickers");
    await redis.set("vax-tv:jira:dev-tickets", JSON.stringify(response));
    this.logger.info("cronner::redis set dev tickets");

    let response2 = await jira.getDtnOpentickets();
    this.logger.info("cronner::redis setting dtn tickets");
    await redis.set("vax-tv:jira:dtn-tickets", JSON.stringify(response2));
    this.logger.info("cronner::redis set dtn tickets");
  };
  public importXl = async () => {
    let xl = new XlsImport();
    let response = await xl.getXlsData();
    this.logger.info("cronner::redis setting xl");
    await redis.set("vax-tv:excel-data", JSON.stringify(response));
    this.logger.info("cronner::redis set xl");
  };
  public queryGoogle = async () => {
    let google = new Google();
    let response = await google.getGA();
    this.logger.info("cronner::redis setting google");
    await redis.set("vax-tv:google:active-users", JSON.stringify(response));
    this.logger.info("cronner::redis set google");
  };
  public queryStatus = async () => {
    let crawler = new Crawler();
    await crawler.StatusScreenshot();
  };

  public queryUsersInfo = async () =>{
    let info = new Google();
    let response = await info.getUsersInfo();
    this.logger.info("cronner::redis setting google");
    await redis.set("vax-tv:info:active-users", JSON.stringify(response));
    this.logger.info("cronner::redis set google");
  }


}
