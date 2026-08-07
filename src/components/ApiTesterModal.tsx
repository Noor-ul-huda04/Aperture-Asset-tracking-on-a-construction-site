import React, { useState } from 'react';
import { X, Terminal, Send, CheckCircle2, Play } from 'lucide-react';
import { simulateScan } from '../services/api';

interface ApiTesterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshAll: () => void;
}

export const ApiTesterModal: React.FC<ApiTesterModalProps> = ({
  isOpen,
  onClose,
  onRefreshAll
}) => {
  if (!isOpen) return null;

  const [epc, setEpc] = useState('E2801191A000001000000109');
  const [readerId, setReaderId] = useState('reader-101');
  const [rssi, setRssi] = useState(-42);
  const [responseJson, setResponseJson] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSendApiScan = async () => {
    setLoading(true);
    try {
      const res = await simulateScan(epc, readerId, rssi);
      setResponseJson(JSON.stringify(res, null, 2));
      onRefreshAll();
    } catch (e: any) {
      setResponseJson(JSON.stringify({ error: e.message }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-8">
        
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-bold text-base text-white font-mono">POST /api/v1/events/scan Payload Debugger</h2>
              <p className="text-xs text-slate-400">Simulate LLRP Middleware edge RFID gateway JSON payload POST</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-mono mb-1">epc (Tag Identifier)</label>
              <input
                type="text"
                value={epc}
                onChange={e => setEpc(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-amber-300 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-mono mb-1">readerId (Gateway)</label>
              <select
                value={readerId}
                onChange={e => setReaderId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
              >
                <option value="reader-101">reader-101 (Gate 1 North)</option>
                <option value="reader-102">reader-102 (Laydown East)</option>
                <option value="reader-104">reader-104 (Tool Crib)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-mono mb-1">rssi (dBm signal)</label>
              <input
                type="number"
                value={rssi}
                onChange={e => setRssi(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          <button
            onClick={handleSendApiScan}
            disabled={loading}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg flex items-center justify-center gap-2 font-mono uppercase"
          >
            <Send className="w-4 h-4" />
            <span>{loading ? 'Sending API POST Request...' : 'POST /api/v1/events/scan'}</span>
          </button>

          {responseJson && (
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">REST API 200 OK Response:</span>
              <pre className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] font-mono text-amber-300 overflow-x-auto max-h-48">
                {responseJson}
              </pre>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
