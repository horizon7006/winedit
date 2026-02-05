import { useState, useRef } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

export const useFFmpeg = () => {
    const [loaded, setLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const ffmpegRef = useRef(new FFmpeg());


    const load = async () => {
        setIsLoading(true);
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
        const ffmpeg = ffmpegRef.current;
        ffmpeg.on('log', ({ message }) => {
            console.log(message);
        });

        try {
            // Load ffmpeg.wasm
            await ffmpeg.load({
                coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            });
            setLoaded(true);
            setIsLoading(false);
        } catch (error) {
            console.error("Failed to load ffmpeg", error);
            setIsLoading(false);
        }
    };

    return { ffmpeg: ffmpegRef.current, loaded, isLoading, load };
};
