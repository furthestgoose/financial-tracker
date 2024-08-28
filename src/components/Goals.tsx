import React, { useState, useEffect } from 'react';
import Sidebar from './ui/sidebar';
import DashboardHeader from './ui/Dashboard_header';
import { Card, CardHeader, CardContent } from './ui/card';
import { Input } from './ui/form';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import { db, doc, setDoc, onSnapshot, writeBatch } from '../firebase';
import { v4 as uuidv4 } from 'uuid';

interface Goal {
  id: string;
  name: string;
  amount: number;
}

interface BankAccount {
  id: string;
  balance: number;
}

const Goals: React.FC = () => {
  const { currentUser } = useAuth();
  const [newGoal, setNewGoal] = useState<{ name: string; amount: string }>({ name: '', amount: '' });
  const [goals, setGoals] = useState<Goal[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]); // Added state for bank accounts

  useEffect(() => {
    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      const unsub = onSnapshot(userRef, (doc) => {
        const data = doc.data();
        if (data) {
          if (data.goals) {
            setGoals(data.goals);
          }
          if (data.bankAccounts) {
            setBankAccounts(data.bankAccounts);
          }
        }
      });

      return () => unsub();
    }
  }, [currentUser]);

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newGoal.name || !newGoal.amount) {
      alert("Please fill in all fields");
      return;
    }

    const amount = parseFloat(newGoal.amount);
    if (isNaN(amount)) {
      alert("Please enter a valid number for amount");
      return;
    }

    const newGoalData: Goal = {
      id: uuidv4(),
      name: newGoal.name,
      amount: amount
    };

    const updatedGoals = [...goals, newGoalData];

    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, { goals: updatedGoals }, { merge: true });
    }
    setNewGoal({ name: '', amount: '' });
  };

  const deleteGoal = async (id: string) => {
    const goalToDelete = goals.find(goal => goal.id === id);
    const updatedGoals = goals.filter(goal => goal.id !== id);

    if (currentUser && goalToDelete) {
      const userRef = doc(db, 'users', currentUser.uid);
      const batch = writeBatch(db);

      // Update goals
      batch.set(userRef, { goals: updatedGoals }, { merge: true });

      const account = bankAccounts.find(acc => acc.id === goalToDelete.id);
      if (account) {
        const updatedAccounts = bankAccounts.map(acc =>
          acc.id === account.id
            ? { ...acc, balance: acc.balance + goalToDelete.amount }
            : acc
        );
        batch.set(userRef, { bankAccounts: updatedAccounts }, { merge: true });
      }

      await batch.commit();
    }
  };

  return (
    <div className="flex h-screen w-screen bg-gray-100">
      <Sidebar page="Goals" />
      <main className="flex-1 flex flex-col p-6 overflow-auto">
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <DashboardHeader Page_Name="Goals" />
        </div>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold">Goals</h2>
            </CardHeader>
            <CardContent>
              {goals.map((goal) => (
                <div key={goal.id} className="mb-4 p-4 bg-white rounded-lg shadow">
                  <h3 className="text-xl font-semibold">{goal.name}</h3>
                  <p className="text-lg">Amount: £{goal.amount.toFixed(2)}</p>
                  <Button onClick={() => deleteGoal(goal.id)} className="mt-2 bg-red-500 text-white hover:bg-red-600">
                    Delete
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold">Add New Goal</h2>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddGoal} className="space-y-4">
                <Input
                  id="goalName"
                  label="Goal Name"
                  type="text"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  placeholder="e.g., Save for vacation"
                />

                <Input
                  id="goalAmount"
                  label="Goal Amount"
                  type="number"
                  value={newGoal.amount}
                  onChange={(e) => setNewGoal({ ...newGoal, amount: e.target.value })}
                  placeholder="e.g., 1000"
                />
                <Button type="submit">Add Goal</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Goals;
