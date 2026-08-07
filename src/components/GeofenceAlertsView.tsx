import React from 'react';
import { ShieldAlert, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Alert } from '../types';

interface GeofenceAlertsViewProps {
  alerts: Alert[];
  onResolveAlert: (id: string) => void;
}

export const GeofenceAlertsView: React.FC<GeofenceAlertsViewProps> = ({
  alerts,
  onResolveAlert
}) => {
  const unresolved = alerts.filter(a => !a.resolved);
  const resolved = alerts.filter(a => a.resolved);

  return (
    <div className="space-y-6">
      
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            <span>Geofence & Security Alert Engine</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Automated detection of unauthorized movement, overdue loans, and gate breaches</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-lg">
            {unresolved.length} Active Security Incidents
          </span>
        </div>
      </div>

      {/* Active Incidents List */}
      <div className="space-y-4">
        <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Active Unresolved Alerts ({unresolved.length})</h3>

        {unresolved.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 shadow-xs">
            <ShieldCheck className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
            <p className="font-bold text-slate-800 text-sm">All Site Perimeter Geofences Clear</p>
            <p className="text-xs text-slate-500 mt-0.5">No unauthorized movements or overdue equipment detected.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {unresolved.map(alt => (
              <div
                key={alt.id}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-xs ${
                  alt.severity === 'CRITICAL'
                    ? 'bg-red-50/80 border-red-200 text-red-950'
                    : 'bg-amber-50/80 border-amber-200 text-amber-950'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg shrink-0 ${
                    alt.severity === 'CRITICAL' ? 'bg-red-100 text-red-600 animate-bounce' : 'bg-amber-100 text-amber-700'
                  }`}>
                    <ShieldAlert className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{alt.type}</span>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        alt.severity === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
                      }`}>
                        {alt.severity}
                      </span>
                    </div>

                    <p className="text-xs mt-1 text-slate-700">{alt.message}</p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-500 mt-2 font-mono">
                      <span>Site: <strong className="text-slate-800">{alt.siteName}</strong></span>
                      <span>Triggered: {new Date(alt.triggeredAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onResolveAlert(alt.id)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shrink-0 flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Acknowledge & Resolve</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolved Log */}
      {resolved.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-200">
          <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider">Incident Audit Log ({resolved.length})</h3>
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs shadow-xs">
            {resolved.map(r => (
              <div key={r.id} className="p-3 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800">{r.type}: </span>
                  <span className="text-slate-600">{r.message}</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  Resolved: {r.resolvedAt ? new Date(r.resolvedAt).toLocaleTimeString() : 'Yes'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

