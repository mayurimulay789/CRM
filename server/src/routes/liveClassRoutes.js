const express = require("express");
const { 
  getLiveClasses, 
  addLiveClass, 
  updateLiveClass, 
  deleteLiveClass 
} = require("../controllers/liveClassController");

const router = express.Router();

router.get("/", getLiveClasses);
router.post("/", addLiveClass);
router.put("/:id", updateLiveClass);
router.delete("/:id", deleteLiveClass);

module.exports = router;
