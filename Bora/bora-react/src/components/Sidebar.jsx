import React, { useState } from 'react';

export function Sidebar({ activePage, onNavigate, isOpen }) {
    return (
        <div className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
            <div
                className={`nav-item ${activePage === 'dashboard' ? 'active' : ''}`}
                onClick={() => onNavigate('dashboard')}
            >
                <span className="nav-icon">🏠</span>
                <span>Dashboard</span>
            </div>

            <div
                className={`nav-item ${activePage === 'config' ? 'active' : ''}`}
                onClick={() => onNavigate('config')}
            >
                <span className="nav-icon">⚙️</span>
                <span>Configurações</span>
            </div>
        </div>
    );
}
