import React, { useState } from 'react';
import { useDeliveryData } from './hooks/useDeliveryData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Modal } from './components/Modal';

function App() {
  const {
    data,
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
  } = useDeliveryData();

  const [activePage, setActivePage] = useState('dashboard');
  const [modalState, setModalState] = useState({ isOpen: false, title: '', message: '' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const showModal = (title, message) => {
    setModalState({ isOpen: true, title, message });
  };

  const closeModal = () => {
    setModalState({ ...modalState, isOpen: false });
  };

  const hoje = getDataHoje();
  const dadosHoje = getDadosDia(hoje);

  return (
    <div className="app">
      <Header
        kmHoje={dadosHoje.kmRodados}
        ganhosHoje={dadosHoje.ganhos}
        onToggleSidebar={toggleSidebar}
      />

      <Sidebar
        activePage={activePage}
        onNavigate={(page) => {
          setActivePage(page);
          setIsSidebarOpen(false); // Close on nav
        }}
        isOpen={isSidebarOpen}
      />

      <div className="main-content">
        <div className="page-header">
          <div className="page-title">
            <span className="page-title-icon">🏠</span>
            Dashboard
          </div>
          <p className="page-subtitle">Bem-vindo de volta! Acompanhe suas entregas.</p>
        </div>

        {activePage === 'dashboard' && (
          <Dashboard
            data={data}
            getDataHoje={getDataHoje}
            getDadosDia={getDadosDia}
            actions={{
              registrarEntrada,
              registrarSaida,
              registrarKm,
              registrarGanho,
              registrarGastos,
              resetarTudo,
              resetarOleo,
              getMetaDoDia,
              showModal
            }}
          />
        )}

        {activePage === 'config' && (
          <div style={{ color: 'white' }}>Configurações (Em breve)</div>
        )}
      </div>

      <Modal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        onClose={closeModal}
      />
    </div>
  );
}

export default App;
