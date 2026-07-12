export default function DepartmentManagement() {
  const departments = [
    {
      id: 'DEP-001',
      name: 'Operations & Logistics',
      icon: 'engineering',
      parent: 'Corporate Office',
      head: 'Alex Rivera',
      headImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4lPw5poFempCSNJRAWJXf89pkVSfj_5QuUo4GLVxWYGFjcm4n1i1pOIIExWhuQ9ihTgahl_aq2ktCNJUY83gyWvQWwmqcjdIwAB_CfQ6aLMrOuD4ugnbEpum9DkTjsc_ugXxzyTWOAiVyN5wfEMi46l0QSBJsajE3rkkuOy4kq3YoNC4DjtLWSq6gIKTgoVMakR9EgBTLlCW6jgJDd6bL6vO32_QJcm_j5HSRb0mXrrhZ41m-0-ApPA',
      status: 'Active',
      iconBg: 'bg-primary-container/10',
      iconColor: 'text-primary'
    },
    {
      id: 'DEP-042',
      name: 'Financial Services',
      icon: 'account_balance',
      parent: 'Executive Board',
      head: 'Sarah Jenkins',
      headImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAO3aDW5P_d-jZ44pYfSrYxO2cqHicm7KkSllc86S0xmpotWLPbUyFwpuTgu41_wQNM3BngsxFD9uOo_a1FVfBUMso4ZtEeaPYcuoSKGfgJvXbDW0QZtUAM3IpjZS7YM9jmvGwjFELPqX7FbjjfbIVU6UFhmfSUTXg37CRTRe2s298yiimpdihCE8AvvVXo0MQ0DjFVUNJuovDMktVPzbxsnXB89OxbDj_UfKjm88D5HsWQUOylfLtIXg',
      status: 'Active',
      iconBg: 'bg-tertiary-container/10',
      iconColor: 'text-tertiary'
    },
    {
      id: 'DEP-089',
      name: 'R&D North Lab',
      icon: 'biotech',
      parent: 'Engineering Hub',
      head: 'Thomas J.',
      headInitials: 'TJ',
      isSub: true,
      status: 'On Leave',
      iconBg: 'bg-surface-variant',
      iconColor: 'text-on-surface-variant'
    },
    {
      id: 'DEP-112',
      name: 'Marketing & PR',
      icon: 'campaign',
      parent: 'Commercial Dept',
      head: 'Elena Zhao',
      headImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzhBb6hqNmrTTjmEjdzfQ5fQO3hO29-8gSOEK92INyVmWZNKfe7quR4BC-LzPypJFy1CNGYjMy34yjsaLlSCasdpyB_KqqODIKqiKiAE09_FSZpRIK36H05WCMVUE4hdbG0O0AMj74Ffs8iQwbIIy03KSJRtOf3kTf0MWT9CIO133jM32JJftHxmHghBx3fHNxQpLO2Rid-RuNOE740cF0KJ8jrVYHUG0KP-ovqOnYupXeoy4dhLGYjQ',
      status: 'Active',
      iconBg: 'bg-primary-container/10',
      iconColor: 'text-primary'
    },
    {
      id: 'DEP-033',
      name: 'Cybersecurity',
      icon: 'security',
      parent: 'IT Infrastructure',
      head: 'Michael C.',
      headInitials: 'MC',
      status: 'Active',
      iconBg: 'bg-surface-variant',
      iconColor: 'text-on-surface-variant'
    }
  ];

  return (
    <>
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="font-bold text-3xl font-heading text-on-background mb-1">Departments</h2>
          <p className="text-base text-on-surface-variant">Configure and monitor organizational hierarchies and leadership.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 h-10 border border-outline-variant rounded-xl hover:bg-surface-container-high transition-colors text-sm font-semibold text-on-surface">
            <span className="material-symbols-outlined text-[20px]">filter_list</span>
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 h-10 bg-primary text-on-primary rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all text-sm font-semibold active:scale-95">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Add Department
          </button>
        </div>
      </div>

      {/* Stats Overview (Asymmetric Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-surface border border-outline-variant rounded-xl p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-on-surface-variant uppercase">Total Departments</span>
            <span className="material-symbols-outlined text-primary">corporate_fare</span>
          </div>
          <div className="mt-4">
            <h3 className="font-bold text-3xl font-heading text-on-surface">14</h3>
            <p className="text-xs text-secondary flex items-center gap-1 mt-1 font-semibold">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              +2 this quarter
            </p>
          </div>
        </div>
        <div className="bg-surface border border-outline-variant rounded-xl p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-on-surface-variant uppercase">Headcount</span>
            <span className="material-symbols-outlined text-primary">groups</span>
          </div>
          <div className="mt-4">
            <h3 className="font-bold text-3xl font-heading text-on-surface">1,284</h3>
            <p className="text-xs text-on-surface-variant mt-1 font-semibold">Across all regions</p>
          </div>
        </div>
        <div className="md:col-span-2 bg-primary-container/10 border border-primary/20 rounded-xl p-4 relative overflow-hidden group">
          <div className="relative z-10">
            <span className="text-xs text-primary uppercase font-bold">Organization Health</span>
            <div className="flex items-end gap-4 mt-2">
              <h3 className="font-bold text-3xl font-heading text-primary">98.2%</h3>
              <div className="flex-1 h-2 bg-surface-container-highest rounded-full mb-3 overflow-hidden">
                <div className="h-full bg-primary w-[98.2%] rounded-full"></div>
              </div>
            </div>
            <p className="text-xs text-on-surface-variant mt-2 max-w-xs font-medium">All key departments are currently staffed with active leadership roles assigned.</p>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <span className="material-symbols-outlined text-[120px]">analytics</span>
          </div>
        </div>
      </div>

      {/* High-Density Data Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container text-on-surface-variant border-b border-outline-variant">
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Department Name</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Hierarchy / Parent</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Head of Department</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50">
              {departments.map((dept) => (
                <tr key={dept.id} className="hover:bg-surface-container-low transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${dept.iconBg} ${dept.iconColor} flex items-center justify-center`}>
                        <span className="material-symbols-outlined text-[18px]">{dept.icon}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-on-surface">{dept.name}</p>
                        <p className="text-xs text-on-surface-variant">{dept.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      {dept.isSub && <span className="material-symbols-outlined text-[16px]">subdirectory_arrow_right</span>}
                      <span className="px-2 py-1 bg-surface-container-high rounded text-xs text-on-surface font-semibold">{dept.parent}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full bg-surface-dim overflow-hidden flex items-center justify-center ${!dept.headImage ? 'bg-primary/10 text-primary text-[10px] font-bold' : ''}`}>
                        {dept.headImage ? (
                          <img className="w-full h-full object-cover" src={dept.headImage} alt={dept.head} />
                        ) : (
                          dept.headInitials
                        )}
                      </div>
                      <span className="text-sm text-on-surface font-medium">{dept.head}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {dept.status === 'Active' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-secondary-container/20 text-secondary border border-secondary-container">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-error-container/20 text-error border border-error-container">
                        On Leave
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-surface-container-highest rounded-lg transition-colors text-on-surface-variant">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
