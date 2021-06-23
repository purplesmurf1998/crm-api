const Contact = require('../models/Contact');
const ContactInPortfolio = require('../models/ContactInPortfolio')
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Portfolio = require('../models/Portfolio');
const Communication = require('../models/Communication');

// @desc        Get all contacts
// @route       GET /api/v1/contacts
// @route       GET /api/v1/portfolios/:portId/contacts
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
    let queryJSON = JSON.parse(queryStr);
    // check for portId in query parameters
    console.log(req.params);
    if (req.params.portId) {
        queryJSON.portfolio = req.params.portId;
        query = ContactInPortfolio.find(queryJSON)
            .populate('portfolio')
            .populate('contact');
    } else {
        query = Contact.find(queryJSON);
    }
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
    const contact = await Contact.findById(req.params.contactId)
        .populate('createdBy')
        .populate('portfolio');
    
    if (!contact) {
        return next(new ErrorResponse(`Not contact found with id ${req.params.contactId}`, 404));
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

// @desc        Update single contact or contact in portfolio
// @route       PUT /api/v1/contacts/:id
// @route       PUT /api/v1/portfolios/:portId/contacts/:id
// @access      Private
exports.updateContact = asyncHandler(async (req, res, next) => {
    // check for portId
    let contact;
    if (req.params.portId) {
        // find contact in portfolio and update
        contact = await ContactInPortfolio.findOneAndUpdate({ portfolio: req.params.portId, contact: req.params.contactId }, req.body, {
            new: true,
            runValidators: true
        });
        
        if (!contact) {
            return next(new ErrorResponse(`No contact found with id ${req.params.contactId} in portfolio with id ${req.params.portId}`, 404));
        }

        res.status(201).json({ success: true, data: contact });
    } else {
        // find contact and update
        contact = await Contact.findByIdAndUpdate(req.params.contactId, req.body, {
            new: true,
            runValidators: true
        });

        if (!contact) {
            return next(new ErrorResponse(`No contact found with id ${req.params.contactId}`, 404));
        }

        res.status(201).json({ success: true, data: contact });
    }
});

// @desc        Add contact to portfolio
// @route       POST /api/v1/portfolios/:portId/contacts/:contactId
// @access      Private
exports.addContactToPortfolio = asyncHandler(async (req, res, next) => {
    // find contact and update
    const contact = await Contact.findById(req.params.contactId);
    const portfolio = await Portfolio.findById(req.params.portId);
    if (!contact || !portfolio) {
        return next(new ErrorResponse('Missing portfolio or missing contact or both', 404));
    }
    // add portfolio and contact to body
    req.body.portfolio = portfolio._id;
    req.body.contact = contact._id;
    // create to contact in portfolio
    const newContactInPortfolio = await ContactInPortfolio.create(req.body);

    res.status(201).json({ success: true, data: newContactInPortfolio });
});

// @desc        Delete single contact
// @route       DELETE /api/v1/contacts/:id
// @access      Private
exports.deleteContact = asyncHandler(async (req, res, next) => {
    // find contact
    const contact = await Contact.findById(req.params.contactId);

    if (!contact) {
        return next(new ErrorResponse(`No contact found with id ${req.params.contactId}`, 404));
    }

    // delete contact
    await contact.remove();

    res.status(201).json({ success: true, data: {} });
});

// @desc        Get all contacts in every portfolios
// @route       GET /api/v1/contacts/portfolios
// @access      Private
exports.getContactsInPortfolios = asyncHandler(async (req, res, next) => {
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
    let queryJSON = JSON.parse(queryStr);
    
    query = ContactInPortfolio.find(queryJSON)
        .populate('portfolio')
        .populate('contact');
    
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
        query = query.sort('createdAt');
    }
    // pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Contact.countDocuments();
    query = query.skip(startIndex).limit(limit);
    // run query
    const contactsInPortfolios = await query;
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
        count: contactsInPortfolios.length,
        pagination,
        data: contactsInPortfolios 
    });
});

// @desc        Update multiple contacts
// @route       POST /api/v1/communications/:commId/contacts/cpId/:cpId
// @access      Private
exports.addContactToCommunication = asyncHandler(async (req, res, next) => {
    // check for commId
    if (req.params.commId) {
        const communication = await Communication.findById(req.params.commId);
        const contactInPortfolio = await ContactInPortfolio.findById(req.params.cpId);
        if (!communication || !contactInPortfolio) {
            return next(new ErrorResponse(`No communication found with id ${req.params.commId} or no contact in portfolio found with id ${req.params.cpId}`, 404));
        }

        communication.contacts.push(contactInPortfolio._id);
        communication.save();

        res.status(201).json({ success: true, data: communication });
    } else {
        next(new ErrorResponse(`Missing arguments in url`, 400));
    }
});

// @desc        Delete multiple contacts
// @route       DELETE /api/v1/communications/:commId/contacts/cpId/:cpId
// @access      Private
exports.deleteContactFromCommunication = asyncHandler(async (req, res, next) => {
    // check for commId
    if (req.params.commId) {
        const communication = await Communication.findById(req.params.commId);
        const contactInPortfolio = await ContactInPortfolio.findById(req.params.cpId);
        if (!communication || !contactInPortfolio) {
            return next(new ErrorResponse(`No communication found with id ${req.params.commId} or no contact in portfolio found with id ${req.params.cpId}`, 404));
        }

        // check if contact is in communication
        if (!communication.contacts.includes(contactInPortfolio._id)) {
            return next(new ErrorResponse(`Contact was not found in the communication with id ${req.params.commId}`, 404));
        }
        const removedContact = communication.contacts.splice(communication.contacts.indexOf(contactInPortfolio._id));
        communication.save();

        res.status(201).json({ success: true, data: communication, removed: removedContact });
    } else {
        next(new ErrorResponse(`Missing arguments in url`, 400));
    }
});