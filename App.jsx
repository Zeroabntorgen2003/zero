import { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

export default function App() {
  const [form, setForm] = useState({ name: '', phone: '', guests: '', date: '', time: '' });
  const [submitted, setSubmitted] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminAccess, setAdminAccess] = useState(false);
  const [password, setPassword] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'reservations'), form);
      setSubmitted(true);
    } catch (error) {
      console.error('خطأ في الحجز:', error);
    }
  };

  const fetchReservations = async () => {
    let q = collection(db, 'reservations');
    if (filterDate) {
      q = query(q, where('date', '==', filterDate));
    }
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setReservations(data);
  };

  useEffect(() => {
    if (showAdmin && adminAccess) fetchReservations();
  }, [showAdmin, adminAccess, filterDate]);

  const handleAccess = () => {
    if (password === 'admin123') {
      setAdminAccess(true);
    } else {
      alert('كلمة المرور غير صحيحة');
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif', direction: 'rtl' }}>
      <h1 style={{ textAlign: 'center', color: '#6b4f4f' }}>كافيه السعادة</h1>
      <div style={{ textAlign: 'center', margin: '10px 0' }}>
        <button onClick={() => setShowAdmin(!showAdmin)} style={{ padding: 10 }}>
          {showAdmin ? 'العودة للحجز' : 'عرض الحجوزات'}
        </button>
      </div>

      {showAdmin ? (
        !adminAccess ? (
          <div style={{ maxWidth: 300, margin: 'auto' }}>
            <h3>كلمة مرور الإدارة</h3>
            <input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='أدخل كلمة المرور'
              style={{ width: '100%', padding: 8 }}
            />
            <button onClick={handleAccess} style={{ width: '100%', marginTop: 10 }}>دخول</button>
          </div>
        ) : (
          <div style={{ maxWidth: 600, margin: 'auto' }}>
            <h3>قائمة الحجوزات</h3>
            <input
              type='date'
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              style={{ width: '100%', marginBottom: 10, padding: 8 }}
            />
            <ul>
              {reservations.map(r => (
                <li key={r.id} style={{ background: '#fff', margin: '5px 0', padding: 10, borderRadius: 5 }}>
                  <strong>{r.name}</strong> - {r.phone} - {r.guests} أشخاص - {r.date} {r.time}
                </li>
              ))}
            </ul>
          </div>
        )
      ) : (
        <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: 'auto' }}>
          {submitted ? (
            <p style={{ color: 'green', textAlign: 'center' }}>تم إرسال الحجز بنجاح!</p>
          ) : (
            <>
              <input type='text' name='name' placeholder='الاسم' value={form.name} onChange={handleChange} required style={{ width: '100%', padding: 8, marginBottom: 8 }} />
              <input type='tel' name='phone' placeholder='رقم الهاتف' value={form.phone} onChange={handleChange} required style={{ width: '100%', padding: 8, marginBottom: 8 }} />
              <input type='number' name='guests' placeholder='عدد الأشخاص' value={form.guests} onChange={handleChange} required style={{ width: '100%', padding: 8, marginBottom: 8 }} />
              <input type='date' name='date' value={form.date} onChange={handleChange} required style={{ width: '100%', padding: 8, marginBottom: 8 }} />
              <input type='time' name='time' value={form.time} onChange={handleChange} required style={{ width: '100%', padding: 8, marginBottom: 8 }} />
              <button type='submit' style={{ width: '100%', padding: 10 }}>احجز الآن</button>
            </>
          )}
        </form>
      )}
    </div>
  );
}