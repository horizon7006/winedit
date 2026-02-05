import React from 'react';
import { X, Moon, Monitor, Save } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-panel border border-border rounded-xl shadow-2xl w-[500px] overflow-hidden">
                <div className="p-4 border-b border-border flex justify-between items-center bg-surface">
                    <h2 className="text-sm font-semibold text-text-primary">Settings</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                        <X size={16} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Appearance */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-semibold text-text-muted uppercase">Appearance</h3>
                        <div className="flex gap-3">
                            <button className="flex-1 p-3 rounded-lg border border-accent bg-accent/10 flex flex-col items-center gap-2 text-accent">
                                <Moon size={20} />
                                <span className="text-xs font-medium">Dark Mode</span>
                            </button>
                            <button className="flex-1 p-3 rounded-lg border border-border bg-background flex flex-col items-center gap-2 text-text-secondary hover:border-text-muted hover:text-text-primary transition-all opacity-50 cursor-not-allowed" title="Not available yet">
                                <Monitor size={20} />
                                <span className="text-xs font-medium">System</span>
                            </button>
                        </div>
                    </div>

                    {/* General */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-semibold text-text-muted uppercase">General</h3>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
                            <div className="flex items-center gap-3">
                                <Save size={18} className="text-text-secondary" />
                                <div>
                                    <div className="text-sm font-medium text-text-primary">Autosave</div>
                                    <div className="text-[10px] text-text-muted">Save project every 5 minutes</div>
                                </div>
                            </div>
                            <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-accent duration-200 ease-in" />
                                <label htmlFor="toggle" className="toggle-label block overflow-hidden h-5 rounded-full bg-surface cursor-pointer border border-border"></label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-surface border-t border-border flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-medium bg-accent text-white rounded hover:bg-accent-hover transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};
