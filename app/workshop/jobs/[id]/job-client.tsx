'use client';

import { useState, useRef, useEffect } from 'react';
import { getJob, getDrawings, getAcknowledgementsForJob, getStatusUpdatesForJob, getDeliveriesForJob, getInspectionsForJob, getInvoicePaymentsForJob } from '@/data/sample';
import { canStartWork } from '@/lib/rules';
import { CheckCircle2, FileText, ZoomIn, Lock, Camera, Image as ImageIcon, AlertCircle, Receipt, Upload, FileUp, WifiOff } from 'lucide-react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getPaymentStatus } from '@/lib/rules';
import messages from '@/messages/en.json';

export default function JobClient({ jobId }: { jobId: string }) {
  const job = getJob(jobId);
  const [localAckTime, setLocalAckTime] = useState<string | null>(null);
  const [localUpdates, setLocalUpdates] = useState<any[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadFailed, setUploadFailed] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const invoiceInputRef = useRef<HTMLInputElement>(null);
  const [invoiceAmount, setInvoiceAmount] = useState<string>('');
  const [localInvoice, setLocalInvoice] = useState<{ amount: number, file: string } | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isCompressing, setIsCompressing] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!job) {
    return <div className="text-slate-400 p-6 text-center">{messages.workshop.jobNotFound}</div>;
  }

  const allDrawings = getDrawings();
  const acks = getAcknowledgementsForJob(jobId);
  const existingUpdates = getStatusUpdatesForJob(jobId);
  const approvedDrawing = allDrawings.find((d) => d.partId === job.partId && d.approved);
  const deliveries = getDeliveriesForJob(jobId);
  const inspections = getInspectionsForJob(jobId);
  const invoices = getInvoicePaymentsForJob(jobId);

  const activeInvoice = localInvoice ? { invoiceNumber: 'LOCAL-123', amount: localInvoice.amount, paymentStatus: 'Awaiting approval' as any } : invoices[0];
  const paymentStatus = getPaymentStatus(deliveries, inspections, activeInvoice);
  
  // Is delivered?
  const isDelivered = deliveries.length > 0 || localUpdates.some(u => u.status === 'Delivered');
  const isAcknowledged = !!initialAck || !!localAckTime;

  const mockAcks = isAcknowledged 
    ? [...acks, { drawingId: approvedDrawing?.id, jobId, workshopId: job.workshopId, acknowledgedAt: localAckTime || initialAck?.acknowledgedAt }] as any
    : acks;
  
  const startWorkCheck = canStartWork(job, allDrawings, mockAcks);
  const canStart = startWorkCheck.allowed;

  const handleConfirmDrawing = () => {
    setLocalAckTime(new Date().toISOString());
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFailed(false);
      setIsCompressing(true);
      
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.src = ev.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          setPhotoPreview(canvas.toDataURL('image/jpeg', 0.6));
          setIsCompressing(false);
          if (Math.random() < 0.3) setUploadFailed(true);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePostStatus = (status: string) => {
    if (uploadFailed) return;
    const newUpdate = {
      id: `local-${Date.now()}`,
      jobId,
      status,
      message: '',
      photoUrl: photoPreview,
      updatedAt: new Date().toISOString(),
      updatedBy: 'Workshop Staff',
    };
    setLocalUpdates([newUpdate, ...localUpdates]);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleInvoiceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && invoiceAmount) {
      setLocalInvoice({
        amount: Number(invoiceAmount),
        file: file.name
      });
    }
  };

  const allUpdates = [...localUpdates, ...existingUpdates].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="space-y-6 pb-20">
      {!isOnline && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-500 text-xs font-bold p-3 flex items-center justify-center -mx-4 -mt-6 mb-4">
          <WifiOff className="w-4 h-4 mr-2" />
          {messages.workshop.offlineMsg}
        </div>
      )}

      <div className="flex items-center space-x-3 text-slate-400 mb-2">
        <Link href="/workshop" className="p-2 -ml-2 active:bg-slate-800 rounded-full">
          <ChevronLeft className="w-6 h-6 text-slate-300" />
        </Link>
        <span className="text-sm font-semibold">{messages.workshop.backToJobs}</span>
      </div>

      <div className="bg-slate-900 border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white leading-tight">
          {job.partDisplayName}
        </h1>
        <div className="mt-2 flex items-center space-x-4 text-slate-300 text-base">
          <span className="font-semibold bg-slate-800 px-3 py-1 rounded-lg">
            {messages.workshop.qty}: {job.quantity}
          </span>
          <span>{messages.workshop.due}: {new Date(job.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
        </div>
      </div>

      {approvedDrawing && (
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider px-1">
            {messages.workshop.drawingRef}
          </h2>
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-500/20 p-2 rounded-xl">
                  <FileText className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-200">{approvedDrawing.revision}</h3>
                  <p className="text-xs text-emerald-400">{messages.workshop.approvedByEng}</p>
                </div>
              </div>
              <button className="p-3 bg-slate-700 rounded-xl active:bg-slate-600 transition-colors">
                <ZoomIn className="w-5 h-5 text-slate-300" />
              </button>
            </div>

            {!isAcknowledged ? (
              <Button 
                onClick={handleConfirmDrawing}
                className="w-full min-h-[56px] text-lg bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl active:scale-95 transition-transform"
              >
                {messages.workshop.confirmDrawingBtn}
              </Button>
            ) : (
              <div className="flex items-center space-x-3 bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                <div>
                  <p className="text-sm font-bold text-emerald-400">{messages.workshop.drawingAck}</p>
                  <p className="text-xs text-emerald-500/80">{messages.workshop.canPostUpdates}</p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider px-1">
          {messages.workshop.postUpdateTitle}
        </h2>
        
        {!canStart && (
          <div className="flex items-center space-x-2 text-amber-500/80 text-sm px-2 mb-2">
            <Lock className="w-4 h-4" />
            <span>{startWorkCheck.reason}</span>
          </div>
        )}

        <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 space-y-4">
          <div className="flex items-center space-x-3">
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              disabled={!canStart || isCompressing}
            />
            <Button 
              variant="secondary" 
              className="flex-1 min-h-[48px] bg-slate-700 hover:bg-slate-600"
              disabled={!canStart || isCompressing}
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="w-5 h-5 mr-2" />
              {isCompressing ? 'Compressing...' : messages.workshop.addPhoto}
            </Button>
          </div>

          {(photoPreview || isCompressing) && (
            <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-900 h-32 flex items-center justify-center">
              {isCompressing && (
                <div className="w-full h-full bg-slate-800 animate-pulse flex items-center justify-center">
                  <span className="text-slate-400 text-xs font-bold">Processing...</span>
                </div>
              )}
              {photoPreview && !isCompressing && (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoPreview} alt="Preview" className="object-cover h-full w-full opacity-80" />
                  
                  {uploadFailed && (
                    <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center space-y-2">
                      <AlertCircle className="w-8 h-8 text-red-500" />
                      <span className="text-red-400 font-bold text-sm">{messages.workshop.uploadFailed}</span>
                      <Button size="sm" variant="outline" className="bg-slate-800" onClick={() => setUploadFailed(false)}>
                        {messages.workshop.tryAgain}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 pt-2">
            <Button disabled={!canStart || uploadFailed || isCompressing} onClick={() => handlePostStatus('Started')} variant="outline" className="min-h-[56px] text-base justify-start px-6 bg-slate-800 border-slate-700 text-white">
              Started
            </Button>
            <Button disabled={!canStart || uploadFailed || isCompressing} onClick={() => handlePostStatus('In progress')} variant="outline" className="min-h-[56px] text-base justify-start px-6 bg-slate-800 border-slate-700 text-white">
              In progress
            </Button>
            <Button disabled={!canStart || uploadFailed || isCompressing} onClick={() => handlePostStatus('Ready for dispatch')} variant="outline" className="min-h-[56px] text-base justify-start px-6 bg-slate-800 border-slate-700 text-white">
              Ready for dispatch
            </Button>
          </div>
        </div>
      </section>

      {allUpdates.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider px-1">
            {messages.workshop.recentUpdates}
          </h2>
          <div className="space-y-3">
            {allUpdates.map((update) => (
              <div key={update.id} className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex space-x-4">
                <div className="shrink-0 mt-1">
                  {update.photoUrl ? (
                    <div className="w-12 h-12 bg-slate-700 rounded-lg overflow-hidden border border-slate-600">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={update.photoUrl} alt="Update" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-slate-700/50 rounded-lg flex items-center justify-center border border-slate-700">
                      <ImageIcon className="w-5 h-5 text-slate-500" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-200">{update.status}</h3>
                  <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
                    <span>{new Date(update.updatedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                    <span>•</span>
                    <span>{update.updatedBy}</span>
                  </div>
                  {update.message && <p className="text-sm text-slate-300 mt-2">{update.message}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {isDelivered && (
        <section className="space-y-3 pb-8">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider px-1">
            {messages.workshop.paymentStatus}
          </h2>
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Receipt className="w-6 h-6 text-slate-400" />
                <span className="font-semibold text-slate-200">{messages.workshop.currentStatus}</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                paymentStatus === 'Paid' ? 'bg-emerald-500/20 text-emerald-400' :
                paymentStatus === 'Ready' ? 'bg-blue-500/20 text-blue-400' :
                paymentStatus === 'On hold for quality' ? 'bg-red-500/20 text-red-400' :
                paymentStatus === 'Awaiting approval' ? 'bg-amber-500/20 text-amber-400' :
                'bg-slate-700 text-slate-300'
              }`}>
                {paymentStatus}
              </span>
            </div>

            {paymentStatus === 'On hold for quality' && (
              <div className="text-sm text-red-400/90 bg-red-500/10 p-3 rounded-xl">
                {messages.workshop.onHoldReason}
              </div>
            )}

            {!activeInvoice && (
              <div className="pt-3 border-t border-slate-700/50 space-y-3">
                <p className="text-sm text-slate-300">{messages.workshop.uploadInvoiceMsg}</p>
                <div className="flex items-center space-x-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                    <input
                      type="number"
                      value={invoiceAmount}
                      onChange={(e) => setInvoiceAmount(e.target.value)}
                      placeholder={messages.workshop.amountPlaceholder}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-8 pr-4 text-white focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    className="hidden"
                    ref={invoiceInputRef}
                    onChange={handleInvoiceUpload}
                  />
                  <Button
                    onClick={() => invoiceInputRef.current?.click()}
                    disabled={!invoiceAmount}
                    className="min-h-[48px] bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    {messages.workshop.uploadBtn}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
