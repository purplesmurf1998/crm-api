const router = require('express').Router();
const {
    getContacts,
    createContact,
    getContact,
    updateContact,
    deleteContact
} = require('../controllers/contacts');
const { protect } = require('../middleware/auth');

router.route('/')
    .get(protect, getContacts)
    .post(protect, createContact);

router.route('/:id')
    .get(protect, getContact)
    .put(protect, updateContact)
    .delete(protect, deleteContact);

module.exports = router;