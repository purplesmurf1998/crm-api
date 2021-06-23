const router = require('express').Router();
const {
    getCommunications,
    createCommunication,
    getCommunication,
    updateCommunication,
    deleteCommunication
} = require('../controllers/communications');
const { protect } = require('../middleware/auth');

// Include other resource routers
const contactRouter = require('./contacts');

// Re-route into other resources
router.use('/:commId/contacts', contactRouter);

router.route('/')
    .get(protect, getCommunications)
    .post(protect, createCommunication);

router.route('/:commId')
    .get(protect, getCommunication)
    .put(protect, updateCommunication)
    .delete(protect, deleteCommunication);

module.exports = router;