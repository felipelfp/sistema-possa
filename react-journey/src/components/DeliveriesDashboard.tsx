import React, { useState, useEffect } from 'react';
import { useDeliveryData, METAS } from '../hooks/useDeliveryData';
import './DeliveriesDashboard.css';

export function DelCard({ title, icon, children, className = '', fullWidth = false }: any) {
    return (
        <div className={`del-card ${fullWidth ? 'del-card-full' : ''} ${className}`}>
            <div className="del-card-title">
                <span className="del-card-title-icon">{icon}</span>
                {title}
            </div>
            {children}
        </div>
    );
}

export function WeekCalendar({ daysData, onDayClick, selectedDate, getDataHoje }: any) {
    const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const hoje = new Date();
    const diaSemana = hoje.getDay();
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - diaSemana);

    const days = [];
    for (let i = 0; i < 7; i++) {
        const dia = new Date(inicioSemana);
        dia.setDate(inicioSemana.getDate() + i);
        const dataStr = dia.toISOString().split("T")[0];
        const dadosDia = daysData[dataStr];

        days.push({
            date: dataStr,
            dayName: diasSemana[i],
            dayNum: dia.getDate(),
            kmRodados: dadosDia ? dadosDia.kmRodados.toFixed(0) : "0",
            isToday: dataStr === getDataHoje(),
            hasData: dadosDia && dadosDia.kmRodados > 0
        });
    }

    return (
        <div className="del-week-calendar">
            {days.map(day => (
                <div
                    key={day.date}
                    className={`del-day-card ${day.isToday ? 'active' : ''} ${day.hasData ? 'completed' : ''} ${selectedDate === day.date ? 'active' : ''}`}
                    onClick={() => onDayClick(day.date)}
                >
                    <div className="del-day-name">{day.dayName}</div>
                    <div className="del-day-date">{day.dayNum}</div>
                    <div className="del-day-km">{day.kmRodados} km</div>
                </div>
            ))}
        </div>
    );
}

function HistoryItem({ label, value, valueClass = '' }: any) {
    return (
        <div className="del-history-item">
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{label}:</span>
            <span className={valueClass} style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>{value}</span>
        </div>
    );
}

export function HistorySection({ selectedDate, dayData }: any) {
    if (!dayData) {
        return (
            <div className="del-history-section">
                <div className="del-history-title">Histórico do Dia Selecionado</div>
                <div className="del-history-content">
                    <div>Não há dados para esta data.</div>
                </div>
            </div>
        );
    }

    const totalGastos = dayData.gastoGasolina + dayData.gastoManutencao + (dayData.gastoAntecipacao || 0);
    const lucroDia = dayData.ganhos - totalGastos;

    return (
        <div className="del-history-section">
            <div className="del-history-title">Histórico do Dia Selecionado</div>
            <div className="del-history-content">
                <HistoryItem label="Entrada" value={dayData.entrada || "--"} />
                <HistoryItem label="Saída" value={dayData.saida || "--"} />
                <HistoryItem label="KM Inicial" value={`${dayData.kmInicial.toFixed(1)} km`} />
                <HistoryItem label="KM Final" value={`${dayData.kmFinal.toFixed(1)} km`} />
                <HistoryItem label="KM Rodados" value={`${dayData.kmRodados.toFixed(1)} km`} />
                <HistoryItem label="Ganhos" value={`R$ ${dayData.ganhos.toFixed(2)}`} valueClass="del-positive" />
                <HistoryItem label="Gasto Gasolina" value={`R$ ${dayData.gastoGasolina.toFixed(2)}`} valueClass="del-negative" />
                <HistoryItem label="Gasto Manutenção" value={`R$ ${dayData.gastoManutencao.toFixed(2)}`} valueClass="del-negative" />
                <HistoryItem label="Gasto Antecipação" value={`R$ ${(dayData.gastoAntecipacao || 0).toFixed(2)}`} valueClass="del-negative" />
                <HistoryItem
                    label="Lucro do Dia"
                    value={`R$ ${lucroDia.toFixed(2)}`}
                    valueClass={lucroDia >= 0 ? "del-positive" : "del-negative"}
                />
            </div>
        </div>
    );
}

