import React, { useState, useEffect } from 'react';
import { Card } from './Card';
import { WeekCalendar } from './WeekCalendar';
import { HistorySection } from './HistorySection';
import { METAS } from '../hooks/useDeliveryData';

export function Dashboard({ data, actions, getDataHoje, getDadosDia }) {
    const [currentTime, setCurrentTime] = useState('--:--');
    const [kmInput, setKmInput] = useState('');
    const [ganhoInput, setGanhoInput] = useState('');
    const [gastosInput, setGastosInput] = useState({ gasolina: '', manutencao: '', antecipacao: '' });
    const [selectedDate, setSelectedDate] = useState(null);

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

    const handleRegistrarKm = async () => {
        const km = parseFloat(kmInput);
        if (km > 0) {
            const { kmRodados, alertaOleo } = await actions.registrarKm(km);

            let msg = `Você rodou ${kmRodados.toFixed(1)} km hoje!`;
            if (alertaOleo) {
                msg += "\n\n⚠️ ATENÇÃO: Já passou de 1000km! Hora de trocar o óleo!";
            }

            actions.showModal("KM Registrado!", msg);
            setKmInput('');
        } else {
            actions.showModal("Erro", "Por favor, insira um valor válido de KM.");
        }
    };

    const handleRegistrarGanho = async () => {
        const ganho = parseFloat(ganhoInput);
        if (ganho > 0) {
            await actions.registrarGanho(ganho);
            actions.showModal("Ganho Registrado!", `R$ ${ganho.toFixed(2)} adicionados aos ganhos de hoje!`);
            setGanhoInput('');
        } else {
            actions.showModal("Erro", "Por favor, insira um valor válido de ganho.");
        }
    };

    const handleRegistrarGastos = async () => {
        const g = parseFloat(gastosInput.gasolina) || 0;
        const m = parseFloat(gastosInput.manutencao) || 0;
        const a = parseFloat(gastosInput.antecipacao) || 0;

        if (g === 0 && m === 0 && a === 0) {
            actions.showModal("Erro", "Por favor, insira pelo menos um valor de gasto.");
            return;
        }

        await actions.registrarGastos(g, m, a);
        actions.showModal("Gastos Registrados!", `Total de R$ ${(g + m + a).toFixed(2)} em gastos registrado.`);
        setGastosInput({ gasolina: '', manutencao: '', antecipacao: '' });
    };

    // Stats Calculations
    let totalGanhos = 0;
    let totalGastos = 0;
    let totalKm = 0;
    let lucroLiquidoMes = 0; // Acumulado

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    Object.entries(data.dias).forEach(([dateStr, dia]) => {
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

    return (
        <div className="dashboard">
            {/* Ponto Card */}
            <Card title="Ponto" icon="⏰">
                <div className="time-display">{currentTime}</div>
                <div className={`status-badge ${dadosHoje.entrada && !dadosHoje.saida ? 'status-working' : 'status-off'}`}>
                    {dadosHoje.entrada && !dadosHoje.saida ? 'Trabalhando' : 'Fora do Expediente'}
                </div>
                {!dadosHoje.entrada || dadosHoje.saida ? (
                    <button className="btn btn-success" onClick={async () => {
                        const hora = await actions.registrarEntrada();
                        actions.showModal("Entrada Registrada!", `Entrada registrada às ${hora}. Boa sorte!`);
                    }}>Registrar Entrada</button>
                ) : (
                    <button className="btn btn-danger" onClick={async () => {
                        const hora = await actions.registrarSaida();
                        actions.showModal("Saída Registrada!", `Saída registrada às ${hora}. Descanse bem!`);
                    }}>Registrar Saída</button>
                )}
                <div style={{ marginTop: '12px', fontSize: '0.85rem', color: '#666' }}>
                    {dadosHoje.entrada && `Entrada: ${dadosHoje.entrada}`}
                    {dadosHoje.saida && ` | Saída: ${dadosHoje.saida}`}
                </div>
            </Card>

            {/* Quilometragem Card */}
            <Card title="Quilometragem" icon="📍">
                <div className="input-group">
                    <label>KM Atual do Odômetro</label>
                    <input
                        type="number"
                        placeholder="Ex: 10700"
                        step="0.1"
                        value={kmInput}
                        onChange={(e) => setKmInput(e.target.value)}
                    />
                </div>
                <button className="btn" onClick={handleRegistrarKm}>Registrar KM</button>

                <div style={{ marginTop: '12px', borderTop: '1px solid rgba(0,255,136,0.1)', paddingTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.8rem', color: '#888' }}>Próxima troca de óleo:</span>
                        <span style={{ color: (data.kmOleo || 0) >= 1000 ? '#ff4444' : '#00ff88', fontWeight: 'bold' }}>
                            {(data.kmOleo || 0).toFixed(1)} / 1000 km
                        </span>
                    </div>
                    <button
                        className="btn"
                        style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', fontSize: '0.8rem', padding: '8px' }}
                        onClick={() => {
                            if (window.confirm("Confirmar troca de óleo? Isso zerará o contador de 1000km.")) {
                                actions.resetarOleo();
                                actions.showModal("Óleo Trocado!", "Contador de óleo zerado com sucesso.");
                            }
                        }}
                    >
                        🛠️ Confirmar Troca de Óleo
                    </button>
                </div>

                <div style={{ marginTop: '16px' }}>
                    <div className="card-value">{dadosHoje.kmRodados.toFixed(1)}</div>
                    <div className="card-label">KM rodados</div>
                </div>
            </Card>

            {/* Ganhos Card */}
            <Card title="Ganhos" icon="💰">
                <div className="input-group">
                    <label>Quanto você fez hoje?</label>
                    <input
                        type="number"
                        placeholder="Ex: 180.00"
                        step="0.01"
                        value={ganhoInput}
                        onChange={(e) => setGanhoInput(e.target.value)}
                    />
                </div>
                <button className="btn" onClick={handleRegistrarGanho}>Registrar Ganho</button>
                <div style={{ marginTop: '16px' }}>
                    <div className="card-value positive">R$ {dadosHoje.ganhos.toFixed(2)}</div>
                    <div className="card-label">Total de hoje</div>
                </div>
            </Card>

            {/* Gastos Card */}
            <Card title="Gastos" icon="⛽">
                <div className="input-group">
                    <label>Gasolina (R$)</label>
                    <input
                        type="number"
                        placeholder="Ex: 50.00"
                        step="0.01"
                        value={gastosInput.gasolina}
                        onChange={(e) => setGastosInput({ ...gastosInput, gasolina: e.target.value })}
                    />
                </div>
                <div className="input-group">
                    <label>Manutenção (R$)</label>
                    <input
                        type="number"
                        placeholder="Ex: 30.00"
                        step="0.01"
                        value={gastosInput.manutencao}
                        onChange={(e) => setGastosInput({ ...gastosInput, manutencao: e.target.value })}
                    />
                </div>
                <div className="input-group">
                    <label>Antecipação (R$)</label>
                    <input
                        type="number"
                        placeholder="Ex: 20.00"
                        step="0.01"
                        value={gastosInput.antecipacao}
                        onChange={(e) => setGastosInput({ ...gastosInput, antecipacao: e.target.value })}
                    />
                </div>
                <button className="btn" onClick={handleRegistrarGastos}>Registrar Gastos</button>
            </Card>

            {/* Estatísticas Card */}
            <Card title="Estatísticas do Mês" icon="📊">
                <div className="stats-grid">
                    <div className="stat-box">
                        <div className="stat-box-label">Ganhos Entregas</div>
                        <div className="stat-box-value positive">R$ {totalGanhos.toFixed(2)}</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-box-label">Renda Fixa</div>
                        <div className="stat-box-value positive">R$ 2.300,00</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-box-label">Total Gastos</div>
                        <div className="stat-box-value negative">R$ {totalGastos.toFixed(2)}</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-box-label">Lucro Total</div>
                        <div className={`stat-box-value ${(lucroTotal + 2300) >= 0 ? 'positive' : 'negative'}`}>
                            R$ {(lucroTotal + 2300).toFixed(2)}
                        </div>
                    </div>
                    <div className="stat-box" style={{ gridColumn: '1 / -1' }}>
                        <div className="stat-box-label">KM Total</div>
                        <div className="stat-box-value neutral">{totalKm.toFixed(1)} km</div>
                    </div>
                </div>
            </Card>

            {/* Financeiro Card */}
            <Card title="Financeiro" icon="💵">
                <div className="financial-info">
                    <div className="financial-row">
                        <span className="financial-label">Meta Mensal:</span>
                        <span className="financial-value">R$ {METAS.MENSAL.toFixed(2)}</span>
                    </div>
                    <div className="financial-row">
                        <span className="financial-label">Acumulado:</span>
                        <span className="financial-value positive">R$ {lucroLiquidoMes.toFixed(2)}</span>
                    </div>
                    <div className="financial-row">
                        <span className="financial-label">Falta:</span>
                        <span className="financial-value neutral">R$ {faltaFinanceira.toFixed(2)}</span>
                    </div>
                </div>
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${percentualFinanceiro}%` }}></div>
                </div>
                <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#666', textAlign: 'center' }}>
                    {percentualFinanceiro.toFixed(1)}% do mês
                </div>
            </Card>

            {/* Metas Card */}
            <Card title="Metas" icon="🎯">
                <div className="metas-section">
                    <div className="meta-box">
                        <div className="meta-box-title">Meta Diária (Semana)</div>
                        <div className="meta-box-value">R$ {METAS.DIARIA_SEMANA.toFixed(2)}</div>
                    </div>
                    <div className="meta-box">
                        <div className="meta-box-title">Meta Diária (Finde)</div>
                        <div className="meta-box-value">R$ {METAS.DIARIA_FINDE.toFixed(2)}</div>
                    </div>
                    <div className="meta-box">
                        <div className="meta-box-title">Meta Mensal</div>
                        <div className="meta-box-value">R$ {METAS.MENSAL.toFixed(2)}</div>
                    </div>
                </div>
            </Card>

            {/* Estagio/Trabalho Card */}
            <Card title="Renda Fixa" icon="📚">
                <div className="metas-section">
                    <div className="meta-box">
                        <div className="meta-box-title">Estagio</div>
                        <div className="meta-box-value">R$ 1.100,00</div>
                    </div>
                    <div className="meta-box">
                        <div className="meta-box-title">Trabalho</div>
                        <div className="meta-box-value">R$ 1.200,00</div>
                    </div>
                    <div className="meta-box">
                        <div className="meta-box-title">Vale</div>
                        <div className="meta-box-value">R$ 500 + 300</div>
                    </div>
                </div>
            </Card>

            {/* Calendário e Histórico Card */}
            <Card title="Calendário e Histórico" icon="📅" fullWidth>
                <WeekCalendar
                    daysData={data.dias}
                    onDayClick={setSelectedDate}
                    selectedDate={selectedDate}
                    getDataHoje={getDataHoje}
                />
                <HistorySection
                    selectedDate={selectedDate}
                    dayData={selectedDate ? data.dias[selectedDate] : null}
                />
            </Card>

            <button className="btn btn-danger" onClick={() => {
                if (window.confirm("Tem certeza que deseja resetar tudo?")) {
                    actions.resetarTudo();
                }
            }}>🔄 Novo mes</button>
        </div>
    );
}
