import { useCallback, useEffect, useState } from 'react';
import api, { errMsg } from '../api';
const blank = { name: '', category: 'seed', price: '', stock: '', description: '' };
export default function Admin() {
  const [s, setS] = useState({}), [users, setUsers] = useState([]), [res, setRes] = useState([]), [orders, setOrders] = useState([]), [f, setF] = useState(blank), [err, setErr] = useState('');
  const load = useCallback(() => { api.get('/admin/stats').then(r => setS(r.data)); api.get('/admin/users').then(r => setUsers(r.data)); api.get('/resources').then(r => setRes(r.data)); api.get('/orders?all=1').then(r => setOrders(r.data)); }, []);
  useEffect(() => { load(); }, [load]);
  const add = async e => { e.preventDefault(); setErr(''); try { await api.post('/resources', f); setF(blank); load(); } catch (x) { setErr(errMsg(x)); } };
  return (<>
    <h1 className="h2 mb-3">Admin</h1>
    <div className="row g-3 mb-3">{[['users', 'Users'], ['farms', 'Farms'], ['crops', 'Crops'], ['orders', 'Orders'], ['revenue', 'Revenue ₹']].map(([k, l]) => <div key={k} className="col-6 col-md"><div className="panel mb-0"><div className="metric">{s[k] ?? '–'}</div>{l}</div></div>)}</div>
    <div className="panel"><h2 className="h5">Orders (approve and track)</h2>{!orders.length && <p>No orders yet.</p>}
      {orders.map(o => <div key={o._id} className="d-flex justify-content-between align-items-center border-bottom py-2 flex-wrap gap-2"><span>{o.user?.name}: {o.items.map(i => `${i.name} × ${i.qty}`).join(', ')} (₹{o.total})</span>
        <select className="form-select form-select-sm w-auto" aria-label="Order status" value={o.status} onChange={async e => { await api.patch(`/orders/${o._id}/status`, { status: e.target.value }); load(); }}>{['placed', 'approved', 'shipped', 'delivered', 'cancelled'].map(x => <option key={x}>{x}</option>)}</select></div>)}</div>
    <div className="panel"><h2 className="h5">Resources</h2>
      <form className="row g-2 mb-3" onSubmit={add}>
        <div className="col-md-4"><input className="form-control" required placeholder="Name" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></div>
        <div className="col-md-2"><select className="form-select" value={f.category} onChange={e => setF({ ...f, category: e.target.value })}>{['seed', 'fertilizer', 'pesticide', 'equipment'].map(c => <option key={c}>{c}</option>)}</select></div>
        <div className="col-6 col-md-2"><input type="number" min="0" className="form-control" required placeholder="Price ₹" value={f.price} onChange={e => setF({ ...f, price: e.target.value })} /></div>
        <div className="col-6 col-md-2"><input type="number" min="0" className="form-control" required placeholder="Stock" value={f.stock} onChange={e => setF({ ...f, stock: e.target.value })} /></div>
        <div className="col-md-2"><button className="btn btn-field w-100">Add</button></div>{err && <div className="col-12 text-danger">{err}</div>}</form>
      {res.map(r => <div key={r._id} className="d-flex justify-content-between border-bottom py-1"><span>{r.name} · ₹{r.price} · {r.stock} left</span><button className="btn btn-sm btn-link text-danger" onClick={async () => { await api.delete('/resources/' + r._id); load(); }}>Delete</button></div>)}</div>
    <div className="panel"><h2 className="h5">Users</h2>
      {users.map(u => <div key={u._id} className="d-flex justify-content-between border-bottom py-1"><span>{u.name} · {u.email} · {u.role}</span>{u.role !== 'admin' && <button className="btn btn-sm btn-link text-danger" onClick={async () => { if (window.confirm('Delete user and their farms and crops?')) { await api.delete('/admin/users/' + u._id); load(); } }}>Delete</button>}</div>)}</div>
  </>);
}
