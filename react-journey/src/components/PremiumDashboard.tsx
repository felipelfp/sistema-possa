import React, { useState, useEffect, useMemo } from 'react';
import './PremiumDashboard.css';

const PremiumDashboard: React.FC<any> = ({ debts = [], onAdd, onUpdate, onRemove, onScheduleTask }) => {
    // 1. Inicialização direta e segura
    const [localDebts, setLocalDebts] = useState<any[]>(Array.isArray(debts) ? debts : []);
    const [filtro, setFiltro] = useState('Todos');
    const [current, setCurrent] = useState(0);
    const [newDebt, setNewDebt] = useState({ titular: 'Felipe', banco: '', valor: '', vencimento: '5', tipo: 'avista', qtd: '1' });
    const [isSaving, setIsSaving] = useState(false);

    // Formatador estável
    const fmt = useMemo(() => new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL',
        minimumFractionDigits: 2 
    }), []);

    // Sincronização de props para estado local
    useEffect(() => {
        if (Array.isArray(debts)) {
            setLocalDebts(debts);
        }
    }, [debts]);

    // Reseta navegação ao trocar titular
    useEffect(() => {
        setCurrent(0);
    }, [filtro]);

    // Lógica Derivada com Proteção Total
    const listaFiltrada = useMemo(() => {
        if (!Array.isArray(localDebts)) return [];
        return localDebts.filter(d => {
            if (!d) return false;
            if (filtro === 'Todos') return true;
            return d.titular === filtro;
        });
    }, [localDebts, filtro]);

    const totals = useMemo(() => {
        let orig = 0, prop = 0;
        listaFiltrada.forEach(d => {
            if (!d) return;
            // Sanitização de valores para evitar NaN
            const v = typeof d.valor === 'number' ? d.valor : parseFloat(String(d.valor).replace(',', '.')) || 0;
            const vp = typeof d.vlrP === 'number' ? d.vlrP : parseFloat(String(d.vlrP).replace(',', '.')) || 0;
            const q = parseInt(d.qtd) || 1;
            const ent = typeof d.entrada === 'number' ? d.entrada : parseFloat(String(d.entrada).replace(',', '.')) || 0;
            orig += v;
            prop += (vp * q) + (d.tipo === 'parcelado' ? ent : 0);
        });
        return { orig, prop, eco: Math.max(0, orig - prop) };
    }, [listaFiltrada]);

    // Handlers
    const handleSync = async (debt: any) => {
        if (!debt || !debt.id || !onUpdate) return;
        try {
            setIsSaving(true);
            await onUpdate(debt);
            setTimeout(() => setIsSaving(false), 800);
        } catch (e) {
            console.error("Sync Error:", e);
            setIsSaving(false);
        }
    };

    const handleLocalEdit = (id: any, field: string, val: any) => {
        setLocalDebts(prev => prev.map(d => d.id === id ? { ...d, [field]: val } : d));
    };

    const move = (dir: number) => {
        if (listaFiltrada.length <= 1) return;
        setCurrent(prev => {
            const next = (prev + dir + listaFiltrada.length) % listaFiltrada.length;
            return isNaN(next) ? 0 : next;
        });
    };

    // Verificação de renderização (debug silencioso)
    console.log('[PremiumDashboard] List Size:', listaFiltrada.length);

    return (
        <div className="premium-dashboard">
            <div className="premium-container">
                {/* Cabeçalho de Resumo */}
                <header className="premium-summary">
                    <div className="premium-summary-card">
                        <span className="label">Dívida Original</span>
                        <span className="value" style={{color: '#3b82f6'}}>{fmt.format(totals.orig)}</span>
                    </div>
                    <div className="premium-summary-card">
                        <span className="label">Proposta Atual</span>
                        <span className="value" style={{color: '#f59e0b'}}>{fmt.format(totals.prop)}</span>
                    </div>
                    <div className="premium-summary-card">
                        <span className="label">Economia Estimada</span>
                        <span className="value" style={{color: '#10b981'}}>{fmt.format(totals.eco)}</span>
                    </div>
                </header>

                {/* Área de Adição Rápida */}
                <div className="premium-panel">
                    <div className="premium-grid-add">
                        <div>
                            <label className="premium-label">Responsável</label>
                            <select className="premium-select" value={newDebt.titular} onChange={e=>setNewDebt({...newDebt, titular: e.target.value})}>
                                <option>Felipe</option><option>Fernanda</option><option>Casa</option>
                            </select>
                        </div>
                        <div>
                            <label className="premium-label">Origem/Banco</label>
                            <input className="premium-input" placeholder="Ex: Bradesco" value={newDebt.banco} onChange={e=>setNewDebt({...newDebt, banco: e.target.value})}/>
                        </div>
                        <div>
                            <label className="premium-label">Condição</label>
                            <select className="premium-select" value={newDebt.tipo || 'avista'} onChange={e=>setNewDebt({...newDebt, tipo: e.target.value})}>
                                <option value="avista">À Vista</option>
                                <option value="parcelado">Parcelado</option>
                            </select>
                        </div>
                        <div>
                            <label className="premium-label">Valor (R$)</label>
                            <input className="premium-input" type="number" placeholder="0.00" value={newDebt.valor} onChange={e=>setNewDebt({...newDebt, valor: e.target.value})}/>
                        </div>
                        {newDebt.tipo === 'parcelado' && (
                            <div>
                                <label className="premium-label">Parcelas</label>
                                <input className="premium-input" type="number" min="1" value={newDebt.qtd} onChange={e=>setNewDebt({...newDebt, qtd: e.target.value})}/>
                            </div>
                        )}
                        <div>
                            <label className="premium-label">Vencimento (Dia)</label>
                            <input className="premium-input" type="number" min="1" max="31" value={newDebt.vencimento} onChange={e=>setNewDebt({...newDebt, vencimento: e.target.value})}/>
                        </div>
                        <button className="premium-btn-primary" onClick={async ()=>{
                            if(!newDebt.banco || !newDebt.valor || !onAdd) return alert("Informe banco e valor!");
                            setIsSaving(true);
                            await onAdd({ 
                                titular: newDebt.titular, 
                                banco: newDebt.banco, 
                                valor: parseFloat(newDebt.valor), 
                                tipo: newDebt.tipo, 
                                vlrP: newDebt.tipo === 'parcelado' ? parseFloat(newDebt.valor) / (parseInt(newDebt.qtd) || 1) : parseFloat(newDebt.valor), 
                                qtd: parseInt(newDebt.qtd) || 1, 
                                status: 'pendente',
                                vencimento: parseInt(newDebt.vencimento) || 5
                            });
                            setNewDebt({...newDebt, banco: '', valor: '', vencimento: '5', tipo: 'avista', qtd: '1'});
                            setIsSaving(false);
                        }}>+ Novo Registro</button>
                    </div>
                </div>

                {/* Filtros de Navegação */}
                <nav className="premium-filter-group">
                    {['Todos', 'Felipe', 'Fernanda', 'Casa'].map(f => (
                        <button 
                            key={f} 
                            className={`premium-filter-btn ${filtro === f ? 'active' : ''}`} 
                            onClick={()=>setFiltro(f)}
                        >
                            {f}
                        </button>
                    ))}
                </nav>

                {/* Carrossel de Cartões */}
                <main className="premium-carousel-wrapper">
                    <div className="premium-carousel-container">
                        <div className="premium-carousel-track" style={{ transform: `translateX(-${current * 100}%)` }}>
                            {listaFiltrada.length > 0 ? listaFiltrada.map((d, i) => (
                                <div className="premium-carousel-slide" key={d.id || `d-${i}`}>
                                    <div className="premium-card">
                                        <div className="premium-status-badge" style={{ 
                                            borderColor: d.status==='quitado'?'#10b981':(d.status==='andamento'?'#f59e0b':'#71717a'), 
                                            color: d.status==='quitado'?'#10b981':(d.status==='andamento'?'#f59e0b':'#71717a') 
                                        }}>
                                            {(d.status || 'pendente').toUpperCase()}
                                        </div>
                                        
                                        <div className="premium-form-row">
                                            <div><label className="premium-label">Titular</label><strong style={{display: 'block', padding: '8px 0'}}>{d.titular}</strong></div>
                                            <div><label className="premium-label">Banco</label><input className="premium-input" value={d.banco || ''} onChange={e=>handleLocalEdit(d.id, 'banco', e.target.value)} onBlur={()=>handleSync(d)}/></div>
                                        </div>
                                        
                                        <div className="premium-form-row">
                                            <div><label className="premium-label">Valor (R$)</label><input className="premium-input" type="number" value={d.valor || ''} onChange={e=>handleLocalEdit(d.id, 'valor', parseFloat(e.target.value))} onBlur={()=>handleSync(d)}/></div>
                                            <div><label className="premium-label">Condição</label><select className="premium-select" value={d.tipo || 'avista'} onChange={e=>{handleLocalEdit(d.id, 'tipo', e.target.value); handleSync({...d, tipo: e.target.value})}}>
                                                <option value="avista">À Vista</option><option value="parcelado">Parcelado</option>
                                            </select></div>
                                        </div>
                                        
                                        <div className="premium-form-row">
                                            <div><label className="premium-label">Proposta (R$)</label><input className="premium-input" type="number" value={d.vlrP || ''} onChange={e=>handleLocalEdit(d.id, 'vlrP', parseFloat(e.target.value))} onBlur={()=>handleSync(d)}/></div>
                                            <div><label className="premium-label">Parcelas</label><input className="premium-input" type="number" value={d.qtd || 1} readOnly={d.tipo==='avista'} onChange={e=>handleLocalEdit(d.id, 'qtd', parseInt(e.target.value))} onBlur={()=>handleSync(d)}/></div>
                                        </div>
                                        
                                        {d.tipo === 'parcelado' && (
                                            <div className="premium-form-row">
                                                <div><label className="premium-label">Entrada (R$)</label><input className="premium-input" type="number" value={d.entrada || ''} onChange={e=>handleLocalEdit(d.id, 'entrada', parseFloat(e.target.value))} onBlur={()=>handleSync(d)} placeholder="0.00"/></div>
                                                <div><label className="premium-label">Vencimento (Dia)</label><input className="premium-input" type="number" min="1" max="31" value={d.vencimento || 5} onChange={e=>handleLocalEdit(d.id, 'vencimento', parseInt(e.target.value))} onBlur={()=>handleSync(d)}/></div>
                                            </div>
                                        )}
                                        
                                        <div className="premium-eco-label">
                                            Total: {fmt.format((parseFloat(d.vlrP) || 0) * (parseInt(d.qtd) || 1) + (d.tipo === 'parcelado' ? (parseFloat(d.entrada) || 0) : 0))} | Eco: {fmt.format((parseFloat(d.valor) || 0) - (((parseFloat(d.vlrP) || 0) * (parseInt(d.qtd) || 1)) + (d.tipo === 'parcelado' ? (parseFloat(d.entrada) || 0) : 0)))}
                                        </div>
                                        
                                        <div className="premium-form-row" style={{alignItems: 'center', marginTop: '5px'}}>
                                            <select className="premium-select" style={{flex: 1}} value={d.status || 'pendente'} onChange={e=>{handleLocalEdit(d.id, 'status', e.target.value); handleSync({...d, status: e.target.value})}}>
                                                <option value="pendente">Pendente</option><option value="andamento">Negociação</option><option value="quitado">Quitado</option>
                                            </select>
                                            {onScheduleTask && <button style={{background: 'none', border: 'none', color: '#3498db', cursor: 'pointer', fontSize: '13px', marginLeft: '5px'}} onClick={()=>onScheduleTask({title: `Conta: ${d.banco} - ${d.titular}`, referenceId: d.id, referenceType: 'DEBT'})}>Agendar Tarefa</button>}
                                            <button className="premium-remove-link" onClick={()=>{if(window.confirm("Remover conta?")) onRemove(d.id)}}>Remover</button>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="premium-carousel-slide">
                                    <div className="premium-card" style={{textAlign: 'center', padding: '40px'}}>
                                        <p style={{color: 'var(--premium-text-muted)'}}>Nenhum registro encontrado para este filtro.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {listaFiltrada.length > 1 && (
                        <div className="premium-nav-controls">
                            <button className="premium-nav-btn" onClick={()=>move(-1)}>‹</button>
                            <div className="premium-nav-info">
                                <span>{current + 1} / {listaFiltrada.length}</span>
                            </div>
                            <button className="premium-nav-btn" onClick={()=>move(1)}>›</button>
                        </div>
                    )}
                </main>

                {/* Relatório Final */}
                <div className="premium-report-section">
                    <div className="premium-report-header">
                        <h3 style={{margin: 0}}>Relatório Consolidado</h3>
                    </div>
                    <div className="premium-table-container">
                        <table className="premium-report-table">
                            <thead>
                                <tr>
                                    <th>Banco</th>
                                    <th>Valor Original</th>
                                    <th>Proposta</th>
                                    <th>Status</th>
                                    {onScheduleTask && <th>Ações</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {listaFiltrada.map((d, i) => d && (
                                    <tr key={d.id || `r-${i}`}>
                                        <td style={{fontWeight: 600}}>{d.banco}</td>
                                        <td>{fmt.format(d.valor || 0)}</td>
                                        <td style={{color: 'var(--premium-warning)'}}>{fmt.format((d.vlrP || 0) * (d.qtd || 1) + (d.tipo === 'parcelado' ? (parseFloat(d.entrada) || 0) : 0))}</td>
                                        <td className={`status-${d.status || 'pendente'}`}>{(d.status || 'pendente').toUpperCase()}</td>
                                        {onScheduleTask && <td>
                                            <button style={{background: 'rgba(52, 152, 219, 0.2)', border: '1px solid #3498db', color: '#3498db', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem'}} onClick={()=>onScheduleTask({title: `Conta: ${d.banco} - ${d.titular}`, referenceId: d.id, referenceType: 'DEBT'})}>Agendar Tarefa</button>
                                        </td>}
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="premium-report-tfoot">
                                <tr>
                                    <td style={{fontWeight: 800, color: 'white'}}>TOTAIS FILTRADOS</td>
                                    <td style={{fontWeight: 800, color: 'var(--premium-accent)'}}>{fmt.format(totals.orig)}</td>
                                    <td style={{fontWeight: 800, color: 'var(--premium-warning)'}}>{fmt.format(totals.prop)}</td>
                                    <td style={{fontWeight: 800, color: 'var(--premium-success)'}}>
                                        Economia: {fmt.format(totals.eco)}
                                    </td>
                                    {onScheduleTask && <td></td>}
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>

            {isSaving && <div className="premium-saving-float">Sincronizando...</div>}
        </div>
    );
};

export default PremiumDashboard;
