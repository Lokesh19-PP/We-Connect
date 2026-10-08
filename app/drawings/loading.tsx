export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-slate-200 rounded w-1/4"></div>
      <div className="flex justify-between items-center">
         <div className="h-10 bg-slate-200 rounded w-80"></div>
         <div className="h-10 bg-slate-200 rounded w-32"></div>
      </div>
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden h-48">
             <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
               <div className="h-5 bg-slate-200 rounded w-1/3"></div>
             </div>
             <div className="p-5 space-y-3">
               <div className="h-4 bg-slate-200 rounded w-full"></div>
               <div className="h-4 bg-slate-200 rounded w-5/6"></div>
               <div className="h-4 bg-slate-200 rounded w-4/6"></div>
             </div>
          </div>
        ))}
      </div>
    </div>
  )
}
