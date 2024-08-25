import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import Sidebar from './ui/sidebar';
import DashboardHeader from './ui/Dashboard_header';
import { Card, CardHeader, CardContent } from './ui/card';
import { Button } from './ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,ResponsiveContainer } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { db, doc, setDoc, onSnapshot } from '../firebase';
import { v4 as uuidv4 } from 'uuid';

type ExpenseCategory = 'Food' | 'Transportation' | 'Entertainment' | 'Utilities' | 'Other';

interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
}

interface HabitData {
  date: string;
  count: number;
}

interface CategoryData {
  name: ExpenseCategory;
  amount: number;
}

const categories: ExpenseCategory[] = ['Food', 'Transportation', 'Entertainment', 'Utilities', 'Other'];

const Expenses: React.FC = () => {
  const { currentUser } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newExpense, setNewExpense] = useState<{ amount: string; category: ExpenseCategory }>({ amount: '', category: 'Other' });
  const [habitData, setHabitData] = useState<HabitData[]>([]);

  useEffect(() => {
    if (currentUser) {
      const userExpensesRef = doc(db, 'users', currentUser.uid);
      const unsub = onSnapshot(userExpensesRef, (doc) => {
        const data = doc.data();
        if (data && data.expenses) {
          setExpenses(data.expenses);
          updateHabitData(data.expenses);
        }
      });

      return () => unsub();
    }
  }, [currentUser]);

  const updateHabitData = (expenseList: Expense[]): void => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const newHabitData: HabitData[] = last7Days.map(date => ({
      date,
      count: expenseList.filter(e => e.date === date).length
    }));

    setHabitData(newHabitData);
  };

  const addExpense = async (e: FormEvent) => {
    e.preventDefault();

    if (isNaN(parseFloat(newExpense.amount)) || parseFloat(newExpense.amount) <=0){
      alert('please enter a valid positive number')
      return false
    }
    // validation code

    if (newExpense.amount && newExpense.category) {
      const expenseToAdd: Expense = {
        id: uuidv4(),
        amount: parseFloat(newExpense.amount),
        category: newExpense.category,
        date: new Date().toISOString().split('T')[0]
      };
      const updatedExpenses = [...expenses, expenseToAdd];

      if (currentUser) {
        const userExpensesRef = doc(db, 'users', currentUser.uid);
        await setDoc(userExpensesRef, { expenses: updatedExpenses }, { merge: true });
      }

      setNewExpense({ amount: '', category: 'Other' });
    }
  };

  const deleteExpense = async (id: string) => {
    const updatedExpenses = expenses.filter(expense => expense.id !== id);

    if (currentUser) {
      const userExpensesRef = doc(db, 'users', currentUser.uid);
      await setDoc(userExpensesRef, { expenses: updatedExpenses }, { merge: true });
    }
  };

  const totalExpenses: number = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const categoryData: CategoryData[] = categories.map(category => ({
    name: category,
    amount: expenses.filter(e => e.category === category).reduce((sum, e) => sum + e.amount, 0)
  }));

  return (
    <div className="flex h-screen w-screen bg-gray-100">
      <Sidebar page="Expenses" />
      <main className="flex-1 flex flex-col p-6 overflow-auto">
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <DashboardHeader Page_Name="Expenses" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>Add New Expense</CardHeader>
            <CardContent>
              <form onSubmit={addExpense} className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Amount"
                  value={newExpense.amount}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  className="flex-1 p-2 border rounded"
                />
                <select
                  value={newExpense.category}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setNewExpense({ ...newExpense, category: e.target.value as ExpenseCategory })}
                  className="p-2 border rounded"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <Button type="submit" className="flex items-center">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add
                </Button>
              </form>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>Total Expenses</CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">£ {totalExpenses.toFixed(2)}</p>
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
        </div>
        <Card className="mt-6">
          <CardHeader>Recent Expenses</CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expenses.slice(-5).reverse().map((expense) => (
                <div key={expense.id} className="flex justify-between items-center">
                  <span>{expense.category}: £{expense.amount.toFixed(2)}</span>
                  <Button onClick={() => deleteExpense(expense.id)} className="bg-red-500 hover:bg-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Expenses;