const mongoose = require('mongoose');

const CommunicationSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: [true, 'Please provide a subject to the communication'],
        maxLength: [150, 'Subject must be less than 150 characters'],
        trim: true
    },
    content: {
        type: String,
        required: [true, 'Please provide the content of the communication']
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Please provide the author of the communication']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    date: {
        type: Date,
        required: [true, 'Please provide the date of the communication']
    },
    method: {
        type: String,
        required: [true, 'Please provide the method used in the communication'],
        enum: ['Phone', 'Conference', 'Video', 'Email', 'Other']
    },
    portfolio: {
        type: mongoose.Schema.ObjectId,
        ref: 'Portfolio',
        required: [true, 'Please provide the portfolio associated to the communication']
    },
    contacts: [
        {
            type: [mongoose.Schema.ObjectId],
            ref: 'ContactInPortfolio',
        }
    ]
});

module.exports = mongoose.model('Communication', CommunicationSchema);