import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../auth';
import { useT } from '../i18n';
export default function Dashboard() {
  const { user } = useAuth(), { t } = useT(), [d, setD] = useState({ farms: [], crops: [], alerts: [] });
  useEffect(() => { Promise.all([api.get('/farms'), api.get('/crops'), api.get('/posts?type=pestAlert')]).then(([f, c, a]) => setD({ farms: f.data, crops: c.data, alerts: a.data })); }, []);
  const growing = d.crops.filter(c => c.status === 'growing'), weak = d.crops.filter(c => c.soil && Object.keys(c.soil).length && c.analysis.rating === 'Poor');
  return (<>
    <h1 className="h2 mb-3">Hello, {user.name}</h1>
    <div className="row g-3 mb-3">
      {[[d.farms.length, t('Farms'), '/farms'], [growing.length, 'Crops growing', '/crops'], [weak.length, 'Fields needing soil care', '/crops']].map(([n, l, to]) =>
        <div key={l} className="col-md-4"><Link to={to} className="panel d-block text-decoration-none text-reset mb-0"><div className="metric">{n}</div>{l}</Link></div>)}
    </div>
    <div className="panel"><h2 className="h5">{t('Pest alerts')}</h2>
      {d.alerts.length ? d.alerts.slice(0, 4).map(p => <div key={p._id} className="alertbox alert-warning-soft"><strong>{p.title}</strong>: {p.body}</div>) : <p className="mb-0">No pest alerts right now. Check <Link to="/weather">the forecast</Link> for weather risks.</p>}
    </div>
  </>);
}
