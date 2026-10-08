"use client"

import React, { useState } from "react"
import {
  PageHeader,
  StatCard,
  StatusBadge,
  DataTable,
  EmptyState,
  ConfirmDialog,
  Button,
  ToastContainer,
  type ToastMessage,
} from "@/components/ui"
import {
  Briefcase,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Building2,
  FileCheck,
  Plus,
  Shield,
  Layers,
  Sparkles,
  Info,
} from "lucide-react"

interface SampleItem {
  id: string
  job: string
  vendor: string
  part: string
  stage: string
  risk: string
  dueDate: string
}

const SAMPLE_DATA: SampleItem[] = [
  {
    id: "JOB-101",
    job: "Bracket Assembly A1",
    vendor: "Shree Fabricators",
    part: "Laser-cut 5mm SS",
    stage: "In Production",
    risk: "On track",
    dueDate: "2026-10-12",
  },
  {
    id: "JOB-102",
    job: "Frame Support Weldment",
    vendor: "Om Engg Works",
    part: "TIG Welded Tube",
    stage: "Awaiting approval",
    risk: "At risk",
    dueDate: "2026-10-10",
  },
  {
    id: "JOB-103",
    job: "Main Pressure Plate",
    vendor: "Patil Steel",
    part: "Forged Alloy Flange",
    stage: "Reinspection due",
    risk: "May miss date",
    dueDate: "2026-10-08",
  },
  {
    id: "JOB-104",
    job: "Exhaust Duct Bend",
    vendor: "TechFab Pune",
    part: "316L Stainless Duct",
    stage: "Accepted",
    risk: "Paid",
    dueDate: "2026-10-15",
  },
  {
    id: "JOB-105",
    job: "Control Valve Mount",
    vendor: "Shree Fabricators",
    part: "CNC Milled Aluminum",
    stage: "On hold for quality",
    risk: "Rejected",
    dueDate: "2026-10-09",
  },
]

