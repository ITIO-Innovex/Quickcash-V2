import React, { useState } from 'react';
import { sidebarMenuData } from './Sidebar/sidebarMenuData';

const menuContent: Record<string, React.ReactNode> = {
  overview: (
    <>
      <h2>Overview</h2>
      <p>This dashboard provides documentation and helpful information about how to use the application.</p>
    </>
  ),
  'getting-started': (
    <>
      <h2>Getting Started</h2>
      <ul>
        <li>Step 1: Register an account</li>
        <li>Step 2: Verify your email</li>
        <li>Step 3: Login and explore features</li>
      </ul>
    </>
  ),
  api: (
    <>
      <h2>API Reference</h2>
      <p>Find details about our API endpoints, authentication, and usage examples here.</p>
    </>
  ),
  faq: (
    <>
      <h2>FAQ</h2>
      <ul>
        <li><strong>Q:</strong> How do I reset my password?<br/><strong>A:</strong> Use the Forgot Password link on the login page.</li>
        <li><strong>Q:</strong> Where can I find support?<br/><strong>A:</strong> Contact us via the support page.</li>
      </ul>
    </>
  ),
};

const Documentation = () => {
  const [selectedMenu, setSelectedMenu] = useState('overview');

  return (
    <div style={{ display: 'flex', minHeight: '80vh', background: '#f7f8fa', borderRadius: '12px', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{ width: 240, background: '#fff', borderRight: '1px solid #e0e0e0', padding: '2rem 1rem', boxSizing: 'border-box' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '2rem', color: '#1976d2' }}>Documentation</h2>
        <nav>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {sidebarMenuData.map((item) => (
              <li key={item.key}>
                <button
                  onClick={() => setSelectedMenu(item.key)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.75rem 1rem',
                    marginBottom: '0.5rem',
                    border: 'none',
                    borderRadius: '6px',
                    background: selectedMenu === item.key ? '#e3f2fd' : 'transparent',
                    color: selectedMenu === item.key ? '#1976d2' : '#333',
                    fontWeight: selectedMenu === item.key ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      {/* Content */}
      <main style={{ flex: 1, padding: '2.5rem 3rem', background: '#f7f8fa' }}>
        {menuContent[selectedMenu]}
      </main>
    </div>
  );
};

export default Documentation;
