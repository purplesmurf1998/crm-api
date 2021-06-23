const router = require('express').Router();
const {
    getPortfolios,
    getPortfolio,
    createPortfolio,
    updatePortfolio,
    deletePortfolio
} = require('../controllers/portfolios');
const { protect } = require('../middleware/auth');

// Include other resource routers
const contactRouter = require('./contacts');

// Re-route into other resources
router.use('/:portId/contacts', contactRouter);

router.route('/')
    .get(protect, getPortfolios)
    .post(protect, createPortfolio);

router.route('/:portId')
    .get(protect, getPortfolio)
    .put(protect, updatePortfolio)
    .delete(protect, deletePortfolio)

module.exports = router;