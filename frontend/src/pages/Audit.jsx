export default function Audit() {
  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold font-heading text-on-background tracking-tight">Annual Asset Audit</h2>
          <p className="text-sm font-sans text-on-surface-variant">Q4 Physical Verification - North Region Logistics Center</p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-2 bg-surface border border-outline text-on-surface text-sm font-semibold rounded-xl hover:bg-surface-container-high transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">download</span>
            Export Report
          </button>
          <button className="px-6 py-2 bg-primary text-on-primary text-sm font-semibold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">save</span>
            Submit Audit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant space-y-4 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-primary-container text-on-primary-container rounded-lg">
              <span className="material-symbols-outlined">inventory</span>
            </div>
            <span className="text-xs font-semibold text-on-surface-variant">Progress</span>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold font-heading">65.2%</span>
              <span className="text-xs text-on-surface-variant">verified</span>
            </div>
            <div className="w-full bg-surface-container-highest h-2 rounded-full mt-2 overflow-hidden">
              <div className="bg-primary h-full transition-all duration-1000" style={{ width: '65.2%' }}></div>
            </div>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant space-y-4">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-secondary-container text-on-secondary-container rounded-lg">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
            <span className="text-xs font-semibold text-on-surface-variant">Verified</span>
          </div>
          <div>
            <span className="text-3xl font-bold font-heading">842</span>
            <p className="text-xs text-secondary font-semibold">↑ 12 since last sync</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant space-y-4">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-error-container text-on-error-container rounded-lg">
              <span className="material-symbols-outlined">error_outline</span>
            </div>
            <span className="text-xs font-semibold text-on-surface-variant">Missing</span>
          </div>
          <div>
            <span className="text-3xl font-bold font-heading">18</span>
            <p className="text-xs text-error font-semibold">Requires Immediate Action</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant space-y-4">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-tertiary-fixed text-on-tertiary-fixed rounded-lg">
              <span className="material-symbols-outlined">report_problem</span>
            </div>
            <span className="text-xs font-semibold text-on-surface-variant">Damaged</span>
          </div>
          <div>
            <span className="text-3xl font-bold font-heading">34</span>
            <p className="text-xs text-tertiary font-semibold">Maintenance tickets auto-generated</p>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm">
        <div className="p-4 border-b border-outline-variant flex flex-wrap gap-4 items-center justify-between bg-surface-container-lowest">
          <div className="flex gap-2">
            <button className="px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface text-sm font-semibold hover:bg-surface-variant transition-colors">All Assets (1290)</button>
            <button className="px-3 py-1.5 rounded-lg text-on-surface-variant text-sm font-semibold hover:bg-surface-container-high transition-colors">Pending (448)</button>
            <button className="px-3 py-1.5 rounded-lg text-on-surface-variant text-sm font-semibold hover:bg-surface-container-high transition-colors">Flagged (52)</button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-on-surface-variant">Filter by:</span>
            <select className="bg-surface border-outline-variant rounded-lg text-sm py-1 px-3 focus:ring-primary focus:outline-none">
              <option>Main Warehouse</option>
              <option>IT Lab 1</option>
              <option>Loading Dock B</option>
            </select>
            <div className="h-6 w-px bg-outline-variant"></div>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-high">
              <span className="material-symbols-outlined text-[20px]">filter_list</span>
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-container text-on-surface font-semibold text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Asset Details</th>
                <th className="px-6 py-4 font-semibold">Asset ID</th>
                <th className="px-6 py-4 font-semibold">Expected Location</th>
                <th className="px-6 py-4 font-semibold">Current Status</th>
                <th className="px-6 py-4 font-semibold text-center">Verification Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              <tr className="hover:bg-surface-container-low transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary">laptop_mac</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">MacBook Pro 16" M2</p>
                      <p className="text-xs text-on-surface-variant">High-Performance Workstation</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-mono text-sm text-on-surface-variant tracking-tight">ASSET-MBP-99201</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-sm">
                    <span className="material-symbols-outlined text-[18px] text-on-surface-variant">location_on</span>
                    IT-LAB-01 / Rack 4
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[11px] font-bold uppercase">Verified</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    <button className="p-2 rounded-lg bg-secondary text-white hover:opacity-90 transition-opacity" title="Verified">
                      <span className="material-symbols-outlined text-[20px]">check</span>
                    </button>
                    <button className="p-2 rounded-lg bg-surface-container-high text-on-surface-variant hover:bg-error-container hover:text-error transition-all" title="Missing">
                      <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                    <button className="p-2 rounded-lg bg-surface-container-high text-on-surface-variant hover:bg-tertiary-fixed hover:text-tertiary transition-all" title="Damaged">
                      <span className="material-symbols-outlined text-[20px]">heart_broken</span>
                    </button>
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-surface-container-low transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary">print</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Industrial Label Printer</p>
                      <p className="text-xs text-on-surface-variant">Zebra ZT411 Series</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-mono text-sm text-on-surface-variant">ASSET-PRN-44821</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-sm">
                    <span className="material-symbols-outlined text-[18px] text-on-surface-variant">location_on</span>
                    SHIPPING-DOCK-B
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-surface-container-highest text-on-surface-variant rounded-full text-[11px] font-bold uppercase">Pending Review</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    <button className="p-2 rounded-lg bg-surface-container-high text-on-surface-variant hover:bg-secondary-container hover:text-secondary transition-all">
                      <span className="material-symbols-outlined text-[20px]">check</span>
                    </button>
                    <button className="p-2 rounded-lg bg-surface-container-high text-on-surface-variant hover:bg-error-container hover:text-error transition-all">
                      <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                    <button className="p-2 rounded-lg bg-surface-container-high text-on-surface-variant hover:bg-tertiary-fixed hover:text-tertiary transition-all">
                      <span className="material-symbols-outlined text-[20px]">heart_broken</span>
                    </button>
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-surface-container-low transition-colors bg-tertiary-fixed/5">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-tertiary-fixed/30 flex items-center justify-center">
                      <span className="material-symbols-outlined text-tertiary">forklift</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Electric Forklift L12</p>
                      <p className="text-xs text-on-surface-variant">Toyota High-Reach</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-mono text-sm text-on-surface-variant">ASSET-FL-00122</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-sm">
                    <span className="material-symbols-outlined text-[18px] text-on-surface-variant">location_on</span>
                    MAIN-WH / BAY 12
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-tertiary-fixed text-on-tertiary-fixed rounded-full text-[11px] font-bold uppercase">Damaged</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    <button className="p-2 rounded-lg bg-surface-container-high text-on-surface-variant hover:bg-secondary-container transition-all">
                      <span className="material-symbols-outlined text-[20px]">check</span>
                    </button>
                    <button className="p-2 rounded-lg bg-surface-container-high text-on-surface-variant hover:bg-error-container transition-all">
                      <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                    <button className="p-2 rounded-lg bg-tertiary text-white shadow-md">
                      <span className="material-symbols-outlined text-[20px]">heart_broken</span>
                    </button>
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-surface-container-low transition-colors bg-error-container/5">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-error-container/30 flex items-center justify-center">
                      <span className="material-symbols-outlined text-error">tablet_android</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">iPad Air Gen 5</p>
                      <p className="text-xs text-on-surface-variant">Inventory Scanner Device</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-mono text-sm text-on-surface-variant">ASSET-TAB-88112</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-sm">
                    <span className="material-symbols-outlined text-[18px] text-on-surface-variant">location_on</span>
                    SECURE-STORAGE-A
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-error-container text-error rounded-full text-[11px] font-bold uppercase">Missing</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    <button className="p-2 rounded-lg bg-surface-container-high text-on-surface-variant hover:bg-secondary-container transition-all">
                      <span className="material-symbols-outlined text-[20px]">check</span>
                    </button>
                    <button className="p-2 rounded-lg bg-error text-white shadow-md">
                      <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                    <button className="p-2 rounded-lg bg-surface-container-high text-on-surface-variant hover:bg-tertiary-fixed transition-all">
                      <span className="material-symbols-outlined text-[20px]">heart_broken</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
