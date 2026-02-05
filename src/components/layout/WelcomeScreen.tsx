import React, { useRef } from 'react';
import { useStore } from '../../store/useStore';
import { Video, FilePlus, FolderOpen } from 'lucide-react';

interface WelcomeScreenProps {
    onDismiss: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onDismiss }) => {
    const { setProject, resetProject } = useStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleNewProject = () => {
        resetProject();
        onDismiss();
    };

    const handleOpenProject = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                if (json.version && json.tracks) {
                    setProject({
                        tracks: json.tracks,
                        duration: json.duration || 300,
                        currentTime: 0,
                        isPlaying: false,
                        selectedClipIds: []
                    });
                    onDismiss();
                } else {
                    alert("Invalid project file format");
                }
            } catch (err) {
                alert("Failed to parse project file");
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background text-text-primary">
            <div className="w-[800px] h-[500px] bg-panel border border-border rounded-xl shadow-2xl flex overflow-hidden">
                {/* Left Side - Banner */}
                <div className="w-1/3 bg-surface border-r border-border p-8 flex flex-col justify-between relative overflow-hidden">
                    <div className="z-10 relative">
                        <div className="flex items-center gap-2 text-accent mb-6">
                            <Video size={40} />
                            <span className="text-2xl font-bold tracking-tight text-white">WinEdit</span>
                        </div>
                        <div className="text-sm text-text-muted">
                            <p className="mb-2">Version 0.2.0 (Beta)</p>
                            <p>Windows Animation Editing Tool.</p>
                        </div>
                    </div>

                    {/* Decorative Blob */}
                    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
                </div>

                {/* Right Side - Actions */}
                <div className="flex-1 p-12 flex flex-col justify-center">
                    <h2 className="text-2xl font-semibold mb-8 text-white">Get Started</h2>

                    <div className="grid grid-cols-1 gap-4">
                        <button
                            onClick={handleNewProject}
                            className="flex items-center gap-4 p-6 rounded-lg border border-border bg-surface hover:bg-accent/5 hover:border-accent transition-all group text-left"
                        >
                            <div className="p-3 rounded-full bg-background border border-border group-hover:border-accent group-hover:text-accent transition-colors">
                                <FilePlus size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-text-primary group-hover:text-white transition-colors">New Project</h3>
                                <p className="text-sm text-text-secondary">Start creating from scratch</p>
                            </div>
                        </button>

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-4 p-6 rounded-lg border border-border bg-surface hover:bg-accent/5 hover:border-accent transition-all group text-left"
                        >
                            <div className="p-3 rounded-full bg-background border border-border group-hover:border-accent group-hover:text-accent transition-colors">
                                <FolderOpen size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-text-primary group-hover:text-white transition-colors">Open Project</h3>
                                <p className="text-sm text-text-secondary">Load a .wne project file</p>
                            </div>
                        </button>
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".wne,.json" // Accept both for backward compat but focus on .wne
                        onChange={handleOpenProject}
                    />

                    <div className="mt-auto pt-8 text-center">
                        <p className="text-xs text-text-secondary">
                            Recent projects coming soon...
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
