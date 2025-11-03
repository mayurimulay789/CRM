const express = require("express");
const router = express.Router();
const {
  createOfflineDemo,
  getOfflineDemos,
  updateOfflineDemo,
  deleteOfflineDemo,
} = require("../controllers/offlineDemoController");

router.post("/", createOfflineDemo);
router.get("/", getOfflineDemos);
router.put("/:id", updateOfflineDemo);
router.delete("/:id", deleteOfflineDemo);

module.exports = router;
