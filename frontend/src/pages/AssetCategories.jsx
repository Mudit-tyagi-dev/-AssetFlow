import React, { useState } from 'react';

export default function AssetCategories() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categories = [
    {
      id: 1,
      title: 'IT Hardware',
      icon: 'laptop_mac',
      totalAssets: 432,
      warranty: '36 Months',
      progress: 'w-3/4',
      bgClass: 'bg-primary',
      iconContainer: 'bg-primary-container/10 text-primary group-hover:bg-primary group-hover:text-white',
      includes: 'Laptops, Servers, Monitors, Networking Gear'
    },
    {
      id: 2,
      title: 'Furniture',
      icon: 'chair',
      totalAssets: 812,
      warranty: '60 Months',
      progress: 'w-1/2',
      bgClass: 'bg-secondary',
      iconContainer: 'bg-secondary-container/20 text-secondary group-hover:bg-secondary group-hover:text-white',
      includes: 'Desks, Chairs, Filing Cabinets, Partitioning'
    },
    {
      id: 3,
      title: 'Vehicles',
      icon: 'local_shipping',
      totalAssets: 45,
      warranty: '48 Months',
      progress: 'w-1/4',
      bgClass: 'bg-tertiary',
      iconContainer: 'bg-tertiary-container/20 text-tertiary group-hover:bg-tertiary group-hover:text-white',
      includes: 'Delivery Vans, Corporate Fleet, Forklifts'
    },
    {
      id: 4,
      title: 'Industrial',
      icon: 'precision_manufacturing',
      totalAssets: 128,
      warranty: '24 Months',
      progress: 'w-[65%]',
      bgClass: 'bg-error',
      iconContainer: 'bg-error-container/20 text-error group-hover:bg-error group-hover:text-white',
      includes: 'CNC Machines, Conveyors, Packaging Units'
    },
    {
      id: 5,
      title: 'Mobile Devices',
      icon: 'smartphone',
      totalAssets: 156,
      warranty: '12 Months',
      progress: 'w-[40%]',
      bgClass: 'bg-primary',
      iconContainer: 'bg-primary-container/10 text-primary group-hover:bg-primary group-hover:text-white',
      includes: 'Smartphones, Tablets, Handheld Scanners'
    }
  ];

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
          className="bg-primary text-white px-6 py-3 rounded-xl flex items-center gap-2 text-sm font-semibold hover:bg-primary-container hover:text-on-primary-container shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-95" 
          onClick={() => setIsModalOpen(true)}
        >
          <span className="material-symbols-outlined text-xl">add</span>
          Add Category
        </button>
      </div>

      {/* Dashboard Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant flex flex-col">
          <span className="text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">Total Categories</span>
          <div className="flex items-end gap-2">
            <span className="font-bold text-3xl font-heading">24</span>
            <span className="text-emerald-600 text-xs font-semibold flex items-center mb-1"><span className="material-symbols-outlined text-[14px] mr-1">trending_up</span> +3</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant flex flex-col">
          <span className="text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">Total Assets</span>
          <div className="flex items-end gap-2">
            <span className="font-bold text-3xl font-heading">1,482</span>
            <span className="text-emerald-600 text-xs font-semibold flex items-center mb-1"><span className="material-symbols-outlined text-[14px] mr-1">trending_up</span> 12%</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant flex flex-col">
          <span className="text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">Warranty Value</span>
          <div className="flex items-end gap-2">
            <span className="font-bold text-3xl font-heading">$2.4M</span>
            <span className="text-on-surface-variant text-xs font-medium mb-1 italic">Covered</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant flex flex-col">
          <span className="text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">Avg. Asset Age</span>
          <div className="flex items-end gap-2">
            <span className="font-bold text-3xl font-heading">3.2</span>
            <span className="text-on-surface-variant text-xs font-semibold mb-1">Years</span>
          </div>
        </div>
      </div>

      {/* Categories Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 hover:shadow-md transition-shadow group cursor-pointer">
            <div className="flex justify-between items-start mb-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${cat.iconContainer}`}>
                <span className="material-symbols-outlined text-3xl">{cat.icon}</span>
              </div>
              <button className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">more_vert</span>
              </button>
            </div>
            <h3 className="font-bold text-xl font-heading mb-4 text-on-surface">{cat.title}</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm font-medium text-on-surface-variant">
                <span>Total Assets</span>
                <span className="font-bold text-on-surface">{cat.totalAssets}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium text-on-surface-variant">
                <span>Standard Warranty</span>
                <span className="font-bold text-on-surface">{cat.warranty}</span>
              </div>
              <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-4 overflow-hidden">
                <div className={`${cat.bgClass} h-full ${cat.progress} rounded-full`}></div>
              </div>
              <p className="text-[11px] text-on-surface-variant pt-2 font-medium">Includes: {cat.includes}</p>
            </div>
          </div>
        ))}
        
        {/* Custom Category Placeholder (Empty State) */}
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

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center transition-opacity duration-300">
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden transform transition-transform duration-300 mx-4">
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
            
            <form className="p-6 space-y-6" onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }}>
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">Category Name</label>
                <input 
                  className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium" 
                  placeholder="e.g., HVAC Systems" 
                  type="text"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Primary Icon</label>
                  <select className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium">
                    <option>Devices</option>
                    <option>Tools</option>
                    <option>Appliances</option>
                    <option>Infrastructure</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Base Warranty (Months)</label>
                  <input 
                    className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium" 
                    type="number" 
                    defaultValue="12"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">Description</label>
                <textarea 
                  className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none text-sm font-medium" 
                  placeholder="Briefly describe what assets fall under this category..." 
                  rows="3"
                ></textarea>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input 
                  className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary bg-surface-container-low" 
                  id="track-depreciation" 
                  type="checkbox"
                />
                <label className="text-sm font-medium text-on-surface" htmlFor="track-depreciation">
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
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-lg shadow-primary/20"
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
