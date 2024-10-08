import React, { useState, useEffect } from 'react';
import Sidebar from './ui/sidebar';
import DashboardHeader from './ui/Dashboard_header';
import { Card, CardHeader, CardContent } from './ui/card';
import { Input } from './ui/form';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import { db, doc, setDoc, onSnapshot, writeBatch } from '../firebase';
import { v4 as uuidv4 } from 'uuid';

interface BankAccount {
  id: string;
  name: string;
  balance: number;
  startingbalance?: number;
}

const Bank_Accounts: React.FC = () => {
  const { currentUser } = useAuth();
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [newAccount, setNewAccount] = useState<{ name: string; balance: string }>({ name: '', balance: '' });

  useEffect(() => {
    document.title = "FinancePro | Log Bank Accounts"
    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      const unsub = onSnapshot(userRef, (doc) => {
        const data = doc.data();
        if (data && data.bankAccounts) {
          setBankAccounts(data.bankAccounts);
        }
      });

      return () => unsub();
    }
  }, [currentUser]);
  const formatNumber = (value: number): string => {
    return value.toLocaleString();
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccount.name || !newAccount.balance) {
      alert('Please fill in all fields');
      return;
    }

    const balance = parseFloat(newAccount.balance);
    if (isNaN(balance)) {
      alert('Please enter a valid number for balance');
      return;
    }

    const newBankAccount: BankAccount = {
      id: uuidv4(),
      name: newAccount.name,
      balance: balance,
      startingbalance: balance,
    };

    const updatedAccounts = [...bankAccounts, newBankAccount];

    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, { bankAccounts: updatedAccounts }, { merge: true });
    }

    setNewAccount({ name: '', balance: '' });
  };

  const deleteBank = async (id: string) => {
    const updatedBankAccounts = bankAccounts.filter(account => account.id !== id);

    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      const batch = writeBatch(db);

      batch.set(userRef, { bankAccounts: updatedBankAccounts }, { merge: true });

      await batch.commit();
      setBankAccounts(updatedBankAccounts);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-gray-100">
      <Sidebar page="Bank_Accounts" />
      <main className="flex-1 flex flex-col p-6 overflow-auto">
          <DashboardHeader Page_Name="Bank Accounts" />
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold">Bank Accounts</h2>
            </CardHeader>
            <CardContent>
              {bankAccounts.map((account) => (
                <div key={account.id} className="mb-4 p-4 bg-white rounded-lg shadow flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold">{account.name}</h3>
                    <p className="text-lg">Balance: £{formatNumber(account.balance)}</p>
                  </div>
                  <Button
                    onClick={() => deleteBank(account.id)}
                    className="ml-4 bg-red-600 text-white hover:bg-red-700"
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold">Add New Bank Account</h2>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddAccount} className="space-y-4">
                <Input
                  id="accountName"
                  label="Account Name"
                  type="text"
                  value={newAccount.name}
                  onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                  placeholder="e.g., Savings Account"
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
                />

                <Input
                  id="initialBalance"
                  label="Initial Balance"
                  type="number"
                  value={newAccount.balance}
                  onChange={(e) => setNewAccount({ ...newAccount, balance: e.target.value })}
                  placeholder="e.g., 1000"
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
                />
                <Button
                  type="submit"
                  className="w-full bg-green-600 text-white hover:bg-green-700 rounded-md px-4 py-2 transition duration-300"
                >
                  Add Account
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Bank_Accounts;
