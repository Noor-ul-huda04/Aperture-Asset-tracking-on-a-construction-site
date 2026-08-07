import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Download, 
  Upload, 
  Radio, 
  Tag, 
  Boxes, 
  LayoutGrid, 
  List, 
  MapPin, 
  User, 
  ArrowLeftRight, 
  Eye, 
  Trash2, 
  Edit, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert,
  SlidersHorizontal
} from 'lucide-react';
import { Asset, AssetCategory, AssetStatus, Site } from '../types';

interface AssetRegistryViewProps {
  assets: Asset[];
  sites: Site[];
  onOpenRegisterModal: () => void;
  onOpenDetailModal: (asset: Asset) => void;
  onFindRadar: (asset: Asset) => void;
  onCheckoutAsset: (asset: Asset) => void;
  onEditAsset: (asset: Asset) => void;
  onDeleteAsset: (id: string) => void;
  onImportCsv: () => void;
}

export const AssetRegistryView: React.FC<AssetRegistryViewProps> = ({
  assets,
  sites,
  onOpenRegisterModal,
  onOpenDetailModal,
  onFindRadar,
  onCheckoutAsset,
  onEditAsset,
  onDeleteAsset,
  onImportCsv
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const categories: string[] = ['ALL', 'Tools', 'Heavy Equipment', 'Vehicles', 'PPE', 'Materials', 'Containers'];
  const statuses: string[] = ['ALL', 'In Zone', 'Checked Out', 'Under Maintenance', 'Missing'];

  const filteredAssets = assets.filter(a => {
    const matchesCategory = selectedCategory === 'ALL' || a.category === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || a.status === selectedStatus;
    const matchesSearch = searchTerm === '' || 
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.tagEpc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.model.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesStatus && matchesSearch;
  });

  const handleExportCsv = () => {
    const headers = ['ID,Name,Category,Manufacturer,Model,SerialNumber,TagEPC,Status,Site,Zone,Cost,Condition\n'];
    const rows = filteredAssets.map(a => 
      `"${a.id}","${a.name}","${a.category}","${a.manufacturer}","${a.model}","${a.serialNumber}","${a.tagEpc}","${a.status}","${a.siteName}","${a.zoneName}",${a.cost},"${a.condition}"`
    );
    const blob = new Blob([...headers, ...rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Aperture_Asset_Registry_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-5">
      
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div>
          <h2 className="font-bold text-lg text-white flex items-center gap-2">
            <Boxes className="w-5 h-5 text-amber-400" />
            <span>Physical Asset Master Registry</span>
            <span className="text-xs bg-slate-800 text-amber-400 border border-slate-700 font-mono font-bold px-2 py-0.5 rounded-full">
              {filteredAssets.length} / {assets.length}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">UHF RFID tagged tools, equipment, materials, and fleet inventory</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          
          <button
            onClick={onImportCsv}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
            title="Import Asset Fleet via CSV"
          >
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">CSV Import</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
            title="Export Selected Assets to CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Export CSV</span>
          </button>

          <button
            onClick={onOpenRegisterModal}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Register Asset</span>
          </button>

        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Search Bar */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by asset name, model, serial #, or EPC tag..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Status Filter Dropdown & View Mode Switcher */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
              >
                {statuses.map(st => (
                  <option key={st} value={st}>Status: {st}</option>
                ))}
              </select>
            </div>

            <div className="bg-slate-950 p-1 border border-slate-800 rounded-lg flex items-center gap-1">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded text-xs transition-colors ${viewMode === 'table' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded text-xs transition-colors ${viewMode === 'grid' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                title="Grid Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 text-xs">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full font-medium transition-all whitespace-nowrap shrink-0 ${
                selectedCategory === cat
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Main Asset View: Table or Grid */}
      {filteredAssets.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400 space-y-3">
          <Boxes className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="font-bold text-base text-slate-200">No matching physical assets found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">Try adjusting search query or clearing status/category filters.</p>
        </div>
      ) : viewMode === 'table' ? (
        
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Asset Details</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">UHF RFID EPC Tag</th>
                <th className="py-3 px-4">Zone / Site</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Custodian</th>
                <th className="py-3 px-4 text-right">Value</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredAssets.map(asset => (
                <tr key={asset.id} className="hover:bg-slate-800/50 transition-colors">
                  
                  {/* Photo & Name */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img src={asset.photoUrl} className="w-10 h-10 rounded-lg object-cover border border-slate-700 shrink-0" />
                      <div>
                        <span 
                          onClick={() => onOpenDetailModal(asset)}
                          className="font-bold text-white hover:text-amber-400 cursor-pointer text-xs block leading-snug"
                        >
                          {asset.name}
                        </span>
                        <span className="text-[10px] text-slate-400">{asset.manufacturer} {asset.model} • SN: {asset.serialNumber}</span>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4 font-semibold text-slate-300">
                    {asset.category}
                  </td>

                  {/* EPC Tag */}
                  <td className="py-3 px-4 font-mono text-amber-300 font-bold text-[11px]">
                    <div className="flex items-center gap-1">
                      <Tag className="w-3 h-3 text-amber-500" />
                      <span>{asset.tagEpc}</span>
                    </div>
                  </td>

                  {/* Zone & Site */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 text-slate-200 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <div>
                        <span>{asset.zoneName}</span>
                        <span className="block text-[10px] text-slate-400">{asset.siteName}</span>
                      </div>
                    </div>
                  </td>

                  {/* Status Pill */}
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      asset.status === 'In Zone' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      asset.status === 'Checked Out' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      asset.status === 'Missing' ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse' :
                      'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {asset.status === 'In Zone' && <CheckCircle2 className="w-3 h-3" />}
                      {asset.status === 'Checked Out' && <ArrowLeftRight className="w-3 h-3" />}
                      {asset.status === 'Missing' && <AlertTriangle className="w-3 h-3" />}
                      <span>{asset.status}</span>
                    </span>
                  </td>

                  {/* Custodian */}
                  <td className="py-3 px-4 text-slate-300 font-medium">
                    {asset.custodianName ? (
                      <span className="flex items-center gap-1 text-slate-200">
                        <User className="w-3 h-3 text-blue-400" />
                        <span>{asset.custodianName}</span>
                      </span>
                    ) : (
                      <span className="text-slate-500 font-italic">Unassigned</span>
                    )}
                  </td>

                  {/* Value */}
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                    ${asset.cost.toLocaleString()}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1.5">
                      
                      <button
                        onClick={() => onFindRadar(asset)}
                        className="p-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg transition-colors"
                        title="Proximity RSSI Radar Finder"
                      >
                        <Radio className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onOpenDetailModal(asset)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                        title="View Asset Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onEditAsset(asset)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                        title="Edit / Re-bind Tag"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onDeleteAsset(asset.id)}
                        className="p-1.5 bg-slate-800 hover:bg-red-900/50 text-slate-400 hover:text-red-300 rounded-lg transition-colors"
                        title="Remove Asset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

      ) : (

        /* Grid Cards View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.map(asset => (
            <div key={asset.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-colors flex flex-col">
              <div className="relative h-40 bg-slate-950">
                <img src={asset.photoUrl} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shadow-md ${
                    asset.status === 'In Zone' ? 'bg-emerald-600 text-white' :
                    asset.status === 'Checked Out' ? 'bg-blue-600 text-white' :
                    'bg-red-600 text-white animate-pulse'
                  }`}>
                    {asset.status}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm hover:text-amber-400 cursor-pointer" onClick={() => onOpenDetailModal(asset)}>
                    {asset.name}
                  </h3>
                  <p className="text-xs text-slate-400">{asset.manufacturer} {asset.model}</p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">EPC:</span>
                    <span className="text-amber-400 font-bold">{asset.tagEpc}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Zone:</span>
                    <span className="text-slate-200">{asset.zoneName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Value:</span>
                    <span className="text-emerald-400 font-bold">${asset.cost}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => onFindRadar(asset)}
                    className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center gap-1"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>Radar</span>
                  </button>
                  <button
                    onClick={() => onOpenDetailModal(asset)}
                    className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg"
                  >
                    Inspect
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      )}

    </div>
  );
};
