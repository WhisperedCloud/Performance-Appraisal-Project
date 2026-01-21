
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Appraisal, UserRole, AppraisalStatus, AppraisalRating } from '../types';
import { APPRAISAL_CRITERIA } from '../constants';

interface Props {
  currentUser: User;
  appraisals: Appraisal[];
  users: User[];
  onUpdateAppraisal: (updated: Appraisal) => void;
}

const SecondLevelDashboard: React.FC<Props> = ({ currentUser, appraisals, users, onUpdateAppraisal }) => {
  const [activeAppraisal, setActiveAppraisal] = useState<Appraisal | null>(null);
  const [formCriteria, setFormCriteria] = useState<Record<string, number>>({
    skills: 5, personality: 5, communication: 5, teamwork: 5, performance: 5
  });
  const [comments, setComments] = useState('');

  // Filter appraisals where this specific user is assigned to one of the three slots
  const assignedAppraisals = useMemo(() => {
    return appraisals.filter(a =>
      a.hrId === currentUser.id ||
      a.tlId === currentUser.id ||
      a.managerId === currentUser.id
    );
  }, [appraisals, currentUser.id]);

  const isRatedByMe = (app: Appraisal) => app.ratings.some(r => r.evaluatorId === currentUser.id);

  const handleSubmitRating = () => {
    if (!activeAppraisal) return;

    const newRating: AppraisalRating = {
      evaluatorId: currentUser.id,
      evaluatorRole: currentUser.role,
      criteria: { ...formCriteria } as any,
      comments,
      submittedAt: new Date().toISOString()
    };

    const updatedRatings = [...activeAppraisal.ratings, newRating];

    // Calculate new average
    const totalScoreSum = updatedRatings.reduce((sum, r) => {
      const rAvg = (Object.values(r.criteria) as number[]).reduce((a, b) => a + b, 0) / 5;
      return sum + rAvg;
    }, 0);
    const newAvg = totalScoreSum / updatedRatings.length;

    const updated: Appraisal = {
      ...activeAppraisal,
      ratings: updatedRatings,
      averageRating: parseFloat(newAvg.toFixed(1))
    };

    // Auto-advance if all assigned slots are filled
    const requiredSlots = [updated.hrId, updated.tlId, updated.managerId].filter(id => !!id).length;
    if (updatedRatings.length >= requiredSlots && requiredSlots > 0) {
      updated.status = AppraisalStatus.PENDING_REVIEW;
    }

    onUpdateAppraisal(updated);
    setActiveAppraisal(null);
    setComments('');
    setFormCriteria({ skills: 5, personality: 5, communication: 5, teamwork: 5, performance: 5 });
  };

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-200 pb-8">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            <span className="w-3 h-12 bg-gradient-to-b from-indigo-500 to-indigo-800 rounded-full shadow-lg shadow-indigo-100"></span>
            Assigned Appraisals
          </h2>
          <p className="text-slate-500 font-bold mt-2 tracking-tight uppercase text-xs">
            Reviewer: <span className="text-indigo-600">{currentUser.name}</span> • Access Level: <span className="text-slate-900">{currentUser.role}</span>
          </p>
        </div>
        <div className="bg-white px-8 py-4 rounded-[2rem] border-2 border-slate-100 shadow-xl shadow-slate-200/50 flex items-center gap-4">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Pending Submissions: {assignedAppraisals.filter(a => !isRatedByMe(a)).length}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {assignedAppraisals.map(app => {
          const emp = users.find(u => u.id === app.employeeId);
          const rated = isRatedByMe(app);

          return (
            <motion.div
              key={app.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[3rem] border-2 border-slate-50 shadow-2xl shadow-slate-200/30 flex flex-col overflow-hidden transition-all hover:border-indigo-100 group"
            >
              <div className="p-10 border-b border-slate-50">
                <div className="flex justify-between items-start mb-10">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-slate-900 text-white flex items-center justify-center font-black text-2xl shadow-2xl group-hover:bg-indigo-600 transition-colors">
                      {emp?.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-xl leading-none mb-2">{emp?.name}</h4>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{emp?.department}</p>
                    </div>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${rated ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                    {rated ? 'Completed' : 'Action Required'}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-center bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Progress</span>
                    <span className="text-[11px] font-black text-slate-900 uppercase">{app.status}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    {['HR', 'Team Lead', 'Manager'].map((role) => {
                      const reviewerId = role === 'HR' ? app.hrId : role === 'Team Lead' ? app.tlId : app.managerId;
                      const hasSubmitted = app.ratings.some(r => r.evaluatorRole === role);

                      return (
                        <div key={role} className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-2xl border ${hasSubmitted ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>
                          <i className={`fa-solid ${hasSubmitted ? 'fa-check-circle' : 'fa-circle-dot'} text-sm`}></i>
                          <span className="text-[8px] font-black uppercase tracking-tighter">{role}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="p-10 bg-slate-50/30">
                <button
                  disabled={rated || app.status === AppraisalStatus.FINALIZED}
                  onClick={() => setActiveAppraisal(app)}
                  className={`w-full py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${rated
                    ? 'bg-slate-100 text-slate-400 cursor-default shadow-inner'
                    : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-2xl shadow-indigo-100 hover:scale-[1.02] active:scale-95'
                    }`}
                >
                  {rated ? 'Feedback Submitted' : 'Provide Feedback'}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {activeAppraisal && (
          <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-white rounded-[4rem] shadow-[0_80px_160px_-40px_rgba(0,0,0,0.8)] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="p-12 bg-slate-900 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-3xl font-black tracking-tight">Performance Insight</h3>
                  <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mt-3">
                    Submitting feedback for: <span className="text-white">{users.find(u => u.id === activeAppraisal.employeeId)?.name}</span>
                  </p>
                </div>
                <button onClick={() => setActiveAppraisal(null)} className="w-16 h-16 rounded-[2rem] bg-white/10 hover:bg-red-500/20 flex items-center justify-center transition-all">
                  <i className="fa-solid fa-times text-2xl"></i>
                </button>
              </div>

              <div className="p-12 overflow-y-auto space-y-12 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {APPRAISAL_CRITERIA.map(criterion => (
                    <div key={criterion.key} className="space-y-6">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-black text-slate-800 uppercase tracking-widest">{criterion.label}</label>
                        <span className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-xl shadow-indigo-100">{formCriteria[criterion.key]}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        value={formCriteria[criterion.key]}
                        onChange={(e) => setFormCriteria(prev => ({ ...prev, [criterion.key]: parseInt(e.target.value) }))}
                        className="w-full h-3 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600 hover:bg-slate-200 transition-colors"
                      />
                      <div className="flex justify-between text-[8px] font-black text-slate-300 uppercase tracking-widest">
                        <span>Needs Focus</span>
                        <span>Exemplary</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-6">
                  <label className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em]">Detailed Observations</label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={4}
                    className="w-full p-10 bg-slate-50 border-4 border-slate-100 rounded-[3rem] focus:ring-[20px] focus:ring-indigo-100 focus:bg-white focus:border-indigo-600 outline-none resize-none transition-all placeholder:text-slate-300 font-bold text-slate-700 leading-relaxed"
                    placeholder="Provide specific examples of performance, strengths, or areas for improvement..."
                  />
                </div>
              </div>

              <div className="p-12 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-6">
                <button onClick={() => setActiveAppraisal(null)} className="px-10 py-5 text-slate-400 font-black uppercase tracking-widest text-[11px] hover:text-slate-800">Cancel</button>
                <button
                  onClick={handleSubmitRating}
                  disabled={!comments.trim() || comments.length < 5}
                  className="px-16 py-5 bg-indigo-600 text-white rounded-[2rem] text-xs font-black shadow-2xl shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all uppercase tracking-[0.2em]"
                >
                  Submit Review
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SecondLevelDashboard;
