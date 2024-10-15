"use client";

import styles from "./game.module.css"; // Asegúrate de tener estilos para esta página

export default function Game() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>¡Bienvenido al Juego!</h1>
        <button className={styles.startButton}>
          Iniciar Juego
        </button>
      </main>
      <footer className={styles.footer}>
        <p>© 2024 Mi Aplicación</p>
      </footer>
    </div>
  );
}
