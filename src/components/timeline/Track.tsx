import React from 'react';
import { Track as TrackType } from '../../utils/types';
import { Clip } from './Clip';
import { Eye, EyeOff, Volume2, VolumeX, Lock, Unlock } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';

interface TrackProps {
    track: TrackType;
    variant?: 'full' | 'header' | 'content';
    onDragOver?: (e: React.DragEvent) => void;
    onDrop?: (e: React.DragEvent) => void;
}

export const Track: React.FC<TrackProps> = ({ track, variant = 'full', ...props }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: track.id,
        data: {
            type: 'track',
            track
        },
        disabled: variant === 'header' // Disable drop if only header
    });

    const showHeader = variant === 'full' || variant === 'header';
    const showContent = variant === 'full' || variant === 'content';

    return (
        <div className={`flex h-16 ${variant === 'full' || variant === 'header' ? 'border-b border-border' : ''}`}>
            {/* Track Header */}
            {showHeader && (
                <div className={`${variant === 'full' ? 'w-[200px] min-w-[200px] border-r' : 'w-full'} bg-panel border-border px-3 flex items-center justify-between z-20 shrink-0`}>
                    <div className="text-[13px] font-medium truncate text-text-secondary select-none">
                        {track.name}
                    </div>
                    <div className="flex gap-1.5">
                        <button className="p-1 rounded text-text-muted hover:bg-surface hover:text-text-primary transition-colors">
                            {track.isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button className="p-1 rounded text-text-muted hover:bg-surface hover:text-text-primary transition-colors">
                            {track.isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                        </button>
                        <button className="p-1 rounded text-text-muted hover:bg-surface hover:text-text-primary transition-colors">
                            {track.isLocked ? <Lock size={14} /> : <Unlock size={14} />}
                        </button>
                    </div>
                </div>
            )}

            {/* Track Content */}
            {showContent && (
                <div
                    ref={setNodeRef}
                    onDragOver={props.onDragOver}
                    onDrop={props.onDrop}
                    className={`
                ${variant === 'full' ? 'flex-1' : 'w-full h-full'} 
                relative 
                transition-colors 
                ${isOver ? 'bg-white/5' : 'bg-opacity-50'}
                ${variant === 'content' ? 'border-b border-border/50' : ''}
            `}
                >
                    {track.clips.map((clip) => (
                        <Clip key={clip.id} clip={clip} />
                    ))}
                </div>
            )}
        </div>
    );
};
