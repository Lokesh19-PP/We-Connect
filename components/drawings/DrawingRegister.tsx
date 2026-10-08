"use client";

import { useState } from 'react';
import { Part, Drawing } from '@/types';
import { getDrawingStatus } from '@/lib/drawing-utils';
import { Search, FileText } from 'lucide-react';

interface DrawingRegisterProps {
  parts: Part[];
  drawings: Drawing[];
}

export function DrawingRegister({ parts, drawings }: DrawingRegisterProps) {
  const [search, setSearch] = useState('');

  const filteredParts = parts.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <div className="relative w-80">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
           <input 
             type="text" 
             placeholder="Search parts by name or code..."
             className="w-full border border-slate-300 py-2 pl-9 pr-4 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
             value={search}
             onChange={e => setSearch(e.target.value)}
           />
         </div>
         {/* Button for Upload Revision will go here later */}
      </div>

      <div className="space-y-6">
        {filteredParts.map(part => {
           const partDrawings = drawings.filter(d => d.partId === part.id).sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
           
           return (
             <div key={part.id} className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                  <h2 className="font-semibold text-slate-900">{part.displayName} <span className="text-slate-500 font-normal text-sm ml-2">({part.type})</span></h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-slate-500 bg-white border-b border-slate-100">
                      <tr>
                        <th className="px-5 py-3 font-medium">Revision</th>
                        <th className="px-5 py-3 font-medium">Status</th>
                        <th className="px-5 py-3 font-medium">Date</th>
                        <th className="px-5 py-3 font-medium">Uploaded By</th>
                        <th className="px-5 py-3 font-medium text-right">File</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {partDrawings.map(d => {
                        const status = getDrawingStatus(d, partDrawings);
                        return (
                          <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-3 font-medium text-slate-900">{d.revision}</td>
                            <td className="px-5 py-3">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center ${
                                status === 'Approved' ? 'bg-green-100 text-green-800' :
                                status === 'Superseded' ? 'bg-slate-100 text-slate-600' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {status}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-slate-600">{d.uploadedAt}</td>
                            <td className="px-5 py-3 text-slate-600">{d.uploadedBy}</td>
                            <td className="px-5 py-3 text-right">
                               <a href={d.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline">
                                 <FileText className="w-4 h-4 mr-1" /> View
                               </a>
                            </td>
                          </tr>
                        )
                      })}
                      {partDrawings.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-5 py-6 text-center text-slate-500">No revisions found for this part.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
             </div>
           );
        })}
        {filteredParts.length === 0 && (
          <div className="text-center py-12 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-500">
            No parts found matching "{search}".
          </div>
        )}
      </div>
    </div>
  );
}
