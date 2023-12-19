import {writeFileSync} from 'fs';
const dotenv = require('dotenv');
dotenv.config();

const debug = process.env.DEBUG;
const debugFlag = debug == '1'? true: false;
const debugLog = process.env.DEBUGLOG;
const debugLogFlag = debugLog == '1'? true: false;
const errorLog = process.env.ERRORLOG;
const errorLogFlag = errorLog == '1'? true: false;

export class Logger {
    
    public info(logText: string): void {
        console.log(new Date() + "info:::::" + logText);
    }

    public debug(logText: string): void {
        if (debugFlag){
            console.log(new Date() + "debug:::::" + logText);
        }
        if(debugLogFlag){
            writeFileSync('./logger/debug.log', new Date() + "debug:::::" + logText + "\n", {flag: 'a'});
        }
    }

    public error(logText: string): void {
        console.log(new Date() + "error:::::" + logText);
        if (errorLogFlag){
            writeFileSync('./logger/error.log', new Date() + "error:::::" + logText + "\n", {flag: 'a'});
        }
    }
}