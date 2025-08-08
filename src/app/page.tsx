"use client";

import { useRef } from "react";
import { useGame } from "../hooks/useGame";
import { LoadingUI } from "../components/LoadingUI";

const Hero = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Use the custom game hook
    const { loadingProgress, isLoading } = useGame(canvasRef);

    return (
        <>
            <LoadingUI progress={loadingProgress} isVisible={isLoading} />
            <div
                className="w-full h-screen"
                style={{
                    position: "absolute",
                }}
            >
                <canvas ref={canvasRef} className="w-full h-full" />
            </div>
        </>
    );
};

export default Hero;
