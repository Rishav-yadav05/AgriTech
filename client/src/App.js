import { lazy, Suspense } from 'react';
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth';
import { LANGS, useT } from './i18n';
const Auth = lazy(() => import('./pages/Auth')), Dashboard = lazy(() => import('./pages/Dashboard')), Farms = lazy(() => import('./pages/Farms'));
const Crops = lazy(() => import('./pages/Crops')), Weather = lazy(() => import('./pages/Weather')), Market = lazy(() => import('./pages/Market'));
const Community = lazy(() => import('./pages/Community')), Admin = lazy(() => import('./pages/Admin'));

export default function App() {
  const { user, ready, logout } = useAuth(), { t, lang, setLang } = useT();
  if (!ready) return <p className="p-4">Loading…</p>;
  if (!user) return <Suspense fallback={null}><Routes><Route path="/register" element={<Auth mode="register" />} /><Route path="*" element={<Auth mode="login" />} /></Routes></Suspense>;
  const links = [['/', 'Dashboard'], ['/farms', 'Farms'], ['/crops', 'Crops'], ['/weather', 'Weather'], ['/market', 'Market'], ['/community', 'Community'], ...(user.role === 'admin' ? [['/admin', 'Admin']] : [])];
  return (
    <div className="shell">
      <nav className="rail" aria-label="Main">
        <div className="brand">Agri<span>Tech</span></div>
        {links.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'}>{t(label)}</NavLink>)}
        <div className="spacer" />
        <select className="form-select form-select-sm mb-2" aria-label="Language" value={lang} onChange={e => setLang(e.target.value)}>
          {Object.entries(LANGS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button className="btn btn-sm btn-outline-light" onClick={logout}>{t('Log out')}</button>
      </nav>
      <main><Suspense fallback={<p>Loading…</p>}>
        <Routes>
          <Route path="/" element={<Dashboard />} /><Route path="/farms" element={<Farms />} /><Route path="/crops" element={<Crops />} />
          <Route path="/weather" element={<Weather />} /><Route path="/market" element={<Market />} /><Route path="/community" element={<Community />} />
          <Route path="/admin" element={user.role === 'admin' ? <Admin /> : <Navigate to="/" />} /><Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense></main>
    </div>
  );
}
