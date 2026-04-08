const Employee = require('../models/Employee.model');

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private
exports.getAllEmployees = async (req, res) => {
  try {
    const { status, role, search } = req.query;

    // Build query
    let query = { user: req.user._id };

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by role
    if (role) {
      query.role = role;
    }

    // Search by name or phone
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const employees = await Employee.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching employees',
    });
  }
};

// @desc    Get employee statistics
// @route   GET /api/employees/stats
// @access  Private
exports.getEmployeeStats = async (req, res) => {
  try {
    const employees = await Employee.find({ user: req.user._id });

    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(emp => emp.status === 'active').length;
    const inactiveEmployees = totalEmployees - activeEmployees;
    
    const totalMonthlyPayroll = employees
      .filter(emp => emp.status === 'active')
      .reduce((sum, emp) => sum + emp.salary, 0);
    
    const avgSalary = activeEmployees > 0 
      ? totalMonthlyPayroll / activeEmployees 
      : 0;

    // Count by role
    const roleBreakdown = {
      admin: employees.filter(emp => emp.role === 'admin').length,
      manager: employees.filter(emp => emp.role === 'manager').length,
      cashier: employees.filter(emp => emp.role === 'cashier').length,
    };

    res.json({
      success: true,
      data: {
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        totalMonthlyPayroll,
        avgSalary,
        roleBreakdown,
      },
    });
  } catch (error) {
    console.error('Error fetching employee stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching employee statistics',
    });
  }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private
exports.getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    res.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching employee',
    });
  }
};

// @desc    Create employee
// @route   POST /api/employees
// @access  Private
exports.createEmployee = async (req, res) => {
  try {
    const { name, phone, email, role, salary, joiningDate, status, address } = req.body;

    // Check if phone already exists
    const existingPhone = await Employee.findOne({ 
      phone, 
      user: req.user._id 
    });
    
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number already exists',
      });
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await Employee.findOne({ 
        email, 
        user: req.user._id 
      });
      
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists',
        });
      }
    }

    const employee = await Employee.create({
      name,
      phone,
      email,
      role,
      salary,
      joiningDate: joiningDate || Date.now(),
      status: status || 'active',
      address,
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating employee',
    });
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private
exports.updateEmployee = async (req, res) => {
  try {
    const { name, phone, email, role, salary, joiningDate, status, address } = req.body;

    let employee = await Employee.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Check if phone is being changed and if it exists
    if (phone && phone !== employee.phone) {
      const existingPhone = await Employee.findOne({ 
        phone, 
        user: req.user._id 
      });
      
      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: 'Phone number already exists',
        });
      }
    }

    // Check if email is being changed and if it exists
    if (email && email !== employee.email) {
      const existingEmail = await Employee.findOne({ 
        email, 
        user: req.user._id 
      });
      
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists',
        });
      }
    }

    // Update fields
    employee.name = name || employee.name;
    employee.phone = phone || employee.phone;
    employee.email = email !== undefined ? email : employee.email;
    employee.role = role || employee.role;
    employee.salary = salary !== undefined ? salary : employee.salary;
    employee.joiningDate = joiningDate || employee.joiningDate;
    employee.status = status || employee.status;
    employee.address = address !== undefined ? address : employee.address;

    await employee.save();

    res.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating employee',
    });
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    await employee.deleteOne();

    res.json({
      success: true,
      message: 'Employee deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting employee',
    });
  }
};

// @desc    Toggle employee status
// @route   PATCH /api/employees/:id/toggle-status
// @access  Private
exports.toggleEmployeeStatus = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    employee.status = employee.status === 'active' ? 'inactive' : 'active';
    await employee.save();

    res.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error('Error toggling employee status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating employee status',
    });
  }
};
