const router = require('express').Router();
const {
    getPortfolios,
    getPortfolio,
    createPortfolio,
    updatePortfolio,
    deletePortfolio
} = require('../controllers/portfolios');
const { protect } = require('../middleware/auth');

router.route('/')
    .get(protect, getPortfolios)
    .post(protect, createPortfolio);

router.route('/:id')
    .get(protect, getPortfolio)
    .put(protect, updatePortfolio)
    .delete(protect, deletePortfolio)

module.exports = router;