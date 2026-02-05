import React from 'react';
import { useStore } from '../../store/useStore';
import { Clip, Keyframe } from '../../utils/types';
import { Diamond } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export const PropertiesPanel: React.FC = () => {
    const { selectedClipIds, tracks, updateClip, currentTime } = useStore();

    let selectedClip: Clip | undefined;
    if (selectedClipIds.length > 0) {
        for (const track of tracks) {
            const found = track.clips.find(c => c.id === selectedClipIds[0]);
            if (found) {
                selectedClip = found;
                break;
            }
        }
    }

    if (!selectedClip) {
        return (
            <div className="p-5 text-text-muted text-center text-sm flex flex-col items-center justify-center h-full">
                <span>No selection</span>
            </div>
        );
    }

    const handleChange = (field: string, value: any) => {
        if (!selectedClip) return;
        updateClip(selectedClip.id, { [field]: value });
    };

    const handlePropChange = (prop: string, value: number) => {
        if (!selectedClip) return;
        const newProps = {
            ...selectedClip.properties,
            [prop]: { ...selectedClip.properties[prop as keyof typeof selectedClip.properties], value }
        };
        updateClip(selectedClip.id, { properties: newProps });
    };

    const addKeyframe = (prop: string) => {
        if (!selectedClip) return;
        const relativeTime = currentTime - selectedClip.start;
        // Logic remains same ...
        if (relativeTime < 0 || relativeTime > selectedClip.duration) return;

        const property = selectedClip.properties[prop as keyof typeof selectedClip.properties];
        const newKeyframe: Keyframe = {
            id: uuidv4(),
            time: relativeTime,
            value: property.value,
            easing: 'linear'
        };

        const newProps = {
            ...selectedClip.properties,
            [prop]: {
                ...property,
                keyframes: [...property.keyframes, newKeyframe]
            }
        };
        updateClip(selectedClip.id, { properties: newProps });
    };

    return (
        <div className="p-4 h-full overflow-y-auto">
            <div className="mb-4 pb-2 border-b border-border">
                <input
                    type="text"
                    value={selectedClip.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-text-primary focus:outline-none focus:border-accent border-b border-transparent placeholder-text-muted"
                />
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase text-text-secondary block">Start</label>
                        <input
                            type="number" step={0.1}
                            value={selectedClip.start}
                            onChange={(e) => handleChange('start', parseFloat(e.target.value))}
                            className="w-full bg-surface border border-border rounded px-2 py-1 text-xs text-text-primary focus:border-accent focus:outline-none"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase text-text-secondary block">Duration</label>
                        <input
                            type="number" step={0.1}
                            value={selectedClip.duration}
                            onChange={(e) => handleChange('duration', parseFloat(e.target.value))}
                            className="w-full bg-surface border border-border rounded px-2 py-1 text-xs text-text-primary focus:border-accent focus:outline-none"
                        />
                    </div>
                </div>

                <div className="h-px bg-border my-4" />

                <div className="text-xs font-medium text-accent mb-2">TRANSFORM</div>

                <PropertyControl
                    label="Opacity"
                    value={selectedClip.properties.opacity.value}
                    min={0} max={1} step={0.01}
                    onChange={(v) => handlePropChange('opacity', v)}
                    onAddKeyframe={() => addKeyframe('opacity')}
                    hasKeyframes={selectedClip.properties.opacity.keyframes.length > 0}
                />

                <PropertyControl
                    label="Scale"
                    value={selectedClip.properties.scale.value}
                    min={0} max={5} step={0.1}
                    onChange={(v) => handlePropChange('scale', v)}
                    onAddKeyframe={() => addKeyframe('scale')}
                    hasKeyframes={selectedClip.properties.scale.keyframes.length > 0}
                />

                <PropertyControl
                    label="Rotation"
                    value={selectedClip.properties.rotation.value}
                    min={0} max={360} step={1}
                    onChange={(v) => handlePropChange('rotation', v)}
                    onAddKeyframe={() => addKeyframe('rotation')}
                    hasKeyframes={selectedClip.properties.rotation.keyframes.length > 0}
                />
            </div>
        </div>
    );
};

interface PropertyControlProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (val: number) => void;
    onAddKeyframe: () => void;
    hasKeyframes: boolean;
}

const PropertyControl: React.FC<PropertyControlProps> = ({ label, value, min, max, step, onChange, onAddKeyframe, hasKeyframes }) => {
    return (
        <div className="space-y-1">
            <div className="flex justify-between items-center">
                <label className="text-[10px] uppercase text-text-secondary">{label}</label>
                <button
                    className={`p-1 rounded hover:bg-surface ${hasKeyframes ? 'text-accent' : 'text-text-muted hover:text-text-primary'}`}
                    onClick={onAddKeyframe}
                >
                    <Diamond size={10} fill={hasKeyframes ? "currentColor" : "none"} />
                </button>
            </div>
            <div className="flex items-center gap-2">
                <input
                    type="range"
                    min={min} max={max} step={step}
                    value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                    className="flex-1 h-1 bg-surface rounded-lg appearance-none cursor-pointer accent-accent"
                />
                <span className="text-[10px] font-mono text-text-secondary w-8 text-right">
                    {value.toFixed(step < 1 ? 2 : 0)}
                </span>
            </div>
        </div>
    );
};
