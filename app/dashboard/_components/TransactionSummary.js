import React from "react";

const TransactionSummary = ({ transactions }) => {
  // Calculate total income and expenses
  const income = transactions
    .filter((tx) => tx.amount > 0)
    .reduce((acc, tx) => acc + tx.amount, 0);

  const expenses = transactions
    .filter((tx) => tx.amount < 0)
    .reduce((acc, tx) => acc + tx.amount, 0);

  const balance = income + expenses;

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-2xl font-bold mb-4">Transaction Summary</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-green-100 rounded-lg">
          <h3 className="text-lg font-semibold">Income</h3>
          <p className="text-green-700">${income.toFixed(2)}</p>
        </div>
        <div className="p-4 bg-red-100 rounded-lg">
          <h3 className="text-lg font-semibold">Expenses</h3>
          <p className="text-red-700">${Math.abs(expenses).toFixed(2)}</p>
        </div>
        <div className="p-4 bg-blue-100 rounded-lg">
          <h3 className="text-lg font-semibold">Balance</h3>
          <p className="text-blue-700">${balance.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default TransactionSummary;
