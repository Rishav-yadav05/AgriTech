import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api, { errMsg } from '../api';
import { useT } from '../i18n';
export default function Weather() {
  const { t } = useT(), [farms, setFarms] = useState([]), [id, setId] = useState(''), [w, setW] = useState(null), [err, setErr] = useState('');
  useEffect(() => { api.get('/farms').then(r => { setFarms(r.data); if (r.data[0]) setId(r.data[0]._id); }); }, []);
  useEffect(() => { if (!id) return; setW(null); setErr(''); api.get('/weather/' + id).then(r => setW(r.data)).catch(e => setErr(errMsg(e))); }, [id]);
  if (!farms.length) return <><h1 className="h2">{t('Weather')}</h1><p>Add a farm to see its 7-day forecast.</p></>;
  const rows = w?.daily.time.map((d, i) => ({ day: d.slice(5), max: w.daily.temperature_2m_max[i], min: w.daily.temperature_2m_min[i], rain: w.daily.precipitation_sum[i] }));
  return (<>
    <h1 className="h2 mb-3">{t('Weather')}</h1>
    <select className="form-select mb-3" style={{ maxWidth: 320 }} aria-label={t('Select a farm')} value={id} onChange={e => setId(e.target.value)}>{farms.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}</select>
    {err && <div className="alert alert-danger">{err}</div>}{!w && !err && <p>Loading forecast…</p>}
    {w && <>
      <div className="panel row text-center">
        <div className="col-3"><div className="metric">{w.current.temperature_2m}°</div>Temperature</div><div className="col-3"><div className="metric">{w.current.relative_humidity_2m}%</div>Humidity</div>
        <div className="col-3"><div className="metric">{w.current.wind_speed_10m}</div>Wind km/h</div><div className="col-3"><div className="metric">{w.current.precipitation}</div>Rain mm</div>
      </div>
      <div className="panel"><h2 className="h5">{t('Alerts')}</h2>
        {w.alerts.length ? w.alerts.map((a, i) => <div key={i} className={`alertbox alert-${a.level}-soft`}><strong>{a.day}</strong>: {a.text}</div>) : <p className="mb-0">No weather risks in the next 7 days.</p>}
        {w.expertAlerts.length > 0 && <><h3 className="h6 mt-3">{t('Pest alerts')}</h3>{w.expertAlerts.map(p => <div key={p._id} className="alertbox alert-warning-soft"><strong>{p.title}</strong>: {p.body}</div>)}</>}
      </div>
      <div className="panel"><h2 className="h5">Temperature (°C)</h2><ResponsiveContainer width="100%" height={240}><LineChart data={rows}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" /><YAxis /><Tooltip /><Legend /><Line dataKey="max" stroke="#c2410c" name="High" /><Line dataKey="min" stroke="#2b6c99" name="Low" /></LineChart></ResponsiveContainer></div>
      <div className="panel"><h2 className="h5">Rainfall (mm)</h2><ResponsiveContainer width="100%" height={200}><BarChart data={rows}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" /><YAxis /><Tooltip /><Bar dataKey="rain" fill="#1f5c3f" name="Rain" /></BarChart></ResponsiveContainer></div>
    </>}
  </>);
}
