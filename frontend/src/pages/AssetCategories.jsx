import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import toast from 'react-hot-toast';

export default function AssetCategories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [catName, setCatName] = useState('');
  const [catIcon, setCatIcon] = useState('Devices');
  const [catWarranty, setCatWarranty] = useState('12');
  const [catDesc, setCatDesc] = useState('');
  const [trackDep, setTrackDep] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await apiClient.get('/org/categories');
      setCategories(res.data || []);
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!catName.trim()) {
      toast.error('Category name is required');
      return;
    }
    
    try {
      const payload = {
        name: catName,
        custom_fields: {
          icon: catIcon,
          warranty: catWarranty,
          description: catDesc,
          track_depreciation: trackDep
        }
      };
      await apiClient.post('/org/categories', payload);
      toast.success('Category created successfully!');
      
      // Reset form
      setCatName('');
      setCatIcon('Devices');
      setCatWarranty('12');
      setCatDesc('');
      setTrackDep(false);
      setIsModalOpen(false);
      
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create category');
    }
  };

  const getIconDetails = (iconStr) => {
    switch(iconStr) {
      case 'Devices': return { icon: 'devices', container: 'bg-primary-container/20 text-primary', bg: 'bg-primary' };
      case 'Tools': return { icon: 'build', container: 'bg-secondary-container/20 text-secondary', bg: 'bg-secondary' };
      case 'Appliances': return { icon: 'kitchen', container: 'bg-tertiary-container/20 text-tertiary', bg: 'bg-tertiary' };
      case 'Infrastructure': return { icon: 'domain', container: 'bg-error-container/20 text-error', bg: 'bg-error' };
      default: return { icon: 'category', container: 'bg-primary-container/20 text-primary', bg: 'bg-primary' };
    }
  };

  return (
    <>
      {/* Breadcrumbs & Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <nav className="flex gap-2 text-xs font-semibold text-on-surface-variant mb-2">
            <span>Assets</span>
            <span>/</span>
            <span className="text-primary font-bold">Categories</span>
          </nav>
          <h2 className="font-bold text-3xl font-heading text-on-surface">Asset Categories</h2>
          <p className="text-sm text-on-surface-variant mt-1 font-medium">Manage and organize enterprise physical assets by type.</p>
        </div>
        <button 
          className="bg-primary text-white px-6 py-3 rounded-xl flex items-center gap-2 text-sm font-semibold hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-95" 
          onClick={() => setIsModalOpen(true)}
        >
          <span className="material-symbols-outlined text-xl">add</span>
          Add Category
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-on-surface-variant font-medium">Loading categories...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const iconKey = cat.custom_fields?.icon || 'Devices';
            const { icon, container, bg } = getIconDetails(iconKey);
            const warranty = cat.custom_fields?.warranty || 'N/A';
            const description = cat.custom_fields?.description || 'No description provided.';

            return (
              <div key={cat.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 hover:shadow-md transition-shadow group cursor-pointer">
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${container}`}>
                    <span className="material-symbols-outlined text-3xl">{icon}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    cat.status === 'active' ? 'bg-secondary-container/30 text-secondary border border-secondary/20' : 'bg-surface-container-high text-on-surface-variant'
                  }`}>
                    {cat.status}
                  </span>
                </div>
                <h3 className="font-bold text-xl font-heading mb-4 text-on-surface">{cat.name}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm font-medium text-on-surface-variant">
                    <span>Standard Warranty</span>
                    <span className="font-bold text-on-surface">{warranty} Months</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium text-on-surface-variant">
                    <span>Depreciation Tracking</span>
                    <span className="font-bold text-on-surface">{cat.custom_fields?.track_depreciation ? 'Enabled' : 'Disabled'}</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-4 overflow-hidden">
                    <div className={`${bg} h-full w-full rounded-full`}></div>
                  </div>
                  <p className="text-[11px] text-on-surface-variant pt-2 font-medium line-clamp-2" title={description}>{description}</p>
                </div>
              </div>
            );
          })}
          
          {/* Custom Category Placeholder */}
          <div 
            className="border-2 border-dashed border-outline-variant rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-surface-container-low transition-all cursor-pointer group" 
            onClick={() => setIsModalOpen(true)}
          >
            <div className="w-12 h-12 bg-surface-container rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-on-surface-variant">add_circle</span>
            </div>
            <h3 className="font-bold text-xl font-heading text-on-surface-variant mb-1">New Category</h3>
            <p className="text-xs font-semibold text-on-surface-variant">Create a custom tracking group for niche assets.</p>
          </div>
        </div>
      )}

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden mx-4 animate-fade-in">
            <div className="px-6 py-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <div>
                <h3 className="font-bold text-xl font-heading text-on-surface">Add New Category</h3>
                <p className="text-sm font-medium text-on-surface-variant mt-1">Define parameters for a new asset group.</p>
              </div>
              <button 
                className="p-2 hover:bg-surface-variant rounded-full transition-colors" 
                onClick={() => setIsModalOpen(false)}
              >
                <span className="material-symbols-outlined text-on-surface">close</span>
              </button>
            </div>
            
            <form className="p-6 space-y-6" onSubmit={handleCreateCategory}>
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">Category Name</label>
                <input 
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium" 
                  placeholder="e.g., HVAC Systems, Electronics" 
                  type="text"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Primary Icon</label>
                  <select 
                    value={catIcon}
                    onChange={(e) => setCatIcon(e.target.value)}
                    className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium"
                  >
                    <option value="Devices">Devices & Electronics</option>
                    <option value="Tools">Tools & Equipment</option>
                    <option value="Appliances">Appliances & Furniture</option>
                    <option value="Infrastructure">Infrastructure</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Base Warranty (Months)</label>
                  <input 
                    value={catWarranty}
                    onChange={(e) => setCatWarranty(e.target.value)}
                    className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium" 
                    type="number" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">Description</label>
                <textarea 
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none text-sm font-medium" 
                  placeholder="Briefly describe what assets fall under this category..." 
                  rows="3"
                ></textarea>
              </div>
              <div className="flex items-center gap-2 pt-2 cursor-pointer" onClick={() => setTrackDep(!trackDep)}>
                <input 
                  checked={trackDep}
                  readOnly
                  className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary bg-surface-container-low" 
                  type="checkbox"
                />
                <label className="text-sm font-medium text-on-surface cursor-pointer">
                  Enable automated depreciation tracking
                </label>
              </div>
              <div className="flex gap-3 pt-6 border-t border-outline-variant">
                <button 
                  type="button" 
                  className="flex-1 px-4 py-3 border border-outline-variant rounded-xl font-semibold text-on-surface hover:bg-surface-container transition-colors"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
