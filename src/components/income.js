import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Input, Label, Checkbox } from '../components/ui/form';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { auth, db, collection, addDoc, onSnapshot, doc, setDoc, getDoc } from '../firebase';

const IncomeDashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [incomeData, setIncomeData] = useState([]);
  const [newIncome, setNewIncome] = useState({
    name: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    recurring: false,
  });

  useEffect(() => {
    if (currentUser) {
      const userIncomeRef = doc(db, 'users', currentUser.uid);
      const unsub = onSnapshot(userIncomeRef, (doc) => {
        const data = doc.data();
        if (data && data.income) {
          setIncomeData(data.income);
        }
      });

      return () => unsub();
    }
  }, [currentUser]);

  const handleIncomeChange = (e) => {
    setNewIncome({
      ...newIncome,
      [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    });
  };

  const handleAddIncome = async (e) => {
    e.preventDefault(); // Prevent page refresh
  
    if (!newIncome.name || !newIncome.amount || !newIncome.date) {
      alert('Please fill out all fields.');
      return;
    }
  
    const parsedAmount = parseFloat(newIncome.amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid positive amount.');
      return;
    }
  
    const formattedMonth = format(parseISO(newIncome.date), 'MMMM');
    const updatedIncomeData = [...incomeData];
    const monthIndex = updatedIncomeData.findIndex((item) => item.name === formattedMonth);
  
    if (monthIndex !== -1) {
      updatedIncomeData[monthIndex].amount += parsedAmount;
    } else {
      updatedIncomeData.push({
        name: formattedMonth,
        amount: parsedAmount,
      });
    }
  
    // Define month order for sorting
    const monthOrder = {
      January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
      July: 7, August: 8, September: 9, October: 10, November: 11, December: 12
    };
  
    // Sort by month using the monthOrder
    updatedIncomeData.sort((a, b) => monthOrder[a.name] - monthOrder[b.name]);
  
    setIncomeData(updatedIncomeData);
  
    if (currentUser) {
      const userIncomeRef = doc(db, 'users', currentUser.uid);
      await setDoc(userIncomeRef, { income: updatedIncomeData }, { merge: true });
    }
  
    setNewIncome({
      name: '',
      amount: '',
      date: new Date().toISOString().slice(0, 10),
      recurring: false,
    });
  };
  

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch {
      console.error('Failed to log out');
    }
  };

  return (
    <div className="dashboard flex">
      <aside className="sidebar w-1/4 p-4 bg-gray-100">
        <div className="sidebar-header mb-4">
          <h2 className="text-2xl font-semibold">Dashboard</h2>
        </div>
        <nav className="sidebar-nav space-y-2">
          <a href="/dashboard" className="nav-item block p-2 rounded hover:bg-gray-200">
            Home
          </a>
          <a href="/income" className="nav-item active block p-2 rounded bg-blue-200">
            Income
          </a>
          <a href="/investments" className="nav-item block p-2 rounded hover:bg-gray-200">
            Investments
          </a>
          <a href="/expenses" className="nav-item block p-2 rounded hover:bg-gray-200">
            Expenses
          </a>
          <a href="/one-time-expenses" className="nav-item block p-2 rounded hover:bg-gray-200">
            One-time Expenses
          </a>
          <a href="#" className="nav-item block p-2 rounded hover:bg-gray-200">
            Settings
          </a>
        </nav>
      </aside>

      <main className="main-content flex-1 p-6">
        <header className="content-header flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold">Welcome, {currentUser.email}</h1>
          <button
            onClick={handleLogout}
            className="logout-button"
          >
            Log Out
          </button>
        </header>

        <Card className="mb-6">
          <CardHeader>
            <h3 className="text-xl font-semibold">Income Overview</h3>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={incomeData}>
                <XAxis dataKey="name" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="mb-6 p-6">
          <CardHeader className="mb-4">
            <h3 className="text-xl font-semibold">Add New Income</h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddIncome} className="space-y-4">
              <div className="form-group">
                <Label htmlFor="name">Income Source:</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={newIncome.name}
                  onChange={handleIncomeChange}
                  placeholder="e.g., Freelance Work"
                  className="w-full border-gray-300 rounded-md"
                />
              </div>
              <div className="form-group">
                <Label htmlFor="amount">Amount:</Label>
                <Input
                  type="number"
                  id="amount"
                  name="amount"
                  value={newIncome.amount}
                  onChange={handleIncomeChange}
                  placeholder="e.g., 5000"
                  className="w-full border-gray-300 rounded-md"
                />
              </div>
              <div className="form-group">
                <Label htmlFor="date">Date Received:</Label>
                <Input
                  type="date"
                  id="date"
                  name="date"
                  value={newIncome.date}
                  onChange={handleIncomeChange}
                  className="w-full border-gray-300 rounded-md"
                />
              </div>
              <div className="form-group flex items-center space-x-2">
                <Checkbox
                  id="recurring"
                  name="recurring"
                  checked={newIncome.recurring}
                  onChange={handleIncomeChange}
                  className="h-5 w-5"
                />
                <Label htmlFor="recurring">Recurring Income</Label>
              </div>
              <div className="form-group">
                <Button
                  type="submit"
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Add Income
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">Income Entries</h3>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-gray-300">
              {incomeData.map((income, index) => (
                <li
                  key={index}
                  className="py-2 flex justify-between items-center text-gray-700"
                >
                  <span className="font-medium">{income.name}</span>
                  <span className="font-semibold">${income.amount.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default IncomeDashboard;
