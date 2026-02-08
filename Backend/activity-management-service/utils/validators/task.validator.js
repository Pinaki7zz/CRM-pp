const { z } = require('zod');

const taskSchema = z.object({
  taskOwner: z.string().min(1, "Task owner is required").optional(), // ✅ Make optional for updates
  opportunityName: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  
  // Support both single IDs and arrays for backward compatibility
  contactId: z.string().optional(),
  accountId: z.string().optional(),  
  contactIds: z.array(z.string()).optional(),
  accountIds: z.array(z.string()).optional(),
  
  startDate: z.string().optional().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, "Invalid start date format"),
  
  dueDate: z.string().optional().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, "Invalid due date format"),
  
  leadSource: z.enum(['EMAIL', 'PHONE_CALL', 'WEB_ENQUIRY']).optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'CANCELLED']).optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => {
  // Convert single IDs to arrays for processing
  if (data.contactId && !data.contactIds) {
    data.contactIds = [data.contactId];
  }
  if (data.accountId && !data.accountIds) {
    data.accountIds = [data.accountId];
  }
  return true;
});

module.exports = { taskSchema };
