"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./game.module.css";

const canvasWidth = 500;
const canvasHeight = 500;
const paddleWidth = 60;
const paddleHeight = 10;

export default function AirHockey() {
  const canvasRef = useRef(null);
  const [puck, setPuck] = useState({
    x: canvasWidth / 2,
    y: canvasHeight / 2,
    radius: 15,
    dx: 0,
    dy: 0,
  });

  const [paddle, setPaddle] = useState({
    x: (canvasWidth - paddleWidth) / 2,
    y: canvasHeight - 30,
    width: paddleWidth,
    height: paddleHeight,
  });

  const [score, setScore] = useState(0);
  const [goalMessage, setGoalMessage] = useState("");
  const [messageTimeout, setMessageTimeout] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    let animationFrameId;

    const draw = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      drawScore(context);
      drawPuck(context);
      drawPaddle(context);
      updatePuck();
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (messageTimeout) clearTimeout(messageTimeout);
    };
  }, [paddle, puck, goalMessage]);

  const drawPuck = (context) => {
    context.beginPath();
    context.arc(puck.x, puck.y, puck.radius, 0, Math.PI * 2);
    context.fillStyle = "red";
    context.fill();
    context.closePath();
  };

  const drawPaddle = (context) => {
    context.fillStyle = "blue";
    context.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
  };

  const drawScore = (context) => {
    context.fillStyle = "black";
    context.font = "20px Arial";
    context.fillText(`Score: ${score}`, 10, 20);
    if (goalMessage) {
      context.fillStyle = "green";
      context.font = "30px Arial";
      context.fillText(goalMessage, canvasWidth / 2 - 50, canvasHeight / 2);
    }
  };

  const updatePuck = () => {
    setPuck((prevPuck) => {
      const newPuck = { ...prevPuck };
      newPuck.x += newPuck.dx;
      newPuck.y += newPuck.dy;

      // Colisión con las paredes
      if (newPuck.x + newPuck.radius > canvasWidth || newPuck.x - newPuck.radius < 0) {
        newPuck.dx *= -1; // Rebote horizontal
      }

      // Gol por pared superior
      if (newPuck.y - newPuck.radius < 0 || newPuck.y + newPuck.radius > canvasHeight) {
        setScore((prevScore) => prevScore + 1);
        setGoalMessage("¡Gol!");
        resetPuck();
      }

      // Colisión con la paleta
      if (
        newPuck.y + newPuck.radius > paddle.y &&
        newPuck.x > paddle.x &&
        newPuck.x < paddle.x + paddle.width
      ) {
        newPuck.dy *= -1;
        newPuck.y = paddle.y - newPuck.radius; // Evita que la pelota se quede atascada
      }

      return newPuck;
    });
  };

  const resetPuck = () => {
    setPuck({
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      radius: 15,
      dx: 0,
      dy: 0,
    });
    handleGoalMessageTimeout();
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    setPaddle((prevPaddle) => ({
      ...prevPaddle,
      x: Math.min(Math.max(mouseX - prevPaddle.width / 2, 0), canvasWidth - prevPaddle.width),
    }));
  };

  const handleKeyDown = (e) => {
    if (e.code === "Space") {
      if (puck.dx === 0 && puck.dy === 0) {
        launchPuck();
      }
    }
  };

  const launchPuck = () => {
    const speed = 5; // Velocidad de la pelota
    const direction = Math.random() < 0.5 ? 1 : -1; // Dirección aleatoria
    const angle = Math.random() * Math.PI / 4 + Math.PI / 4; // Ángulo entre 45 y 135 grados
    setPuck({
      ...puck,
      dx: speed * direction * Math.cos(angle),
      dy: -speed * Math.sin(angle),
    });
  };

  const handleGoalMessageTimeout = () => {
    if (messageTimeout) clearTimeout(messageTimeout);
    const timeout = setTimeout(() => {
      setGoalMessage("");
    }, 2000); // Mensaje visible por 2 segundos
    setMessageTimeout(timeout);
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [puck]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      onMouseMove={handleMouseMove}
      className={styles.canvas}
    />
  );
}
