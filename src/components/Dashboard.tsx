import React, {useEffect, useState} from 'react';
import {
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import {eachDayOfInterval, endOfMonth, format, parseISO, startOfMonth} from 'date-fns';
import Sidebar from './ui/sidebar';
import DashboardHeader from './ui/Dashboard_header';
import {Card, CardContent, CardHeader} from './ui/card';
import {useAuth} from '../contexts/AuthContext';
import {db, doc, onSnapshot} from '../firebase';
import axios from 'axios';

const FINNHUB_API_KEY = process.env.REACT_APP_INVESTMENTS_KEY;

interface BankAccount {
  id: string;
  name: string;
  balance: number;
  startingbalance: number;
}

interface Expense {
  id: string;
  name: string;
  amount: number;
  category: string;
  date: string;
}

interface Income {
  id: string;
  name: string;
  amount: number;
  date: string;
}

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

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "FinancePro | Overview"
    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      const unsub = onSnapshot(userRef, (doc) => {
        const data = doc.data();
        if (data) {
          if (data.bankAccounts) setBankAccounts(data.bankAccounts);
          if (data.expenses) setExpenses(data.expenses);
          if (data.income) setIncomes(data.income);
          if (data.investments) setInvestments(data.investments);
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
      const newPriceData: PriceData[] = [];

      for (const symbol of uniqueSymbols) {
        try {
          const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
          const response = await axios.get(url);
          const price = parseFloat(response.data.c);

          if (price !== undefined) {
            newPriceData.push({ symbol, price });
          } else {
            console.warn(`No price data available for ${symbol}`);
          }
        } catch (err) {
          console.error(`Error fetching price for ${symbol}:`, err);
          setError(prevError => prevError ? `${prevError}\nFailed to fetch price for ${symbol}.` : `Failed to fetch price for ${symbol}.`);
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

  const totalBalance = bankAccounts.reduce((sum, account) => sum + account.balance, 0);
  const currentMonthStart = startOfMonth(new Date());
  const currentMonthEnd = endOfMonth(new Date());

  const expensesThisMonth = expenses.filter(expense => {
    const expenseDate = parseISO(expense.date);
    return expenseDate >= currentMonthStart && expenseDate <= currentMonthEnd;
  });

  const incomesThisMonth = incomes.filter(income => {
    const incomeDate = parseISO(income.date);
    return incomeDate >= currentMonthStart && incomeDate <= currentMonthEnd;
  });

  const totalExpensesThisMonth = expensesThisMonth.reduce((sum, expense) => sum + expense.amount, 0);
  const totalIncomeThisMonth = incomesThisMonth.reduce((sum, income) => sum + income.amount, 0);

  const expensesByCategory = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const pieChartData = Object.entries(expensesByCategory).map(([name, value]) => ({ name, value }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const currentMonth = new Date();
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const startingBalance = bankAccounts.reduce((sum, account) => sum + account.startingbalance, 0);

  const dailyBalances = daysInMonth.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayIncome = incomes.filter(income => income.date === dayStr).reduce((sum, income) => sum + income.amount, 0);
    const dayExpense = expenses.filter(expense => expense.date === dayStr).reduce((sum, expense) => sum + expense.amount, 0);

    const previousDayBalance = daysInMonth
      .slice(0, daysInMonth.indexOf(day))
      .reduce((acc, currDay) => {
        const currDayStr = format(currDay, 'yyyy-MM-dd');
        const currDayIncome = incomes.filter(income => income.date === currDayStr).reduce((sum, income) => sum + income.amount, 0);
        const currDayExpense = expenses.filter(expense => expense.date === currDayStr).reduce((sum, expense) => sum + expense.amount, 0);
        return acc + currDayIncome - currDayExpense;
      }, startingBalance);

    const balance = previousDayBalance + dayIncome - dayExpense;

    return {
      date: format(day, 'dd'),
      balance,
      income: dayIncome,
      expense: dayExpense
    };
  });

  const calculatePortfolioValueOverTime = () => {
      return investments
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .reduce((acc, investment) => {
            const lastValue = acc.length > 0 ? acc[acc.length - 1].value : 0;
            const currentPrice = priceData.find(p => p.symbol === investment.symbol)?.price || investment.price;
            const newValue = investment.action === 'buy'
                ? lastValue + (investment.amount * currentPrice)
                : lastValue - (investment.amount * currentPrice);

            const roundedValue = parseFloat(newValue.toFixed(2));

            acc.push({date: investment.date, value: roundedValue});
            return acc;
        }, [] as { date: string; value: number }[]);
  };


  const portfolioValueOverTime = calculatePortfolioValueOverTime();

  const currentHoldings = investments.reduce((acc, investment) => {
    if (!acc[investment.symbol]) {
      acc[investment.symbol] = 0;
    }
    acc[investment.symbol] += investment.action === 'buy' ? investment.amount : -investment.amount;
    return acc;
  }, {} as Record<string, number>);

  const holdingsChartData = Object.entries(currentHoldings)
    .filter(([_, amount]) => amount > 0)
    .map(([symbol, amount]) => ({ name: symbol, value: amount }));

  const formatNumber = (value: number): string => {
    return value.toLocaleString();
  };

  const NoDataPlaceholder: React.FC = () => (
    <div className="flex items-center justify-center h-full">
      <p className="text-gray-500">No data available</p>
    </div>
  );

  return (
    <div className="flex h-screen w-screen bg-gray-100">
  <Sidebar page="Home" />
  <main className="flex-1 flex flex-col p-6 overflow-auto">
      <DashboardHeader Page_Name="Overview" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-blue-50 border border-blue-200">
        <CardHeader className="text-white">Total Balance</CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-blue-800">£{formatNumber(totalBalance)}</p>
        </CardContent>
      </Card>
      <Card className="bg-red-50 border border-red-200">
        <CardHeader className="text-white">Total Expenses This Month</CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-red-800">£{formatNumber(totalExpensesThisMonth)}</p>
        </CardContent>
      </Card>
      <Card className="bg-green-50 border border-green-200">
        <CardHeader className="text-white">Total Income This Month</CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-green-800">£{formatNumber(totalIncomeThisMonth)}</p>
        </CardContent>
      </Card>
      <Card className="md:col-span-2 bg-gray-50 border border-gray-200">
        <CardHeader className="text-gray-600">Daily Balance (Current Month)</CardHeader>
        <CardContent className="h-64">
          {dailyBalances.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyBalances}>
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => {
                         if (value >= 1_000_000) {
                           return `${(value / 1_000_000).toFixed(2)}M`;
                         } else if (value >= 1_000) {
                           return `${(value / 1_000).toFixed(2)}K`;
                         } else {
                           return value.toFixed(2);
                         }
                       }} />
                <Tooltip />
                <CartesianGrid strokeDasharray="3 3" />
                <Line type="monotone" dataKey="balance" name="Balance" stroke="#8884d8" />
                <Line type="monotone" dataKey="income" name="Income" stroke="#82ca9d" />
                <Line type="monotone" dataKey="expense" name="Expense" stroke="#ff7300" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <NoDataPlaceholder />
          )}
        </CardContent>
      </Card>

      <Card className="bg-purple-50 border border-purple-200">
        <CardHeader className="text-white">Expense Distribution</CardHeader>
        <CardContent className="h-64">
          {pieChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius="80%"
                  fill="#8884d8"
                >
                  {pieChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <NoDataPlaceholder />
          )}
        </CardContent>
      </Card>

      <Card className="md:col-span-2 bg-yellow-50 border border-yellow-200">
        <CardHeader className="text-white">Portfolio Value Over Time</CardHeader>
        <CardContent className="h-64">
          {portfolioValueOverTime.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={portfolioValueOverTime}>
                <XAxis dataKey="date" tickFormatter={(date) => format(parseISO(date), 'MM/dd')} />
                <YAxis />
                <Tooltip formatter={(value) => [`£${formatNumber(value as number)}`, 'Portfolio Value']} />
                <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                <Line type="monotone" dataKey="value" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <NoDataPlaceholder />
          )}
        </CardContent>
      </Card>

      <Card className="bg-teal-50 border border-teal-200">
        <CardHeader className="text-white">Current Holdings</CardHeader>
        <CardContent className="h-64">
          {holdingsChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={holdingsChartData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  fill="#8884d8"
                >
                  {holdingsChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <NoDataPlaceholder />
          )}
        </CardContent>
      </Card>
    </div>
  </main>
</div>

  );
};


export default Dashboard;
