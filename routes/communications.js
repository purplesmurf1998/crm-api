const router = require('express').Router();
const {
    getCommunications,
    createCommunication
} = require('../controllers/communications');
const { protect } = require('../middleware/auth');

router.route('/')
    .get(protect, getCommunications)
    .post(protect, createCommunication);

module.exports = router;