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
import { db, doc, setDoc, onSnapshot } from '../firebase';
import Sidebar from './ui/sidebar';
import DashboardHeader from './ui/Dashboard_header';
import { v4 as uuidv4 } from 'uuid';


const FINNHUB_API_KEY = process.env.REACT_APP_INVESTMENTS_KEY;

interface Investment {
  id: string;
  type: 'stock' | 'crypto';
  symbol: string;
  amount: number;
  price: number;
  date: string;
  action: 'buy' | 'sell';
}

interface PriceData {
  symbol: string;
  price: number;
}

const InvestmentsDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [newInvestment, setNewInvestment] = useState<Investment>({
    id: '',
    type: 'stock',
    symbol: '',
    amount: 0,
    price: 0,
    date: new Date().toISOString().slice(0, 10),
    action: 'buy',
  });
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      const userInvestmentsRef = doc(db, 'users', currentUser.uid);
      const unsub = onSnapshot(userInvestmentsRef, (doc) => {
        const data = doc.data();
        if (data && data.investments) {
          setInvestments(data.investments);
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
          const investment = investments.find(inv => inv.symbol === symbol);
          let url;

          if (investment?.type === 'crypto') {
            // endpoint for crypto prices
            url = `https://finnhub.io/api/v1/crypto/candle?symbol=${symbol}&resolution=1&from=${Math.floor(Date.now() / 1000) - 3600}&to=${Math.floor(Date.now() / 1000)}&token=${FINNHUB_API_KEY}`;
          } else {
            // Endpoint for stock prices
            url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
          }

          const response = await axios.get(url);
          console.log(`Response for ${symbol}:`, response.data);  // Log the response data
          let price;

          if (investment?.type === 'crypto') {
            // Check if we got valid data
            if (response.data && response.data.c && response.data.c.length > 0) {
              price = response.data.c[response.data.c.length - 1];  // Use the last closing price
            }
          } else {
            price = parseFloat(response.data.c);  // 'c' is the current price for stocks
          }

          newPriceData.push({ symbol, price });
        } catch (err) {
          console.error(`Error fetching price for ${symbol}:`, err);
          setError(`Failed to fetch price for ${symbol}. Please try again later.`);
        }
      }

      setPriceData(newPriceData);
      setLoading(false);
    };



    if (investments.length > 0) {
      fetchPrices();
      const interval = setInterval(fetchPrices, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [investments]);

  const handleInvestmentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewInvestment(prev => ({
      ...prev,
      [name]: name === 'amount' || name === 'price' ? parseFloat(value) : value,
    }));
  };

  const handleAddInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInvestment(newInvestment)) return;

    const investmentToAdd = {
      ...newInvestment,
      id: uuidv4(),
    };

    const updatedInvestments = [...investments, investmentToAdd];
    setInvestments(updatedInvestments);

    if (currentUser) {
      const userInvestmentsRef = doc(db, 'users', currentUser.uid);
      await setDoc(userInvestmentsRef, { investments: updatedInvestments }, { merge: true });
    }

    resetNewInvestment();
  };

  const handleEditInvestment = (investment: Investment) => {
    setNewInvestment(investment);
    setEditingInvestment(investment);
    setEditMode(true);
  };

  const handleUpdateInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInvestment(newInvestment)) return;

    const updatedInvestments = investments.map(inv =>
      inv.id === editingInvestment?.id ? newInvestment : inv
    );

    setInvestments(updatedInvestments);

    if (currentUser) {
      const userInvestmentsRef = doc(db, 'users', currentUser.uid);
      await setDoc(userInvestmentsRef, { investments: updatedInvestments }, { merge: true });
    }

    resetNewInvestment();
    setEditingInvestment(null);
  };

  const handleDeleteInvestment = async (investment: Investment) => {
    const updatedInvestments = investments.filter(inv => inv.id !== investment.id);
    setInvestments(updatedInvestments);

    if (currentUser) {
      const userInvestmentsRef = doc(db, 'users', currentUser.uid);
      await setDoc(userInvestmentsRef, { investments: updatedInvestments }, { merge: true });
    }
  };

  const validateInvestment = (investment: Investment): boolean => {
    if (!investment.symbol || !investment.amount || !investment.price || !investment.date) {
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
      type: 'stock',
      symbol: '',
      amount: 0,
      price: 0,
      date: new Date().toISOString().slice(0, 10),
      action: 'buy',
    });
    setEditMode(false);
  };


  const calculatePortfolioValue = () => {
    return investments.reduce((total, inv) => {
      const currentPrice = priceData.find(p => p.symbol === inv.symbol)?.price || inv.price;
      return total + (inv.action === 'buy' ? 1 : -1) * inv.amount * currentPrice;
    }, 0);
  };

  const chartData = investments.map(inv => ({
    date: inv.date,
    value: inv.amount * inv.price * (inv.action === 'buy' ? 1 : -1),
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="flex h-screen w-screen bg-gray-100">
      <Sidebar page="Investments" />
      <main className="flex flex-col flex-1 p-6 overflow-auto">
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <DashboardHeader Page_Name="Investments" />
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
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4">
                <h4 className="text-lg font-semibold">Total Portfolio Value</h4>
                <p className="text-2xl font-bold">${calculatePortfolioValue().toFixed(2)}</p>
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
                <Select
                  label="Type"
                  id="type"
                  name="type"
                  value={newInvestment.type}
                  onChange={handleInvestmentChange}
                >
                  <option value="stock">Stock</option>
                  <option value="crypto">Cryptocurrency</option>
                </Select>
                <Input
                  label="Symbol"
                  type="text"
                  id="symbol"
                  name="symbol"
                  value={newInvestment.symbol}
                  onChange={handleInvestmentChange}
                  placeholder="e.g., AAPL, BTC"
                />
                <Input
                  label="Amount"
                  type="number"
                  id="amount"
                  name="amount"
                  value={newInvestment.amount}
                  onChange={handleInvestmentChange}
                  placeholder="Number of shares or coins"
                />
                <Input
                  label="Price"
                  type="number"
                  id="price"
                  name="price"
                  value={newInvestment.price}
                  onChange={handleInvestmentChange}
                  placeholder="Price per share or coin"
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
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {editMode ? 'Update Investment' : 'Add Investment'}
                </Button>
              </form>
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
                      <p className="font-semibold">{investment.symbol} ({investment.type})</p>
                      <p>{investment.action === 'buy' ? 'Bought' : 'Sold'} {investment.amount} @ ${investment.price}</p>
                      <p className="text-sm text-gray-500">{investment.date}</p>
                    </div>
                    <div>
                      <p className="font-bold">
                        Current: ${priceData.find(p => p.symbol === investment.symbol)?.price.toFixed(2) || 'Loading...'}
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