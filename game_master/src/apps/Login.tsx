import React, { useState, FormEvent } from 'react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Votre logique de connexion ici
    fetch('http://localhost/login.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Connexion réussie');
      } else {
        alert('Échec de la connexion');
      }
    })
    .catch(error => {
      console.error('Erreur:', error);
    });
  };

  return (
<div className="flex items-center justify-center min-h-screen mt">
    <div className="bg-blue-100 border-2 border-blue-200 p-10 rounded-lg shadow-lg w-250">
      <form className="max-w-md w-full space-y-8" onSubmit={handleLogin}>
        <div>
          <label htmlFor="email-address" className="sr-only">Adresse e-mail</label>
          <input
            id="email-address"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="appearance-none relative block w-80 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password" className="sr-only">Mot de passe </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="appearance-none relative block w-80 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Sign in
        </button>
      </form>
      <p className="mt-4 text-center">
      Pas de compte ? <a href="/SignUpPage" className="text-indigo-600 hover:text-indigo-500">S'inscrire</a>
    </p>
      </div>

    </div>
  );
};

export default LoginPage;
