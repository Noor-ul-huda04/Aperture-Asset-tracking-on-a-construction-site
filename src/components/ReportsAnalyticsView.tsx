import React from 'react';
import { FileSpreadsheet, Download, Printer, TrendingUp, DollarSign, PieChart as PieIcon } from 'lucide-react';
import { Asset, MaintenanceLog, AuditLog } from '../types';

interface ReportsAnalyticsViewProps {
  assets: Asset[];
  maintenanceLogs: MaintenanceLog[];
  auditLogs: AuditLog[];
}

export const ReportsAnalyticsView: React.FC<ReportsAnalyticsViewProps> = ({
  assets,
  maintenanceLogs,
  auditLogs
}) => {
  const totalFleetCost = assets.reduce((sum, a) => sum + a.cost, 0);
  const totalRepairCost = maintenanceLogs.reduce((sum, m) => sum + m.cost, 0);

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-600" />
            <span>Executive Reports & Total Cost of Ownership (TCO)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Custom report exporter, depreciation schedules, loss audit trends, and maintenance expenditure</p>
        </div>

        <button
          onClick={handlePrintReport}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold text-xs rounded-lg flex items-center gap-2 transition-all shadow-xs"
        >
          <Printer className="w-4 h-4 text-amber-600" />
          <span>Print / Save PDF Report</span>
        </button>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase block">Total Capital Expenditure</span>
          <span className="text-2xl font-black font-mono text-slate-900 block mt-1">${totalFleetCost.toLocaleString()}</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase block">Cumulative Maintenance Spend</span>
          <span className="text-2xl font-black font-mono text-amber-600 block mt-1">${totalRepairCost.toLocaleString()}</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase block">Estimated Annual Depreciation</span>
          <span className="text-2xl font-black font-mono text-emerald-600 block mt-1">${Math.round(totalFleetCost * 0.15).toLocaleString()}</span>
        </div>
      </div>

      {/* System Audit Trail */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
        <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">System Immutable Activity Audit Trail</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-mono text-[10px] uppercase border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Target Entity</th>
                <th className="py-2.5 px-3">Performed By</th>
                <th className="py-2.5 px-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.map(a => (
                <tr key={a.id} className="hover:bg-slate-50 font-mono">
                  <td className="py-2.5 px-3 text-slate-500">
                    {new Date(a.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-amber-700">
                    {a.action}
                  </td>
                  <td className="py-2.5 px-3 text-slate-900 font-semibold">
                    {a.entityName}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">
                    {a.userName}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                    {a.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );

};
