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
import { useRegisterSW } from 'virtual:pwa-register/react';

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

// Função centralizada de cálculo de proposta — única fonte de verdade
const calcProposta = (d: any): number => {
    const vp = typeof d.vlrP === 'number' ? d.vlrP : parseFloat(String(d.vlrP || '0').replace(',', '.')) || 0;
    const qtd = parseInt(d.qtd) || 1;
    const ent = typeof d.entrada === 'number' ? d.entrada : parseFloat(String(d.entrada || '0').replace(',', '.')) || 0;
    return d.tipo === 'parcelado' ? (vp * qtd) + ent : vp;
};

const DebtNotificationTray: React.FC<{ debts: any[]; onUpdateDebt: (d: any) => void }> = ({ debts, onUpdateDebt }) => {
    const [notificacoesVisiveis, setNotificacoesVisiveis] = useState<any[]>([]);

    useEffect(() => {
        if (!debts || !Array.isArray(debts)) return;
        
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().catch(() => {});
        }

        const hoje = new Date();
        const diaAtual = hoje.getDate();
        
        // Define os próximos 3 dias para notificação
        const diasAlvo = [
            diaAtual,
            new Date(hoje.getFullYear(), hoje.getMonth(), diaAtual + 1).getDate(),
            new Date(hoje.getFullYear(), hoje.getMonth(), diaAtual + 2).getDate()
        ];

        const contasAlvo = debts.filter(d => {
            if (!d || d.status === 'quitado') return false;
            const v = parseInt(d.vencimento) || 5;
            return diasAlvo.includes(v);
        });

        setNotificacoesVisiveis(contasAlvo);

        const sendNotification = async (title: string, options: any) => {
            if (!('Notification' in window) || Notification.permission !== 'granted') return;
            
            // Tenta via Service Worker (melhor para Mobile/PWA)
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.ready;
                registration.showNotification(title, options);
            } else {
                // Fallback para Desktop clássico
                new Notification(title, options);
            }
        };

        contasAlvo.forEach(d => {
            const v = parseInt(d.vencimento) || 5;
            let tipoDia = `Dia ${v}`;
            if (v === diaAtual) tipoDia = 'HOJE';
            else if (v === diasAlvo[1]) tipoDia = 'AMANHÃ';
            
            const storageKey = `notif_sent_${d.id}_${hoje.toISOString().split('T')[0]}`;
            const sentCount = parseInt(localStorage.getItem(storageKey) || '0');

            if (sentCount < 2 && Notification.permission === 'granted') {
                sendNotification(`Lembrete de Conta: ${d.banco}`, {
                    body: `Vence ${tipoDia}. Valor: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calcProposta(d))}`,
                    icon: '/icon.svg',
                    vibrate: [200, 100, 200],
                    tag: `debt-${d.id}-${hoje.toISOString().split('T')[0]}`
                });
                localStorage.setItem(storageKey, String(sentCount + 1));
            }
        });
    }, [debts]);

    const requestPermission = () => {
        if (!('Notification' in window)) return alert("Este navegador não suporta notificações.");
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                alert("Notificações ativadas com sucesso!");
                window.location.reload(); // Recarrega para aplicar
            } else {
                alert("As notificações foram bloqueadas. Você precisará ativar manualmente nas configurações do navegador (clicando no cadeado ao lado da URL).");
            }
        });
    };

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
                    <span>Contas Próximas ao Vencimento (Próximos 3 Dias)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {Notification.permission !== 'granted' && (
                        <button 
                            onClick={requestPermission}
                            style={{
                                background: '#f59e0b',
                                color: '#000',
                                border: 'none',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            🔔 Ativar Alertas
                        </button>
                    )}
                    <span style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>Notificação dupla diária ativa</span>
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {notificacoesVisiveis.map((d, index) => {
                    const v = parseInt(d.vencimento) || 5;
                    const hojeDia = new Date().getDate();
                    const isHoje = v === hojeDia;
                    const isAmanha = v === (new Date(new Date().getFullYear(), new Date().getMonth(), hojeDia + 1).getDate());
                    const vlr = calcProposta(d);
                    return (
                        <div key={d.id || index} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'rgba(0, 0, 0, 0.3)',
                            padding: '10px 14px',
                            borderRadius: '10px',
                            borderLeft: `4px solid ${isHoje ? '#ef4444' : (isAmanha ? '#f59e0b' : '#3498db')}`,
                            flexWrap: 'wrap',
                            gap: '10px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <strong style={{ color: '#fff' }}>{d.banco}</strong>
                                <span style={{ color: '#a1a1aa', fontSize: '0.85rem' }}>({d.titular})</span>
                                <span style={{
                                    background: isHoje ? 'rgba(239, 68, 68, 0.2)' : (isAmanha ? 'rgba(245, 158, 11, 0.2)' : 'rgba(52, 152, 219, 0.2)'),
                                    color: isHoje ? '#ef4444' : (isAmanha ? '#f59e0b' : '#3498db'),
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold'
                                }}>
                                    {isHoje ? 'Vence HOJE' : (isAmanha ? 'Vence AMANHÃ' : `Vence em breve (Dia ${v})`)}
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
    const [isConnected, setIsConnected] = useState<boolean | null>(null); // null = carregando, true = online, false = offline


    // Lógica de Atualização Automática do PWA
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered: ' + r);
        },
        onRegisterError(error) {
            console.log('SW registration error', error);
        },
    });
    
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
            setIsConnected(null); // Pendente
            const txs = await api.getTransactions();
            if (Array.isArray(txs)) {
                setTransactions(txs);
                setIsConnected(true);
            }

            const objs = await api.getObjectives();
            if (Array.isArray(objs)) {
                const combined = [...initialObjectives];
                objs.forEach((apiObj: Objective) => {
                    const idx = combined.findIndex(o => o.id === apiObj.id);
                    if (idx === -1) combined.push(apiObj);
                    else combined[idx] = { ...combined[idx], ...apiObj };
                });
                setObjectives(combined);
            }

            const dbts = await api.getDebts();
            if (Array.isArray(dbts)) {
                const combinedDebts = [...initialDebts];
                dbts.forEach((apiDebt: any) => {
                    const idx = combinedDebts.findIndex(d => 
                        String(d.id) === String(apiDebt.id) || 
                        (d.banco === apiDebt.banco && d.titular === apiDebt.titular)
                    );
                    if (idx === -1) combinedDebts.push(apiDebt);
                    else combinedDebts[idx] = { ...combinedDebts[idx], ...apiDebt };
                });
                setDebts(combinedDebts);
            }

            const tks = await api.getTasks();
            if (Array.isArray(tks)) setTasks(tks);
        } catch (err) {
            console.error("Erro ao carregar dados:", err);
            setIsConnected(false); // Falha de conexão
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
                        <div className="header-left" style={{ gap: '5px' }}>
                            <button className="hamburger-btn" onClick={() => setIsSidebarOpen(true)}>☰</button>
                            <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: isConnected === true ? '#10b981' : (isConnected === false ? '#ef4444' : '#f59e0b'),
                                boxShadow: isConnected === true ? '0 0 8px #10b981' : 'none',
                                marginLeft: '5px'
                            }} title={isConnected === true ? 'Conectado ao Servidor' : 'Erro de Conexão'}></div>
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
            {/* Alerta de Nova Versão Disponível */}
            {needRefresh && (
                <div className="pwa-update-toast" style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    left: '20px',
                    background: 'linear-gradient(135deg, #3498db, #2980b9)',
                    color: 'white',
                    padding: '16px',
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                    zIndex: 10000,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                    textAlign: 'center',
                    border: '1px solid rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)'
                }}>
                    <span style={{ fontWeight: 'bold' }}>🚀 Nova versão disponível!</span>
                    <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>Clique abaixo para atualizar e usar as novas funções.</span>
                    <button 
                        onClick={() => updateServiceWorker(true)}
                        style={{
                            background: 'white',
                            color: '#2980b9',
                            border: 'none',
                            padding: '8px 24px',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            width: '100%'
                        }}
                    >
                        Atualizar Agora
                    </button>
                </div>
            )}
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
