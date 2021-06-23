const router = require('express').Router({ mergeParams: true });
const {
    getContacts,
    createContact,
    getContact,
    updateContact,
    deleteContact,
    addContactToPortfolio,
    getContactsInPortfolios,
    addContactToCommunication,
    deleteContactFromCommunication
} = require('../controllers/contacts');
const { protect } = require('../middleware/auth');

router.route('/')
    .get(protect, getContacts)
    .post(protect, createContact);

router.route('/cpId/:cpId')
    .post(protect, addContactToCommunication)
    .delete(protect, deleteContactFromCommunication);

router.route('/:contactId')
    .get(protect, getContact)
    .put(protect, updateContact)
    .delete(protect, deleteContact)
    .post(protect, addContactToPortfolio);

router.route('/portfolios/all').get(protect, getContactsInPortfolios);

module.exports = router;