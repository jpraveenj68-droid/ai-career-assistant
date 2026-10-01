import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, AlertCircle, Compass, UserCheck } from 'lucide-react';

const MOBILE_ITEMS = [
  { path: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { path: '/job-analysis', label: 'Analyze', icon: Briefcase },
  { path: '/skill-gap', label: 'Skills', icon: AlertCircle },
  { path: '/roadmap', label: 'Roadmap', icon: Compass },
  { path: '/profile', label: 'Profile', icon: UserCheck },
];

export const MobileBottomNav: React.FC = () => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-lg border-t border-slate-800 px-2 py-2">
      <div className="grid grid-cols-5 gap-1">
        {MOBILE_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 rounded-lg text-[10px] font-medium transition-colors ${
                  isActive ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-300'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
