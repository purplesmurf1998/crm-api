const router = require('express').Router();
const {
    getCommunications,
    createCommunication,
    getCommunication,
    updateCommunication,
    deleteCommunication
} = require('../controllers/communications');
const { protect } = require('../middleware/auth');

router.route('/')
    .get(protect, getCommunications)
    .post(protect, createCommunication);

router.route('/:id')
    .get(protect, getCommunication)
    .put(protect, updateCommunication)
    .delete(protect, deleteCommunication);

module.exports = router;