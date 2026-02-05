import React, { useRef, useEffect } from 'react';
import { Clip } from '../../utils/types';
import { useStore } from '../../store/useStore';

interface VideoRendererProps {
    clip: Clip;
    isActive: boolean;
}

export const VideoRenderer: React.FC<VideoRendererProps> = ({ clip, isActive }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { isPlaying, currentTime } = useStore();

    useEffect(() => {
        const video = videoRef.current;
        const container = containerRef.current;

        // Sync Video Time
        if (isActive && video) {
            const clipTime = currentTime - clip.start + clip.offset;
            if (Math.abs(video.currentTime - clipTime) > 0.1) {
                video.currentTime = clipTime;
            }

            if (isPlaying) {
                video.play().catch(() => { });
            } else {
                video.pause();
            }
        }

        // Apply properties transform to the container
        if (isActive && container) {
            container.style.opacity = clip.properties.opacity.value.toString();
            container.style.transform = `
                scale(${clip.properties.scale.value}) 
                rotate(${clip.properties.rotation.value}deg)
                translate(${clip.properties.positionX.value}px, ${clip.properties.positionY.value}px)
            `;
        }

    }, [isActive, isPlaying, currentTime, clip]);

    if (!isActive) return null;

    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <div
                ref={containerRef}
                className="w-full h-full flex items-center justify-center transform-gpu"
                style={{
                    willChange: 'transform, opacity',
                    transition: 'opacity 0.05s linear'
                }}
            >
                {clip.type === 'video' || clip.type === 'audio' ? (
                    <video
                        ref={videoRef}
                        src={clip.src}
                        className="w-full h-full object-contain"
                        muted={true} // Audio handled by global player
                        playsInline
                    />
                ) : clip.type === 'image' ? (
                    <img
                        src={clip.src}
                        className="w-full h-full object-contain"
                        alt={clip.name}
                    />
                ) : clip.type === 'text' ? (
                    <div className="text-white text-4xl font-bold drop-shadow-lg text-center whitespace-pre-wrap font-sans">
                        {clip.name}
                    </div>
                ) : null}
            </div>
        </div>
    );
};
