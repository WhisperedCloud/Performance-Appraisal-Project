
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Appraisal, UserRole, AppraisalStatus } from '../types';

interface Props {
  currentUser: User;
  appraisals: Appraisal[];
  users: User[];
  onUpdateAppraisal: (updated: Appraisal) => void;
  onTriggerAppraisal: (empId: string, month: string) => void;
  onAddUser: (user: User) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const SuperAdminDashboard: React.FC<Props> = ({ currentUser, appraisals, users, onUpdateAppraisal, onTriggerAppraisal, onAddUser }) => {
  const [selectedMonth, setSelectedMonth] = useState('April');
  const [activeTab, setActiveTab] = useState<'appraisals' | 'users'>('appraisals');
  const [showMOMModal, setShowMOMModal] = useState<Appraisal | null>(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<User | null>(null);
  const [momText, setMomText] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // New User Form State
  const [newUser, setNewUser] = useState({
    name: '',
    role: UserRole.EMPLOYEE,
    department: '',
    email: '',
    joiningDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const employeesDue = appraisals.filter(a => a.month === selectedMonth);
  const hrUsers = users.filter(u => u.role === UserRole.HR);
  const tlUsers = users.filter(u => u.role === UserRole.TEAM_LEAD);
  const mgmtUsers = users.filter(u => u.role === UserRole.MANAGER);

  const getUserAppraisals = (userId: string) => {
    return appraisals.filter(a => a.employeeId === userId).sort((a, b) => b.year - a.year);
  };

  const handleAssign = (appId: string, role: string, userId: string) => {
    if (!userId) return;
    const appraisal = appraisals.find(a => a.id === appId);
    if (!appraisal) return;
    
    const empName = users.find(u => u.id === appraisal.employeeId)?.name || 'Employee';
    const roleTitle = role.toUpperCase();
    const evaluatorName = users.find(u => u.id === userId)?.name;

    const updated = { ...appraisal };
    if (role === 'hr') updated.hrId = userId;
    if (role === 'tl') updated.tlId = userId;
    if (role === 'manager') updated.managerId = userId;
    
    if (updated.hrId && updated.tlId && updated.managerId) {
      updated.status = AppraisalStatus.IN_PROGRESS;
    }
    
    onUpdateAppraisal(updated);
    setToast({ 
      message: `${evaluatorName} assigned as ${roleTitle} for ${empName}`, 
      type: 'success' 
    });
  };

  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `user-${Date.now()}`;
    onAddUser({ id, ...newUser });
    setShowCreateUser(false);
    setNewUser({
      name: '',
      role: UserRole.EMPLOYEE,
      department: '',
      email: '',
      joiningDate: new Date().toISOString().split('T')[0]
    });
    setToast({ message: `New ${newUser.role} added: ${newUser.name}`, type: 'success' });
  };

  const handleFinalize = (appraisal: Appraisal) => {
    onUpdateAppraisal({
      ...appraisal,
      status: AppraisalStatus.FINALIZED,
      finalMOM: momText,
      incrementSlab: '12% - 15% Performance Hike'
    });
    setShowMOMModal(null);
    setMomText('');
    setToast({ message: `Cycle finalized for ${users.find(u => u.id === appraisal.employeeId)?.name}`, type: 'success' });
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-12 pb-20 relative">
      {/* Dynamic Floating Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-12 left-1/2 z-[300] bg-slate-900 text-white px-8 py-4 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 flex items-center gap-4 backdrop-blur-xl"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-indigo-500'}`}>
              <i className={`fa-solid ${toast.type === 'success' ? 'fa-check' : 'fa-info'} text-xs`}></i>
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <motion.div variants={itemVariants}>
          <h2 className="text-5xl font-black text-slate-900 tracking-tight flex items-center gap-5">
            <span className="w-4 h-14 bg-gradient-to-b from-indigo-600 to-indigo-900 rounded-full shadow-lg shadow-indigo-100"></span>
            Super Admin Control
          </h2>
          <p className="text-slate-400 font-bold mt-2 flex items-center gap-2 uppercase text-[10px] tracking-[0.2em]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            System Live • User Context: {currentUser.name}
          </p>
        </motion.div>
        
        <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-6">
          <div className="flex bg-slate-100 p-1.5 rounded-[2rem] border-2 border-slate-200">
            <button 
              onClick={() => setActiveTab('appraisals')}
              className={`px-10 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'appraisals' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Appraisal Cycle
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`px-10 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}
            >
              System Users
            </button>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setShowCreateUser(true)}
              className="bg-white text-slate-900 border-2 border-slate-200 px-8 py-4 rounded-[2rem] font-black hover:bg-slate-50 transition-all flex items-center text-[10px] uppercase tracking-[0.2em] shadow-sm"
            >
              <i className="fa-solid fa-user-plus mr-3 text-indigo-600"></i> New User
            </button>
            <button 
              onClick={() => {
                const emp = users.find(u => u.role === UserRole.EMPLOYEE && !appraisals.some(a => a.employeeId === u.id && a.month === selectedMonth));
                if(emp) {
                  onTriggerAppraisal(emp.id, selectedMonth);
                  setToast({ message: `Cycle triggered for ${emp.name}`, type: 'success' });
                }
                else alert("No available employees found for this cycle.");
              }}
              className="bg-slate-900 text-white px-10 py-4 rounded-[2rem] font-black hover:bg-indigo-600 shadow-2xl shadow-slate-200 transition-all flex items-center text-[10px] uppercase tracking-[0.2em]"
            >
              <i className="fa-solid fa-bolt mr-3 text-indigo-400"></i> Start Cycle
            </button>
          </div>
        </motion.div>
      </header>

      {activeTab === 'appraisals' ? (
        <div className="space-y-12">
          <section className="bg-white rounded-[3.5rem] border-2 border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/50">
            <div className="p-12 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="font-black text-slate-900 text-2xl tracking-tight">Evaluator Allocation</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Target Month: <span className="text-indigo-600">{selectedMonth} 2025</span></p>
              </div>
              <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-white border-2 border-slate-200 rounded-2xl px-6 py-3 font-black text-slate-900 focus:border-indigo-600 outline-none transition-all text-[11px] uppercase tracking-widest cursor-pointer hover:shadow-md"
              >
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                  <option key={m} value={m}>{m} Cycle</option>
                ))}
              </select>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                    <th className="px-12 py-6 text-left">Target Person</th>
                    <th className="px-6 py-6 text-left">HR Lead</th>
                    <th className="px-6 py-6 text-left">Tech Lead</th>
                    <th className="px-6 py-6 text-left">Manager</th>
                    <th className="px-12 py-6 text-center">Cycle Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {employeesDue.map((app, idx) => {
                    const emp = users.find(u => u.id === app.employeeId);
                    return (
                      <motion.tr key={app.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-12 py-8">
                          <div className="flex items-center gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl shadow-xl group-hover:bg-indigo-600 transition-colors">
                              {emp?.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-black text-slate-900 text-lg leading-tight mb-1">{emp?.name}</p>
                              <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">{emp?.department}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-8">
                          <div className="relative">
                            <select 
                              className="w-full bg-slate-100 border-2 border-slate-200 rounded-2xl p-4 text-[11px] font-black uppercase text-slate-800 focus:bg-white focus:border-emerald-500 outline-none transition-all cursor-pointer appearance-none"
                              value={app.hrId || ''}
                              onChange={(e) => handleAssign(app.id, 'hr', e.target.value)}
                            >
                              <option value="">+ Assign HR</option>
                              {hrUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                              <motion.i 
                                animate={app.hrId ? { scale: [1, 1.4, 1], color: '#10b981' } : {}}
                                className={`fa-solid ${app.hrId ? 'fa-circle-check' : 'fa-chevron-down'} text-xs text-slate-400`}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-8">
                          <div className="relative">
                            <select 
                               className="w-full bg-slate-100 border-2 border-slate-200 rounded-2xl p-4 text-[11px] font-black uppercase text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all cursor-pointer appearance-none"
                               value={app.tlId || ''}
                               onChange={(e) => handleAssign(app.id, 'tl', e.target.value)}
                            >
                              <option value="">+ Assign TL</option>
                              {tlUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                              <motion.i 
                                animate={app.tlId ? { scale: [1, 1.4, 1], color: '#6366f1' } : {}}
                                className={`fa-solid ${app.tlId ? 'fa-circle-check' : 'fa-chevron-down'} text-xs text-slate-400`}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-8">
                          <div className="relative">
                            <select 
                               className="w-full bg-slate-100 border-2 border-slate-200 rounded-2xl p-4 text-[11px] font-black uppercase text-slate-800 focus:bg-white focus:border-orange-500 outline-none transition-all cursor-pointer appearance-none"
                               value={app.managerId || ''}
                               onChange={(e) => handleAssign(app.id, 'manager', e.target.value)}
                            >
                              <option value="">+ Assign MGR</option>
                              {mgmtUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                              <motion.i 
                                animate={app.managerId ? { scale: [1, 1.4, 1], color: '#f59e0b' } : {}}
                                className={`fa-solid ${app.managerId ? 'fa-circle-check' : 'fa-chevron-down'} text-xs text-slate-400`}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-12 py-8">
                          <div className={`mx-auto w-max px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            app.status === AppraisalStatus.PENDING_ASSIGNMENT ? 'bg-slate-100 text-slate-400' :
                            app.status === AppraisalStatus.IN_PROGRESS ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' :
                            app.status === AppraisalStatus.PENDING_REVIEW ? 'bg-amber-500 text-white shadow-xl shadow-amber-100' :
                            'bg-emerald-500 text-white shadow-xl shadow-emerald-100'
                          }`}>
                            {app.status}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
              {employeesDue.length === 0 && (
                <div className="py-32 text-center text-slate-300 font-black uppercase tracking-[0.4em] text-sm">
                  System Empty • Select Different Month
                </div>
              )}
            </div>
          </section>

          <section className="bg-white rounded-[3.5rem] border-2 border-slate-100 p-12 shadow-2xl shadow-slate-200/50">
            <h3 className="text-3xl font-black text-slate-900 mb-12 flex items-center gap-5">
              <div className="w-14 h-14 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-2xl">
                <i className="fa-solid fa-stamp"></i>
              </div>
              Executive Approval Queue
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {appraisals.filter(a => a.status === AppraisalStatus.PENDING_REVIEW).map(app => (
                <motion.div key={app.id} layoutId={app.id} className="p-10 rounded-[3rem] bg-slate-50 border-2 border-white shadow-xl flex flex-col justify-between group hover:border-indigo-100 transition-all">
                   <div className="flex items-center gap-6 mb-10">
                      <div className="w-20 h-20 rounded-[2rem] bg-white text-slate-900 flex items-center justify-center font-black text-3xl shadow-lg group-hover:bg-slate-900 group-hover:text-white transition-all">
                        {users.find(u => u.id === app.employeeId)?.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-2xl leading-none mb-2">{users.find(u => u.id === app.employeeId)?.name}</p>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-white px-3 py-1 rounded-full shadow-sm">Avg: {app.averageRating}</span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">• {app.month}</span>
                        </div>
                      </div>
                   </div>
                   <button 
                    onClick={() => setShowMOMModal(app)}
                    className="w-full bg-slate-900 text-white py-6 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 shadow-2xl shadow-slate-200 transition-all active:scale-95"
                   >
                     Approve & Release MOM
                   </button>
                </motion.div>
              ))}
              {appraisals.filter(a => a.status === AppraisalStatus.PENDING_REVIEW).length === 0 && (
                <div className="col-span-full py-20 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-5">
                   <i className="fa-solid fa-circle-check text-5xl text-slate-200"></i>
                   <p className="text-slate-400 font-black uppercase tracking-widest text-xs">All reviews currently settled.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      ) : (
        <section className="bg-white rounded-[3.5rem] border-2 border-slate-100 p-12 shadow-2xl shadow-slate-200/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {users.map((u) => (
              <div key={u.id} className="p-8 bg-slate-50 rounded-[2.5rem] border-2 border-white hover:border-indigo-100 transition-all group flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-white text-slate-900 flex items-center justify-center font-black text-xl shadow-md group-hover:bg-slate-900 group-hover:text-white transition-all">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-lg leading-tight mb-1">{u.name}</p>
                      <p className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${u.role === UserRole.SUPER_ADMIN ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'}`}>{u.role}</p>
                    </div>
                  </div>
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                      <i className="fa-solid fa-building text-indigo-400"></i> {u.department}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                      <i className="fa-solid fa-envelope text-indigo-400"></i> {u.email}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedUserForDetails(u)}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg active:scale-95"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* User Details Modal */}
      <AnimatePresence>
        {selectedUserForDetails && (
          <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-2xl z-[300] flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[4rem] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-12 bg-slate-900 text-white flex justify-between items-center">
                <div className="flex items-center gap-8">
                  <div className="w-24 h-24 rounded-[2rem] bg-indigo-600 text-white flex items-center justify-center font-black text-4xl shadow-2xl border-4 border-white/10">
                    {selectedUserForDetails.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-4xl font-black tracking-tight">{selectedUserForDetails.name}</h3>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="bg-white/10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{selectedUserForDetails.role}</span>
                      <span className="text-indigo-400 font-bold text-sm">{selectedUserForDetails.department}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedUserForDetails(null)} 
                  className="w-16 h-16 bg-white/10 hover:bg-red-500/30 rounded-[2rem] flex items-center justify-center transition-all"
                >
                  <i className="fa-solid fa-times text-2xl"></i>
                </button>
              </div>

              <div className="p-12 overflow-y-auto space-y-12 custom-scrollbar flex-1">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Corporate ID</p>
                    <p className="font-black text-slate-800 tracking-tight">#{selectedUserForDetails.id}</p>
                  </div>
                  <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Primary Contact</p>
                    <p className="font-black text-slate-800 tracking-tight">{selectedUserForDetails.email}</p>
                  </div>
                  <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Joined Date</p>
                    <p className="font-black text-slate-800 tracking-tight">{selectedUserForDetails.joiningDate}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-4">
                    <i className="fa-solid fa-chart-line text-indigo-600"></i> Performance Intelligence
                  </h4>
                  <div className="space-y-6">
                    {getUserAppraisals(selectedUserForDetails.id).map((history) => (
                      <div key={history.id} className="p-8 bg-white border-2 border-slate-50 rounded-[2.5rem] hover:border-indigo-100 transition-all flex items-center justify-between group shadow-sm hover:shadow-md">
                        <div className="flex items-center gap-6">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black shadow-lg ${
                            history.status === AppraisalStatus.FINALIZED ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}>
                            <i className={`fa-solid ${history.status === AppraisalStatus.FINALIZED ? 'fa-check-circle' : 'fa-hourglass-half'}`}></i>
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-lg leading-none mb-1">{history.month} {history.year} Cycle</p>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{history.status}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-12 text-right">
                          {history.averageRating && (
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Score</p>
                              <p className="text-xl font-black text-slate-900">{history.averageRating}</p>
                            </div>
                          )}
                          {history.incrementSlab && (
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Slab</p>
                              <p className="text-lg font-black text-indigo-600">{history.incrementSlab}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {getUserAppraisals(selectedUserForDetails.id).length === 0 && (
                      <div className="py-20 text-center bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
                        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No historical cycles recorded for this user.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-12 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                <button 
                  onClick={() => setSelectedUserForDetails(null)}
                  className="px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-2xl"
                >
                  Close Profile
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create User Modal */}
      <AnimatePresence>
        {showCreateUser && (
          <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-2xl z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }} 
              className="bg-white rounded-[4rem] shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <form onSubmit={handleCreateUserSubmit}>
                <div className="p-12 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">Onboard Member</h3>
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-2">Organization Structure Management</p>
                  </div>
                  <button type="button" onClick={() => setShowCreateUser(false)} className="w-14 h-14 bg-white border-2 border-slate-100 rounded-2xl text-slate-400 hover:text-red-500 transition-all">
                    <i className="fa-solid fa-times text-xl"></i>
                  </button>
                </div>
                
                <div className="p-12 space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Full Name</label>
                      <input 
                        required
                        type="text"
                        placeholder="e.g. John Doe"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-[13px] font-bold focus:bg-white focus:border-indigo-600 transition-all outline-none"
                        value={newUser.name}
                        onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">System Role</label>
                      <select 
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-[13px] font-bold focus:bg-white focus:border-indigo-600 transition-all outline-none cursor-pointer"
                        value={newUser.role}
                        onChange={(e) => setNewUser({...newUser, role: e.target.value as UserRole})}
                      >
                        {Object.values(UserRole).map(role => <option key={role} value={role}>{role}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Corporate Email</label>
                    <input 
                      required
                      type="email"
                      placeholder="john.doe@enterprise.com"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-[13px] font-bold focus:bg-white focus:border-indigo-600 transition-all outline-none"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Department</label>
                      <input 
                        required
                        type="text"
                        placeholder="e.g. Engineering"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-[13px] font-bold focus:bg-white focus:border-indigo-600 transition-all outline-none"
                        value={newUser.department}
                        onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Joining Date</label>
                      <input 
                        required
                        type="date"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-[13px] font-bold focus:bg-white focus:border-indigo-600 transition-all outline-none cursor-pointer"
                        value={newUser.joiningDate}
                        onChange={(e) => setNewUser({...newUser, joiningDate: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-12 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-6">
                  <button type="button" onClick={() => setShowCreateUser(false)} className="px-10 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-800">Discard</button>
                  <button type="submit" className="px-16 py-5 bg-slate-900 text-white rounded-[2rem] font-black shadow-2xl hover:bg-indigo-600 transition-all text-xs uppercase tracking-[0.2em]">Add to Directory</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMOMModal && (
          <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-2xl z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[4rem] shadow-2xl w-full max-w-2xl overflow-hidden">
              <div className="p-12 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">System Finalization</h3>
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-2">Enterprise Performance Board</p>
                </div>
                <button onClick={() => setShowMOMModal(null)} className="w-14 h-14 bg-white border-2 border-slate-100 rounded-2xl text-slate-400 hover:text-red-500 transition-all">
                  <i className="fa-solid fa-times text-xl"></i>
                </button>
              </div>
              <div className="p-12 space-y-10">
                <textarea 
                  value={momText}
                  onChange={(e) => setMomText(e.target.value)}
                  rows={5}
                  className="w-full p-10 bg-slate-50 border-4 border-slate-100 rounded-[3rem] focus:ring-[20px] focus:ring-indigo-100 focus:bg-white focus:border-indigo-600 outline-none resize-none transition-all placeholder:text-slate-300 font-bold text-slate-700"
                  placeholder="Draft the final Board conclusions..."
                />
              </div>
              <div className="p-12 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-6">
                <button onClick={() => setShowMOMModal(null)} className="px-10 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Cancel</button>
                <button onClick={() => handleFinalize(showMOMModal)} className="px-16 py-5 bg-slate-900 text-white rounded-[2rem] font-black shadow-2xl hover:bg-emerald-600 transition-all text-xs uppercase tracking-[0.2em]">Confirm & Finalize</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SuperAdminDashboard;
