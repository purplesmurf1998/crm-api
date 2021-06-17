const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
    firstname: {
        type: String,
        trim: true,
        maxLength: [50, 'First name cannot be more than 50 characters']
    },
    lastname: {
        type: String,
        required: true,
        trim: true,
        maxLength: [100, 'Last name cannot be more than 100 characters']
    },
    fullname: {
        type: String,
        trim: true,
        unique: true
    },
    email1: {
        type: String,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please use a valid email'
        ]
    },
    email2: {
        type: String,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please use a valid email'
        ]
    },
    description: String,
    homePhone: String,
    mobilePhone: String,
    workPhone: String,
    faxPhone: String
});

ContactSchema.pre('save', function(next) {
    console.log("Contact.js[45] === " + this);
    let fullname = ""
    if (!this.firstname) {
        fullname = this.lastname;
    } else {
        fullname = `${this.firstname} ${this.lastname}`;
    }
    this.fullname = fullname;
    next();
})

module.exports = mongoose.model('Contact', ContactSchema);