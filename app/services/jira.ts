import { JiraInterface } from "../interfaces/jira";
import axios from "axios";
import { Logger } from "../../logger/logger";

const dotenv = require("dotenv");
dotenv.config();

const email = process.env.JIRAEMAIL;
const token = process.env.JIRATOKEN;

const auth = "Basic " + Buffer.from(email + ":" + token).toString("base64");

const moment = require("moment");

class Jira implements JiraInterface {
  public getJira = (
    status: string = null,
    developer: string = null,
    current_sprint: boolean = false
  ) => {
    const logger = new Logger();
    logger.info("jira::getting jira details");
    var jiraUrl =
      "https://ttifc.atlassian.net/rest/api/2/search?jql=project=FloorCare";
    if (current_sprint) {
      jiraUrl = jiraUrl + "+and+sprint+in+openSprints()";
    }
    if (status) {
      jiraUrl = jiraUrl + "+and+status=" + status;
    }
    if (developer) {
      jiraUrl = jiraUrl + "+and+assignee=" + developer;
    }
    logger.info("jira::querying jira");
    var config = {
      method: "get",
      url: jiraUrl + "&maxResults=0",
      headers: {
        Authorization: auth,
      },
    };

    axios(config)
      .then((response) => {
        logger.info("jira::jira details received");
        // redis.RedisSet(
        //   "vax-tv:jira:" + current_sprint
        //     ? "current:"
        //     : "all-sprints:" + developer + status
        //     ? ":" + status
        //     : null,
        //   dataString
        // );
        return response.data["total"];
      })
      .catch((error) => {
        logger.error("jira::Error retrieving data from jira: " + error);
      });
  };

  public getJiraJQL = (jql: string) => {
    //convenience function for getting tickets
    const logger = new Logger();

    logger.info("jira::getting jira details");
    var jiraUrl =
      "https://ttifc.atlassian.net/rest/api/2/search?jql=project=FloorCare+and+" +
      jql;

    logger.info("jira::querying jira");
    var config = {
      method: "get",
      url: jiraUrl + "&maxResults=0",
      headers: {
        Authorization: auth,
      },
    };

    return axios(config)
      .then((response) => {
        logger.info("jira::jira details received");
        return response.data;
      })
      .catch((error) => {
        logger.error("jira::Error retrieving data from jira: " + error);
      });
  };

  public getCurrentSprintDetails = () => {
    const logger = new Logger();

    logger.info("jira::getting jira details");
    var jiraUrl =
      "https://ttifc.atlassian.net/rest/greenhopper/latest/integration/teamcalendars/sprint/list?jql=project=FloorCare%20AND%20sprint%20IN%20openSprints()%20AND%20sprint%20NOT%20IN%20futureSprints()%20AND%20sprint%20NOT%20IN%20closedSprints()";

    logger.info("jira::querying jira for current sprint id");
    var config = {
      method: "get",
      url: jiraUrl,
      headers: {
        Authorization: auth,
      },
    };

    return axios(config)
      .then((response) => {
        var sprintID = response.data["sprints"][0]["id"];
        logger.info("jira::got current sprint id");
        var config = {
          method: "get",
          url: "https://ttifc.atlassian.net/rest/agile/1.0/sprint/" + sprintID,
          headers: {
            Authorization: auth,
          },
        };
        logger.info("jira::querying current sprint details");
        return axios(config)
          .then((response) => {
            // redis.RedisSet("vax-tv:jira:sprint-details", dataString);
            return response.data;
          })
          .catch((error: any) => {
            logger.error("jira::could not query current details: " + error);
          });
      })
      .catch((error) => {
        logger.error(
          "jira::Error retrieving current sprint id from jira: " + error
        );
      });
  };

