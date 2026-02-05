import React, { useRef, useState } from 'react';
import { useStore } from '../../store/useStore';
import { Video, Image, Music, FilePlus, Type, Folder, FolderOpen, Download } from 'lucide-react';
import { ClipType, Clip } from '../../utils/types';
import { v4 as uuidv4 } from 'uuid';

type FolderType = 'all' | 'video' | 'audio' | 'image' | 'starter-pack';

export const Library: React.FC = () => {
    const { addClip, tracks, addMedia, mediaBin } = useStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeFolder, setActiveFolder] = useState<FolderType>('all');

    const handleDragStart = (e: React.DragEvent, asset: Clip) => {
        e.dataTransfer.setData('application/json', JSON.stringify(asset));
        e.dataTransfer.effectAllowed = 'copyMove';
    };

    const handleDoubleClick = (asset: Clip) => {
        const targetType = asset.type === 'audio' ? 'audio' : 'video';
        const targetTrack = tracks.find(t => t.type === targetType);

        if (targetTrack) {
            addClip(targetTrack.id, {
                ...asset,
                id: uuidv4(),
                start: 0,
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
                    file.type.startsWith('image/') ? 'image' : 'video';

            // Auto-assign folder based on type
            // Starter Pack assets will be manually assigned 'starter-pack'
            const folder = type;

            const newAsset: Clip = {
                id: uuidv4(),
                trackId: '',
                name: file.name,
                type: type as ClipType,
                src: objectUrl,
                start: 0,
                duration: 10,
                offset: 0,
                properties: {
                    opacity: { value: 1, keyframes: [] },
                    scale: { value: 1, keyframes: [] },
                    rotation: { value: 0, keyframes: [] },
                    positionX: { value: 0, keyframes: [] },
                    positionY: { value: 0, keyframes: [] }
                },
                isSelected: false,
                folder: folder
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
            src: '',
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
            isSelected: false,
            folder: 'image' // Treat text as image/overlay for now
        };
        addMedia(newAsset);
    };

    // Filter mediaBin based on activeFolder
    const filteredMedia = mediaBin.filter(asset => {
        if (activeFolder === 'all') return true;
        if (activeFolder === 'starter-pack') return asset.folder === 'starter-pack';
        // Fallback for auto-sorted uploads
        return asset.folder === activeFolder || asset.type === activeFolder;
    });

    const FolderItem = ({ id, label, icon: Icon }: { id: FolderType, label: string, icon: any }) => (
        <button
            onClick={() => setActiveFolder(id)}
            className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded transition-colors ${activeFolder === id
                    ? 'bg-accent/20 text-accent font-medium'
                    : 'text-text-secondary hover:bg-surface hover:text-text-primary'
                }`}
        >
            <Icon size={14} />
            {label}
        </button>
    );

    return (
        <div className="flex h-full">
            {/* Sidebar */}
            <div className="w-[120px] bg-panel border-r border-border flex flex-col pt-2 gap-1 shrink-0">
                <div className="px-3 py-1 text-[10px] font-bold text-text-muted uppercase tracking-wider">Library</div>
                <FolderItem id="all" label="All Files" icon={Folder} />
                <FolderItem id="video" label="Videos" icon={Video} />
                <FolderItem id="audio" label="Audio" icon={Music} />
                <FolderItem id="image" label="Images" icon={Image} />

                <div className="h-px bg-border mx-3 my-1" />
                <div className="px-3 py-1 text-[10px] font-bold text-text-muted uppercase tracking-wider">Packs</div>
                <FolderItem id="starter-pack" label="Starter Pack" icon={Download} />
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col">
                <div className="h-10 border-b border-border flex justify-between items-center px-3 bg-panel">
                    <span className="text-xs font-medium text-text-primary capitalize">
                        {activeFolder.replace('-', ' ')} ({filteredMedia.length})
                    </span>
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

                <div className="p-3 grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] gap-2 overflow-y-auto content-start flex-1 bg-background/50">
                    {filteredMedia.length === 0 && (
                        <div className="col-span-full h-32 flex flex-col items-center justify-center text-text-muted text-xs text-center border border-dashed border-border rounded-lg opacity-50 m-4">
                            <FolderOpen size={24} className="mb-2" />
                            <span>Empty Folder</span>
                        </div>
                    )}

                    {filteredMedia.map((asset) => (
                        <div
                            key={asset.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, asset)}
                            onDoubleClick={() => handleDoubleClick(asset)}
                            className="aspect-square bg-surface border border-border rounded-lg flex flex-col items-center justify-center p-2 cursor-grab hover:bg-zinc-700 hover:border-accent group transition-all relative"
                        >
                            <div className="mb-2 text-text-muted group-hover:text-text-primary transition-colors">
                                {asset.type === 'video' && <Video size={32} />}
                                {asset.type === 'audio' && <Music size={32} />}
                                {asset.type === 'image' && <Image size={32} />}
                                {asset.type === 'text' && <Type size={32} />}
                            </div>
                            <span className="text-[10px] text-text-secondary text-center break-all leading-tight line-clamp-2 w-full group-hover:text-text-primary bg-black/50 rounded px-1">
                                {asset.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
