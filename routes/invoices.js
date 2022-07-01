"use strict";

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

/** queries invoice from database,
 * takes invoice id param
 * returns json response like: 
 * {invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}}
 */

router.get("/:id", async function (req, res) {
  const id = parseInt(req.params.id, 10);
  const iResults = await db.query(
    `SELECT id, amt, paid, add_date, paid_date, comp_code
           FROM invoices
           WHERE id = $1`,
    [id]
  );
  const invoice = iResults.rows[0];

  if (!invoice) {
    throw new NotFoundError(`no matching company with id: ${id}`);
  }
  const cResults = await db.query(
    `SELECT code, name, description
           FROM companies
           WHERE code = $1
           `,
    [invoice.comp_code]
  );

  const company = cResults.rows[0];
  delete invoice.comp_code;
  invoice["company"] = company;

  return res.json({ invoice });
});

/** adds an invoice to the database
 * takes json body like: {comp_code, amt},
 * returns json response like: {invoice: 
 * {id, comp_code, amt, paid, add_date, paid_date}}
 */

router.post("/", async function (req, res){
  const { comp_code, amt } = req.body;
  const results = await db.query(
    `INSERT INTO invoices (comp_code, amt)
          VALUES ($1, $2)
          RETURNING id, comp_code, amt, paid, add_date, paid_date `,
          [comp_code, amt]
  );
  const invoice = results.rows[0]
  return res.json({ invoice });
})


module.exports = router;
