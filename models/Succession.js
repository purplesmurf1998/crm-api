const mongoose = require('mongoose');

const SuccessionSchema = new mongoose.Schema({
    clientName: {
        type: String,
        required: [true, 'Please provide the name of the client'],
        trim: true,
        maxlength: [50, 'Client name must be under 50 characters']
    },
    dateOfDeath: {
        type: Date,
        required: [true, 'Please provide the date of death']
    },
    trustRole: {
        type: String,
        required: [true, 'Please provide the role of the Trust'],
        enum: ['Unique Liquidator', 'Co-Liquidator', 'Service Contract']
    }
});

module.exports = mongoose.model('Succession', SuccessionSchema);