export default function DesignSystemPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = (
    type: "success" | "warning" | "error" | "info",
    title: string,
    message?: string
  ) => {
    const newToast: ToastMessage = {
      id: Date.now().toString(),
      type,
      title,
      message,
    }
    setToasts((prev) => [...prev, newToast])
  }

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const columns = [
    {
      header: "Job ID & Name",
      cell: (row: SampleItem) => (
        <div>
          <div className="font-semibold text-gray-900">{row.job}</div>
          <div className="text-xs text-gray-500">{row.id} • {row.part}</div>
        </div>
      ),
    },
    {
      header: "Vendor",
      accessorKey: "vendor" as keyof SampleItem,
    },
    {
      header: "Stage / Status",
      cell: (row: SampleItem) => <StatusBadge status={row.stage} />,
    },
    {
      header: "Risk Level",
      cell: (row: SampleItem) => <StatusBadge status={row.risk} />,
    },
    {
      header: "Due Date",
      accessorKey: "dueDate" as keyof SampleItem,
      align: "right" as const,
    },
  ]

  return (
    <div className="space-y-10 pb-16 max-w-7xl mx-auto">
      {/* Toast Render */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* Page Header Component */}
      <PageHeader
        title="Design System & Component Library"
        subtitle="Consistent design tokens, status mapping, and shared UI components for We Connect."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                addToast("info", "Design Token Export", "Tokens synced with app/globals.css")
              }
            >
              <Sparkles className="h-4 w-4" />
              Token Specs
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Test Confirm Dialog
            </Button>
          </div>
        }
      />

      {/* 1. Design Tokens Grid */}
      <section className="space-y-4">
        <div className="border-b border-gray-200 pb-2">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#F97316]" />
            1. Core Design Tokens
          </h2>
          <p className="text-xs text-gray-500">
            Colors, Typography, Surface Radius, and Spacing specs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Colors */}
          <div className="rounded-[10px] border border-gray-200 bg-white p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Brand Palette
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0F1B33] text-white text-xs font-mono">
                <span>Navy Sidebar</span>
                <span>#0F1B33</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#F97316] text-white text-xs font-mono">
                <span>Primary Orange</span>
                <span>#F97316</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#F6F7F9] text-gray-900 border border-gray-200 text-xs font-mono">
                <span>Soft Grey BG</span>
                <span>#F6F7F9</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white text-gray-900 border border-gray-200 text-xs font-mono">
                <span>Surface White</span>
                <span>#FFFFFF</span>
              </div>
            </div>
          </div>

          {/* Typography */}
          <div className="rounded-[10px] border border-gray-200 bg-white p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Typography (Inter)
            </h3>
            <div className="space-y-2 text-gray-900">
              <div>
                <span className="text-xs text-gray-400 block">Page Title (24px Semibold)</span>
                <span className="text-[24px] font-semibold leading-tight">Vendor Overview</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Section Title (16px Semibold)</span>
                <span className="text-[16px] font-semibold">Assembly Line Status</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Body (14px Regular)</span>
                <span className="text-[14px]">Standard body copy for tables and cards.</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Caption (12px Medium)</span>
                <span className="text-[12px] text-gray-500">Updated 2 mins ago by Workshop C</span>
              </div>
            </div>
          </div>

          {/* Radius & Border */}
          <div className="rounded-[10px] border border-gray-200 bg-white p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Radii & Borders
            </h3>
            <div className="space-y-3 text-xs text-gray-700">
              <div className="p-3 border border-gray-200 rounded-[10px] bg-gray-50">
                <span className="font-semibold text-gray-900">10px Card Radius</span>
                <p className="text-gray-500 mt-0.5">Used on cards, containers, and data tables.</p>
              </div>
              <div className="p-3 border border-gray-200 rounded-[8px] bg-white">
                <span className="font-semibold text-gray-900">8px Button / Input Radius</span>
                <p className="text-gray-500 mt-0.5">Used on interactive elements, inputs & dialogs.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Unified Status Badge Matrix */}
      <section className="space-y-4">
        <div className="border-b border-gray-200 pb-2">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-600" />
            2. Unified Status Badges
          </h2>
          <p className="text-xs text-gray-500">
            Single StatusBadge component with auto color & icon lookup for all domain states.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Green Category */}
          <div className="rounded-[10px] border border-emerald-200 bg-emerald-50/30 p-4 space-y-2.5">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block border-b border-emerald-200 pb-1">
              Green (On track / Success)
            </span>
            <div className="flex flex-col gap-2">
              <StatusBadge status="On track" />
              <StatusBadge status="Accepted" />
              <StatusBadge status="Paid" />
              <StatusBadge status="In Production" />
              <StatusBadge status="Completed" />
            </div>
          </div>

          {/* Amber Category */}
          <div className="rounded-[10px] border border-amber-200 bg-amber-50/30 p-4 space-y-2.5">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider block border-b border-amber-200 pb-1">
              Amber (At risk / Pending)
            </span>
            <div className="flex flex-col gap-2">
              <StatusBadge status="At risk" />
              <StatusBadge status="Reinspection due" />
              <StatusBadge status="Awaiting approval" />
              <StatusBadge status="Pending" />
              <StatusBadge status="Shortfall" />
            </div>
          </div>

          {/* Red Category */}
          <div className="rounded-[10px] border border-red-200 bg-red-50/30 p-4 space-y-2.5">
            <span className="text-xs font-semibold text-red-800 uppercase tracking-wider block border-b border-red-200 pb-1">
              Red (Critical / Reject)
            </span>
            <div className="flex flex-col gap-2">
              <StatusBadge status="May miss date" />
              <StatusBadge status="Overdue" />
              <StatusBadge status="Rejected" />
              <StatusBadge status="On hold for quality" />
              <StatusBadge status="Action Required" />
            </div>
          </div>

          {/* Blue Category */}
          <div className="rounded-[10px] border border-blue-200 bg-blue-50/30 p-4 space-y-2.5">
            <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider block border-b border-blue-200 pb-1">
              Blue (In progress / Info)
            </span>
            <div className="flex flex-col gap-2">
              <StatusBadge status="In progress" />
              <StatusBadge status="Under Review" />
              <StatusBadge status="Dispatched" />
              <StatusBadge status="Inspection Ready" />
            </div>
          </div>

          {/* Grey Category */}
          <div className="rounded-[10px] border border-gray-200 bg-gray-50/50 p-4 space-y-2.5">
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider block border-b border-gray-200 pb-1">
              Grey (Neutral / Draft)
            </span>
            <div className="flex flex-col gap-2">
              <StatusBadge status="Ordered" />
              <StatusBadge status="Draft" />
              <StatusBadge status="Cancelled" />
              <StatusBadge status="Archived" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. StatCards Section */}
      <section className="space-y-4">
        <div className="border-b border-gray-200 pb-2">
          <h2 className="text-base font-semibold text-gray-900">3. StatCards</h2>
          <p className="text-xs text-gray-500">Standardized KPI metrics with optional accent colors & icons.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            label="Active Jobs"
            value="25"
            hint="Across 4 active workshops"
            icon={Briefcase}
            accentColor="blue"
          />
          <StatCard
            label="At Risk Jobs"
            value="3"
            trend={{ direction: "up", value: "+1 today" }}
            hint="Predicted to miss assembly date"
            icon={AlertTriangle}
            accentColor="amber"
          />
          <StatCard
            label="Overdue Inspections"
            value="2"
            hint="Requires immediate QA review"
            icon={Clock}
            accentColor="red"
          />
          <StatCard
            label="First-Pass Quality Yield"
            value="94.2%"
            trend={{ direction: "up", value: "+2.1%" }}
            hint="Target: 92.0%"
            icon={CheckCircle2}
            accentColor="green"
          />
        </div>
      </section>

      {/* 4. DataTable Wrapper */}
      <section className="space-y-4">
        <div className="border-b border-gray-200 pb-2">
          <h2 className="text-base font-semibold text-gray-900">4. DataTable Wrapper</h2>
          <p className="text-xs text-gray-500">Sticky headers, row hover states, pagination, and skeleton loading.</p>
        </div>

        <DataTable<SampleItem>
          data={SAMPLE_DATA}
          columns={columns}
          keyExtractor={(item) => item.id}
          pageSize={3}
        />
      </section>

      {/* 5. Empty State Showcase */}
      <section className="space-y-4">
        <div className="border-b border-gray-200 pb-2">
          <h2 className="text-base font-semibold text-gray-900">5. Empty State Container</h2>
          <p className="text-xs text-gray-500">Used inside tables, tabs, or blank routes.</p>
        </div>

        <div className="rounded-[10px] border border-gray-200 bg-white p-6">
          <EmptyState
            icon={Building2}
            title="No vendor quotations submitted yet"
            description="When workshops submit bids for RFQ-2026-04, they will appear here for comparison."
            action={
              <Button
                variant="default"
                size="sm"
                onClick={() =>
                  addToast("success", "RFQ Reminder", "Invitation resent to 4 workshops.")
                }
              >
                Send Vendor Invitations
              </Button>
            }
          />
        </div>
      </section>

      {/* 6. Buttons & Interactive Toast Triggers */}
      <section className="space-y-4">
        <div className="border-b border-gray-200 pb-2">
          <h2 className="text-base font-semibold text-gray-900">
            6. Buttons, Focus Rings & Toast Notifications
          </h2>
          <p className="text-xs text-gray-500">
            Click to trigger standard toast notifications. All buttons feature accessible 4.5:1 text contrast & focus rings.
          </p>
        </div>

        <div className="rounded-[10px] border border-gray-200 bg-white p-6 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="default"
              size="sm"
              onClick={() =>
                addToast("success", "Job Status Updated", "Job #JOB-101 moved to Accepted.")
              }
            >
              Trigger Success Toast
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                addToast("warning", "Reinspection Reminder", "Vendor Om Engg Works notified.")
              }
            >
              Trigger Warning Toast
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() =>
                addToast("error", "Inspection Rejected", "Dimensional deviation on Flange B.")
              }
            >
              Trigger Error Toast
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                addToast("info", "Revision Uploaded", "Drawing DWG-204-REV2 synced with cloud.")
              }
            >
              Trigger Info Toast
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDialogOpen(true)}
            >
              Open Confirm Dialog
            </Button>
          </div>

          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-600 flex items-center gap-3">
            <Info className="h-4 w-4 text-[#F97316] shrink-0" />
            <span>
              <strong>Accessibility note:</strong> Keyboard users can navigate elements using Tab key. Active focus state triggers an orange high-contrast outline ring (<code>focus-visible:ring-2 focus-visible:ring-[#F97316]</code>).
            </span>
          </div>
        </div>
      </section>

      {/* Confirm Dialog Component */}
      <ConfirmDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={() =>
          addToast("success", "Action Executed", "The confirmation dialog was accepted cleanly.")
        }
        title="Confirm Vendor Reminder"
        description="Are you sure you want to send an urgent schedule reminder to Shree Fabricators for Job #JOB-102?"
        confirmText="Send Reminder"
        cancelText="Keep Draft"
        variant="warning"
      />
    </div>
  )
}
