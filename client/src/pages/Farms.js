import { useCallback, useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import { useT } from '../i18n';
const blank = { name: '', village: '', lat: '', lon: '', areaAcres: 1, soilType: 'loamy' };
export default function Farms() {
  const { t } = useT(), [list, setList] = useState([]), [f, setF] = useState(blank), [edit, setEdit] = useState(null), [err, setErr] = useState('');
  const load = useCallback(() => api.get('/farms').then(r => setList(r.data)), []);
  useEffect(() => { load(); }, [load]);
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const locate = () => navigator.geolocation?.getCurrentPosition(p => setF(x => ({ ...x, lat: +p.coords.latitude.toFixed(4), lon: +p.coords.longitude.toFixed(4) })), () => setErr('Location blocked. Enter coordinates manually.'));
  const submit = async e => {
    e.preventDefault(); setErr('');
    try { await (edit ? api.put('/farms/' + edit, f) : api.post('/farms', f)); setF(blank); setEdit(null); load(); } catch (x) { setErr(errMsg(x)); }
  };
  return (<>
    <h1 className="h2 mb-3">{t('Farms')}</h1>
    <form className="panel row g-3" onSubmit={submit}>
      <div className="col-md-6"><label className="form-label">Farm name</label><input className="form-control" required value={f.name} onChange={set('name')} /></div>
      <div className="col-md-6"><label className="form-label">Village / district</label><input className="form-control" value={f.village || ''} onChange={set('village')} /></div>
      <div className="col-6 col-md-3"><label className="form-label">Latitude</label><input type="number" step="any" className="form-control" required value={f.lat} onChange={set('lat')} /></div>
      <div className="col-6 col-md-3"><label className="form-label">Longitude</label><input type="number" step="any" className="form-control" required value={f.lon} onChange={set('lon')} /></div>
      <div className="col-6 col-md-3"><label className="form-label">Area (acres)</label><input type="number" step="any" min="0" className="form-control" value={f.areaAcres} onChange={set('areaAcres')} /></div>
      <div className="col-6 col-md-3"><label className="form-label">Soil type</label><select className="form-select" value={f.soilType} onChange={set('soilType')}>{['alluvial', 'black', 'red', 'laterite', 'sandy', 'loamy'].map(s => <option key={s}>{s}</option>)}</select></div>
      {err && <div className="col-12 text-danger" role="alert">{err}</div>}
      <div className="col-12 d-flex gap-2"><button className="btn btn-field">{edit ? t('Save') : t('Add farm')}</button><button type="button" className="btn btn-outline-secondary" onClick={locate}>Use my location</button>{edit && <button type="button" className="btn btn-link" onClick={() => { setEdit(null); setF(blank); }}>Cancel</button>}</div>
    </form>
    {!list.length && <p>No farms yet. Add your first farm above to unlock weather and crop tracking.</p>}
    {list.map(x => <div key={x._id} className="panel d-flex justify-content-between align-items-center flex-wrap gap-2">
      <div><strong>{x.name}</strong><div className="text-muted">{x.village} · {x.areaAcres} acres · {x.soilType} soil · {x.lat}, {x.lon}</div></div>
      <div className="d-flex gap-2"><button className="btn btn-sm btn-outline-secondary" onClick={() => { setEdit(x._id); setF(x); window.scrollTo(0, 0); }}>Edit</button>
        <button className="btn btn-sm btn-outline-danger" onClick={async () => { if (window.confirm('Delete this farm?')) { await api.delete('/farms/' + x._id); load(); } }}>{t('Delete')}</button></div>
    </div>)}
  </>);
}
