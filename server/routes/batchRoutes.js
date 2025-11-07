const express = require('express');
const {
  createBatch,
  getBatches,
  getBatch,
  updateBatch,
  deleteBatch,
  getBatchStats
} = require('../controllers/batchController');

const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Routes
router.route('/')
  .get(getBatches)
  .post(createBatch);

router.route('/:id')
  .get(getBatch)
  .put(updateBatch)
  .delete(deleteBatch);

router.get('/stats', getBatchStats);

module.exports = router;
