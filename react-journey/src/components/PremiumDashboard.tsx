import React, { useState, useEffect, useMemo } from 'react';
import './PremiumDashboard.css';

// Função centralizada de cálculo — usada em TODOS os pontos do sistema
const calcProposta = (d: any): number => {
    const vp = typeof d.vlrP === 'number' ? d.vlrP : parseFloat(String(d.vlrP || '0').replace(',', '.')) || 0;
    const qtd = parseInt(d.qtd) || 1;
    const ent = typeof d.entrada === 'number' ? d.entrada : parseFloat(String(d.entrada || '0').replace(',', '.')) || 0;
    if (d.tipo === 'parcelado') {
        return (vp * qtd) + ent;
    }
    return vp; // avista: só o valor da proposta
};

const PremiumDashboard: React.FC<any> = ({ debts = [], onAdd, onUpdate, onRemove, onScheduleTask }) => {
    // 1. Inicialização direta e segura
    const [localDebts, setLocalDebts] = useState<any[]>(Array.isArray(debts) ? debts : []);
    const [filtro, setFiltro] = useState('Todos');
    const [searchQuery, setSearchQuery] = useState('');
    const [current, setCurrent] = useState(0);
    const [newDebt, setNewDebt] = useState({ titular: 'Felipe', banco: '', valor: '', vencimento: '5', tipo: 'avista', qtd: '1', entrada: '', vlrP: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [isAddPanelOpen, setIsAddPanelOpen] = useState(window.innerWidth > 768); // Fecha no mobile por padrão


    // Formatador estável
    const fmt = useMemo(() => new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL',
        minimumFractionDigits: 2 
    }), []);

    // Sincronização inteligente: só atualiza se o número de dívidas mudar ou se for o carregamento inicial
    useEffect(() => {
        if (Array.isArray(debts)) {
            setLocalDebts(prev => {
                // Se as listas forem idênticas em tamanho e o primeiro ID for igual, 
                // assumimos que é uma atualização de sync e evitamos sobrescrever o que o usuário está digitando
                if (prev.length === debts.length && prev.length > 0 && prev[0].id === debts[0].id) {
                    return prev; 
                }
                return debts;
            });
        }
    }, [debts]);

    // Reseta navegação ao trocar titular ou pesquisa
    useEffect(() => {
        setCurrent(0);
    }, [filtro, searchQuery]);

    // Lógica Derivada com Proteção Total
    const listaFiltrada = useMemo(() => {
        if (!Array.isArray(localDebts)) return [];
        return localDebts.filter(d => {
            if (!d) return false;
            if (filtro !== 'Todos' && d.titular !== filtro) return false;
            if (searchQuery && searchQuery.trim() !== '') {
                return d.banco && d.banco.toLowerCase().includes(searchQuery.toLowerCase());
            }
            return true;
        });
    }, [localDebts, filtro, searchQuery]);

    const totals = useMemo(() => {
        let orig = 0, prop = 0;
        listaFiltrada.forEach(d => {
            if (!d) return;
            const v = typeof d.valor === 'number' ? d.valor : parseFloat(String(d.valor).replace(',', '.')) || 0;
            orig += v;
            prop += calcProposta(d);
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

    const handleSyncById = async (id: any) => {
        const debt = localDebts.find(d => d.id === id);
        if (debt) {
            await handleSync(debt);
        }
    };

    const handleLocalEdit = (id: any, field: string, val: any) => {
        // Mantemos o valor original (string ou number) para não quebrar a digitação de decimais
        setLocalDebts(prev => prev.map(d => d.id === id ? { ...d, [field]: val } : d));
    };

    const handleStatusChange = async (id: any, newStatus: string) => {
        // 1. Atualiza local imediatamente para UX rápida
        setLocalDebts(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
        
        // 2. Busca o objeto atualizado e envia ao banco
        const target = localDebts.find(d => d.id === id);
        if (target) {
            await handleSync({ ...target, status: newStatus });
        }
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
                <div className={`premium-panel ${isAddPanelOpen ? 'open' : 'closed'}`}>
                    <div className="premium-panel-header" onClick={() => setIsAddPanelOpen(!isAddPanelOpen)} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isAddPanelOpen ? '15px' : '0' }}>
                        <h3 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--premium-accent)' }}>+ Novo Registro</h3>
                        <span style={{ fontSize: '1.2rem' }}>{isAddPanelOpen ? '−' : '+'}</span>
                    </div>
                    
                    {isAddPanelOpen && (
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
                            <label className="premium-label">Valor Original (R$)</label>
                            <input className="premium-input" type="number" placeholder="0.00" value={newDebt.valor} onChange={e=>setNewDebt({...newDebt, valor: e.target.value})}/>
                        </div>
                        <div>
                            <label className="premium-label">Condição</label>
                            <select className="premium-select" value={newDebt.tipo || 'avista'} onChange={e=>setNewDebt({...newDebt, tipo: e.target.value})}>
                                <option value="avista">À Vista</option>
                                <option value="parcelado">Parcelado</option>
                            </select>
                        </div>
                        <div>
                            <label className="premium-label">{newDebt.tipo === 'parcelado' ? 'Valor Parcela (R$)' : 'Valor Proposta (R$)'}</label>
                            <input className="premium-input" type="number" placeholder="0.00" value={newDebt.vlrP} onChange={e=>setNewDebt({...newDebt, vlrP: e.target.value})}/>
                        </div>
                        {newDebt.tipo === 'parcelado' && (
                            <>
                                <div>
                                    <label className="premium-label">Entrada (R$)</label>
                                    <input className="premium-input" type="number" placeholder="0.00" value={newDebt.entrada} onChange={e=>setNewDebt({...newDebt, entrada: e.target.value})}/>
                                </div>
                                <div>
                                    <label className="premium-label">Qtd Parcelas</label>
                                    <input className="premium-input" type="number" min="1" value={newDebt.qtd} onChange={e=>setNewDebt({...newDebt, qtd: e.target.value})}/>
                                </div>
                            </>
                        )}
                        <div>
                            <label className="premium-label">Vencimento (Dia)</label>
                            <input className="premium-input" type="number" min="1" max="31" value={newDebt.vencimento} onChange={e=>setNewDebt({...newDebt, vencimento: e.target.value})}/>
                        </div>
                        <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div className="premium-eco-label" style={{ margin: 0, flex: 1, textAlign: 'center', fontSize: '0.85rem' }}>
                                Preview Total: {fmt.format(calcProposta(newDebt))}
                            </div>
                            <button className="premium-btn-primary" style={{ flex: 1 }} onClick={async ()=>{
                                if(!newDebt.banco || !newDebt.valor || !onAdd) return alert("Informe banco e valor original!");
                                setIsSaving(true);
                                const vOrig = parseFloat(newDebt.valor) || 0;
                                const isParc = newDebt.tipo === 'parcelado';
                                await onAdd({ 
                                    titular: newDebt.titular, 
                                    banco: newDebt.banco, 
                                    valor: vOrig, 
                                    tipo: newDebt.tipo, 
                                    vlrP: parseFloat(newDebt.vlrP) || vOrig, 
                                    entrada: isParc ? (parseFloat(newDebt.entrada) || 0) : 0,
                                    qtd: isParc ? (parseInt(newDebt.qtd) || 1) : 1, 
                                    status: 'pendente',
                                    vencimento: parseInt(newDebt.vencimento) || 5
                                });
                                setNewDebt({ titular: newDebt.titular, banco: '', valor: '', vencimento: '5', tipo: 'avista', qtd: '1', entrada: '', vlrP: '' });
                                setIsSaving(false);
                            }}>+ Novo Registro</button>
                        </div>
                    )}
                </div>

                {/* Filtros de Navegação e Pesquisa */}
                <div className="premium-controls-container" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                    <nav className="premium-filter-group" style={{ margin: 0 }}>
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
                    <div className="premium-search-box" style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        background: 'rgba(10, 11, 26, 0.6)', 
                        border: '1px solid rgba(255, 255, 255, 0.1)', 
                        borderRadius: '12px', 
                        padding: '4px 16px',
                        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)'
                    }}>
                        <span style={{ marginRight: '10px', opacity: 0.4 }}>🔍</span>
                        <input 
                            type="text" 
                            placeholder="Pesquisar por nome da conta/banco..." 
                            value={searchQuery} 
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{ 
                                background: 'transparent', 
                                border: 'none', 
                                color: '#fff', 
                                width: '100%', 
                                padding: '10px 0', 
                                outline: 'none', 
                                fontSize: '0.95rem' 
                            }}
                        />
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery('')} 
                                style={{ 
                                    background: 'none', 
                                    border: 'none', 
                                    color: '#fff', 
                                    opacity: 0.4, 
                                    cursor: 'pointer',
                                    padding: '4px',
                                    fontSize: '1rem'
                                }}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                {/* Carrossel de Cartões */}
                <main className="premium-carousel-wrapper">
                    <div className="premium-carousel-container">
                        <div className="premium-carousel-track" style={{ transform: `translateX(-${current * 100}%)` }}>
                            {listaFiltrada.length > 0 ? listaFiltrada.map((d, i) => (
                                <div className="premium-carousel-slide" key={d.id || `d-${i}`}>
                                    <div className="premium-card">
                                        <div className={`premium-status-badge status-${d.status || 'pendente'}`}>
                                            {(d.status || 'pendente').toUpperCase()}
                                        </div>
                                        
                                        <div className="premium-form-row">
                                            <div><label className="premium-label">Banco</label><input className="premium-input" value={d.banco || ''} onChange={e=>handleLocalEdit(d.id, 'banco', e.target.value)} onBlur={()=>handleSyncById(d.id)}/></div>
                                        </div>
                                        
                                        <div className="premium-form-row">
                                            <div><label className="premium-label">Valor (R$)</label><input className="premium-input" value={d.valor || ''} onChange={e=>handleLocalEdit(d.id, 'valor', e.target.value)} onBlur={()=>handleSyncById(d.id)}/></div>
                                            <div><label className="premium-label">Condição</label><select className="premium-select" value={d.tipo || 'avista'} onChange={e=>{handleLocalEdit(d.id, 'tipo', e.target.value); handleSyncById(d.id);}}>
                                                <option value="avista">À Vista</option><option value="parcelado">Parcelado</option>
                                            </select></div>
                                        </div>
                                        
                                        <div className="premium-form-row">
                                            <div><label className="premium-label">{d.tipo === 'parcelado' ? 'Valor Parcela (R$)' : 'Proposta (R$)'}</label><input className="premium-input" value={d.vlrP || ''} onChange={e=>handleLocalEdit(d.id, 'vlrP', e.target.value)} onBlur={()=>handleSyncById(d.id)}/></div>
                                            <div><label className="premium-label">Parcelas</label><input className="premium-input" type="number" value={d.qtd || 1} readOnly={d.tipo==='avista'} onChange={e=>handleLocalEdit(d.id, 'qtd', e.target.value)} onBlur={()=>handleSyncById(d.id)}/></div>
                                        </div>
                                        
                                        {d.tipo === 'parcelado' && (
                                            <div className="premium-form-row">
                                                <div><label className="premium-label">Entrada (R$)</label><input className="premium-input" value={d.entrada || ''} onChange={e=>handleLocalEdit(d.id, 'entrada', e.target.value)} onBlur={()=>handleSyncById(d.id)} placeholder="0.00"/></div>
                                                <div><label className="premium-label">Vencimento (Dia)</label><input className="premium-input" type="number" min="1" max="31" value={d.vencimento || 5} onChange={e=>handleLocalEdit(d.id, 'vencimento', e.target.value)} onBlur={()=>handleSyncById(d.id)}/></div>
                                            </div>
                                        )}
                                        
                                        <div className="premium-eco-label">
                                            Total: {fmt.format(calcProposta(d))} | Eco: {fmt.format((parseFloat(d.valor) || 0) - calcProposta(d))}
                                        </div>
                                        
                                        <div className="premium-form-row" style={{alignItems: 'center', marginTop: '5px'}}>
                                            <select 
                                                className="premium-select" 
                                                style={{flex: 1}} 
                                                value={d.status || 'pendente'} 
                                                onChange={e => handleStatusChange(d.id, e.target.value)}
                                            >
                                                <option value="pendente">Pendente</option>
                                                <option value="andamento">Negociação</option>
                                                <option value="quitado">Quitado</option>
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
                                        <td style={{color: 'var(--premium-warning)'}}>{fmt.format(calcProposta(d))}</td>
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
