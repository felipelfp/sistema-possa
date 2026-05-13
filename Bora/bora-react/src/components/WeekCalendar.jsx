import React from 'react';

export function WeekCalendar({ daysData, onDayClick, selectedDate, getDataHoje }) {
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
        <div className="week-calendar">
            {days.map(day => (
                <div
                    key={day.date}
                    className={`day-card ${day.isToday ? 'active' : ''} ${day.hasData ? 'completed' : ''} ${selectedDate === day.date ? 'active' : ''}`}
                    onClick={() => onDayClick(day.date)}
                >
                    <div className="day-name">{day.dayName}</div>
                    <div className="day-date">{day.dayNum}</div>
                    <div className="day-km">{day.kmRodados} km</div>
                </div>
            ))}
        </div>
    );
}
