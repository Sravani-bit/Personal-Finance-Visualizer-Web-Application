import { useState, useEffect } from "react";
import TransactionForm from "../components/TransactionForm";
import TransactionList from "../components/TransactionList";
import Dashboard from "../components/Dashboard";
import BudgetForm from "../components/BudgetForm";
import BudgetOverview from "../components/BudgetOverview";

export default function Home() {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Set these as refs since they won't change during component lifecycle
  const currentMonth = new Date()
    .toLocaleString("default", { month: "long" })
    .toLowerCase();
  const currentYear = new Date().getFullYear();
  const [editingBudget, setEditingBudget] = useState(null);

  // Combine fetch functions
  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Fetch transactions
      const transactionsResponse = await fetch("/api/transactions");
      if (!transactionsResponse.ok) {
        throw new Error("Failed to fetch transactions");
      }
      const transactionsData = await transactionsResponse.json();
      setTransactions(transactionsData);

      // Fetch budgets
      const budgetsResponse = await fetch(
        `/api/budgets?month=${currentMonth}&year=${currentYear}`
      );
      if (!budgetsResponse.ok) {
        throw new Error("Failed to fetch budgets");
      }
      const budgetsData = await budgetsResponse.json();
      setBudgets(budgetsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Single useEffect for data fetching
  useEffect(() => {
    fetchData();
  }, []); // Empty dependency array since we're using current month/year

  const handleSubmit = async (data) => {
    try {
      const url = editingTransaction
        ? `/api/transactions/${editingTransaction._id}`
        : "/api/transactions";

      const method = editingTransaction ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to save transaction");
      }

      await fetchData();
      setEditingTransaction(null);
    } catch (error) {
      console.error("Error saving transaction:", error);
      setError(error.message);
    }
  };

  const handleBudgetSubmit = async (budgetData) => {
    try {
      const response = await fetch("/api/budgets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...budgetData,
          month: currentMonth,
          year: currentYear,
        }),
      });

      if (!response.ok) throw new Error("Failed to save budget");

      await fetchData();
    } catch (error) {
      console.error("Error saving budget:", error);
      setError(error.message);
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    // Scroll to form
    document
      .getElementById("transaction-form")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) {
      return;
    }

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete transaction");
      }

      await fetchData();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      setError(error.message);
    }
  };

  const handleBudgetEdit = async (data) => {
    try {
      const response = await fetch(`/api/budgets/${editingBudget._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          month: currentMonth,
          year: currentYear,
        }),
      });

      if (!response.ok) throw new Error("Failed to update budget");

      await fetchData();
      setEditingBudget(null);
    } catch (error) {
      console.error("Error updating budget:", error);
      setError(error.message);
    }
  };

  const handleBudgetDelete = async (budgetId) => {
    if (!budgetId) {
      throw new Error('Budget ID is required');
    }

    const response = await fetch(`/api/budgets/${budgetId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete budget');
    }

    // Refresh data after successful deletion
    await fetchData();
  };


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Greeting and Profile Section */}
        <div className="flex items-center justify-between mb-12">
          {/* Greeting */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Hello, <span className="text-indigo-600">User!</span> 👋
            </h2>
            <p className="text-gray-600 mt-1 text-sm">
              Welcome back to your Personal Finance Tracker.
            </p>
          </div>
  
          {/* Profile Image */}
          <div>
          <img
  src="https://cdn-icons-png.flaticon.com/512/4322/4322991.png"
  alt="Waving Cartoon"
  className="w-16 h-16 rounded-full shadow-md object-cover bg-white p-1"
/>
          </div>
        </div>
  
        {/* Main Heading */}
        <h1 className="text-4xl font-extrabold text-indigo-800 mb-12 text-center tracking-wide">
          Personal Finance Tracker
        </h1>
  
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Left Column - Forms */}
          <div className="space-y-10">
            
            {/* Transaction Form */}
            <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-2xl shadow-xl p-8 border border-green-200">
              <h2 className="text-2xl font-semibold text-green-700 mb-6 tracking-wider">
                {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
              </h2>
              <TransactionForm
                onSubmit={handleSubmit}
                initialData={editingTransaction}
              />
            </div>
  
            {/* Budget Form */}
            <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl shadow-xl p-8 border border-yellow-200">
              <h2 className="text-2xl font-semibold text-yellow-700 mb-6 tracking-wider">
                {editingBudget ? 'Edit Budget' : 'Set Budget'}
              </h2>
              <BudgetForm 
                onSubmit={editingBudget ? handleBudgetEdit : handleBudgetSubmit}
                initialData={editingBudget}
              />
            </div>
          </div>
  
          {/* Right Column */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* Dashboard */}
            <div className="bg-gradient-to-br from-cyan-100 to-blue-200 rounded-2xl shadow-xl p-8 border border-cyan-200">
              <h2 className="text-2xl font-bold text-cyan-700 mb-6 tracking-wider text-center">
                Dashboard Overview
              </h2>
              <Dashboard transactions={transactions} />
            </div>
  
            {/* Budget Overview */}
            <div className="bg-gradient-to-br from-pink-100 to-rose-200 rounded-2xl shadow-xl p-8 border border-pink-200">
              <h2 className="text-2xl font-bold text-pink-700 mb-6 tracking-wider text-center">
                Budget Overview
              </h2>
              <BudgetOverview 
                budgets={budgets} 
                transactions={transactions.filter(t => {
                  const date = new Date(t.date);
                  return (
                    date.toLocaleString('default', { month: 'long' }).toLowerCase() === currentMonth &&
                    date.getFullYear() === currentYear
                  );
                })}
                onEdit={setEditingBudget}
                onDelete={handleBudgetDelete}
              />
            </div>
  
            {/* Transactions List */}
            <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 rounded-2xl shadow-xl p-8 border border-indigo-100">
              <h2 className="text-2xl font-bold text-purple-700 mb-6 tracking-wide text-center">
                Recent Transactions
              </h2>
              <div className="space-y-4">
                <TransactionList
                  transactions={transactions}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>
            </div>
  
          </div>
        </div>
      </div>
    </div>
  );
  
  
  
  
  
  
}
