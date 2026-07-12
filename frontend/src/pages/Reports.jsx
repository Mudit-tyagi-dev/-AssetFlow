export default function Reports() {
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-heading text-on-surface tracking-tight">Reports & Analytics</h2>
          <p className="text-sm text-on-surface-variant mt-1">Enterprise-wide asset performance and allocation metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface-variant">Department</label>
            <select className="bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm min-w-[160px] focus:ring-primary focus:outline-none focus:ring-2">
              <option>All Departments</option>
              <option>Operations</option>
              <option>Engineering</option>
              <option>Marketing</option>
              <option>Finance</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface-variant">Date Range</label>
            <button className="flex items-center gap-2 bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm min-w-[200px] hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined text-[18px]">calendar_today</span>
              <span>Oct 1 - Oct 31, 2023</span>
            </button>
          </div>
          <div className="mt-auto h-[42px] flex">
            <button className="bg-primary text-on-primary px-4 rounded-lg flex items-center gap-2 text-sm font-semibold hover:opacity-90 transition-opacity">
              <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
              PDF Report
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 hover:shadow-sm transition-all group">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-on-surface-variant">Total Assets</span>
            <span className="p-1.5 bg-primary-container/20 text-primary rounded-lg">
              <span className="material-symbols-outlined text-[20px]">inventory</span>
            </span>
          </div>
          <h3 className="text-2xl font-bold font-heading">12,482</h3>
          <div className="mt-2 flex items-center gap-1">
            <span className="text-secondary text-xs flex items-center font-bold">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> +4.2%
            </span>
            <span className="text-on-surface-variant text-xs">vs last month</span>
          </div>
        </div>
        
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 hover:shadow-sm transition-all group">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-on-surface-variant">Active Allocation</span>
            <span className="p-1.5 bg-secondary-container/20 text-secondary rounded-lg">
              <span className="material-symbols-outlined text-[20px]">assignment_turned_in</span>
            </span>
          </div>
          <h3 className="text-2xl font-bold font-heading">94.8%</h3>
          <div className="mt-2 flex items-center gap-1">
            <span className="text-secondary text-xs flex items-center font-bold">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> +1.1%
            </span>
            <span className="text-on-surface-variant text-xs">resource efficiency</span>
          </div>
        </div>
        
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 hover:shadow-sm transition-all group">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-on-surface-variant">Pending Maintenance</span>
            <span className="p-1.5 bg-tertiary-container/20 text-tertiary rounded-lg">
              <span className="material-symbols-outlined text-[20px]">build_circle</span>
            </span>
          </div>
          <h3 className="text-2xl font-bold font-heading">42</h3>
          <div className="mt-2 flex items-center gap-1">
            <span className="text-error text-xs flex items-center font-bold">
              <span className="material-symbols-outlined text-[14px]">priority_high</span> Critical
            </span>
            <span className="text-on-surface-variant text-xs">needs immediate action</span>
          </div>
        </div>
        
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 hover:shadow-sm transition-all group">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-on-surface-variant">Asset Valuation</span>
            <span className="p-1.5 bg-surface-variant text-on-surface-variant rounded-lg">
              <span className="material-symbols-outlined text-[20px]">payments</span>
            </span>
          </div>
          <h3 className="text-2xl font-bold font-heading">$2.4M</h3>
          <div className="mt-2 flex items-center gap-1">
            <span className="text-on-surface-variant text-xs font-bold">
              Current total value
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 hover:shadow-sm transition-all flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold font-heading">Asset Lifecycle Cost</h3>
              <p className="text-xs text-on-surface-variant">Acquisition vs Maintenance over time</p>
            </div>
            <button className="text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>
          <div className="flex-1 w-full bg-surface rounded-lg border border-dashed border-outline-variant flex items-center justify-center">
            <div className="text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[48px] text-outline-variant mb-2">bar_chart</span>
              <p className="text-sm">Cost Analysis Chart rendering...</p>
            </div>
          </div>
        </div>
        
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 hover:shadow-sm transition-all flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold font-heading">Department Distribution</h3>
              <p className="text-xs text-on-surface-variant">Total assets allocated per unit</p>
            </div>
            <button className="text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>
          <div className="flex-1 w-full bg-surface rounded-lg border border-dashed border-outline-variant flex items-center justify-center">
            <div className="text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[48px] text-outline-variant mb-2">pie_chart</span>
              <p className="text-sm">Distribution Chart rendering...</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden hover:shadow-sm transition-all">
        <div className="p-5 border-b border-outline-variant flex justify-between items-center">
          <h3 className="text-lg font-semibold font-heading">Custom Report Generator</h3>
          <button className="text-sm font-semibold text-primary hover:text-primary-fixed-dim transition-colors flex items-center gap-1">
            View All Reports <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
        <div className="p-5 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-secondary text-xs uppercase tracking-wider text-on-surface-variant border-b border-outline-variant">
                <th className="px-4 py-3 font-semibold rounded-tl-lg">Report Name</th>
                <th className="px-4 py-3 font-semibold">Generated By</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Format</th>
                <th className="px-4 py-3 font-semibold rounded-tr-lg text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant text-sm">
              <tr className="hover:bg-surface-container transition-colors group cursor-pointer">
                <td className="px-4 py-4 font-medium text-on-surface flex items-center gap-3">
                  <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">insert_chart</span>
                  Q3 Hardware Depreciation
                </td>
                <td className="px-4 py-4 text-on-surface-variant flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-[10px] font-bold">AS</div>
                  <span>Alice Smith</span>
                </td>
                <td className="px-4 py-4 text-on-surface-variant">Oct 15, 2023</td>
                <td className="px-4 py-4">
                  <span className="px-2 py-1 rounded bg-surface-container-high text-xs font-semibold text-on-surface-variant">CSV</span>
                </td>
                <td className="px-4 py-4 text-right">
                  <button className="text-primary hover:text-primary-fixed-dim transition-colors p-1" title="Download">
                    <span className="material-symbols-outlined text-[20px]">download</span>
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-surface-container transition-colors group cursor-pointer">
                <td className="px-4 py-4 font-medium text-on-surface flex items-center gap-3">
                  <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">description</span>
                  Annual Software License Audit
                </td>
                <td className="px-4 py-4 text-on-surface-variant flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center text-[10px] font-bold">MJ</div>
                  <span>Mark Johnson</span>
                </td>
                <td className="px-4 py-4 text-on-surface-variant">Oct 10, 2023</td>
                <td className="px-4 py-4">
                  <span className="px-2 py-1 rounded bg-surface-container-high text-xs font-semibold text-on-surface-variant">PDF</span>
                </td>
                <td className="px-4 py-4 text-right">
                  <button className="text-primary hover:text-primary-fixed-dim transition-colors p-1" title="Download">
                    <span className="material-symbols-outlined text-[20px]">download</span>
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-surface-container transition-colors group cursor-pointer">
                <td className="px-4 py-4 font-medium text-on-surface flex items-center gap-3">
                  <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">analytics</span>
                  Vehicle Fleet Usage YTD
                </td>
                <td className="px-4 py-4 text-on-surface-variant flex items-center gap-2">
                  <img className="w-6 h-6 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMViWAkHZXuSeJSnnyPFm09xGG6lQ7V_7haY7ffOVJRI8_oWIiZKlDWd_fZgnzVzNnBIc1CXxEAclSHKAlHOX79Vg979XQqtT82BgP9y2hSJAUKWT_jXzmr_cwVoXFhTh4iRa0Q9CJyzkjNkR20a_Zc3Rl1dFzA2axYazfqX05OFNgcVWM2lBjmy4PJ33IDafWTqiCfLRaht11NcqXSTDHA_4o3X8RlS0v-m3OtU-PSZ0tEFqU3ft4lQ" alt="User"/>
                  <span>Alex Henderson</span>
                </td>
                <td className="px-4 py-4 text-on-surface-variant">Sep 30, 2023</td>
                <td className="px-4 py-4">
                  <span className="px-2 py-1 rounded bg-surface-container-high text-xs font-semibold text-on-surface-variant">XLSX</span>
                </td>
                <td className="px-4 py-4 text-right">
                  <button className="text-primary hover:text-primary-fixed-dim transition-colors p-1" title="Download">
                    <span className="material-symbols-outlined text-[20px]">download</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
