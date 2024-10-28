"use client";

import { useState, useEffect, useRef } from "react";
import styles from "../page.module.css";

export default function Game() {
  const [playerName, setPlayerName] = useState("");
  const [error, setError] = useState("");
  const canvasRef = useRef(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState({ left: 0, right: 0 });
  const [timeLeft, setTimeLeft] = useState(60); // 60 segundos de tiempo de juego

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
    let dx = 3; // Velocidad en el eje X
    let dy = 3; // Velocidad en el eje Y
    const friction = 0.99; // Fricción para reducir la velocidad

    // Paleta del jugador
    const paddleHeight = 70;
    const paddleWidth = 10;
    let player1Y = (canvas.height - paddleHeight) / 2; // Posición del primer jugador
    let player2Y = (canvas.height - paddleHeight) / 2; // Posición del segundo jugador
    let playerSpeed = 5;

    // Variables para controlar la cuenta regresiva
    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timerInterval);
          setGameStarted(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Función para dibujar la cancha y actualizar el estado del juego
    const draw = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Fondo de la cancha
      context.fillStyle = "#FFFFFF";
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Línea central
      context.beginPath();
      context.moveTo(canvas.width / 2, 0);
      context.lineTo(canvas.width / 2, canvas.height);
      context.strokeStyle = "#FF0000";
      context.lineWidth = 2;
      context.stroke();

      // Círculo central
      context.beginPath();
      context.arc(canvas.width / 2, canvas.height / 2, 50, 0, Math.PI * 2);
      context.strokeStyle = "#FF0000";
      context.lineWidth = 2;
      context.stroke();

      // Zonas de gol
      const goalWidth = 100;
      const goalHeight = 10;

      // Zona de gol izquierda
      context.fillStyle = "#FF0000";
      context.fillRect(0, (canvas.height - goalWidth) / 2, goalHeight, goalWidth);

      // Zona de gol derecha
      context.fillRect(canvas.width - goalHeight, (canvas.height - goalWidth) / 2, goalHeight, goalWidth);

      // Dibuja la paleta del jugador 1
      context.fillStyle = "#0000FF";
      context.fillRect(20, player1Y, paddleWidth, paddleHeight);

      // Dibuja la paleta del jugador 2
      context.fillStyle = "#00FF00"; // Color del segundo jugador
      context.fillRect(canvas.width - paddleWidth - 20, player2Y, paddleWidth, paddleHeight);

      // Dibuja la pelota
      context.beginPath();
      context.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
      context.fillStyle = "#000000";
      context.fill();
      context.closePath();

      // Mueve la pelota con fricción
      ballX += dx;
      ballY += dy;
      dx *= friction;
      dy *= friction;

      // Rebote en los bordes superior e inferior
      if (ballY + dy > canvas.height - ballRadius || ballY + dy < ballRadius) {
        dy = -dy;
      }

      // Detección de colisión con la paleta del jugador 1
      if (
        ballX - ballRadius < 30 && // Cercano al lado izquierdo (donde está la paleta)
        ballY > player1Y &&
        ballY < player1Y + paddleHeight
      ) {
        dx = -dx;
      }

      // Detección de colisión con la paleta del jugador 2
      if (
        ballX + ballRadius > canvas.width - paddleWidth - 30 && // Cercano al lado derecho (donde está la paleta)
        ballY > player2Y &&
        ballY < player2Y + paddleHeight
      ) {
        dx = -dx;
      }

      // Puntuación en las zonas de gol
      if (ballX + ballRadius > canvas.width) {
        setScore((prev) => ({ ...prev, left: prev.left + 1 }));
        resetBall();
      }
      if (ballX - ballRadius < 0) {
        setScore((prev) => ({ ...prev, right: prev.right + 1 }));
        resetBall();
      }

      requestAnimationFrame(draw);
    };

    const resetBall = () => {
      ballX = canvas.width / 2;
      ballY = canvas.height / 2;
      dx = 3 * (Math.random() > 0.5 ? 1 : -1);
      dy = 3 * (Math.random() > 0.5 ? 1 : -1);
    };

    // Control de la paleta del jugador 1
    const handleKeyDown = (e) => {
      if (e.key === "ArrowUp" && player1Y > 0) {
        player1Y -= playerSpeed;
      }
      if (e.key === "ArrowDown" && player1Y < canvas.height - paddleHeight) {
        player1Y += playerSpeed;
      }
      // Control de la paleta del jugador 2 con O y L
      if (e.key === "o" && player2Y > 0) {
        player2Y -= playerSpeed;
      }
      if (e.key === "l" && player2Y < canvas.height - paddleHeight) {
        player2Y += playerSpeed;
      }
    };

    draw();
    window.addEventListener("keydown", handleKeyDown);

    // Limpieza
    return () => {
      clearInterval(timerInterval);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameStarted]); // Eliminar player2Y de las dependencias

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
        <div className={styles.canvasContainer}>
          <div className={styles.scoreBoard}>
            <p>{`Tiempo restante: ${timeLeft}s`}</p>
            <p>{`Puntaje: Izquierda ${score.left} - Derecha ${score.right}`}</p>
          </div>
          <canvas
            ref={canvasRef}
            width={800}
            height={400}
            style={{ border: "1px solid black", marginTop: "20px" }}
          />
        </div>
      )}
    </div>
  );
}
