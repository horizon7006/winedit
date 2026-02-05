import React, { useRef, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { VideoRenderer } from './VideoRenderer';
import { Clip } from '../../utils/types';

export const Player: React.FC = () => {
    const { isPlaying, currentTime, setPlaying, seek, duration, tracks } = useStore();

    // Playback loop
    useEffect(() => {
        let animationFrameId: number;
        let lastTime = performance.now();

        const loop = (time: number) => {
            if (isPlaying) {
                const delta = (time - lastTime) / 1000;
                lastTime = time;

                // Update time in store is too heavy for RAF?
                // Ideally we update a local ref for rendering and throttle store updates,
                // but for now let's try direct updates and see perf.
                // Actually, seeking updates state which triggers rerenders.
                // We might need to handle "tick" separately from "seek".
                // But for simplicity:

                const newTime = useStore.getState().currentTime + delta; // Access store directly to avoid stale closures?

                if (newTime >= duration) {
                    setPlaying(false);
                    seek(duration);
                } else {
                    seek(newTime);
                    animationFrameId = requestAnimationFrame(loop);
                }
            }
        };

        if (isPlaying) {
            lastTime = performance.now();
            animationFrameId = requestAnimationFrame(loop);
        }

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [isPlaying, duration, setPlaying, seek]);

    // Get active clips
    const { activeVideoClips, activeAudioClips } = React.useMemo(() => {
        const video: Clip[] = [];
        const audio: Clip[] = [];

        tracks.forEach(track => {
            if (track.isHidden || track.isMuted) return; // Skip if muted/hidden

            track.clips.forEach(clip => {
                // Simple intersection check
                if (currentTime >= clip.start && currentTime < clip.start + clip.duration) {
                    if (track.type === 'video') video.push(clip);
                    if (track.type === 'audio') audio.push(clip);
                }
            });
        });
        return { activeVideoClips: video, activeAudioClips: audio };
    }, [tracks, currentTime]);

    // Audio Ref Management
    // We need to sync audio elements to current time
    const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());

    return (
        <div className="flex flex-col h-full bg-background">
            <div className="flex-1 flex items-center justify-center overflow-hidden bg-black relative">
                {/* Render Active Video Clips */}
                <div className="relative w-full h-full">
                    {activeVideoClips.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-text-muted select-none">
                            NO SIGNAL
                        </div>
                    )}

                    {activeVideoClips.map(clip => (
                        <VideoRenderer key={clip.id} clip={clip} isActive={true} />
                    ))}

                    {/* Render Audio Elements (Invisible) */}
                    {activeAudioClips.map(clip => (
                        <audio
                            key={clip.id}
                            src={clip.src}
                            ref={el => {
                                if (el) {
                                    audioRefs.current.set(clip.id, el);
                                    const expectedTime = currentTime - clip.start + clip.offset;

                                    // Sync if drifted
                                    if (Math.abs(el.currentTime - expectedTime) > 0.2) {
                                        el.currentTime = expectedTime;
                                    }

                                    el.volume = 1;

                                    // Play/Pause sync
                                    if (isPlaying) {
                                        // Only play if ready
                                        el.play().catch(() => { });
                                    } else {
                                        el.pause();
                                    }
                                } else {
                                    audioRefs.current.delete(clip.id);
                                }
                            }}
                        />
                    ))}

                    {/* Overlay Info (Optional) */}
                    <div className="absolute bottom-4 right-4 text-xs font-mono text-white/50 pointer-events-none">
                        PREVIEW
                    </div>
                </div>
            </div>

            <div className="h-12 border-t border-border bg-panel flex items-center justify-between px-4 shrink-0">
                <div className="flex-1"></div>

                <div className="flex items-center gap-4">
                    <button className="text-text-secondary hover:text-text-primary transition-colors" onClick={() => seek(0)}>
                        <SkipBack size={20} />
                    </button>
                    <button
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-text-primary text-background hover:bg-white hover:scale-105 transition-all"
                        onClick={() => setPlaying(!isPlaying)}
                    >
                        {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
                    </button>
                    <button className="text-text-secondary hover:text-text-primary transition-colors" onClick={() => seek(duration)}>
                        <SkipForward size={20} />
                    </button>
                </div>

                <div className="flex-1 text-right">
                    <span className="font-mono text-xs text-text-secondary">
                        {new Date(currentTime * 1000).toISOString().substr(14, 5)}
                        <span className="mx-1 text-text-muted">/</span>
                        {new Date(duration * 1000).toISOString().substr(14, 5)}
                    </span>
                </div>
            </div>
        </div>
    );
};
