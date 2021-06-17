const mongoose = require('mongoose');

const InstitutionalSchema = new mongoose.Schema({
    market: {
        type: String,
        required: [true, 'Please provide the market segment'],
        enum: ['Religious Institution', 'Trust Corporation', 'Retirement Firm', 'Morgue', 'Holdings', 'Other']
    },
    status: {
        type: String,
        required: [true, 'Please provide the portfolio status'],
        enum: ['Prospect', 'Established', 'Established w/ Opportunity', 'Danger', 'Closing']
    },
});

module.exports = mongoose.model('Institutional', InstitutionalSchema);