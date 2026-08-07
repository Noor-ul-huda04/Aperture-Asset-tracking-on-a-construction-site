import React, { useState } from 'react';
import { Smartphone, Radio, ArrowLeftRight, CheckCircle2, ShieldAlert, Scan, RefreshCw } from 'lucide-react';
import { Asset, User, Checkout } from '../types';

interface MobileFieldScannerViewProps {
  assets: Asset[];
  users: User[];
  checkouts: Checkout[];
  onScanCheckout: (assetId: string, userId: string) => void;
  onScanReturn: (checkoutId: string) => void;
}

export const MobileFieldScannerView: React.FC<MobileFieldScannerViewProps> = ({
  assets,
  users,
  checkouts,
  onScanCheckout,
  onScanReturn
}) => {
  const [scannedEpc, setScannedEpc] = useState('');
  const [selectedUser, setSelectedUser] = useState(users[2]?.id || users[0]?.id || '');
  const [scannedAsset, setScannedAsset] = useState<Asset | null>(null);

  const handleSimulateHandheldTrigger = () => {
    // Pick an asset to simulate scanning
    const target = assets[Math.floor(Math.random() * assets.length)];
    if (target) {
      setScannedEpc(target.tagEpc);
      setScannedAsset(target);
    }
  };

  const activeCheckout = scannedAsset ? checkouts.find(c => c.assetId === scannedAsset.id && c.status !== 'RETURNED') : null;

  return (
    <div className="max-w-md mx-auto space-y-5 py-4">
      
      {/* Handheld Device Shell */}
      <div className="bg-white border-2 border-amber-500 rounded-3xl p-5 shadow-lg space-y-5 text-xs text-slate-800">
        
        {/* Android / Zebra Bar Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-amber-600" />
            <div>
              <span className="font-bold text-slate-900 block">Aperture Field Scanner</span>
              <span className="text-[10px] text-emerald-700 font-mono font-bold">Zebra TC8300 • Online</span>
            </div>
          </div>

          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        {/* Handheld RFID Laser Trigger Simulation */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-3">
          <p className="text-[11px] text-slate-500">Aim handheld scanner at asset RFID tag or worker badge</p>

          <button
            onClick={handleSimulateHandheldTrigger}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black rounded-xl shadow-md flex items-center justify-center gap-2 text-sm uppercase tracking-wider active:scale-95 transition-transform"
          >
            <Scan className="w-5 h-5 stroke-[2.5]" />
            <span>PULL HANDHELD SCAN TRIGGER</span>
          </button>
        </div>

        {/* Scanned Tag Result Box */}
        {scannedAsset && (
          <div className="bg-amber-50/50 border border-amber-300 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-amber-800">EPC READ MATCHED</span>
              <span className="text-[10px] font-mono text-slate-500">{scannedAsset.rssi} dBm</span>
            </div>

            <div className="flex items-center gap-3">
              <img src={scannedAsset.photoUrl} className="w-12 h-12 rounded-lg object-cover border border-slate-200" />
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{scannedAsset.name}</h4>
                <p className="text-[10px] text-slate-500">{scannedAsset.category} • {scannedAsset.zoneName}</p>
                <p className="font-mono text-amber-900 font-bold text-[11px]">{scannedAsset.tagEpc}</p>
              </div>
            </div>

            {/* Actions based on asset status */}
            <div className="pt-2 border-t border-amber-200 space-y-2">
              {activeCheckout ? (
                <button
                  onClick={() => { onScanReturn(activeCheckout.id); setScannedAsset(null); }}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Quick Return Check-In
                </button>
              ) : (
                <div className="space-y-2">
                  <select
                    value={selectedUser}
                    onChange={e => setSelectedUser(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 text-xs"
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.badgeId})</option>
                    ))}
                  </select>

                  <button
                    onClick={() => { onScanCheckout(scannedAsset.id, selectedUser); setScannedAsset(null); }}
                    className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-xs"
                  >
                    Issue Check-Out to Badge
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

    </div>
  );

};
