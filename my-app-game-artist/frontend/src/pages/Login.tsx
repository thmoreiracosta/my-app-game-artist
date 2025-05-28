import { useState } from 'react';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        email, password
      });
      localStorage.setItem("token", res.data.token);
      alert("Login com sucesso!");
      window.location.href = "/dashboard";
    } catch (e) {
      alert("Erro no login.");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Login</h1>
      <input type="email" className="input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" className="input mt-2" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} />
      <button className="btn mt-4" onClick={handleLogin}>Entrar</button>
    </div>
  );
}
