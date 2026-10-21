import { useCallback, useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import { useAuth } from '../auth';
import { useT } from '../i18n';
export default function Community() {
  const { user } = useAuth(), { t } = useT(), isAdmin = user.role === 'admin';
  const tabs = [['forum', 'Forum'], ['consult', 'Ask an expert'], ['pestAlert', 'Pest alerts']];
  const [type, setType] = useState('forum'), [posts, setPosts] = useState([]), [f, setF] = useState({ title: '', body: '' }), [reply, setReply] = useState({}), [err, setErr] = useState('');
  const load = useCallback(() => api.get('/posts?type=' + type).then(r => setPosts(r.data)), [type]);
  useEffect(() => { load(); }, [load]);
  const canPost = type !== 'pestAlert' || isAdmin;
  const submit = async e => { e.preventDefault(); setErr(''); try { await api.post('/posts', { ...f, type }); setF({ title: '', body: '' }); load(); } catch (x) { setErr(errMsg(x)); } };
  return (<>
    <h1 className="h2 mb-3">{t('Community')}</h1>
    <div className="btn-group mb-3" role="tablist">{tabs.map(([k, l]) => <button key={k} className={'btn ' + (type === k ? 'btn-field' : 'btn-outline-secondary')} onClick={() => setType(k)}>{t(l)}</button>)}</div>
    {canPost && <form className="panel" onSubmit={submit}>
      <input className="form-control mb-2" required placeholder={type === 'consult' ? 'Your question (crop, problem)' : 'Title'} value={f.title} onChange={e => setF({ ...f, title: e.target.value })} />
      <textarea className="form-control mb-2" rows={3} required placeholder="Details" value={f.body} onChange={e => setF({ ...f, body: e.target.value })} />
      {err && <div className="text-danger mb-2" role="alert">{err}</div>}<button className="btn btn-field">{t('Post')}</button></form>}
    {!posts.length && <p>Nothing here yet.</p>}
    {posts.map(p => <div key={p._id} className="panel">
      <div className="d-flex justify-content-between"><strong>{p.title}</strong>{(isAdmin || p.author?._id === user._id) && <button className="btn btn-sm btn-link text-danger" onClick={async () => { await api.delete('/posts/' + p._id); load(); }}>{t('Delete')}</button>}</div>
      <div className="text-muted small">{p.author?.name}{p.author?.role === 'admin' && ' (expert)'} · {p.createdAt.slice(0, 10)}</div><p className="mt-2">{p.body}</p>
      {p.replies.map(r => <div key={r._id} className="border-start ps-3 mb-2"><span className="small text-muted">{r.author?.name}{r.author?.role === 'admin' && ' (expert)'}</span><div>{r.body}</div></div>)}
      {type !== 'pestAlert' && <div className="input-group"><input className="form-control" aria-label="Reply" value={reply[p._id] || ''} onChange={e => setReply({ ...reply, [p._id]: e.target.value })} />
        <button className="btn btn-outline-secondary" onClick={async () => { if (!reply[p._id]) return; await api.post(`/posts/${p._id}/replies`, { body: reply[p._id] }); setReply({ ...reply, [p._id]: '' }); load(); }}>{t('Reply')}</button></div>}
    </div>)}
  </>);
}
