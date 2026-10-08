'use client';

// ──────────────────────────────────────────────
// VendorFlow – RFQ Placeholder Page (/rfqs)
// Owned by Soham (§8)
// Clean preview page with mock illustration
// ──────────────────────────────────────────────
import { useState } from 'react';
import {
  FileText,
  Bell,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Building2,
  DollarSign,
  Clock,
  Check,
} from 'lucide-react';

export default function RFQsPage() {
  const [notified, setNotified] = useState(false);

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* Title & Badge Header */}
      <div className="text-center space-y-3">
        <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Feature Preview • Coming in Next Release</span>
        </span>

        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Request for Quotations (RFQs)
        </h1>
        <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
          Request competitive quotes from verified workshops, compare pricing and delivery lead-times side-by-side, and issue purchase orders with a single click.
        </p>
      </div>

      {/* Mock Illustration using SVG / Simple Shapes */}
      <div className="p-8 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden text-white">
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />

        <div className="relative z-10 space-y-6">
          <p className="text-center text-xs font-bold text-blue-400 uppercase tracking-widest">
            Mockup Preview • Automated RFQ Comparison
          </p>

          {/* 3 Mock Quotation Cards Floating */}
          <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
            {/* Quote 1: Winner */}
            <div className="p-4 bg-slate-800/90 border-2 border-emerald-500 rounded-2xl shadow-lg relative space-y-3 backdrop-blur-xs transform hover:-translate-y-1 transition-transform">
              <div className="absolute -top-3 right-3 bg-emerald-500 text-slate-950 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center space-x-1">
                <Check className="w-3 h-3 stroke-[3]" />
                <span>Best Value</span>
              </div>
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-xs text-white">Shree Fabricators</span>
              </div>
              <div className="space-y-1 border-t border-slate-700/60 pt-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Quote Price:</span>
                  <span className="font-bold text-emerald-400">₹1,45,000</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Lead Time:</span>
                  <span className="font-medium text-slate-200">10 Days</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">On-Time Score:</span>
                  <span className="font-bold text-emerald-400">96%</span>
                </div>
              </div>
            </div>

            {/* Quote 2: Faster */}
            <div className="p-4 bg-slate-800/60 border border-slate-700/80 rounded-2xl shadow-md space-y-3 backdrop-blur-xs">
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-blue-400" />
                <span className="font-bold text-xs text-white">Om Engg Works</span>
              </div>
              <div className="space-y-1 border-t border-slate-700/60 pt-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Quote Price:</span>
                  <span className="font-semibold text-slate-200">₹1,52,000</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Lead Time:</span>
                  <span className="font-bold text-blue-400">8 Days</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">On-Time Score:</span>
                  <span className="font-semibold text-slate-300">88%</span>
                </div>
              </div>
            </div>

            {/* Quote 3: Lower */}
            <div className="p-4 bg-slate-800/60 border border-slate-700/80 rounded-2xl shadow-md space-y-3 backdrop-blur-xs">
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span className="font-bold text-xs text-white">Patil Steel</span>
              </div>
              <div className="space-y-1 border-t border-slate-700/60 pt-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Quote Price:</span>
                  <span className="font-semibold text-slate-200">₹1,40,000</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Lead Time:</span>
                  <span className="font-semibold text-slate-300">14 Days</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">On-Time Score:</span>
                  <span className="font-semibold text-amber-400">82%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Breakdown Cards */}
      <div className="grid grid-cols-3 gap-6 text-xs">
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">1. Digital RFQ Packages</h3>
          <p className="text-slate-500 leading-relaxed">
            Attach approved drawing revisions and target quantities into standardized bidding RFQ packages sent directly to vendors.
          </p>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">2. Automated Comparison</h3>
          <p className="text-slate-500 leading-relaxed">
            Instantly compare price quotes, committed delivery dates, and past quality yields across workshops in a single matrix.
          </p>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">3. One-Tap Job Award</h3>
          <p className="text-slate-500 leading-relaxed">
            Award quotation winner with one tap to automatically spawn an active subcontract job pre-linked with drawing revisions.
          </p>
        </div>
      </div>

      {/* Call to Action: Notify Me Button */}
      <div className="p-6 bg-slate-100/80 border border-slate-200 rounded-2xl text-center space-y-4">
        <div className="space-y-1">
          <h4 className="font-bold text-slate-900 text-base">
            Want early access to RFQ bidding?
          </h4>
          <p className="text-xs text-slate-500">
            Subscribe to be notified as soon as the RFQ quoting module goes live in VendorFlow v2.
          </p>
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setNotified(true)}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm ${
              notified
                ? 'bg-emerald-600 text-white cursor-default'
                : 'bg-orange-600 hover:bg-orange-700 text-white active:scale-95'
            }`}
          >
            {notified ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Notification Enabled! We'll alert you on launch.</span>
              </>
            ) : (
              <>
                <Bell className="w-4 h-4 text-white" />
                <span>Notify me when available</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
