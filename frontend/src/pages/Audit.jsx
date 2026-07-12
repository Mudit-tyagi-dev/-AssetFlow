import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  CheckCircle2, AlertCircle, XCircle, Loader2, Plus, Search, Filter, 
  ArrowLeft, Calendar, MapPin, User, AlertTriangle, ShieldAlert, Check, X
} from 'lucide-react';
import { AuditsService } from '../services/audits';
import { AssetsService } from '../services/assets';
import { apiClient } from '../api/client';
import toast from 'react-hot-toast';

export default function Audit() {
  const location = useLocation();

  // Primary data states
  const [cycles, setCycles] = useState([]);
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedCycle, setSelectedCycle] = useState(null);
  const [cycleItems, setCycleItems] = useState([]);

  // UI state managers
  const [isLoading, setIsLoading] = useState(true);
  const [isItemsLoading, setIsItemsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [itemStatusFilter, setItemStatusFilter] = useState('all'); // 'all' | 'pending' | 'verified' | 'missing' | 'damaged'

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [verifyStatus, setVerifyStatus] = useState('verified'); // 'verified' | 'missing' | 'damaged'
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Form states
  const [createFormData, setCreateFormData] = useState({
    scope_department_id: '',
    scope_location: '',
    date_range_start: '',
    date_range_end: '',
    auditor_ids: []
  });
  
  const [verifyNotes, setVerifyNotes] = useState('');

  // Determine user basePath (admin, manager)
  const getBasePath = () => {
    if (location.pathname.startsWith('/admin')) return '/admin';
    if (location.pathname.startsWith('/manager')) return '/manager';
    return '/admin';
  };
  const basePath = getBasePath();

  // Load baseline data on mount
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [cyclesData, assetsData, employeesData, deptsData] = await Promise.all([
        AuditsService.listCycles({ limit: 20 }),
        AssetsService.listAssets({ limit: 20 }),
        apiClient.get('/org/employees?limit=20'),
        apiClient.get('/org/departments')
      ]);

      setCycles(cyclesData.items || []);
      setAssets(assetsData.items || []);
      setEmployees(employeesData.data?.items || []);
      setDepartments(deptsData.data || []);
    } catch (err) {
      console.error('Failed to load audits metadata:', err);
      setError('Failed to load audit configurations. Please check your database connection.');
      toast.error('Error loading audits data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Fetch Items when selected cycle changes
  const loadCycleItems = async (cycleId) => {
    setIsItemsLoading(true);
    try {
      const itemsData = await AuditsService.listItems(cycleId, { limit: 20 });
      setCycleItems(itemsData.items || []);
    } catch (err) {
      console.error('Failed to load cycle items:', err);
      toast.error('Failed to retrieve items under this audit cycle');
    } finally {
      setIsItemsLoading(false);
    }
  };

  const handleSelectCycle = (cycle) => {
    setSelectedCycle(cycle);
    loadCycleItems(cycle.id);
    setCurrentPage(1);
    setItemStatusFilter('all');
    setSearchQuery('');
  };

  const handleBackToCycles = () => {
    setSelectedCycle(null);
    setCycleItems([]);
    loadData();
  };

  // Helper: Axios error parser
  const getErrorMessage = (error) => {
    if (error.response?.data?.detail) {
      if (typeof error.response.data.detail === 'string') {
        return error.response.data.detail;
      }
      if (Array.isArray(error.response.data.detail) && error.response.data.detail[0]?.msg) {
        return error.response.data.detail[0].msg;
      }
    }
    return error.message || 'An unexpected error occurred';
  };

  // Helper: Get Entity names
  const getAssetName = (assetId) => {
    const asset = assets.find(a => a.id === assetId);
    return asset ? asset.name : `Asset (${assetId.substring(0, 8)})`;
  };

  const getAssetTag = (assetId) => {
    const asset = assets.find(a => a.id === assetId);
    return asset ? (asset.asset_tag || asset.id.substring(0, 8)) : assetId.substring(0, 8);
  };

  const getAssetExpectedLocation = (assetId) => {
    const asset = assets.find(a => a.id === assetId);
    return asset ? (asset.location || 'Unassigned Location') : 'Unknown';
  };

  const getDepartmentName = (deptId) => {
    if (!deptId) return null;
    const dept = departments.find(d => d.id === deptId);
    return dept ? dept.name : null;
  };

  const getEmployeeName = (empId) => {
    const emp = employees.find(e => e.id === empId);
    return emp ? emp.name : `User (${empId.substring(0, 8)})`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Style helper status
  const getCycleStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'draft':
        return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
      case 'closed':
        return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      default:
        return 'bg-surface-container text-on-surface-variant border border-outline-variant';
    }
  };

  const getItemStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-surface-container-highest text-on-surface-variant border border-outline-variant';
      case 'verified':
        return 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20';
      case 'missing':
        return 'bg-error/10 text-error border border-error/20';
      case 'damaged':
        return 'bg-amber-500/10 text-amber-600 border border-amber-500/20';
      default:
        return 'bg-surface-container text-on-surface-variant';
    }
  };

  // Operations
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createFormData.date_range_start || !createFormData.date_range_end) {
      toast.error('Date ranges are required');
      return;
    }
    if (new Date(createFormData.date_range_end) < new Date(createFormData.date_range_start)) {
      toast.error('End date cannot be before start date');
      return;
    }

    setFormSubmitting(true);
    try {
      const payload = {
        scope_department_id: createFormData.scope_department_id || null,
        scope_location: createFormData.scope_location.trim() || null,
        date_range_start: createFormData.date_range_start,
        date_range_end: createFormData.date_range_end,
        auditor_ids: createFormData.auditor_ids
      };

      await AuditsService.createCycle(payload);
      toast.success('Audit cycle created successfully');
      setIsCreateOpen(false);
      // Reset form
      setCreateFormData({
        scope_department_id: '',
        scope_location: '',
        date_range_start: '',
        date_range_end: '',
        auditor_ids: []
      });
      loadData();
    } catch (err) {
      console.error('Failed to create audit cycle:', err);
      toast.error(getErrorMessage(err));
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleStartCycle = async (cycleId) => {
    try {
      await AuditsService.startCycle(cycleId);
      toast.success('Audit cycle started');
      loadData();
    } catch (err) {
      console.error('Failed to start cycle:', err);
      toast.error(getErrorMessage(err));
    }
  };

  const handleCloseCycle = async (cycleId) => {
    if (!window.confirm('Are you sure you want to CLOSE this cycle? This action is irreversible. Missing items will mark assets lost, and damaged items will raise maintenance logs.')) {
      return;
    }
    try {
      await AuditsService.closeCycle(cycleId);
      toast.success('Audit cycle closed successfully');
      loadData();
    } catch (err) {
      console.error('Failed to close cycle:', err);
      toast.error(getErrorMessage(err));
    }
  };

  const openVerifyModal = (item, status) => {
    setSelectedItem(item);
    setVerifyStatus(status);
    setVerifyNotes(item.notes || '');
    setIsVerifyOpen(true);
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const payload = {
        status: verifyStatus,
        notes: verifyNotes.trim() || null
      };

      await AuditsService.verifyItem(selectedCycle.id, selectedItem.id, payload);
      toast.success(`Asset marked ${verifyStatus}`);
      setIsVerifyOpen(false);
      loadCycleItems(selectedCycle.id);
    } catch (err) {
      console.error('Failed to verify item:', err);
      toast.error(getErrorMessage(err));
    } finally {
      setFormSubmitting(false);
    }
  };

  // Checklist handler
  const handleAuditorToggle = (employeeId) => {
    setCreateFormData(prev => {
      const alreadyChecked = prev.auditor_ids.includes(employeeId);
      return {
        ...prev,
        auditor_ids: alreadyChecked
          ? prev.auditor_ids.filter(id => id !== employeeId)
          : [...prev.auditor_ids, employeeId]
      };
    });
  };

  // Calculations for KPI Panel in Items view
  const getCycleProgressMetrics = () => {
    if (cycleItems.length === 0) return { total: 0, progress: '0%', verified: 0, missing: 0, damaged: 0, pending: 0 };
    const total = cycleItems.length;
    const verified = cycleItems.filter(i => i.status === 'verified').length;
    const missing = cycleItems.filter(i => i.status === 'missing').length;
    const damaged = cycleItems.filter(i => i.status === 'damaged').length;
    const pending = cycleItems.filter(i => i.status === 'pending').length;
    const processed = verified + missing + damaged;
    const progress = `${((processed / total) * 100).toFixed(1)}%`;
    return { total, progress, verified, missing, damaged, pending };
  };

  const metrics = getCycleProgressMetrics();

  // Filters for Items View
  const filteredItems = cycleItems.filter(item => {
    const assetName = getAssetName(item.asset_id).toLowerCase();
    const assetTag = getAssetTag(item.asset_id).toLowerCase();
    const locationName = getAssetExpectedLocation(item.asset_id).toLowerCase();
    const search = searchQuery.toLowerCase();
    
    const matchesSearch = assetName.includes(search) || assetTag.includes(search) || locationName.includes(search);
    
    const matchesStatus = itemStatusFilter === 'all' 
      ? true 
      : item.status === itemStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [itemStatusFilter, searchQuery]);

  // View 1: Cycles List View
  if (!selectedCycle) {
    return (
      <div className="space-y-6 animate-fade-in font-sans">
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <nav className="flex gap-2 text-xs font-semibold text-on-surface-variant mb-2">
              <span>Compliance</span>
              <span>/</span>
              <span className="text-primary font-bold">Audit Cycles</span>
            </nav>
            <h1 className="text-2xl font-heading font-bold text-on-surface">Annual Asset Audit</h1>
            <p className="text-sm text-on-surface-variant mt-1 font-medium">
              Create, configure, and manage physical asset compliance verification loops.
            </p>
          </div>
          <button 
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-container hover:text-on-primary-container shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-95 cursor-pointer animate-fade-in"
          >
            <Plus className="w-4 h-4" />
            New Audit Cycle
          </button>
        </div>

        {/* Global KPI Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Total Cycles</span>
              <div className="text-3xl font-bold font-heading mt-1">{cycles.length}</div>
            </div>
            <div className="p-3 bg-surface-container rounded-xl text-on-surface-variant">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Active Loops</span>
              <div className="text-3xl font-bold font-heading mt-1 text-primary">
                {cycles.filter(c => c.status === 'in_progress').length}
              </div>
            </div>
            <div className="p-3 bg-primary-container/10 text-primary rounded-xl">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          </div>
          <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Closed Audits</span>
              <div className="text-3xl font-bold font-heading mt-1 text-secondary">
                {cycles.filter(c => c.status === 'closed').length}
              </div>
            </div>
            <div className="p-3 bg-secondary-container/10 text-secondary rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Cycles list table */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden min-h-[250px] relative">
          {isLoading ? (
            <div className="absolute inset-0 bg-surface/50 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <span className="text-sm font-semibold text-on-surface-variant">Loading audit configurations...</span>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center gap-4">
              <AlertCircle className="w-12 h-12 text-error" />
              <div>
                <h3 className="font-bold text-lg text-on-surface">Failed to Load Audits</h3>
                <p className="text-sm text-on-surface-variant mt-1">{error}</p>
              </div>
              <button 
                onClick={loadData}
                className="px-4 py-2 bg-primary text-white font-semibold rounded-xl text-sm hover:bg-primary-container hover:text-on-primary-container transition-colors cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : cycles.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center gap-4 min-h-[250px]">
              <span className="material-symbols-outlined text-[48px] text-outline">fact_check</span>
              <div>
                <h3 className="font-bold text-lg text-on-surface">No Audit Cycles Configured</h3>
                <p className="text-sm text-on-surface-variant mt-1">Configure your first physical audit validation loop to start.</p>
              </div>
              <button 
                onClick={() => setIsCreateOpen(true)}
                className="px-4 py-2 bg-primary text-white font-semibold rounded-xl text-sm hover:bg-primary-container hover:text-on-primary-container transition-colors cursor-pointer"
              >
                Configure Audit Cycle
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-secondary text-xs uppercase tracking-wider text-on-surface-variant border-b border-outline-variant font-bold">
                  <th className="px-6 py-3.5">Cycle ID</th>
                  <th className="px-6 py-3.5 w-[25%]">Scope</th>
                  <th className="px-6 py-3.5">Date Range</th>
                  <th className="px-6 py-3.5">Auditors</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant bg-surface-container-lowest text-sm">
                {cycles.map((c) => {
                  const deptScope = getDepartmentName(c.scope_department_id);
                  const locationScope = c.scope_location;
                  const scopes = [deptScope, locationScope].filter(Boolean).join(' • ');

                  return (
                    <tr key={c.id} className="hover:bg-surface-container-low transition-colors align-middle">
                      <td className="px-6 py-4 font-mono font-bold text-primary truncate" title={c.id}>
                        {c.id.substring(0, 8)}
                      </td>
                      <td className="px-6 py-4 font-semibold text-on-surface truncate" title={scopes || 'Whole Organization'}>
                        {scopes || <span className="text-outline font-medium italic">Whole Organization</span>}
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant font-medium whitespace-nowrap">
                        {formatDate(c.date_range_start)} - {formatDate(c.date_range_end)}
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant font-semibold truncate" title={c.auditors.map(a => a.name).join(', ')}>
                        {c.auditors.length > 0 
                          ? c.auditors.map(a => a.name).join(', ')
                          : <span className="text-outline font-medium italic">None Assigned</span>
                        }
                      </td>
                      <td className="px-6 py-4 font-semibold">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getCycleStatusStyle(c.status)}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {c.status === 'draft' && (
                            <button 
                              onClick={() => handleStartCycle(c.id)}
                              className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-all cursor-pointer shadow-sm"
                            >
                              Start Loop
                            </button>
                          )}
                          {c.status === 'in_progress' && (
                            <button 
                              onClick={() => handleCloseCycle(c.id)}
                              className="px-3 py-1.5 bg-error text-white text-xs font-bold rounded-lg hover:bg-error/90 transition-all cursor-pointer shadow-sm"
                            >
                              Close Loop
                            </button>
                          )}
                          <button 
                            onClick={() => handleSelectCycle(c)}
                            className="px-3 py-1.5 border border-outline text-on-surface text-xs font-bold rounded-lg hover:bg-surface-container-high transition-all cursor-pointer"
                          >
                            {c.status === 'closed' ? 'View Details' : 'Verify Items'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* CREATE AUDIT CYCLE MODAL */}
        {isCreateOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="px-6 py-5 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                <div>
                  <h3 className="font-bold text-xl font-heading text-on-surface">Configure Audit Cycle</h3>
                  <p className="text-xs font-semibold text-on-surface-variant mt-1">Specify verification scopes, dates, and assign auditors.</p>
                </div>
                <button 
                  className="p-2 hover:bg-surface-variant rounded-full transition-colors cursor-pointer" 
                  onClick={() => setIsCreateOpen(false)}
                >
                  <X className="w-5 h-5 text-on-surface" />
                </button>
              </div>
              
              <form className="p-6 overflow-y-auto space-y-5 flex-1" onSubmit={handleCreateSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1.5">Scope Department (Optional)</label>
                    <select 
                      value={createFormData.scope_department_id}
                      onChange={(e) => setCreateFormData({...createFormData, scope_department_id: e.target.value})}
                      className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-semibold text-on-surface"
                    >
                      <option value="">Whole Organization</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1.5">Scope Location (Optional)</label>
                    <input 
                      type="text" 
                      value={createFormData.scope_location}
                      onChange={(e) => setCreateFormData({...createFormData, scope_location: e.target.value})}
                      placeholder="e.g. London HQ"
                      className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-semibold text-on-surface"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1.5">Start Date *</label>
                    <input 
                      required
                      type="date" 
                      value={createFormData.date_range_start}
                      onChange={(e) => setCreateFormData({...createFormData, date_range_start: e.target.value})}
                      className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-semibold text-on-surface"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1.5">End Date *</label>
                    <input 
                      required
                      type="date" 
                      value={createFormData.date_range_end}
                      onChange={(e) => setCreateFormData({...createFormData, date_range_end: e.target.value})}
                      className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-semibold text-on-surface"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-2">Assign Auditors (Select one or more)</label>
                  <div className="border border-outline-variant rounded-xl bg-surface p-4 max-h-[160px] overflow-y-auto space-y-2">
                    {employees.map((emp) => (
                      <label key={emp.id} className="flex items-center gap-3 cursor-pointer text-sm font-semibold text-on-surface-variant hover:text-on-surface">
                        <input 
                          type="checkbox"
                          checked={createFormData.auditor_ids.includes(emp.id)}
                          onChange={() => handleAuditorToggle(emp.id)}
                          className="rounded border-outline-variant text-primary focus:ring-primary/20"
                        />
                        <span>{emp.name} ({emp.email})</span>
                      </label>
                    ))}
                    {employees.length === 0 && (
                      <p className="text-xs text-outline italic">No employees found in organization.</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant">
                  <button 
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-5 py-2.5 border border-outline-variant text-on-surface rounded-xl hover:bg-surface-container text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={formSubmitting}
                    className="flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-container hover:text-on-primary-container transition-all cursor-pointer disabled:opacity-50"
                  >
                    {formSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Create Loop
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // View 2: Items View (Inside Selected Cycle)
  const deptScope = getDepartmentName(selectedCycle.scope_department_id);
  const locationScope = selectedCycle.scope_location;
  const scopes = [deptScope, locationScope].filter(Boolean).join(' • ') || 'Whole Organization';
  
  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <button 
            onClick={handleBackToCycles}
            className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer mb-2 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to cycles list
          </button>
          <h2 className="text-2xl font-bold font-heading text-on-surface">Cycle #{selectedCycle.id.substring(0, 8)} Items</h2>
          <p className="text-sm text-on-surface-variant mt-1 font-medium">
            Scope: <strong className="text-on-surface font-semibold">{scopes}</strong> • Date: {formatDate(selectedCycle.date_range_start)} - {formatDate(selectedCycle.date_range_end)}
          </p>
        </div>

        <div className="flex gap-2">
          {selectedCycle.status === 'draft' && (
            <button 
              onClick={() => { handleStartCycle(selectedCycle.id); handleBackToCycles(); }}
              className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
            >
              Start Cycle
            </button>
          )}
          {selectedCycle.status === 'in_progress' && (
            <button 
              onClick={() => { handleCloseCycle(selectedCycle.id); handleBackToCycles(); }}
              className="px-5 py-2.5 bg-error text-white text-sm font-semibold rounded-xl shadow-lg shadow-error/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
            >
              Close Cycle
            </button>
          )}
        </div>
      </div>

      {/* KPI stats for the cycle */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant space-y-3 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Progress</span>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold font-heading">{metrics.progress}</span>
              <span className="text-xs font-semibold text-on-surface-variant">verified</span>
            </div>
            <div className="w-full bg-surface-container-highest h-2 rounded-full mt-2 overflow-hidden">
              <div className="bg-primary h-full transition-all duration-20" style={{ width: metrics.progress }}></div>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant space-y-3">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Verified</span>
          <div>
            <div className="text-3xl font-bold font-heading text-secondary">{metrics.verified}</div>
            <p className="text-[10px] text-outline font-semibold mt-1">Confirmed intact & present</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant space-y-3">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Missing</span>
          <div>
            <div className="text-3xl font-bold font-heading text-error">{metrics.missing}</div>
            <p className="text-[10px] text-outline font-semibold mt-1">Unaccounted for</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant space-y-3">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Damaged</span>
          <div>
            <div className="text-3xl font-bold font-heading text-amber-500">{metrics.damaged}</div>
            <p className="text-[10px] text-outline font-semibold mt-1">Needs repair work</p>
          </div>
        </div>
      </div>

      {/* Cycle Items panel */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden relative min-h-[300px]">
        {isItemsLoading && (
          <div className="absolute inset-0 bg-surface/50 flex flex-col items-center justify-center gap-3 z-10">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <span className="text-sm font-semibold text-on-surface-variant">Syncing items records...</span>
          </div>
        )}

        {/* Filters */}
        <div className="p-4 border-b border-outline-variant flex flex-wrap gap-4 items-center justify-between bg-surface-container-low">
          <div className="flex gap-2">
            <button 
              onClick={() => setItemStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                itemStatusFilter === 'all' 
                  ? 'bg-surface-container-high text-on-surface' 
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              All Assets ({metrics.total})
            </button>
            <button 
              onClick={() => setItemStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                itemStatusFilter === 'pending' 
                  ? 'bg-surface-container-high text-on-surface' 
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              Pending ({metrics.pending})
            </button>
            <button 
              onClick={() => setItemStatusFilter('verified')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                itemStatusFilter === 'verified' 
                  ? 'bg-surface-container-high text-on-surface' 
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              Verified ({metrics.verified})
            </button>
            <button 
              onClick={() => setItemStatusFilter('missing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                itemStatusFilter === 'missing' 
                  ? 'bg-surface-container-high text-on-surface' 
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              Missing ({metrics.missing})
            </button>
            <button 
              onClick={() => setItemStatusFilter('damaged')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                itemStatusFilter === 'damaged' 
                  ? 'bg-surface-container-high text-on-surface' 
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              Damaged ({metrics.damaged})
            </button>
          </div>

          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items by name, tag, location..." 
              className="w-full pl-10 pr-4 py-1.5 bg-surface text-on-surface rounded-xl border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-medium"
            />
          </div>
        </div>

        {/* Table of items */}
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center gap-4 min-h-[300px]">
            <span className="material-symbols-outlined text-[48px] text-outline">search_off</span>
            <div>
              <h3 className="font-bold text-lg text-on-surface">No Items Match Filters</h3>
              <p className="text-sm text-on-surface-variant mt-1">Refine your search tags or selected status category filters.</p>
            </div>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-surface-secondary text-xs uppercase tracking-wider text-on-surface-variant border-b border-outline-variant font-bold">
                <th className="px-6 py-3.5 w-[30%]">Asset Details</th>
                <th className="px-6 py-3.5">Asset ID / Tag</th>
                <th className="px-6 py-3.5">Expected Location</th>
                <th className="px-6 py-3.5">Audit Status</th>
                {selectedCycle.status === 'in_progress' && <th className="px-6 py-3.5 text-center w-[180px]">Verification Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant text-sm">
              {paginatedItems.map((item) => {
                const assetName = getAssetName(item.asset_id);
                const assetTag = getAssetTag(item.asset_id);
                const locationName = getAssetExpectedLocation(item.asset_id);
                const verifierName = item.verified_by_id ? getEmployeeName(item.verified_by_id) : null;

                return (
                  <tr key={item.id} className="hover:bg-surface-container-low transition-colors align-middle">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary flex-shrink-0">
                          <span className="material-symbols-outlined">laptop_mac</span>
                        </div>
                        <div className="truncate">
                          <p className="font-bold text-sm text-on-surface truncate" title={assetName}>{assetName}</p>
                          {item.notes && (
                            <p className="text-xs text-amber-500 font-semibold truncate mt-0.5" title={item.notes}>Notes: {item.notes}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-on-surface-variant font-bold">
                      {assetTag}
                    </td>
                    <td className="px-6 py-4 font-semibold text-on-surface-variant truncate" title={locationName}>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-outline" />
                        <span>{locationName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      <div className="flex flex-col gap-0.5">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getItemStatusStyle(item.status)}`}>
                          {item.status.replace(/_/g, ' ')}
                        </span>
                        {verifierName && (
                          <span className="text-[10px] text-outline font-semibold">By: {verifierName}</span>
                        )}
                      </div>
                    </td>
                    {selectedCycle.status === 'in_progress' && (
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-1.5">
                          <button 
                            onClick={() => openVerifyModal(item, 'verified')}
                            className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-500 transition-all cursor-pointer inline-flex"
                            title="Mark Verified"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => openVerifyModal(item, 'missing')}
                            className="p-1.5 rounded-lg hover:bg-error-container/10 text-error transition-all cursor-pointer inline-flex"
                            title="Mark Missing"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => openVerifyModal(item, 'damaged')}
                            className="p-1.5 rounded-lg hover:bg-amber-500/10 text-amber-500 transition-all cursor-pointer inline-flex"
                            title="Mark Damaged"
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {!isItemsLoading && filteredItems.length > itemsPerPage && (
          <div className="p-4 border-t border-outline-variant flex items-center justify-between text-xs font-bold text-on-surface-variant bg-surface-container-low">
            <div>
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} entries
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3.5 py-1.5 border border-outline-variant rounded-xl bg-surface hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer text-on-surface"
              >
                Previous
              </button>
              <button 
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage * itemsPerPage >= filteredItems.length}
                className="px-3.5 py-1.5 border border-outline-variant rounded-xl bg-surface hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer text-on-surface"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* VERIFY ITEM NOTES MODAL */}
      {isVerifyOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col font-sans">
            <div className="px-6 py-5 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <div>
                <h3 className="font-bold text-lg font-heading text-on-surface">Verify Asset Status</h3>
                <p className="text-xs font-semibold text-on-surface-variant mt-1">Verify asset condition state and record compliance notes.</p>
              </div>
              <button 
                className="p-2 hover:bg-surface-variant rounded-full transition-colors cursor-pointer" 
                onClick={() => setIsVerifyOpen(false)}
              >
                <X className="w-5 h-5 text-on-surface" />
              </button>
            </div>
            
            <form className="p-6 space-y-4" onSubmit={handleVerifySubmit}>
              <div>
                <p className="text-sm font-semibold text-on-surface">
                  Mark Asset <strong className="text-primary font-bold">{selectedItem && getAssetName(selectedItem.asset_id)}</strong> as:
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getItemStatusStyle(verifyStatus)}`}>
                    {verifyStatus}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">Verification Notes (Optional)</label>
                <textarea 
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
                  placeholder="e.g. Scanned in server room rack, slight wear observed."
                  rows={3}
                  className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-semibold text-on-surface"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant">
                <button 
                  type="button"
                  onClick={() => setIsVerifyOpen(false)}
                  className="px-4 py-2 border border-outline-variant text-on-surface rounded-xl hover:bg-surface-container text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={formSubmitting}
                  className="flex items-center justify-center gap-2 bg-primary text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-primary-container hover:text-on-primary-container transition-all cursor-pointer disabled:opacity-50"
                >
                  {formSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirm Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
