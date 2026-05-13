import React from 'react';

export function HistorySection({ selectedDate, dayData }) {
    if (!dayData) {
        return (
            <div className="history-section">
                <div className="history-title">Histórico do Dia Selecionado</div>
                <div className="history-content">
                    <div>Não há dados para esta data.</div>
                </div>
            </div>
        );
    }

    const totalGastos = dayData.gastoGasolina + dayData.gastoManutencao + (dayData.gastoAntecipacao || 0);
    const lucroDia = dayData.ganhos - totalGastos;

    return (
        <div className="history-section">
            <div className="history-title">Histórico do Dia Selecionado</div>
            <div className="history-content">
                <HistoryItem label="Entrada" value={dayData.entrada || "--"} />
                <HistoryItem label="Saída" value={dayData.saida || "--"} />
                <HistoryItem label="KM Inicial" value={`${dayData.kmInicial.toFixed(1)} km`} />
                <HistoryItem label="KM Final" value={`${dayData.kmFinal.toFixed(1)} km`} />
                <HistoryItem label="KM Rodados" value={`${dayData.kmRodados.toFixed(1)} km`} />
                <HistoryItem label="Ganhos" value={`R$ ${dayData.ganhos.toFixed(2)}`} valueClass="positive" />
                <HistoryItem label="Gasto Gasolina" value={`R$ ${dayData.gastoGasolina.toFixed(2)}`} valueClass="negative" />
                <HistoryItem label="Gasto Manutenção" value={`R$ ${dayData.gastoManutencao.toFixed(2)}`} valueClass="negative" />
                <HistoryItem label="Gasto Antecipação" value={`R$ ${(dayData.gastoAntecipacao || 0).toFixed(2)}`} valueClass="negative" />
                <HistoryItem
                    label="Lucro do Dia"
                    value={`R$ ${lucroDia.toFixed(2)}`}
                    valueClass={lucroDia >= 0 ? "positive" : "negative"}
                />
            </div>
        </div>
    );
}

function HistoryItem({ label, value, valueClass = '' }) {
    return (
        <div className="history-item">
            <span className="history-label">{label}:</span>
            <span className={`history-value ${valueClass}`}>{value}</span>
        </div>
    );
}
