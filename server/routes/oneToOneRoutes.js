// server/src/routes/oneToOneRoutes.js
const express = require("express");
const router = express.Router();
const {
  createOneToOne,
  getOneToOne,
  updateOneToOne,
  deleteOneToOne,
} = require("../controllers/oneToOneController");

router.post("/", createOneToOne);
router.get("/", getOneToOne);
router.put("/:id", updateOneToOne);
router.delete("/:id", deleteOneToOne);

module.exports = router;
