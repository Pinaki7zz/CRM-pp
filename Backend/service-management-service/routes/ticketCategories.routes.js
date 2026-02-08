const express = require('express');
const ticketCategoryController =require('../controllers/ticketCategories.controller')
//const auth = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
//router.use(auth);

/**
 * Ticket Category routes
 */

// Create Ticket Category
router.post('/', (req, res) =>
  ticketCategoryController.createTicketCategory(req, res)
);

// Get all Ticket Categories with pagination and filters
router.get('/', (req, res) =>
  ticketCategoryController.getAllTicketCategories(req, res)
);

// Search Ticket Categories
router.get('/search', (req, res) =>
  ticketCategoryController.searchTicketCategories(req, res)
);

// Get Ticket Category by ID
router.get('/:id', (req, res) =>
  ticketCategoryController.getTicketCategory(req, res)
);

// Update Ticket Category
router.put('/:id', (req, res) =>
  ticketCategoryController.updateTicketCategory(req, res)
);

// Delete Ticket Category
router.delete('/:id', (req, res) =>
  ticketCategoryController.deleteTicketCategory(req, res)
);

module.exports = router;
