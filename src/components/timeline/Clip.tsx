import React from 'react';
import { Clip as ClipType } from '../../utils/types';
import { useStore } from '../../store/useStore';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '../../utils/dnd';

interface ClipProps {
    clip: ClipType;
}

export const Clip: React.FC<ClipProps> = ({ clip }) => {
    const { zoom, selectClip, selectedClipIds } = useStore();
    const isSelected = selectedClipIds.includes(clip.id);

    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: clip.id,
        data: {
            type: 'clip',
            clip
        }
    });

    const style: React.CSSProperties = {
        position: 'absolute',
        left: `${clip.start * zoom}px`,
        width: `${clip.duration * zoom}px`,
        top: '4px',
        bottom: '4px',
        transform: CSS.Translate.toString(transform),
        touchAction: 'none',
    };

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        selectClip(clip.id, !e.shiftKey);
    };

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            style={style}
            onClick={handleClick}
            className={`
            border rounded flex items-center px-2 cursor-grab text-[11px] whitespace-nowrap overflow-hidden transition-colors font-medium z-10
            ${isSelected
                    ? 'bg-accent border-white text-white z-20'
                    : 'bg-surface border-border text-text-primary hover:bg-zinc-700'
                }
        `}
        >
            <span>{clip.name}</span>
        </div>
    );
};
