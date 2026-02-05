import React from 'react';
import { useStore } from '../../store/useStore';

export const Playhead: React.FC = () => {
    const { currentTime, zoom } = useStore();

    // Add scrollOffset logic here when implemented
    const left = currentTime * zoom;

    return (
        <div style={{
            position: 'absolute',
            left: `${left}px`,
            top: 0,
            bottom: 0,
            width: '1px',
            backgroundColor: 'var(--playhead-color)',
            zIndex: 50,
            pointerEvents: 'none'
        }}>
            <div style={{
                position: 'absolute',
                top: 0,
                left: '-6px',
                width: '13px',
                height: '13px',
                backgroundColor: 'var(--playhead-color)',
                clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)'
            }} />
            <div style={{
                height: '100%',
                width: '1px',
                backgroundColor: 'var(--playhead-color)',
                boxShadow: '0 0 4px rgba(255, 59, 48, 0.5)'
            }} />
        </div>
    );
};
