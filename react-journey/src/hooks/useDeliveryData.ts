import { useState, useEffect } from 'react';

let envDeliveryApiUrl = import.meta.env.VITE_DELIVERY_API_URL;
if (envDeliveryApiUrl && envDeliveryApiUrl.includes('localhost') && window.location.hostname !== 'localhost') {
    envDeliveryApiUrl = envDeliveryApiUrl.replace('localhost', window.location.hostname);
}
const API_URL = envDeliveryApiUrl || `http://${window.location.hostname}:5000/api/delivery`;

const getLocal = (key: string) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
};

const setLocal = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
};

export const METAS = {
    DIARIA_SEMANA: 130,
    DIARIA_FINDE: 130,
    MENSAL: 3000
};

export function useDeliveryData() {
    const [data, setData] = useState(() => {
        const cachedDias = getLocal('delivery_dias') || {};
        const cachedKmAnterior = getLocal('delivery_kmAnterior') || 0;
        const cachedKmOleo = getLocal('delivery_kmOleo') || 0;
        return {
            dias: cachedDias,
            kmAnterior: cachedKmAnterior,
            kmOleo: cachedKmOleo,
        };
    });
    const [loading, setLoading] = useState(true);

    const getDataHoje = () => {
        const hoje = new Date();
        return hoje.toISOString().split("T")[0];
    };

    const saveDiaToServerSilent = async (dia: any) => {
        try {
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dia)
            });
        } catch (e) {
            // Silencioso
        }
    };

    const fetchData = async () => {
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                const dias = await response.json();
                const diasMap: Record<string, any> = {};
                let maxKm = 0;

                dias.forEach((d: any) => {
                    diasMap[d.data] = d;
                    if (d.kmFinal > maxKm) maxKm = d.kmFinal;
                });

                // Auto-sincronizar dias locais offline que ainda não estão no servidor
                const cachedDias = getLocal('delivery_dias') || {};
                for (const dateStr in cachedDias) {
                    if (!diasMap[dateStr]) {
                        saveDiaToServerSilent(cachedDias[dateStr]);
                        diasMap[dateStr] = cachedDias[dateStr];
                    }
                }

                setData(prev => {
                    const updated = {
                        dias: diasMap,
                        kmAnterior: maxKm > prev.kmAnterior ? maxKm : prev.kmAnterior,
                        kmOleo: prev.kmOleo 
                    };
                    setLocal('delivery_dias', updated.dias);
                    setLocal('delivery_kmAnterior', updated.kmAnterior);
                    return updated;
                });
            }
        } catch (error) {
            console.error("Erro ao buscar dados da API, usando cache offline garantido no App/Site:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const saveDia = async (dia: any) => {
        // Atualização otimista imediata para garantir salvamento no App e Site instantaneamente
        setData(prev => {
            const updatedDias = { ...prev.dias, [dia.data]: dia };
            let maxKm = prev.kmAnterior;
            if (dia.kmFinal > maxKm) maxKm = dia.kmFinal;
            
            setLocal('delivery_dias', updatedDias);
            setLocal('delivery_kmAnterior', maxKm);
            return { ...prev, dias: updatedDias, kmAnterior: maxKm };
        });

        try {
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dia)
            });
            // Busca dados frescos em segundo plano
            fetchData(); 
        } catch (error) {
            console.error("Erro ao salvar na API. Os dados estão salvos offline de forma segura:", error);
        }
    };

    const getDadosDia = (dataStr: string) => {
        if (!data.dias[dataStr]) {
            return {
                data: dataStr,
                entrada: null,
                saida: null,
                kmInicial: 0,
                kmFinal: 0,
                kmRodados: 0,
                ganhos: 0,
                gastoGasolina: 0,
                gastoManutencao: 0,
                gastoAntecipacao: 0,
                metaBatida: false,
            };
        }
        return data.dias[dataStr];
    };

    const registrarEntrada = () => {
        const hoje = getDataHoje();
        const dia = getDadosDia(hoje);
        const agora = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

        saveDia({ ...dia, entrada: agora });
        return agora;
    };

    const registrarSaida = () => {
        const hoje = getDataHoje();
        const dia = getDadosDia(hoje);
        const agora = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

        saveDia({ ...dia, saida: agora });
        return agora;
    };

    const registrarKm = (kmAtual: number) => {
        const hoje = getDataHoje();
        const dia = getDadosDia(hoje);

        let kmInicial = dia.kmInicial;
        if (kmInicial === 0) {
            kmInicial = data.kmAnterior || kmAtual;
        }

        const kmRodados = kmAtual - kmInicial;

        const dataObj = new Date(hoje + "T00:00:00");
        const diaSemana = dataObj.getDay(); 
        const isFinde = diaSemana === 0 || diaSemana === 6;
        const metaDoDia = isFinde ? METAS.DIARIA_FINDE : METAS.DIARIA_SEMANA;

        const metaBatida = kmRodados >= metaDoDia;

        const kmOleoAtual = (data.kmOleo || 0) + kmRodados;
        let alertaOleo = false;
        if (kmOleoAtual >= 1000) {
            alertaOleo = true;
        }

        saveDia({
            ...dia,
            kmInicial,
            kmFinal: kmAtual,
            kmRodados,
            metaBatida
        });

        const novoKmOleo = alertaOleo ? 0 : kmOleoAtual;
        setData(prev => ({ ...prev, kmOleo: novoKmOleo }));
        setLocal('delivery_kmOleo', novoKmOleo);

        return { kmRodados, alertaOleo };
    };

    const registrarGanho = (valor: number) => {
        const hoje = getDataHoje();
        const dia = getDadosDia(hoje);
        saveDia({ ...dia, ganhos: dia.ganhos + valor });
    };

    const registrarGastos = (gasolina: number, manutencao: number, antecipacao: number) => {
        const hoje = getDataHoje();
        const dia = getDadosDia(hoje);
        saveDia({
            ...dia,
            gastoGasolina: dia.gastoGasolina + gasolina,
            gastoManutencao: dia.gastoManutencao + manutencao,
            gastoAntecipacao: dia.gastoAntecipacao + antecipacao
        });
    };

    const resetarTudo = () => {
        alert("Resetar tudo não disponível na versão API ainda.");
    };

    const resetarOleo = () => {
        setData(prev => ({ ...prev, kmOleo: 0 }));
        setLocal('delivery_kmOleo', 0);
    };

    const getMetaDoDia = (dataStr?: string) => {
        const d = dataStr ? new Date(dataStr + "T00:00:00") : new Date();
        const diaSemana = d.getDay();
        return (diaSemana === 0 || diaSemana === 6) ? METAS.DIARIA_FINDE : METAS.DIARIA_SEMANA;
    };

    return {
        data,
        loading,
        getDataHoje,
        getDadosDia,
        registrarEntrada,
        registrarSaida,
        registrarKm,
        registrarGanho,
        registrarGastos,
        resetarTudo,
        resetarOleo,
        getMetaDoDia
    };
}