export default function DeliveriesDashboard() {
    const deliveryApi = useDeliveryData();
    const { data, getDataHoje, getDadosDia, registrarEntrada, registrarSaida, registrarKm, registrarGanho, registrarGastos, resetarTudo, resetarOleo, getMetaDoDia } = deliveryApi;
    const [currentTime, setCurrentTime] = useState('--:--');
    const [kmInput, setKmInput] = useState('');
    const [ganhoInput, setGanhoInput] = useState('');
    const [gastosInput, setGastosInput] = useState({ gasolina: '', manutencao: '', antecipacao: '' });
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const hoje = getDataHoje();
    const dadosHoje = getDadosDia(hoje);

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            setCurrentTime(`${hours}:${minutes}`);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleRegistrarKm = () => {
        const km = parseFloat(kmInput);
        if (km > 0) {
            const { kmRodados, alertaOleo } = registrarKm(km);
            let msg = `Você rodou ${kmRodados.toFixed(1)} km hoje!`;
            if (alertaOleo) msg += "\n\n⚠️ ATENÇÃO: Já passou de 1000km! Hora de trocar o óleo!";
            alert(msg);
            setKmInput('');
        }
    };

    const handleRegistrarGanho = () => {
        const ganho = parseFloat(ganhoInput);
        if (ganho > 0) {
            registrarGanho(ganho);
            alert(`R$ ${ganho.toFixed(2)} adicionados aos ganhos de hoje!`);
            setGanhoInput('');
        }
    };

    const handleRegistrarGastos = () => {
        const g = parseFloat(gastosInput.gasolina) || 0;
        const m = parseFloat(gastosInput.manutencao) || 0;
        const a = parseFloat(gastosInput.antecipacao) || 0;
        if (g === 0 && m === 0 && a === 0) return;

        registrarGastos(g, m, a);
        alert(`Total de R$ ${(g + m + a).toFixed(2)} em gastos registrado.`);
        setGastosInput({ gasolina: '', manutencao: '', antecipacao: '' });
    };

    let totalGanhos = 0, totalGastos = 0, totalKm = 0, lucroLiquidoMes = 0;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    Object.entries(data.dias).forEach(([dateStr, dia]: any) => {
        totalGanhos += dia.ganhos;
        const diaGastos = dia.gastoGasolina + dia.gastoManutencao + (dia.gastoAntecipacao || 0);
        totalGastos += diaGastos;
        totalKm += dia.kmRodados;
        const d = new Date(dateStr + "T00:00:00");
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
            lucroLiquidoMes += (dia.ganhos - diaGastos);
        }
    });

    const lucroTotal = totalGanhos - totalGastos;
    const faltaFinanceira = Math.max(METAS.MENSAL - lucroLiquidoMes, 0);
    const percentualFinanceiro = Math.min((lucroLiquidoMes / METAS.MENSAL) * 100, 100);

    const metaDoDia = getMetaDoDia();
    const faltaDiaria = Math.max(metaDoDia - dadosHoje.ganhos, 0);
    const percentualDiario = Math.min((dadosHoje.ganhos / metaDoDia) * 100, 100);

    return (
        <div className="deliveries-wrapper">
            <div className="del-dashboard">
                <DelCard title="Ponto" icon="⏰">
                    <div className="del-time-display">{currentTime}</div>
                    <div className={`del-status-badge ${dadosHoje.entrada && !dadosHoje.saida ? 'del-status-working' : 'del-status-off'}`}>
                        {dadosHoje.entrada && !dadosHoje.saida ? 'Trabalhando' : 'Fora do Expediente'}
                    </div>
                    {!dadosHoje.entrada || dadosHoje.saida ? (
                        <button className="del-btn del-btn-success" onClick={() => registrarEntrada()}>Registrar Entrada</button>
                    ) : (
                        <button className="del-btn del-btn-danger" onClick={() => registrarSaida()}>Registrar Saída</button>
                    )}
                </DelCard>

                <DelCard title="Quilometragem" icon="📍">
                    <div className="del-input-group">
                        <label>KM Atual</label>
                        <input type="number" value={kmInput} onChange={(e) => setKmInput(e.target.value)} />
                    </div>
                    <button className="del-btn" onClick={handleRegistrarKm}>Registrar KM</button>
                </DelCard>

                <DelCard title="Ganhos" icon="💰">
                    <div className="del-input-group">
                        <label>Quanto fez hoje?</label>
                        <input type="number" value={ganhoInput} onChange={(e) => setGanhoInput(e.target.value)} />
                    </div>
                    <button className="del-btn" onClick={handleRegistrarGanho}>Registrar Ganho</button>
                    <div style={{ marginTop: '16px' }}>
                        <div className="del-card-value del-positive">R$ {dadosHoje.ganhos.toFixed(2)}</div>
                    </div>
                </DelCard>

                <DelCard title="Gastos" icon="⛽">
                    <div className="del-input-group">
                        <label>Gasolina (R$)</label>
                        <input type="number" value={gastosInput.gasolina} onChange={(e) => setGastosInput({ ...gastosInput, gasolina: e.target.value })} />
                    </div>
                    <button className="del-btn" onClick={handleRegistrarGastos}>Registrar Gastos</button>
                </DelCard>

                <DelCard title="Estatísticas" icon="📊">
                    <div className="del-stats-grid">
                        <div className="del-stat-box"><div className="del-stat-box-label">Ganhos Entregas</div><div className="del-stat-box-value del-positive">R$ {totalGanhos.toFixed(2)}</div></div>
                        <div className="del-stat-box"><div className="del-stat-box-label">Total Gastos</div><div className="del-stat-box-value del-negative">R$ {totalGastos.toFixed(2)}</div></div>
                        <div className="del-stat-box"><div className="del-stat-box-label">Lucro Total</div><div className={`del-stat-box-value ${lucroTotal >= 0 ? 'del-positive' : 'del-negative'}`}>R$ {lucroTotal.toFixed(2)}</div></div>
                        <div className="del-stat-box"><div className="del-stat-box-label">KM Total</div><div className="del-stat-box-value del-neutral">{totalKm.toFixed(1)} km</div></div>
                    </div>
                </DelCard>

                <DelCard title="Progresso Diário" icon="🎯">
                    <div className="del-financial-row">
                        <span style={{color: 'var(--text-secondary)'}}>Meta de Hoje:</span>
                        <span style={{color: 'var(--text-primary)', fontWeight: 'bold'}}>R$ {metaDoDia.toFixed(2)}</span>
                    </div>
                    <div className="del-financial-row">
                        <span style={{color: 'var(--text-secondary)'}}>Ganhos Hoje:</span>
                        <span className="del-positive" style={{fontWeight: 'bold'}}>R$ {dadosHoje.ganhos.toFixed(2)}</span>
                    </div>
                    <div className="del-financial-row" style={{borderBottom: 'none'}}>
                        <span style={{color: 'var(--text-secondary)'}}>Falta:</span>
                        <span className="del-neutral" style={{fontWeight: 'bold'}}>R$ {faltaDiaria.toFixed(2)}</span>
                    </div>
                    <div className="del-progress-bar">
                        <div className="del-progress-fill" style={{ width: `${percentualDiario}%` }}></div>
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                        {percentualDiario.toFixed(1)}% da meta de hoje
                    </div>
                </DelCard>

                <DelCard title="Progresso Mensal" icon="💵">
                    <div className="del-financial-row">
                        <span style={{color: 'var(--text-secondary)'}}>Meta Mensal:</span>
                        <span style={{color: 'var(--text-primary)', fontWeight: 'bold'}}>R$ {METAS.MENSAL.toFixed(2)}</span>
                    </div>
                    <div className="del-financial-row">
                        <span style={{color: 'var(--text-secondary)'}}>Acumulado Mês:</span>
                        <span className="del-positive" style={{fontWeight: 'bold'}}>R$ {lucroLiquidoMes.toFixed(2)}</span>
                    </div>
                    <div className="del-financial-row" style={{borderBottom: 'none'}}>
                        <span style={{color: 'var(--text-secondary)'}}>Falta:</span>
                        <span className="del-neutral" style={{fontWeight: 'bold'}}>R$ {faltaFinanceira.toFixed(2)}</span>
                    </div>
                    <div className="del-progress-bar">
                        <div className="del-progress-fill" style={{ width: `${percentualFinanceiro}%` }}></div>
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                        {percentualFinanceiro.toFixed(1)}% do mês
                    </div>
                </DelCard>

                <DelCard title="Calendário e Histórico" icon="📅" fullWidth>
                    <WeekCalendar daysData={data.dias} onDayClick={setSelectedDate} selectedDate={selectedDate} getDataHoje={getDataHoje} />
                    <HistorySection selectedDate={selectedDate} dayData={selectedDate ? data.dias[selectedDate] : null} />
                </DelCard>
            </div>
        </div>
    );
}
