
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Appraisal, AppraisalStatus } from '../types';

interface Props {
  currentUser: User;
  appraisals: Appraisal[];
}

const EmployeeDashboard: React.FC<Props> = ({ currentUser, appraisals }) => {
  const myAppraisals = useMemo(() => {
    return appraisals
      .filter(a => a.employeeId === currentUser.id)
      .sort((a, b) => b.year - a.year || b.month.localeCompare(a.month));
  }, [appraisals, currentUser.id]);

  const latest = myAppraisals[0];
  const [showMOM, setShowMOM] = useState(false);

  // Calculate review progress
  const completedReviews = latest ? latest.ratings.length : 0;
  const totalRequired = 3; // HR, TL, Manager
  const progressPercent = latest?.status === AppraisalStatus.FINALIZED ? 100 : (completedReviews / totalRequired) * 100;

  // Aggregate ratings for visualization
  const aggregatedCriteria = useMemo(() => {
    if (!latest || latest.ratings.length === 0) return { skills: 0, personality: 0 };
    const totals = { skills: 0, personality: 0 };
    latest.ratings.forEach(r => {
      totals.skills += r.criteria.skills;
      totals.personality += r.criteria.personality;
    });
    const count = latest.ratings.length;
    return {
      skills: totals.skills / count,
      personality: totals.personality / count,
    };
  }, [latest]);

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-32">
      {/* Header Profile Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8"
      >
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-indigo-100">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{currentUser.name}</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">{currentUser.role} • {currentUser.department}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-50 px-6 py-3 rounded-2xl text-center min-w-[120px]">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Cycle</p>
            <p className="text-sm font-black text-slate-900">{latest?.month || 'N/A'}</p>
          </div>
          <div className="bg-indigo-50 px-6 py-3 rounded-2xl text-center min-w-[120px]">
            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Status</p>
            <p className="text-sm font-black text-indigo-600">{latest?.status || 'Idle'}</p>
          </div>
        </div>
      </motion.section>

      {latest ? (
        <div className="space-y-10">
          {/* Appraisal Radar Section (Matching Reference Image) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[4rem] p-12 lg:p-16 border border-slate-100 shadow-2xl shadow-slate-200/40"
          >
            <div className="mb-12">
              <h3 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Appraisal Radar</h3>
              <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[11px]">Real-time Pipeline Transparency</p>
            </div>

            <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-32">
              {/* Circular Completion Bar (Sized smaller to match screenshot) */}
              <div className="relative w-64 h-64 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 scale-x-[-1]" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="85" stroke="currentColor" strokeWidth="18" fill="transparent" className="text-slate-50" />
                  <motion.circle 
                    cx="100" cy="100" r="85" stroke="currentColor" strokeWidth="18" fill="transparent"
                    strokeDasharray="534"
                    initial={{ strokeDashoffset: 534 }}
                    animate={{ strokeDashoffset: 534 - (534 * progressPercent) / 100 }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                    strokeLinecap="round"
                    className="text-indigo-600"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                  <span className="text-6xl font-black text-slate-900 leading-none">{Math.round(progressPercent)}%</span>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-3">Completion</span>
                </div>
              </div>

              {/* Status List */}
              <div className="space-y-8 flex-1 max-w-sm">
                {[
                  { label: 'HR Assessment', roleKey: 'HR' },
                  { label: 'Team Lead Assessment', roleKey: 'Team Lead' },
                  { label: 'Manager Assessment', roleKey: 'Manager' }
                ].map((item, idx) => {
                  const isDone = latest.ratings.some(r => r.evaluatorRole.includes(item.roleKey)) || latest.status === AppraisalStatus.FINALIZED;
                  return (
                    <motion.div 
                      key={item.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + idx * 0.1 }}
                      className="flex items-center gap-6"
                    >
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all ${isDone ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-slate-100 text-slate-300'}`}>
                        <i className={`fa-solid ${isDone ? 'fa-check' : 'fa-clock'} text-sm`}></i>
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-slate-800 leading-none mb-1">{item.label}</h4>
                        <p className={`text-[9px] font-black uppercase tracking-widest ${isDone ? 'text-emerald-500' : 'text-slate-400'}`}>
                          {isDone ? 'SUBMISSION FINALIZED' : 'AWAITING EVALUATION'}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Current Performance Matrix (Matching Reference Image Style) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0f172a] rounded-[3.5rem] p-16 text-white shadow-3xl"
          >
            <div className="flex items-center gap-4 mb-14">
              <i className="fa-solid fa-chart-line text-indigo-400 text-2xl"></i>
              <h3 className="text-3xl font-black tracking-tight">Current Performance Matrix</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-12">
              {/* Skills Bar */}
              <div className="space-y-5">
                <div className="flex justify-between items-end">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Skills</span>
                  <span className="text-[11px] font-black tracking-widest">{aggregatedCriteria.skills.toFixed(1)} / 10</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${aggregatedCriteria.skills * 10}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400"
                  />
                </div>
              </div>

              {/* Personality Bar */}
              <div className="space-y-5">
                <div className="flex justify-between items-end">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Personality</span>
                  <span className="text-[11px] font-black tracking-widest">{aggregatedCriteria.personality.toFixed(1)} / 10</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${aggregatedCriteria.personality * 10}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Outcome Section */}
          {latest.status === AppraisalStatus.FINALIZED && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-indigo-600 rounded-[3rem] p-12 text-white flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl shadow-indigo-100"
            >
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-200 mb-2">Final Conclusion</p>
                <h3 className="text-4xl font-black tracking-tight">{latest.incrementSlab}</h3>
              </div>
              <button 
                onClick={() => setShowMOM(true)}
                className="px-12 py-6 bg-white text-indigo-600 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-xl"
              >
                View Detailed Report
              </button>
            </motion.div>
          )}
        </div>
      ) : (
        <div className="py-40 text-center bg-white rounded-[4rem] border border-dashed border-slate-200">
          <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No active cycle found for your account.</p>
        </div>
      )}

      {/* MOM Modal */}
      <AnimatePresence>
        {showMOM && latest && (
          <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[4rem] shadow-2xl max-w-3xl w-full p-16"
            >
              <div className="flex justify-between items-center mb-12">
                <h3 className="text-3xl font-black text-slate-900">Appraisal Report</h3>
                <button onClick={() => setShowMOM(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                  <i className="fa-solid fa-times text-2xl"></i>
                </button>
              </div>
              <div className="bg-slate-50 p-10 rounded-[2.5rem] mb-10 border border-slate-100">
                <p className="text-lg text-slate-700 font-medium italic leading-relaxed text-center">
                  "{latest.finalMOM}"
                </p>
              </div>
              <div className="flex justify-center">
                <button 
                  onClick={() => setShowMOM(false)}
                  className="px-12 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all"
                >
                  Close Report
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmployeeDashboard;
