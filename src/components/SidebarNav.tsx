import React from 'react';
import { 
  LayoutDashboard, 
  Boxes, 
  MapPin, 
  ArrowLeftRight, 
  ShieldAlert, 
  PackageSearch, 
  Wrench, 
  TrendingUp, 
  Cpu, 
  FileSpreadsheet, 
  Smartphone, 
  Terminal,
  Activity
} from 'lucide-react';

export type TabType = 
  | 'dashboard' 
  | 'assets' 
  | 'tracking' 
  | 'checkouts' 
  | 'geofencing' 
  | 'inventory' 
  | 'maintenance' 
  | 'utilization' 
  | 'hardware' 
  | 'reports' 
  | 'mobile' 
  | 'api';

interface SidebarNavProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  unresolvedAlertsCount: number;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeTab,
  onSelectTab,
  unresolvedAlertsCount
}) => {
  const navItems: { id: TabType; label: string; icon: React.ReactNode; badge?: number; category?: string }[] = [
    { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'assets', label: 'Asset Registry', icon: <Boxes className="w-4 h-4" /> },
    { id: 'tracking', label: 'Live Map & Radar', icon: <MapPin className="w-4 h-4" /> },
    { id: 'checkouts', label: 'Check-In / Out', icon: <ArrowLeftRight className="w-4 h-4" /> },
    { id: 'geofencing', label: 'Geofence Alerts', icon: <ShieldAlert className="w-4 h-4" />, badge: unresolvedAlertsCount },
    { id: 'inventory', label: 'Bulk Inventory', icon: <PackageSearch className="w-4 h-4" /> },
    { id: 'maintenance', label: 'Maintenance', icon: <Wrench className="w-4 h-4" /> },
    { id: 'utilization', label: 'Utilization & Rentals', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'hardware', label: 'Reader Gateways', icon: <Cpu className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports & TCO', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 'mobile', label: 'Field Mode', icon: <Smartphone className="w-4 h-4" /> },
    { id: 'api', label: 'API & Middleware', icon: <Terminal className="w-4 h-4" /> }
  ];

  return (
    <nav className="bg-white border-r border-slate-200 w-full md:w-60 shrink-0 p-3 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-y-auto sticky top-16 z-20 shadow-xs">
      <div className="hidden md:block px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
        Platform Navigation
      </div>
      
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all shrink-0 whitespace-nowrap ${
              isActive
                ? 'bg-amber-500 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span className={isActive ? 'text-white' : 'text-amber-600'}>{item.icon}</span>
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                isActive ? 'bg-amber-700 text-white' : 'bg-red-600 text-white animate-pulse'
              }`}>
                {item.badge}
              </span>
            )}
          </button>
        );
      })}

      <div className="hidden md:block mt-auto pt-4 border-t border-slate-100 px-3">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5 font-mono text-emerald-700 font-bold mb-1">
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span>RFID & Express Backend</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            Firebase Firestore DB + Express REST API active & synced.
          </p>
        </div>
      </div>
    </nav>
  );
};
