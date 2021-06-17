const router = require('express').Router();
const {
    register,
    login,
    getUsers
} = require('../controllers/auth');
const { protect, authorize } = require('../middleware/auth');

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/users').get(protect, authorize('admin'), getUsers);

module.exports = router;
