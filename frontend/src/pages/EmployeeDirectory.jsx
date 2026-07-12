import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import toast from 'react-hot-toast';

export default function EmployeeDirectory() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [newRole, setNewRole] = useState('employee');
  const [newDepartmentId, setNewDepartmentId] = useState('');

  const fetchEmployees = async () => {
    try {
      const res = await apiClient.get('/org/employees?limit=100');
      setEmployees(res.data.items || []);
    } catch (err) {
      toast.error('Failed to load employees');
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await apiClient.get('/org/departments');
      setDepartments(res.data || []);
    } catch (err) {
      toast.error('Failed to load departments');
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([fetchEmployees(), fetchDepartments()]);
      setIsLoading(false);
    };
    init();
  }, []);

  const openPromoteModal = (emp) => {
    setSelectedEmp(emp);
    setNewRole(emp.role);
    setNewDepartmentId(emp.department_id || '');
    setIsPromoteModalOpen(true);
  };

  const closePromoteModal = () => {
    setIsPromoteModalOpen(false);
    setSelectedEmp(null);
  };

  const handlePromote = async (e) => {
    e.preventDefault();
    try {
      const payload = { role: newRole };
      if (newDepartmentId) {
        payload.department_id = newDepartmentId;
      } else {
        payload.department_id = null;
      }
      
      await apiClient.put(`/org/employees/${selectedEmp.id}`, payload);
      toast.success('Employee updated successfully');
      closePromoteModal();
      fetchEmployees();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update employee');
    }
  };

  const getDepartmentName = (deptId) => {
    if (!deptId) return 'Unassigned';
    const dept = departments.find(d => d.id === deptId);
    return dept ? dept.name : 'Unassigned';
  };

  const getRoleLabel = (roleStr) => {
    const mapping = {
      'admin': 'Admin',
      'asset_manager': 'Asset Manager',
      'department_head': 'Department Head',
      'employee': 'Employee'
    };
    return mapping[roleStr] || roleStr;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-on-surface-variant font-medium">Loading directory...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h2 className="font-bold text-3xl font-heading text-on-background">Employee Directory</h2>
          <p className="text-base text-on-surface-variant">Manage your organization's talent and department roles.</p>
        </div>
      </div>

      {/* Directory Content */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container text-on-surface-variant font-semibold text-xs tracking-wider">
                <th className="px-6 py-4">EMPLOYEE</th>
                <th className="px-6 py-4">DEPARTMENT</th>
                <th className="px-6 py-4">ROLE</th>
                <th className="px-6 py-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-on-surface-variant">No employees found.</td>
                </tr>
              ) : (
                employees.map(emp => (
                  <tr key={emp.id} className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-on-surface">{emp.name}</p>
                          <p className="text-xs text-on-surface-variant">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">
                      {getDepartmentName(emp.department_id)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${
                        emp.role === 'admin' ? 'bg-primary-container/20 text-primary border-primary/10' :
                        emp.role === 'asset_manager' ? 'bg-secondary-container/20 text-secondary border-secondary/10' :
                        emp.role === 'department_head' ? 'bg-tertiary-container/20 text-tertiary border-tertiary/10' :
                        'bg-surface-container-high text-on-surface-variant border-outline-variant'
                      }`}>
                        {getRoleLabel(emp.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => openPromoteModal(emp)}
                        className="px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary-container/20 rounded-lg transition-colors border border-transparent hover:border-primary/20"
                      >
                        Manage Role
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Promote / Manage Role Modal */}
      {isPromoteModalOpen && selectedEmp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center">
              <h3 className="font-bold text-xl text-on-surface">Manage Employee Role</h3>
              <button onClick={closePromoteModal} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handlePromote} className="p-6 space-y-5">
              <div>
                <p className="text-sm font-medium text-on-surface-variant mb-1">Employee</p>
                <p className="text-base font-semibold text-on-surface">{selectedEmp.name} ({selectedEmp.email})</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Role</label>
                <select 
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="employee">Employee</option>
                  <option value="department_head">Department Head</option>
                  <option value="asset_manager">Asset Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Assign to Department</label>
                <select 
                  value={newDepartmentId}
                  onChange={(e) => setNewDepartmentId(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="">-- No Department Assigned --</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                <p className="text-xs text-on-surface-variant mt-1">Required if setting role to Department Head.</p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={closePromoteModal}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
