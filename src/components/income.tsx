import React, { useState, useEffect, ChangeEvent, FormEvent, MouseEvent } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  format,
  parseISO,
  parse,
  isValid,
  getYear,
  compareDesc,
  endOfYear,
  eachMonthOfInterval,
  eachWeekOfInterval,
} from 'date-fns';
import { Card, CardHeader, CardContent } from './ui/card';
import { Input, Checkbox, Select } from './ui/form';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import { db, doc, setDoc, onSnapshot } from '../firebase';
import Sidebar from './ui/sidebar';
import DashboardHeader from './ui/Dashboard_header';
import { v4 as uuidv4 } from 'uuid';

interface IncomeEntry {
  id: string;
  name: string;
  amount: number;
  date: string;
  recurring: boolean;
  frequency: 'monthly' | 'weekly';
  month: string;
  year: number;
}

interface GroupedIncomeData {
  month: string;
  year: number;
  amount: number;
}

const IncomeDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [filterMonth, setFilterMonth] = useState<string>('');
  const [incomeData, setIncomeData] = useState<IncomeEntry[]>([]);
  const [groupedIncomeData, setGroupedIncomeData] = useState<GroupedIncomeData[]>([]);
  const [newIncome, setNewIncome] = useState<IncomeEntry>({
    id: '',
    name: '',
    amount: 0,
    date: new Date().toISOString().slice(0, 10),
    recurring: false,
    frequency: 'monthly',
    month: format(new Date(), 'MMMM'),
    year: getYear(new Date()),
  });
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editingIncome, setEditingIncome] = useState<IncomeEntry | null>(null);
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());

  // Compute sorted and filtered income data
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
    const aggregatedData = incomeData.reduce<Record<string, GroupedIncomeData>>((acc, item) => {
      const key = `${item.month}-${item.year}`;
      if (!acc[key]) {
        acc[key] = {
          month: item.month,
          year: item.year,
          amount: 0,
        };
      }
      acc[key].amount += item.amount;
      return acc;
    }, {});

    const groupedDataArray = Object.values(aggregatedData).map((item) => ({
      ...item,
      amount: Number(item.amount.toFixed(2)),
    }));

    setGroupedIncomeData(groupedDataArray);
  }, [incomeData]);

  const handleIncomeChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setNewIncome((prevIncome) => ({
      ...prevIncome,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleFilterMonth = (e: ChangeEvent<HTMLSelectElement>) => {
    setFilterMonth(e.target.value);
  };

  const handleAddIncome = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateIncome(newIncome)) return;

    const parsedDate = parseISO(newIncome.date);
    const formattedMonth = format(parsedDate, 'MMMM');
    const formattedYear = getYear(parsedDate);
    const formattedDate = format(parsedDate, 'dd/MM/yyyy');
    const parsedAmount = parseFloat(newIncome.amount.toString());
    let updatedIncomeData = [...incomeData];

    if (newIncome.recurring) {
      const endOfYearDate = endOfYear(parsedDate);
      const recurringDates = newIncome.frequency === 'monthly'
        ? eachMonthOfInterval({ start: parsedDate, end: endOfYearDate })
        : eachWeekOfInterval({ start: parsedDate, end: endOfYearDate });

      recurringDates.forEach((date) => {
        updatedIncomeData.push({
          id: uuidv4(),
          name: newIncome.name,
          year: getYear(date),
          month: format(date, 'MMMM'),
          date: format(date, 'dd/MM/yyyy'),
          amount: parsedAmount,
          recurring: newIncome.recurring,
          frequency: newIncome.frequency,
        });
      });
    } else {
      updatedIncomeData.push({
        id: uuidv4(),
        name: newIncome.name,
        year: formattedYear,
        month: formattedMonth,
        date: formattedDate,
        amount: parsedAmount,
        recurring: newIncome.recurring,
        frequency: newIncome.frequency,
      });
    }

    updatedIncomeData.sort(sortIncomeByDate);
    setIncomeData(updatedIncomeData);

    if (currentUser) {
      const userIncomeRef = doc(db, 'users', currentUser.uid);
      await setDoc(userIncomeRef, { income: updatedIncomeData }, { merge: true });
    }

    resetNewIncome();
  };

  const handleEditIncome = (income: IncomeEntry) => {
    const parsedDate = parse(income.date, 'dd/MM/yyyy', new Date());
    const formattedDate = format(parsedDate, 'yyyy-MM-dd');

    setNewIncome({
      ...income,
      date: formattedDate,
    });
    setEditingIncome(income);
    setEditMode(true);
  };

  const handleUpdateIncome = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateIncome(newIncome)) return;

    const parsedDate = parseISO(newIncome.date);
    const formattedMonth = format(parsedDate, 'MMMM');
    const formattedYear = getYear(parsedDate);
    const formattedDate = format(parsedDate, 'dd/MM/yyyy');
    const parsedAmount = parseFloat(newIncome.amount.toString());
    let updatedIncomeData = incomeData.filter((item) => item.id !== editingIncome?.id);

    if (newIncome.recurring) {
      const endOfYearDate = endOfYear(parsedDate);
      const recurringDates = newIncome.frequency === 'monthly'
        ? eachMonthOfInterval({ start: parsedDate, end: endOfYearDate })
        : eachWeekOfInterval({ start: parsedDate, end: endOfYearDate });

      recurringDates.forEach((date) => {
        updatedIncomeData.push({
          id: uuidv4(),
          name: newIncome.name,
          year: getYear(date),
          month: format(date, 'MMMM'),
          date: format(date, 'dd/MM/yyyy'),
          amount: parsedAmount,
          recurring: newIncome.recurring,
          frequency: newIncome.frequency,
        });
      });
    } else {
      updatedIncomeData.push({
        id: editingIncome?.id || uuidv4(),
        name: newIncome.name,
        year: formattedYear,
        month: formattedMonth,
        date: formattedDate,
        amount: parsedAmount,
        recurring: newIncome.recurring,
        frequency: newIncome.frequency,
      });
    }

    updatedIncomeData.sort(sortIncomeByDate);
    setIncomeData(updatedIncomeData);

    if (currentUser) {
      const userIncomeRef = doc(db, 'users', currentUser.uid);
      await setDoc(userIncomeRef, { income: updatedIncomeData }, { merge: true });
    }

    resetNewIncome();
    setEditingIncome(null);
  };

  const handleDeleteIncome = async (income: IncomeEntry, e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent the click from bubbling up
  
    const updatedIncomeData = incomeData.filter((item) => item.id !== income.id);
    setIncomeData(updatedIncomeData);
  
    if (currentUser) {
      const userIncomeRef = doc(db, 'users', currentUser.uid);
      await setDoc(userIncomeRef, { income: updatedIncomeData }, { merge: true });
    }
  };

  const validateIncome = (income: IncomeEntry): boolean => {
    if (!income.name || !income.amount || !income.date) {
      alert('Please fill out all fields.');
      return false;
    }

    const parsedAmount = parseFloat(income.amount.toString());
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid positive amount.');
      return false;
    }

    const parsedDate = parseISO(income.date);
    if (!isValid(parsedDate)) {
      alert('Invalid date format.');
      return false;
    }

    return true;
  };

  const resetNewIncome = () => {
    setNewIncome({
      id: '',
      name: '',
      amount: 0,
      date: new Date().toISOString().slice(0, 10),
      recurring: false,
      frequency: 'monthly',
      month: format(new Date(), 'MMMM'),
      year: getYear(new Date()),
    });
    setEditMode(false);
  };

  const sortIncomeByDate = (a: IncomeEntry, b: IncomeEntry) => {
    if (a.year !== b.year) {
      return a.year - b.year;
    } else {
      const monthOrder: { [key: string]: number } = {
        January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
        July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
      };
      return monthOrder[a.month] - monthOrder[b.month];
    }
  };
  
    return (
    <div className="flex h-screen w-screen bg-gray-100">
      <Sidebar page="Income" />
      <main className="flex flex-col flex-1 p-6 overflow-auto">
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <DashboardHeader Page_Name="Income" />
        </div>
        
        <div className="content-body grid grid-cols-2 gap-6"> {/* Grid layout for the top two cards */}
          {/* First Card */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Income Overview</h3>
              <div className="mt-2">
                <Input
                  label="Filter by year:"
                  type="number"
                  id="filterYear"
                  name="filterYear"
                  value={filterYear}
                  onChange={(e) => setFilterYear(Number(e.target.value))}
                  className="w-20 border border-gray-300 rounded-md p-1"
                />
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={500}>
                <LineChart data={groupedIncomeData}>
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `£${value.toFixed(2)}`} />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip formatter={(value) => `£${parseFloat(value as string).toFixed(2)}`} />
                  <Line type="monotone" dataKey="amount" stroke="#3e9c35" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
  
          {/* Second Card */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Add/Edit Income</h3>
            </CardHeader>
            <CardContent>
              <form onSubmit={editMode ? handleUpdateIncome : handleAddIncome} className="space-y-6">
                <div className="form-group">
                  <Input
                    label="Income Source:"
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
                  <Input
                    label="Amount:"
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
                  <Input
                    label="Date Recieved:"
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
                    label="Recurring Income"
                    id="recurring"
                    name="recurring"
                    checked={newIncome.recurring}
                    onChange={handleIncomeChange}
                    className="h-5 w-5 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                {newIncome.recurring && (
                  <div className="form-group">
                    <Select
                      label="Frequency:"
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
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600"
                  >
                    {editMode ? 'Update Income' : 'Add Income'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
  
          {/* Bottom Card: Income Entries */}
          <Card className="col-span-2"> {/* Span both columns */}
            <CardHeader>
              <h3 className="text-xl font-semibold">Income Entries</h3>
              <div className="flex space-x-4 mt-2">
                <div>
                  <Select
                    label="Filter by month:"
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
            <CardContent>
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
                    <span className="font-semibold">£ {income.amount.toFixed(2)}</span>
                    <Button
                      onClick={(e) => {
                        handleDeleteIncome(income, e as React.MouseEvent<HTMLButtonElement>);
                      }}
                      className="text-white-600 ml-4 bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      Delete
                    </Button>
                    
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default IncomeDashboard;
