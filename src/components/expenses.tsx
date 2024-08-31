import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { PlusCircle, Trash2, Edit } from 'lucide-react';
import Sidebar from './ui/sidebar';
import DashboardHeader from './ui/Dashboard_header';
import { Card, CardHeader, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input, Select } from './ui/form';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { db, doc, setDoc, onSnapshot, writeBatch } from '../firebase';
import { v4 as uuidv4 } from 'uuid';
import { format, parseISO, isValid } from 'date-fns';

type ExpenseCategory = 'Food' | 'Transportation' | 'Entertainment' | 'Clothing' | 'Insurance' | 'Personal' | 'Debt' | 'Utilities' | 'Housing' | 'Other';
type RecurringFrequency = 'weekly' | 'monthly' | 'none';

interface Expense {
  id: string;
  name: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  recurring: RecurringFrequency;
  endDate?: string;
  bankAccountId: string;
}

interface HabitData {
  date: string;
  count: number;
}

interface CategoryData {
  name: ExpenseCategory;
  amount: number;
}

interface BankAccount {
  id: string;
  name: string;
  balance: number;
}

const categories: ExpenseCategory[] = ['Food', 'Transportation', 'Entertainment', 'Clothing', 'Insurance', 'Personal', 'Debt', 'Utilities', 'Housing', 'Other'];

