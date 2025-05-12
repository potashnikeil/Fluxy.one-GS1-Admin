import React from 'react';

export default function Profile() {
  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Profile</h1>
      <form className="space-y-4">
        <input type="email" placeholder="Email" className="w-full p-2 border rounded" />
        <input type="text" placeholder="Name" className="w-full p-2 border rounded" />
        <input type="password" placeholder="New Password" className="w-full p-2 border rounded" />
        <button className="bg-blue-500 text-white px-4 py-2 rounded">Save</button>
      </form>
    </div>
  );
}