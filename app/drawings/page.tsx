import { DrawingRegister } from '@/components/drawings/DrawingRegister';

export const metadata = {
  title: 'Drawings Register | VendorFlow',
  description: 'Fabrication drawing revisions, approval workflow, and workshop acknowledgement tracking.',
};

export default function DrawingsPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Drawings Register &amp; Revision Control
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Enforce single approved revision per part, track workshop acknowledgements, and manage secure CAD/PDF drawing storage.
        </p>
      </div>
      <DrawingRegister />
    </div>
  );
}
