const express = require('express');
const router = express.Router();
const {
  getAllEmployees,
  getEmployeeStats,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  toggleEmployeeStatus,
} = require('../controllers/employee.controller');
const { protect } = require('../middleware/auth.middleware');

// Protect all routes
router.use(protect);

// Routes
router.get('/', getAllEmployees);
router.get('/stats', getEmployeeStats);
router.get('/:id', getEmployee);
router.post('/', createEmployee);
router.put('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);
router.patch('/:id/toggle-status', toggleEmployeeStatus);

module.exports = router;
