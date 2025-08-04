"use client";

import { useRef } from "react";
import { useGame } from "../hooks/useGame";

const Hero = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Use the custom game hook
  useGame(canvasRef);

  return (
    <div
      className="w-full h-screen"
      style={{
        position: "absolute",
      }}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default Hero;
