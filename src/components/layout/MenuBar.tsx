import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/useStore';

interface MenuBarProps {
    onExport: () => void;
}

export const MenuBar: React.FC<MenuBarProps> = ({ onExport }) => {
    const {
        resetProject,
        setProject,
        selectedClipIds,
        removeClip,
        splitClip,
        currentTime,
        zoom,
        setZoom
    } = useStore();

    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setActiveMenu(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMenuClick = (menu: string) => {
        setActiveMenu(activeMenu === menu ? null : menu);
    };

    const handleAction = (action: () => void) => {
        action();
        setActiveMenu(null);
    };

    const handleOpenProject = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                if (json.version && json.tracks) {
                    // Basic validation pass
                    setProject({
                        tracks: json.tracks,
                        duration: json.duration || 300,
                        // Reset player state
                        currentTime: 0,
                        isPlaying: false,
                        selectedClipIds: []
                    });
                } else {
                    alert("Invalid project file");
                }
            } catch (err) {
                alert("Failed to parse project file");
            }
        };
        reader.readAsText(file);
        event.target.value = ''; // Reset input
        setActiveMenu(null);
    };

    const handleDelete = () => {
        selectedClipIds.forEach(id => removeClip(id));
    };

    const handleSplit = () => {
        selectedClipIds.forEach(id => splitClip(id, currentTime));
    };

    return (
        <div className="flex gap-1 text-sm text-text-secondary h-full items-center relative" ref={menuRef}>
            {/* FILE MENU */}
            <div className="relative">
                <button
                    className={`px-3 py-1 hover:text-text-primary hover:bg-surface rounded-sm transition-colors ${activeMenu === 'file' ? 'bg-surface text-text-primary' : ''}`}
                    onClick={() => handleMenuClick('file')}
                >
                    File
                </button>
                {activeMenu === 'file' && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-panel border border-border rounded-md shadow-xl py-1 z-50">
                        <button
                            className="w-full text-left px-4 py-2 hover:bg-surface text-text-primary text-xs"
                            onClick={() => handleAction(() => {
                                if (confirm("Create new project? Unsaved changes will be lost.")) {
                                    resetProject();
                                }
                            })}
                        >
                            New Project
                        </button>
                        <button
                            className="w-full text-left px-4 py-2 hover:bg-surface text-text-primary text-xs"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            Open Project...
                        </button>
                        <div className="h-px bg-border my-1" />
                        <button
                            className="w-full text-left px-4 py-2 hover:bg-surface text-text-primary text-xs"
                            onClick={() => handleAction(onExport)}
                        >
                            Export...
                        </button>
                    </div>
                )}
            </div>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".json,.wne"
                onChange={handleOpenProject}
            />

            {/* EDIT MENU */}
            <div className="relative">
                <button
                    className={`px-3 py-1 hover:text-text-primary hover:bg-surface rounded-sm transition-colors ${activeMenu === 'edit' ? 'bg-surface text-text-primary' : ''}`}
                    onClick={() => handleMenuClick('edit')}
                >
                    Edit
                </button>
                {activeMenu === 'edit' && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-panel border border-border rounded-md shadow-xl py-1 z-50">
                        <button
                            className="w-full text-left px-4 py-2 hover:bg-surface text-text-primary text-xs flex justify-between"
                            onClick={() => handleAction(handleSplit)}
                            disabled={selectedClipIds.length === 0}
                        >
                            <span>Split Clip</span>
                            <span className="text-text-muted">S</span>
                        </button>
                        <button
                            className="w-full text-left px-4 py-2 hover:bg-surface text-text-primary text-xs flex justify-between"
                            onClick={() => handleAction(handleDelete)}
                            disabled={selectedClipIds.length === 0}
                        >
                            <span>Delete</span>
                            <span className="text-text-muted">Del</span>
                        </button>
                    </div>
                )}
            </div>

            {/* VIEW MENU */}
            <div className="relative">
                <button
                    className={`px-3 py-1 hover:text-text-primary hover:bg-surface rounded-sm transition-colors ${activeMenu === 'view' ? 'bg-surface text-text-primary' : ''}`}
                    onClick={() => handleMenuClick('view')}
                >
                    View
                </button>
                {activeMenu === 'view' && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-panel border border-border rounded-md shadow-xl py-1 z-50">
                        <button
                            className="w-full text-left px-4 py-2 hover:bg-surface text-text-primary text-xs flex justify-between"
                            onClick={() => handleAction(() => setZoom(zoom * 1.2))}
                        >
                            <span>Zoom In</span>
                            <span className="text-text-muted">+</span>
                        </button>
                        <button
                            className="w-full text-left px-4 py-2 hover:bg-surface text-text-primary text-xs flex justify-between"
                            onClick={() => handleAction(() => setZoom(zoom / 1.2))}
                        >
                            <span>Zoom Out</span>
                            <span className="text-text-muted">-</span>
                        </button>
                        <button
                            className="w-full text-left px-4 py-2 hover:bg-surface text-text-primary text-xs"
                            onClick={() => handleAction(() => setZoom(50))}
                        >
                            Reset Zoom
                        </button>
                    </div>
                )}
            </div>

            {/* HELP MENU */}
            <div className="relative">
                <button
                    className={`px-3 py-1 hover:text-text-primary hover:bg-surface rounded-sm transition-colors ${activeMenu === 'help' ? 'bg-surface text-text-primary' : ''}`}
                    onClick={() => handleMenuClick('help')}
                >
                    Help
                </button>
                {activeMenu === 'help' && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-panel border border-border rounded-md shadow-xl py-1 z-50">
                        <button
                            className="w-full text-left px-4 py-2 hover:bg-surface text-text-primary text-xs"
                            onClick={() => handleAction(() => alert("WinEdit v0.2.0\n\nA modern web-based video editor."))}
                        >
                            About WinEdit
                        </button>
                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full text-left px-4 py-2 hover:bg-surface text-text-primary text-xs"
                            onClick={() => setActiveMenu(null)}
                        >
                            Documentation
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};
