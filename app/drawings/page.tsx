import { getParts, getDrawings } from '@/data/drawings';
import { DrawingRegister } from '@/components/drawings/DrawingRegister';

export default function DrawingsPage() {
  const parts = getParts();
  const drawings = getDrawings();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
        Drawings Register
      </h1>
      <DrawingRegister parts={parts} initialDrawings={drawings} />
    </div>
  );
}
