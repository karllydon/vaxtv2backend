import { pageSpeedInterface } from "../interfaces/pageSpeed";
import axios from "axios";
import { Logger } from "../../logger/logger";

const dotenv = require("dotenv");
dotenv.config();

const PSURL = process.env.GOOGLEPAGESPEEDURL;

class PageSpeed implements pageSpeedInterface {
  public getPageSpeed = (url: string) => {
    const logger = new Logger();
    var config = {
      method: "get",
      url: PSURL + url,
      headers: {},
    };
    logger.info("pagespeed::getting pagespeed details for " + url);
    return axios(config)
      .then((response: any) => {
        logger.info("pagespeed::pagespeed details received for " + PSURL + url);
        var dataString: string = JSON.stringify(response.data);
        logger.info("pagespeed::setting data in redis store");
        // redis.RedisSet("vax-tv:page-speed:" + url, dataString);
        logger.info("pagespeed::redis store set");
        return response.data;
      })
      .catch((error) => {
        logger.error(
          "pagespeed::Error getting pagespeed details for " + url + ": " + error
        );
      });
  };
}

export { PageSpeed };
