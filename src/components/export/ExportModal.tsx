import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Download, Film, X, Loader2 } from 'lucide-react';
import { useFFmpeg } from '../../hooks/useFFmpeg';
import { fetchFile } from '@ffmpeg/util';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
    const { tracks, duration } = useStore();
    const [isExporting, setIsExporting] = useState(false);
    const [progress, setProgress] = useState(0);
    const { ffmpeg, loaded, load } = useFFmpeg();

    if (!isOpen) return null;

    const handleExportJson = () => {
        const projectData = {
            version: "1.0",
            duration,
            tracks: tracks
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projectData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "project.wne"); // Changed to .wne
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        onClose();
    };

    const handleExportVideo = async () => {
        setIsExporting(true);
        setProgress(0);

        try {
            if (!loaded) await load();

            const videoTracks = tracks.filter(t => t.type === 'video' && !t.isHidden);
            const allClips = videoTracks.flatMap(t => t.clips).sort((a, b) => a.start - b.start);

            if (allClips.length === 0) {
                alert("No video clips to export!");
                setIsExporting(false);
                return;
            }

            // 1. Write files to memory
            const fileMap = new Map<string, string>(); // src -> localFilename

            for (const clip of allClips) {
                if (!fileMap.has(clip.src)) {
                    const ext = clip.name.split('.').pop() || 'mp4';
                    const filename = `file_${clip.id}.${ext}`;
                    fileMap.set(clip.src, filename);

                    const fileData = await fetchFile(clip.src);
                    await ffmpeg.writeFile(filename, fileData);
                }
            }

            // 2. Build Filter Complex
            let filterChain = `color=c=black:s=1280x720:d=${duration}[bg];`;
            const uniqueFiles = Array.from(fileMap.values());
            const uniqueSrcs = Array.from(fileMap.keys());

            // Map clip to input index
            const getInputIndex = (src: string) => uniqueSrcs.indexOf(src);

            let chains = '';
            let lastOutput = '[bg]';

            allClips.forEach((clip, i) => {
                const inputIdx = getInputIndex(clip.src);
                const outLabel = `v${i}`;

                // Trim: start at offset, go for duration. setpts shifts to timeline start.
                chains += `[${inputIdx}:v]trim=start=${clip.offset}:duration=${clip.offset + clip.duration},setpts=PTS-STARTPTS+${clip.start}/TB[${outLabel}];`;

                // Overlay
                const nextOutput = i === allClips.length - 1 ? 'out' : `tmp${i}`;
                chains += `${lastOutput}[${outLabel}]overlay=enable='between(t,${clip.start},${clip.start + clip.duration})':eof_action=pass[${nextOutput}];`;
                lastOutput = `[${nextOutput}]`;
            });

            // Cleanup filter string
            chains = chains.replace(/\[out\];$/, '[out]');
            if (chains.endsWith(';')) chains = chains.slice(0, -1);

            const fullFilter = filterChain + chains;
            const inputArgs = uniqueFiles.flatMap(f => ['-i', f]);

            // 3. Run FFmpeg
            ffmpeg.on('progress', ({ progress }) => {
                setProgress(Math.round(progress * 100));
            });

            await ffmpeg.exec([
                ...inputArgs,
                '-filter_complex', fullFilter,
                '-map', `[${allClips.length > 0 ? 'out' : 'bg'}]`,
                '-c:v', 'libx264',
                '-preset', 'ultrafast',
                'output.mp4'
            ]);

            // 4. Download
            const data = await ffmpeg.readFile('output.mp4');
            const videoBlob = new Blob([data], { type: 'video/mp4' });
            const url = URL.createObjectURL(videoBlob);

            const a = document.createElement('a');
            a.href = url;
            a.download = 'winedit_export.mp4';
            a.click();

        } catch (error) {
            console.error("Export failed", error);
            alert("Export failed. Check console.");
        } finally {
            setIsExporting(false);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-panel border border-border rounded-xl shadow-2xl w-[400px] overflow-hidden">
                <div className="p-4 border-b border-border flex justify-between items-center bg-surface">
                    <h2 className="text-sm font-semibold text-text-primary">Export Project</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                        <X size={16} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs text-text-muted uppercase font-semibold">Formats</label>

                        <button
                            onClick={handleExportJson}
                            disabled={isExporting}
                            className="w-full flex items-center justify-between p-3 rounded-lg bg-background border border-border hover:border-accent hover:bg-accent/10 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded bg-surface group-hover:bg-accent text-accent group-hover:text-white transition-colors">
                                    <Download size={20} />
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-medium text-text-primary">Project File (JSON)</div>
                                    <div className="text-[10px] text-text-muted">Save your project structure</div>
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={handleExportVideo}
                            disabled={isExporting}
                            className="w-full flex items-center justify-between p-3 rounded-lg bg-background border border-border hover:border-accent hover:bg-accent/10 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded bg-surface group-hover:bg-accent text-accent group-hover:text-white transition-colors">
                                    {isExporting ? <Loader2 size={20} className="animate-spin" /> : <Film size={20} />}
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-medium text-text-primary">
                                        {isExporting ? `Rendering... ${progress}%` : 'Render Video (MP4)'}
                                    </div>
                                    <div className="text-[10px] text-text-muted">High-quality FFmpeg render</div>
                                </div>
                            </div>
                        </button>
                    </div>

                    {isExporting && (
                        <div className="w-full bg-surface rounded-full h-1.5 mt-2 overflow-hidden">
                            <div
                                className="bg-accent h-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
