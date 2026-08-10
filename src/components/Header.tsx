import React from 'react';
import { 
  Radio, 
  ShieldAlert, 
  Smartphone, 
  Cpu, 
  Building2, 
  UserCheck, 
  Bell, 
  Wifi, 
  WifiOff, 
  Database,
  ExternalLink,
  Flame,
  LogIn,
  LogOut
} from 'lucide-react';
import { Site, User, Alert } from '../types';
import { useFirebaseAuth } from '../context/FirebaseAuthContext';

interface HeaderProps {
  sites: Site[];
  selectedSiteId: string;
  onSelectSite: (id: string) => void;
  alerts: Alert[];
  onOpenAlertsModal: () => void;
  onOpenHardwareDrawer: () => void;
  onOpenMobileView: () => void;
  currentUser: User;
  onSwitchUserRole: (user: User) => void;
  allUsers: User[];
  isStreaming: boolean;
  offlineMode: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  sites,
  selectedSiteId,
  onSelectSite,
  alerts,
  onOpenAlertsModal,
  onOpenHardwareDrawer,
  onOpenMobileView,
  currentUser,
  onSwitchUserRole,
  allUsers,
  isStreaming,
  offlineMode
}) => {
  const unresolvedAlerts = alerts.filter(a => !a.resolved);
  const criticalCount = unresolvedAlerts.filter(a => a.severity === 'CRITICAL').length;
  const { user: fbUser, authReady, signInWithGoogle, signOut } = useFirebaseAuth();

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand & Platform Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/25 ring-2 ring-blue-400/20">
            <Radio className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-lg text-white font-mono">APERTURE</span>
              <span className="bg-blue-900/80 text-blue-200 border border-blue-700/60 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1 font-mono">
                <Flame className="w-3 h-3 text-blue-400 fill-blue-400" /> Express + MongoDB
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Real-Time Physical Asset & RFID Enterprise System</p>
          </div>
        </div>

        {/* Site Context Selector */}
        <div className="hidden md:flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-1.5">
          <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="text-xs font-medium text-slate-400">Site:</span>
          <select
            value={selectedSiteId}
            onChange={(e) => onSelectSite(e.target.value)}
            className="bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer"
          >
            <option value="ALL" className="bg-slate-900 text-white">All Construction Sites (Multi-Site)</option>
            {sites.map(s => (
              <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>

        {/* Right Actions & Hardware Status */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Firebase Auth Controls */}
          {authReady && (
            fbUser ? (
              <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-xl">
                <img src={fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} className="w-5 h-5 rounded-full" alt="FB" />
                <span className="text-[11px] font-semibold text-slate-200 hidden xl:inline truncate max-w-[100px]">
                  {fbUser.displayName || fbUser.email}
                </span>
                <button
                  onClick={signOut}
                  className="p-1 hover:text-red-400 text-slate-400 transition-colors"
                  title="Sign out from Firebase"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white border border-blue-500 text-xs font-semibold px-3 py-1.5 rounded-xl shadow-sm transition-colors"
                title="Sign in with Google Firebase Auth"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Firebase Auth</span>
              </button>
            )
          )}

          {/* Real-Time Hardware RFID Stream Status Pill */}
          <button
            onClick={onOpenHardwareDrawer}
            className={`hidden lg:flex items-center gap-2 text-xs font-mono px-3.5 py-1.5 rounded-xl border transition-all ${
              offlineMode
                ? 'bg-amber-950/60 text-amber-200 border-amber-700/60 hover:bg-amber-900/60'
                : isStreaming
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900/80'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Configure Real-Time RFID Hardware Middleware & Reader Stream"
          >
            {offlineMode ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Edge Offline Buffer</span>
              </>
            ) : isStreaming ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span>RFID Stream: Live (Real-Time)</span>
              </>
            ) : (
              <>
                <Cpu className="w-3.5 h-3.5 text-slate-400" />
                <span>Reader Stream Paused</span>
              </>
            )}
          </button>

          {/* Mobile Field Mode Switcher */}
          <button
            onClick={onOpenMobileView}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors"
            title="Open Mobile Field Scanner Simulator"
          >
            <Smartphone className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">Handheld Scanner</span>
          </button>

          {/* Alerts Bell Button */}
          <button
            onClick={onOpenAlertsModal}
            className="relative p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-colors"
            title="View Active Geofence & System Alerts"
          >
            <Bell className="w-4 h-4" />
            {unresolvedAlerts.length > 0 && (
              <span className={`absolute -top-1 -right-1 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center text-white ${
                criticalCount > 0 ? 'bg-red-600 animate-bounce' : 'bg-blue-500'
              }`}>
                {unresolvedAlerts.length}
              </span>
            )}
          </button>

          {/* User Persona Switcher */}
          <div className="relative group">
            <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl px-2.5 py-1.5 transition-colors">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-5 h-5 rounded-full object-cover border border-blue-400"
              />
              <span className="text-xs font-semibold text-slate-200 hidden sm:inline">{currentUser.name}</span>
              <span className="text-[10px] bg-slate-700 text-slate-300 font-mono px-1.5 py-0.5 rounded hidden md:inline">
                {currentUser.role}
              </span>
            </button>

            {/* Dropdown menu */}
            <div className="absolute right-0 top-full mt-1 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1 hidden group-hover:block z-50">
              <div className="px-3 py-2 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                Switch Persona / Role
              </div>
              {allUsers.map(u => (
                <button
                  key={u.id}
                  onClick={() => onSwitchUserRole(u)}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                    u.id === currentUser.id ? 'bg-blue-900/60 text-blue-200 font-bold' : 'text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <img src={u.avatarUrl} className="w-5 h-5 rounded-full object-cover" />
                    <div>
                      <p className="leading-none">{u.name}</p>
                      <p className="text-[10px] text-slate-400 leading-tight">{u.role}</p>
                    </div>
                  </div>
                  {u.id === currentUser.id && <UserCheck className="w-3.5 h-3.5 text-blue-400" />}
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};
