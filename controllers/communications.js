const Communication = require('../models/Communication');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc        Get all communications
// @route       GET /api/v1/communications
// @access      Private
exports.getCommunications = asyncHandler(async (req, res, next) => {
    // copy req.query
    const reqQuery = {...req.query};
    // fields to exclude from filtering;
    const removeFields = ['select', 'sort', 'page', 'limit'];
    // loop over fields to remove them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);
    // build query from any filters in query params
    let query;
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    query = Communication.find(JSON.parse(queryStr))
        .populate('createdBy')
        .populate('portfolio')
    // select fields
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }
    // sort results
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('date');
    }
    // pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Communication.countDocuments();
    query = query.skip(startIndex).limit(limit);
    // run query
    const communications = await query;
    // pagination results
    const pagination = {};
    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        }
    }
    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        }
    }

    res.status(200).json({ 
        success: true,
        count: communications.length,
        pagination,
        data: communications 
    });
});

// @desc        Get a single communication
// @route       GET /api/v1/communication/:id
// @access      Private
exports.getCommunication = asyncHandler(async (req, res, next) => {
    // find communication
    const communication = await Communication.findById(req.params.id)
        .populate('createdBy')
        .populate('portfolio');
    
    if (!communication) {
        return next(new ErrorResponse(`Not communication found with id ${req.params.id}`, 404));
    }

    res.status(201).json({ success: true, data: communication });
});

// @desc        Create a new communication
// @route       POST /api/v1/communication
// @access      Private
exports.createCommunication = asyncHandler(async (req, res, next) => {
    // automatically tack on the connected user
    req.body.createdBy = req.user._id;
    // create new communication
    const newCommunication = await Communication.create(req.body);
    // return data
    res.status(201).json({ success: true, data: newCommunication });
});

// @desc        Update single communication
// @route       PUT /api/v1/communication/:id
// @access      Private
exports.updateCommunication = asyncHandler(async (req, res, next) => {
    // find communication and update
    const communication = await Communication.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!communication) {
        return next(new ErrorResponse(`Not communication found with id ${req.params.id}`, 404));
    }

    res.status(201).json({ success: true, data: communication });
});

// @desc        Delete single communication
// @route       DELETE /api/v1/communication/:id
// @access      Private
exports.deleteCommunication = asyncHandler(async (req, res, next) => {
    // find communication
    const communication = await Communication.findById(req.params.id);

    if (!communication) {
        return next(new ErrorResponse(`Not communication found with id ${req.params.id}`, 404));
    }

    // delete communication
    await communication.remove();

    res.status(201).json({ success: true, data: {} });
});