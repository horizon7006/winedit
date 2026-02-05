import React, { useRef } from 'react';
import { useStore } from '../../store/useStore';
import { Track } from './Track';
import { Ruler, RulerHandle } from './Ruler';
import { Playhead } from './Playhead';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { Scissors } from 'lucide-react';

export const Timeline: React.FC = () => {
    const { tracks, duration, zoom, moveClip, addClip, selectedClipIds, splitClip, currentTime } = useStore();
    const rulerRef = useRef<RulerHandle>(null);

    const handleSplit = () => {
        if (selectedClipIds.length === 0) return;
        // Split all selected clips at current time
        selectedClipIds.forEach(id => {
            splitClip(id, currentTime);
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over, delta } = event;

        if (active && over) {
            const clipId = active.id as string;
            const newTrackId = over.id as string;
            const clipData = active.data.current?.clip;

            if (clipData) {
                const deltaSeconds = delta.x / zoom;
                const newStart = clipData.start + deltaSeconds;
                moveClip(clipId, newTrackId, newStart);
            }
        }
    };

    // Handle dropping media from library
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'copy';
    };

    const handleDrop = (e: React.DragEvent, trackId: string) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('application/json');
        if (!data) return;

        try {
            const asset = JSON.parse(data);

            // Calculate drop time
            const timelineRect = e.currentTarget.getBoundingClientRect();
            // We need to account for scroll position if we dropped on the container, 
            // but here we are dropping on a track div which moves with scroll?
            // Actually the current structure is:
            // Scrollable Area -> Relative Container -> Absolute Tracks
            // If we drop on the Track div, it is absolute positioned.
            // X position inside the track div:
            const clickX = e.clientX - timelineRect.left;
            const startTime = clickX / zoom;

            if (asset && asset.type) {
                // We add it as a new clip
                addClip(trackId, {
                    ...asset,
                    id: crypto.randomUUID(), // New ID
                    start: Math.max(0, startTime),
                });
            }
        } catch (err) {
            console.error("Failed to parse dropped data", err);
        }
    };

    // Sync scrolling
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        if (rulerRef.current) {
            rulerRef.current.draw(e.currentTarget.scrollLeft);
        }
    };

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="flex flex-col h-full relative font-sans text-xs">
                {/* Toolbar */}
                <div className="h-8 bg-surface border-b border-border flex items-center px-4 gap-2">
                    <button
                        onClick={handleSplit}
                        className={`p-1 rounded hover:bg-white/10 transition-colors ${selectedClipIds.length === 0 ? 'opacity-50 cursor-not-allowed' : 'text-text-primary'}`}
                        title="Split Clip (S)"
                        disabled={selectedClipIds.length === 0}
                    >
                        <Scissors size={14} />
                    </button>
                    {/* Placeholder for other tools */}
                </div>

                {/* Header / Ruler */}
                <div className="flex h-[30px] bg-panel border-b border-border shrink-0">
                    <div className="w-[200px] min-w-[200px] border-r border-border shrink-0 bg-panel z-10 shadow-sm"></div>
                    <div className="flex-1 overflow-hidden relative">
                        <div className="absolute inset-0">
                            <Ruler ref={rulerRef} />
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Track Headers Container */}
                    <div className="w-[200px] min-w-[200px] border-r border-border bg-panel flex flex-col overflow-hidden z-20 shadow-[4px_0_24px_-4px_rgba(0,0,0,0.3)]">
                        <div className="overflow-hidden h-full relative">
                            {tracks.map(track => (
                                <Track key={track.id} track={track} variant="header" />
                            ))}
                        </div>
                    </div>

                    {/* Timeline Tracks Content */}
                    <div
                        className="flex-1 overflow-auto bg-background relative custom-scrollbar"
                        onScroll={handleScroll}
                    >
                        <div
                            style={{
                                width: `${Math.max(1000, duration * zoom)}px`,
                                height: `${Math.max(tracks.length * 64, 100)}px`
                            }}
                            className="relative"
                        >
                            <Playhead />

                            {tracks.map((track, i) => (
                                <div
                                    key={track.id}
                                    className="absolute left-0 right-0 h-16 pointer-events-auto"
                                    style={{ top: `${i * 64}px` }}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, track.id)}
                                >
                                    <Track
                                        track={track}
                                        variant="content"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </DndContext>
    );
};

export default Timeline;
