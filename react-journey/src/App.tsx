import React, { useEffect, useState } from 'react';
import Clock from './components/Clock';
import JourneyInfo from './components/JourneyInfo';
import ReportView from './components/ReportView';
import Objectives, { initialObjectives, Objective } from './components/Objectives';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import LoginView from './components/LoginView';
import PremiumDashboard from './components/PremiumDashboard';
import TasksView from './components/TasksView';
import DeliveriesDashboard from './components/DeliveriesDashboard';
import TaskNotificationWidget from './components/TaskNotificationWidget';
import TaskModal, { Task } from './components/TaskModal';
import { Deposit } from './components/DepositForm';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import './App.css';

import { api } from './services/api';

export const initialDebts = [
    { id: 1, titular: "Casa", banco: "IPTU", valor: 50.00, tipo: "avista", vlrP: 50.00, qtd: 1, status: "pendente" },
    { id: 2, titular: "Casa", banco: "Celular", valor: 99.00, tipo: "avista", vlrP: 99.00, qtd: 1, status: "pendente" },
    { id: 3, titular: "Felipe", banco: "TIM", valor: 110.13, tipo: "avista", vlrP: 44.05, qtd: 1, status: "pendente" },
    { id: 4, titular: "Casa", banco: "Internet", valor: 130.00, tipo: "avista", vlrP: 130.00, qtd: 1, status: "pendente" },
    { id: 5, titular: "Felipe", banco: "ShopeePay", valor: 138.74, tipo: "avista", vlrP: 55.25, qtd: 1, status: "pendente" },
    { id: 6, titular: "Fernanda", banco: "ShopeePay", valor: 139.88, tipo: "avista", vlrP: 69.93, qtd: 1, status: "pendente" },
    { id: 7, titular: "Felipe", banco: "Vivo", valor: 145.84, tipo: "avista", vlrP: 138.54, qtd: 1, status: "pendente" },
    { id: 8, titular: "Casa", banco: "Luz", valor: 150.00, tipo: "avista", vlrP: 150.00, qtd: 1, status: "pendente" },
    { id: 9, titular: "Casa", banco: "Condominio", valor: 350.00, tipo: "avista", vlrP: 350.00, qtd: 1, status: "pendente" },
    { id: 10, titular: "Felipe", banco: "Santander", valor: 545.87, tipo: "avista", vlrP: 85.33, qtd: 1, status: "pendente" },
    { id: 11, titular: "Felipe", banco: "Nubank", valor: 700.48, tipo: "avista", vlrP: 218.80, qtd: 1, status: "pendente" },
    { id: 12, titular: "Felipe", banco: "Senff", valor: 999.88, tipo: "avista", vlrP: 712.54, qtd: 1, status: "pendente" },
    { id: 13, titular: "Felipe", banco: "Pefisa (ARC4)", valor: 1247.29, tipo: "avista", vlrP: 296.89, qtd: 1, status: "pendente" },
    { id: 14, titular: "Felipe", banco: "Claro", valor: 1250.94, tipo: "avista", vlrP: 493.87, qtd: 1, status: "pendente" },
    { id: 15, titular: "Fernanda", banco: "Simplic", valor: 1301.73, tipo: "avista", vlrP: 310.41, qtd: 1, status: "pendente" },
    { id: 16, titular: "Felipe", banco: "Casas Bahia (Rec)", valor: 1348.11, tipo: "avista", vlrP: 1241.04, qtd: 1, status: "pendente" },
    { id: 17, titular: "Casa", banco: "Aluguel", valor: 1350.00, tipo: "avista", vlrP: 1350.00, qtd: 1, status: "pendente" },
    { id: 18, titular: "Fernanda", banco: "Havan", valor: 1393.84, tipo: "avista", vlrP: 1064.29, qtd: 1, status: "pendente" },
    { id: 19, titular: "Felipe", banco: "Renner", valor: 1842.31, tipo: "avista", vlrP: 712.76, qtd: 1, status: "pendente" },
    { id: 20, titular: "Felipe", banco: "Magalu (Recovery)", valor: 1729.88, tipo: "avista", vlrP: 411.35, qtd: 1, status: "pendente" },
    { id: 21, titular: "Felipe", banco: "B. Brasil (Ativos)", valor: 2002.50, tipo: "parcelado", vlrP: 300.00, qtd: 7, status: "pendente" },
    { id: 22, titular: "Fernanda", banco: "Nubank", valor: 2807.18, tipo: "avista", vlrP: 1473.86, qtd: 1, status: "pendente" },
    { id: 23, titular: "Felipe", banco: "Neon", valor: 3103.18, tipo: "avista", vlrP: 471.37, qtd: 1, status: "pendente" },
    { id: 24, titular: "Felipe", banco: "Estacio", valor: 4899.90, tipo: "avista", vlrP: 4378.28, qtd: 1, status: "pendente" },
    { id: 25, titular: "Felipe", banco: "Havan", valor: 5311.02, tipo: "avista", vlrP: 765.49, qtd: 1, status: "pendente" },
    { id: 26, titular: "Fernanda", banco: "Santander", valor: 8239.27, tipo: "avista", vlrP: 1472.72, qtd: 1, status: "pendente" },
    { id: 27, titular: "Felipe", banco: "Banco Pan (BTG)", valor: 52963.55, tipo: "avista", vlrP: 8956.14, qtd: 1, status: "pendente" }
];

