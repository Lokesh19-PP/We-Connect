# VendorFlow Phase B: Data Layer Pattern & Guide

## Overview

The data layer in [`lib/data/index.ts`](file:///c:/Users/lokes/OneDrive/Desktop/GIT-REPO/We-Connect/We-Connect/lib/data/index.ts) provides a unified, typed interface between UI screens and backend data storage.

It enables two seamless modes:
1. **Live Supabase Mode** (Default in Phase B): Queries PostgreSQL tables with Row-Level Security (RLS) and maps database snake_case fields into the shared TypeScript domain types in `@/types`.
2. **Sample Mock Mode** (`NEXT_PUBLIC_USE_SAMPLE=true`): Automatically falls back to offline sample datasets in [`data/sample.ts`](file:///c:/Users/lokes/OneDrive/Desktop/GIT-REPO/We-Connect/We-Connect/data/sample.ts) for testing, development without network, or running unit tests.

---

## Core Rules

1. **No Raw SQL or Direct Database Queries in Screens**: Screens never import Supabase client directly to run queries. They always import typed helpers from `@/lib/data`.
2. **Identical Return Types**: Every fetch function returns the canonical domain interfaces defined in [`types/index.ts`](file:///c:/Users/lokes/OneDrive/Desktop/GIT-REPO/We-Connect/We-Connect/types/index.ts) (`Job`, `Workshop`, `Drawing`, `Delivery`, `Inspection`, `InvoicePayment`).
3. **Structured Result Pattern**: All async fetchers return a `{ data: T | null, error: string | null }` tuple.

---

## Available Data Fetchers

| Function | Return Type | Description |
|---|---|---|
| `fetchJobs()` | `Promise<FetchResult<Job[]>>` | Returns all jobs visible to current role |
| `fetchJob(id)` | `Promise<FetchResult<Job>>` | Returns single job with part & workshop data |
| `fetchWorkshops()` | `Promise<FetchResult<Workshop[]>>` | Returns workshops list |
| `fetchParts()` | `Promise<FetchResult<Part[]>>` | Returns parts catalogue |
| `fetchDrawings(partId?)` | `Promise<FetchResult<Drawing[]>>` | Returns drawings, optionally filtered by part |
| `fetchDeliveries(jobId?)` | `Promise<FetchResult<Delivery[]>>` | Returns deliveries list |
| `fetchInspections(jobId?)` | `Promise<FetchResult<Inspection[]>>` | Returns inspections list |
| `fetchInvoicePayments(jobId?)` | `Promise<FetchResult<InvoicePayment[]>>`| Returns invoices & payment statuses |
| `fetchAssemblySlots()` | `Promise<FetchResult<AssemblySlot[]>>` | Returns 14-day shortfall calendar slots |
| `fetchNotifications()` | `Promise<FetchResult<AppNotification[]>>`| Returns current user's notifications |

---

## Standard Usage Patterns

### Pattern A: Client Component with Loading and Error States

```tsx
'use client';

import { useState, useEffect } from 'react';
import { fetchJobs } from '@/lib/data';
import type { Job } from '@/types';
import { Loader2, AlertCircle } from 'lucide-react';

export function JobsList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);
      setError(null);
      const { data, error } = await fetchJobs();

      if (!active) return;

      if (error) {
        setError(error);
      } else if (data) {
        setJobs(data);
      }
      setLoading(false);
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading jobs from Supabase...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center space-x-2">
        <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
        <span>Failed to load data: {error}</span>
      </div>
    );
  }

  if (jobs.length === 0) {
    return <div className="p-8 text-center text-slate-500">No jobs found.</div>;
  }

  return (
    <ul className="divide-y divide-slate-100">
      {jobs.map((job) => (
        <li key={job.id} className="py-3">
          {job.partDisplayName} &bull; {job.stage}
        </li>
      ))}
    </ul>
  );
}
```

### Pattern B: Server Component Data Fetching

```tsx
import { fetchJob } from '@/lib/data';
import { notFound } from 'next/navigation';

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const { data: job, error } = await fetchJob(params.id);

  if (error || !job) {
    notFound();
  }

  return (
    <div>
      <h1>{job.partDisplayName}</h1>
      <p>Due: {job.dueDate}</p>
    </div>
  );
}
```

---

## Backward Compatibility with Prototype Getters

For existing screens that import synchronous getters such as:
```ts
import { getJobs, getWorkshops } from '@/lib/data';
```
These getters remain fully available and backed by sample mock data. This ensures existing screens continue to render without errors while team members perform their Step 2 data swaps one by one.
