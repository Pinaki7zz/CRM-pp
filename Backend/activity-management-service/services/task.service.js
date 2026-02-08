// services/task.service.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Create a new Task with many-to-many accounts & contacts
 * @param {Object} data Task details, plus accountIds/contactIds arrays
 */
exports.createTask = async (data) => {
  // Handle both single ID and array formats
  let accountIds = data.accountIds || [];
  let contactIds = data.contactIds || [];
  
  // Support legacy single ID format
  if (data.accountId && !accountIds.length) {
    accountIds = [data.accountId];
  }
  if (data.contactId && !contactIds.length) {
    contactIds = [data.contactId];
  }
  
  const { accountId, contactId, accountIds: _, contactIds: __, ...taskData } = data;
  
  return prisma.task.create({
    data: {
      ...taskData,
      // Create TaskAccount join rows:
      accounts: {
        create: accountIds.map(accountId => ({ accountId }))
      },
      // Create TaskContact join rows:
      contacts: {
        create: contactIds.map(contactId => ({ contactId }))
      }
    },
    include: { accounts: true, contacts: true }
  });
};

/**
 * Get all Tasks (with IDs of joined accounts/contacts)
 */
exports.getAllTasks = async () => {
  return prisma.task.findMany({
    include: { accounts: true, contacts: true },
    orderBy: { createdAt: 'desc' } // ADDED: Order by newest first
  });
};

/**
 * Get a single Task (with IDs of joined accounts/contacts)
 */
exports.getTaskById = async (id) => {
  return prisma.task.findUnique({
    where: { id },
    include: { accounts: true, contacts: true }
  });
};

/**
 * Update a Task (including updating join tables)
 * Overwrites the accounts/contacts list with the new one
 */
exports.updateTask = async (id, data) => {
  // Handle both single ID and array formats
  let accountIds = data.accountIds || [];
  let contactIds = data.contactIds || [];
  
  // Support legacy single ID format
  if (data.accountId && !accountIds.length) {
    accountIds = [data.accountId];
  }
  if (data.contactId && !contactIds.length) {
    contactIds = [data.contactId];
  }
  
  const { accountId, contactId, accountIds: _, contactIds: __, ...taskData } = data;

  // Use transaction for data consistency
  return prisma.$transaction(async (tx) => {
    // Remove existing join rows first
    await tx.taskAccount.deleteMany({ where: { taskId: id } });
    await tx.taskContact.deleteMany({ where: { taskId: id } });

    // Update task and re-connect join rows
    return tx.task.update({
      where: { id },
      data: {
        ...taskData,
        accounts: { create: accountIds.map(accountId => ({ accountId })) },
        contacts: { create: contactIds.map(contactId => ({ contactId })) }
      },
      include: { accounts: true, contacts: true }
    });
  });
};

/**
 * Delete a task 
 */
exports.deleteTask = async (id) => {
  //FIXED: Use transaction to delete join table records first, then the task
  return prisma.$transaction(async (tx) => {
    // Step 1: Delete all TaskAccount join records
    await tx.taskAccount.deleteMany({
      where: { taskId: id }
    });

    // Step 2: Delete all TaskContact join records
    await tx.taskContact.deleteMany({
      where: { taskId: id }
    });

    // Step 3: Now delete the task itself
    return tx.task.delete({ 
      where: { id }
    });
  });
};

