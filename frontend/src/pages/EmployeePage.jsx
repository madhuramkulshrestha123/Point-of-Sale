import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SummaryCards from '../components/employees/SummaryCards';
import EmployeeTable from '../components/employees/EmployeeTable';
import AddEmployeeModal from '../components/employees/AddEmployeeModal';

const API_URL = 'http://localhost:5000/api';

const EmployeePage = () => {
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    totalMonthlyPayroll: 0,
    avgSalary: 0,
  });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Fetch employees and stats
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch employees
      const employeesRes = await axios.get(`${API_URL}/employees`, {
        params: {
          search: searchTerm || undefined,
          role: filterRole || undefined,
          status: filterStatus || undefined,
        },
        headers,
      });

      if (employeesRes.data.success) {
        setEmployees(employeesRes.data.data);
      }

      // Fetch stats
      const statsRes = await axios.get(`${API_URL}/employees/stats`, { headers });

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching employee data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm, filterRole, filterStatus]);

  // Handle form submission
  const handleSubmit = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (editingEmployee) {
        // Update employee
        const response = await axios.put(
          `${API_URL}/employees/${editingEmployee._id}`,
          formData,
          { headers }
        );

        if (response.data.success) {
          setModalOpen(false);
          setEditingEmployee(null);
          fetchData();
        }
      } else {
        // Create employee
        const response = await axios.post(`${API_URL}/employees`, formData, {
          headers,
        });

        if (response.data.success) {
          setModalOpen(false);
          fetchData();
        }
      }
    } catch (error) {
      console.error('Error saving employee:', error);
      alert(error.response?.data?.message || 'Failed to save employee');
    }
  };

  // Handle edit
  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setModalOpen(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.delete(`${API_URL}/employees/${id}`, { headers });

      if (response.data.success) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Failed to delete employee');
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.patch(
        `${API_URL}/employees/${id}/toggle-status`,
        {},
        { headers }
      );

      if (response.data.success) {
        fetchData();
      }
    } catch (error) {
      console.error('Error toggling employee status:', error);
      alert('Failed to update employee status');
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingEmployee(null);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-1">Employee Management</h1>
            <p className="text-sm text-gray-500">Manage staff, roles, and salaries</p>
          </div>
          <button
            onClick={() => {
              setEditingEmployee(null);
              setModalOpen(true);
            }}
            className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all"
          >
            Add Employee
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="cashier">Cashier</option>
            <option value="worker">Worker</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading employees...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <SummaryCards stats={stats} />

            {/* Employee Table */}
            <EmployeeTable
              employees={employees}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
            />
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AddEmployeeModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        editingEmployee={editingEmployee}
      />
    </div>
  );
};

export default EmployeePage;
