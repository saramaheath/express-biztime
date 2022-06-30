"use strict"

const express = require("express");
const { NotFoundError, BadRequestError } = require("../expressError");

const router = new express.Router();
const db = require("../db");

/** queries all invoices from database,
 * returning json response like: {invoices: [{id, comp_code}, ...]}
 */
 router.get("/", async function (req, res) {
  const results = await db.query(
    `SELECT id, comp_code
            FROM invoices
            ORDER BY id`
  );
  const invoices = results.rows;
  return res.json({ invoices });
});

/** queries one invoice from database,
 * takes an invoice id,
 * returns json response like:
 * {
 * invoice:
 * {id, amt, paid, add_date, paid_date, company: {code, name, description}
 * }
 */
//  router.get("/:id", async function (req, res) {
//   const id = parseInt(req.params.id,10);
//   console.log('*********************************',id);
//   const results = await db.query(
//     `SELECT id, amt, paid, add_date, paid_date, code, name, description
//             FROM invoices JOIN company
//             WHERE comp_code = $1`,
//     [id]
//   );
//   console.log('*********************************',results.row[0]);
//   const invoice = results.rows[0];
//   if (!invoice) {
//       throw new NotFoundError(`no matching invoice with code: ${id}`);
//   }

//   return res.json({ invoice });
// });

/** Get message: {id, msg tags: [name, name]} */

router.get("/:id", async function (req, res) {
  const id = parseInt(req.params.id,10);
  const iResults = await db.query(
    `SELECT id, amt, paid, add_date, paid_date, comp_code
           FROM invoices
           WHERE id = $1`, [id]);
  const invoice = iResults.rows[0];
  debugger

  const cResults = await db.query(
    `SELECT code, name, description
           FROM companies
           WHERE name = $1
           `, [invoice.comp_code]);
  // message.tags = tResults.rows.map(r => r.tag);
  const company = cResults.rows[0];



  return res.json({ invoice, company});
});
// Returns {
  // invoice: {id, amt, paid, add_date, paid_date,
// company: {code, name, description}
// }






module.exports = router;
