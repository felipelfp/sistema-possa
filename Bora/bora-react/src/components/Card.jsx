import React from 'react';

export function Card({ title, icon, children, className = '', fullWidth = false }) {
    return (
        <div className={`card ${fullWidth ? 'card-full' : ''} ${className}`}>
            <div className="card-title">
                <span className="card-title-icon">{icon}</span>
                {title}
            </div>
            {children}
        </div>
    );
}
