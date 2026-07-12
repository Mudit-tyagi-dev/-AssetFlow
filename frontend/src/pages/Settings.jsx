import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Settings() {
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    { id: 'light', name: 'Light', description: 'Classic clean light appearance.', icon: Sun },
    { id: 'dark', name: 'Dark', description: 'Sleek dark appearance, perfect for low light.', icon: Moon },
    { id: 'system', name: 'System (Default)', description: 'Automatically follow your system theme preference.', icon: Monitor }
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h2 className="font-bold text-3xl font-heading text-on-surface">System Settings</h2>
        <p className="text-sm text-on-surface-variant mt-1 font-medium">Configure preferences and preferences for your account.</p>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-heading font-bold text-on-surface mb-2">Appearance</h3>
        <p className="text-sm text-on-surface-variant mb-6 font-medium">Choose how AssetFlow looks on your device.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {themeOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.id;
            
            return (
              <button
                key={opt.id}
                onClick={() => setTheme(opt.id)}
                className={`p-5 rounded-2xl border text-left flex flex-col justify-between h-[150px] transition-all cursor-pointer relative group ${
                  isSelected 
                    ? 'border-primary bg-primary/5 shadow-sm' 
                    : 'border-outline-variant/60 bg-surface hover:bg-surface-container-low hover:border-outline-variant'
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <div className={`p-2 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant group-hover:text-primary transition-colors'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  {/* Custom radio indicator */}
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-primary' : 'border-outline'
                  }`}>
                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </div>
                </div>
                
                <div className="mt-4">
                  <span className="block font-bold text-sm text-on-surface">{opt.name}</span>
                  <span className="block text-[11px] text-on-surface-variant font-medium mt-1 leading-normal">{opt.description}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
