export default function EmployeeDirectory() {
  const employees = [
    {
      id: 1,
      name: 'Alex Thompson',
      email: 'alex.t@assetflow.com',
      department: 'Product & Design',
      role: 'Senior UX Architect',
      status: 'Active',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDw8GuZIxxfHKxfvOCi7MHtEQQvw-wgceeexyt4kA5ICkMPK7y6uE5tM99vmRIKVj1wOc9MQWr-omiTrdHr8l4zwM47P2XnLs6LrYox0lAKFjt11Ypfb-jTrXGwVo-g3FavzTjDpwkHlv-2y1VxhOpni8UyeFBZnkwv6IHpvYyQBHmb-vWu7GvYYnN6gLFqY5qqjcRDS1B_sbLOgLX1M_9hX2dI83X9OddZxHmrj52duKZExGajrR-OLg'
    },
    {
      id: 2,
      name: 'Marcus Chen',
      email: 'm.chen@assetflow.com',
      department: 'Engineering',
      role: 'Full Stack Developer',
      status: 'Active',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAOsBCOqkynlwQBexbRHFPwawt6855X1q0yKYh9kJgMqhMa2P6Domcy9eai1HlFCgQCox8dBkcoDH9MoGo-OjtlgPUFF8FtiNzIEO7Pu21s2oSN02m58GnKm-48Va5s3qk6jnNA9QdQedNJdJSNWtQTeVVtK764vbz9gF4h-oru4qcb-LPlBxzBld7rayj2GE-EVnfTQ0tfzEyEpSRGITtuPfWd6tRAIPWur6NFsYt535FvbAx7yETJuA'
    },
    {
      id: 3,
      name: 'Sarah Jenkins',
      email: 's.jenkins@assetflow.com',
      department: 'Operations',
      role: 'Fleet Manager',
      status: 'On Leave',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwuwplqMaPZaGD8ZwPLOlxfgsE0HwgJ3aTmmEO4EhJb3kZMa8yto1G6sVIIPEIw0iHLzcS3YRzMQosAWgg5fHJJFNZ9nt9vxedyyNTcovzZnDLC7Fs6nuOzUXKy_7YPdVPrxf3fFuyRMLox6d7XaN7Tfy7R-h6hm9aU1PtywqhE8_50SKrI9-Ccxsegir5m5GkxuPKXLmfwN6YEYnofRYWDJ620dprMS6YkEauvF92-ypzV9npL924rA'
    },
    {
      id: 4,
      name: 'Daniel Ortega',
      email: 'd.ortega@assetflow.com',
      department: 'Finance',
      role: 'Asset Auditor',
      status: 'Active',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGm1E2jDXNyYYUpAzS1lBMO7jj-fVyMjtrsGBtF7gY8SGNzzPFQc_VOYhewmlH9n2V9wSkwgfXkHjhlVpA10hB9eskl2CN-DYqsh9ubM_RT_HLREvZ0NLTGqjyqMO6Q0CGzRCQc26suhs0CnTsIlmqke6hPZ07WHatuwS35HOZimddMOsGIsYc4jmYWCSRuJhkasP5AEIsR4pY0B_j5Z__9ZKsoLM7dcrLbvOLEbWvKDrV8_yhizvXLg'
    },
    {
      id: 5,
      name: 'Yuki Sato',
      email: 'y.sato@assetflow.com',
      department: 'Engineering',
      role: 'Data Scientist',
      status: 'Offline',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkjlOsduxFBwtqId4_47kSDYsUq97rBBuw3Uk9ljF04nMQLIJaGL-6L5IN5gQmErNLlfjg7e13tPsZvXK7UNMbs0aId2eVsgEFfU92gpeJAzlBv2sygaoM3eZc6isrMUxqxAigEbmMaH_ZvTWoolx1N9I9cW2K49v8LO2TIKWiKB3YNWZ2HDdfWSmJfrEqwoBUX3W61xMbKevuy2R2RNHIDQpQflDYxi8kEusv6gNvCaBpM-mO8Xi0mA'
    }
  ];

  return (
    <>
      {/* Header & Statistics */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h2 className="font-bold text-3xl font-heading text-on-background">Employee Directory</h2>
          <p className="text-base text-on-surface-variant">Manage your organization's talent and department roles.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant bg-surface-container-lowest text-on-surface rounded-xl text-sm font-semibold hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined">filter_list</span>
            <span>Filters</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant bg-surface-container-lowest text-on-surface rounded-xl text-sm font-semibold hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined">file_download</span>
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl">
          <p className="text-xs font-semibold text-on-surface-variant uppercase">Total Employees</p>
          <div className="flex items-end gap-2 mt-1">
            <span className="font-bold text-3xl font-heading">1,284</span>
            <span className="text-secondary text-xs font-semibold flex items-center mb-1">
              <span className="material-symbols-outlined text-xs mr-0.5">trending_up</span> 4%
            </span>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl">
          <p className="text-xs font-semibold text-on-surface-variant uppercase">Active Now</p>
          <div className="flex items-end gap-2 mt-1">
            <span className="font-bold text-3xl font-heading">842</span>
            <div className="w-16 h-4 bg-secondary-container/20 rounded-full overflow-hidden flex items-center mb-2 px-1">
              <div className="bg-secondary h-1 rounded-full w-[80%]"></div>
            </div>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl">
          <p className="text-xs font-semibold text-on-surface-variant uppercase">Departments</p>
          <div className="flex items-end gap-2 mt-1">
            <span className="font-bold text-3xl font-heading">12</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl">
          <p className="text-xs font-semibold text-on-surface-variant uppercase">Open Roles</p>
          <div className="flex items-end gap-2 mt-1">
            <span className="font-bold text-3xl font-heading">28</span>
            <span className="text-tertiary text-xs font-semibold mb-1">Alert</span>
          </div>
        </div>
      </div>

      {/* Directory Content */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container text-on-surface-variant font-semibold text-xs tracking-wider">
                <th className="px-6 py-4">EMPLOYEE</th>
                <th className="px-6 py-4">DEPARTMENT</th>
                <th className="px-6 py-4">ROLE</th>
                <th className="px-6 py-4">STATUS</th>
                <th className="px-6 py-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {employees.map(emp => (
                <tr key={emp.id} className="hover:bg-surface-container-low transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full bg-cover bg-center border border-outline-variant" 
                        style={{ backgroundImage: `url('${emp.image}')` }}
                      ></div>
                      <div>
                        <p className="font-semibold text-sm text-on-surface">{emp.name}</p>
                        <p className="text-xs text-on-surface-variant">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">{emp.department}</td>
                  <td className="px-6 py-4 text-sm font-medium text-on-surface">{emp.role}</td>
                  <td className="px-6 py-4">
                    {emp.status === 'Active' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-secondary-container/20 text-secondary border border-secondary/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary mr-1.5"></span>
                        Active
                      </span>
                    )}
                    {emp.status === 'On Leave' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-tertiary-fixed/30 text-tertiary border border-tertiary/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary mr-1.5"></span>
                        On Leave
                      </span>
                    )}
                    {emp.status === 'Offline' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-error-container/20 text-error border border-error/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-error mr-1.5"></span>
                        Offline
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary-container/10 rounded-lg transition-colors">Promote</button>
                      <button className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-lg transition-colors">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-outline-variant bg-surface-container-low">
          <p className="text-xs text-on-surface-variant">Showing 1 to 5 of 1,284 employees</p>
          <div className="flex items-center gap-2">
            <button className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed transition-colors" disabled>
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white font-semibold text-xs">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-high text-on-surface-variant font-semibold text-xs transition-colors">2</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-high text-on-surface-variant font-semibold text-xs transition-colors">3</button>
              <span className="mx-1 text-on-surface-variant">...</span>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-high text-on-surface-variant font-semibold text-xs transition-colors">257</button>
            </div>
            <button className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Quick Add Button */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all group z-50">
        <span className="material-symbols-outlined text-[28px] group-hover:rotate-90 transition-transform">add</span>
      </button>
    </>
  );
}
