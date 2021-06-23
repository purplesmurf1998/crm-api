const router = require('express').Router();
const {
    register,
    login,
    getUsers,
    verify,
    logout
} = require('../controllers/auth');
const { protect, authorize } = require('../middleware/auth');

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/users').get(protect, authorize('admin'), getUsers);
router.route('/verify').get(verify);

module.exports = router;
