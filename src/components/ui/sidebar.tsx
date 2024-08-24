import React from 'react';

const Sidebar = (props: { page: string; }) => {
  return (
    <aside className="sidebar w-64 bg-gray-900 text-white h-full overflow-y-auto">
      <div className="sidebar-header bg-gray-800 p-5">
        <h2 className="text-xl font-semibold">Dashboard</h2>
      </div>
      <nav className="sidebar-nav pt-5">
        <a
          href="/dashboard"
          className={`nav-item block px-5 py-3 transition-colors duration-300 ${
            props.page === "Home" ? "bg-gray-700 text-white" : "text-gray-400 hover:bg-gray-700 hover:text-white"
          }`}
        >
          Home
        </a>
        <a
          href="/income"
          className={`nav-item block px-5 py-3 transition-colors duration-300 ${
            props.page === "Income" ? "bg-gray-700 text-white" : "text-gray-400 hover:bg-gray-700 hover:text-white"
          }`}
        >
          Income
        </a>
        <a
          href="/investments"
          className={`nav-item block px-5 py-3 transition-colors duration-300 ${
            props.page === "Investments" ? "bg-gray-700 text-white" : "text-gray-400 hover:bg-gray-700 hover:text-white"
          }`}
        >
          Investments
        </a>
        <a
          href="/expenses"
          className={`nav-item block px-5 py-3 transition-colors duration-300 ${
            props.page === "Expenses" ? "bg-gray-700 text-white" : "text-gray-400 hover:bg-gray-700 hover:text-white"
          }`}
        >
          Expenses
        </a>
        <a
          href="/one-time-expenses"
          className={`nav-item block px-5 py-3 transition-colors duration-300 ${
            props.page === "One Time Expenses" ? "bg-gray-700 text-white" : "text-gray-400 hover:bg-gray-700 hover:text-white"
          }`}
        >
          One Time Expenses
        </a>
        <a
          href="/settings"
          className={`nav-item block px-5 py-3 transition-colors duration-300 ${
            props.page === "Settings" ? "bg-gray-700 text-white" : "text-gray-400 hover:bg-gray-700 hover:text-white"
          }`}
        >
          Settings
        </a>
      </nav>
    </aside>
  );
};

export default Sidebar;
