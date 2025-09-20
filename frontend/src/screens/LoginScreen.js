import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await login(email, password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-container">
        <h2>Bhrashtachar Mukt</h2>
        <h3>Login</h3>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email:</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Password:</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit">Login</button>
        </form>
        
        <div className="demo-credentials">
          <h4>Demo Credentials:</h4>
          <p><strong>Citizen:</strong> citizen@example.com / password123</p>
          <p><strong>Police:</strong> police@example.com / password123</p>
          <p><strong>Official:</strong> official@example.com / password123</p>
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;