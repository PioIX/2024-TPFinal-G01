"use client";

import { useState, useEffect, useRef } from "react";
import styles from "../page.module.css";

export default function Game() {
  const [playerName, setPlayerName] = useState("");
  const [error, setError] = useState("");
  const canvasRef = useRef(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState({ left: 0, right: 0 });
  const [timeLeft, setTimeLeft] = useState(60);

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
    let dx = 5;
    let dy = 5;

    const paddleHeight = 70;
    const paddleWidth = 10;
    let player1Y = (canvas.height - paddleHeight) / 2;
    let player2Y = (canvas.height - paddleHeight) / 2;
    let playerSpeed = 5;

    let hitCount = 0;

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

    const drawFireEffect = () => {
      context.fillStyle = "orange";
      context.beginPath();
      context.arc(ballX, ballY, ballRadius + 5, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = "red";
      context.beginPath();
      context.arc(ballX, ballY, ballRadius + 3, 0, Math.PI * 2);
      context.fill();
    };

    const draw = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);

      context.fillStyle = "#FFFFFF";
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.beginPath();
      context.moveTo(canvas.width / 2, 0);
      context.lineTo(canvas.width / 2, canvas.height);
      context.strokeStyle = "#FF0000";
      context.lineWidth = 2;
      context.stroke();

      const goalWidth = 100;
      const goalHeight = 10;

      context.fillStyle = "#FF0000";
      context.fillRect(0, (canvas.height - goalWidth) / 2, goalHeight, goalWidth);
      context.fillRect(canvas.width - goalHeight, (canvas.height - goalWidth) / 2, goalHeight, goalWidth);

      context.fillStyle = "#0000FF";
      context.fillRect(20, player1Y, paddleWidth, paddleHeight);
      context.fillStyle = "#00FF00";
      context.fillRect(canvas.width - paddleWidth - 20, player2Y, paddleWidth, paddleHeight);

      context.beginPath();
      context.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
      context.fillStyle = "#000000";
      context.fill();
      context.closePath();

      ballX += dx;
      ballY += dy;

      // Rebote en las paredes horizontales
      if (ballY + dy > canvas.height - ballRadius || ballY + dy < ballRadius) {
        dy = -dy;
      }

      // Detección de colisión con la paleta del jugador 1
      if (ballX - ballRadius < 30 && ballY > player1Y && ballY < player1Y + paddleHeight) {
        dx = -dx;
        ballX = 30 + ballRadius; // Asegúrate de que la pelota no se "meta" en la paleta
        hitCount++;
      }

      // Detección de colisión con la paleta del jugador 2
      if (ballX + ballRadius > canvas.width - paddleWidth - 30 && ballY > player2Y && ballY < player2Y + paddleHeight) {
        dx = -dx;
        ballX = canvas.width - paddleWidth - 30 - ballRadius; // Asegúrate de que la pelota no se "meta" en la paleta
        hitCount++;
      }

      // Aumentar la velocidad y dibujar el fuego cada 3 toques
      if (hitCount % 3 === 0 && hitCount > 0) {
        dx *= 1.1; // Aumenta la velocidad
        drawFireEffect(); // Dibuja el efecto de fuego
      }

      // Puntuación en las zonas de gol
      if (ballX + ballRadius > canvas.width - goalHeight) {
        if (ballY > (canvas.height - goalWidth) / 2 && ballY < (canvas.height + goalWidth) / 2) {
          setScore((prev) => ({ ...prev, left: prev.left + 1 }));
        }
        resetBall();
      }
      if (ballX - ballRadius < goalHeight) {
        if (ballY > (canvas.height - goalWidth) / 2 && ballY < (canvas.height + goalWidth) / 2) {
          setScore((prev) => ({ ...prev, right: prev.right + 1 }));
        }
        resetBall();
      }

      requestAnimationFrame(draw);
    };

    const resetBall = () => {
      ballX = canvas.width / 2;
      ballY = canvas.height / 2;
      dx = 5 * (Math.random() > 0.5 ? 1 : -1);
      dy = 5 * (Math.random() > 0.5 ? 1 : -1);
      hitCount = 0;
    };

    const handleKeyDown = (e) => {
      if (e.key === "ArrowUp" && player1Y > 0) {
        player1Y -= playerSpeed;
      }
      if (e.key === "ArrowDown" && player1Y < canvas.height - paddleHeight) {
        player1Y += playerSpeed;
      }
      if (e.key === "o" && player2Y > 0) {
        player2Y -= playerSpeed;
      }
      if (e.key === "l" && player2Y < canvas.height - paddleHeight) {
        player2Y += playerSpeed;
      }
    };

    draw();
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearInterval(timerInterval);
      window.removeEventListener("keydown", handleKeyDown);
    };
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
