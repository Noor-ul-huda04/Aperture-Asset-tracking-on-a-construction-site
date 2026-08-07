import React from 'react';
import { Cpu, Wifi, WifiOff, Radio, Sliders, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Reader } from '../types';

interface HardwareManagementViewProps {
  readers: Reader[];
  onUpdatePower: (readerId: string, powerDbm: number) => void;
  onFlushBuffer: () => void;
}

export const HardwareManagementView: React.FC<HardwareManagementViewProps> = ({
  readers,
  onUpdatePower,
  onFlushBuffer
}) => {
  return (
    <div className="space-y-6">
      
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-lg text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-amber-400" />
            <span>UHF RFID Gateways & Handheld Scanner Registry</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">LLRP fixed portals, antenna RF power tuning, firmware status, and edge offline buffer sync</p>
        </div>

        <button
          onClick={onFlushBuffer}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-2 shadow-lg"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Flush / Sync Edge Offline Buffer</span>
        </button>
      </div>

      {/* Readers List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {readers.map(r => (
          <div key={r.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>{r.name}</span>
                </h3>
                <p className="text-xs text-slate-400">{r.siteName} • {r.zoneName}</p>
              </div>

              <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                r.status === 'Online' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400'
              }`}>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>{r.status}</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">IP Address</span>
                <span className="text-slate-200 font-bold">{r.ipAddress}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Firmware</span>
                <span className="text-slate-200">{r.firmwareVersion}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Lifetime Read Count</span>
                <span className="text-amber-400 font-bold">{r.readCountTotal.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Buffered Queue</span>
                <span className="text-emerald-400 font-bold">{r.bufferedEventsCount} events</span>
              </div>
            </div>

            {/* Antenna Power Slider */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Antenna Power Output:</span>
                <span className="text-amber-400 font-bold">{r.antennaPowerDbm} dBm</span>
              </div>
              <input
                type="range"
                min={15}
                max={32}
                value={r.antennaPowerDbm}
                onChange={e => onUpdatePower(r.id, Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
