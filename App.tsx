
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, UserRole, Appraisal, AppraisalStatus } from './types';
import { MOCK_USERS, MOCK_APPRAISALS } from './constants';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import SecondLevelDashboard from './components/SecondLevelDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';
import Sidebar from './components/Sidebar';
import Login from './components/Login';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [appraisals, setAppraisals] = useState<Appraisal[]>(MOCK_APPRAISALS);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [activePage, setActivePage] = useState('dashboard');

  useEffect(() => {
    const saved = localStorage.getItem('ams_user');
    if (saved) setCurrentUser(JSON.parse(saved));
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setActivePage('dashboard');
    localStorage.setItem('ams_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ams_user');
  };

  const updateAppraisal = (updated: Appraisal) => {
    setAppraisals(prev => prev.map(a => a.id === updated.id ? updated : a));
  };

  const triggerNewAppraisal = (employeeId: string, month: string) => {
    const newApp: Appraisal = {
      id: `app-${Date.now()}`,
      employeeId,
      month,
      year: new Date().getFullYear(),
      status: AppraisalStatus.PENDING_ASSIGNMENT,
      hrId: undefined,
      tlId: undefined,
      managerId: undefined,
      ratings: [],
      availableStatuses: {}
    };
    setAppraisals(prev => [...prev, newApp]);
  };

  const handleAddUser = (newUser: User) => {
    setUsers(prev => [...prev, newUser]);
  };

  const renderContent = () => {
    if (!currentUser) return null;

    if (activePage === 'users') {
      return (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">User Directory</h2>
            <span className="bg-indigo-100 text-indigo-600 px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest">Total: {users.length} Active</span>
          </div>
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Name</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Role</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Department</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm">{u.name.charAt(0)}</div>
                        <span className="font-bold text-slate-700">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm font-medium text-slate-500">{u.role}</td>
                    <td className="px-8 py-6 text-sm font-medium text-slate-500">{u.department}</td>
                    <td className="px-8 py-6"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-2"></span><span className="text-[10px] font-black uppercase text-emerald-500">Active</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (activePage === 'cycles') {
      return (
        <div className="space-y-10">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Appraisal Cycles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {['January', 'April', 'July', 'October'].map(m => (
              <div key={m} className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <i className="fa-solid fa-calendar-days text-6xl"></i>
                </div>
                <h4 className="text-2xl font-black text-slate-900 mb-2">{m} 2025</h4>
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-6">System Window Open</p>
                <button className="w-full bg-slate-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all">Configure Window</button>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activePage === 'career' && currentUser.role === UserRole.EMPLOYEE) {
      return (
        <div className="space-y-10">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Career Matrix</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 bg-slate-900 p-12 rounded-[4rem] text-white">
              <h3 className="text-2xl font-black mb-8">Skill Benchmarks</h3>
              <div className="space-y-8">
                {['Technical Architecture', 'Team Leadership', 'Strategic Planning', 'Domain Expertise'].map(skill => (
                  <div key={skill} className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-indigo-400">{skill}</span>
                      <span>Level 4 / 5</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 w-[80%] rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-xl flex flex-col justify-center items-center text-center">
              <div className="w-32 h-32 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                <i className="fa-solid fa-award text-5xl text-indigo-600"></i>
              </div>
              <h4 className="text-2xl font-black text-slate-900 mb-2">Senior Tier</h4>
              <p className="text-slate-400 text-sm font-medium mb-8">You are 15% away from reaching the Executive level.</p>
              <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">View Roadmap</button>
            </div>
          </div>
        </div>
      );
    }

    if (activePage === 'reports') {
      return (
        <div className="space-y-10">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Performance Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Avg Org Rating</p>
              <h4 className="text-4xl font-black mt-2">8.4</h4>
            </div>
            <div className="bg-emerald-500 p-8 rounded-[2.5rem] text-white">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Completion</p>
              <h4 className="text-4xl font-black mt-2">92%</h4>
            </div>
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">High Performers</p>
              <h4 className="text-4xl font-black mt-2">14</h4>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Reviews Pending</p>
              <h4 className="text-4xl font-black mt-2 text-slate-900">03</h4>
            </div>
          </div>
          <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-xl h-80 flex items-end gap-4 overflow-hidden">
            {[40, 70, 45, 90, 65, 80, 55, 95, 30, 85].map((h, i) => (
              <motion.div 
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                className="flex-1 bg-indigo-500/20 rounded-t-xl hover:bg-indigo-500 transition-colors relative group"
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-[10px] font-black text-indigo-600 transition-opacity">
                  {h}%
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      );
    }

    if (activePage === 'tasks') {
      return (
        <div className="space-y-10">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Assigned Tasks</h2>
          <div className="grid grid-cols-1 gap-6">
            {appraisals.filter(a => [a.hrId, a.tlId, a.managerId].includes(currentUser.id)).map(app => (
              <div key={app.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-lg flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 text-2xl">
                    <i className="fa-solid fa-file-signature"></i>
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-slate-900">Review: {users.find(u => u.id === app.employeeId)?.name}</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Due in 4 days • {app.month} Cycle</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActivePage('dashboard')}
                  className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all"
                >
                  Start Assessment
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activePage === 'settings') {
      return (
        <div className="space-y-10">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">System Settings</h2>
          <div className="max-w-2xl bg-white p-12 rounded-[4rem] border border-slate-100 shadow-xl space-y-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Notifications</label>
              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl">
                <span className="font-bold text-slate-700">Appraisal Reminders</span>
                <div className="w-12 h-6 bg-indigo-600 rounded-full flex items-center px-1">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Account Security</label>
              <button className="w-full p-6 text-left bg-slate-50 rounded-2xl font-bold text-slate-700 hover:bg-slate-100 transition-all">Change Account Password</button>
            </div>
            <div className="pt-8 border-t border-slate-100">
               <button 
                onClick={handleLogout}
                className="w-full p-6 bg-rose-50 text-rose-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-3"
               >
                 <i className="fa-solid fa-power-off"></i>
                 Sign Out of Platform
               </button>
            </div>
          </div>
        </div>
      );
    }

    switch (currentUser.role) {
      case UserRole.SUPER_ADMIN:
        return (
          <SuperAdminDashboard 
            currentUser={currentUser} 
            appraisals={appraisals} 
            users={users}
            onUpdateAppraisal={updateAppraisal}
            onTriggerAppraisal={triggerNewAppraisal}
            onAddUser={handleAddUser}
          />
        );
      case UserRole.HR:
      case UserRole.MANAGER:
      case UserRole.TEAM_LEAD:
        return (
          <SecondLevelDashboard 
            currentUser={currentUser} 
            appraisals={appraisals}
            users={users}
            onUpdateAppraisal={updateAppraisal}
          />
        );
      case UserRole.EMPLOYEE:
        return (
          <EmployeeDashboard 
            currentUser={currentUser} 
            appraisals={appraisals}
          />
        );
      default:
        return <div className="p-10 text-center">Unauthorized Access</div>;
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar 
        user={currentUser} 
        onLogout={handleLogout} 
        activePage={activePage} 
        setActivePage={setActivePage} 
      />
      
      <main className="flex-1 lg:ml-80 p-6 lg:p-12">
        <header className="mb-10 flex justify-between items-center lg:hidden bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">A</div>
              <h1 className="text-sm font-black text-slate-900 tracking-tight uppercase">AMS PORTAL</h1>
           </div>
           <button 
            onClick={handleLogout}
            className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all"
           >
             <i className="fa-solid fa-power-off text-sm"></i>
           </button>
        </header>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage + currentUser.role}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default App;
