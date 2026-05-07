import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setToken } from '../utils/auth';

function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });  // ✅ fix

  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });  // ye form update krdega

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {

      const res = await fetch('https://securelink-backend-ohtu.onrender.com/api/auth/signup', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(form),
     });

      const data = await res.json();

      if (res.ok && data.token) {
        setToken(data.token);
        navigate('/');
      } else {
        alert(data.msg || 'Signup failed');
      }
    } catch (err) {
      alert('Server error');
    }
  };

  return (
    <div>
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="name" onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
        <button type="submit">Signup</button>
      </form>
    </div>
  );
}

export default Signup;
