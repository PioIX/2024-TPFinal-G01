"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./game.module.css";

export default function AirHockey() {
  const canvasRef = useRef(null);
  const [puck, setPuck] = useState({ x: 250, y: 250, radius: 15, dx: 5, dy: 5 });
  const [paddle, setPaddle] = useState({ x: 230, y: 450, width: 60, height: 10 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    let animationFrameId;

    const draw = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);

      context.beginPath();
      context.arc(puck.x, puck.y, puck.radius, 0, Math.PI * 2);
      context.fillStyle = "red";
      context.fill();
      context.closePath();

      context.fillStyle = "blue";
      context.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);


      setPuck((prevPuck) => {
        const newPuck = { ...prevPuck };
        newPuck.x += newPuck.dx;
        newPuck.y += newPuck.dy;

        if (newPuck.x + newPuck.radius > canvas.width || newPuck.x - newPuck.radius < 0) {
          newPuck.dx *= -1;
        }
        if (newPuck.y - newPuck.radius < 0) {
          newPuck.dy *= -1;
        }

        if (
          newPuck.y + newPuck.radius > paddle.y &&
          newPuck.x > paddle.x &&
          newPuck.x < paddle.x + paddle.width
        ) {
          newPuck.dy *= -1;
          newPuck.y = paddle.y - newPuck.radius;
        }

        return newPuck;
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [paddle, puck]);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    setPaddle((prevPaddle) => ({
      ...prevPaddle,
      x: Math.min(Math.max(mouseX - prevPaddle.width / 2, 0), canvas.width - prevPaddle.width),
    }));
  };

}
