"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import styles from "./page.module.css";

// Constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const PADDLE_HEIGHT = 70;
const PADDLE_WIDTH = 10;
const BALL_RADIUS = 10;
const PLAYER_SPEED = 5;
const SCORE_LIMIT = 5;
const BALL_SPEED = 5; // Velocidad constante

// Ball class
class Ball {
  constructor() {
    this.reset();
  }

  update() {
    this.x += this.dx;
    this.y += this.dy;
  }

  draw(context) {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    context.fillStyle = "#FFA500"; // Cambia el color de la pelota a naranja
    context.fill();
    context.closePath();
  }

  reset() {
    this.x = CANVAS_WIDTH / 2;
    this.y = CANVAS_HEIGHT / 2;
    this.dx = BALL_SPEED;
    this.dy = BALL_SPEED;
    this.radius = BALL_RADIUS;
  }
}

// Paddle class
class Paddle {
  constructor(x) {
    this.x = x;
    this.y = (CANVAS_HEIGHT - PADDLE_HEIGHT) / 2;
    this.width = PADDLE_WIDTH;
    this.height = PADDLE_HEIGHT;
  }

  draw(context) {
    context.fillStyle = "#FF0000"; // Cambia el color de las paletas a rojo
    context.fillRect(this.x, this.y, this.width, this.height);
  }

  move(direction) {
    if (direction === "up" && this.y > 0) {
      this.y -= PLAYER_SPEED;
    } else if (direction === "down" && this.y < CANVAS_HEIGHT - this.height) {
      this.y += PLAYER_SPEED;
    }
  }

  reset() {
    this.y = (CANVAS_HEIGHT - this.height) / 2; // Reset paddle position
  }
}

const Game = () => {
  const [player1Name, setPlayer1Name] = useState("");
  const [player2Name, setPlayer2Name] = useState("");
  const [error, setError] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [waitingForRestart, setWaitingForRestart] = useState(false);
  const [player1, setPlayer1] = useState(new Paddle(20));
  const [player2, setPlayer2] = useState(new Paddle(CANVAS_WIDTH - 30));
  const [ball, setBall] = useState(new Ball());
  const [scores, setScores] = useState({ player1: 0, player2: 0 });
  const [gameOver, setGameOver] = useState(false);
  const canvasRef = useRef(null);

  // Función que maneja el inicio del juego
  const handleStartGame = (e) => {
    e.preventDefault();
    if (player1Name.trim() === "" || player2Name.trim() === "") {
      setError("Por favor, ingresa los nombres de ambos jugadores.");
      return;
    }
    setError("");
    setGameStarted(true);
    resetGame();
  };

  // Función para reiniciar el juego
  const resetGame = () => {
    setPlayer1(new Paddle(20));
    setPlayer2(new Paddle(CANVAS_WIDTH - 30));
    setBall(new Ball());
    setScores({ player1: 0, player2: 0 });
    setGameOver(false);
    setWaitingForRestart(false);
  };

  // Función para verificar colisiones de la pelota con las palas y las paredes
  const checkCollisions = () => {
    // Colisiones con las paredes superior e inferior
    if (ball.y + ball.dy > CANVAS_HEIGHT - ball.radius || ball.y + ball.dy < ball.radius) {
      ball.dy = -ball.dy;
    }

    // Colisión con la paleta del jugador 1
    if (ball.x - ball.radius < player1.x + player1.width && ball.y > player1.y && ball.y < player1.y + player1.height) {
      ball.dx = -ball.dx;
      ball.x = player1.x + player1.width + ball.radius;
    }

    // Colisión con la paleta del jugador 2
    if (ball.x + ball.radius > player2.x && ball.y > player2.y && ball.y < player2.y + player2.height) {
      ball.dx = -ball.dx;
      ball.x = player2.x - ball.radius;
    }
  };

  // Función para actualizar el marcador
  const updateScores = () => {
    if (ball.x + ball.radius > CANVAS_WIDTH) {
      setScores(prevScores => ({ ...prevScores, player1: prevScores.player1 + 1 }));
      setWaitingForRestart(true);
      ball.reset();
    } else if (ball.x - ball.radius < 0) {
      setScores(prevScores => ({ ...prevScores, player2: prevScores.player2 + 1 }));
      setWaitingForRestart(true);
      ball.reset();
    }
  };

  // Función de dibujo que se llama en cada fotograma
  const draw = useCallback(() => {
    const context = canvasRef.current?.getContext("2d");
    if (!context) return; // Asegúrate de que el contexto está disponible

    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    player1.draw(context);
    player2.draw(context);
    ball.update();
    ball.draw(context);
    
    checkCollisions();
    updateScores();

    if (scores.player1 >= SCORE_LIMIT || scores.player2 >= SCORE_LIMIT) {
      setGameOver(true);
    }

    requestAnimationFrame(draw);
  }, [ball, player1, player2, scores]);

  // Efecto que inicializa el juego y maneja las teclas
  useEffect(() => {
    if (!gameStarted) return;

    draw();

    const handleKeyDown = (e) => {
      if (gameOver) return;

      if (waitingForRestart && e.code === "Space") {
        resetGame();
        return;
      }

      // Movimiento independiente para cada jugador
      if (e.key === "ArrowUp") {
        player1.move("up");
      }
      if (e.key === "ArrowDown") {
        player1.move("down");
      }

      if (e.key === "o") {
        player2.move("up");
      }
      if (e.key === "l") {
        player2.move("down");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameStarted, gameOver, waitingForRestart]);

  useEffect(() => {
    // Este effect garantiza que el canvas y el contexto estén listos antes de cualquier manipulación.
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      // Puedes hacer cualquier preparación adicional con el contexto aquí si es necesario
    }
  }, []); // Este useEffect solo se ejecuta una vez cuando el componente se monta

  return (
    <div className={styles.container}>
      <h1>Iniciar el Juego</h1>
      {error && <p className={styles.error}>{error}</p>}
      {!gameStarted && (
        <form onSubmit={handleStartGame} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="player1Name">Nombre del Jugador 1:</label>
            <input
              type="text"
              id="player1Name"
              value={player1Name}
              onChange={(e) => setPlayer1Name(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="player2Name">Nombre del Jugador 2:</label>
            <input
              type="text"
              id="player2Name"
              value={player2Name}
              onChange={(e) => setPlayer2Name(e.target.value)}
              required
            />
          </div>
          <button type="submit" className={styles.startButton}>
            Iniciar Juego
          </button>
        </form>
      )}
      {gameStarted && !gameOver && (
        <div className={styles.canvasContainer}>
          <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
          <div className={styles.scoreboard}>
            <h2>{player1Name} ({scores.player1}) - {player2Name} ({scores.player2})</h2>
          </div>
          {waitingForRestart && <p>Presiona Espacio para reiniciar la pelota</p>}
        </div>
      )}
      {gameOver && (
        <div className={styles.gameOver}>
          <h2>¡Juego Terminado!</h2>
          <p>{scores.player1 >= SCORE_LIMIT ? `${player1Name} ganó!` : `${player2Name} ganó!`}</p>
          <button onClick={resetGame} className={styles.restartButton}>
            Reiniciar Juego
          </button>
        </div>
      )}
    </div>
  );
};

export default Game;
