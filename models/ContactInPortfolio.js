const mongoose = require('mongoose');

const ContactInPortfolioSchema = new mongoose.Schema({
    portfolio: {
        type: mongoose.Schema.ObjectId,
        ref: 'Portfolio',
        required: [true, 'Please provide the portfolio']
    },
    contact: {
        type: mongoose.Schema.ObjectId,
        ref: 'Contact',
        required: [true, 'Please provide the contact']
    },
    role: {
        type: String,
        required: [true, 'Please provide the contact role']
    },
    description: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    inactiveSince: Date
});

module.exports = mongoose.model('ContactInPortfolio', ContactInPortfolioSchema);