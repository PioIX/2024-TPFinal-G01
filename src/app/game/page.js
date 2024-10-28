"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

const AirHockeyGame = () => {
  const canvasRef = useRef(null);
  const [playerScore, setPlayerScore] = useState(0);
  const paddleRadius = 30; // Radio del círculo de la paleta
  const puckRadius = 10; // Radio del disco

  let paddleY = 400; // Posición inicial de la paleta
  let puckX = 300; // Posición inicial de la pelota
  let puckY = 500; // Posición inicial de la pelota (debajo de la paleta)
  let puckVelocityX = 0;
  let puckVelocityY = 0;
  const friction = 0.35; // Factor de fricción para desacelerar la pelota

  const draw = (ctx) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Dibuja la pelota (puck azul)
    ctx.beginPath();
    ctx.arc(puckX, puckY, puckRadius, 0, Math.PI * 2);
    ctx.fillStyle = "blue"; // Color de la pelota
    ctx.fill();
    ctx.closePath();

    // Dibuja la paleta como un círculo
    ctx.beginPath();
    ctx.arc(50, paddleY, paddleRadius, 0, Math.PI * 2); // Paleta en el lado izquierdo
    ctx.fillStyle = "red"; // Color de la paleta
    ctx.fill();
    ctx.closePath();
  };

  const update = () => {
    // Aplica fricción a las velocidades
    puckVelocityX *= friction;
    puckVelocityY *= friction;

    // Actualiza la posición de la pelota
    puckX += puckVelocityX;
    puckY += puckVelocityY;

    // Colisiones con las paredes
    if (puckX + puckRadius > canvasRef.current.width || puckX - puckRadius < 0) {
      puckVelocityX = -puckVelocityX;
    }
    if (puckY + puckRadius > canvasRef.current.height || puckY - puckRadius < 0) {
      puckVelocityY = -puckVelocityY;
    }

    // Si la velocidad es muy baja, detén la pelota
    if (Math.abs(puckVelocityX) < 0.1 && Math.abs(puckVelocityY) < 0.1) {
      puckVelocityX = 0;
      puckVelocityY = 0;
    }

    // Colisión con la paleta
    if (
      puckX - puckRadius < 50 + paddleRadius && // Límite derecho de la paleta
      puckY > paddleY - paddleRadius &&
      puckY < paddleY + paddleRadius
    ) {
      // Cambia la dirección de la pelota al ser golpeada
      puckVelocityX = 5; // Cambia la velocidad al ser golpeada
      puckVelocityY = (paddleY - puckY) / 5; // Direcciona el movimiento verticalmente según el golpe
      setPlayerScore(playerScore + 1); // Aumenta la puntuación del jugador
    }

    const ctx = canvasRef.current.getContext("2d");
    draw(ctx);
  };

  const handleMouseMove = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    paddleY = event.clientY - rect.top; // Ajuste para la posición de la paleta

    // Asegura que la paleta no salga del lienzo
    paddleY = Math.max(paddleRadius, Math.min(canvas.height - paddleRadius, paddleY));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const interval = setInterval(update, 1000 / 60);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.gameContainer}>
      <h1>Air Hockey</h1>
      <canvas
        ref={canvasRef}
        width={600}
        height={800}
        onMouseMove={handleMouseMove}
        className={styles.canvas}
      />
      <div className={styles.scoreBoard}>
        <p>Jugador: {playerScore}</p>
      </div>
    </div>
  );
};

export default AirHockeyGame;
