const mongoose = require('mongoose');
const Succession = require('./Succession');

const PortfolioSchema = new mongoose.Schema({
    portName: {
        type: String,
        required: [true, 'Please provide a name for the portfolio'],
        unique: true,
        trim: true
    },
    portNumber: {
        type: String,
        unique: true
    },
    portType: {
        type: String,
        require: [true, 'Please select portfolio type'],
        enum: ['Institutional', 'Succession', 'Trust']
    },
    succession: {
        type: mongoose.Schema.ObjectId,
        ref: 'Succession',
    },
    institutional: {
        type: mongoose.Schema.ObjectId,
        ref: 'Institutional'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    closedAt: Date,
    portDescription: {
        type: String,
        maxlength: [500, 'Portfolio description cannot be more than 500 characters']
    },
    manager: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Please assign an account manager']
    },
    associates: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ],
    lastContacted: Date
});

// Cascade delete portfolio details when a portfolio is deleted
PortfolioSchema.pre('remove', async function(next) {
    console.log(`Removing portfolio details for portfolio ${this._id}`);
    if (this.succession) {
        await this.model('Succession').deleteMany({ _id: this.succession._id });
    }
    if (this.institutional) {
        await this.model('Institutional').deleteMany({ _id: this.institutional._id });
    }
    next();
})

module.exports = mongoose.model('Portfolio', PortfolioSchema);