const DebtNotificationTray: React.FC<{ debts: any[]; onUpdateDebt: (d: any) => void }> = ({ debts, onUpdateDebt }) => {
    const [notificacoesVisiveis, setNotificacoesVisiveis] = useState<any[]>([]);

    useEffect(() => {
        if (!debts || !Array.isArray(debts)) return;
        
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().catch(() => {});
        }

        const hoje = new Date();
        const diaAtual = hoje.getDate();
        const amanha = new Date(hoje.getFullYear(), hoje.getMonth(), diaAtual + 1);
        const diaAmanha = amanha.getDate();

        const contasAlvo = debts.filter(d => {
            if (!d || d.status === 'quitado') return false;
            const v = parseInt(d.vencimento) || 5;
            return v === diaAtual || v === diaAmanha;
        });

        setNotificacoesVisiveis(contasAlvo);

        contasAlvo.forEach(d => {
            const v = parseInt(d.vencimento) || 5;
            const tipoDia = v === diaAtual ? 'HOJE' : 'AMANHÃ';
            const storageKey = `notif_sent_${d.id}_${hoje.toISOString().split('T')[0]}`;
            const sentCount = parseInt(localStorage.getItem(storageKey) || '0');

            if (sentCount < 2 && 'Notification' in window && Notification.permission === 'granted') {
                try {
                    new Notification(`Lembrete de Conta: ${d.banco}`, {
                        body: `Sua conta de ${d.titular} vence ${tipoDia} (Dia ${v}). Já realizou o pagamento?`,
                        icon: '/icon.svg'
                    });
                    localStorage.setItem(storageKey, String(sentCount + 1));
                } catch (e) {
                    console.error('Erro ao enviar notificacao nativa:', e);
                }
            }
        });
    }, [debts]);

    if (notificacoesVisiveis.length === 0) return null;

    return (
        <div className="debt-notification-tray" style={{
            margin: '0 24px 20px 24px',
            padding: '16px',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.25))',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            borderRadius: '16px',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontWeight: 'bold' }}>
                    <span>⚠️</span>
                    <span>Lembrete de Vencimento (Amanhã e Hoje)</span>
                </div>
                <span style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>Notificação dupla diária ativa</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {notificacoesVisiveis.map((d, index) => {
                    const v = parseInt(d.vencimento) || 5;
                    const isHoje = v === new Date().getDate();
                    const vlr = d.tipo === 'parcelado' ? ((parseFloat(d.vlrP) || 0) * (parseInt(d.qtd) || 1)) + (parseFloat(d.entrada) || 0) : parseFloat(d.vlrP) || 0;
                    return (
                        <div key={d.id || index} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'rgba(0, 0, 0, 0.3)',
                            padding: '10px 14px',
                            borderRadius: '10px',
                            borderLeft: `4px solid ${isHoje ? '#ef4444' : '#f59e0b'}`,
                            flexWrap: 'wrap',
                            gap: '10px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <strong style={{ color: '#fff' }}>{d.banco}</strong>
                                <span style={{ color: '#a1a1aa', fontSize: '0.85rem' }}>({d.titular})</span>
                                <span style={{
                                    background: isHoje ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                                    color: isHoje ? '#ef4444' : '#f59e0b',
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold'
                                }}>
                                    Vence {isHoje ? 'HOJE' : 'AMANHÃ'} (Dia {v})
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ color: '#e4e4e7', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(vlr)}
                                </span>
                                <button style={{
                                    background: '#10b981',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)'
                                }} onClick={() => {
                                    if (window.confirm(`Confirmar pagamento de ${d.banco}? O status mudará para Quitado.`)) {
                                        onUpdateDebt({ ...d, status: 'quitado' });
                                    }
                                }}>
                                    ✅ Já Paguei
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const AppContent: React.FC = () => {
    const { theme } = useTheme();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activeSection, setActiveSection] = useState('dashboard');
    const [exchangeRate, setExchangeRate] = useState(5.00);
    const [transactions, setTransactions] = useState<Deposit[]>([]);
    const [objectives, setObjectives] = useState<Objective[]>(initialObjectives);
    const [debts, setDebts] = useState<any[]>(initialDebts);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    
    // Global Task Scheduling
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [taskModalData, setTaskModalData] = useState<Partial<Task> | undefined>(undefined);
    
    const openTaskModal = (initialData?: Partial<Task>) => {
        setTaskModalData(initialData);
        setIsTaskModalOpen(true);
    };
    
    const handleGlobalSaveTask = async (taskData: Omit<Task, 'id' | 'completed'>) => {
        if (taskModalData?.id) {
            const updated = { ...taskData, id: taskModalData.id, completed: taskModalData.completed || false };
            await api.updateTask(updated);
            setTasks(prev => prev.map(t => t.id === taskModalData.id ? updated : t));
        } else {
            const newTask = await api.addTask({ ...taskData, completed: false });
            setTasks(prev => [...prev, newTask]);
        }
    };

    useEffect(() => {
        // Verificar se já existe um login salvo
        const savedAuth = localStorage.getItem('is_authenticated');
        if (savedAuth === 'true') {
            setIsAuthenticated(true);
        }

        const handleBeforeInstall = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstall);
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    }, []);

    useEffect(() => {
        // Busca automática de cotação USD (Gratuita - AwesomeAPI)
        const fetchExchangeRate = async () => {
            try {
                const response = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL');
                const data = await response.json();
                const rate = parseFloat(data.USDBRL.bid);
                if (rate > 0) {
                    setExchangeRate(rate);
                    await api.updateSettings({ exchangeRate: rate });
                }
            } catch (err) {
                console.error("Erro ao buscar cotação automática:", err);
            }
        };

        if (isAuthenticated) {
            localStorage.setItem('is_authenticated', 'true');
            fetchExchangeRate();
            loadData();
        } else {
            localStorage.removeItem('is_authenticated');
        }
    }, [isAuthenticated]);

    const loadData = async () => {
        try {
            const txs = await api.getTransactions();
            if (Array.isArray(txs)) setTransactions(txs);

            const objs = await api.getObjectives();
            if (Array.isArray(objs)) {
                const combined = [...initialObjectives];
                objs.forEach((apiObj: Objective) => {
                    const exists = combined.find(o => o.id === apiObj.id);
                    if (!exists) combined.push(apiObj);
                    else {
                        const index = combined.findIndex(o => o.id === apiObj.id);
                        combined[index] = { ...combined[index], ...apiObj };
                    }
                });
                setObjectives(combined);
            }

            const dbts = await api.getDebts();
            if (Array.isArray(dbts)) {
                // Aplica overrides salvos para contas padrão (edições feitas pelo usuário)
                const debtOverrides: Record<string, any> = JSON.parse(localStorage.getItem('debt_overrides') || '{}');
                const baseDebts = initialDebts.map(d => {
                    const override = debtOverrides[String(d.id)];
                    return override ? { ...d, ...override } : d;
                });
                // O banco só tem contas criadas pelo usuário (com id que começa com 'user-' ou timestamp)
                const contasDoUsuario = dbts.filter((apiDebt: any) => {
                    // Filtra somente contas verdadeiramente novas (criadas pelo usuário via UI)
                    // Contas do código têm IDs numéricos de 1-99; contas do usuário têm ID string longo ou timestamp
                    const debtId = String(apiDebt.id || '');
                    const isNumericShortId = /^\d{1,2}$/.test(debtId);
                    if (isNumericShortId) return false; // Ignora cópias das contas padrão no banco
                    // Verifica se não é duplicata das contas padrão por banco+titular
                    const isDuplicate = baseDebts.some(d =>
                        d.banco === apiDebt.banco && d.titular === apiDebt.titular
                    );
                    return !isDuplicate;
                });
                // Combina: sempre as 18 padrão (com overrides) + contas novas do usuário
                setDebts([...baseDebts, ...contasDoUsuario]);
            }
            
            const tsks = await api.getTasks();
            if (Array.isArray(tsks)) {
                setTasks(tsks);
            }
        } catch (err) {
            console.error("FALHA AO CARREGAR DADOS:", err);
        }
    };

    const handleDeposit = async (deposit: Deposit, objectiveId?: string) => {
        try {
            const newTx = await api.addTransaction(deposit);
            setTransactions(prev => [newTx, ...prev]);

            if (objectiveId) {
                const targetObj = objectives.find(o => o.id === objectiveId);
                if (targetObj) {
                    const updated = { ...targetObj, accumulatedBRL: targetObj.accumulatedBRL + deposit.amountBRL };
                    await api.updateObjective(updated);
                    setObjectives(prev => prev.map(o => o.id === objectiveId ? updated : o));
                }
            }
        } catch (e) {
            console.error("Erro no depósito:", e);
        }
    };

    const handleToggleObjective = async (id: string) => {
        const obj = objectives.find(o => o.id === id);
        if (obj) {
            const updated = { ...obj, completed: !obj.completed };
            await api.updateObjective(updated);
            setObjectives(prev => prev.map(o => o.id === id ? updated : o));
        }
    };

    const handleAddObjective = async (newObj: Partial<Objective>) => {
        const obj: Objective = {
            id: `obj-${Date.now()}`,
            icon: newObj.icon || '🎯',
            name: newObj.name || '',
            targetBRL: newObj.targetBRL || 0,
            targetUSD: (newObj.targetBRL || 0) / exchangeRate,
            accumulatedBRL: 0,
            completed: false,
            category: newObj.category as any
        };
        await api.saveObjective(obj);
        setObjectives(prev => [...prev, obj]);
    };

    const handleDeleteObjective = async (id: string) => {
        await api.deleteObjective(id);
        setObjectives(prev => prev.filter(o => o.id !== id));
    };

    const handleDeleteTransaction = async (id: number) => {
        await api.deleteTransaction(id);
        setTransactions(prev => prev.filter(t => t.id !== id));
    };

    const handleDebtCRUD = {
        add: async (d: any) => {
            const newD = await api.addDebt(d);
            setDebts(prev => [...prev, newD]);
              // Auto-generate tasks for installments
            if (newD.tipo === 'parcelado' && parseInt(newD.qtd) > 0) {
                const numParcelas = parseInt(newD.qtd);
                const valorParcela = typeof newD.vlrP === 'number' ? newD.vlrP : parseFloat(String(newD.vlrP).replace(',', '.'));
                const diaVencimento = parseInt(newD.vencimento) || 5;
                
                for (let i = 1; i <= numParcelas; i++) {
                    const taskDateObj = new Date();
                    taskDateObj.setMonth(taskDateObj.getMonth() + (i - 1));
                    
                    // Ajusta para o dia especificado, cuidando com meses mais curtos
                    const lastDayOfMonth = new Date(taskDateObj.getFullYear(), taskDateObj.getMonth() + 1, 0).getDate();
                    taskDateObj.setDate(Math.min(diaVencimento, lastDayOfMonth));
                    
                    const taskDate = taskDateObj.toISOString().split('T')[0];
                    const newTask = await api.addTask({
                        title: `Contrato ${newD.banco}: Parcela ${i}/${numParcelas}`,
                        date: taskDate,
                        description: `Pagamento da parcela ${i} de ${numParcelas} no valor de R$ ${valorParcela.toFixed(2)} (${newD.titular})`,
                        completed: false,
                        status: 'todo',
                        priority: 'normal',
                        referenceId: newD.id,
                        referenceType: 'DEBT'
                    });
                    setTasks(prev => [...prev, newTask]);
                }
            }
        },
        update: async (d: any) => {
            const oldDebt = debts.find(item => item.id === d.id);
            await api.updateDebt(d);
            setDebts(prev => prev.map(item => item.id === d.id ? d : item));
            
            // Persiste edições de contas padrão (ID numérico curto) no localStorage
            const debtId = String(d.id || '');
            if (/^\d{1,2}$/.test(debtId)) {
                const overrides: Record<string, any> = JSON.parse(localStorage.getItem('debt_overrides') || '{}');
                overrides[debtId] = { status: d.status, vlrP: d.vlrP, qtd: d.qtd, entrada: d.entrada, vencimento: d.vencimento, tipo: d.tipo };
                localStorage.setItem('debt_overrides', JSON.stringify(overrides));
            }
            
            // Re-generate if newly parcelado or vencimento changed
            if (d.tipo === 'parcelado' && (!oldDebt || oldDebt.tipo !== 'parcelado' || oldDebt.vencimento !== d.vencimento)) {
                const numParcelas = parseInt(d.qtd);
                const valorParcela = typeof d.vlrP === 'number' ? d.vlrP : parseFloat(String(d.vlrP).replace(',', '.'));
                const diaVencimento = parseInt(d.vencimento) || 5;

                for (let i = 1; i <= numParcelas; i++) {
                    const taskDateObj = new Date();
                    taskDateObj.setMonth(taskDateObj.getMonth() + (i - 1));
                    const lastDayOfMonth = new Date(taskDateObj.getFullYear(), taskDateObj.getMonth() + 1, 0).getDate();
                    taskDateObj.setDate(Math.min(diaVencimento, lastDayOfMonth));

                    const taskDate = taskDateObj.toISOString().split('T')[0];
                    const newTask = await api.addTask({
                        title: `Contrato ${d.banco}: Parcela ${i}/${numParcelas}`,
                        date: taskDate,
                        description: `Pagamento da parcela ${i} de ${numParcelas} no valor de R$ ${valorParcela.toFixed(2)} (${d.titular})`,
                        completed: false,
                        status: 'todo',
                        priority: 'normal',
                        referenceId: d.id,
                        referenceType: 'DEBT'
                    });
                    setTasks(prev => [...prev, newTask]);
                }
            }
        },
        remove: async (id: any) => {
            await api.deleteDebt(id);
            setDebts(prev => prev.filter(item => item.id !== id));
            // Optional: delete associated tasks? Maybe better to keep them as "cancelled" or let user delete.
        }
    };

    const accumulatedBRL = transactions.reduce((sum, tx) => sum + tx.amountBRL, 0);
    const totalDebtsBRL = debts.reduce((sum, d) => sum + (typeof d.valor === 'number' ? d.valor : parseFloat(String(d.valor).replace(',', '.')) || 0), 0);
    const totalObjectivesBRL = objectives.reduce((sum, obj) => sum + obj.targetBRL, 0);
    const totalTargetBRL = totalDebtsBRL + totalObjectivesBRL;
    const totalTargetUSD = exchangeRate > 0 ? totalTargetBRL / exchangeRate : 0;

    const getGanhosDoDiaPendentes = () => {
        try {
            const dias = JSON.parse(localStorage.getItem('delivery_dias') || '{}');
            const hoje = new Date().toISOString().split('T')[0];
            const ganhosHoje = dias[hoje]?.ganhos || 0;
            const depositadoHoje = transactions
                .filter(tx => tx.date === hoje && typeof tx.bank === 'string' && tx.bank.toLowerCase().includes('entrega'))
                .reduce((sum, tx) => sum + tx.amountBRL, 0);
            return Math.max(0, ganhosHoje - depositadoHoje);
        } catch {
            return 0;
        }
    };
    const ganhosDoDia = getGanhosDoDiaPendentes();

    const renderContent = () => {
        try {
            switch (activeSection) {
                case 'dashboard':
                    return (
                        <DashboardView
                            exchangeRate={exchangeRate}
                            transactions={transactions}
                            onDeposit={handleDeposit}
                            accumulatedBRL={accumulatedBRL}
                            totalTargetBRL={totalTargetBRL}
                            totalTargetUSD={totalTargetUSD}
                            objectives={objectives}
                            debts={debts}
                            onDelete={handleDeleteTransaction}
                            ganhosDoDia={ganhosDoDia}
                        />
                    );
                case 'meta':
                    return (
                        <JourneyInfo 
                            objectives={objectives} 
                            transactions={transactions} 
                            exchangeRate={exchangeRate}
                            accumulatedBRL={accumulatedBRL}
                            targetBRL={totalTargetBRL}
                            targetUSD={totalTargetUSD}
                        />
                    );
                case 'br_goals':
                    return (
                        <Objectives
                            category="BR"
                            objectives={objectives}
                            onToggleComplete={handleToggleObjective}
                            onAddObjective={handleAddObjective}
                            onDeleteObjective={handleDeleteObjective}
                            exchangeRate={exchangeRate}
                            onScheduleTask={openTaskModal}
                        />
                    );
                case 'usa_goals':
                    return (
                        <Objectives
                            category="USA"
                            objectives={objectives}
                            onToggleComplete={handleToggleObjective}
                            onAddObjective={handleAddObjective}
                            onDeleteObjective={handleDeleteObjective}
                            exchangeRate={exchangeRate}
                            onScheduleTask={openTaskModal}
                        />
                    );
                case 'emergency':
                    return (
                        <Objectives
                            category="EMERGENCY"
                            objectives={objectives}
                            onToggleComplete={handleToggleObjective}
                            onAddObjective={handleAddObjective}
                            onDeleteObjective={handleDeleteObjective}
                            exchangeRate={exchangeRate}
                            onScheduleTask={openTaskModal}
                        />
                    );
                case 'objectives':
                    return (
                        <div className="objectives-page">
                            <Objectives
                                category="BR"
                                objectives={objectives}
                                onToggleComplete={handleToggleObjective}
                                onAddObjective={handleAddObjective}
                                onDeleteObjective={handleDeleteObjective}
                                exchangeRate={exchangeRate}
                                onScheduleTask={openTaskModal}
                            />
                            <Objectives
                                category="USA"
                                objectives={objectives}
                                onToggleComplete={handleToggleObjective}
                                onAddObjective={handleAddObjective}
                                onDeleteObjective={handleDeleteObjective}
                                exchangeRate={exchangeRate}
                                onScheduleTask={openTaskModal}
                            />
                            <Objectives
                                category="EMERGENCY"
                                objectives={objectives}
                                onToggleComplete={handleToggleObjective}
                                onAddObjective={handleAddObjective}
                                onDeleteObjective={handleDeleteObjective}
                                exchangeRate={exchangeRate}
                                onScheduleTask={openTaskModal}
                            />
                        </div>
                    );
                case 'tasks':
                    return <TasksView tasks={tasks} setTasks={setTasks} objectives={objectives} debts={debts} />;
                case 'entrega':
                    return <DeliveriesDashboard onDeposit={handleDeposit} exchangeRate={exchangeRate} />;
                case 'report':
                    return <ReportView accumulatedBRL={accumulatedBRL} objectives={objectives} targetBRL={totalTargetBRL} />;
                case 'premium':
                    return (
                        <PremiumDashboard 
                            debts={debts} 
                            onAdd={handleDebtCRUD.add}
                            onUpdate={handleDebtCRUD.update}
                            onRemove={handleDebtCRUD.remove}
                            onScheduleTask={openTaskModal}
                        />
                    );
                default:
                    return (
                        <DashboardView
                            exchangeRate={exchangeRate}
                            transactions={transactions}
                            onDeposit={handleDeposit}
                            accumulatedBRL={accumulatedBRL}
                            totalTargetBRL={totalTargetBRL}
                            totalTargetUSD={totalTargetUSD}
                            objectives={objectives}
                            debts={debts}
                            onDelete={handleDeleteTransaction}
                            ganhosDoDia={ganhosDoDia}
                        />
                    );
            }
        } catch (e) {
            console.error("Erro ao renderizar seção:", activeSection, e);
            return <div className="error-fallback">Ocorreu um erro ao carregar esta seção.</div>;
        }
    };

    try {
        if (!isAuthenticated) {
            return <LoginView onLogin={setIsAuthenticated} />;
        }

        return (
            <>
            <div className="app-layout">
                {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}
                
                <Sidebar
                    activeSection={activeSection}
                    onNavigate={(s) => {
                        setActiveSection(s);
                        setIsSidebarOpen(false);
                    }}
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                    onLogout={() => setIsAuthenticated(false)}
                />

                <main className="main-content">
                    <header className="top-bar">
                        <div className="header-left">
                            <button className="hamburger-btn" onClick={() => setIsSidebarOpen(true)}>☰</button>
                            <h1 className="page-title">
                                {activeSection === 'dashboard' ? 'Dashboard' :
                                 activeSection === 'entrega' ? 'Entregas' :
                                 activeSection === 'meta' ? 'Meta & Saldo' :
                                 activeSection === 'br_goals' ? 'Objetivos BR' :
                                 activeSection === 'usa_goals' ? 'Objetivos USA' :
                                 activeSection === 'emergency' ? 'Emergência' :
                                 activeSection === 'tasks' ? 'Tarefas' :
                                 activeSection === 'objectives' ? 'Todos os Objetivos' :
                                 activeSection === 'premium' ? 'Contas 2026' :
                                 'Relatório'}
                            </h1>
                        </div>

                        <div className="header-controls">
                            {deferredPrompt && (
                                <button 
                                    className="install-app-btn"
                                    style={{
                                        background: 'linear-gradient(135deg, #10b981, #059669)',
                                        color: '#fff',
                                        border: 'none',
                                        padding: '6px 12px',
                                        borderRadius: '8px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)',
                                        fontSize: '0.85rem'
                                    }}
                                    onClick={async () => {
                                        if (deferredPrompt) {
                                            deferredPrompt.prompt();
                                            const { outcome } = await deferredPrompt.userChoice;
                                            if (outcome === 'accepted') {
                                                setDeferredPrompt(null);
                                            }
                                        }
                                    }}
                                >
                                    📲 Baixar App
                                </button>
                            )}
                            <TaskNotificationWidget tasks={tasks} onOpenTasks={() => setActiveSection('tasks')} />
                            <Clock />
                            <div className="total-goal-badge">
                                <span className="total-goal-icon">🎯</span>
                                <div className="total-goal-info">
                                    <span className="total-goal-label">Meta Total</span>
                                    <span className="total-goal-brl">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalTargetBRL)}</span>
                                    <span className="total-goal-usd">USD {totalTargetUSD.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                                </div>
                            </div>
                            <div className="exchange-rate-badge">
                                <span className="rate-label">Cotação USD</span>
                                <div className="rate-controls">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={exchangeRate}
                                        onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 0)}
                                        className="rate-input-small"
                                    />
                                    <span className="rate-value">R$ {exchangeRate.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </header>

                    <DebtNotificationTray debts={debts} onUpdateDebt={handleDebtCRUD.update} />

                    <div className="content-area">
                        {renderContent()}
                    </div>
                </main>
            </div>
            <TaskModal 
                isOpen={isTaskModalOpen} 
                onClose={() => setIsTaskModalOpen(false)} 
                onSave={handleGlobalSaveTask} 
                initialData={taskModalData}
                objectives={objectives}
                debts={debts}
            />
            </>
        );
    } catch (e) {
        console.error("[AppContent] CRITICAL RENDER ERROR:", e);
        return <div style={{color:'red', padding:'50px', background:'white', zIndex: 9999}}>ERRO CRÍTICO NA RENDERIZAÇÃO DO APP!</div>;
    }
};

const App: React.FC = () => {
    return (
        <ThemeProvider>
            <AppContent />
        </ThemeProvider>
    );
};

export default App;
