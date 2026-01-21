
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MOCK_USERS } from '../constants';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<string>('');

  const handleRoleSelect = (roleName: string) => {
    const user = MOCK_USERS.find(u => u.role === roleName);
    if (user) {
      onLogin(user);
    }
  };

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg shadow-indigo-200">
          A
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
        <p className="text-slate-500 mt-2">Select a role to login as (Demo)</p>
      </div>

      <div className="space-y-3">
        {Array.from(new Set(MOCK_USERS.map(u => u.role))).map((role) => (
          <button
            key={role}
            onClick={() => handleRoleSelect(role)}
            className="w-full p-4 text-left border border-slate-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all flex items-center justify-between group"
          >
            <div>
              <p className="font-semibold text-slate-800">{role}</p>
              <p className="text-xs text-slate-500">Access {role} Dashboard</p>
            </div>
            <i className="fa-solid fa-chevron-right text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all"></i>
          </button>
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-slate-400">
        AMS v2.5 • Future Corporate Standards
      </p>
    </motion.div>
  );
};

export default Login;
