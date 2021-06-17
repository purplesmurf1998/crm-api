const Contact = require('../models/Contact');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc        Get all contacts
// @route       GET /api/v1/contacts
// @access      Private
exports.getContacts = asyncHandler(async (req, res, next) => {
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
    query = Contact.find(JSON.parse(queryStr));
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
    const total = await Contact.countDocuments();
    query = query.skip(startIndex).limit(limit);
    // run query
    const contacts = await query;
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
        count: contacts.length,
        pagination,
        data: contacts 
    });
});

// @desc        Get a single contact
// @route       GET /api/v1/contacts/:id
// @access      Private
exports.getContact = asyncHandler(async (req, res, next) => {
    // find contact
    const contact = await Contact.findById(req.params.id)
        .populate('createdBy')
        .populate('portfolio');
    
    if (!contact) {
        return next(new ErrorResponse(`Not contact found with id ${req.params.id}`, 404));
    }

    res.status(201).json({ success: true, data: contact });
});

// @desc        Create a new contact
// @route       POST /api/v1/contacts
// @access      Private
exports.createContact = asyncHandler(async (req, res, next) => {
    // automatically tack on the connected user
    req.body.createdBy = req.user._id;
    // create new contact
    const newContact = await Contact.create(req.body);
    // return data
    res.status(201).json({ success: true, data: newContact });
});

// @desc        Update single contact
// @route       PUT /api/v1/contacts/:id
// @access      Private
exports.updateContact = asyncHandler(async (req, res, next) => {
    // find contact and update
    const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!contact) {
        return next(new ErrorResponse(`No contact found with id ${req.params.id}`, 404));
    }

    res.status(201).json({ success: true, data: contact });
});

// @desc        Delete single contact
// @route       DELETE /api/v1/contacts/:id
// @access      Private
exports.deleteContact = asyncHandler(async (req, res, next) => {
    // find contact
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
        return next(new ErrorResponse(`No contact found with id ${req.params.id}`, 404));
    }

    // delete contact
    await contact.remove();

    res.status(201).json({ success: true, data: {} });
});