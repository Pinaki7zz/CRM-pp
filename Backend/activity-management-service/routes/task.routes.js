const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const validate = require('../middlewares/validate.middleware');
const { taskSchema } = require('../utils/validators/task.validator');

router.post('/', validate(taskSchema), taskController.createTask);
router.get('/', taskController.getAllTasks);
router.get('/:id', taskController.getTaskById);
router.put('/:id', validate(taskSchema), taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
