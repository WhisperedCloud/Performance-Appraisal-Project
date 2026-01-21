
import React from 'react';
import { motion } from 'framer-motion';
import { User, UserRole } from '../types';

interface SidebarProps {
  user: User;
  activePage: string;
  setActivePage: (page: string) => void;
  onLogout: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: string;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { 
    id: 'dashboard', 
    label: 'Command Center', 
    icon: 'fa-house-chimney', 
    roles: [UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.HR, UserRole.TEAM_LEAD, UserRole.EMPLOYEE] 
  },
  { 
    id: 'users', 
    label: 'User Directory', 
    icon: 'fa-users-gear', 
    roles: [UserRole.SUPER_ADMIN, UserRole.HR] 
  },
  { 
    id: 'cycles', 
    label: 'Appraisal Cycles', 
    icon: 'fa-arrows-spin', 
    roles: [UserRole.SUPER_ADMIN] 
  },
  { 
    id: 'tasks', 
    label: 'My Assessments', 
    icon: 'fa-list-check', 
    roles: [UserRole.MANAGER, UserRole.HR, UserRole.TEAM_LEAD] 
  },
  { 
    id: 'career', 
    label: 'Career Matrix', 
    icon: 'fa-diagram-project', 
    roles: [UserRole.EMPLOYEE] 
  },
  { 
    id: 'reports', 
    label: 'Analytics', 
    icon: 'fa-chart-line', 
    roles: [UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.HR] 
  },
  { 
    id: 'settings', 
    label: 'Settings', 
    icon: 'fa-sliders', 
    roles: [UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.HR, UserRole.TEAM_LEAD, UserRole.EMPLOYEE] 
  },
];

const Sidebar: React.FC<SidebarProps> = ({ user, activePage, setActivePage, onLogout }) => {
  // Dynamically filter navigation items based on the current user's role
  const filteredNav = NAV_ITEMS.filter(item => item.roles.includes(user.role));

  return (
    <aside className="fixed top-0 left-0 h-screen w-80 bg-slate-900 text-white hidden lg:flex flex-col z-50 border-r border-white/5 shadow-2xl">
      {/* Brand Section */}
      <div className="p-10 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-[1.25rem] flex items-center justify-center text-2xl font-black shadow-2xl shadow-indigo-500/30 ring-4 ring-indigo-500/10">
            A
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight leading-none text-white">AMS V2.5</h1>
            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em] mt-1">Enterprise Cloud</p>
          </div>
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 px-6 space-y-1.5 overflow-y-auto custom-scrollbar">
        <p className="px-4 mb-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Platform Menu</p>
        {filteredNav.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`w-full group relative flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 ${
                isActive 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <i className={`fa-solid ${item.icon} text-lg w-6 flex items-center justify-center ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'}`}></i>
              <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
              
              {isActive && (
                <motion.div 
                  layoutId="activeGlow"
                  className="absolute left-0 w-1.5 h-6 bg-white rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* User Footer Context */}
      <div className="p-8">
        <div className="p-6 bg-white/5 rounded-[2.5rem] border border-white/5 backdrop-blur-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-xl border border-indigo-500/20">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="font-black text-sm text-white truncate leading-none mb-1">{user.name}</p>
              <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest truncate">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full py-4 bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-transparent hover:border-rose-500/30"
          >
            <i className="fa-solid fa-power-off"></i>
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
