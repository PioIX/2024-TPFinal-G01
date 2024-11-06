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
    context.fillStyle = "#FF0000"; // Ball color
    context.fill();
    context.closePath();
  }

  reset() {
    this.x = CANVAS_WIDTH / 2;
    this.y = CANVAS_HEIGHT / 2;
    this.dx = BALL_SPEED/*  * (Math.random() < 0.5 ? 1 : -1) */; // Mantener la velocidad constante
    this.dy = BALL_SPEED/*  * (Math.random() < 0.5 ? 1 : -1) */; // Mantener la velocidad constante
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
    context.fillStyle = "#0000FF"; // Paddle color
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
  const [playerName, setPlayerName] = useState("");
  const [error, setError] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [waitingForRestart, setWaitingForRestart] = useState(false);
  const [player1, setPlayer1] = useState(new Paddle(20));
  const [player2, setPlayer2] = useState(new Paddle(CANVAS_WIDTH - 30));
  const [ball, setBall] = useState(new Ball());
  const [scores, setScores] = useState({ player1: 0, player2: 0 });
  const [gameOver, setGameOver] = useState(false);
  const canvasRef = useRef(null);

  const handleStartGame = (e) => {
    e.preventDefault();
    if (playerName.trim() === "") {
      setError("Por favor, ingresa tu nombre.");
      return;
    }
    setError("");
    setGameStarted(true);
    resetGame();
  };

  const resetGame = () => {
    setPlayer1(new Paddle(20));
    setPlayer2(new Paddle(CANVAS_WIDTH - 30));
    setBall(new Ball());
    setScores({ player1: 0, player2: 0 });
    setGameOver(false);
    setWaitingForRestart(false);
  };

  const checkCollisions = () => {
    // Wall collision
    if (ball.y + ball.dy > CANVAS_HEIGHT - ball.radius || ball.y + ball.dy < ball.radius) {
      ball.dy = -ball.dy;
    }

    // Paddle collision
    if (ball.x - ball.radius < player1.x + player1.width && ball.y > player1.y && ball.y < player1.y + player1.height) {
      ball.dx = -ball.dx;
      ball.x = player1.x + player1.width + ball.radius;
    }

    if (ball.x + ball.radius > player2.x && ball.y > player2.y && ball.y < player2.y + player2.height) {
      ball.dx = -ball.dx;
      ball.x = player2.x - ball.radius;
    }
  };

  const updateScores = () => {
    if (ball.x + ball.radius > CANVAS_WIDTH) {
      setScores(prevScores => ({ ...prevScores, player1: prevScores.player1 + 1 }));
      setWaitingForRestart(true);
      ball.reset(); // Reset ball position but wait for SPACEBAR
    } else if (ball.x - ball.radius < 0) {
      setScores(prevScores => ({ ...prevScores, player2: prevScores.player2 + 1 }));
      setWaitingForRestart(true);
      ball.reset(); // Reset ball position but wait for SPACEBAR
    }
  };

  const draw = useCallback(() => {
    const context = canvasRef.current.getContext("2d");
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

  useEffect(() => {
    if (!gameStarted) return;

    draw();

    const handleKeyDown = (e) => {
      if (gameOver) return;

      if (waitingForRestart && e.code === "Space") {
        resetGame();
        return;
      }

      if (e.key === "ArrowUp") player1.move("up");
      if (e.key === "ArrowDown") player1.move("down");
      if (e.key === "o") player2.move("up");
      if (e.key === "l") player2.move("down");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameStarted, gameOver, waitingForRestart]);

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
      {gameStarted && !gameOver && (
        <div className={styles.canvasContainer}>
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            style={{ border: "1px solid black", marginTop: "20px" }}
          />
          <div className={styles.scoreboard}>
            <h2>Scores</h2>
            <p>{playerName} (Jugador 1): {scores.player1}</p>
            <p>Jugador 2: {scores.player2}</p>
          </div>
        </div>
      )}
      {gameOver && (
        <div className={styles.gameOver}>
          <h2>¡Juego Terminado!</h2>
          <p>{scores.player1 > scores.player2 ? `${playerName} gana!` : "¡Jugador 2 gana!"}</p>
          <button onClick={resetGame} className={styles.restartButton}>Reiniciar Juego</button>
        </div>
      )}
      {waitingForRestart && (
        <div className={styles.restartMessage}>
          <p>Presiona SPACE para reiniciar el juego.</p>
        </div>
      )}
    </div>
  );
};

export default Game;
