import { useParams } from 'react-router-dom';
import { Laptop, Info, Wrench, Shield, CheckCircle2 } from 'lucide-react';

export default function AssetDetails() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-surface-container rounded-xl flex items-center justify-center text-primary">
            <Laptop className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-on-surface">MacBook Pro 16"</h1>
            <div className="text-on-surface-variant text-sm mt-1 flex items-center gap-2">
              <span className="font-mono">AST-{id || '1042'}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-secondary font-medium">
                <CheckCircle2 className="w-4 h-4" /> Active
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-outline-variant rounded-lg font-medium text-sm hover:bg-surface-container transition-colors">Edit Asset</button>
          <button className="px-4 py-2 bg-primary-container text-on-primary-container rounded-lg font-medium text-sm hover:bg-primary transition-colors">Assign User</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-heading font-semibold flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" /> Specifications
          </h2>
          <div className="grid grid-cols-2 gap-y-4 text-sm">
            <div><span className="text-on-surface-variant block mb-1">Manufacturer</span><span className="font-medium">Apple Inc.</span></div>
            <div><span className="text-on-surface-variant block mb-1">Model</span><span className="font-medium">M2 Max, 2023</span></div>
            <div><span className="text-on-surface-variant block mb-1">Serial Number</span><span className="font-medium font-mono">C02XH492MD6R</span></div>
            <div><span className="text-on-surface-variant block mb-1">Purchase Date</span><span className="font-medium">Oct 12, 2023</span></div>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-heading font-semibold flex items-center gap-2">
            <Wrench className="w-5 h-5 text-secondary" /> Maintenance
          </h2>
          <div className="space-y-4 text-sm">
            <div className="p-3 bg-surface rounded-lg border border-outline-variant">
              <div className="font-medium text-on-surface">Battery Replacement</div>
              <div className="text-on-surface-variant text-xs mt-1">Scheduled: Dec 15, 2025</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
