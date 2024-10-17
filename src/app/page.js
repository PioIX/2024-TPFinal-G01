"use client";

import { useState } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false); // Nuevo estado para el éxito

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError("");
    setSuccess(false); // Reset del estado de éxito al cambiar entre login y registro
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false); // Reset del mensaje de éxito al enviar el formulario

    if (!validateEmail(email)) {
      setError("Email inválido");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (isLogin) {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (userData && userData.email === email && userData.password === password) {
        setSuccess(true); // Establecer éxito en lugar de redirigir
      } else {
        setError("Credenciales incorrectas");
      }
    } else {
      localStorage.setItem("user", JSON.stringify({ email, password }));
      setIsLogin(true); // Cambia a vista de inicio de sesión
      setSuccess(true); // Mostrar éxito al registrarse correctamente
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>{isLogin ? "Login" : "Register"}</h1>
        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>¡Operación exitosa!</p>} {/* Mensaje de éxito */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {!isLogin && (
            <div className={styles.formGroup}>
              <label htmlFor="confirm-password">Confirm Password:</label>
              <input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}
          <button type="submit" className={styles.submitButton}>
            {isLogin ? "Login" : "Register"}
          </button>
        </form>
        <p className={styles.toggleText}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button onClick={toggleForm} className={styles.toggleButton}>
            {isLogin ? "Register" : "Login"}
          </button>
        </p>
      </main>
      <footer className={styles.footer}>
        <p>© 2024 Mi Aplicación</p>
      </footer>
    </div>
  );
}
