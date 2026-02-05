import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Track, Clip } from '../utils/types';

interface State {
    // Player State
    currentTime: number;
    isPlaying: boolean;
    duration: number; // Total timeline duration
    zoom: number; // Pixels per second

    // Timeline State
    tracks: Track[];
    selectedClipIds: string[];
    mediaBin: Clip[]; // Storage for uploaded assets

    isProjectLoaded: boolean;
    isDirty: boolean;

    // Actions
    setPlaying: (isPlaying: boolean) => void;
    seek: (time: number) => void;
    setZoom: (zoom: number) => void;

    addTrack: (type: 'video' | 'audio') => void;
    removeTrack: (id: string) => void;

    addClip: (trackId: string, clip: Partial<Clip>) => void;
    removeClip: (clipId: string) => void;
    updateClip: (clipId: string, updates: Partial<Clip>) => void;

    selectClip: (id: string, exclusive?: boolean) => void;
    clearSelection: () => void;
    moveClip: (clipId: string, trackId: string, start: number) => void;
    splitClip: (clipId: string, splitTime: number) => void;

    addMedia: (media: Clip) => void; // Add file to bin

    setProject: (state: Partial<State>) => void;
    resetProject: () => void;
    markSaved: () => void;
}

export const useStore = create<State>((set) => ({
    // Initial Player State
    currentTime: 0,
    isPlaying: false,
    duration: 300,
    zoom: 50,

    // Initial Timeline State
    tracks: [
        {
            id: "track-1",
            name: "Video Track 1",
            type: "video",
            clips: [], // Empty initially
            isMuted: false,
            isHidden: false,
            isLocked: false
        },
        {
            id: "track-2",
            name: "Audio Track 1",
            type: "audio",
            clips: [], // Empty initially
            isMuted: false,
            isHidden: false,
            isLocked: false
        }
    ],
    selectedClipIds: [],
    mediaBin: [], // Empty initially

    isProjectLoaded: false,
    isDirty: false,

    // Actions
    setPlaying: (isPlaying) => set({ isPlaying }),

    seek: (time) => set({ currentTime: Math.max(0, time) }),

    setZoom: (zoom) => set({ zoom: Math.max(1, zoom) }),

    addTrack: (type) => set((state) => ({
        tracks: [
            ...state.tracks,
            {
                id: uuidv4(),
                name: `${type === 'video' ? 'Video' : 'Audio'} Track ${state.tracks.length + 1}`,
                type,
                clips: [],
                isMuted: false,
                isHidden: false,
                isLocked: false
            }
        ]
    })),

    removeTrack: (id) => set((state) => ({
        tracks: state.tracks.filter((t) => t.id !== id)
    })),

    addClip: (trackId, clip) => set((state) => {
        const newClip: Clip = {
            id: uuidv4(),
            trackId,
            name: clip.name || 'New Clip',
            type: clip.type || 'video',
            src: clip.src || '',
            start: clip.start || 0,
            duration: clip.duration || 10,
            offset: 0,
            properties: {
                opacity: { value: 1, keyframes: [] },
                scale: { value: 1, keyframes: [] },
                rotation: { value: 0, keyframes: [] },
                positionX: { value: 0, keyframes: [] },
                positionY: { value: 0, keyframes: [] },
                ...clip.properties
            },
            ...clip
        };

        return {
            tracks: state.tracks.map((track) => {
                if (track.id === trackId) {
                    return { ...track, clips: [...track.clips, newClip] };
                }
                return track;
            })
        };
    }),

    removeClip: (clipId) => set((state) => ({
        tracks: state.tracks.map((track) => ({
            ...track,
            clips: track.clips.filter((c) => c.id !== clipId)
        }))
    })),

    updateClip: (clipId, updates) => set((state) => ({
        tracks: state.tracks.map((track) => ({
            ...track,
            clips: track.clips.map((clip) =>
                clip.id === clipId ? { ...clip, ...updates } : clip
            )
        }))
    })),

    selectClip: (id, exclusive = true) => set((state) => ({
        selectedClipIds: exclusive ? [id] : [...state.selectedClipIds, id]
    })),

    clearSelection: () => set({ selectedClipIds: [] }),

    moveClip: (clipId, newTrackId, newStart) => set((state) => {
        let clipToMove: Clip | undefined;

        // 1. Remove from old track
        const tracksWithoutClip = state.tracks.map(track => {
            const clip = track.clips.find(c => c.id === clipId);
            if (clip) {
                clipToMove = { ...clip, trackId: newTrackId, start: Math.max(0, newStart) };
                return { ...track, clips: track.clips.filter(c => c.id !== clipId) };
            }
            return track;
        });

        if (!clipToMove) return { tracks: state.tracks };

        return {
            tracks: tracksWithoutClip.map(track => {
                if (track.id === newTrackId) {
                    return { ...track, clips: [...track.clips, clipToMove!] };
                }
                return track;
            })
        };
    }),

    splitClip: (clipId, splitTime) => set((state) => {
        let newTracks = [...state.tracks];
        let splitSuccess = false;

        newTracks = newTracks.map(track => {
            const clipIndex = track.clips.findIndex(c => c.id === clipId);
            if (clipIndex === -1) return track;

            const clip = track.clips[clipIndex];

            // Validate split time
            if (splitTime <= clip.start || splitTime >= clip.start + clip.duration) {
                return track;
            }

            const splitOffset = splitTime - clip.start;

            // 1. Update original clip (Left side)
            const leftClip = {
                ...clip,
                duration: splitOffset
            };

            // 2. Create new clip (Right side)
            const rightClip: Clip = {
                ...clip,
                id: uuidv4(),
                start: splitTime,
                duration: clip.duration - splitOffset,
                offset: clip.offset + splitOffset,
                isSelected: false // Only keep selection on left or clear both? Let's clear right.
            };

            const newClips = [...track.clips];
            newClips[clipIndex] = leftClip;
            newClips.push(rightClip);

            splitSuccess = true;
            return { ...track, clips: newClips };
        });

        if (!splitSuccess) return {};

        return { tracks: newTracks };
    }),

    addMedia: (media) => set((state) => ({
        mediaBin: [...state.mediaBin, media]
    })),

    setProject: (newState) => set((state) => ({ ...state, ...newState, isDirty: false, isProjectLoaded: true })),

    resetProject: () => set({
        tracks: [
            {
                id: "track-1",
                name: "Video Track 1",
                type: "video",
                clips: [],
                isMuted: false,
                isHidden: false,
                isLocked: false
            },
            {
                id: "track-2",
                name: "Audio Track 1",
                type: "audio",
                clips: [],
                isMuted: false,
                isHidden: false,
                isLocked: false
            }
        ],
        mediaBin: [],
        duration: 300,
        currentTime: 0,
        selectedClipIds: [],
        isDirty: false,
        isProjectLoaded: true
    }),

    markSaved: () => set({ isDirty: false })
}));
