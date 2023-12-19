import * as http from "http";
import App from "./app";
import { Logger } from "./logger/logger";
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');

const port = process.env.API_PORT || 3000;

App.set("port", port);
App.use(cors({
    methods: ['AUTHORIZATION', 'OPTIONS', 'GET','POST','DELETE'],
    headers: ['*'],
    origin: ['*'],
    credentials: true,
    optionSuccessStatus:200
}))

const server = http.createServer(App);
server.listen(port);

const logger = new Logger();
server.on("listening", function(): void {
    const addr = server.address();
    const bind = (typeof addr === "string") ? `pipe ${addr}` : `port ${addr.port}`;
    logger.info(`Listening on ${bind}`);
 });

module.exports = App;
