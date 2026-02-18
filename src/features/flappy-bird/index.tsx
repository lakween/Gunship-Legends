"use client";
import { useEffect, useRef, useState } from "react";

export default function FlappyBird() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);

    // Game Configuration
    const SETTINGS = {
        GRAVITY: 0.4,
        JUMP: -7,
        PIPE_SPEED: 2.5,
        PIPE_SPAWN_GAP: 120, // Frames between pipes
        GAP_SIZE: 160,
    };

    // State Refs (Mutable data for the 60fps loop)
    const state = useRef({
        birdY: 300,
        birdV: 0,
        birdRotation: 0,
        pipes: [] as { x: number; top: number; passed: boolean }[],
        frame: 0,
    });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let loopId: number;

        const runLoop = () => {
            const s = state.current;

            // 1. Background
            ctx.fillStyle = "#70c5ce"; // Sky Blue
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            if (gameStarted && !gameOver) {
                // 2. Physics & Movement
                s.birdV += SETTINGS.GRAVITY;
                s.birdY += s.birdV;
                s.birdRotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, (s.birdV / 10)));

                // 3. Pipe Spawning
                s.frame++;
                if (s.frame % SETTINGS.PIPE_SPAWN_GAP === 0) {
                    const topH = Math.random() * (canvas.height - SETTINGS.GAP_SIZE - 100) + 50;
                    s.pipes.push({ x: canvas.width, top: topH, passed: false });
                }

                // 4. Collision & Pipe Animation
                s.pipes.forEach((p, i) => {
                    p.x -= SETTINGS.PIPE_SPEED;

                    // Draw Pipes
                    ctx.fillStyle = "#73bf2e";
                    ctx.fillRect(p.x, 0, 50, p.top); // Top
                    ctx.fillRect(p.x, p.top + SETTINGS.GAP_SIZE, 50, canvas.height); // Bottom

                    // Logic: Collision Detection
                    if (
                        50 + 20 > p.x && 50 < p.x + 50 &&
                        (s.birdY < p.top || s.birdY + 20 > p.top + SETTINGS.GAP_SIZE)
                    ) {
                        setGameOver(true);
                    }

                    // Logic: Scoring
                    if (p.x < 50 && !p.passed) {
                        setScore(prev => prev + 1);
                        p.passed = true;
                    }
                });

                // Cleanup pipes
                if (s.pipes.length > 0 && s.pipes[0].x < -60) s.pipes.shift();

                // Ground/Ceiling death
                if (s.birdY > canvas.height || s.birdY < 0) setGameOver(true);
            }

            // 5. Draw Bird with Rotation
            ctx.save();
            ctx.translate(65, s.birdY + 10);
            ctx.rotate(s.birdRotation);
            ctx.fillStyle = "#f7d02c"; // Bird Yellow
            ctx.fillRect(-15, -10, 30, 20);
            // Eye
            ctx.fillStyle = "black";
            ctx.fillRect(8, -5, 4, 4);
            ctx.restore();

            loopId = requestAnimationFrame(runLoop);
        };

        runLoop();
        return () => cancelAnimationFrame(loopId);
    }, [gameStarted, gameOver]);

    // Handle Spacebar & Interaction
    useEffect(() => {
        const handleAction = (e?: KeyboardEvent) => {
            if (e && e.code !== "Space") return;
            if (gameOver) return window.location.reload();

            state.current.birdV = SETTINGS.JUMP;
            if (!gameStarted) setGameStarted(true);
        };

        window.addEventListener("keydown", handleAction);
        return () => window.removeEventListener("keydown", handleAction);
    }, [gameStarted, gameOver]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-stone-900 font-mono">
            <div className="mb-4 text-white text-6xl font-black drop-shadow-[0_5px_0_rgba(0,0,0,0.5)]">
                {score}
            </div>

            <div className="relative border-[12px] border-white rounded-3xl overflow-hidden shadow-2xl">
                <canvas
                    ref={canvasRef}
                    width={400}
                    height={600}
                    className="cursor-pointer"
                    onClick={() => {
                        state.current.birdV = SETTINGS.JUMP;
                        if (!gameStarted) setGameStarted(true);
                    }}
                />

                {!gameStarted && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <p className="text-white text-2xl font-bold animate-pulse">PRESS SPACE TO START</p>
                    </div>
                )}

                {gameOver && (
                    <div className="absolute inset-0 bg-red-600/80 flex flex-col items-center justify-center">
                        <h2 className="text-white text-5xl font-black mb-6">CRASHED</h2>
                        <button
                            className="bg-white text-red-600 px-10 py-4 rounded-full font-black text-xl active:scale-95 transition"
                            onClick={() => window.location.reload()}
                        >
                            RESTART
                        </button>
                    </div>
                )}
            </div>

            <div className="mt-8 text-stone-500 text-sm uppercase tracking-widest">
                Controls: [Space] or [Click]
            </div>
        </div>
    );
}