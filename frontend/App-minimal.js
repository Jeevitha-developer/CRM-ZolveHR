import React, { useState } from 'react';

function App() {
  const [user, setUser] = useState(null);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold text-center mb-6">HRMS CRM Login</h1>
          <button 
            onClick={() => setUser({ name: 'Demo User' })}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Demo Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">HRMS CRM Dashboard</h1>
          <button 
            onClick={() => setUser(null)}
            className="bg-gray-800 text-white px-4 py-2 rounded text-sm"
          >
            Logout
          </button>
        </div>
      </nav>
      <main className="p-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Welcome, {user.name}!</h2>
          <p className="text-gray-600">
            CRM system is loading. This is a minimal version to test connectivity.
          </p>
          <div className="mt-4 grid    md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded">
              <h3 className="font-medium">Clients</h3>
              <p className="text-2xl font-bold">3</p>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <h3 className="font-medium">Active Subscriptions</h3>
              <p className="text-2xl font-bold">2</p>
            </div>
            <div className="bg-purple-50 p-4 rounded">
              <h3 className="font-medium">Revenue</h3>
              <p className="text-2xl font-bold">₹9,000</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;