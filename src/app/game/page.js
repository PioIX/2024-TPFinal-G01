"use client";

import { useState, useEffect, useRef } from "react";
import styles from "../game.module.css"; 

export default function Game() {
  const [playerName, setPlayerName] = useState("");
  const [error, setError] = useState("");
  const canvasRef = useRef(null);
  const [gameStarted, setGameStarted] = useState(false);

  const handleStartGame = (e) => {
    e.preventDefault();
    if (playerName.trim() === "") {
      setError("Por favor, ingresa tu nombre.");
      return;
    }
    setError("");
    setGameStarted(true);
  };

  useEffect(() => {
    if (!gameStarted) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    let ballX = canvas.width / 2;
    let ballY = canvas.height / 2;
    const ballRadius = 10;
    let dx = 2; // Velocidad en el eje X
    let dy = 2; // Velocidad en el eje Y

    const draw = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      // Dibuja la cancha
      context.fillStyle = "#0095DD";
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Dibuja la pelota
      context.beginPath();
      context.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
      context.fillStyle = "#FFFFFF";
      context.fill();
      context.closePath();

      // Mueve la pelota
      if (ballX + dx > canvas.width - ballRadius || ballX + dx < ballRadius) {
        dx = -dx;
      }
      if (ballY + dy > canvas.height - ballRadius || ballY + dy < ballRadius) {
        dy = -dy;
      }

      ballX += dx;
      ballY += dy;

      requestAnimationFrame(draw);
    };

    draw();
  }, [gameStarted]);

  return (
    <div className={styles.container}>
      <h1>Iniciar el Juego</h1>
      {error && <p className={styles.error}>{error}</p>}
      {!gameStarted && (
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
      )}
      {gameStarted && (
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          style={{ border: "1px solid black", marginTop: "20px" }}
        />
      )}
    </div>
  );
}