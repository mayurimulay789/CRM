const express = require("express");
const router = express.Router();
const {
  createOnlineDemo,
  getAllOnlineDemos,
  updateOnlineDemo,
  deleteOnlineDemo,
} = require("../controllers/onlineDemoController");

router.post("/", createOnlineDemo);
router.get("/", getAllOnlineDemos);
router.put("/:id", updateOnlineDemo);
router.delete("/:id", deleteOnlineDemo);

module.exports = router;
