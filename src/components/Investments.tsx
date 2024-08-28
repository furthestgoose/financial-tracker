import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { Card, CardHeader, CardContent } from './ui/card';
import { Input, Select } from './ui/form';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import { db, doc, onSnapshot, writeBatch } from '../firebase';
import Sidebar from './ui/sidebar';
import DashboardHeader from './ui/Dashboard_header';
import { v4 as uuidv4 } from 'uuid';

const FINNHUB_API_KEY = process.env.REACT_APP_INVESTMENTS_KEY;

interface Investment {
  id: string;
  symbol: string;
  amount: number;
  price: number;
  date: string;
  action: 'buy' | 'sell';
  accountId: string;
}

interface PriceData {
  symbol: string;
  price: number;
}

interface BankAccount {
  id: string;
  name: string;
  balance: number;
}

const InvestmentsDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [newInvestment, setNewInvestment] = useState<Investment>({
    id: '',
    symbol: '',
    amount: 0,
    price: 0,
    date: new Date().toISOString().slice(0, 10),
    action: 'buy',
    accountId: '',
  });
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [symbolError, setSymbolError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      const unsub = onSnapshot(userRef, (doc) => {
        const data = doc.data();
        if (data) {
          if (data.investments) {
            setInvestments(data.investments);
          }
          if (data.bankAccounts) {
            setBankAccounts(data.bankAccounts);
          }
        }
      });

      return () => unsub();
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchPrices = async () => {
      setLoading(true);
      setError(null);
      const uniqueSymbols = [...new Set(investments.map(inv => inv.symbol))];
      const newPriceData = [];

      for (const symbol of uniqueSymbols) {
        try {
          const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
          const response = await axios.get(url);
          console.log(`Finnhub response for ${symbol}:`, response.data);
          const price = parseFloat(response.data.c);

          if (price !== undefined) {
            newPriceData.push({ symbol, price });
          } else {
            console.warn(`No price data available for ${symbol}`);
          }
        } catch (err) {
          console.error(`Error fetching price for ${symbol}:`, err);
          setError((prevError) => prevError ? `${prevError}\nFailed to fetch price for ${symbol}.` : `Failed to fetch price for ${symbol}.`);
        }
      }

      setPriceData(newPriceData);
      setLoading(false);
    };

    if (investments.length > 0) {
      fetchPrices();
      const interval = setInterval(fetchPrices, 60000); 
      return () => clearInterval(interval);
    }
  }, [investments]);




    const formatGBP = (value: number) => {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value);
  };

  const handleInvestmentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewInvestment(prev => ({
      ...prev,
      [name]: name === 'amount' || name === 'price' ? parseFloat(value) : value,
    }));

    if (name === 'symbol') {
      setSymbolError(null);
    }
  };

  const validateSymbol = async (symbol: string): Promise<boolean> => {
    try {
      const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
      const response = await axios.get(url);
      return response.data.c !== null;
    } catch (err) {
      console.error(`Error validating symbol ${symbol}:`, err);
      return false;
    }
  };

  const handleAddInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInvestment(newInvestment)) return;

    const isValidSymbol = await validateSymbol(newInvestment.symbol);
    if (!isValidSymbol) {
      setSymbolError('Invalid stock symbol. Please enter a valid NYSE or NASDAQ symbol.');
      return;
    }

    const totalCost = newInvestment.amount * newInvestment.price;
    const selectedAccount = bankAccounts.find(acc => acc.id === newInvestment.accountId);

    if (!selectedAccount) {
      setError('Please select a valid bank account.');
      return;
    }

    if (newInvestment.action === 'buy' && selectedAccount.balance < totalCost) {
      setError('Insufficient funds in the selected account.');
      return;
    }

    const investmentToAdd = {
      ...newInvestment,
      id: uuidv4(),
    };

    const updatedInvestments = [...investments, investmentToAdd];
    const updatedAccounts = bankAccounts.map(acc => {
      if (acc.id === selectedAccount.id) {
        return {
          ...acc,
          balance: newInvestment.action === 'buy'
            ? acc.balance - totalCost
            : acc.balance + totalCost
        };
      }
      return acc;
    });

    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      const batch = writeBatch(db);

      batch.set(userRef, { investments: updatedInvestments }, { merge: true });
      batch.set(userRef, { bankAccounts: updatedAccounts }, { merge: true });

      try {
        await batch.commit();
        setInvestments(updatedInvestments);
        setBankAccounts(updatedAccounts);
        resetNewInvestment();
      } catch (err) {
        console.error('Error updating data:', err);
        setError('Failed to update investment and account data.');
      }
    }
  };

  const handleEditInvestment = (investment: Investment) => {
    setNewInvestment(investment);
    setEditingInvestment(investment);
    setEditMode(true);
  };

  const handleUpdateInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInvestment(newInvestment)) return;

    const isValidSymbol = await validateSymbol(newInvestment.symbol);
    if (!isValidSymbol) {
      setSymbolError('Invalid stock symbol. Please enter a valid NYSE or NASDAQ symbol.');
      return;
    }

    if (!editingInvestment) {
      setError('No investment selected for editing.');
      return;
    }

    const oldTotalCost = editingInvestment.amount * editingInvestment.price;
    const newTotalCost = newInvestment.amount * newInvestment.price;
    const costDifference = newTotalCost - oldTotalCost;

    const selectedAccount = bankAccounts.find(acc => acc.id === newInvestment.accountId);
    if (!selectedAccount) {
      setError('Please select a valid bank account.');
      return;
    }

    if (newInvestment.action === 'buy' && selectedAccount.balance < costDifference) {
      setError('Insufficient funds in the selected account for this update.');
      return;
    }

    const updatedInvestments = investments.map(inv =>
      inv.id === editingInvestment.id ? newInvestment : inv
    );

    const updatedAccounts = bankAccounts.map(acc => {
      if (acc.id === selectedAccount.id) {
        return {
          ...acc,
          balance: newInvestment.action === 'buy'
            ? acc.balance - costDifference
            : acc.balance + costDifference
        };
      }
      return acc;
    });

    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      const batch = writeBatch(db);

      batch.set(userRef, { investments: updatedInvestments }, { merge: true });
      batch.set(userRef, { bankAccounts: updatedAccounts }, { merge: true });

      try {
        await batch.commit();
        setInvestments(updatedInvestments);
        setBankAccounts(updatedAccounts);
        resetNewInvestment();
        setEditingInvestment(null);
      } catch (err) {
        console.error('Error updating data:', err);
        setError('Failed to update investment and account data.');
      }
    }
  };

  const handleDeleteInvestment = async (investment: Investment) => {
    const totalCost = investment.amount * investment.price;
    const selectedAccount = bankAccounts.find(acc => acc.id === investment.accountId);

    if (!selectedAccount) {
      setError('Associated bank account not found.');
      return;
    }

    const updatedInvestments = investments.filter(inv => inv.id !== investment.id);
    const updatedAccounts = bankAccounts.map(acc => {
      if (acc.id === selectedAccount.id) {
        return {
          ...acc,
          balance: investment.action === 'buy'
            ? acc.balance + totalCost
            : acc.balance - totalCost
        };
      }
      return acc;
    });

    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      const batch = writeBatch(db);

      batch.set(userRef, { investments: updatedInvestments }, { merge: true });
      batch.set(userRef, { bankAccounts: updatedAccounts }, { merge: true });

      try {
        await batch.commit();
        setInvestments(updatedInvestments);
        setBankAccounts(updatedAccounts);
      } catch (err) {
        console.error('Error deleting investment:', err);
        setError('Failed to delete investment and update account data.');
      }
    }
  };

  const validateInvestment = (investment: Investment): boolean => {
    if (!investment.symbol || !investment.amount || !investment.price || !investment.date || !investment.accountId) {
      alert('Please fill out all fields.');
      return false;
    }

    if (investment.amount <= 0 || investment.price <= 0) {
      alert('Amount and price must be positive numbers.');
      return false;
    }

    return true;
  };

  const resetNewInvestment = () => {
    setNewInvestment({
      id: '',
      symbol: '',
      amount: 0,
      price: 0,
      date: new Date().toISOString().slice(0, 10),
      action: 'buy',
      accountId: '',
    });
    setEditMode(false);
    setSymbolError(null);
    setError(null);
  };

  const calculatePortfolioValue = () => {
    return investments.reduce((total, inv) => {
      const currentPrice = priceData.find(p => p.symbol === inv.symbol)?.price || inv.price;
      return total + (inv.action === 'buy' ? 1 : -1) * inv.amount * currentPrice;
    }, 0);
  };

  const calculateCumulativePortfolioValue = () => {
    let cumulativeValue: number = 0;
    return investments
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(inv => {
        const currentPrice = priceData.find(p => p.symbol === inv.symbol)?.price || inv.price;
        cumulativeValue += (inv.action === 'buy' ? 1 : -1) * inv.amount * currentPrice;
        return {
          date: inv.date,
          cumulativeValue: parseFloat(cumulativeValue.toFixed(2)),
        };
      });
  };

  const chartData = calculateCumulativePortfolioValue();

  return (
    <div className="flex h-screen w-screen bg-gray-100">
      <Sidebar page="Investments" />
      <main className="flex flex-col flex-1 p-6 overflow-auto">
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <DashboardHeader Page_Name="Stock Investments (GBP)" />
        </div>

        <div className="content-body grid grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Portfolio Overview</h3>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <XAxis dataKey="date" tickFormatter={(date) => format(parseISO(date), 'MM/dd')} />
                  <YAxis tickFormatter={(value) => `${value.toFixed(0)}`} />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip formatter={(value) => [formatGBP(value as number), 'Portfolio Value']} />
                  <Line type="monotone" dataKey="cumulativeValue" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4">
                <h4 className="text-lg font-semibold">Total Portfolio Value</h4>
                <p className="text-2xl font-bold">{formatGBP(calculatePortfolioValue())}</p>
              </div>
              {loading && <p>Updating prices...</p>}
              {error && <p className="text-red-500">{error}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Add/Edit Investment</h3>
            </CardHeader>
            <CardContent>
              <form onSubmit={editMode ? handleUpdateInvestment : handleAddInvestment} className="space-y-4">
                <Input
                  label="Stock Symbol"
                  type="text"
                  id="symbol"
                  name="symbol"
                  value={newInvestment.symbol}
                  onChange={handleInvestmentChange}
                  placeholder="e.g., AAPL"
                />
                {symbolError && <p className="text-red-500">{symbolError}</p>}
                <Input
                  label="Amount"
                  type="number"
                  id="amount"
                  name="amount"
                  value={newInvestment.amount}
                  onChange={handleInvestmentChange}
                  placeholder="Number of shares"
                />
                <Input
                  label="Price per share(GBP)"
                  type="number"
                  id="price"
                  name="price"
                  value={newInvestment.price}
                  onChange={handleInvestmentChange}
                  placeholder="Price per share in GBP"
                />
                <Input
                  label="Date"
                  type="date"
                  id="date"
                  name="date"
                  value={newInvestment.date}
                  onChange={handleInvestmentChange}
                />
                <Select
                  label="Action"
                  id="action"
                  name="action"
                  value={newInvestment.action}
                  onChange={handleInvestmentChange}
                >
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </Select>
                <Select
                  label="Bank Account"
                  id="accountId"
                  name="accountId"
                  value={newInvestment.accountId}
                  onChange={handleInvestmentChange}
                >
                  <option value="">Select Bank Account</option>
                  {bankAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} (Balance: {formatGBP(account.balance)})
                    </option>
                  ))}
                </Select>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {editMode ? 'Update Investment' : 'Add Investment'}
                </Button>
              </form>
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </CardContent>
          </Card>

          <Card className="col-span-2">
            <CardHeader>
              <h3 className="text-xl font-semibold">Investment Entries</h3>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-gray-200">
                {investments.map((investment) => (
                  <li key={investment.id} className="py-4 flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{investment.symbol}</p>
                      <p>{investment.action === 'buy' ? 'Bought' : 'Sold'} {investment.amount} @ {formatGBP(investment.price)}</p>
                      <p className="text-sm text-gray-500">Account: {bankAccounts.find(acc => acc.id === investment.accountId)?.name}</p>
                      <p className="text-sm text-gray-500">{investment.date}</p>
                    </div>
                    <div>
                      <p className="font-bold">
                        Current: {formatGBP(priceData.find(p => p.symbol === investment.symbol)?.price || 0)}
                      </p>
                      <Button onClick={() => handleEditInvestment(investment)} className="mr-2">
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteInvestment(investment)}
                        className="bg-red-500 hover:bg-red-600 text-white"
                      >
                        Delete
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default InvestmentsDashboard;