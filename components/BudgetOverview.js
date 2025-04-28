import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function BudgetOverview({ budgets, transactions, onEdit, onDelete }) {
  const [budgetData, setBudgetData] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [editTransaction, setEditTransaction] = useState(null);

  useEffect(() => {
    if (!budgets || !transactions) return;

    const spending = transactions.reduce((acc, transaction) => {
      if (transaction.type === 'expense') {
        const category = transaction.category.toLowerCase();
        acc[category] = (acc[category] || 0) + Number(transaction.amount);
      }
      return acc;
    }, {});

    const combinedData = budgets.map(budget => ({
      id: budget._id,
      originalBudget: budget,
      category: budget.category.charAt(0).toUpperCase() + budget.category.slice(1),
      budget: budget.amount,
      spent: spending[budget.category.toLowerCase()] || 0,
      remaining: Math.max(budget.amount - (spending[budget.category.toLowerCase()] || 0), 0)
    }));

    setBudgetData(combinedData);
  }, [budgets, transactions]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleDeleteClick = (budgetId) => {
    setDeleteItemId(budgetId);
    setShowDeleteModal(true); // Open delete modal
  };

  const handleConfirmDelete = async () => {
    try {
      await onDelete(deleteItemId);
      setShowDeleteModal(false); // Close modal
    } catch (error) {
      console.error('Error deleting budget:', error);
      alert('Failed to delete budget. Please try again.');
    }
  };

  const handleEditClick = (budget) => {
    setEditTransaction(budget);
    setShowEditModal(true); // Open edit modal
  };

  const handleSaveEdit = async () => {
    try {
      await onEdit(editTransaction);
      setShowEditModal(false); // Close modal
      setEditTransaction(null); // Clear edit form
    } catch (error) {
      console.error('Error saving budget edit:', error);
      alert('Failed to save budget edit. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600">Are you sure you want to delete this budget?</p>
            <div className="flex justify-end mt-6 space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-500 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Budget Modal */}
      {showEditModal && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Edit Budget</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={editTransaction.category}
                onChange={(e) =>
                  setEditTransaction({ ...editTransaction, category: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-md"
                placeholder="Category"
              />
              <input
                type="number"
                value={editTransaction.amount}
                onChange={(e) =>
                  setEditTransaction({ ...editTransaction, amount: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-md"
                placeholder="Amount"
              />
              <div className="flex justify-end mt-6 space-x-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-500 border border-gray-300 rounded-md hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Budget Data List */}
      <div className="grid grid-cols-1 gap-4">
        {budgetData.map((item) => (
          <div key={item.id} className="bg-white rounded-lg p-4 shadow">
            <div className="flex justify-between items-center mb-2">
              <div className="flex-1">
                <h3 className="font-medium">{item.category}</h3>
                <span className="text-gray-500">
                  {formatCurrency(item.spent)} / {formatCurrency(item.budget)}
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditClick(item.originalBudget)}
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 rounded border border-blue-600 hover:bg-blue-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteClick(item.id)}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-800 rounded border border-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="relative pt-1">
              <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                <div
                  style={{
                    width: `${Math.min((item.spent / item.budget) * 100, 100)}%`
                  }}
                  className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${item.spent > item.budget ? 'bg-red-500' : 'bg-blue-500'}`}
                />
              </div>
            </div>
            <div className="mt-1 text-sm text-gray-500">
              {item.spent > item.budget ? (
                <span className="text-red-500">
                  Over budget by {formatCurrency(item.spent - item.budget)}
                </span>
              ) : (
                <span className="text-green-500">
                  {formatCurrency(item.remaining)} remaining
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Budget vs. Spending Bar Chart */}
      {budgetData.length > 0 ? (
        <div className="h-80 bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Budget vs. Spending</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={budgetData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="budget" fill="#3B82F6" name="Budget" />
              <Bar dataKey="spent" fill="#EF4444" name="Spent" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No budgets set for this month
        </div>
      )}
    </div>
  );
}
