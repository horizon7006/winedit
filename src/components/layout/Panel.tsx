import React, { ReactNode } from 'react';

interface PanelProps {
    children: ReactNode;
    className?: string;
    title?: string;
    actions?: ReactNode;
}

export const Panel: React.FC<PanelProps> = ({ children, className = '', title, actions }) => {
    return (
        <div className={`flex flex-col w-full h-full bg-panel text-text-primary overflow-hidden ${className}`}>
            {title && (
                <div className="h-10 flex items-center justify-between px-3 border-b border-border bg-panel shrink-0">
                    <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">{title}</span>
                    {actions && <div className="flex gap-2">{actions}</div>}
                </div>
            )}
            <div className="flex-1 relative overflow-hidden">
                {children}
            </div>
        </div>
    );
};
