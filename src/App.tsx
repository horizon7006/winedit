import { useState, useEffect } from "react";
import { AppShell } from "./components/layout/AppShell";
import { Video, Settings, Download, Loader2 } from "lucide-react";

import { Player } from "./components/preview/Player";
import Timeline from "./components/timeline";
import { Library } from "./components/library/Library";
import { PropertiesPanel } from "./components/properties/PropertiesPanel";
import { ExportModal } from "./components/export/ExportModal";
import { WelcomeScreen } from "./components/layout/WelcomeScreen";
import { SettingsModal } from "./components/settings/SettingsModal";

import { MenuBar } from "./components/layout/MenuBar";
import { useStore } from "./store/useStore";
import { Installer } from "./components/layout/Installer";

function App() {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // App Flow State
  const [showInstaller, setShowInstaller] = useState(() => {
    // Check if installed
    return localStorage.getItem('winedit_installed') !== 'true';
  });
  const [showWelcome, setShowWelcome] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Use store for dirty check
  const isDirty = useStore(state => state.isDirty);

  // Warning on close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = ''; // Required for legacy browsers
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (showInstaller) {
    return (
      <Installer onComplete={() => {
        setShowInstaller(false);
        // Start loading sequence after install
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 1500);
      }} />
    );
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-[200]">
        <div className="flex items-center gap-3 text-accent mb-4 animate-pulse">
          <Video size={48} />
          <span className="text-3xl font-bold tracking-tight text-white">WinEdit</span>
        </div>
        <Loader2 className="animate-spin text-text-secondary" size={24} />
        <p className="mt-4 text-text-muted text-sm">Initializing Studio...</p>
      </div>
    );
  }

  return (
    <>
      {showWelcome && <WelcomeScreen onDismiss={() => setShowWelcome(false)} />}

      <AppShell
        header={
          <div className="flex items-center gap-4 w-full">
            <div className="flex items-center gap-2 text-accent">
              <Video size={24} className="text-accent" />
              <span className="text-lg font-bold tracking-tight text-white">WinEdit</span>
            </div>

            <div className="h-6 w-px bg-border mx-2" />

            {/* Menu Bar */}
            <MenuBar onExport={() => setIsExportModalOpen(true)} />

            <div className="flex-1" />

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsExportModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-accent/10 text-accent hover:bg-accent/20 transition-colors text-sm font-medium"
              >
                <Download size={14} />
                <span>Export</span>
              </button>
              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="text-text-secondary hover:text-text-primary transition-colors p-2 rounded-full hover:bg-surface"
              >
                <Settings size={18} />
              </button>
            </div>
          </div>
        }
        mediaBin={
          <Library />
        }
        preview={
          <Player />
        }
        properties={
          <PropertiesPanel />
        }
        timeline={
          <Timeline />
        }
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </>
  );
}

export default App;
