import React from 'react';

const EmployeeRow = ({ employee, onEdit, onDelete, onToggleStatus }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString()}`;
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="py-3 px-4">
        <div className="font-semibold text-gray-800">{employee.name}</div>
        {employee.email && (
          <div className="text-xs text-gray-500">{employee.email}</div>
        )}
      </td>
      <td className="py-3 px-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 capitalize">
          {employee.role}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className="text-gray-700">{employee.phone}</span>
      </td>
      <td className="py-3 px-4">
        <span className="font-semibold text-gray-800">{formatCurrency(employee.salary)}</span>
      </td>
      <td className="py-3 px-4">
        <button
          onClick={() => onToggleStatus(employee._id)}
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold transition-all ${
            employee.status === 'active'
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {employee.status === 'active' ? 'Active' : 'Inactive'}
        </button>
      </td>
      <td className="py-3 px-4">
        <span className="text-gray-700 text-sm">{formatDate(employee.joiningDate)}</span>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(employee)}
            className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(employee._id)}
            className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-all"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
};

export default EmployeeRow;
