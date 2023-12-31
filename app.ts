import * as bodyParser from "body-parser";
import * as express from "express";
import { Logger } from "./logger/logger";
import Routes from "./routes/routes";
import { Cronner } from "./cronner/cronner";
const { auth } = require('express-oauth2-jwt-bearer');


const jwtCheck = auth({
    audience: 'https://ec2-18-132-73-27.eu-west-2.compute.amazonaws.com',
    issuerBaseURL: 'https://dev-yp22o546mmts0j6w.us.auth0.com/',
    tokenSigningAlg: 'RS256'
  });



class App {

    public express: express.Application;
    public logger: Logger;
    public cronner: Cronner;


    // array to hold users
    public users: any[];

    constructor() {
        this.express = express();
        this.middleware();
        this.routes();
        this.users = [];
        this.logger = new Logger();
        this.cronner = new Cronner();
        this.cronner.launch();
    }

    // Configure Express middleware.
    private middleware(): void {
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false }));
        this.express.use(jwtCheck);
        this.express.use(express.static(process.cwd() + "/build/"));
    }

    private routes(): void {

        this.express.get("/", (req, res, next) => {
            res.sendFile(process.cwd() + "/build/index.html");
        });

            // frontend route
        this.express.use("/api/", Routes);

        // handle undefined routes
        this.express.use("*", (req, res, next) => {
            res.send("Make sure url is correct!!!");
        });
    }
}

export default new App().express;
