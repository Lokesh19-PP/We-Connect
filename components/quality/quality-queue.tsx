'use client';

import { useState } from 'react';
import { getQualityQueue, QualityQueueRow } from '@/data/quality';
import { RiskBadge } from './risk-badge';
import { InspectionDialog } from './inspection-dialog';

type Tab = 'To inspect' | 'Rework' | 'Reinspection due' | 'Completed';
const TABS: Tab[] = ['To inspect', 'Rework', 'Reinspection due', 'Completed'];

export function QualityQueue() {
  const [activeTab, setActiveTab] = useState<Tab>('To inspect');
  const [selectedRow, setSelectedRow] = useState<QualityQueueRow | null>(null);
  const [queue, setQueue] = useState<QualityQueueRow[]>(getQualityQueue());
  
  const filteredRows = queue.filter(row => row.statusTab === activeTab);

  const handleReject = (rowId: string, remarks: string, reinspectionDate: string) => {
    setQueue(prev => prev.map(r => r.id === rowId ? {
      ...r, 
      statusTab: 'Rework',
      risk: 'Reinspection due'
    } : r));
    setSelectedRow(null);
  };

  const handleAccept = (rowId: string, qtyAccepted: number) => {
    setQueue(prev => prev.map(r => r.id === rowId ? {
      ...r,
      statusTab: 'Completed',
      quantityDelivered: qtyAccepted,
      risk: 'On track'
    } : r));
    setSelectedRow(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex border-b border-slate-200">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 -mb-px text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Job / Part</th>
                <th className="px-4 py-3 font-medium">Vendor</th>
                <th className="px-4 py-3 font-medium">Quantity Delivered</th>
                <th className="px-4 py-3 font-medium">Drawing Rev</th>
                <th className="px-4 py-3 font-medium">Delivered Date</th>
                <th className="px-4 py-3 font-medium">Risk</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No items found for this status.
                  </td>
                </tr>
              ) : (
                filteredRows.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{row.jobId}</div>
                      <div className="text-slate-500">{row.partDisplayName}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{row.workshopName}</td>
                    <td className="px-4 py-3 text-slate-700">{row.quantityDelivered}</td>
                    <td className="px-4 py-3 text-slate-700">{row.drawingRevision}</td>
                    <td className="px-4 py-3 text-slate-700">{row.deliveredDate}</td>
                    <td className="px-4 py-3">
                      <RiskBadge risk={row.risk} />
                    </td>
                    <td className="px-4 py-3">
                      <button 
                        onClick={() => setSelectedRow(row)}
                        className="text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        {activeTab === 'To inspect' || activeTab === 'Reinspection due' ? 'Inspect' : 'View'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRow && (
        <InspectionDialog 
          row={selectedRow}
          isOpen={!!selectedRow}
          onClose={() => setSelectedRow(null)}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      )}
    </div>
  );
}