  public getDeveloperOpenTickets = async () => {
    const logger = new Logger();
    var devs = [
      "Karl Lydon",
      "Richard Locke",
      "Ludmila Bogdan",
      "Jonathan Saxelby",
    ];
    var outArr: any = [];
    var result: any = {};
    for (const dev of devs) {
      logger.info("jira::querying tickets for " + dev);
      result = await this.getJiraJQL(
        '(status="To Do"+or+status="In Progress")+and+sprint+in+openSprints()+and+assignee="' +
          dev +
          '"&maxResults=0'
      );
      result["name"] = dev;
      outArr.push(result);
    }

    result = await this.getJiraJQL(
      '(status="To Do"+or+status="In Progress")+and+sprint+in+openSprints()+and+assignee+is+EMPTY'
    );
    result["name"] = "Unassigned";
    await outArr.push(result);
    return outArr;
  };
  public getDtnOpentickets = async () => {
    const logger = new Logger();
    var devs = [
      "Hanna Nguyen",
      "Helen Pham",
      "Hoan Ha",
      "Larry",
      "Mike Mai",
      "Shane",
      "Ted Nguyen",
      "thomas",
    ];
    var outArr: any = [];
    var result: any = {};
    for (const dev of devs) {
      logger.info("jira::querying tickets for " + dev);
      result = await this.getJiraJQL(
        '(status="To Do"+or+status="In Progress")+and+sprint+in+openSprints()+and+assignee="' +
          dev +
          '"&maxResults=0'
      );
      result["name"] = dev;
      outArr.push(result);
    }
    return outArr;
  };

