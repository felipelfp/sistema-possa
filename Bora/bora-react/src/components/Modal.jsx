import React from 'react';

export function Modal({ isOpen, title, message, onClose }) {
    if (!isOpen) return null;

    return (
        <div className={`modal ${isOpen ? 'active' : ''}`}>
            <div className="modal-content">
                <div className="modal-title">{title}</div>
                <p style={{ color: '#888', lineHeight: '1.6', whiteSpace: 'pre-line' }}>{message}</p>
                <button className="btn close-modal" onClick={onClose}>Fechar</button>
            </div>
        </div>
    );
}
