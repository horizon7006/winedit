import React, { useState, useEffect } from 'react';
import { Video } from 'lucide-react';

interface InstallerProps {
    onComplete: () => void;
}

export const Installer: React.FC<InstallerProps> = ({ onComplete }) => {
    const [step, setStep] = useState(1);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (step === 3) {
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        setTimeout(() => setStep(4), 500);
                        return 100;
                    }
                    return prev + Math.random() * 5;
                });
            }, 100);
            return () => clearInterval(interval);
        }
    }, [step]);

    const handleInstall = () => {
        localStorage.setItem('winedit_installed', 'true');
        onComplete();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#000080] text-white font-mono selection:bg-white selection:text-blue-900">
            {/* Retro BSOD-style / Setup background */}

            <div className="w-[600px] bg-[#c0c0c0] text-black border-2 border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] flex flex-col font-sans">
                {/* Title Bar */}
                <div className="bg-[#000080] text-white px-2 py-1 flex justify-between items-center font-bold text-sm">
                    <span>WinEdit Setup</span>
                    <button className="bg-[#c0c0c0] text-black w-4 h-4 flex items-center justify-center text-[10px] leading-none border border-b-black border-r-black border-t-white border-l-white active:border-t-black active:border-l-black active:border-b-white active:border-r-white">
                        X
                    </button>
                </div>

                <div className="p-1">
                    <div className="flex bg-white h-[400px] border border-b-white border-r-white border-t-[#808080] border-l-[#808080]">
                        {/* Sidebar */}
                        <div className="w-40 bg-[#000080] text-white p-4 flex flex-col gap-4">
                            <div className="flex flex-col items-center gap-2 mb-4">
                                <Video size={32} />
                                <span className="font-bold text-lg">WinEdit</span>
                            </div>
                            <div className={`text-xs ${step === 1 ? 'font-bold text-yellow-300' : 'opacity-70'}`}>1. Welcome</div>
                            <div className={`text-xs ${step === 2 ? 'font-bold text-yellow-300' : 'opacity-70'}`}>2. Components</div>
                            <div className={`text-xs ${step === 3 ? 'font-bold text-yellow-300' : 'opacity-70'}`}>3. Installing</div>
                            <div className={`text-xs ${step === 4 ? 'font-bold text-yellow-300' : 'opacity-70'}`}>4. Finish</div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-8 flex flex-col">
                            {step === 1 && (
                                <>
                                    <h2 className="text-xl font-bold mb-4">Welcome to WinEdit Setup</h2>
                                    <p className="mb-4 text-sm">This wizard will guide you through the installation of WinEdit, the premium retro video editor.</p>
                                    <p className="mb-4 text-sm">It is recommended that you close all other applications before starting Setup.</p>
                                    <div className="mt-auto flex justify-end">
                                        <button
                                            onClick={() => setStep(2)}
                                            className="px-6 py-1 bg-[#c0c0c0] border-2 border-b-black border-r-black border-t-white border-l-white active:border-t-black active:border-l-black active:border-b-white active:border-r-white text-sm"
                                        >
                                            Next &gt;
                                        </button>
                                    </div>
                                </>
                            )}

                            {step === 2 && (
                                <>
                                    <h2 className="text-xl font-bold mb-4">Select Components</h2>
                                    <p className="mb-4 text-sm">Select the components you want to install:</p>

                                    <div className="border border-[#808080] p-2 bg-white mb-4 h-32 overflow-y-auto">
                                        <div className="flex items-center gap-2 mb-2">
                                            <input type="checkbox" checked readOnly />
                                            <span className="text-sm">WinEdit Core Files (Required)</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input type="checkbox" defaultChecked />
                                            <span className="text-sm">Starter Asset Pack</span>
                                        </div>
                                    </div>

                                    <div className="text-xs text-[#808080] mb-4">
                                        <div className="flex justify-between">
                                            <span>Space required:</span>
                                            <span>38.0 MB</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Space available:</span>
                                            <span>Unknown</span>
                                        </div>
                                    </div>

                                    {/* Fake Download Link/Button */}
                                    <div className="border border-[#808080] p-2 bg-[#f0f0f0] mb-4">
                                        <p className="text-xs mb-1">Starter Pack Location:</p>
                                        <code className="text-[10px] break-all block bg-white border border-[#808080] p-1 select-all">
                                            ./StarterPack
                                        </code>
                                        <p className="text-[10px] text-[#808080] mt-1">* Verify this folder exists in your directory.</p>
                                    </div>

                                    <div className="mt-auto flex justify-end gap-2">
                                        <button
                                            onClick={() => setStep(1)}
                                            className="px-6 py-1 bg-[#c0c0c0] border-2 border-b-black border-r-black border-t-white border-l-white active:border-t-black active:border-l-black active:border-b-white active:border-r-white text-sm"
                                        >
                                            &lt; Back
                                        </button>
                                        <button
                                            onClick={() => setStep(3)}
                                            className="px-6 py-1 bg-[#c0c0c0] border-2 border-b-black border-r-black border-t-white border-l-white active:border-t-black active:border-l-black active:border-b-white active:border-r-white text-sm font-bold"
                                        >
                                            Install
                                        </button>
                                    </div>
                                </>
                            )}

                            {step === 3 && (
                                <>
                                    <h2 className="text-xl font-bold mb-4">Installing</h2>
                                    <p className="mb-2 text-sm">Please wait while WinEdit is being installed...</p>

                                    <div className="mb-1 text-xs">Copying files...</div>
                                    <div className="w-full h-6 border border-[#808080] bg-white p-0.5 relative">
                                        <div
                                            className="h-full bg-[#000080]"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>

                                    <div className="mt-auto flex justify-end">
                                        <button
                                            disabled
                                            className="px-6 py-1 bg-[#c0c0c0] border-2 border-[#808080] text-[#808080] text-sm"
                                        >
                                            Next &gt;
                                        </button>
                                    </div>
                                </>
                            )}

                            {step === 4 && (
                                <>
                                    <h2 className="text-xl font-bold mb-4">Installation Complete</h2>
                                    <p className="mb-4 text-sm">WinEdit has been successfully installed on your computer.</p>

                                    <div className="flex items-center gap-2 mb-4">
                                        <input type="checkbox" defaultChecked />
                                        <span className="text-sm">Launch WinEdit</span>
                                    </div>

                                    <div className="mt-auto flex justify-end">
                                        <button
                                            onClick={handleInstall}
                                            className="px-6 py-1 bg-[#c0c0c0] border-2 border-b-black border-r-black border-t-white border-l-white active:border-t-black active:border-l-black active:border-b-white active:border-r-white text-sm"
                                        >
                                            Finish
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
