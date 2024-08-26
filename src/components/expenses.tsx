import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import Sidebar from './ui/sidebar';
import DashboardHeader from './ui/Dashboard_header';
import { Card, CardHeader, CardContent } from './ui/card';
import { Button } from './ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { db, doc, setDoc, onSnapshot } from '../firebase';
import { v4 as uuidv4 } from 'uuid';

type ExpenseCategory = 'Food' | 'Transportation' | 'Entertainment' | 'Clothing' | 'Insurance' | 'Personal' | 'Debt' | 'Utilities' | 'Housing' | 'Other';

interface Expense {
  id: string;
  name: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  recurring: boolean;  // Added property
}

interface HabitData {
  date: string;
  count: number;
}

interface CategoryData {
  name: ExpenseCategory;
  amount: number;
}

const categories: ExpenseCategory[] = ['Food', 'Transportation', 'Entertainment', 'Clothing', 'Insurance', 'Personal', 'Debt', 'Utilities', 'Housing', 'Other'];

const Expenses: React.FC = () => {
  const { currentUser } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newExpense, setNewExpense] = useState<{ name: string; amount: string; category: ExpenseCategory; date: string; recurring: boolean }>({
    name: '',
    amount: '',
    category: 'Other',
    date: new Date().toISOString().split('T')[0],
    recurring: false
  });
  const [habitData, setHabitData] = useState<HabitData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (currentUser) {
      const userExpensesRef = doc(db, 'users', currentUser.uid);
      const unsub = onSnapshot(userExpensesRef, (doc) => {
        const data = doc.data();
        if (data && data.expenses) {
          setExpenses(data.expenses);
          updateChartData(data.expenses, dateRange.start, dateRange.end);
        }
      });

      return () => unsub();
    }
  }, [currentUser, dateRange]);

  const updateChartData = (expenseList: Expense[], startDate: string, endDate: string): void => {
    const filteredExpenses = expenseList.filter(
      e => e.date >= startDate && e.date <= endDate
    );

    // Update habit data
    const dateRange = getDatesInRange(new Date(startDate), new Date(endDate));
    const newHabitData: HabitData[] = dateRange.map(date => ({
      date: date.toISOString().split('T')[0],
      count: filteredExpenses.filter(e => e.date === date.toISOString().split('T')[0]).length
    }));
    setHabitData(newHabitData);

    // Update category data
    const newCategoryData: CategoryData[] = categories.map(category => ({
      name: category,
      amount: filteredExpenses.filter(e => e.category === category).reduce((sum, e) => sum + e.amount, 0)
    }));
    setCategoryData(newCategoryData);
  };

  const getDatesInRange = (startDate: Date, endDate: Date): Date[] => {
    const dates: Date[] = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  const addExpense = async (e: FormEvent) => {
    e.preventDefault();

    if (isNaN(parseFloat(newExpense.amount)) || parseFloat(newExpense.amount) <= 0) {
      alert('Please enter a valid positive number for the amount');
      return false;
    }

    if (newExpense.name && newExpense.amount && newExpense.category && newExpense.date) {
      const expenseToAdd: Expense = {
        id: uuidv4(),
        name: newExpense.name,
        amount: parseFloat(newExpense.amount),
        category: newExpense.category,
        date: newExpense.date,
        recurring: newExpense.recurring  // Include recurring
      };
      const updatedExpenses = [...expenses, expenseToAdd];

      if (currentUser) {
        const userExpensesRef = doc(db, 'users', currentUser.uid);
        await setDoc(userExpensesRef, { expenses: updatedExpenses }, { merge: true });
      }

      setNewExpense({ name: '', amount: '', category: 'Other', date: new Date().toISOString().split('T')[0], recurring: false });
    }
  };

  const deleteExpense = async (id: string) => {
    const updatedExpenses = expenses.filter(expense => expense.id !== id);

    if (currentUser) {
      const userExpensesRef = doc(db, 'users', currentUser.uid);
      await setDoc(userExpensesRef, { expenses: updatedExpenses }, { merge: true });
    }
  };

  const filteredExpenses = expenses.filter(expense => expense.date >= dateRange.start && expense.date <= dateRange.end);
  const totalExpenses: number = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Calculate additional data based on filtered expenses
  const dailyExpenses = filteredExpenses.reduce<Record<string, number>>((acc, expense) => {
    acc[expense.date] = (acc[expense.date] || 0) + expense.amount;
    return acc;
  }, {});

  const mostSpentDay = Object.entries(dailyExpenses).reduce((max, [date, amount]) => (amount > max.amount ? { date, amount } : max), { date: '', amount: 0 });
  const highestExpense = filteredExpenses.reduce((max, expense) => (expense.amount > max.amount ? expense : max), { id: '', name: '', amount: 0, category: 'Other', date: '', recurring: false });

  const averageDailySpending = (totalExpenses / Object.keys(dailyExpenses).length).toFixed(2);

  return (
    <div className="flex h-screen w-screen bg-gray-100">
      <Sidebar page="Expenses" />
      <main className="flex-1 flex flex-col p-6 overflow-auto">
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <DashboardHeader Page_Name="Expenses" />
        </div>

        {/* Date Range Controls */}
        <div className="mb-6">
          <Card>
            <CardHeader>Date Range</CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="p-2 border rounded"
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="p-2 border rounded"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>Add New Expense</CardHeader>
            <CardContent>
              <form onSubmit={addExpense} className="space-y-2">
                <input
                  type="text"
                  placeholder="Expense Name"
                  value={newExpense.name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setNewExpense({ ...newExpense, name: e.target.value })}
                  className="w-full p-2 border rounded"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={newExpense.amount}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  className="w-full p-2 border rounded"
                />
                <select
                  value={newExpense.category}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setNewExpense({ ...newExpense, category: e.target.value as ExpenseCategory })}
                  className="w-full p-2 border rounded"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={newExpense.date}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setNewExpense({ ...newExpense, date: e.target.value })}
                  className="w-full p-2 border rounded"
                />
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newExpense.recurring}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setNewExpense({ ...newExpense, recurring: e.target.checked })}
                    className="mr-2"
                  />
                  <label>Recurring</label>
                </div>
                <Button type="submit" className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 focus:outline-none">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Expense
                </Button>
              </form>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>Total Expenses</CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">£ {totalExpenses.toFixed(2)}</p>
              <p className="mt-2">Most Spent Day: {mostSpentDay.date} (£ {mostSpentDay.amount.toFixed(2)})</p>
              <p className="mt-2">Highest Single Expense: {highestExpense.name} (£ {highestExpense.amount.toFixed(2)})</p>
              <p className="mt-2">Average Daily Spending: £ {isNaN(parseFloat(averageDailySpending)) ? "0.00" : averageDailySpending}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>Expense Breakdown</CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>Expense Habit Tracking</CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={habitData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Expenses Section */}
          <Card className="col-span-1 md:col-span-2">
            <CardHeader>Recent Expenses</CardHeader>
            <CardContent className="h-full">
              <div className="space-y-2">
                {/* Filter and sort expenses */}
                {filteredExpenses
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())  // Sort by date in descending order
                  .slice(0, 5)  // Limit to the 5 most recent expenses
                  .map(expense => (
                    <div key={expense.id} className="flex justify-between items-center">
                      <span>{expense.name} - {expense.category}: £{expense.amount.toFixed(2)} ({expense.date})</span>
                      {expense.recurring && <span className="text-green-500">Recurring</span>}
                      <Button onClick={() => deleteExpense(expense.id)} className="bg-red-500 hover:bg-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                {/* Fallback if there are no expenses within the date range */}
                {(filteredExpenses.length === 0) && <p>No recent expenses found within the selected date range.</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Expenses;