const Expenses: React.FC = () => {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const { currentUser } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newExpense, setNewExpense] = useState<Expense>({
    id: '',
    name: '',
    amount: 0,
    category: 'Other',
    date: new Date().toISOString().split('T')[0],
    recurring: 'none',
    endDate: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0],
    bankAccountId: '',
  });
  const [habitData, setHabitData] = useState<HabitData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    document.title = "FinancePro | Log Expenses"
    if (currentUser) {
      const userExpensesRef = doc(db, 'users', currentUser.uid);
      const unsub = onSnapshot(userExpensesRef, (doc) => {
        const data = doc.data();
        if (data) {
          if (data.expenses) {
            setExpenses(data.expenses);
            updateChartData(data.expenses, dateRange.start, dateRange.end);
          }
          if (data.bankAccounts) {
            setBankAccounts(data.bankAccounts);
            if (data.bankAccounts.length === 1) {
              setNewExpense(prev => ({ ...prev, bankAccountId: data.bankAccounts[0].id }));
            }
          }
        }
      });

      return () => unsub();
    }
  }, [currentUser, dateRange]);

  const updateChartData = (expenseList: Expense[], startDate: string, endDate: string): void => {
    const filteredExpenses = expenseList.filter(
      e => e.date >= startDate && e.date <= endDate
    );

    const dateRange = getDatesInRange(new Date(startDate), new Date(endDate));
    const newHabitData: HabitData[] = dateRange.map(date => ({
      date: date.toISOString().split('T')[0],
      count: filteredExpenses.filter(e => e.date === date.toISOString().split('T')[0]).length
    }));
    setHabitData(newHabitData);

    const newCategoryData: CategoryData[] = categories.map(category => ({
      name: category,
      amount: Number(filteredExpenses.filter(e => e.category === category).reduce((sum, e) => sum + e.amount, 0).toFixed(2))
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

  const validateExpense = (expense: Expense): boolean => {
    if (!expense.name || expense.amount <= 0 || !expense.date || !expense.bankAccountId) {
      alert('Please fill in all required fields and ensure the amount is greater than zero.');
      return false;
    }

    const parsedDate = parseISO(expense.date);
    if (!isValid(parsedDate)) {
      alert('Invalid date format.');
      return false;
    }

    return true;
  };


  const addOrUpdateExpense = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateExpense(newExpense)) return;

    const expenseToAdd: Expense = {
      ...newExpense,
      id: editMode ? newExpense.id : uuidv4(),
    };

    let updatedExpenses: Expense[] = [];
    if (editMode) {
      updatedExpenses = expenses.map(exp => exp.id === expenseToAdd.id ? expenseToAdd : exp);
    } else {
      updatedExpenses = [...expenses, expenseToAdd];
    }

    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      const batch = writeBatch(db);

      batch.set(userRef, { expenses: updatedExpenses }, { merge: true });

      const selectedAccount = bankAccounts.find(account => account.id === expenseToAdd.bankAccountId);
      if (selectedAccount) {
        const oldExpense = editMode ? expenses.find(exp => exp.id === expenseToAdd.id) : null;
        const balanceChange = oldExpense ? oldExpense.amount - expenseToAdd.amount : -expenseToAdd.amount;

        const updatedAccounts = bankAccounts.map(account =>
          account.id === selectedAccount.id
            ? { ...account, balance: account.balance + balanceChange }
            : account
        );
        batch.set(userRef, { bankAccounts: updatedAccounts }, { merge: true });
      } else {
        alert('Selected bank account not found');
        return;
      }

      if (expenseToAdd.recurring !== 'none' && expenseToAdd.endDate) {
        const frequencyInDays = expenseToAdd.recurring === 'weekly' ? 7 : 30;
        let currentDate = new Date(expenseToAdd.date);
        const endDate = new Date(expenseToAdd.endDate);

        while (currentDate <= endDate) {
          if (currentDate > new Date(expenseToAdd.date)) {
            const recurringExpense = {
              ...expenseToAdd,
              id: uuidv4(),
              date: currentDate.toISOString().split('T')[0]
            };
            updatedExpenses.push(recurringExpense);
          }
          currentDate.setDate(currentDate.getDate() + frequencyInDays);
        }
      }

      batch.set(userRef, { expenses: updatedExpenses }, { merge: true });
      await batch.commit();
    }

    resetForm();
  };


  const handleEditExpense = (expense: Expense) => {
    setNewExpense(expense);
    setEditMode(true);
  };

  const deleteExpense = async (id: string) => {
    const expenseToDelete = expenses.find(expense => expense.id === id);
    const updatedExpenses = expenses.filter(expense => expense.id !== id);

    if (currentUser && expenseToDelete) {
      const userRef = doc(db, 'users', currentUser.uid);
      const batch = writeBatch(db);


      batch.set(userRef, { expenses: updatedExpenses }, { merge: true });


      const account = bankAccounts.find(acc => acc.id === expenseToDelete.bankAccountId);
      if (account) {
        const updatedAccounts = bankAccounts.map(acc =>
          acc.id === account.id
            ? { ...acc, balance: acc.balance + expenseToDelete.amount }
            : acc
        );
        batch.set(userRef, { bankAccounts: updatedAccounts }, { merge: true });
      }

      await batch.commit();
    }
  };


  const resetForm = () => {
    setNewExpense({
      id: '',
      name: '',
      amount: 0,
      category: 'Other',
      date: new Date().toISOString().split('T')[0],
      recurring: 'none',
      endDate: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0],
      bankAccountId: '',
    });
    setEditMode(false);
  };

  const filteredExpenses = expenses.filter(expense => expense.date >= dateRange.start && expense.date <= dateRange.end);
  const totalExpenses: number = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const formatNumber = (value: number): string => {
    return value.toLocaleString();
  };


  return (
    <div className="flex h-screen w-screen bg-gray-100">
      <Sidebar page="Expenses" />
      <main className="flex-1 flex flex-col p-6 overflow-auto">
          <DashboardHeader Page_Name="Expenses" />

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
              <form onSubmit={addOrUpdateExpense} className="space-y-2">
                <Input
                  label="Expense Name:"
                  id="Expense Name"
                  type="text"
                  placeholder="Expense Name"
                  value={newExpense.name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setNewExpense({ ...newExpense, name: e.target.value })}
                  className="w-full p-2 border rounded"
                />
                <Input
                  label="Amount:"
                  type="number"
                  id="Amount"
                  placeholder="Amount"
                  value={newExpense.amount}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) })}
                  className="w-full p-2 border rounded"
                />
                <Select
                  label="Category:"
                  id="Category"
                  value={newExpense.category}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setNewExpense({ ...newExpense, category: e.target.value as ExpenseCategory })}
                  className="w-full p-2 border rounded"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Select>
                <Input
                  label="Date:"
                  id="Date"
                  type="date"
                  value={newExpense.date}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setNewExpense({ ...newExpense, date: e.target.value })}
                  className="w-full p-2 border rounded"
                />
                <Select
                  label="Recurring?:"
                  id="Recurring"
                  value={newExpense.recurring}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setNewExpense({ ...newExpense, recurring: e.target.value as RecurringFrequency })}
                  className="w-full p-2 border rounded"
                >
                  <option value="none">Not Recurring</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </Select>
                {newExpense.recurring !== 'none' && (
                  <Input
                    label="Date:"
                    id="Date"
                    type="date"
                    value={newExpense.endDate}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setNewExpense({ ...newExpense, endDate: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                )}
                <Select
                  label="Bank Account:"
                  id="Bank account"
                  value={newExpense.bankAccountId}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setNewExpense({ ...newExpense, bankAccountId: e.target.value })}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Bank Account</option>
                  {bankAccounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.name} (Balance: £{formatNumber(account.balance)})
                    </option>
                  ))}
                </Select>
                <Button type="submit" className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 focus:outline-none">
                  <PlusCircle className="mr-2 h-4 w-4" /> {editMode ? 'Update' : 'Add'} Expense
                </Button>
              </form>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>Total Expenses</CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">£ {formatNumber(totalExpenses)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>Expense Breakdown</CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => {
                           if (value >= 1_000_000) {
                             return `${(value / 1_000_000).toFixed(2)}M`;
                           } else if (value >= 1_000) {
                             return `${(value / 1_000).toFixed(2)}K`;
                           } else {
                             return value.toFixed(2);
                           }
                         }} />
                  <Tooltip
                    formatter={(value: any) => ` ${formatNumber(Number(value))}`}
                  />
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
                  <YAxis tickFormatter={(value) => formatNumber(value)} />
                  <Tooltip
                    formatter={(value: any) => ` ${formatNumber(Number(value))}`}
                  />
                  
                  <Bar dataKey="count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Expenses Section */}
          <Card className="col-span-1 md:col-span-2">
            <CardHeader>Recent Expenses</CardHeader>
            <CardContent className="h-full">
              <div className="space-y-2 overflow-auto">
                {filteredExpenses
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 5)
                  .map(expense => (
                    <div key={expense.id} className="flex justify-between items-center">
                      <span>{expense.name} - {expense.category}: £{formatNumber(expense.amount)} ({expense.date})</span>
                      <span className="font-medium">
                        {bankAccounts.find(account => account.id === expense.bankAccountId)?.name || 'Unknown Account'}
                      </span>
                      {expense.recurring !== 'none' && <span className="text-green-500">Recurring</span>}

                      <div>
                        <Button onClick={() => handleEditExpense(expense)} className="bg-blue-500 hover:bg-blue-700 mr-2">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button onClick={() => deleteExpense(expense.id)} className="bg-red-500 hover:bg-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                {filteredExpenses.length === 0 && <p>No recent expenses found within the selected date range.</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Expenses;;