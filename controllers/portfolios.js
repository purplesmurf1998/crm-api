const Portfolio = require('../models/Portfolio');
const Succession = require('../models/Succession');
const Institutional = require('../models/Institutional');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc        Get all portfolios
// @route       GET /api/v1/portfolios/:portType
// @access      Private
exports.getPortfolios = asyncHandler(async (req, res, next) => {
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
    query = Portfolio.find(JSON.parse(queryStr))
        .populate('succession')
        .populate('institutional')
        .populate('trust')
        .populate('manager')
        .populate('associates');
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
        query = query.sort('portName');
    }
    // pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Portfolio.countDocuments();
    query = query.skip(startIndex).limit(limit);
    // run query
    const portfolios = await query;
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
        count: portfolios.length,
        pagination,
        data: portfolios 
    });
});

// @desc        Get a specific portfolio
// @route       GET /api/v1/portfolios/:portType/:id
// @access      Private
exports.getPortfolio = asyncHandler(async (req, res, next) => {
    // find portfolio
    const portfolio = await Portfolio.findById(req.params.portId)
        .populate('succession')
        .populate('institutional')
        .populate('trust');
    // return error if nothing found
    if (!portfolio) {
        return next(new ErrorResponse(`Portfolio not found with id ${req.params.portId}`, 404));
    }
    // return data
    res.status(200).json({ success: true, data: portfolio });
});

// @desc        Create a new portfolio
// @route       POST /api/v1/portfolios/:portType
// @access      Private
exports.createPortfolio = asyncHandler(async (req, res, next) => {
    let body = req.body;
    let newPort;
    let newSuccession;
    let newInstitutional;

    if (body.portType === 'Succession') {
        newSuccession = await Succession.create(body);
        body.succession = newSuccession._id;
        newPort = await Portfolio.create(body);
    } else if (body.portType === 'Institutional') {
         newInstitutional = await Institutional.create(body);
         body.institutional = newInstitutional._id;
         newPort = await Portfolio.create(body);
    } else {
        return next(new ErrorResponse('Portfolio does not have the proper type', 400));
    }
    
    res.status(200).json({ success: true, port: newPort, succ: newSuccession, inst: newInstitutional })
});

// @desc        Update a specific portfolio
// @route       PUT /api/v1/portfolios/:portType/:id
// @access      Private
exports.updatePortfolio = asyncHandler(async (req, res, next) => {
    // copy body
    const reqBody = {...req.body};
    // fields to be removed from body
    const removeFields = ['succession', 'institutional', 'trust']
    // loop over body and remove fields
    removeFields.forEach(param => delete reqBody[param]);
    // convert body into JSON string
    let body;
    let bodyStr;
    bodyStr = JSON.stringify(reqBody);
    body = JSON.parse(bodyStr);

    // if institutional is present in the body, update the corresponding object
    if (req.body.institutional) {
        await Institutional.findByIdAndUpdate(req.body.institutional.id, req.body.institutional.data, {
            runValidators: true
        });
    }
    // if succession is present in the body, update the corresponding object
    if (req.body.succession) {
        await Succession.findByIdAndUpdate(req.body.succession.id, req.body.succession.data, {
            runValidators: true
        });
    }
    
    // find portfolio to update
    const portfolio = await Portfolio.findByIdAndUpdate(req.params.portId, body, {
        new: true,
        runValidators: true
    })
    .populate('succession')
    .populate('institutional')
    .populate('trust');
    // return error if no portfolio found
    if (!portfolio) {
        return next(new ErrorResponse(`Portfolio not found with id ${req.params.portId}`, 404));
    }
    // return data
    res.status(200).json({ success: true, data: portfolio });
});

// @desc        Delete a specific portfolio
// @route       DELETE /api/v1/portfolios/:portType/:id
// @access      Private
exports.deletePortfolio = asyncHandler(async (req, res, next) => {
    // find portfolio to delete
    const portfolio = await Portfolio.findById(req.params.portId);
    // return error if no portfolio found
    if (!portfolio) {
        return next(new ErrorResponse(`Portfolio not found with id ${req.params.portId}`, 404));
    }
    // delete portfolio
    portfolio.remove();
    // return data
    res.status(200).json({ success: true, data: {} });
});