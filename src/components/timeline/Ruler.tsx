import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useStore } from '../../store/useStore';

export interface RulerHandle {
    draw: (scrollLeft: number) => void;
}

export const Ruler = forwardRef<RulerHandle>((_, ref) => {
    const { zoom, duration, seek } = useStore();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const scrollLeftRef = useRef(0);

    const draw = (scrollLeft: number) => {
        scrollLeftRef.current = scrollLeft;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // High DPI Scaling
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        // Set actual size in memory (scaled to account for extra pixel density)
        const width = Math.floor(rect.width * dpr);
        const height = Math.floor(rect.height * dpr);

        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
        }

        // Normalize coordinate system to use css pixels.
        // We use setTransform to reset any existing transforms and apply the dpr scale
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Clear (using logical CSS pixels due to scale)
        ctx.fillStyle = '#18181b';
        ctx.fillRect(0, 0, rect.width, rect.height);

        ctx.strokeStyle = '#3f3f46';
        ctx.fillStyle = '#a1a1aa';
        ctx.font = '10px Inter';
        ctx.textAlign = 'left';

        // Calculate rendering range
        const startTime = scrollLeft / zoom;
        const endTime = (scrollLeft + canvas.width) / zoom;

        // Determine tick interval
        let tickInterval = 1; // 1 second
        if (zoom < 10) tickInterval = 10;
        if (zoom < 2) tickInterval = 30;
        if (zoom > 100) tickInterval = 0.5;
        if (zoom > 200) tickInterval = 0.1;

        // Draw ticks
        const firstTick = Math.floor(startTime / tickInterval) * tickInterval;

        for (let time = firstTick; time <= endTime; time += tickInterval) {
            const x = (time * zoom) - scrollLeft;

            // Round to avoid pixel blurry
            const xPos = Math.floor(x) + 0.5;

            // Major tick
            if (Math.abs(time % (tickInterval * 5)) < 0.001 || (tickInterval >= 1 && time % 1 === 0)) {
                ctx.beginPath();
                ctx.moveTo(xPos, 15);
                ctx.lineTo(xPos, 30);
                ctx.stroke();

                // Time label
                const minutes = Math.floor(time / 60);
                const seconds = Math.floor(time % 60);
                const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                ctx.fillText(timeStr, xPos + 4, 25);
            } else {
                // Minor tick
                ctx.beginPath();
                ctx.moveTo(xPos, 22);
                ctx.lineTo(xPos, 30);
                ctx.stroke();
            }
        }

        // Bottom border
        ctx.beginPath();
        ctx.strokeStyle = '#3f3f46';
        ctx.moveTo(0, 29.5);
        ctx.lineTo(rect.width, 29.5);
        ctx.stroke();
    };

    useImperativeHandle(ref, () => ({
        draw
    }));

    // Initial draw & redraw on zoom change
    useEffect(() => {
        draw(scrollLeftRef.current);
    }, [zoom, duration]);

    // Handle Resize
    useEffect(() => {
        const handleResize = () => {
            draw(scrollLeftRef.current);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleClick = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const time = (x + scrollLeftRef.current) / zoom;
        seek(time);
    };

    return (
        <canvas
            ref={canvasRef}
            style={{ width: '100%', height: '30px', display: 'block', cursor: 'pointer' }}
            onClick={handleClick}
        />
    );
});

Ruler.displayName = "Ruler";
