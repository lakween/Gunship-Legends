"use client";
import { useEffect, useRef, useState } from "react";

export default function FlappyBird() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);

    const SETTINGS = {
        GRAVITY: 0.4,
        JUMP: -7,
        PIPE_SPEED: 2.5,
        PIPE_SPAWN_GAP: 120,
        GAP_SIZE: 160,
    };

    const state = useRef({
        birdY: 300,
        birdV: 0,
        birdRotation: 0,
        pipes: [] as { x: number; top: number; passed: boolean }[],
        frame: 0,
        wingFrame: 0,
        groundOffset: 0,
        clouds: [
            { x: 60,  y: 60,  w: 90,  h: 32, speed: 0.3 },
            { x: 200, y: 100, w: 70,  h: 24, speed: 0.5 },
            { x: 320, y: 45,  w: 110, h: 36, speed: 0.2 },
            { x: 150, y: 150, w: 80,  h: 28, speed: 0.4 },
        ],
        treesBack: [
            { x: 0 }, { x: 80 }, { x: 160 }, { x: 240 }, { x: 320 }, { x: 400 },
        ],
        treesFront: [
            { x: 40 }, { x: 130 }, { x: 220 }, { x: 310 }, { x: 380 },
        ],
    });

    function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
        ctx.save();
        ctx.fillStyle = "rgba(255,255,255,0.88)";
        ctx.beginPath(); ctx.ellipse(x+w*0.5, y+h*0.6,  w*0.42, h*0.42, 0, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(x+w*0.28, y+h*0.65, w*0.28, h*0.35, 0, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(x+w*0.72, y+h*0.65, w*0.26, h*0.32, 0, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(x+w*0.5,  y+h*0.35, w*0.24, h*0.3,  0, 0, Math.PI*2); ctx.fill();
        ctx.restore();
    }

    function drawTreeBack(ctx: CanvasRenderingContext2D, x: number, groundY: number) {
        ctx.save(); ctx.globalAlpha = 0.5;
        ctx.fillStyle = "#5a3e28";
        ctx.fillRect(x+7, groundY-28, 6, 28);
        const greens = ["#2d7a2d","#3a9e3a","#4db84d"];
        const sizes  = [26, 22, 16];
        const offY   = [0, -18, -34];
        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = greens[i];
            ctx.beginPath();
            ctx.moveTo(x+10, groundY-28+offY[i]);
            ctx.lineTo(x+10-sizes[i], groundY-28+offY[i]+20);
            ctx.lineTo(x+10+sizes[i], groundY-28+offY[i]+20);
            ctx.closePath(); ctx.fill();
        }
        ctx.restore();
    }

    function drawTreeFront(ctx: CanvasRenderingContext2D, x: number, groundY: number) {
        ctx.save(); ctx.globalAlpha = 0.92;
        ctx.fillStyle = "#3e2a18";
        ctx.fillRect(x+9, groundY-44, 8, 44);
        const greens = ["#1a5e1a","#236e23","#2d8c2d"];
        const sizes  = [34, 28, 20];
        const offY   = [0, -22, -42];
        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = greens[i];
            ctx.beginPath();
            ctx.moveTo(x+13, groundY-44+offY[i]);
            ctx.lineTo(x+13-sizes[i], groundY-44+offY[i]+26);
            ctx.lineTo(x+13+sizes[i], groundY-44+offY[i]+26);
            ctx.closePath(); ctx.fill();
        }
        ctx.restore();
    }

    function drawPipe(ctx: CanvasRenderingContext2D, x: number, y: number, h: number, isTop: boolean) {
        const W = 50, CAP_H = 16, CAP_W = 60;
        const grad = ctx.createLinearGradient(x, 0, x+W, 0);
        grad.addColorStop(0,    "#5ac718");
        grad.addColorStop(0.35, "#8de84a");
        grad.addColorStop(0.65, "#73bf2e");
        grad.addColorStop(1,    "#3a8c10");
        ctx.fillStyle = grad;
        ctx.fillRect(x, y, W, h);

        const capY = isTop ? y + h - CAP_H : y;
        const capGrad = ctx.createLinearGradient(x-5, 0, x+CAP_W, 0);
        capGrad.addColorStop(0,    "#4aaa14");
        capGrad.addColorStop(0.35, "#7ed43e");
        capGrad.addColorStop(0.65, "#68b028");
        capGrad.addColorStop(1,    "#2e7008");
        ctx.fillStyle = capGrad;
        ctx.fillRect(x-5, capY, CAP_W, CAP_H);

        // Highlight
        ctx.fillStyle = "rgba(255,255,255,0.18)";
        ctx.fillRect(x+6, y, 8, h);
        ctx.fillRect(x+6, capY, 8, CAP_H);

        // Outline
        ctx.strokeStyle = "rgba(0,0,0,0.22)";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, W, h);
        ctx.strokeRect(x-5, capY, CAP_W, CAP_H);
    }

    function drawBird(ctx: CanvasRenderingContext2D, birdY: number, rot: number, wing: number) {
        ctx.save();
        ctx.translate(65, birdY+10);
        ctx.rotate(rot);

        // Shadow
        ctx.save(); ctx.globalAlpha = 0.12;
        ctx.fillStyle = "#000";
        ctx.beginPath(); ctx.ellipse(2, 16, 14, 5, 0, 0, Math.PI*2); ctx.fill();
        ctx.restore();

        // Body
        const bg = ctx.createRadialGradient(-2, -4, 2, 0, 0, 18);
        bg.addColorStop(0,   "#ffe066");
        bg.addColorStop(0.6, "#f7c800");
        bg.addColorStop(1,   "#d4a000");
        ctx.fillStyle = bg;
        ctx.beginPath(); ctx.ellipse(0, 0, 15, 11, 0, 0, Math.PI*2); ctx.fill();

        // Wing
        const wingY = Math.sin(wing * 0.4) * 5;
        ctx.fillStyle = "#e6b800";
        ctx.beginPath(); ctx.ellipse(-4, wingY, 9, 5, -0.3, 0, Math.PI*2); ctx.fill();

        // Belly
        ctx.fillStyle = "#fff0a0";
        ctx.beginPath(); ctx.ellipse(2, 3, 7, 5, 0.2, 0, Math.PI*2); ctx.fill();

        // Beak
        ctx.fillStyle = "#ff8c00";
        ctx.beginPath();
        ctx.moveTo(13, -1); ctx.lineTo(20, 2); ctx.lineTo(13, 5);
        ctx.closePath(); ctx.fill();

        // Eye
        ctx.fillStyle = "white";
        ctx.beginPath(); ctx.arc(8, -4, 4, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "#1a1a1a";
        ctx.beginPath(); ctx.arc(9.5, -4, 2, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "white";
        ctx.beginPath(); ctx.arc(10.5, -5, 0.8, 0, Math.PI*2); ctx.fill();

        ctx.restore();
    }

    function drawGround(ctx: CanvasRenderingContext2D, offset: number, W: number, groundY: number, H: number) {
        const dg = ctx.createLinearGradient(0, groundY, 0, H);
        dg.addColorStop(0, "#c8922a");
        dg.addColorStop(1, "#a06b1a");
        ctx.fillStyle = dg;
        ctx.fillRect(0, groundY, W, H - groundY);

        ctx.fillStyle = "#5cb800";
        ctx.fillRect(0, groundY, W, 14);

        ctx.fillStyle = "#4aa000";
        for (let gx = (-(offset % 20)); gx < W+20; gx += 20) {
            ctx.beginPath();
            ctx.moveTo(gx, groundY+14);
            ctx.lineTo(gx+4, groundY);
            ctx.lineTo(gx+8, groundY+14);
            ctx.closePath(); ctx.fill();
        }

        ctx.strokeStyle = "#3a8c00";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, groundY+14); ctx.lineTo(W, groundY+14); ctx.stroke();

        ctx.fillStyle = "#b07818";
        for (let px = (-(offset % 60)); px < W+60; px += 60) {
            ctx.beginPath(); ctx.ellipse(px+10, groundY+26, 5, 3, 0, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.ellipse(px+40, groundY+38, 4, 2.5, 0.4, 0, Math.PI*2); ctx.fill();
        }
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const W = canvas.width;
        const H = canvas.height;
        const GROUND_Y = H - 60;
        let loopId: number;

        const runLoop = () => {
            const s = state.current;

            // Sky gradient
            const sky = ctx.createLinearGradient(0, 0, 0, H);
            sky.addColorStop(0,   "#4ec0e4");
            sky.addColorStop(0.6, "#82d8f0");
            sky.addColorStop(1,   "#b8eeff");
            ctx.fillStyle = sky;
            ctx.fillRect(0, 0, W, H);

            // Clouds
            s.clouds.forEach(c => {
                if (gameStarted && !gameOver) { c.x -= c.speed; if (c.x+c.w < 0) c.x = W+20; }
                drawCloud(ctx, c.x, c.y, c.w, c.h);
            });

            // Background trees (paralax slow)
            s.treesBack.forEach(t => {
                if (gameStarted && !gameOver) { t.x -= SETTINGS.PIPE_SPEED * 0.35; if (t.x < -30) t.x = W+20; }
                drawTreeBack(ctx, t.x, GROUND_Y);
            });

            if (gameStarted && !gameOver) {
                s.birdV += SETTINGS.GRAVITY;
                s.birdY += s.birdV;
                s.birdRotation = Math.min(Math.PI/4, Math.max(-Math.PI/4, s.birdV/10));
                s.frame++;
                s.wingFrame++;
                s.groundOffset += SETTINGS.PIPE_SPEED;

                if (s.frame % SETTINGS.PIPE_SPAWN_GAP === 0) {
                    const topH = Math.random() * (GROUND_Y - SETTINGS.GAP_SIZE - 100) + 50;
                    s.pipes.push({ x: W, top: topH, passed: false });
                }

                s.pipes.forEach(p => {
                    p.x -= SETTINGS.PIPE_SPEED;
                    drawPipe(ctx, p.x, 0, p.top, true);
                    drawPipe(ctx, p.x, p.top + SETTINGS.GAP_SIZE, GROUND_Y - (p.top + SETTINGS.GAP_SIZE), false);

                    if (50+20 > p.x && 50 < p.x+50 &&
                        (s.birdY < p.top || s.birdY+20 > p.top+SETTINGS.GAP_SIZE)) {
                        setGameOver(true);
                    }
                    if (p.x < 50 && !p.passed) { setScore(prev => prev+1); p.passed = true; }
                });

                if (s.pipes.length > 0 && s.pipes[0].x < -60) s.pipes.shift();
                if (s.birdY > GROUND_Y-10 || s.birdY < 0) setGameOver(true);
            }

            // Front trees (faster parallax)
            s.treesFront.forEach(t => {
                if (gameStarted && !gameOver) { t.x -= SETTINGS.PIPE_SPEED * 0.75; if (t.x < -40) t.x = W+30; }
                drawTreeFront(ctx, t.x, GROUND_Y);
            });

            drawGround(ctx, s.groundOffset, W, GROUND_Y, H);
            drawBird(ctx, s.birdY, s.birdRotation, s.wingFrame);

            // Score
            if (gameStarted) {
                ctx.save();
                ctx.font = "bold 38px 'Arial Black', Arial";
                ctx.textAlign = "center";
                ctx.fillStyle = "rgba(0,0,0,0.25)";
                ctx.fillText(String(score), W/2+2, 52);
                ctx.fillStyle = "white";
                ctx.fillText(String(score), W/2, 50);
                ctx.restore();
            }

            loopId = requestAnimationFrame(runLoop);
        };

        runLoop();
        return () => cancelAnimationFrame(loopId);
    }, [gameStarted, gameOver, score]);

    useEffect(() => {
        const handleAction = (e?: KeyboardEvent) => {
            if (e && e.code !== "Space") return;
            const tag = document.activeElement?.tagName;
            if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
            if (gameOver) return window.location.reload();
            state.current.birdV = SETTINGS.JUMP;
            if (!gameStarted) setGameStarted(true);
        };
        window.addEventListener("keydown", handleAction);
        return () => window.removeEventListener("keydown", handleAction);
    }, [gameStarted, gameOver]);

    return (
        <div className="flex flex-col items-center justify-center bg-stone-900 font-mono">
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
                    <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center">
                        <div className="mb-4 text-6xl">🐦</div>
                        <p className="text-white text-2xl font-black tracking-widest drop-shadow-lg animate-pulse">TAP TO FLY</p>
                        <p className="text-white/60 text-sm mt-2 tracking-widest">SPACE or CLICK</p>
                    </div>
                )}

                {gameOver && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center"
                        style={{ background: "rgba(180,30,30,0.82)" }}>
                        <h2 className="text-white text-5xl font-black mb-2 drop-shadow-lg">GAME OVER</h2>
                        <p className="text-white/80 text-lg mb-6 tracking-widest">Score: {score}</p>
                        <button
                            className="bg-white text-red-600 px-10 py-4 rounded-full font-black text-xl active:scale-95 transition shadow-lg"
                            onClick={() => window.location.reload()}
                        >
                            🔄 RESTART
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}