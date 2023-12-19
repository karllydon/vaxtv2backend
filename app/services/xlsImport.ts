import { XlsImportInterface } from "../interfaces/xlsImport";
import { Logger } from "../../logger/logger";

const XLSX = require("xlsx");
const dotenv = require("dotenv");
dotenv.config();

const moment = require('moment')

const XLSFNAME = process.env.EXCELFILENAME;

class XlsImport implements XlsImportInterface {
  public getXlsData() {
    const logger = new Logger();
    logger.info("xlsimport::getting xls data for file " + XLSFNAME);
    var workbook = XLSX.readFile(XLSFNAME);
    logger.info("xlsimport:: xls data received");
    var sheet_name_list = workbook.SheetNames;
    var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], { header: 1});
    xlData = xlData.map((cellRow: Array<String>) => ({"created": moment(cellRow[0], 'DD-MM').startOf('day').valueOf(), "forecast_amount": cellRow[1]}))
    // var dataString = JSON.stringify(xlData);
    // redis.RedisSet("vax-tv:excel-data", dataString);
    return xlData;
  }
}

export { XlsImport };
