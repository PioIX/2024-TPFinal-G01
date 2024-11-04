"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./game.module.css";

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;
const PADDLE_WIDTH = 60;
const PADDLE_HEIGHT = 10;
const PUCK_RADIUS = 15;
const PUCK_SPEED = 5;
const GOAL_MESSAGE_DURATION = 2000;

const getRandomDirection = () => (Math.random() < 0.5 ? 1 : -1);
const getRandomAngle = () => Math.random() * Math.PI / 4 + Math.PI / 4;

const useGameLoop = (canvasRef, puck, paddle, setPuck, setScore, setGoalMessage) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    let animationFrameId;

    const draw = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      drawScore(context);
      drawPuck(context, puck);
      drawPaddle(context, paddle);
      updatePuck();
      animationFrameId = requestAnimationFrame(draw);
    };

    const updatePuck = () => {
      setPuck(prevPuck => {
        const newPuck = { ...prevPuck };
        newPuck.x += newPuck.dx;
        newPuck.y += newPuck.dy;

        // Collision detection
        handleWallCollision(newPuck);
        handlePaddleCollision(newPuck, paddle);

        return newPuck;
      });
    };

    const handleWallCollision = (newPuck) => {
      if (newPuck.x + PUCK_RADIUS > CANVAS_WIDTH || newPuck.x - PUCK_RADIUS < 0) {
        newPuck.dx *= -1; // Horizontal bounce
      }

      if (newPuck.y - PUCK_RADIUS < 0 || newPuck.y + PUCK_RADIUS > CANVAS_HEIGHT) {
        setScore(prevScore => prevScore + 1);
        setGoalMessage("¡Gol!");
        resetPuck();
      }
    };

    const handlePaddleCollision = (newPuck, paddle) => {
      if (
        newPuck.y + PUCK_RADIUS > paddle.y &&
        newPuck.x > paddle.x &&
        newPuck.x < paddle.x + paddle.width
      ) {
        newPuck.dy *= -1;
        newPuck.y = paddle.y - PUCK_RADIUS; // Prevent sticking
      }
    };

    draw();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [canvasRef, puck, paddle, setPuck, setScore, setGoalMessage]);
};

const AirHockey = () => {
  const canvasRef = useRef(null);
  const [puck, setPuck] = useState({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    dx: 0,
    dy: 0,
  });

  const [paddle, setPaddle] = useState({
    x: (CANVAS_WIDTH - PADDLE_WIDTH) / 2,
    y: CANVAS_HEIGHT - 30,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
  });

  const [score, setScore] = useState(0);
  const [goalMessage, setGoalMessage] = useState("");
  const [messageTimeout, setMessageTimeout] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space" && puck.dx === 0 && puck.dy === 0) {
        launchPuck();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [puck]);

  useGameLoop(canvasRef, puck, paddle, setPuck, setScore, setGoalMessage);

  const drawPuck = (context, puck) => {
    context.beginPath();
    context.arc(puck.x, puck.y, PUCK_RADIUS, 0, Math.PI * 2);
    context.fillStyle = "red";
    context.fill();
    context.closePath();
  };

  const drawPaddle = (context, paddle) => {
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
      context.fillText(goalMessage, CANVAS_WIDTH / 2 - 50, CANVAS_HEIGHT / 2);
    }
  };

  const resetPuck = () => {
    setPuck({
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      dx: 0,
      dy: 0,
    });
    handleGoalMessageTimeout();
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    setPaddle(prevPaddle => ({
      ...prevPaddle,
      x: Math.min(Math.max(mouseX - prevPaddle.width / 2, 0), CANVAS_WIDTH - prevPaddle.width),
    }));
  };

  const launchPuck = () => {
    setPuck({
      ...puck,
      dx: PUCK_SPEED * getRandomDirection() * Math.cos(getRandomAngle()),
      dy: -PUCK_SPEED * Math.sin(getRandomAngle()),
    });
  };

  const handleGoalMessageTimeout = () => {
    if (messageTimeout) clearTimeout(messageTimeout);
    const timeout = setTimeout(() => {
      setGoalMessage("");
    }, GOAL_MESSAGE_DURATION);
    setMessageTimeout(timeout);
  };

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      onMouseMove={handleMouseMove}
      className={styles.canvas}
    />
  );
};

export default AirHockey;
