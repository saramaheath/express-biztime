"use strict";

const express = require("express");
const { NotFoundError, BadRequestError } = require("../expressError");

const router = new express.Router();
const db = require("../db");

/** queries all companies from database, 
 * returning json response like: {companies: [{code, name}, ...]}
 */
router.get("/", async function (req, res) {
  const results = await db.query(
    `SELECT code, name 
            FROM companies`
  );
  const companies = results.rows;
  return res.json({ companies });
});

/** queries one company from database,
 * takes a company code,
 * returns json response like: {company: {code, name, description}}
 */
router.get("/:code", async function (req, res) {
  const code = req.params.code;
  const results = await db.query(
    `SELECT code, name, description 
            FROM companies
            WHERE code = $1`,
    [code]
    );
    const company = results.rows;
    if (company.length === 0) {
        throw new NotFoundError(`no matching company with code: ${code}`);
}
  return res.json({ company });
});

/** adds a company to database, 
 * takes json body like: {code, name, description}
 * returns json response like: {company: {code, name, description}}  
 * */
router.post("/", async function (req, res) {
    const { code, name, description } = req.body;

    const result = await db.query(
      `INSERT INTO companies (code, name, description)
             VALUES ($1, $2, $3)
             RETURNING code, name, description`,
      [code, name, description],
    );
    const company = result.rows[0];
    return res.status(201).json({ company })
})

module.exports = router;
