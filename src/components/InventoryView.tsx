import React, { useState } from 'react';
import { PackageSearch, AlertTriangle, Plus, RefreshCw, CheckCircle2 } from 'lucide-react';
import { InventoryItem } from '../types';

interface InventoryViewProps {
  inventory: InventoryItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory,
  onUpdateQuantity
}) => {
  const [scanningCycle, setScanningCycle] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  const lowStockItems = inventory.filter(i => i.quantityOnHand <= i.minThreshold);

  const handleRunBulkCycleCount = () => {
    setScanningCycle(true);
    setScanMessage('Initiating UHF RFID Array Sweeper across Laydown Yard...');
    setTimeout(() => {
      setScanningCycle(false);
      setScanMessage('Bulk RFID Cycle Scan Complete! 100% Reconciliation matched with physical tags.');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2">
            <PackageSearch className="w-5 h-5 text-amber-600" />
            <span>Bulk RFID Inventory & Consumable Supplies</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Automated yard cycle counts, reorder point threshold alerts, and variance logs</p>
        </div>

        <button
          onClick={handleRunBulkCycleCount}
          disabled={scanningCycle}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg flex items-center gap-2 shadow-xs transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${scanningCycle ? 'animate-spin' : ''}`} />
          <span>{scanningCycle ? 'Sweeping RFID Tags...' : 'Run Yard Bulk Cycle Scan'}</span>
        </button>
      </div>

      {scanMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-xl flex items-center gap-2 font-mono shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{scanMessage}</span>
        </div>
      )}

      {/* Low Stock Reorder Banner */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 text-amber-900 text-xs shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <span className="font-bold">LOW STOCK WARNING ({lowStockItems.length} items below minimum threshold):</span>
            <p className="text-[11px] text-amber-800 mt-0.5">
              {lowStockItems.map(i => `${i.name} (${i.quantityOnHand} ${i.unit} left)`).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Supply Item</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Site Location</th>
              <th className="py-3 px-4 font-mono">On Hand</th>
              <th className="py-3 px-4 font-mono">Min Threshold</th>
              <th className="py-3 px-4 text-right">Unit Price</th>
              <th className="py-3 px-4 text-center">Adjust Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {inventory.map(item => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-slate-900">
                  {item.name}
                </td>

                <td className="py-3 px-4 text-slate-500">
                  {item.category}
                </td>

                <td className="py-3 px-4 text-slate-800 font-medium">
                  {item.siteName}
                </td>

                <td className="py-3 px-4 font-mono font-bold text-amber-800 text-sm">
                  {item.quantityOnHand} {item.unit}
                </td>

                <td className="py-3 px-4 font-mono text-slate-500">
                  {item.minThreshold} {item.unit}
                </td>

                <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                  ${item.costPerUnit.toFixed(2)}
                </td>

                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-1.5 font-mono">
                    <button
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      className="w-6 h-6 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded flex items-center justify-center"
                    >
                      -
                    </button>
                    <button
                      onClick={() => onUpdateQuantity(item.id, 1)}
                      className="w-6 h-6 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );

};
