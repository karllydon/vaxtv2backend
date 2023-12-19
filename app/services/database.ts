import { DatabaseInterface } from "../interfaces/database";

const mysql2 = require("mysql2");
let dbselector: string;
const knex = require("knex");

class Database implements DatabaseInterface {
  public CreateConnection = (sourcename: string) => {
    switch (sourcename) {
      case "vax":
        dbselector = "VAX";
        break;
      case "careline":
        dbselector = "CARELINE";
        break;
      case "oreck":
        dbselector = "ORECK";
        break;

      default:
        console.log("no source db specified");
    }
    console.log({
      port: process.env[dbselector + "_DBPORT"] || 3306,
      host: process.env[dbselector + "_DBHOST"],
      user: process.env[dbselector + "_DBUSER"],
      password: process.env[dbselector + "_DBPASSWORD"],
      database: process.env[dbselector + "_DBNAME"],
    });
    return knex({
      client: "mysql2",
      connection: {
        port: process.env[dbselector + "_DBPORT"] || 3306,
        host: process.env[dbselector + "_DBHOST"],
        user: process.env[dbselector + "_DBUSER"],
        password: process.env[dbselector + "_DBPASSWORD"],
        database: process.env[dbselector + "_DBNAME"],
      },
    });
  };

  public query = (sql: string, params: object) => {
    return new Promise((resolve, reject) => {
      knex.raw(sql, params, (response: any, err: any) => {
        if (process.env.NODE_ENV === "development") {
          console.log(sql, params);
        }
        if (err) reject(err);
        resolve(response);
      });
    });
  };
}

export { Database };
