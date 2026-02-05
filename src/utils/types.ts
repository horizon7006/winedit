export type EasingType = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';

export interface Keyframe {
    id: string;
    time: number; // Relative time within the clip (in seconds)
    value: number;
    easing: EasingType;
}

export interface Property {
    value: number; // Base value if no keyframes
    keyframes: Keyframe[];
}

export interface ClipProperties {
    opacity: Property;
    scale: Property;
    rotation: Property;
    positionX: Property;
    positionY: Property;
}

export type ClipType = 'video' | 'image' | 'audio' | 'text';

export interface Clip {
    id: string;
    trackId: string;
    name: string;
    type: ClipType;
    src: string; // URL or path to media

    // Timing (in seconds)
    start: number; // Start time on the timeline
    duration: number; // Duration of the clip
    offset: number; // Start time within the source media

    properties: ClipProperties;
    isSelected?: boolean;
}

export interface Track {
    id: string;
    name: string;
    type: 'video' | 'audio';
    clips: Clip[];
    isMuted: boolean;
    isHidden: boolean;
    isLocked: boolean;
}
