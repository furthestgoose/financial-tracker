import React, { useState, useEffect } from 'react';
import Sidebar from './ui/sidebar';
import DashboardHeader from './ui/Dashboard_header';
import { Card, CardHeader, CardContent } from './ui/card';
import { Input, Select } from './ui/form';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import { db, doc, setDoc, onSnapshot, writeBatch } from '../firebase';
import { v4 as uuidv4 } from 'uuid';

interface Goal {
  id: string;
  name: string;
  amount: number;
  savedAmount: number;
  accountId: string;
}

interface BankAccount {
  id: string;
  name: string;
  balance: number;
}

const Goals: React.FC = () => {
  const { currentUser } = useAuth();
  const [newGoal, setNewGoal] = useState<{ name: string; amount: string; accountId: string }>({ name: '', amount: '', accountId: '' });
  const [goals, setGoals] = useState<Goal[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [amountToAdd, setAmountToAdd] = useState<{[key: string]: string}>({});

  useEffect(() => {
    document.title = "FinancePro | Log Goals"
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

  const deleteGoal = async (id: string) => {
    const goalToDelete = goals.find(goal => goal.id === id);
    if (!goalToDelete) return;

    const updatedGoals = goals.filter(goal => goal.id !== id);
    const account = bankAccounts.find(acc => acc.id === goalToDelete.accountId);

    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      const batch = writeBatch(db);


      batch.set(userRef, { goals: updatedGoals }, { merge: true });


      if (account) {
        const updatedAccounts = bankAccounts.map(acc =>
          acc.id === account.id
            ? { ...acc, balance: acc.balance + goalToDelete.savedAmount }
            : acc
        );
        batch.set(userRef, { bankAccounts: updatedAccounts }, { merge: true });
      }

      await batch.commit();
    }
  };


  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newGoal.name || !newGoal.amount || !newGoal.accountId) {
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
      amount: amount,
      savedAmount: 0, 
      accountId: newGoal.accountId
    };

    const updatedGoals = [...goals, newGoalData];

    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, { goals: updatedGoals }, { merge: true });
    }

    setNewGoal({ name: '', amount: '', accountId: '' });
  };

  const calculateProgress = (goal: Goal): number => {
    return (goal.savedAmount / goal.amount) * 100;
  };

  const handleAddFunds = async (goalId: string) => {
    if (!currentUser) return;

    const amount = parseFloat(amountToAdd[goalId]);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    const goalToUpdate = goals.find(goal => goal.id === goalId);
    if (!goalToUpdate) return;

    const updatedGoals = goals.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          savedAmount: Math.min(goal.savedAmount + amount, goal.amount),
        };
      }
      return goal;
    });

    const updatedAccounts = bankAccounts.map(account => {
      if (account.id === goalToUpdate.accountId) {
        return {
          ...account,
          balance: Math.max(account.balance - amount, 0),
        };
      }
      return account;
    });

    const userRef = doc(db, 'users', currentUser.uid);
    const batch = writeBatch(db);

    batch.set(userRef, { goals: updatedGoals }, { merge: true });
    batch.set(userRef, { bankAccounts: updatedAccounts }, { merge: true });

    await batch.commit();
    setAmountToAdd({ ...amountToAdd, [goalId]: '' });
  };

  const formatNumber = (value: number): string => {
    return value.toLocaleString();
  };

  return (
    <div className="flex h-screen w-screen bg-gray-100">
      <Sidebar page="Goals" />
      <main className="flex-1 flex flex-col p-6 overflow-auto">
          <DashboardHeader Page_Name="Goals" />
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold">Goals</h2>
            </CardHeader>
            <CardContent className="p-4">
              {goals.map((goal) => {
                const account = bankAccounts.find(acc => acc.id === goal.accountId);
                const progress = calculateProgress(goal);
                const maxAmountCanAdd = account ? account.balance : 0;

                return (
                  <div key={goal.id} className="mb-4 p-4 bg-gray-50 rounded-lg shadow-sm">
                    <h3 className="text-xl font-semibold">{goal.name}</h3>
                    <p className="text-lg text-gray-700">Goal Amount: £{formatNumber(goal.amount)}</p>
                    <p className="text-lg text-gray-700">Saved Amount: £{goal.savedAmount ? formatNumber(goal.savedAmount) : "0.00"}</p>
                    <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                      <div
                        className="bg-green-600 h-4 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-gray-600">{progress.toFixed(2)}% Complete</p>

                    {progress < 100 ? (
                      <>
                        <Input
                          id={`addFunds-${goal.id}`}
                          label="Commit Funds"
                          type="number"
                          value={amountToAdd[goal.id] || ""}
                          onChange={(e) => setAmountToAdd({ ...amountToAdd, [goal.id]: e.target.value })}
                          placeholder="Enter amount"
                          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
                        />
                        <Button
                          onClick={() => handleAddFunds(goal.id)}
                          className="mt-2 bg-green-500 text-white hover:bg-green-600 rounded-md px-4 py-2 transition duration-300"
                          disabled={!account || parseFloat(amountToAdd[goal.id]) <= 0 || parseFloat(amountToAdd[goal.id]) > maxAmountCanAdd}
                        >
                          Add Funds
                        </Button>
                      </>
                    ) : (
                      <p className="text-green-600 font-semibold">Goal Reached!</p>
                    )}

                    <Button onClick={() => deleteGoal(goal.id)} className="mt-2 bg-red-500 text-white hover:bg-red-600 rounded-md px-4 py-2 transition duration-300">
                      Delete
                    </Button>
                  </div>
                );
              })}
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
                  onChange={(e) => setNewGoal(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Save for vacation"
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
                />

                <Input
                  id="goalAmount"
                  label="Goal Amount"
                  type="number"
                  value={newGoal.amount}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="e.g., 1000"
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
                />

                <Select
                  label="Account Select:"
                  id="accountSelect"
                  value={newGoal.accountId}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, accountId: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
                >
                  <option value="">Select Bank Account</option>
                  {bankAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} (Balance: £{account.balance ? formatNumber(account.balance) : "0.00"})
                    </option>
                  ))}
                </Select>

                <Button type="submit" className="w-full bg-green-600 text-white hover:bg-green-700 rounded-md px-4 py-2 transition duration-300">
                  Add Goal
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Goals;
