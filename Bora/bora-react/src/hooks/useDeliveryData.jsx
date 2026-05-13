import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5082/api/delivery';

const INITIAL_DATA = {
    dias: {},
    kmAnterior: 0,
    kmOleo: 0,
};

export const METAS = {
    DIARIA_SEMANA: 65,
    DIARIA_FINDE: 200,
    MENSAL: 3000
};

export function useDeliveryData() {
    const [data, setData] = useState(INITIAL_DATA);
    const [loading, setLoading] = useState(true);

    const getDataHoje = () => {
        const hoje = new Date();
        return hoje.toISOString().split("T")[0];
    };

    const fetchData = async () => {
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                const dias = await response.json();
                const diasMap = {};
                let maxKm = 0;

                dias.forEach(d => {
                    diasMap[d.data] = d;
                    if (d.kmFinal > maxKm) maxKm = d.kmFinal;
                });

                setData({
                    dias: diasMap,
                    kmAnterior: maxKm,
                    kmOleo: 0 // Logic for oil needs persistence in DB too, for now resetting
                });
            }
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const saveDia = async (dia) => {
        try {
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dia)
            });
            fetchData(); // Refresh data to ensure sync
        } catch (error) {
            console.error("Erro ao salvar dia:", error);
        }
    };

    const getDadosDia = (dataStr) => {
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

    const registrarKm = (kmAtual) => {
        const hoje = getDataHoje();
        const dia = getDadosDia(hoje);

        let kmInicial = dia.kmInicial;
        if (kmInicial === 0) {
            kmInicial = data.kmAnterior || kmAtual;
        }

        const kmRodados = kmAtual - kmInicial;

        // Dynamic Goal Logic
        const dataObj = new Date(hoje + "T00:00:00");
        const diaSemana = dataObj.getDay(); // 0 = Dom, 6 = Sab
        const isFinde = diaSemana === 0 || diaSemana === 6;
        const metaDoDia = isFinde ? METAS.DIARIA_FINDE : METAS.DIARIA_SEMANA;

        const metaBatida = kmRodados >= metaDoDia;

        // Oil Change Logic (Simplified for API version)
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

        // Optimistic update for oil
        setData(prev => ({ ...prev, kmOleo: alertaOleo ? 0 : kmOleoAtual }));

        return { kmRodados, alertaOleo };
    };

    const registrarGanho = (valor) => {
        const hoje = getDataHoje();
        const dia = getDadosDia(hoje);
        saveDia({ ...dia, ganhos: dia.ganhos + valor });
    };

    const registrarGastos = (gasolina, manutencao, antecipacao) => {
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
        // Not implemented for API yet (would need DELETE endpoint)
        alert("Resetar tudo não disponível na versão API ainda.");
    };

    const resetarOleo = () => {
        setData(prev => ({ ...prev, kmOleo: 0 }));
    };

    const getMetaDoDia = (dataStr) => {
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
