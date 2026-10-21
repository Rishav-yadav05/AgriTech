import { useCallback, useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import { useT } from '../i18n';
export default function Market() {
  const { t } = useT(), [items, setItems] = useState([]), [orders, setOrders] = useState([]), [cart, setCart] = useState({}), [address, setAddress] = useState(''), [msg, setMsg] = useState('');
  const load = useCallback(() => { api.get('/resources').then(r => setItems(r.data)); api.get('/orders').then(r => setOrders(r.data)); }, []);
  useEffect(() => { load(); }, [load]);
  const lines = items.filter(i => cart[i._id]), total = lines.reduce((s, i) => s + i.price * cart[i._id], 0);
  const order = async () => {
    try { await api.post('/orders', { address, items: lines.map(i => ({ resource: i._id, qty: cart[i._id] })) }); setCart({}); setMsg('Order placed.'); load(); } catch (e) { setMsg(errMsg(e)); }
  };
  return (<>
    <h1 className="h2 mb-3">{t('Market')}</h1>
    <div className="row g-3">{items.map(i => <div key={i._id} className="col-md-6"><div className="panel h-100 mb-0">
      <strong>{i.name}</strong><div className="text-muted">{i.category} · {i.stock} in stock</div><p className="mb-2">{i.description}</p>
      <div className="d-flex justify-content-between align-items-center"><span className="fw-bold">₹{i.price}</span>
        <div className="input-group input-group-sm" style={{ width: 130 }}><button className="btn btn-outline-secondary" aria-label="Less" onClick={() => setCart({ ...cart, [i._id]: Math.max(0, (cart[i._id] || 0) - 1) })}>−</button>
          <span className="form-control text-center">{cart[i._id] || 0}</span><button className="btn btn-outline-secondary" aria-label="More" disabled={(cart[i._id] || 0) >= i.stock} onClick={() => setCart({ ...cart, [i._id]: (cart[i._id] || 0) + 1 })}>+</button></div></div>
    </div></div>)}</div>
    {lines.length > 0 && <div className="panel mt-3"><h2 className="h5">{t('Cart')}</h2>{lines.map(i => <div key={i._id}>{i.name} × {cart[i._id]}: ₹{i.price * cart[i._id]}</div>)}
      <div className="fw-bold my-2">{t('Total')}: ₹{total}</div><input className="form-control mb-2" placeholder="Delivery address" value={address} onChange={e => setAddress(e.target.value)} />
      <button className="btn btn-field" onClick={order}>{t('Place order')}</button></div>}
    {msg && <div className="alert alert-info mt-3">{msg}</div>}
    <h2 className="h5 mt-4">My orders</h2>
    {!orders.length && <p>No orders yet.</p>}
    {orders.map(o => <div key={o._id} className="panel"><div className="d-flex justify-content-between"><strong>{o.createdAt.slice(0, 10)}</strong><span className="badge text-bg-secondary">{o.status}</span></div>{o.items.map((l, i) => <div key={i}>{l.name} × {l.qty}</div>)}<div className="fw-bold">₹{o.total}</div></div>)}
  </>);
}
