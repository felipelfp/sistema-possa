import React from 'react';

export function Header({ kmHoje, ganhosHoje, onToggleSidebar }) {
    return (
        <div className="top-header">
            <div className="logo">
                <div
                    className="header-icon mobile-only"
                    onClick={onToggleSidebar}
                    style={{ marginRight: '10px', display: 'none' }}
                >
                    ☰
                </div>
                <span className="logo-icon">🚀</span>
                <span>BORA</span>
            </div>

            <div className="header-stats">
                <div className="stat-item">
                    <div className="stat-label">KM Hoje</div>
                    <div className="stat-value">{kmHoje.toFixed(0)} KM</div>
                </div>
                <div className="stat-item">
                    <div className="stat-label">Ganhos Hoje</div>
                    <div className="stat-value">R$ {ganhosHoje.toFixed(0)}</div>
                </div>
            </div>
            <div className="header-icons">
                <div className="header-icon">💰</div>
                <div className="header-icon">⚙️</div>
                <div className="header-icon">👤</div>
            </div>
        </div>
    );
}
