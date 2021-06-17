const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc        Register new user
// @route       POST /api/v1/auth/register
// @access      Public
exports.register = asyncHandler(async (req, res, next) => {
    const { name, email, password, role } = req.body;

    // Create new user
    const user = await User.create({
        name,
        email,
        password,
        role
    });

    sendTokenResponse(user, 200, res);
});

// @desc        Login existing user
// @route       POST /api/v1/auth/login
// @access      Public
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
        return next(new ErrorResponse('Please provice an email and a password', 400));
    }

    // Validate user exists
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Validate right password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    sendTokenResponse(user, 200, res);
});

// @desc        Get the list of all users
// @route       GET /api/v1/auth/users
// @access      Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
    const users = await User.find();
    res.status(200).json({ success: true, data: users });
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create user jwt token
    const token = user.getSignedJwtToken();
    // Create cookie
    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 1000 * 60),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }
    
    res.status(statusCode).cookie('token', token, options).json({ success: true, token });
}