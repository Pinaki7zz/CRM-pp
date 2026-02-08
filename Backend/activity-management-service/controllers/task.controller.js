const taskService = require('../services/task.service');
const axios = require('axios');

/**
 * Create a Task (with joined accounts & contacts)
 * Receives: { ...fields, accountIds: [], contactIds: [] }
 */
exports.createTask = async (req, res) => {
  try {
    const task = await taskService.createTask(req.body);
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get all Tasks (without full agg. account/contact info for each - only join rows)
 */
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await taskService.getAllTasks();
    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get a Task by ID, include account & contact DETAILS by calling their microservice APIs
 */
exports.getTaskById = async (req, res) => {
  try {
    const task = await taskService.getTaskById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    // FIXED: Use correct ports and endpoints

    // Get all accounts first, then filter
    let accounts = [];
    try {
      const accountsResponse = await axios.get('http://localhost:4003/api/account');
      const allAccounts = accountsResponse.data;

      // Filter to get only accounts that are linked to this task
      accounts = allAccounts.filter(account =>
        task.accounts.some(taskAccount => taskAccount.accountId === account.accountId)
      );
    } catch (error) {
      console.error('Error fetching accounts:', error);
      accounts = [];
    }

    // Get all contacts first, then filter  
    let contacts = [];
    try {
      const contactsResponse = await axios.get('http://localhost:4003/api/contact'); // FIXED: Port 4003
      const allContacts = contactsResponse.data;

      // Filter to get only contacts that are linked to this task
      contacts = allContacts.filter(contact =>
        task.contacts.some(taskContact => taskContact.contactId === contact.contactId)
      );
    } catch (error) {
      console.error('Error fetching contacts:', error);
      contacts = [];
    }

    res.status(200).json({
      success: true,
      data: {
        ...task,
        accounts, // full account records from account microservice
        contacts, // full contact records from contact microservice
      }
    });
  } catch (error) {
    console.error('Error in getTaskById:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update a Task, supports updating account/contact join tables
 * Receives: { ...fields, accountIds: [], contactIds: [] }
 */
exports.updateTask = async (req, res) => {
  try {
    const updated = await taskService.updateTask(req.params.id, req.body);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete a Task
 */
exports.deleteTask = async (req, res) => {
  try {
    await taskService.deleteTask(req.params.id);
    res.status(200).json({ success: true, message: 'Task deleted successfully' }); // FIXED: Return 200 with message
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
