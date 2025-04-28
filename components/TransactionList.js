import { useState, useEffect } from "react";

export default function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const [showModal, setShowModal] = useState(false); // Modal state for delete confirmation
  const [deleteItemId, setDeleteItemId] = useState(null); // Store the ID of the item to delete
  const [isEditing, setIsEditing] = useState(false); // Flag to show edit form
  const [editTransaction, setEditTransaction] = useState(null); // Transaction data to be edited
  const [error, setError] = useState(null);

  // Fetch transactions data (replace with your actual API or static data)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/transactions");
        const data = await response.json();
        setTransactions(data);
      } catch (error) {
        setError("Failed to fetch transactions");
      }
    };

    fetchData();
  }, []);

  // Handle the transaction deletion
  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/transactions/${deleteItemId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Remove the deleted transaction from the state
        setTransactions(transactions.filter((transaction) => transaction._id !== deleteItemId));
        setShowModal(false); // Close the modal after deletion
      } else {
        throw new Error("Failed to delete transaction");
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
      setError("Failed to delete transaction");
    }
  };

  // Handle the transaction edit
  const handleEdit = (transaction) => {
    setIsEditing(true);
    setEditTransaction(transaction);
  };

  // Handle saving the edited transaction
  const handleSaveEdit = async () => {
    try {
      const response = await fetch(`/api/transactions/${editTransaction._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editTransaction),
      });

      if (response.ok) {
        const updatedTransaction = await response.json();
        setTransactions(
          transactions.map((transaction) =>
            transaction._id === updatedTransaction._id ? updatedTransaction : transaction
          )
        );
        setIsEditing(false); // Close the edit form
        setEditTransaction(null); // Clear the edit form data
      } else {
        throw new Error("Failed to update transaction");
      }
    } catch (error) {
      console.error("Error saving transaction edit:", error);
      setError("Failed to save transaction edit");
    }
  };

  // Open the modal for deletion
  const handleDeleteClick = (id) => {
    setDeleteItemId(id);
    setShowModal(true); // Open the modal
  };

  // Handle close modal
  const handleCloseModal = () => {
    setShowModal(false);
  };

  if (error) {
    return <div className="text-center py-4 text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 font-sans">
      {/* Modal for deletion confirmation */}
      {showModal && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-xl shadow-lg w-96">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600">Are you sure you want to delete this transaction?</p>
            <div className="flex justify-end mt-6 space-x-4">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-gray-500 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Transaction Form */}
      {isEditing && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-xl shadow-lg w-96">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Edit Transaction</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={editTransaction.description}
                onChange={(e) =>
                  setEditTransaction({
                    ...editTransaction,
                    description: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border rounded-md"
                placeholder="Description"
              />
              <input
                type="number"
                value={editTransaction.amount}
                onChange={(e) =>
                  setEditTransaction({
                    ...editTransaction,
                    amount: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border rounded-md"
                placeholder="Amount"
              />
              <input
                type="text"
                value={editTransaction.category}
                onChange={(e) =>
                  setEditTransaction({
                    ...editTransaction,
                    category: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border rounded-md"
                placeholder="Category"
              />
              <div className="flex justify-end mt-6 space-x-4">
                <button
                  onClick={() => setIsEditing(false)}
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

      {/* Transaction List */}
      {transactions.length === 0 ? (
        <div className="text-center py-4 text-gray-500">No transactions yet</div>
      ) : (
        <div className="space-y-2">
          {transactions.map((transaction) => (
            <div
              key={transaction._id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 space-y-2 sm:space-y-0"
            >
              <div>
                <p className="font-medium">{transaction.description}</p>
                <div className="text-sm text-gray-500">
                  <span>{new Date(transaction.date).toLocaleDateString()}</span>
                  <span className="mx-2 hidden sm:inline">•</span>
                  <span className="capitalize">{transaction.category}</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                <span
                  className={`font-medium ${
                    transaction.type === "expense" ? "text-red-600" : "text-green-600"
                  }`}
                >
                  ${Number(transaction.amount).toFixed(2)}
                </span>
                <div className="flex space-x-2">
                  <button
                    className="text-blue-600 hover:text-blue-800 text-sm"
                    onClick={() => handleEdit(transaction)} // Trigger the edit form
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(transaction._id)} // Trigger modal
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
