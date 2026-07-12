import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Laptop, Info, Wrench, Shield, CheckCircle2, 
  Loader2, AlertCircle, Calendar, DollarSign, 
  MapPin, Clock, FileText, ArrowLeft, Edit, 
  X, Upload, User, Trash2 
} from 'lucide-react';
import { AssetsService } from '../services/assets';
import toast from 'react-hot-toast';

export default function AssetDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // State
  const [asset, setAsset] = useState(null);
  const [history, setHistory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    serial_number: '',
    acquisition_date: '',
    acquisition_cost: '',
    condition: 'good',
    location: '',
    is_bookable: false,
    status: 'available'
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [docFile, setDocFile] = useState(null);

  // Determine user basePath (admin, manager, head, user)
  const getBasePath = () => {
    if (location.pathname.startsWith('/admin')) return '/admin';
    if (location.pathname.startsWith('/manager')) return '/manager';
    if (location.pathname.startsWith('/head')) return '/head';
    if (location.pathname.startsWith('/user')) return '/user';
    return '/user';
  };

  const basePath = getBasePath();

  // Load all detail data
  const loadAssetDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Load categories first to ensure we can map names
      let categoryList = [];
      try {
        const catRes = await AssetsService.getCategories();
        categoryList = catRes?.items || catRes?.results || (Array.isArray(catRes) ? catRes : []);
        setCategories(categoryList);
      } catch (catErr) {
        console.error('Failed to load categories', catErr);
      }

      // Load asset
      const assetData = await AssetsService.getAsset(id);
      setAsset(assetData);

      // Load history
      try {
        const historyData = await AssetsService.getAssetHistory(id);
        const list = Array.isArray(historyData) ? historyData : (historyData?.items || []);
        setHistory(list);
      } catch (histErr) {
        console.error('Failed to load history', histErr);
      }
    } catch (err) {
      console.error('Failed to load asset details:', err);
      setError('Asset not found or failed to load. Please check the ID or your network connection.');
      toast.error('Error loading asset details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAssetDetails();
  }, [id]);

  // Translate status to human readable
  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Status Style Helper
  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':
      case 'active':
        return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      case 'allocated':
        return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
      case 'under_maintenance':
      case 'in repair':
      case 'maintenance':
        return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      case 'retired':
      case 'lost':
      case 'disposed':
        return 'bg-rose-500/10 text-rose-500 border border-rose-500/20';
      default:
        return 'bg-surface-container-high text-on-surface border border-outline-variant';
    }
  };

  // Condition human readable format
  const formatCondition = (cond) => {
    if (!cond) return 'Good';
    return cond.charAt(0).toUpperCase() + cond.slice(1);
  };

  // Category map helper
  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? (category.name || category.title) : 'Uncategorized';
  };

  // File Upload Helper
  const handleFileUpload = async (file) => {
    if (!file) return null;
    try {
      const presignedData = await AssetsService.getPresignedUrl(file.name, file.type);
      const uploadUrl = presignedData.upload_url || presignedData.url;
      const fileUrl = presignedData.file_url || (uploadUrl ? uploadUrl.split('?')[0] : null);

      if (!uploadUrl) {
        throw new Error('No upload URL returned from server');
      }

      await AssetsService.uploadFileToPresignedUrl(uploadUrl, file);
      return fileUrl;
    } catch (err) {
      console.error('File upload failed for ' + file.name, err);
      toast.error('Failed to upload file: ' + file.name);
      return null;
    }
  };

  // Open Edit Modal
  const openEditModal = () => {
    if (!asset) return;
    setFormData({
      name: asset.name || '',
      category_id: asset.category_id || '',
      serial_number: asset.serial_number || '',
      acquisition_date: asset.acquisition_date ? asset.acquisition_date.substring(0, 10) : '',
      acquisition_cost: asset.acquisition_cost || '',
      condition: asset.condition || 'good',
      location: asset.location || '',
      is_bookable: !!asset.is_bookable,
      status: asset.status || 'available'
    });
    setPhotoFile(null);
    setDocFile(null);
    setIsEditModalOpen(true);
  };

  // Submit Edit Form
  const handleEditAsset = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category_id) {
      toast.error('Name and Category are required');
      return;
    }

    setFormSubmitting(true);
    try {
      let uploadedPhotoUrl = null;
      let uploadedDocUrl = null;

      if (photoFile) {
        toast.loading('Uploading new photo...', { id: 'file-upload' });
        uploadedPhotoUrl = await handleFileUpload(photoFile);
      }

      if (docFile) {
        toast.loading('Uploading new documentation...', { id: 'file-upload' });
        uploadedDocUrl = await handleFileUpload(docFile);
      }

      toast.dismiss('file-upload');

      const payload = {
        name: formData.name,
        category_id: formData.category_id,
        serial_number: formData.serial_number || null,
        acquisition_date: formData.acquisition_date || null,
        acquisition_cost: formData.acquisition_cost ? parseFloat(formData.acquisition_cost) : null,
        condition: formData.condition,
        location: formData.location || null,
        is_bookable: formData.is_bookable,
        status: formData.status
      };

      if (uploadedPhotoUrl) {
        payload.photo_url = uploadedPhotoUrl;
      } else if (asset.photo_url) {
        payload.photo_url = asset.photo_url;
      }

      if (uploadedDocUrl) {
        const newDoc = {
          name: docFile.name,
          url: uploadedDocUrl,
          uploaded_at: new Date().toISOString()
        };
        payload.documents = asset.documents 
          ? [...asset.documents, newDoc]
          : [newDoc];
      } else if (asset.documents) {
        payload.documents = asset.documents;
      }

      await AssetsService.updateAsset(asset.id, payload);
      toast.success('Asset updated successfully!');
      setIsEditModalOpen(false);
      loadAssetDetails();
    } catch (err) {
      console.error('Update asset failed:', err);
      toast.error(err.response?.data?.detail || 'Failed to update asset');
    } finally {
      setFormSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <span className="text-sm font-semibold text-on-surface-variant">Loading asset record...</span>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-4 p-6 text-center">
        <AlertCircle className="w-16 h-16 text-error" />
        <div>
          <h2 className="text-xl font-bold text-on-surface">Failed to Load Asset Details</h2>
          <p className="text-sm text-on-surface-variant mt-1">{error || 'Asset not found.'}</p>
        </div>
        <button 
          onClick={() => navigate(`${basePath}/assets`)}
          className="flex items-center gap-2 px-4 py-2 bg-surface border border-outline-variant rounded-xl font-semibold text-sm hover:bg-surface-container transition-colors text-on-surface cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Asset Directory
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back to directory header */}
      <button 
        onClick={() => navigate(`${basePath}/assets`)}
        className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Assets Directory
      </button>

      {/* Asset Hero Panel */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm">
        <div className="flex items-center gap-4">
          {asset.photo_url ? (
            <img 
              src={asset.photo_url} 
              alt={asset.name}
              className="w-16 h-16 rounded-xl object-cover border border-outline-variant"
            />
          ) : (
            <div className="w-16 h-16 bg-surface-container rounded-xl flex items-center justify-center text-primary border border-outline-variant">
              <Laptop className="w-8 h-8" />
            </div>
          )}
          
          <div className="space-y-1">
            <h1 className="text-2xl font-heading font-bold text-on-surface">{asset.name}</h1>
            <div className="text-on-surface-variant text-xs flex items-center gap-3 font-semibold">
              <span className="font-mono text-primary font-bold">{asset.asset_tag || asset.id.substring(0, 8)}</span>
              <span>•</span>
              <span className="text-on-surface-variant">Category: {getCategoryName(asset.category_id)}</span>
              <span>•</span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusStyle(asset.status)}`}>
                <CheckCircle2 className="w-3 h-3" /> {formatStatus(asset.status)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls (Visible to Admin and Asset Managers) */}
        {(basePath === '/admin' || basePath === '/manager') && (
          <div className="flex gap-2">
            <button 
              onClick={openEditModal}
              className="px-4 py-2 border border-outline-variant rounded-xl font-bold text-sm hover:bg-surface-container-low transition-colors cursor-pointer text-on-surface flex items-center gap-1.5"
            >
              <Edit className="w-4 h-4 text-outline" />
              Edit Asset
            </button>
          </div>
        )}
      </div>

      {/* Detail grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Specifications card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-heading font-bold flex items-center gap-2 text-on-surface">
              <Info className="w-5 h-5 text-primary" /> Technical Specifications
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 text-sm font-semibold">
              <div className="border-b border-outline-variant/40 pb-2">
                <span className="text-on-surface-variant block text-xs font-bold uppercase tracking-wider mb-1">Serial Number</span>
                <span className="font-mono text-on-surface">{asset.serial_number || 'Not Recorded'}</span>
              </div>
              
              <div className="border-b border-outline-variant/40 pb-2">
                <span className="text-on-surface-variant block text-xs font-bold uppercase tracking-wider mb-1">Asset Condition</span>
                <span className="text-on-surface">{formatCondition(asset.condition)}</span>
              </div>
              
              <div className="border-b border-outline-variant/40 pb-2">
                <span className="text-on-surface-variant block text-xs font-bold uppercase tracking-wider mb-1">Acquisition Cost</span>
                <span className="text-on-surface flex items-center gap-0.5">
                  <DollarSign className="w-4 h-4 text-outline" />
                  {asset.acquisition_cost ? asset.acquisition_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'}
                </span>
              </div>

              <div className="border-b border-outline-variant/40 pb-2">
                <span className="text-on-surface-variant block text-xs font-bold uppercase tracking-wider mb-1">Acquisition Date</span>
                <span className="text-on-surface flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-outline" />
                  {asset.acquisition_date ? new Date(asset.acquisition_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                </span>
              </div>

              <div className="border-b border-outline-variant/40 pb-2">
                <span className="text-on-surface-variant block text-xs font-bold uppercase tracking-wider mb-1">Storage Location</span>
                <span className="text-on-surface flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-outline" />
                  {asset.location || 'Default Storage Warehouse'}
                </span>
              </div>

              <div className="border-b border-outline-variant/40 pb-2">
                <span className="text-on-surface-variant block text-xs font-bold uppercase tracking-wider mb-1">Reservation Policy</span>
                <span className="text-on-surface">
                  {asset.is_bookable ? 'Bookable by Department Employees' : 'Not Open for Reservation'}
                </span>
              </div>
            </div>
          </div>

          {/* Documents card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-heading font-bold flex items-center gap-2 text-on-surface">
              <FileText className="w-5 h-5 text-primary" /> Associated Files & Manuals
            </h2>
            
            {!asset.documents || asset.documents.length === 0 ? (
              <p className="text-sm font-semibold text-on-surface-variant italic">No manuals, invoices, or guides uploaded for this asset.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {asset.documents.map((doc, idx) => (
                  <a 
                    key={idx}
                    href={doc.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 border border-outline-variant rounded-xl hover:bg-surface-container-low transition-colors flex items-center gap-3 cursor-pointer group text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-on-surface truncate">{doc.name || 'document_file'}</div>
                      <div className="text-[10px] text-on-surface-variant font-semibold mt-0.5">Click to view/download</div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* History Log Card */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm space-y-6 flex flex-col h-full">
          <h2 className="text-lg font-heading font-bold flex items-center gap-2 text-on-surface">
            <Clock className="w-5 h-5 text-secondary" /> Asset History Log
          </h2>

          <div className="relative border-l border-outline-variant pl-4 ml-2 space-y-6 flex-1 overflow-y-auto max-h-[400px]">
            {history.length === 0 ? (
              <div className="absolute top-0 left-0 pl-1 text-sm font-semibold text-on-surface-variant italic">
                No system tracking events found.
              </div>
            ) : (
              history.map((log, idx) => (
                <div key={log.id || idx} className="relative group">
                  {/* Timeline indicator node */}
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-secondary border border-surface group-hover:scale-125 transition-transform" />
                  
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wide block">
                      {log.action ? log.action.split('_').join(' ') : 'Event'}
                    </span>
                    <p className="text-xs font-semibold text-on-surface leading-relaxed">
                      {log.notes || log.description || 'System recorded action state update.'}
                    </p>
                    
                    <div className="flex flex-col gap-0.5 pt-1 text-[10px] font-bold text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-outline" />
                        {new Date(log.created_at || log.timestamp).toLocaleString()}
                      </span>
                      {log.user_name && (
                        <span className="flex items-center gap-1 mt-0.5">
                          <User className="w-3 h-3 text-outline" />
                          By: {log.user_name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* EDIT ASSET MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-5 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <div>
                <h3 className="font-bold text-xl font-heading text-on-surface">Edit Asset Details</h3>
                <p className="text-xs font-semibold text-on-surface-variant mt-1">
                  Modify the database record for <span className="font-mono text-primary font-bold">{asset.asset_tag}</span>.
                </p>
              </div>
              <button 
                className="p-2 hover:bg-surface-variant rounded-full transition-colors cursor-pointer" 
                onClick={() => setIsEditModalOpen(false)}
              >
                <X className="w-5 h-5 text-on-surface" />
              </button>
            </div>
            
            <form className="p-6 overflow-y-auto space-y-5 flex-1" onSubmit={handleEditAsset}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1.5">Asset Name *</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. MacBook Pro M3"
                    className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-semibold text-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1.5">Category *</label>
                  <select 
                    required
                    value={formData.category_id}
                    onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                    className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-semibold text-on-surface"
                  >
                    <option value="" disabled>Select Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name || c.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1.5">Serial Number</label>
                  <input 
                    type="text" 
                    value={formData.serial_number}
                    onChange={(e) => setFormData({...formData, serial_number: e.target.value})}
                    placeholder="e.g. C02D984FMD6R"
                    className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-semibold text-on-surface font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1.5">Acquisition Date</label>
                  <input 
                    type="date" 
                    value={formData.acquisition_date}
                    onChange={(e) => setFormData({...formData, acquisition_date: e.target.value})}
                    className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-semibold text-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1.5">Acquisition Cost (USD)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={formData.acquisition_cost}
                    onChange={(e) => setFormData({...formData, acquisition_cost: e.target.value})}
                    placeholder="e.g. 1999.00"
                    className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-semibold text-on-surface"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1.5">Asset Condition</label>
                  <select 
                    value={formData.condition}
                    onChange={(e) => setFormData({...formData, condition: e.target.value})}
                    className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-semibold text-on-surface"
                  >
                    <option value="new">New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                    <option value="damaged">Damaged</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1.5">Operational Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-semibold text-on-surface"
                  >
                    <option value="available">Available</option>
                    <option value="allocated">Allocated</option>
                    <option value="reserved">Reserved</option>
                    <option value="under_maintenance">Under Maintenance</option>
                    <option value="lost">Lost</option>
                    <option value="retired">Retired</option>
                    <option value="disposed">Disposed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1.5">Location</label>
                  <input 
                    type="text" 
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="e.g. Headquarters - Floor 3"
                    className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-semibold text-on-surface"
                  />
                </div>
              </div>

              {/* Photo & Document Uploads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="border border-dashed border-outline-variant rounded-xl p-4 flex flex-col items-center justify-center text-center bg-surface-container-lowest">
                  {asset.photo_url && !photoFile ? (
                    <img 
                      src={asset.photo_url} 
                      alt="Current" 
                      className="w-14 h-14 rounded-lg object-cover mb-1 border border-outline-variant"
                    />
                  ) : (
                    <Upload className="w-6 h-6 text-outline mb-2" />
                  )}
                  <span className="text-xs font-bold text-on-surface">Update Asset Image</span>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">JPG, PNG up to 5MB</p>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setPhotoFile(e.target.files[0])}
                    className="hidden" 
                    id="photo-upload-edit-details"
                  />
                  <label 
                    htmlFor="photo-upload-edit-details"
                    className="mt-3 px-3 py-1.5 bg-surface-container border border-outline-variant rounded-lg text-xs font-bold hover:bg-surface cursor-pointer transition-colors text-on-surface"
                  >
                    {photoFile ? photoFile.name : 'Choose Image'}
                  </label>
                  {photoFile && (
                    <button 
                      type="button" 
                      onClick={() => setPhotoFile(null)}
                      className="text-error font-bold text-[10px] mt-2 flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <X className="w-3 h-3" /> Remove
                    </button>
                  )}
                </div>

                <div className="border border-dashed border-outline-variant rounded-xl p-4 flex flex-col items-center justify-center text-center bg-surface-container-lowest">
                  <FileText className="w-6 h-6 text-outline mb-2" />
                  <span className="text-xs font-bold text-on-surface">Upload Documentation File</span>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">PDF, DOCX up to 10MB</p>
                  <input 
                    type="file" 
                    accept=".pdf,.docx,.doc,.txt"
                    onChange={(e) => setDocFile(e.target.files[0])}
                    className="hidden" 
                    id="doc-upload-edit-details"
                  />
                  <label 
                    htmlFor="doc-upload-edit-details"
                    className="mt-3 px-3 py-1.5 bg-surface-container border border-outline-variant rounded-lg text-xs font-bold hover:bg-surface cursor-pointer transition-colors text-on-surface"
                  >
                    {docFile ? docFile.name : 'Choose File'}
                  </label>
                  {docFile && (
                    <button 
                      type="button" 
                      onClick={() => setDocFile(null)}
                      className="text-error font-bold text-[10px] mt-2 flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <X className="w-3 h-3" /> Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Bookable checkbox */}
              <div className="flex items-center gap-2.5 pt-2">
                <input 
                  type="checkbox" 
                  checked={formData.is_bookable}
                  onChange={(e) => setFormData({...formData, is_bookable: e.target.checked})}
                  id="is_bookable_edit_details"
                  className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary bg-surface"
                />
                <label htmlFor="is_bookable_edit_details" className="text-sm font-semibold text-on-surface cursor-pointer">
                  Allow employee booking reservations for this asset
                </label>
              </div>

              <div className="flex gap-3 pt-5 border-t border-outline-variant">
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={formSubmitting}
                  className="flex-1 px-4 py-3 border border-outline-variant rounded-xl font-bold text-on-surface hover:bg-surface-container transition-colors cursor-pointer text-sm disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={formSubmitting}
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer text-sm disabled:opacity-50"
                >
                  {formSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
