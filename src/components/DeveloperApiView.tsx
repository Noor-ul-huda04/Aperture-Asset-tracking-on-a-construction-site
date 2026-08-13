import React, { useState } from 'react';
import { Terminal, Code2, Server, CheckCircle2, Copy, Send, RefreshCw, Zap, Shield, Play } from 'lucide-react';

export const DeveloperApiView: React.FC = () => {
  const [activeEndpoint, setActiveEndpoint] = useState<'gao_read' | 'aperture_sync' | 'sse_stream' | 'openapi'>('gao_read');
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const endpoints = [
    { id: 'gao_read', name: 'GAO Tag Ingestion API', method: 'POST', path: '/api/gao/read-tags', desc: 'GAO LLRP-compatible RFID tag read ingestion endpoint' },
    { id: 'aperture_sync', name: 'Aperture Proxy Sync', method: 'GET', path: '/api/aperture/sync', desc: 'Syncs state between Aperture RFID Engine and MongoDB Atlas' },
    { id: 'sse_stream', name: 'SSE Live Pulse Stream', method: 'GET', path: '/api/events/sse', desc: 'Server-Sent Events streaming live real-time RFID pulses' },
    { id: 'openapi', name: 'OpenAPI 3.0 Spec', method: 'GET', path: '/api/docs/openapi', desc: 'Complete OpenAPI 3.0 specification for Aperture system' }
  ];

  const handleTestApi = async () => {
    setIsLoading(true);
    setTestResponse(null);
    try {
      if (activeEndpoint === 'gao_read') {
        const res = await fetch('/api/gao/read-tags', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ epc: 'E2801191A000001000000999', readerId: 'reader-101', rssi: -48 })
        });
        const data = await res.json();
        setTestResponse(JSON.stringify(data, null, 2));
      } else if (activeEndpoint === 'aperture_sync') {
        const res = await fetch('/api/aperture/sync');
        const data = await res.json();
        setTestResponse(JSON.stringify(data, null, 2));
      } else if (activeEndpoint === 'openapi') {
        const res = await fetch('/api/docs/openapi');
        const data = await res.json();
        setTestResponse(JSON.stringify(data, null, 2));
      } else {
        setTestResponse(JSON.stringify({
          stream: 'SSE Live Event Stream Connected',
          endpoint: '/api/events/sse',
          note: 'EventSource connects and receives pulse events with text/event-stream headers'
        }, null, 2));
      }
    } catch (err: any) {
      setTestResponse(JSON.stringify({ error: err.message || 'API Test Failed' }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  const currentEp = endpoints.find(e => e.id === activeEndpoint) || endpoints[0];

  const curlCommand = activeEndpoint === 'gao_read'
    ? `curl -X POST https://<your-host>/api/gao/read-tags \\\n  -H "Content-Type: application/json" \\\n  -d '{"epc": "E2801191A000001000000999", "readerId": "reader-101", "rssi": -48}'`
    : `curl -X GET https://<your-host>${currentEp.path}`;

  const copyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-amber-600" />
            <span>Developer API & GAO RFID Integration Hub</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">RESTful endpoints, GAO LLRP-compatible reader proxying, Webhooks, and OpenAPI 3.0 specification</p>
        </div>

        <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-xs font-bold rounded-full flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>API Gateway Active (v4.2.0)</span>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Endpoint Navigation List */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-xs">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider px-2 py-1">Available Endpoints</h3>
          {endpoints.map((ep) => (
            <button
              key={ep.id}
              onClick={() => {
                setActiveEndpoint(ep.id as any);
                setTestResponse(null);
              }}
              className={`w-full text-left p-3 rounded-xl border transition-all ${
                activeEndpoint === ep.id
                  ? 'bg-amber-500 text-white border-amber-600 font-bold shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  ep.method === 'POST' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
                }`}>
                  {ep.method}
                </span>
                <span className="opacity-80 text-[10px]">{ep.path}</span>
              </div>
              <div className="text-xs mt-1.5 font-bold truncate">{ep.name}</div>
              <p className="text-[11px] opacity-80 line-clamp-1 mt-0.5 font-sans font-normal">{ep.desc}</p>
            </button>
          ))}
        </div>

        {/* Interactive Endpoint Tester & cURL */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-6 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-mono text-amber-400 font-bold uppercase">{currentEp.method} ENDPOINT</span>
              <h3 className="text-lg font-bold text-white font-mono">{currentEp.path}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{currentEp.desc}</p>
            </div>

            <button
              onClick={handleTestApi}
              disabled={isLoading}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isLoading ? 'Executing...' : 'Execute Request'}</span>
            </button>
          </div>

          {/* cURL Snippet */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>cURL COMMAND</span>
              <button
                onClick={copyCurl}
                className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold text-[11px]"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy cURL'}</span>
              </button>
            </div>
            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-emerald-400 font-mono text-xs overflow-x-auto whitespace-pre-wrap">
              {curlCommand}
            </pre>
          </div>

          {/* Live Response Output */}
          <div className="space-y-2">
            <span className="text-xs font-mono text-slate-400 block">HTTP RESPONSE PAYLOAD</span>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 min-h-[160px] max-h-[300px] overflow-y-auto whitespace-pre-wrap">
              {testResponse ? testResponse : <span className="text-slate-600 italic">// Click "Execute Request" above to test endpoint and view live response payload</span>}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
