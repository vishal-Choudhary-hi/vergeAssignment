const cron = require("node-cron");
const sql = require("mssql");
const puppeteer = require("puppeteer");
const ObjectsToCsv = require("objects-to-csv");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const moment = require("moment");
// const config = {
//   user: "<user name>",
//   password: "<password>",
//   server: "<your SQL server name>.database.windows.net",
//   port: 1433,
//   database: "test",
//   connectionTimeout: 3000,
//   parseJSON: true,
//   options: {
//     encrypt: true,
//     enableArithAbort: true
//   },
//   pool: {
//     min: 0,
//     idleTimeoutMillis: 3000
//   }
// };
// const pool = new sql.ConnectionPool(config);
// const poolConnect = pool.connect();

// router.get('/', async function (req, res) {

//   await poolConnect;
//   try {
//     const request = pool.request();
//     const result = await request.query('select 1 as number')
//     console.log(result);
//     res.json(result.recordset);

// } catch (err) {
//     console.error('SQL error', err);
//     res.send(err);
// }
// });
cron.schedule("* * * * *", () => {
  (async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://www.theverge.com/");

    const articles = await page.$$(
      "div.duet--content-cards--content-card.relative.flex.flex-row.border-b.border-solid.border-gray-cc.px-0.last-of-type\\:border-b-0.dark\\:border-gray-31.py-16.hover\\:bg-\\[\\#FBF9FF\\]"
    );
    const data = await Promise.all(
      articles.map(async (article, index) => {
        const headline = await article.$eval(
          ".inline.pr-4.text-16.font-bold.md\\:text-17",
          (el) => el.textContent.trim()
        );
        const url = await article.$eval("a", (el) => el.href);
        const author = await article.$eval(
          ".relative.z-10.mr-8.font-bold.hover\\:shadow-underline-inherit",
          (el) => el.textContent.trim()
        );
        const date = await article.$eval(
          ".flex.items-center.font-normal",
          (el) => el.textContent.trim()
        );
        return {
          id: uuidv4(),
          URL: url,
          headline,
          author,
          date,
        };
      })
    );
    await browser.close();
    console.log(data);
    // const fileName = moment().format("DDMMYYYY") + "_verge.csv";
    // const csv = new ObjectsToCsv(data);
    // await csv.toDisk(fileName, { append: fs.existsSync(fileName) });

    // console.log(`Data saved to ${fileName}`);
  })();
});
