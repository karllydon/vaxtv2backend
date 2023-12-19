import { VaxstatsInterface } from "../interfaces/vaxstats";
import { Database } from "./database";
import { Logger } from "../../logger/logger";

const moment = require("moment");

class VaxStats implements VaxstatsInterface {

  public vaxStore: number = 3;
  public carelineStore: number = 15;
  public staffsaleStore: number = 31;


  public getOrderStats = async (source: string) => {
    const logger = new Logger();
    try {
      const db = new Database();
      logger.info("vaxstats::connecting to database");
      const conn = db.CreateConnection(source);
      logger.info("vaxstats::connected");
      let returnArr: any = [];
      logger.info("vaxstats::connected");
      logger.info("vaxstats::querying " + source + " stats");
      return conn
        .raw(
          "SELECT DATE(sfoi.created_at) AS created, " +
            "sfo.status, " +
            "sfo.increment_id, " +
            "sfoi.qty_ordered, " +
            "sfoi.price, " +
            "sfo.base_shipping_amount, " +
            "sfoi.discount_amount, " +
            "sfoi.sku, " +
            "SUM((sfoi.qty_ordered * sfoi.price) + sfo.base_shipping_amount - (sfoi.discount_amount / 1.20)) AS amounts " +
            "FROM magento2_prod.sales_order sfo " +
            "JOIN magento2_prod.sales_order_item sfoi ON sfo.entity_id = sfoi.order_id " +
            "JOIN magento2_prod.catalog_product_entity cpe ON sfoi.sku = cpe.sku " +
            "JOIN magento2_prod.eav_attribute_set eas ON cpe.attribute_set_id = eas.attribute_set_id " +
            "WHERE sfo.created_at >= DATE(NOW()-INTERVAL 1 MONTH) AND NOW() " +
            `AND sfo.store_id IN (${this.vaxStore},${this.carelineStore},${this.staffsaleStore}) ` +
            "AND sfoi.price != '0' " +
            "AND sfo.status NOT IN ('canceled', 'failed', 'holded', 'pending_payment', 'closed', 'fraud') " + 
            "GROUP BY sfo.increment_id, sfoi.sku " +
            "ORDER BY sfo.created_at",
          []
        )
        .then((result: any) => {
          var holder: any = {};
          var dayStart: string = "";
          result[0].forEach((entry: any) => {
            dayStart = moment(entry["created"]).startOf("day").valueOf();
            if (holder.hasOwnProperty(dayStart)) {
              holder[dayStart] =
                holder[dayStart] + parseFloat(entry["amounts"]);
            } else {
              holder[dayStart] = parseFloat(entry["amounts"]);
            }
          });

          var obj2 = [];

          for (var prop in holder) {
            obj2.push({ created: parseInt(prop), amounts: holder[prop] });
          }
          // redis.RedisSet(
          //   "vax-tv:" + source + "-stats-30",
          //   JSON.stringify(obj2)
          // );
          return obj2;
        })
        .catch((err: any) => {
          return { error: "no results found - error" };
        });
    } catch (error) {
      logger.error("Error getting " + source + " stats: " + error);
    }
  };
  public getTodayStats = async (source: string) => {
    const logger = new Logger();
    try {
      const db = new Database();
      logger.info("vaxstats::connecting to database");
      const conn = db.CreateConnection(source);
      logger.info("vaxstats::connected");
      let returnArr: any = [];
      logger.info("vaxstats::connected");
      logger.info("vaxstats::querying " + source + " stats");
      return conn
        .raw(
          "SELECT sfoi.created_at AS created, \n" +
            "sfo.status,\n" +
            "sfo.increment_id,\n" +
            "sfoi.qty_ordered,\n" +
            "sfoi.price,\n" +
            "sfo.base_shipping_amount,\n" +
            "sfoi.discount_amount,\n" +
            "sfoi.sku,\n" +
            "SUM((sfoi.qty_ordered * sfoi.price) + sfo.base_shipping_amount - (sfoi.discount_amount / 1.20)) AS amounts\n" +
            "FROM magento2_prod.sales_order sfo\n" +
            "JOIN magento2_prod.sales_order_item sfoi ON sfo.entity_id = sfoi.order_id\n" +
            "JOIN magento2_prod.catalog_product_entity cpe ON sfoi.sku = cpe.sku\n" +
            "JOIN magento2_prod.eav_attribute_set eas ON cpe.attribute_set_id = eas.attribute_set_id\n" +
            "WHERE DATE(sfo.created_at) >= CURDATE()\n" +
            "AND (sfo.store_id = '3'\n" +
            "OR sfo.store_id = '31'\n" +
            "OR sfo.store_id = '15')\n" +
            "AND sfoi.price != '0'\n" +
            "AND sfo.status NOT LIKE 'canceled'\n" +
            "AND sfo.status NOT LIKE 'failed'\n" +
            "AND sfo.status NOT LIKE 'holded'\n" +
            "AND sfo.status NOT LIKE 'pending_payment'\n" +
            "AND sfo.status NOT LIKE 'closed'\n" +
            "AND sfo.status NOT LIKE 'fraud'\n" +
            "GROUP BY sfo.increment_id, sfoi.sku\n" +
            "ORDER BY sfo.created_at",
          []
        )
        .then((result: any) => {
          var obj: any = [];
          var sum: number = 0;
          obj.push({ created: moment().startOf("day").valueOf(), amounts: 0 });
          result[0].forEach((entry: any) => {
            sum += parseFloat(entry.amounts);
            obj.push({
              created: moment(entry.created).valueOf(),
              amounts: sum,
            });
          });
          // redis.RedisSet(
          //   "vax-tv:" + source + "-stats-today",
          //   JSON.stringify(obj)
          // );
          return obj;
        })
        .catch((err: any) => {
          return { error: "no results found - error" };
        });
    } catch (error) {
      logger.error("Error getting " + source + " stats for today: " + error);
    }
  };

  public getBestsellers = async (source: string) => {
    const logger = new Logger();
    try {
      const db = new Database();
      logger.info("vaxstats::connecting to database");
      const conn = db.CreateConnection(source);
      logger.info("vaxstats::connected");
      let returnArr: any = [];
      logger.info("vaxstats::connected");
      logger.info("vaxstats::querying " + source + " bestsellers");
      return conn
        .raw(
          `SELECT bsy.product_id, bsy.product_name, bsy.store_id, bsy.product_price, bsy.qty_ordered, bsy.rating_pos from magento2_prod.sales_bestsellers_aggregated_yearly bsy WHERE (bsy.period=MAKEDATE(EXTRACT(YEAR FROM CURDATE()),1) AND (bsy.store_id IN (${this.vaxStore},${this.carelineStore},${this.staffsaleStore}))) ORDER BY bsy.rating_pos ASC, bsy.qty_ordered DESC LIMIT 10;`,
          []
        )
        .then((result: any) => {
          logger.info("vaxstats::setting data in redis store");
          result[0].forEach((element: any) => {
            element["product_name"] = element["product_name"].replace("VAX ", "");
            element["product_name"] = element["product_name"].replace("Vax ", "");
          });
          // redis.RedisSet(
          //   "vax-tv:" + source + "-bestsellers",
          //   JSON.stringify(result[0])
          // );
          return result[0];
        })
        .catch((err: any) => {
          return { error: "no results found - error" };
        });
    } catch (error) {
      logger.error("Error getting " + source + " bestsellers: " + error);
    }
  };
}
export { VaxStats };
export { VaxStats as vaxstats };
