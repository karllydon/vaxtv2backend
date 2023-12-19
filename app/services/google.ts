import { GoogleInterface } from "../interfaces/google";
import { Logger } from "../../logger/logger";
import axios from "axios";

const { google } = require("googleapis");
const dotenv = require("dotenv");

dotenv.config();

const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: "https://www.googleapis.com/auth/analytics",
});

google.options({ auth: auth });
const analyticsdata = google.analyticsdata("v1beta");

class Google implements GoogleInterface {
  public getGA = async () => {
    const logger = new Logger();
    logger.info("google::getting activeuser details");
    const users = await analyticsdata.properties.runRealtimeReport({
      property: "properties/"+process.env.GOOGLE_PROPERTY,
      // Request body metadata
      requestBody: {
        // request body parameters
        dimensions: [{ name: "country" }],
        metrics: [{ name: "activeUsers" }],
      },
    });
    const conversions = await analyticsdata.properties.runRealtimeReport({
      property: "properties/"+process.env.GOOGLE_PROPERTY,
      // Request body metadata
      requestBody: {
        // request body parameters
        dimensions: [{ name: "country" }],
        metrics: [{ name: "conversions" }],
      },
    });
    var totalUsers = 0;
    var totalConversions = 0;
    users["data"]["rows"].forEach((entry: any) => {
      totalUsers = totalUsers + parseInt(entry["metricValues"][0]["value"]);
    });
    conversions["data"]["rows"].forEach((entry: any) => {
      totalConversions =
        totalConversions + parseInt(entry["metricValues"][0]["value"]);
    });

    var res: any = [totalUsers, (totalConversions / totalUsers) * 100];
    logger.info("google::details attained");
    logger.info("google::setting in redis store");
    // redis.RedisSet("vax-tv:google:active-users", JSON.stringify(res));
    return res;
  };

  public getDynatrace = async () => {
    const token = process.env.DYNATRACE_TOKEN;
    const config = {
      method: "get",
      url: process.env.DYNATRACE_URL + '/userSessionQueryLanguage/table?query=SELECT%20count(ip), count(useraction.matchingConversionGoals)%20FROM%20usersession%20WHERE%20usertype="REAL_USER"%20AND%20startTime>=$NOW-DURATION("1h")%20AND%20endTime<=$NOW%20LIMIT%205000',
      headers: { Authorization: "Api-Token " + token },
    };
    return axios(config)
      .then((response) => {
        if (response.status == 200) {
          return [
            response.data["values"][0][0],
            (response.data["values"][0][1] / response.data["values"][0][0]) *
              100,
          ]; // [ user , conversion rate]
        }
      })
      .catch((error: any) => {
        return [];
      });
  };

  public getUsersInfo = async () => {
    const googleResults = await this.getGA();
    const dynatraceResults = await this.getDynatrace();
    return {
      googleUsers: googleResults[0],
      googleConversionRate: Math.round(googleResults[1] * 100) / 100,
      dynatraceUsers: dynatraceResults[0],
      dynatraceConversionRate: Math.round(dynatraceResults[1] * 100) / 100,
    };
  };
}

export { Google };
