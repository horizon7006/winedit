import { Keyframe } from './types';

export const EasingFunctions = {
    linear: (t: number) => t,
    easeIn: (t: number) => t * t,
    easeOut: (t: number) => t * (2 - t),
    easeInOut: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
};

export function interpolate(value: number, keyframes: Keyframe[], currentTime: number): number {
    if (!keyframes || keyframes.length === 0) {
        return value;
    }

    // Sort keyframes by time just in case
    const sorted = [...keyframes].sort((a, b) => a.time - b.time);

    // If time is before first keyframe, return first keyframe value
    if (currentTime <= sorted[0].time) {
        return sorted[0].value;
    }

    // If time is after last keyframe, return last keyframe value
    if (currentTime >= sorted[sorted.length - 1].time) {
        return sorted[sorted.length - 1].value;
    }

    // Find the segment we are in
    for (let i = 0; i < sorted.length - 1; i++) {
        const k1 = sorted[i];
        const k2 = sorted[i + 1];

        if (currentTime >= k1.time && currentTime < k2.time) {
            const duration = k2.time - k1.time;
            const progress = (currentTime - k1.time) / duration;
            const easedProgress = EasingFunctions[k1.easing || 'linear'](progress);

            return k1.value + (k2.value - k1.value) * easedProgress;
        }
    }

    return value;
}
