import React from 'react';
import DepositForm, { Deposit } from './DepositForm';
import Statement from './Statement';
import './DashboardView.css';

import { Objective } from './Objectives';

interface DashboardViewProps {
    exchangeRate: number;
    transactions: Deposit[];
    onDeposit: (deposit: Deposit, objectiveId?: string) => void;
    accumulatedBRL: number;
    totalTargetBRL: number;
    totalTargetUSD: number; // Nova prop
    objectives: Objective[];
    debts: any[];
    onDelete: (id: number) => void;
    ganhosDoDia?: number;
}

const DashboardView: React.FC<DashboardViewProps> = ({
    exchangeRate,
    transactions,
    onDeposit,
    accumulatedBRL,
    totalTargetBRL,
    totalTargetUSD,
    objectives,
    debts,
    onDelete,
    ganhosDoDia = 0
}) => {
    const targetBRL = totalTargetBRL;
    const targetUSD = totalTargetUSD;
    const totalMonths = 100; // Padronizado para 100 meses conforme solicitado
    const totalDays = 3000;  // Aproximadamente 100 meses em dias

    const monthlyGoalBRL = targetBRL / totalMonths;
    const dailyGoalBRL = targetBRL / totalDays;
    
    const monthlyGoalUSD = targetUSD / totalMonths;
    const dailyGoalUSD = targetUSD / totalDays;

    const progress = targetBRL > 0 ? (accumulatedBRL / targetBRL) * 100 : 0;

    const totalDebtsOriginal = debts.reduce((acc, d) => acc + (parseFloat(d.valor) || 0), 0);
    const totalDebtsProposta = debts.reduce((acc, d) => {
        const vp = parseFloat(d.vlrP) || 0;
        const q = parseInt(d.qtd) || 1;
        const ent = d.tipo === 'parcelado' ? (parseFloat(d.entrada) || 0) : 0;
        return acc + (d.tipo === 'parcelado' ? (vp * q) + ent : vp);
    }, 0);

    return (
        <div className="dashboard-view">
            <h2 className="section-title">Visão Geral</h2>

            <div className="dashboard-stats-grid">
                <div className="stat-card glass">
                    <span className="stat-icon">🎯</span>
                    <div className="stat-content">
                        <span className="stat-label">Meta Total</span>
                        <span className="stat-value">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(targetBRL)}</span>
                        <span className="stat-sub-value" style={{color: '#3498db', fontWeight: 'bold'}}>USD {targetUSD.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                    </div>
                </div>

                <div className="stat-card glass">
                    <span className="stat-icon">📅</span>
                    <div className="stat-content">
                        <span className="stat-label">Meta Mensal</span>
                        <span className="stat-value">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthlyGoalBRL)}</span>
                        <span className="stat-sub-value" style={{color: '#3498db'}}>USD {monthlyGoalUSD.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                    </div>
                </div>

                <div className="stat-card glass">
                    <span className="stat-icon">📆</span>
                    <div className="stat-content">
                        <span className="stat-label">Meta Diária</span>
                        <span className="stat-value">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dailyGoalBRL)}</span>
                        <span className="stat-sub-value" style={{color: '#3498db'}}>USD {dailyGoalUSD.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                    </div>
                </div>

                <div className="stat-card glass">
                    <span className="stat-icon">💰</span>
                    <div className="stat-content">
                        <span className="stat-label">Acumulado Total</span>
                        <span className="stat-value highlight">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(accumulatedBRL + ganhosDoDia)}
                        </span>
                        {ganhosDoDia > 0 && (
                            <span className="stat-sub-value" style={{color: '#10b981', fontWeight: 'bold', fontSize: '0.8rem', marginTop: '2px'}}>
                                + R$ {ganhosDoDia.toFixed(2)} (Ganhos de Hoje)
                            </span>
                        )}
                    </div>
                </div>

                <div className="stat-card glass">
                    <span className="stat-icon">📉</span>
                    <div className="stat-content">
                        <span className="stat-label">Dívida Original</span>
                        <span className="stat-value" style={{color: '#ef4444'}}>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalDebtsOriginal)}
                        </span>
                    </div>
                </div>

                <div className="stat-card glass">
                    <span className="stat-icon">🤝</span>
                    <div className="stat-content">
                        <span className="stat-label">Valor Quitação</span>
                        <span className="stat-value" style={{color: '#f59e0b'}}>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalDebtsProposta)}
                        </span>
                    </div>
                </div>

                <div className="stat-card glass">
                    <span className="stat-icon">📈</span>
                    <div className="stat-content">
                        <span className="stat-label">Progresso</span>
                        <span className="stat-value">{progress.toFixed(2)}%</span>
                        <div className="mini-progress-bar">
                            <div className="mini-progress-fill" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="dashboard-actions-area">
                <div className="action-section">
                    <DepositForm exchangeRate={exchangeRate} onDeposit={onDeposit} objectives={objectives} />
                </div>
                <div className="statement-section">
                    <Statement transactions={transactions} onDelete={onDelete} />
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
