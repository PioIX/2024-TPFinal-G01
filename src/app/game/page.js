"use client";

import { useState } from "react";
import styles from "./page.module.css"; // Asegúrate de crear este archivo CSS

export default function Game() {
  const [playerName, setPlayerName] = useState("");
  const [error, setError] = useState("");

  const handleStartGame = (e) => {
    e.preventDefault();
    if (playerName.trim() === "") {
      setError("Por favor, ingresa tu nombre.");
      return;
    }

    // Aquí puedes agregar la lógica para iniciar el juego
    alert(`¡Bienvenido al juego, ${playerName}!`);
  }; 

  return (
    <div className={styles.container}>
      <h1>Iniciar el Juego</h1>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleStartGame} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="playerName">Nombre del Jugador:</label>
          <input
            type="text"
            id="playerName"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            required
          />
        </div>
        <button type="submit" className={styles.startButton}>
          Iniciar Juego
        </button>
      </form>
    </div>
  );
}
