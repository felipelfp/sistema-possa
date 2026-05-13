import { Objective } from '../components/Objectives';
import { Deposit } from '../components/DepositForm';

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5011/api`;

// Helper for local storage fallback
const getLocal = (key: string) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
};

const setLocal = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
};

export const api = {
    // Settings
    getSettings: async () => {
        try {
            const response = await fetch(`${API_URL}/settings`);
            if (!response.ok) throw new Error();
            const data = await response.json();
            setLocal('settings', data);
            return data;
        } catch {
            return getLocal('settings') || { exchangeRate: 5.0 };
        }
    },
    updateSettings: async (settings: { exchangeRate: number }) => {
        try {
            const response = await fetch(`${API_URL}/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });
            const data = await response.json();
            setLocal('settings', data);
            return data;
        } catch {
            setLocal('settings', settings);
            return settings;
        }
    },

    // Objectives
    getObjectives: async () => {
        try {
            const response = await fetch(`${API_URL}/objectives`);
            if (!response.ok) throw new Error();
            const data = await response.json();
            
            // Auto-migrate from localStorage if server is empty but local has data
            const local = getLocal('objectives');
            if (data.length === 0 && local && local.length > 0) {
                for (const o of local) {
                    await api.saveObjective(o);
                }
                return local;
            }
            
            setLocal('objectives', data);
            return data;
        } catch {
            return getLocal('objectives') || [];
        }
    },
    saveObjective: async (objective: Objective) => {
        try {
            const response = await fetch(`${API_URL}/objectives`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(objective),
            });
            const data = await response.json();
            const local = getLocal('objectives') || [];
            setLocal('objectives', [...local, data]);
            return data;
        } catch {
            const local = getLocal('objectives') || [];
            const updated = [...local, objective];
            setLocal('objectives', updated);
            return objective;
        }
    },
    updateObjective: async (objective: Objective) => {
        try {
            await fetch(`${API_URL}/objectives/${objective.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(objective),
            });
            const local = getLocal('objectives') || [];
            setLocal('objectives', local.map((o: any) => o.id === objective.id ? objective : o));
            return true;
        } catch {
            const local = getLocal('objectives') || [];
            setLocal('objectives', local.map((o: any) => o.id === objective.id ? objective : o));
            return true;
        }
    },

    // Transactions
    getTransactions: async () => {
        try {
            const response = await fetch(`${API_URL}/transactions`);
            if (!response.ok) throw new Error();
            const data = await response.json();
            setLocal('transactions', data);
            return data;
        } catch {
            return getLocal('transactions') || [];
        }
    },
    addTransaction: async (transaction: Deposit) => {
        try {
            const response = await fetch(`${API_URL}/transactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(transaction),
            });
            const data = await response.json();
            const local = getLocal('transactions') || [];
            setLocal('transactions', [data, ...local]);
            return data;
        } catch {
            const local = getLocal('transactions') || [];
            const mockData = { ...transaction, id: Date.now() };
            setLocal('transactions', [mockData, ...local]);
            return mockData;
        }
    },
    deleteTransaction: async (id: number) => {
        try {
            await fetch(`${API_URL}/transactions/${id}`, { method: 'DELETE' });
            const local = getLocal('transactions') || [];
            setLocal('transactions', local.filter((t: any) => t.id !== id));
            return true;
        } catch {
            const local = getLocal('transactions') || [];
            setLocal('transactions', local.filter((t: any) => t.id !== id));
            return true;
        }
    },

    // Debts
    getDebts: async () => {
        try {
            const response = await fetch(`${API_URL}/debts`);
            if (!response.ok) throw new Error();
            const data = await response.json();
            
            // Auto-migrate from localStorage if server is empty but local has data
            const local = getLocal('debts');
            if (data.length === 0 && local && local.length > 0) {
                for (const d of local) {
                    await api.addDebt(d);
                }
                return local;
            }
            
            setLocal('debts', data);
            return data;
        } catch {
            return getLocal('debts') || [];
        }
    },
    addDebt: async (debt: any) => {
        try {
            const response = await fetch(`${API_URL}/debts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(debt),
            });
            const data = await response.json();
            const local = getLocal('debts') || [];
            setLocal('debts', [...local, data]);
            return data;
        } catch {
            const local = getLocal('debts') || [];
            const mockData = { ...debt, id: Date.now() };
            setLocal('debts', [...local, mockData]);
            return mockData;
        }
    },
    updateDebt: async (debt: any) => {
        try {
            await fetch(`${API_URL}/debts/${debt.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(debt),
            });
            const local = getLocal('debts') || [];
            setLocal('debts', local.map((d: any) => d.id === debt.id ? debt : d));
            return true;
        } catch {
            const local = getLocal('debts') || [];
            setLocal('debts', local.map((d: any) => d.id === debt.id ? debt : d));
            return true;
        }
    },
    deleteDebt: async (id: number) => {
        try {
            await fetch(`${API_URL}/debts/${id}`, { method: 'DELETE' });
            const local = getLocal('debts') || [];
            setLocal('debts', local.filter((d: any) => d.id !== id));
            return true;
        } catch {
            const local = getLocal('debts') || [];
            setLocal('debts', local.filter((d: any) => d.id !== id));
            return true;
        }
    },
    deleteObjective: async (id: string) => {
        try {
            await fetch(`${API_URL}/objectives/${id}`, { method: 'DELETE' });
            const local = getLocal('objectives') || [];
            setLocal('objectives', local.filter((o: any) => o.id !== id));
            return true;
        } catch {
            const local = getLocal('objectives') || [];
            setLocal('objectives', local.filter((o: any) => o.id !== id));
            return true;
        }
    },
    
    // Tasks
    getTasks: async () => {
        try {
            const response = await fetch(`${API_URL}/tasks`);
            if (!response.ok) throw new Error();
            const data = await response.json();
            
            // Auto-migrate from localStorage seeder
            const local = getLocal('tasks');
            if (data.length === 0 && local && local.length > 0) {
                for (const t of local) {
                    await api.addTask(t);
                }
                return local;
            }
            
            setLocal('tasks', data);
            return data;
        } catch {
            return getLocal('tasks') || [];
        }
    },
    addTask: async (task: any) => {
        try {
            const response = await fetch(`${API_URL}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(task),
            });
            const data = await response.json();
            const local = getLocal('tasks') || [];
            setLocal('tasks', [...local, data]);
            return data;
        } catch {
            const local = getLocal('tasks') || [];
            const mockData = { ...task, id: Date.now().toString() };
            setLocal('tasks', [...local, mockData]);
            return mockData;
        }
    },
    updateTask: async (task: any) => {
        try {
            await fetch(`${API_URL}/tasks/${task.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(task),
            });
            const local = getLocal('tasks') || [];
            setLocal('tasks', local.map((t: any) => t.id === task.id ? task : t));
            return true;
        } catch {
            const local = getLocal('tasks') || [];
            setLocal('tasks', local.map((t: any) => t.id === task.id ? task : t));
            return true;
        }
    },
    deleteTask: async (id: string) => {
        try {
            await fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE' });
            const local = getLocal('tasks') || [];
            setLocal('tasks', local.filter((t: any) => t.id !== id));
            return true;
        } catch {
            const local = getLocal('tasks') || [];
            setLocal('tasks', local.filter((t: any) => t.id !== id));
            return true;
        }
    }
};
