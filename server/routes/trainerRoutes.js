const express = require('express');
const {
  createTrainer,
  getTrainers,
  getTrainer,
  updateTrainer,
  deleteTrainer
} = require('../controllers/trainerController');

const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Routes
router.route('/')
  .get(getTrainers)
  .post(createTrainer);

router.route('/:id')
  .get(getTrainer)
  .put(updateTrainer)
  .delete(deleteTrainer);

module.exports = router;
