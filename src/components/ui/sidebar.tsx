import React from 'react';

const Sidebar = (props: { page: string; }) => {
  return (
    <aside className="w-64 bg-gray-800 text-white h-full flex flex-col">
      <div className="bg-gray-700 p-6 flex items-center">
        <h2 className="text-2xl font-bold">FinancePro</h2>
      </div>
      <nav className="flex-1 pt-6">
        <a
          href="/dashboard"
          className={`block px-6 py-3 transition-colors duration-300 rounded-lg ${
            props.page === "Home" ? "bg-gray-600 text-white" : "text-gray-300 hover:bg-gray-600 hover:text-white"
          }`}
        >
          Overview
        </a>
        <a
          href="/bank-accounts"
          className={`block px-6 py-3 transition-colors duration-300 rounded-lg ${
            props.page === "Bank_Accounts" ? "bg-gray-600 text-white" : "text-gray-300 hover:bg-gray-600 hover:text-white"
          }`}
        >
          Bank Accounts
        </a>
        <a
          href="/goals"
          className={`block px-6 py-3 transition-colors duration-300 rounded-lg ${
            props.page === "Goals" ? "bg-gray-600 text-white" : "text-gray-300 hover:bg-gray-600 hover:text-white"
          }`}
        >
          Goals
        </a>
        <a
          href="/income"
          className={`block px-6 py-3 transition-colors duration-300 rounded-lg ${
            props.page === "Income" ? "bg-gray-600 text-white" : "text-gray-300 hover:bg-gray-600 hover:text-white"
          }`}
        >
          Income
        </a>
        <a
          href="/expenses"
          className={`block px-6 py-3 transition-colors duration-300 rounded-lg ${
            props.page === "Expenses" ? "bg-gray-600 text-white" : "text-gray-300 hover:bg-gray-600 hover:text-white"
          }`}
        >
          Expenses
        </a>
        <a
          href="/investments"
          className={`block px-6 py-3 transition-colors duration-300 rounded-lg ${
            props.page === "Investments" ? "bg-gray-600 text-white" : "text-gray-300 hover:bg-gray-600 hover:text-white"
          }`}
        >
          Investments
        </a>
      </nav>
    </aside>
  );
};

export default Sidebar;
