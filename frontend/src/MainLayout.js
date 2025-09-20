import React from 'react';
import SidePanel from './SidePanel';
import AnimatedBackground from './components/AnimatedBackground';

function MainLayout({ children }) {
  return (
    <div className="app-container">
      <AnimatedBackground />
      <header className="app-header">
        <div className="logo-text">
          Bhrashtachar Mukt
        </div>
      </header>
      <div className="main-layout">
        <SidePanel />
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}

export default MainLayout;