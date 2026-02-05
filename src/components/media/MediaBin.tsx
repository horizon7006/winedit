import { useRef } from 'react';
import { useStore } from '../../store/useStore';
import { Video, Image, Music, FilePlus, Type } from 'lucide-react';
import { ClipType, Clip } from '../../utils/types';
import { v4 as uuidv4 } from 'uuid';

export const MediaBin: React.FC = () => {
    const { addClip, tracks, addMedia, mediaBin } = useStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragStart = (e: React.DragEvent, asset: Clip) => {
        e.dataTransfer.setData('application/json', JSON.stringify(asset));
        e.dataTransfer.effectAllowed = 'copyMove';
    };

    const handleDoubleClick = (asset: Clip) => {
        // Map asset types to track types
        const targetType = asset.type === 'audio' ? 'audio' : 'video';
        const targetTrack = tracks.find(t => t.type === targetType);

        if (targetTrack) {
            addClip(targetTrack.id, {
                ...asset,
                id: uuidv4(), // Create new ID for the timeline clip
                start: 0,    // Default to start
            });
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        Array.from(files).forEach(file => {
            const objectUrl = URL.createObjectURL(file);
            const type = file.type.startsWith('video/') ? 'video' :
                file.type.startsWith('audio/') ? 'audio' :
                    file.type.startsWith('image/') ? 'image' : 'video'; // Default fallback

            // For videos/audio, we theoretically need to load metadata to get duration.
            // For now, we'll set a default and let the renderer handle it or update later.
            // A robust solution would use a hidden video element to read metadata.

            const newAsset: Clip = {
                id: uuidv4(),
                trackId: '', // Not on a track yet
                name: file.name,
                type: type as ClipType,
                src: objectUrl,
                start: 0,
                duration: 10, // Default duration, should be updated on load
                offset: 0,
                properties: {
                    opacity: { value: 1, keyframes: [] },
                    scale: { value: 1, keyframes: [] },
                    rotation: { value: 0, keyframes: [] },
                    positionX: { value: 0, keyframes: [] },
                    positionY: { value: 0, keyframes: [] }
                },
                isSelected: false
            };

            addMedia(newAsset);
        });

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleAddText = () => {
        const newAsset: Clip = {
            id: uuidv4(),
            trackId: '',
            name: 'New Text',
            type: 'text',
            src: '', // No src for text, content is in name/properties
            start: 0,
            duration: 5,
            offset: 0,
            properties: {
                opacity: { value: 1, keyframes: [] },
                scale: { value: 1, keyframes: [] },
                rotation: { value: 0, keyframes: [] },
                positionX: { value: 0, keyframes: [] },
                positionY: { value: 0, keyframes: [] }
            },
            isSelected: false
        };
        addMedia(newAsset);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="p-2 border-b border-border flex justify-between items-center">
                <span className="text-xs font-medium text-text-secondary">Media Assets</span>
                <div className="flex gap-1">
                    <button
                        onClick={handleAddText}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                        title="Add Text"
                    >
                        <Type size={16} className="text-text-primary" />
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                        title="Import Media"
                    >
                        <FilePlus size={16} className="text-text-primary" />
                    </button>
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileUpload}
                    multiple
                    accept="video/*,audio/*,image/*"
                />
            </div>

            <div className="p-3 grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] gap-2 overflow-y-auto content-start flex-1">
                {mediaBin.length === 0 && (
                    <div className="col-span-full h-32 flex flex-col items-center justify-center text-text-muted text-xs text-center border border-dashed border-border rounded-lg opacity-50">
                        <FilePlus size={24} className="mb-2" />
                        <span>Import media to start</span>
                    </div>
                )}

                {mediaBin.map((asset) => (
                    <div
                        key={asset.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, asset)}
                        onDoubleClick={() => handleDoubleClick(asset)}
                        className="aspect-square bg-surface border border-border rounded-lg flex flex-col items-center justify-center p-2 cursor-grab hover:bg-zinc-700 hover:border-accent group transition-all"
                    >
                        <div className="mb-2 text-text-muted group-hover:text-text-primary transition-colors">
                            {asset.type === 'video' && <Video size={32} />}
                            {asset.type === 'audio' && <Music size={32} />}
                            {asset.type === 'image' && <Image size={32} />}
                            {asset.type === 'text' && <Type size={32} />}
                        </div>
                        <span className="text-[10px] text-text-secondary text-center break-all leading-tight line-clamp-2 w-full group-hover:text-text-primary">
                            {asset.name}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
