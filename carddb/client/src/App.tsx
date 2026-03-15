import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import CardListPage from './pages/CardListPage';
import CardDetailPage from './pages/CardDetailPage';
import ComparePage from './pages/ComparePage';
import LoadoutBuilderPage from './pages/LoadoutBuilderPage';

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
  return (
    <Link to={to} style={{
      color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
      fontWeight: isActive ? 600 : 500,
      padding: '8px 16px',
      borderRadius: '8px',
      background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
      transition: 'all 0.2s',
      fontSize: '14px',
    }}>
      {children}
    </Link>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          height: '64px',
          gap: '32px',
        }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--accent), #a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '18px',
              color: 'white',
            }}>B</div>
            <span style={{ fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)' }}>
              Beltway Realms <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Card DB</span>
            </span>
          </Link>
          <nav style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
            <NavLink to="/">Cards</NavLink>
            <NavLink to="/compare">Compare</NavLink>
            <NavLink to="/loadouts">Loadouts</NavLink>
          </nav>
        </div>
      </header>
      <main style={{ flex: 1, maxWidth: '1440px', margin: '0 auto', width: '100%', padding: '24px' }}>
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<CardListPage />} />
          <Route path="/card/:id" element={<CardDetailPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/loadouts" element={<LoadoutBuilderPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
