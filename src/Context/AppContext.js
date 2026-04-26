import React, { createContext, useState, useEffect, useCallback } from "react";
import { transactionService, authService, goalService } from "../services/api"; // Ensure goalService is in api.js

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [expense, setExpense] = useState(0);
  const [income, setIncome] = useState(0);
  const [limit, setLimit] = useState(0);
  const [savings, setSavings] = useState(0);
  const [activeGoal, setActiveGoal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchTransactions(), fetchGoal()]);
    setLoading(false);
  };

  const fetchGoal = async () => {
    try {
      const res = await goalService.getGoal();
      if (res.success && res.goal) setActiveGoal(res.goal);
    } catch (err) { console.error("Goal Error", err); }
  };

  const fetchTransactions = async () => {
    try {
      const res = await transactionService.getTransactions();
      if (res.success) {
        const userTxns = res.data.transactions;
        setTransactions(userTxns);
        if (res.data.user?.limit !== undefined) setLimit(res.data.user.limit);

        let tInc = 0, tExp = 0;
        userTxns.forEach((txn) => {
          if (txn.type === "income") tInc += txn.amount;
          else tExp += txn.amount;
        });

        setIncome(tInc);
        setExpense(tExp);
        setBalance(tInc - tExp);
        // Calculate savings as remainder of income after expenses
        setSavings(tInc > tExp ? tInc - tExp : 0);
      }
    } catch (err) { console.error(err); }
  };

  const setMonthlyGoal = async (goalData) => {
    try {
      const res = await goalService.saveGoal(goalData);
      if (res.success) {
        setActiveGoal(res.goal);
        return true;
      }
      return false;
    } catch (err) { return false; }
  };

  const getWeeklyStats = useCallback(() => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const chartData = last7Days.map(date => {
      return transactions
        .filter(t => t.type === "expense" && t.date.split('T')[0] === date)
        .reduce((sum, t) => sum + t.amount, 0);
    });

    return {
      labels: last7Days.map(d => d.split('-')[2]),
      datasets: [{ data: chartData }]
    };
  }, [transactions]);

  const addTransaction = async (amount, category, note, type) => {
    try {
      const numericAmount = parseFloat(amount);
      const res = await transactionService.addTransaction({ type, amount: numericAmount, category, note });
      if (res.success) {
        fetchTransactions();
        return true; 
      }
      return false;
    } catch (err) { return false; }
  };

  return (
    <AppContext.Provider value={{ 
      transactions, balance, expense, income, limit, savings, 
      activeGoal, setMonthlyGoal, addTransaction, 
      updateBudgetLimit: authService.updateLimit, 
      fetchTransactions, getWeeklyStats, loading 
    }}>
      {children}
    </AppContext.Provider>
  );
};