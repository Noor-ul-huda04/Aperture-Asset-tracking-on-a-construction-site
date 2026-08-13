import React, { useState } from 'react';
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
  Radio,
  Cpu,
  Terminal,
  BrainCircuit,
  Database,
  LayoutDashboard,
  ArrowRight,
  Sparkles,
  Zap
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
  CartesianGrid,
  Legend,
  ReferenceLine
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

  // Site Asset Utilization data for recharts
  const siteUtilizationData = sites.map(s => {
    const siteAssets = assets.filter(a => a.siteId === s.id || a.siteName === s.name);
    const total = siteAssets.length;
    const checkedOut = siteAssets.filter(a => a.status === 'Checked Out').length;
    const inZone = siteAssets.filter(a => a.status === 'In Zone').length;
    const maint = siteAssets.filter(a => a.status === 'Under Maintenance').length;
    const missing = siteAssets.filter(a => a.status === 'Missing').length;
    const utilizationRate = total > 0 ? Math.round((checkedOut / total) * 100) : 0;

    return {
      name: s.name.length > 18 ? `${s.name.slice(0, 16)}...` : s.name,
      fullName: s.name,
      code: s.code,
      utilizationRate,
      checkedOut,
      inZone,
      maint,
      missing,
      totalAssets: total
    };
  });

  const avgUtilizationRate = siteUtilizationData.length > 0
    ? Math.round(siteUtilizationData.reduce((acc, curr) => acc + curr.utilizationRate, 0) / siteUtilizationData.length)
    : 0;

  const CustomUtilizationTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-white text-xs space-y-1.5">
          <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-1.5">
            <span className="font-bold text-slate-100">{data.fullName}</span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 bg-blue-900/80 text-blue-300 rounded border border-blue-700">
              {data.code}
            </span>
          </div>
          <div className="font-mono text-[11px] space-y-1">
            <div className="flex justify-between gap-4 text-blue-400 font-bold">
              <span>Utilization Rate:</span>
              <span>{data.utilizationRate}%</span>
            </div>
            <div className="flex justify-between gap-4 text-slate-300">
              <span>Active Checked Out:</span>
              <span className="font-bold">{data.checkedOut} / {data.totalAssets}</span>
            </div>
            <div className="flex justify-between gap-4 text-emerald-400">
              <span>In Zone (Laydown Yard):</span>
              <span>{data.inZone}</span>
            </div>
            {data.maint > 0 && (
              <div className="flex justify-between gap-4 text-amber-400">
                <span>Under Maintenance:</span>
                <span>{data.maint}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

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
            <p className="text-[11px] text-blue-600 mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{totalAssets} Total Assets Tagged</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
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

      {/* AI Behavioral Analytics & MongoDB/Firewall Quick Launch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          onClick={() => onNavigateTab('ai_behavior')}
          className="bg-white hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 rounded-2xl p-5 cursor-pointer transition-all shadow-xs group flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-200 group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-blue-800 uppercase tracking-wider block">
                AI BEHAVIOR ENGINE
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Analyze Event Stream Behavior</h4>
              <p className="text-xs text-slate-500 mt-0.5">Detect zone-hopping, dwell time spikes, and anomaly threat scores using Gemini AI</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
        </div>

        <div 
          onClick={() => onNavigateTab('reports')}
          className="bg-white hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 rounded-2xl p-5 cursor-pointer transition-all shadow-xs group flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase tracking-wider block">
                REPORTS & COST ANALYTICS
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Asset Utilization & TCO Metrics</h4>
              <p className="text-xs text-slate-500 mt-0.5">Generate operational lifecycle reports and track total cost of ownership across sites</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
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
                  <Activity className="w-5 h-5 text-blue-600" />
                  <span>Asset Distribution & Real-Time Analytics</span>
                </h2>
                <p className="text-xs text-slate-500">Live RFID status breakdown across all connected job sites</p>
              </div>
              <button
                onClick={() => onNavigateTab('assets')}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
              >
                <span>View All Assets</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              
              {/* Pie Chart */}
              <div className="h-56 w-full flex flex-col items-center justify-center relative min-h-[224px]">
                <ResponsiveContainer width="100%" height={220} minWidth={100} minHeight={200} initialDimension={{ width: 300, height: 220 }}>
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
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', color: '#0f172a' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute text-center">
                  <span className="text-xl font-bold font-mono text-slate-900">{totalAssets}</span>
                  <span className="block text-[10px] text-slate-500 uppercase font-mono">Assets</span>
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

          {/* Site Asset Utilization Rate Chart (Recharts) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span>Site Asset Utilization Percentages</span>
                </h3>
                <p className="text-xs text-slate-500">Active checked-out asset utilization rates per construction job site</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right font-mono bg-blue-50 border border-blue-200 px-3 py-1 rounded-lg">
                  <span className="text-[10px] text-slate-500 uppercase block font-sans">Fleet Average</span>
                  <span className="text-sm font-bold text-blue-700">{avgUtilizationRate}% Utilization</span>
                </div>
              </div>
            </div>

            <div className="h-64 w-full pt-2 min-h-[256px]">
              <ResponsiveContainer width="100%" height={250} minWidth={100} minHeight={200} initialDimension={{ width: 500, height: 250 }}>
                <BarChart data={siteUtilizationData} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    interval={0}
                    angle={-10}
                    textAnchor="end"
                  />
                  <YAxis 
                    unit="%" 
                    domain={[0, 100]} 
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <Tooltip content={<CustomUtilizationTooltip />} />
                  <ReferenceLine y={60} label={{ value: '60% Target Benchmark', fill: '#059669', fontSize: 10, position: 'insideTopRight' }} stroke="#059669" strokeDasharray="3 3" />
                  <Bar 
                    dataKey="utilizationRate" 
                    name="Utilization Rate (%)" 
                    fill="#3b82f6" 
                    radius={[6, 6, 0, 0]} 
                  >
                    {siteUtilizationData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.utilizationRate >= 60 ? '#2563eb' : entry.utilizationRate >= 40 ? '#0284c7' : '#f59e0b'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
              <div className="flex items-center gap-4 text-[11px] font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-blue-600 inline-block" />
                  <span>High (&gt;60%)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-sky-600 inline-block" />
                  <span>Moderate (40-60%)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block" />
                  <span>Low (&lt;40%)</span>
                </span>
              </div>
              <button 
                onClick={() => onNavigateTab('reports')}
                className="text-blue-600 hover:underline font-semibold"
              >
                Detailed Utilization Reports →
              </button>
            </div>
          </div>

          {/* Site Overview List */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center justify-between font-mono">
              <span>Active Construction Sites ({sites.length})</span>
              <button onClick={() => onNavigateTab('tracking')} className="text-xs text-blue-600 hover:underline">
                View Site Maps →
              </button>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sites.map(s => {
                const siteAssets = assets.filter(a => a.siteId === s.id);
                const siteValue = siteAssets.reduce((sum, a) => sum + a.cost, 0);
                return (
                  <div key={s.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 hover:border-blue-500 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">{s.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded font-bold">
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
              <Radio className="w-5 h-5 text-blue-600 animate-pulse" />
              <h2 className="font-bold text-base text-slate-900">Real-Time RFID Read Stream</h2>
            </div>
            <span className="text-[10px] font-mono bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              860-960 MHz
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {readEvents.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">Waiting for real-time gateway RFID reads...</p>
            ) : (
              readEvents.slice(0, 15).map((evt) => (
                <div 
                  key={evt.id}
                  className={`p-3 rounded-lg border text-xs space-y-1 transition-all ${
                    evt.eventType === 'GEOFENCE_BREACH'
                      ? 'bg-red-50 border-red-200 text-red-900'
                      : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-blue-300'
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
                    <span className="font-mono text-blue-900 font-bold">{evt.rssi} dBm</span>
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
            <span className="font-mono">UHF RFID Engine</span>
            <button
              onClick={() => onNavigateTab('api')}
              className="text-blue-600 hover:underline font-semibold"
            >
              API Endpoint Log →
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
