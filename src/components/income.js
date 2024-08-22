import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO, parse, isValid, getYear, compareDesc, addMonths, addWeeks, startOfYear, endOfYear, eachMonthOfInterval, eachWeekOfInterval } from 'date-fns';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Input, Label, Checkbox, Select } from '../components/ui/form';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db, doc, setDoc, onSnapshot } from '../firebase';

const IncomeDashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [filterMonth, setFilterMonth] = useState('');

  const [incomeData, setIncomeData] = useState([]);
  const [groupedIncomeData, setGroupedIncomeData] = useState([]);
  const [newIncome, setNewIncome] = useState({
    name: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10), // Default to today's date
    recurring: false,
    frequency: 'monthly',
  });
  const [editMode, setEditMode] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  const sortedAndFilteredIncomeData = incomeData
    .filter((item) => item.year === filterYear)
    .filter((item) => filterMonth === '' || item.month === filterMonth)
    .sort((a, b) => {
      const dateA = parse(a.date, 'dd/MM/yyyy', new Date());
      const dateB = parse(b.date, 'dd/MM/yyyy', new Date());
      return compareDesc(dateA, dateB);
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

  useEffect(() => {
    const groupedData = incomeData.reduce((acc, item) => {
      const key = `${item.month}-${item.year}`;
      if (!acc[key]) {
        acc[key] = {
          month: item.month,
          year: item.year,
          amount: 0,
          recurring: false,
          frequency: 'monthly',
        };
      }
      acc[key].amount += item.amount;
      acc[key].recurring = acc[key].recurring || item.recurring;
      acc[key].frequency = item.frequency;
      return acc;
    }, {});

    setGroupedIncomeData(Object.values(groupedData));
  }, [incomeData]);

  const handleIncomeChange = (e) => {
    setNewIncome({
      ...newIncome,
      [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    });
  };

  const handleFilterMonth = (e) => {
    setFilterMonth(e.target.value);
  };

  const handleAddIncome = async (e) => {
    e.preventDefault();

    if (!newIncome.name || !newIncome.amount || !newIncome.date) {
      alert('Please fill out all fields.');
      return;
    }

    const parsedAmount = parseFloat(newIncome.amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid positive amount.');
      return;
    }

    const parsedDate = parseISO(newIncome.date);
    if (!isValid(parsedDate)) {
      alert('Invalid date format.');
      return;
    }

    const formattedMonth = format(parsedDate, 'MMMM');
    const formattedYear = getYear(parsedDate);
    const formattedDate = format(parsedDate, 'dd/MM/yyyy');
    const updatedIncomeData = [...incomeData];

    const existingEntry = updatedIncomeData.find(
      (item) => item.name === newIncome.name && item.year === formattedYear && item.month === formattedMonth
    );

    if (existingEntry) {
      if (newIncome.recurring) {
        const frequencyFactor = newIncome.frequency === 'weekly' ? 4 : 1;
        existingEntry.amount += parsedAmount * frequencyFactor;
      } else {
        existingEntry.amount = parsedAmount;
      }
    } else {
      updatedIncomeData.push({
        name: newIncome.name,
        year: formattedYear,
        month: formattedMonth,
        date: formattedDate,
        amount: parsedAmount,
        recurring: newIncome.recurring,
        frequency: newIncome.frequency,
      });
    }

    updatedIncomeData.sort((a, b) => {
      if (a.year !== b.year) {
        return a.year - b.year;
      } else {
        const monthOrder = {
          January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
          July: 7, August: 8, September: 9, October: 10, November: 11, December: 12
        };
        return monthOrder[a.month] - monthOrder[b.month];
      }
    });

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
      frequency: 'monthly',
    });
    setEditMode(false);
  };

  const handleEditIncome = (income) => {
    // Parse the existing date to a Date object
    const parsedDate = parse(income.date, 'dd/MM/yyyy', new Date());
    
    // Format the date to yyyy-MM-dd
    const formattedDate = format(parsedDate, 'yyyy-MM-dd');
    
    // Set the state with formatted date
    setNewIncome({
      ...income,
      date: formattedDate, // Use the formatted date
    });
    setEditingIncome(income);
    setEditMode(true);
  };

  const handleUpdateIncome = async (e) => {
    e.preventDefault();

    if (!newIncome.name || !newIncome.amount || !newIncome.date) {
      alert('Please fill out all fields.');
      return;
    }

    const parsedAmount = parseFloat(newIncome.amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid positive amount.');
      return;
    }

    const parsedDate = parseISO(newIncome.date);
    if (!isValid(parsedDate)) {
      alert('Invalid date format.');
      return;
    }

    const formattedMonth = format(parsedDate, 'MMMM');
    const formattedYear = getYear(parsedDate);
    const formattedDate = format(parsedDate, 'dd/MM/yyyy');

    const updatedIncomeData = incomeData.map((item) =>
      item.name === editingIncome.name && item.year === editingIncome.year && item.month === editingIncome.month
        ? { ...newIncome, month: formattedMonth, year: formattedYear, date: formattedDate }
        : item
    );

    setIncomeData(updatedIncomeData);
    setEditMode(false);
    setEditingIncome(null);

    if (currentUser) {
      const userIncomeRef = doc(db, 'users', currentUser.uid);
      await setDoc(userIncomeRef, { income: updatedIncomeData }, { merge: true });
    }

    setNewIncome({
      name: '',
      amount: '',
      date: new Date().toISOString().slice(0, 10),
      recurring: false,
      frequency: 'monthly',
    });
  };

  const handleDeleteIncome = async (income) => {
    const updatedIncomeData = incomeData.filter(
      (item) => !(item.name === income.name && item.year === income.year && item.month === income.month)
    );

    setIncomeData(updatedIncomeData);

    if (currentUser) {
      const userIncomeRef = doc(db, 'users', currentUser.uid);
      await setDoc(userIncomeRef, { income: updatedIncomeData }, { merge: true });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch {
      console.error('Failed to log out');
    }
  };

  const handleFilterYear = (e) => {
    setFilterYear(parseInt(e.target.value));
  };

  const filteredIncomeData = groupedIncomeData.filter(
    (item) => item.year === filterYear
  );

  return (
    <div className="dashboard flex">
      <aside className="sidebar w-1/4 p-4 bg-gray-100">
        <div className="sidebar-header">
          <h2>Dashboard</h2>
        </div>
        <nav className="sidebar-nav">
          <a href="/dashboard" className="nav-item">Home</a>
          <a href="/income" className="nav-item active">Income</a>
          <a href="/investments" className="nav-item">Investments</a>
          <a href="/expenses" className="nav-item">Expenses</a>
          <a href="/one-time-expenses" className="nav-item">One Time Expenses</a>
          <a href="/settings" className="nav-item">Settings</a>
        </nav>
      </aside>

      <main className="main-content flex-1 p-6">
        <header className="content-header flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">Income Dashboard</h1>
          <Button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Logout
          </Button>
        </header>

        <div className="content-body flex space-x-6">
          <Card className="flex-1">
            <CardHeader>
              <h3 className="text-xl font-semibold">Income Overview</h3>
              <div className="mt-2">
                <Label htmlFor="filterYear">Filter by year:</Label>
                <Input
                  type="number"
                  id="filterYear"
                  value={filterYear}
                  onChange={handleFilterYear}
                  className="w-20 border border-gray-300 rounded-md p-1"
                />
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={500}>
                <LineChart data={filteredIncomeData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Line type="monotone" dataKey="amount" stroke="#3e9c35" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardHeader>
              <h3 className="text-xl font-semibold">Add/Edit Income</h3>
            </CardHeader>
            <CardContent>
              <form onSubmit={editMode ? handleUpdateIncome : handleAddIncome} className="space-y-6">
                <div className="form-group">
                  <Label htmlFor="name">Income Source:</Label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    value={newIncome.name}
                    onChange={handleIncomeChange}
                    placeholder="e.g., Salary, Freelance Work"
                    className="w-full border border-gray-300 rounded-md p-2"
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
                    className="w-full border border-gray-300 rounded-md p-2"
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
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
                <div className="form-group flex items-center space-x-2">
                  <Checkbox
                    id="recurring"
                    name="recurring"
                    checked={newIncome.recurring}
                    onChange={handleIncomeChange}
                    className="h-5 w-5 text-blue-600 border-gray-300 rounded"
                  />
                  <Label htmlFor="recurring">Recurring Income</Label>
                </div>
                {newIncome.recurring && (
                  <div className="form-group">
                    <Label htmlFor="frequency">Frequency:</Label>
                    <Select
                      id="frequency"
                      name="frequency"
                      value={newIncome.frequency}
                      onChange={handleIncomeChange}
                      className="w-full border border-gray-300 rounded-md p-2"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="weekly">Weekly</option>
                    </Select>
                  </div>
                )}
                <div className="form-group">
                  <Button
                    type="submit"
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {editMode ? 'Update Income' : 'Add Income'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card className="flex-1 overflow-hidden flex flex-col">
          <CardHeader>
            <h3 className="text-xl font-semibold">Income Entries</h3>
            <div className="flex space-x-4 mt-2">
              <div>
                <Label htmlFor="filterMonth">Filter by month:</Label>
                <Select
                  id="filterMonth"
                  value={filterMonth}
                  onChange={handleFilterMonth}
                  className="border border-gray-300 rounded-md p-1"
                >
                  <option value="">All Months</option>
                  <option value="January">January</option>
                  <option value="February">February</option>
                  <option value="March">March</option>
                  <option value="April">April</option>
                  <option value="May">May</option>
                  <option value="June">June</option>
                  <option value="July">July</option>
                  <option value="August">August</option>
                  <option value="September">September</option>
                  <option value="October">October</option>
                  <option value="November">November</option>
                  <option value="December">December</option>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <div className="overflow-y-auto">
              <ul className="divide-y divide-gray-300">
                {sortedAndFilteredIncomeData.map((income, index) => (
                  <li
                  key={index}
                  className="py-2 flex justify-between items-center text-gray-700 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleEditIncome(income)}
                >
                    <span className="font-medium">{income.name}</span>
                    {income.recurring && (
                      <span className="font-medium text-gray-500">
                        ({income.frequency === 'weekly' ? 'Weekly' : 'Monthly'})
                      </span>
                    )}
                    <span className="font-medium">{income.date}</span>
                    <span className="font-semibold">$ {parseFloat(income.amount).toFixed(2)}</span>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteIncome(income);
                      }}
                      className="text-white-600 ml-4 bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      Delete
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default IncomeDashboard;