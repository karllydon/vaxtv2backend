import { CrawlerInterface } from "../interfaces/crawler";
const dotenv = require("dotenv");
dotenv.config();

const puppeteer = require("puppeteer");

class Crawler implements CrawlerInterface {
  public async StatusScreenshot() {
    try {
      const URL = "https://stats.uptimerobot.com/22yYGuKpqV";
      const browser = await puppeteer.launch({
        headless: true,
        executablePath: "/usr/bin/google-chrome",
        args: ["--no-sandbox", "disable-gpu", "--disabled-setupid-sandbox"],
      });
      const page = await browser.newPage();
      await page.setViewport({
        width: 1920,
        height: 1200,
      });
      await page.goto(URL);
      await page.$eval(
        "#password-input",
        (el: any) => (el.value = 'welovestats@vax')
      );
      await page.click("button[type=submit]");
      await page.waitForNavigation();
      await page.waitForNetworkIdle();
      const shotBuffer = await page.screenshot({ path: "screenshot.png" });
      await browser.close();
      return shotBuffer;
    } catch (error) {
      console.error(error);
    }
  }
}

export { Crawler };
