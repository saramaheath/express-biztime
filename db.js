/** Database setup for BizTime. */

const { Client } = require("pg");
const DB_URI =
  //   process.env.NODE_ENV === "test"
  // ? "postgresql:///biztime_test"
  // : "postgresql:///biztime";
  process.env.NODE_ENV === "test"
    ? "postgresql:///biztime_test"
    : "postgresql://saramaheath:1234@localhost/biztime";

let db = new Client({
  connectionString: DB_URI,
});
db.connect();
module.exports = db;
