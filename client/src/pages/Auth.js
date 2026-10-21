import { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useAuth } from '../auth';
import { useT } from '../i18n';
export default function Auth({ mode }) {
  const { save } = useAuth(), { t } = useT(), reg = mode === 'register';
  const [f, setF] = useState({ name: '', email: '', password: '' }), [err, setErr] = useState(''), [busy, setBusy] = useState(false);
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const submit = async e => {
    e.preventDefault(); setErr(''); setBusy(true);
    try { save((await api.post(reg ? '/auth/register' : '/auth/login', f)).data); } catch (x) { setErr(errMsg(x)); setBusy(false); }
  };
  return (
    <div className="auth panel">
      <h1 className="h3 mb-1">Agri<span style={{ color: 'var(--wheat)' }}>Tech</span></h1>
      <p className="text-muted">{reg ? 'Create a farmer account to manage your farm.' : 'Log in to see your farms, weather and alerts.'}</p>
      <form onSubmit={submit}>
        {reg && <div className="mb-3"><label className="form-label" htmlFor="n">{t('Name')}</label><input id="n" className="form-control" required value={f.name} onChange={set('name')} /></div>}
        <div className="mb-3"><label className="form-label" htmlFor="e">{t('Email')}</label><input id="e" type="email" className="form-control" required value={f.email} onChange={set('email')} /></div>
        <div className="mb-3"><label className="form-label" htmlFor="p">{t('Password')}</label><input id="p" type="password" minLength={8} className="form-control" required value={f.password} onChange={set('password')} /></div>
        {err && <div className="alert alert-danger" role="alert">{err}</div>}
        <button className="btn btn-field w-100" disabled={busy}>{reg ? t('Register') : t('Log in')}</button>
      </form>
      <p className="mt-3 mb-0">{reg ? <>Have an account? <Link to="/">{t('Log in')}</Link></> : <>New here? <Link to="/register">{t('Register')}</Link></>}</p>
    </div>
  );
}