  public getBacklogTickets = async () => {
    const logger = new Logger();

    logger.info("jira::getting jira details");
    var jiraUrl =
      "https://ttifc.atlassian.net/rest/agile/1.0/board?name=VB Board";

    logger.info("jira::querying jira for current sprint id");
    var config = {
      method: "get",
      url: jiraUrl,
      headers: {
        Authorization: auth,
      },
    };

    return axios(config)
      .then((response) => {
        var boardID = response.data["values"][0]["id"];
        logger.info("jira::got current sprint id");
        var config = {
          method: "get",
          url:
            "https://ttifc.atlassian.net/rest/agile/1.0/board/" +
            boardID +
            "/backlog?maxResults=0&fields=total",
          headers: {
            Authorization: auth,
          },
        };
        logger.info("jira::querying current backlog details");
        return axios(config)
          .then((response) => {
            logger.info("jira::current backlog details received");
            // var dataString = JSON.stringify(response.data);
            // redis.RedisSet("vax-tv:jira:backlog-details", dataString);
            return response.data;
          })
          .catch((error: any) => {
            logger.error("jira::could not query backlog details: " + error);
          });
      })
      .catch((error) => {
        logger.error(
          "jira::Error retrieving current board id from jira: " + error
        );
      });
  };
  public getBurndownData() {
    const logger = new Logger();
    logger.info("jira::getting jira details");

    //first get current sprint id

    var config = {
      method: "get",
      url: "https://ttifc.atlassian.net/rest/greenhopper/latest/integration/teamcalendars/sprint/list?jql=project=FloorCare%20AND%20sprint%20IN%20openSprints()%20AND%20sprint%20NOT%20IN%20futureSprints()%20AND%20sprint%20NOT%20IN%20closedSprints()",
      headers: {
        Authorization: auth,
      },
    };

    return axios(config)
      .then((res) => {
        var jiraUrl =
          "https://ttifc.atlassian.net/rest/api/2/search?jql=project='FloorCare'&maxResults=5000&expand=changelog&fields=timeoriginalestimate, timeestimate, customfield_10020";

        logger.info("jira::querying jira for burndown details");

        var config = {
          method: "get",
          url: jiraUrl,
          headers: {
            Authorization: auth,
          },
        };
        var sprintID = res.data.sprints[0].id;
        return axios(config).then((response) => {
          logger.info("jira::got burndown chart details");
          var holder: any = {};
          var outArr = [];
          response.data.issues.forEach((entry: any) => {
            // check if issue in current sprint (cf 10020 is sprint details )
            if (
              entry["fields"]["customfield_10020"] != null &&
              entry["fields"]["customfield_10020"][0]["state"] == "active"
            ) {
              entry.changelog.histories.forEach((history: any) => {
                history.items.forEach((item: any) => {
                  if (item["field"] == "timeestimate") {
                    var from = item["from"]
                      ? parseFloat(item["from"]) / (60 * 60)
                      : 0;
                    var to = item["to"]
                      ? parseFloat(item["to"]) / (60 * 60)
                      : 0;
                    if (
                      holder.hasOwnProperty(
                        moment(history["created"]).startOf("day").valueOf()
                      )
                    ) {
                      holder[
                        moment(history["created"]).startOf("day").valueOf()
                      ]["timeestimate"] =
                        holder[
                          moment(history["created"]).startOf("day").valueOf()
                        ]["timeestimate"] +
                        to -
                        from; //add to estimate
                    } else {
                      holder[
                        moment(history["created"]).startOf("day").valueOf()
                      ] = {}; //have to initialize obj if doesnt exist
                      holder[
                        moment(history["created"]).startOf("day").valueOf()
                      ]["timeestimate"] = to - from; //give as estimate if not there
                    }
                  }

                  if (item["field"] == "timespent") {
                    var from = item["from"]
                      ? parseFloat(item["from"]) / (60 * 60)
                      : 0;
                    var to = item["to"]
                      ? parseFloat(item["to"]) / (60 * 60)
                      : 0;

                    if (
                      holder.hasOwnProperty(
                        moment(history["created"]).startOf("day").valueOf()
                      )
                    ) {
                      holder[
                        moment(history["created"]).startOf("day").valueOf()
                      ]["timespent"] = holder[
                        moment(history["created"]).startOf("day").valueOf()
                      ]["timespent"]
                        ? holder[
                            moment(history["created"]).startOf("day").valueOf()
                          ]["timespent"] +
                          to -
                          from
                        : to - from; //add to estimate
                    } else {
                      holder[
                        moment(history["created"]).startOf("day").valueOf()
                      ]["timespent"] = to - from; //give as estimate if not there
                    }
                  }
                });
              });
            } //issue not in current sprint (but may have been removed )
            else {
              // check over changelog for if issue has been removed from current sprint
              entry.changelog.histories.forEach((history: any) => {
                history.items.forEach((item: any) => {
                  if (
                    item["field"] == "Sprint" &&
                    item["from"].includes(sprintID)
                  ) {
                    //if true item has been removed from current sprint so est time has to be calculated
                    if (
                      holder.hasOwnProperty(
                        moment(history["created"]).startOf("day").valueOf()
                      )
                    ) {
                      holder[
                        moment(history["created"]).startOf("day").valueOf()
                      ]["timeestimate"] =
                        holder[
                          moment(history["created"]).startOf("day").valueOf()
                        ]["timeestimate"] -
                        parseFloat(entry["fields"]["timeestimate"]) / (60 * 60);
                    } else {
                      holder[
                        moment(history["created"]).startOf("day").valueOf()
                      ] = {};
                      holder[
                        moment(history["created"]).startOf("day").valueOf()
                      ]["timeestimate"] =
                        0 -
                        parseFloat(entry["fields"]["timeestimate"]) / (60 * 60); //give as estimate if not there
                    }
                  }
                });
              });
            }
          });

          var sorted: any = {};
          sorted = Object.keys(holder)
            .sort()
            .reduce((acc: any, key): any => {
              acc[key] = holder[key];
              return acc;
            }, {});

          var obj2: any = [];
          for (var prop in sorted) {
            // push to array
            obj2.push({
              created: prop,
              estimated_hours: sorted[prop]["timeestimate"],
              timespent: sorted[prop]["timespent"],
            });
          }
          // var dataString = JSON.stringify(obj2);
          // redis.RedisSet("vax-tv:jira:burndown-details", dataString);
          return obj2;
        });
      })
      .catch((error: any) => {
        console.log("failed getting jira sprint id: ", error);
      });
  }

  public getRoadMap() {
    const logger = new Logger();
    logger.info("jira::getting jira details");
    var jiraUrl =
      "https://ttifc.atlassian.net/rest/agile/1.0/board?name=VB Board";

    logger.info("jira::querying jira for current sprint id");
    var config = {
      method: "get",
      url: jiraUrl,
      headers: {
        Authorization: auth,
      },
    };

  }



}

export { Jira };
