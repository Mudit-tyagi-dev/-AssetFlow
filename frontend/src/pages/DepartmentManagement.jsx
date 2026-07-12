import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import toast from 'react-hot-toast';

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Form fields state
  const [deptName, setDeptName] = useState('');
  const [parentDeptId, setParentDeptId] = useState('');
  const [deptHeadId, setDeptHeadId] = useState('');
  const [deptStatus, setDeptStatus] = useState('active');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [deptsRes, empsRes] = await Promise.all([
        apiClient.get('/org/departments'),
        apiClient.get('/org/employees?limit=1000')
      ]);
      setDepartments(deptsRes.data || []);
      setEmployees(empsRes.data?.items || []);
    } catch (err) {
      console.error('Failed to load department management resources:', err);
      toast.error('Failed to retrieve department listings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setDeptName('');
    setParentDeptId('');
    setDeptHeadId('');
    setDeptStatus('active');
    setSelectedDept(null);
    setIsEdit(false);
  };

  const handleEditClick = (dept) => {
    setSelectedDept(dept);
    setDeptName(dept.name || '');
    setParentDeptId(dept.parent_department_id || '');
    setDeptHeadId(dept.department_head_id || '');
    setDeptStatus(dept.status || 'active');
    setIsEdit(true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!deptName.trim()) {
      toast.error('Department name is required');
      return;
    }

    setFormSubmitting(true);
    try {
      if (isEdit && selectedDept) {
        const payload = {
          name: deptName.trim(),
          parent_department_id: parentDeptId || null,
          department_head_id: deptHeadId || null,
          status: deptStatus
        };
        await apiClient.put(`/org/departments/${selectedDept.id}`, payload);
        toast.success('Department updated successfully');
      } else {
        const payload = {
          name: deptName.trim(),
          parent_department_id: parentDeptId || null
        };
        await apiClient.post('/org/departments', payload);
        toast.success('Department created successfully');
      }
      setIsModalOpen(false);
      resetForm();
      loadData();
    } catch (err) {
      console.error('Failed to save department:', err);
      toast.error(err.response?.data?.detail || 'Failed to save department');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Helper: Get parent department name
  const getParentDeptName = (parentId) => {
    if (!parentId) return 'None';
    const parent = departments.find(d => d.id === parentId);
    return parent ? parent.name : 'Unknown';
  };

  // Helper: Get employee name
  const getEmployeeName = (empId) => {
    if (!empId) return 'Vacant';
    const emp = employees.find(e => e.id === empId);
    return emp ? emp.name : 'Unknown';
  };

  // Helper: Get employee initials
  const getEmployeeInitials = (empId) => {
    const name = getEmployeeName(empId);
    if (name === 'Vacant' || name === 'Unknown') return 'V';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // Icon selector based on name to match styling
  const getDeptIcon = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes('logistics') || lower.includes('operations') || lower.includes('ops')) {
      return { icon: 'engineering', bg: 'bg-primary-container/10', color: 'text-primary' };
    }
    if (lower.includes('finance') || lower.includes('billing') || lower.includes('account')) {
      return { icon: 'account_balance', bg: 'bg-tertiary-container/10', color: 'text-tertiary' };
    }
    if (lower.includes('lab') || lower.includes('research') || lower.includes('r&d') || lower.includes('science')) {
      return { icon: 'biotech', bg: 'bg-surface-variant', color: 'text-on-surface-variant' };
    }
    if (lower.includes('marketing') || lower.includes('sales') || lower.includes('pr')) {
      return { icon: 'campaign', bg: 'bg-primary-container/10', color: 'text-primary' };
    }
    if (lower.includes('cyber') || lower.includes('security') || lower.includes('it')) {
      return { icon: 'security', bg: 'bg-surface-variant', color: 'text-on-surface-variant' };
    }
    return { icon: 'corporate_fare', bg: 'bg-primary-container/10', color: 'text-primary' };
  };

  // Metrics calculators
  const totalDepts = departments.length;
  const activeDepts = departments.filter(d => d.status === 'active').length;
  const orgHealth = totalDepts > 0 ? ((activeDepts / totalDepts) * 100).toFixed(1) : '100';

  return (
    <>
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 animate-fade-in">
        <div>
          <h2 className="font-bold text-3xl font-heading text-on-background mb-1">Departments</h2>
          <p className="text-base text-on-surface-variant">Configure and monitor organizational hierarchies and leadership.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-6 h-12 bg-primary text-on-primary rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all text-sm font-semibold active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Add Department
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Total Departments</span>
            <span className="material-symbols-outlined text-primary">corporate_fare</span>
          </div>
          <div className="mt-4">
            <h3 className="font-bold text-3xl font-heading text-on-surface">{totalDepts}</h3>
            <p className="text-xs text-outline mt-1 font-semibold">Hierarchy structures</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Headcount</span>
            <span className="material-symbols-outlined text-primary">groups</span>
          </div>
          <div className="mt-4">
            <h3 className="font-bold text-3xl font-heading text-on-surface">{employees.length}</h3>
            <p className="text-xs text-on-surface-variant mt-1 font-semibold">Across all departments</p>
          </div>
        </div>
        <div className="bg-primary-container/10 border border-primary/20 rounded-xl p-5 relative overflow-hidden group shadow-sm">
          <div className="relative z-10">
            <span className="text-xs text-primary uppercase font-bold tracking-wider">Organization Health</span>
            <div className="flex items-end gap-4 mt-2">
              <h3 className="font-bold text-3xl font-heading text-primary">{orgHealth}%</h3>
              <div className="flex-1 h-2 bg-surface-container-highest rounded-full mb-3 overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${orgHealth}%` }}></div>
              </div>
            </div>
            <p className="text-xs text-on-surface-variant mt-2 max-w-xs font-medium">Percentage of active operational department structures.</p>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <span className="material-symbols-outlined text-[120px]">analytics</span>
          </div>
        </div>
      </div>

      {/* High-Density Data Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm min-h-[250px] relative animate-fade-in">
        {isLoading ? (
          <div className="absolute inset-0 bg-surface/50 flex flex-col items-center justify-center gap-3">
            <p className="text-sm font-semibold text-on-surface-variant">Loading department hierarchies...</p>
          </div>
        ) : departments.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center gap-4">
            <span className="material-symbols-outlined text-[48px] text-outline">corporate_fare</span>
            <div>
              <h3 className="font-bold text-lg text-on-surface">No Departments Found</h3>
              <p className="text-sm text-on-surface-variant mt-1">Configure your organization's structural tree nodes to start.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container text-on-surface-variant border-b border-outline-variant font-bold text-xs uppercase tracking-wider">
                  <th className="px-6 py-4">Department Name</th>
                  <th className="px-6 py-4">Hierarchy / Parent</th>
                  <th className="px-6 py-4">Head of Department</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50 text-sm">
                {departments.map((dept) => {
                  const iconStyle = getDeptIcon(dept.name);
                  const parentName = getParentDeptName(dept.parent_department_id);
                  const headName = getEmployeeName(dept.department_head_id);
                  const initials = getEmployeeInitials(dept.department_head_id);

                  return (
                    <tr key={dept.id} className="hover:bg-surface-container-low transition-colors group align-middle">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg ${iconStyle.bg} ${iconStyle.color} flex items-center justify-center`}>
                            <span className="material-symbols-outlined text-[18px]">{iconStyle.icon}</span>
                          </div>
                          <div>
                            <p className="font-bold text-on-surface">{dept.name}</p>
                            <p className="text-[10px] font-mono text-outline font-semibold" title={dept.id}>
                              {dept.id.substring(0, 8)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-on-surface-variant font-semibold">
                          {dept.parent_department_id && (
                            <span className="material-symbols-outlined text-[16px] text-outline">subdirectory_arrow_right</span>
                          )}
                          <span className="px-2.5 py-1 bg-surface-container-high rounded text-xs text-on-surface font-semibold">
                            {parentName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold overflow-hidden flex items-center justify-center">
                            {initials}
                          </div>
                          <span className="font-semibold text-on-surface-variant">{headName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {dept.status === 'active' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-secondary-container/20 text-secondary border border-secondary/20">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-error-container/20 text-error border border-error/20">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleEditClick(dept)}
                          className="p-2 hover:bg-surface-container-highest rounded-lg transition-colors text-on-surface-variant hover:text-primary cursor-pointer inline-flex"
                          title="Edit Department"
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DEPARTMENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden mx-4 animate-fade-in font-sans">
            <div className="px-6 py-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <div>
                <h3 className="font-bold text-xl font-heading text-on-surface">
                  {isEdit ? 'Edit Department' : 'Add Department'}
                </h3>
                <p className="text-sm font-medium text-on-surface-variant mt-1">Configure properties for organization hierarchy branch node.</p>
              </div>
              <button 
                className="p-2 hover:bg-surface-variant rounded-full transition-colors cursor-pointer" 
                onClick={() => { resetForm(); setIsModalOpen(false); }}
              >
                <span className="material-symbols-outlined text-on-surface">close</span>
              </button>
            </div>
            
            <form className="p-6 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">Department Name *</label>
                <input 
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium text-on-surface" 
                  placeholder="e.g. Finance, North R&D Lab" 
                  type="text"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">Parent Department</label>
                <select 
                  value={parentDeptId}
                  onChange={(e) => setParentDeptId(e.target.value)}
                  className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium text-on-surface bg-surface"
                >
                  <option value="">None (Top-Level Headquarters)</option>
                  {departments
                    .filter(d => !isEdit || d.id !== selectedDept?.id) // Prevent circular reference
                    .map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                </select>
              </div>

              {isEdit && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-2">Department Head</label>
                    <select 
                      value={deptHeadId}
                      onChange={(e) => setDeptHeadId(e.target.value)}
                      className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium text-on-surface bg-surface"
                    >
                      <option value="">Vacant</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name} ({emp.email})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-2">Status</label>
                    <select 
                      value={deptStatus}
                      onChange={(e) => setDeptStatus(e.target.value)}
                      className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium text-on-surface bg-surface"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-6 border-t border-outline-variant">
                <button 
                  type="button" 
                  className="flex-1 px-4 py-3 border border-outline-variant rounded-xl font-semibold text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                  onClick={() => { resetForm(); setIsModalOpen(false); }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={formSubmitting}
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 cursor-pointer disabled:opacity-50"
                >
                  {formSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
