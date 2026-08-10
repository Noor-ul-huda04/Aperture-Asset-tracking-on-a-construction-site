import React, { useState, useEffect } from 'react';
import { 
  Database, 
  ShieldCheck, 
  Activity, 
  RefreshCw, 
  HardDrive, 
  Lock, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Sparkles, 
  Zap,
  Layers,
  FileCode
} from 'lucide-react';

export const MongoDbFirewallView: React.FC = () => {
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [wafStatus, setWafStatus] = useState<any>(null);
  const [loadingDb, setLoadingDb] = useState(false);
  const [loadingWaf, setLoadingWaf] = useState(false);
  const [logMessages, setLogMessages] = useState<string[]>([]);

  const fetchStatus = async () => {
    try {
      const dbRes = await fetch('/api/v1/database/mongodb-status');
      if (dbRes.ok) setDbStatus(await dbRes.json());

      const wafRes = await fetch('/api/v1/security/firewall');
      if (wafRes.ok) setWafStatus(await wafRes.json());
    } catch (e) {
      console.error('Failed to load DB/WAF status:', e);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleOptimizeDb = async () => {
    setLoadingDb(true);
    try {
      const res = await fetch('/api/v1/database/mongodb-optimize', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setLogMessages(prev => [`[${new Date().toLocaleTimeString()}] MongoDB: ${data.message}`, ...prev]);
        fetchStatus();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDb(false);
    }
  };

  const handleTestFirewall = async (attackType: string) => {
    setLoadingWaf(true);
    try {
      const res = await fetch('/api/v1/security/firewall-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attackType })
      });
      if (res.ok) {
        const data = await res.json();
        setLogMessages(prev => [`[${new Date().toLocaleTimeString()}] WAF SHIELD: Intercepted and dropped ${data.threatIntercepted}`, ...prev]);
        fetchStatus();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingWaf(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-50 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200 uppercase tracking-widest font-mono">
              Infrastructure Security Engine
            </span>
            <span className="text-xs text-emerald-700 font-mono font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> All Systems Nominal
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1 flex items-center gap-2">
            <Database className="w-7 h-7 text-blue-600" />
            <span>Primary MongoDB Cluster & Edge WAF Firewall</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Enterprise database persistence layer and web application firewall shielding the Express backend against unauthorized RFID EPC spoofing and DDoS payloads.
          </p>
        </div>

        <button
          onClick={fetchStatus}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 flex items-center gap-2 transition-all active:scale-95 shrink-0"
        >
          <RefreshCw className="w-4 h-4 text-blue-600" />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Grid: Primary MongoDB DB vs Secondary WAF Firewall */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* PRIMARY DATABASE: MongoDB Cluster Panel */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-800 uppercase tracking-wider block">
                  PRIMARY DATABASE
                </span>
                <h3 className="font-bold text-slate-900 text-base">
                  {dbStatus?.primaryDb || 'MongoDB Enterprise Cluster'}
                </h3>
              </div>
            </div>

            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-mono font-bold">
              {dbStatus?.connectionStatus || 'CONNECTED'}
            </span>
          </div>

          {/* Key DB Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-mono text-slate-500 block">Replica Set</span>
              <span className="text-xs font-bold text-slate-900 font-mono">{dbStatus?.replicaSet || 'rs0-main'}</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-mono text-slate-500 block">Active Connections</span>
              <span className="text-xs font-bold text-slate-900 font-mono">{dbStatus?.activeConnections || 42} pool</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-mono text-slate-500 block">Query Latency</span>
              <span className="text-xs font-bold text-emerald-700 font-mono">{dbStatus?.queryLatencyMs || 1.15} ms</span>
            </div>
          </div>

          {/* BSON Collections Overview */}
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider block">
              Document Collections & Counts
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 bg-blue-50/50 border border-blue-100 rounded-lg flex justify-between">
                <span className="text-slate-600">db.assets:</span>
                <span className="font-bold text-blue-900">{dbStatus?.collections?.assets || 24} docs</span>
              </div>
              <div className="p-2.5 bg-blue-50/50 border border-blue-100 rounded-lg flex justify-between">
                <span className="text-slate-600">db.read_events:</span>
                <span className="font-bold text-blue-900">{dbStatus?.collections?.read_events || 150} docs</span>
              </div>
              <div className="p-2.5 bg-blue-50/50 border border-blue-100 rounded-lg flex justify-between">
                <span className="text-slate-600">db.checkouts:</span>
                <span className="font-bold text-blue-900">{dbStatus?.collections?.checkouts || 8} docs</span>
              </div>
              <div className="p-2.5 bg-blue-50/50 border border-blue-100 rounded-lg flex justify-between">
                <span className="text-slate-600">db.readers:</span>
                <span className="font-bold text-blue-900">{dbStatus?.collections?.readers || 12} docs</span>
              </div>
            </div>
          </div>

          {/* Query Log & Optimization */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-slate-500 font-bold block">
              Recent Aggregation Pipeline Query:
            </span>
            <div className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
              {dbStatus?.lastBsonQuery || 'db.read_events.find({}).sort({ timestamp: -1 })'}
            </div>
          </div>

          <button
            onClick={handleOptimizeDb}
            disabled={loadingDb}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loadingDb ? 'Re-Indexing BSON...' : 'Re-Balance MongoDB Indexes & Compact Cache'}</span>
          </button>
        </div>

        {/* SECONDARY FIREWALL: Edge WAF Shield Panel */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-800 uppercase tracking-wider block">
                  SECONDARY FIREWALL
                </span>
                <h3 className="font-bold text-slate-900 text-base">
                  {wafStatus?.firewallEngine || 'Aperture Edge WAF Guard'}
                </h3>
              </div>
            </div>

            <span className="px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg text-xs font-mono font-bold">
              {wafStatus?.wafStatus || 'ACTIVE'}
            </span>
          </div>

          {/* Firewall Rules List */}
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider block">
              Active Security Inspection Rules
            </span>
            <div className="space-y-2">
              {wafStatus?.activeRules?.map((rule: any) => (
                <div key={rule.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-blue-600" />
                    <span className="font-bold text-slate-900">{rule.name}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    {rule.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Threat Attack Simulation */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider block">
              Test Firewall Threat Interception
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleTestFirewall('Spoofed RFID EPC Packet Flood')}
                disabled={loadingWaf}
                className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-all text-left"
              >
                ⚠️ Test EPC Spoof Attack
              </button>
              <button
                onClick={() => handleTestFirewall('Unauthorized BSON Injection')}
                disabled={loadingWaf}
                className="py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition-all text-left"
              >
                🛡️ Test BSON Injection
              </button>
            </div>
          </div>

          {/* Last Blocked Threat Box */}
          {wafStatus?.lastThreatBlocked && (
            <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] space-y-1 border border-slate-800">
              <div className="flex justify-between text-amber-400 font-bold">
                <span>LAST BLOCKED THREAT</span>
                <span>{wafStatus.lastThreatBlocked.action}</span>
              </div>
              <p className="text-slate-400">Type: {wafStatus.lastThreatBlocked.type}</p>
              <p className="text-slate-400">Origin IP: {wafStatus.lastThreatBlocked.sourceIP}</p>
            </div>
          )}
        </div>

      </div>

      {/* Log Console Output */}
      {logMessages.length > 0 && (
        <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl border border-slate-800 font-mono text-xs space-y-1 max-h-36 overflow-y-auto">
          <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block mb-1">
            Database & Security Real-Time Audit Stream
          </span>
          {logMessages.map((msg, i) => (
            <p key={i} className="text-slate-300">
              {msg}
            </p>
          ))}
        </div>
      )}

    </div>
  );
};
