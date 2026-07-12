import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Plus, Edit2, Trash2, Loader2, AlertCircle, X } from 'lucide-react';
import { BookingsService } from '../services/bookings';
import { AssetsService } from '../services/assets';
import { apiClient } from '../api/client';
import toast from 'react-hot-toast';

export default function ResourceBooking() {
  // State variables
  const [bookings, setBookings] = useState([]);
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'past'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Form states
  const [createFormData, setCreateFormData] = useState({
    asset_id: '',
    start_time: '',
    end_time: '',
    department_id: ''
  });

  const [rescheduleFormData, setRescheduleFormData] = useState({
    start_time: '',
    end_time: ''
  });

  // Load all data on mount
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [bookingsData, assetsData, employeesData, deptsData] = await Promise.all([
        BookingsService.listBookings({ limit: 1000 }),
        AssetsService.listAssets({ limit: 1000 }),
        apiClient.get('/org/employees?limit=1000'),
        apiClient.get('/org/departments')
      ]);

      setBookings(bookingsData.items || []);
      setAssets(assetsData.items || []);
      setEmployees(employeesData.data?.items || []);
      setDepartments(deptsData.data || []);
    } catch (err) {
      console.error('Failed to load bookings data:', err);
      setError('Failed to load bookings data. Please check your network or API server connection.');
      toast.error('Error loading page data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Helper: Get error message from Axios response
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

  // Helper: Convert UTC date to local datetime-local format
  const toLocalDatetimeString = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const pad = (num) => String(num).padStart(2, '0');
    
    const yyyy = date.getFullYear();
    const MM = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const mm = pad(date.getMinutes());
    
    return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
  };

  // Helper: Display names for mappings
  const getAssetName = (assetId) => {
    const asset = assets.find(a => a.id === assetId);
    return asset ? asset.name : `Asset (${assetId.substring(0, 8)})`;
  };

  const getEmployeeName = (employeeId) => {
    const emp = employees.find(e => e.id === employeeId);
    return emp ? emp.name : `Employee (${employeeId.substring(0, 8)})`;
  };

  const getDepartmentName = (deptId) => {
    if (!deptId) return null;
    const dept = departments.find(d => d.id === deptId);
    return dept ? dept.name : null;
  };

  // Helper: Format timespans beautifully
  const formatBookingTime = (startStr, endStr) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    
    const dateOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
    
    if (start.toDateString() === end.toDateString()) {
      return `${start.toLocaleDateString(undefined, dateOptions)} • ${start.toLocaleTimeString(undefined, timeOptions)} - ${end.toLocaleTimeString(undefined, timeOptions)}`;
    } else {
      return `${start.toLocaleDateString(undefined, dateOptions)}, ${start.toLocaleTimeString(undefined, timeOptions)} - ${end.toLocaleDateString(undefined, dateOptions)}, ${end.toLocaleTimeString(undefined, timeOptions)}`;
    }
  };

  // Status Style classes mapping
  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'upcoming':
        return 'bg-primary/10 text-primary border border-primary/20';
      case 'ongoing':
        return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      case 'completed':
        return 'bg-outline/10 text-outline border border-outline/20';
      case 'cancelled':
        return 'bg-error/10 text-error border border-error/20';
      default:
        return 'bg-surface-container text-on-surface-variant border border-outline-variant';
    }
  };

  // Operations
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createFormData.asset_id) {
      toast.error('Please select an asset');
      return;
    }
    if (new Date(createFormData.end_time) <= new Date(createFormData.start_time)) {
      toast.error('End time must be after start time');
      return;
    }

    setFormSubmitting(true);
    try {
      const payload = {
        asset_id: createFormData.asset_id,
        start_time: new Date(createFormData.start_time).toISOString(),
        end_time: new Date(createFormData.end_time).toISOString(),
        department_id: createFormData.department_id || null
      };

      await BookingsService.createBooking(payload);
      toast.success('Resource booked successfully');
      setIsCreateOpen(false);
      // Reset form
      setCreateFormData({ asset_id: '', start_time: '', end_time: '', department_id: '' });
      loadData();
    } catch (err) {
      console.error('Failed to create booking:', err);
      toast.error(getErrorMessage(err));
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (new Date(rescheduleFormData.end_time) <= new Date(rescheduleFormData.start_time)) {
      toast.error('End time must be after start time');
      return;
    }

    setFormSubmitting(true);
    try {
      const payload = {
        start_time: new Date(rescheduleFormData.start_time).toISOString(),
        end_time: new Date(rescheduleFormData.end_time).toISOString()
      };

      await BookingsService.rescheduleBooking(selectedBooking.id, payload);
      toast.success('Booking rescheduled successfully');
      setIsRescheduleOpen(false);
      loadData();
    } catch (err) {
      console.error('Failed to reschedule booking:', err);
      toast.error(getErrorMessage(err));
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleCancelSubmit = async () => {
    setFormSubmitting(true);
    try {
      await BookingsService.cancelBooking(selectedBooking.id);
      toast.success('Booking cancelled successfully');
      setIsCancelOpen(false);
      loadData();
    } catch (err) {
      console.error('Failed to cancel booking:', err);
      toast.error(getErrorMessage(err));
    } finally {
      setFormSubmitting(false);
    }
  };

  // Modals controllers
  const openRescheduleModal = (booking) => {
    setSelectedBooking(booking);
    setRescheduleFormData({
      start_time: toLocalDatetimeString(booking.start_time),
      end_time: toLocalDatetimeString(booking.end_time)
    });
    setIsRescheduleOpen(true);
  };

  const openCancelDialog = (booking) => {
    setSelectedBooking(booking);
    setIsCancelOpen(true);
  };

  // Tab Filtering & Client-side Pagination
  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'upcoming') {
      return b.status === 'upcoming' || b.status === 'ongoing';
    } else {
      return b.status === 'completed' || b.status === 'cancelled';
    }
  });

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <nav className="flex gap-2 text-xs font-semibold text-on-surface-variant mb-2">
            <span>Enterprise</span>
            <span>/</span>
            <span className="text-primary font-bold">Bookings</span>
          </nav>
          <h1 className="text-2xl font-heading font-bold text-on-surface">Resource Booking</h1>
          <p className="text-sm text-on-surface-variant mt-1 font-medium">
            Schedule conference rooms, company vehicles, and other shared resources.
          </p>
        </div>
        <button 
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-container hover:text-on-primary-container shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New Booking
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-6 relative min-h-[300px]">
        {isLoading ? (
          <div className="absolute inset-0 bg-surface/50 flex flex-col items-center justify-center gap-3 rounded-xl">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <span className="text-sm font-semibold text-on-surface-variant">Loading bookings...</span>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center gap-4 rounded-xl">
            <AlertCircle className="w-12 h-12 text-error" />
            <div>
              <h3 className="font-bold text-lg text-on-surface">Failed to Load Bookings</h3>
              <p className="text-sm text-on-surface-variant mt-1">{error}</p>
            </div>
            <button 
              onClick={loadData}
              className="px-4 py-2 bg-primary text-white font-semibold rounded-xl text-sm hover:bg-primary-container hover:text-on-primary-container transition-colors cursor-pointer"
            >
              Retry Request
            </button>
          </div>
        ) : (
          <>
            {/* Filter Tabs */}
            <div className="flex items-center gap-4 mb-6 text-on-surface-variant text-sm border-b border-outline-variant pb-4">
              <button 
                onClick={() => setActiveTab('upcoming')}
                className={`flex items-center gap-2 font-semibold pb-4 -mb-[17px] cursor-pointer transition-colors relative ${
                  activeTab === 'upcoming' 
                    ? 'text-primary border-b-2 border-primary' 
                    : 'hover:text-on-surface'
                }`}
              >
                <CalendarIcon className="w-4 h-4" /> 
                Upcoming & Ongoing 
                {bookings.filter(b => b.status === 'upcoming' || b.status === 'ongoing').length > 0 && (
                  <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-full ml-1 font-bold">
                    {bookings.filter(b => b.status === 'upcoming' || b.status === 'ongoing').length}
                  </span>
                )}
              </button>
              <button 
                onClick={() => setActiveTab('past')}
                className={`flex items-center gap-2 font-semibold pb-4 -mb-[17px] cursor-pointer transition-colors relative ${
                  activeTab === 'past' 
                    ? 'text-primary border-b-2 border-primary' 
                    : 'hover:text-on-surface'
                }`}
              >
                <Clock className="w-4 h-4" /> 
                Past & Cancelled
              </button>
            </div>

            {/* List Content */}
            {filteredBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center gap-4">
                <span className="material-symbols-outlined text-[48px] text-outline">event_busy</span>
                <div>
                  <h3 className="font-bold text-lg text-on-surface">No Bookings Found</h3>
                  <p className="text-sm text-on-surface-variant mt-1">
                    {activeTab === 'upcoming' 
                      ? 'You do not have any active or upcoming resource bookings.' 
                      : 'There are no past or cancelled bookings in the records.'}
                  </p>
                </div>
                {activeTab === 'upcoming' && (
                  <button 
                    onClick={() => setIsCreateOpen(true)}
                    className="px-4 py-2 bg-primary text-white font-semibold rounded-xl text-sm hover:bg-primary-container hover:text-on-primary-container transition-colors cursor-pointer"
                  >
                    Schedule First Booking
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedBookings.map((b) => {
                  const assetName = getAssetName(b.asset_id);
                  const userName = getEmployeeName(b.booked_by_id);
                  const deptName = getDepartmentName(b.department_id);
                  
                  return (
                    <div 
                      key={b.id} 
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-outline-variant rounded-xl hover:bg-surface-container-low transition-colors gap-4"
                    >
                      <div className="flex items-start sm:items-center gap-4">
                        <div className="w-12 h-12 bg-surface-container-high rounded-xl flex items-center justify-center text-on-surface-variant flex-shrink-0">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-on-surface text-base">{assetName}</div>
                          <div className="text-xs text-on-surface-variant flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 font-semibold">
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-outline" /> {formatBookingTime(b.start_time, b.end_time)}</span>
                            <span>•</span>
                            <span>By: {userName}</span>
                            {deptName && (
                              <>
                                <span>•</span>
                                <span>Dept: {deptName}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusStyle(b.status)}`}>
                          {b.status}
                        </span>
                        
                        {/* Action buttons */}
                        <div className="flex items-center gap-1 ml-2">
                          {b.status === 'upcoming' && (
                            <button 
                              onClick={() => openRescheduleModal(b)}
                              title="Reschedule"
                              className="p-1.5 hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer inline-flex"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {(b.status === 'upcoming' || b.status === 'ongoing') && (
                            <button 
                              onClick={() => openCancelDialog(b)}
                              title="Cancel Booking"
                              className="p-1.5 hover:bg-error-container/10 rounded-lg text-error hover:text-error transition-colors cursor-pointer inline-flex"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination controls */}
            {!isLoading && !error && filteredBookings.length > itemsPerPage && (
              <div className="p-4 border-t border-outline-variant mt-6 flex items-center justify-between text-xs font-bold text-on-surface-variant">
                <div>
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredBookings.length)} of {filteredBookings.length} entries
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
                    disabled={currentPage * itemsPerPage >= filteredBookings.length}
                    className="px-3.5 py-1.5 border border-outline-variant rounded-xl bg-surface hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer text-on-surface"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* CREATE BOOKING MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-5 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <div>
                <h3 className="font-bold text-xl font-heading text-on-surface">Book Shared Resource</h3>
                <p className="text-xs font-semibold text-on-surface-variant mt-1">Reserve a bookable item for your specific business needs.</p>
              </div>
              <button 
                className="p-2 hover:bg-surface-variant rounded-full transition-colors cursor-pointer" 
                onClick={() => setIsCreateOpen(false)}
              >
                <X className="w-5 h-5 text-on-surface" />
              </button>
            </div>
            
            <form className="p-6 overflow-y-auto space-y-5 flex-1" onSubmit={handleCreateSubmit}>
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">Select Resource *</label>
                <select 
                  required
                  value={createFormData.asset_id}
                  onChange={(e) => setCreateFormData({...createFormData, asset_id: e.target.value})}
                  className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-semibold text-on-surface"
                >
                  <option value="" disabled>Select Asset</option>
                  {assets.filter(a => a.is_bookable).map(a => (
                    <option key={a.id} value={a.id}>{a.name} {a.serial_number ? `(${a.serial_number})` : ''}</option>
                  ))}
                </select>
                {assets.filter(a => a.is_bookable).length === 0 && (
                  <p className="text-[10px] text-tertiary font-bold mt-1">No bookable resources registered in system.</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">Department (Optional)</label>
                <select 
                  value={createFormData.department_id}
                  onChange={(e) => setCreateFormData({...createFormData, department_id: e.target.value})}
                  className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-semibold text-on-surface"
                >
                  <option value="">No Department (General / Personal)</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1.5">Start Time *</label>
                  <input 
                    required
                    type="datetime-local" 
                    value={createFormData.start_time}
                    onChange={(e) => setCreateFormData({...createFormData, start_time: e.target.value})}
                    className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-semibold text-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1.5">End Time *</label>
                  <input 
                    required
                    type="datetime-local" 
                    value={createFormData.end_time}
                    onChange={(e) => setCreateFormData({...createFormData, end_time: e.target.value})}
                    className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-semibold text-on-surface"
                  />
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
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESCHEDULE MODAL */}
      {isRescheduleOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-5 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <div>
                <h3 className="font-bold text-xl font-heading text-on-surface">Reschedule Booking</h3>
                <p className="text-xs font-semibold text-on-surface-variant mt-1">Modify start or end times for resource: {selectedBooking && getAssetName(selectedBooking.asset_id)}</p>
              </div>
              <button 
                className="p-2 hover:bg-surface-variant rounded-full transition-colors cursor-pointer" 
                onClick={() => setIsRescheduleOpen(false)}
              >
                <X className="w-5 h-5 text-on-surface" />
              </button>
            </div>
            
            <form className="p-6 overflow-y-auto space-y-5 flex-1" onSubmit={handleRescheduleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1.5">New Start Time *</label>
                  <input 
                    required
                    type="datetime-local" 
                    value={rescheduleFormData.start_time}
                    onChange={(e) => setRescheduleFormData({...rescheduleFormData, start_time: e.target.value})}
                    className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-semibold text-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1.5">New End Time *</label>
                  <input 
                    required
                    type="datetime-local" 
                    value={rescheduleFormData.end_time}
                    onChange={(e) => setRescheduleFormData({...rescheduleFormData, end_time: e.target.value})}
                    className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-semibold text-on-surface"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant">
                <button 
                  type="button"
                  onClick={() => setIsRescheduleOpen(false)}
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
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CANCEL CONFIRMATION DIALOG */}
      {isCancelOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-error/10 text-error flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-on-surface font-heading">Cancel Booking?</h3>
              <p className="text-sm text-on-surface-variant mt-2 font-medium">
                Are you sure you want to cancel the reservation for{' '}
                <strong className="text-on-surface font-semibold">
                  {selectedBooking && getAssetName(selectedBooking.asset_id)}
                </strong>
                ? This booking status will change to cancelled and the resource will be released for others.
              </p>
            </div>
            <div className="px-6 py-4 bg-surface-container-low flex justify-end gap-3 border-t border-outline-variant">
              <button 
                type="button"
                onClick={() => setIsCancelOpen(false)}
                className="px-4 py-2 border border-outline-variant text-on-surface rounded-xl hover:bg-surface-container text-sm font-semibold transition-colors cursor-pointer"
              >
                Keep Booking
              </button>
              <button 
                type="button"
                onClick={handleCancelSubmit}
                disabled={formSubmitting}
                className="flex items-center gap-2 bg-error text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-error/95 transition-all cursor-pointer disabled:opacity-50"
              >
                {formSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
