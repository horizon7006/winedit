import React from 'react';
import { Panel } from './Panel';

interface AppShellProps {
    header: React.ReactNode;
    mediaBin: React.ReactNode;
    preview: React.ReactNode;
    properties: React.ReactNode;
    timeline: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
    header,
    mediaBin,
    preview,
    properties,
    timeline
}) => {
    return (
        <div className="flex flex-col w-screen h-screen bg-background overflow-hidden">
            {/* Header */}
            <header className="h-12 border-b border-border bg-panel flex items-center px-4 shrink-0 z-50">
                {header}
            </header>

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left: Media Bin */}
                <div className="w-[350px] border-r border-border h-full flex flex-col shrink-0">
                    <Panel title="Media Bin">
                        {mediaBin}
                    </Panel>
                </div>

                {/* Center/Right: Preview & Properties */}
                <div className="flex flex-1 h-full flex-col min-w-0">
                    <div className="flex flex-1 min-h-0">
                        {/* Center: Preview */}
                        <div className="flex-1 border-r border-border min-w-0">
                            <Panel title="Preview">
                                {preview}
                            </Panel>
                        </div>

                        {/* Right: Properties */}
                        <div className="w-[300px] h-full shrink-0">
                            <Panel title="Properties">
                                {properties}
                            </Panel>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom: Timeline */}
            <div className="h-[300px] border-t border-border bg-panel shrink-0">
                <Panel title="Timeline">
                    {timeline}
                </Panel>
            </div>
        </div>
    );
};
