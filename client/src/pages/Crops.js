import { useCallback, useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import { useT } from '../i18n';
const S = [['ph', 'pH'], ['n', 'N (kg/ha)'], ['p', 'P (kg/ha)'], ['k', 'K (kg/ha)'], ['organicMatter', 'Organic C %'], ['moisture', 'Moisture %']];
export default function Crops() {
  const { t } = useT(), [farms, setFarms] = useState([]), [list, setList] = useState([]), [err, setErr] = useState('');
  const [f, setF] = useState({ farm: '', name: '', sownOn: '', soil: {} }), [note, setNote] = useState({});
  const load = useCallback(() => api.get('/crops').then(r => setList(r.data)), []);
  useEffect(() => { load(); api.get('/farms').then(r => { setFarms(r.data); if (r.data[0]) setF(x => ({ ...x, farm: r.data[0]._id })); }); }, [load]);
  const submit = async e => {
    e.preventDefault(); setErr('');
    const soil = Object.fromEntries(Object.entries(f.soil).filter(([, v]) => v !== '').map(([k, v]) => [k, +v]));
    try { await api.post('/crops', { ...f, soil }); setF({ ...f, name: '', sownOn: '', soil: {} }); load(); } catch (x) { setErr(errMsg(x)); }
  };
  if (!farms.length) return <><h1 className="h2">{t('Crops')}</h1><p>Add a farm first, then record the crops you grow on it.</p></>;
  return (<>
    <h1 className="h2 mb-3">{t('Crops')}</h1>
    <form className="panel row g-3" onSubmit={submit}>
      <div className="col-md-4"><label className="form-label">Farm</label><select className="form-select" value={f.farm} onChange={e => setF({ ...f, farm: e.target.value })}>{farms.map(x => <option key={x._id} value={x._id}>{x.name}</option>)}</select></div>
      <div className="col-md-4"><label className="form-label">Crop</label><input className="form-control" required value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></div>
      <div className="col-md-4"><label className="form-label">Sown on</label><input type="date" className="form-control" value={f.sownOn} onChange={e => setF({ ...f, sownOn: e.target.value })} /></div>
      <div className="col-12"><strong>{t('Soil health')} test (optional)</strong></div>
      {S.map(([k, l]) => <div key={k} className="col-6 col-md-2"><label className="form-label">{l}</label><input type="number" step="any" className="form-control" value={f.soil[k] ?? ''} onChange={e => setF({ ...f, soil: { ...f.soil, [k]: e.target.value } })} /></div>)}
      {err && <div className="col-12 text-danger" role="alert">{err}</div>}
      <div className="col-12"><button className="btn btn-field">{t('Add crop')}</button></div>
    </form>
    {list.map(c => <div key={c._id} className="panel">
      <div className="d-flex justify-content-between flex-wrap gap-2">
        <div><h2 className="h5 mb-0">{c.name}</h2><span className="text-muted">{c.farm?.name}{c.sownOn && ' · sown ' + c.sownOn.slice(0, 10)}</span></div>
        <div className="d-flex gap-2 align-items-start">
          <select className="form-select form-select-sm" aria-label="Status" value={c.status} onChange={async e => { await api.put('/crops/' + c._id, { status: e.target.value }); load(); }}>{['growing', 'harvested', 'failed'].map(s => <option key={s}>{s}</option>)}</select>
          <button className="btn btn-sm btn-outline-danger" onClick={async () => { if (window.confirm('Delete this crop?')) { await api.delete('/crops/' + c._id); load(); } }}>{t('Delete')}</button></div>
      </div>
      {c.soil && Object.keys(c.soil).length > 0 && <div className="mt-2"><strong>{t('Soil health')}: {c.analysis.rating} ({c.analysis.score}/100)</strong><ul className="mb-0">{c.analysis.advice.map((a, i) => <li key={i}>{a}</li>)}</ul></div>}
      <ul className="list-unstyled mt-2 mb-2 text-muted">{c.logs.slice(-3).map(l => <li key={l._id}>{l.at.slice(0, 10)}: {l.note}</li>)}</ul>
      <div className="input-group"><input className="form-control" placeholder="Add activity (irrigated, sprayed, weeded…)" value={note[c._id] || ''} onChange={e => setNote({ ...note, [c._id]: e.target.value })} />
        <button className="btn btn-outline-secondary" onClick={async () => { if (!note[c._id]) return; await api.post(`/crops/${c._id}/logs`, { note: note[c._id] }); setNote({ ...note, [c._id]: '' }); load(); }}>{t('Add')}</button></div>
    </div>)}
  </>);
}
