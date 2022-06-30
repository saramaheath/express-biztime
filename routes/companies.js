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
            FROM companies
            ORDER BY name`
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

  const company = results.rows[0];
  if (!company) {
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
  if(!code || !name || !description){
    throw new BadRequestError(`must have code, name and description`);
  }

  const result = await db.query(
    `INSERT INTO companies (code, name, description)
             VALUES ($1, $2, $3)
             RETURNING code, name, description`,
    [code, name, description]
  );
  const company = result.rows[0];

  return res.status(201).json({ company });
});

module.exports = router;

/** edit existing company in database,
 * takes json body like: {name, description},
 * returns json response like: {company: {code, name, description}}
 */
router.put("/:code", async function (req, res) {
  const { name, description } = req.body;
  const code = req.params.code;
  const result = await db.query(
    `UPDATE companies
        SET name = $1,
            description = $2
        WHERE code = $3
        RETURNING code, name, description`,
    [name, description, code]
  );
  const company = result.rows[0];
  if (!company) {
      throw new NotFoundError(`no matching company with code: ${code}`);
  }

  return res.json({ company });
});

/** deletes existing company in database,
 * takes company code param
 * returns json response {status: "deleted"}
 */
router.delete("/:code", async function (req, res) {
  const code = req.params.code;
  const result = await db.query(
    `DELETE 
        FROM companies
        WHERE code = $1
        RETURNING code`,
    [code]
  );
  const codeResult = result.rows[0];
  if (!codeResult) {
      throw new NotFoundError(`no matching company with code: ${code}`);
  }

  return res.json({ status: "deleted" });
});
