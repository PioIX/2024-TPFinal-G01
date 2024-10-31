"use client";

import { useState, useEffect, useRef } from "react";
import styles from "../page.module.css";

class Ball {
  constructor(canvasWidth, canvasHeight) {
    this.x = canvasWidth / 2;
    this.y = canvasHeight / 2;
    this.dx = 5; // Velocidad horizontal
    this.dy = 5; // Velocidad vertical
    this.radius = 10;
  }

  update() {
    this.x += this.dx;
    this.y += this.dy;
  }

  draw(context) {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    context.fillStyle = "#000000"; // Color de la pelota
    context.fill();
    context.closePath();
  }
}

export default function Game() {
  const [playerName, setPlayerName] = useState("");
  const [error, setError] = useState("");
  const canvasRef = useRef(null);
  const [gameStarted, setGameStarted] = useState(false);
  
  const paddleHeight = 70;
  const paddleWidth = 10;
  const playerSpeed = 5; 
  let player1Y = 0;
  let player2Y = 0;

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

    // Carga la imagen de fondo
    const backgroundImage = new Image();
    backgroundImage.src = "image.png"; 

    const ball = new Ball(canvas.width, canvas.height);

    const draw = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      // Dibuja la imagen de fondo
      context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

      // Dibuja las palas de los jugadores
      context.fillStyle = "#0000FF"; // Color de la pala del jugador 1
      context.fillRect(20, player1Y, paddleWidth, paddleHeight);
      context.fillStyle = "#00FF00"; // Color de la pala del jugador 2
      context.fillRect(canvas.width - paddleWidth - 20, player2Y, paddleWidth, paddleHeight);
      
      ball.update(); // Actualiza la posición de la pelota
      ball.draw(context); // Dibuja la pelota

      // Rebote en las paredes
      if (ball.y + ball.dy > canvas.height - ball.radius || ball.y + ball.dy < ball.radius) {
        ball.dy = -ball.dy; // Cambia la dirección vertical
      }

      // Detección de colisión con la paleta del jugador 1
      if (ball.x - ball.radius < 30 && ball.y > player1Y && ball.y < player1Y + paddleHeight) {
        ball.dx = -ball.dx; // Cambia la dirección horizontal
        ball.x = 30 + ball.radius; // Asegúrate de que la pelota no se "meta" en la paleta
      }

      // Detección de colisión con la paleta del jugador 2
      if (ball.x + ball.radius > canvas.width - paddleWidth - 30 && ball.y > player2Y && ball.y < player2Y + paddleHeight) {
        ball.dx = -ball.dx; // Cambia la dirección horizontal
        ball.x = canvas.width - paddleWidth - 30 - ball.radius; // Asegúrate de que la pelota no se "meta" en la paleta
      }

      requestAnimationFrame(draw);
    };

    backgroundImage.onload = () => {
      draw(); // Inicia el dibujo una vez que la imagen se ha cargado
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameStarted]);

  const handleKeyDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const maxPlayerY = canvas.height - paddleHeight;

    if (e.key === "ArrowUp" && player1Y > 0) {
      player1Y -= playerSpeed;
    }
    if (e.key === "ArrowDown" && player1Y < maxPlayerY) {
      player1Y += playerSpeed;
    }
    if (e.key === "o" && player2Y > 0) {
      player2Y -= playerSpeed;
    }
    if (e.key === "l" && player2Y < maxPlayerY) {
      player2Y += playerSpeed;
    }
  };

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
