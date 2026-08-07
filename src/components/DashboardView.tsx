import React from 'react';
import { 
  DollarSign, 
  Boxes, 
  ArrowLeftRight, 
  ShieldAlert, 
  Activity, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Wrench, 
  Search, 
  Layers, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Radio
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { Asset, Alert, ReadEvent, Site, Checkout } from '../types';

interface DashboardViewProps {
  assets: Asset[];
  alerts: Alert[];
  readEvents: ReadEvent[];
  sites: Site[];
  checkouts: Checkout[];
  onNavigateTab: (tab: any) => void;
  onOpenAssetDetail: (asset: Asset) => void;
  onOpenAlertsModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  assets,
  alerts,
  readEvents,
  sites,
  checkouts,
  onNavigateTab,
  onOpenAssetDetail,
  onOpenAlertsModal
}) => {
  const totalValue = assets.reduce((sum, a) => sum + a.cost, 0);
  const checkedOutCount = assets.filter(a => a.status === 'Checked Out').length;
  const inZoneCount = assets.filter(a => a.status === 'In Zone').length;
  const missingCount = assets.filter(a => a.status === 'Missing').length;
  const maintCount = assets.filter(a => a.status === 'Under Maintenance').length;
  const totalAssets = assets.length;

  const unresolvedAlerts = alerts.filter(a => !a.resolved);
  const criticalAlerts = unresolvedAlerts.filter(a => a.severity === 'CRITICAL');

  // Chart data: Status breakdown
  const statusData = [
    { name: 'In Zone', value: inZoneCount, color: '#10b981' },
    { name: 'Checked Out', value: checkedOutCount, color: '#3b82f6' },
    { name: 'Under Maintenance', value: maintCount, color: '#f59e0b' },
    { name: 'Missing / Flagged', value: missingCount, color: '#ef4444' }
  ];

  // Category breakdown data
  const categoryMap: Record<string, number> = {};
  assets.forEach(a => {
    categoryMap[a.category] = (categoryMap[a.category] || 0) + 1;
  });
  const categoryData = Object.keys(categoryMap).map(cat => ({
    name: cat,
    count: categoryMap[cat]
  }));

  return (
    <div className="space-y-6">
      
      {/* Top Banner Critical Notice if alerts exist */}
      {criticalAlerts.length > 0 && (
        <div className="bg-red-950/80 border border-red-600/60 rounded-xl p-4 flex items-center justify-between gap-4 text-red-200 shadow-lg shadow-red-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600/30 rounded-lg text-red-400 animate-pulse">
              <ShieldAlert className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-red-100 flex items-center gap-2">
                CRITICAL SECURITY ALERT DETECTED ({criticalAlerts.length})
              </h3>
              <p className="text-xs text-red-300/90 mt-0.5">
                {criticalAlerts[0].message}
              </p>
            </div>
          </div>
          <button
            onClick={onOpenAlertsModal}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg transition-colors shrink-0 flex items-center gap-1.5"
          >
            <span>Resolve Alerts</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Tracked Value</p>
            <p className="text-2xl font-black text-slate-900 font-mono mt-1">
              ${(totalValue / 1000).toFixed(1)}k
            </p>
            <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{totalAssets} Total Assets Tagged</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Checked Out / Active</p>
            <p className="text-2xl font-black text-blue-600 font-mono mt-1">
              {checkedOutCount}
            </p>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">
              {Math.round((checkedOutCount / (totalAssets || 1)) * 100)}% Current Utilization Rate
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <ArrowLeftRight className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Present In Laydown / Crib</p>
            <p className="text-2xl font-black text-emerald-600 font-mono mt-1">
              {inZoneCount}
            </p>
            <p className="text-[11px] text-emerald-600 mt-1 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified via RFID Portal</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <Boxes className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Missing / Loss Risk</p>
            <p className={`text-2xl font-black font-mono mt-1 ${missingCount > 0 ? 'text-red-600' : 'text-slate-800'}`}>
              {missingCount}
            </p>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">
              {missingCount > 0 ? 'Requires immediate zone audit' : '0% Asset Loss Rate'}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            missingCount > 0 
              ? 'bg-red-50 border border-red-200 text-red-600' 
              : 'bg-slate-100 border border-slate-200 text-slate-400'
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Main Grid: Charts & Live Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Status & Category Analytics Charts */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Status Breakdown & Category Distribution */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-amber-600" />
                  <span>Asset Distribution & Status Analytics</span>
                </h2>
                <p className="text-xs text-slate-500">Real-time status breakdown across all connected job sites</p>
              </div>
              <button
                onClick={() => onNavigateTab('assets')}
                className="text-xs text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1"
              >
                <span>View All Assets</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              
              {/* Pie Chart */}
              <div className="h-56 flex flex-col items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#0f172a' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute text-center">
                  <span className="text-xl font-bold font-mono text-slate-900">{totalAssets}</span>
                  <span className="block text-[10px] text-slate-500 uppercase">Assets</span>
                </div>
              </div>

              {/* Legend & Summary List */}
              <div className="flex flex-col justify-center space-y-3">
                {statusData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs font-medium text-slate-800">{item.name}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* Site Overview List */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center justify-between">
              <span>Active Construction Sites ({sites.length})</span>
              <button onClick={() => onNavigateTab('tracking')} className="text-xs text-amber-600 hover:underline">
                View Site Maps →
              </button>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sites.map(s => {
                const siteAssets = assets.filter(a => a.siteId === s.id);
                const siteValue = siteAssets.reduce((sum, a) => sum + a.cost, 0);
                return (
                  <div key={s.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2 hover:border-amber-400 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">{s.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded">
                        {s.code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{s.address}</p>
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Assets: <strong className="text-slate-900 font-mono">{siteAssets.length}</strong></span>
                      <span className="text-slate-500">Val: <strong className="text-emerald-700 font-mono">${(siteValue/1000).toFixed(0)}k</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Live RFID Event Feed Stream */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col h-[520px] shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-amber-600 animate-pulse" />
              <h2 className="font-bold text-base text-slate-900">Live RFID Read Stream</h2>
            </div>
            <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
              860-960 MHz
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {readEvents.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">Waiting for gateway RFID reads...</p>
            ) : (
              readEvents.slice(0, 15).map((evt) => (
                <div 
                  key={evt.id}
                  className={`p-3 rounded-lg border text-xs space-y-1 transition-all ${
                    evt.eventType === 'GEOFENCE_BREACH'
                      ? 'bg-red-50 border-red-200 text-red-900'
                      : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 truncate max-w-[170px]">{evt.assetName || 'Unknown Tag'}</span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-[11px] text-slate-600">
                    <span className="truncate">{evt.readerName}</span>
                    <span className="font-mono text-amber-700 font-semibold">{evt.rssi} dBm</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono pt-1 text-slate-400 border-t border-slate-200/60">
                    <span className="truncate">EPC: {evt.epc.slice(-10)}</span>
                    <span className="text-slate-600">{evt.zoneName}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>UHF RFID Middleware Engine</span>
            <button
              onClick={() => onNavigateTab('api')}
              className="text-amber-600 hover:underline font-semibold"
            >
              API Endpoint Log →
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
