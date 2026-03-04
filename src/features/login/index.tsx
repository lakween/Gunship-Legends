"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "./components/LoginForm";

const LoginPage = () => {

    return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 font-sans">
            {/* Abstract Background Decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-red-600/10 blur-[120px] rounded-full" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-white/5 blur-[120px] rounded-full" />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo Section */}
                <div className="text-center mb-10">
                    <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-rose-500 to-red-700 rounded-2xl rotate-3 shadow-[0_0_30px_rgba(225,29,72,0.3)] mb-4 border-2 border-white/10 group hover:rotate-0 transition-transform duration-500">
                        {/* The Heart Symbol */}
                        <span className="text-white text-5xl animate-pulse drop-shadow-lg">
                            ♥
                        </span>

                        {/* Decorative suit corners */}
                        <div className="absolute top-1 left-1 text-[10px] text-white/40 font-bold">A</div>
                        <div className="absolute bottom-1 right-1 text-[10px] text-white/40 font-bold rotate-180">A</div>
                    </div>

                    <h1 className="text-white text-3xl font-black tracking-tighter uppercase italic">
                        Flappy <span className="text-rose-500">Bird</span>
                    </h1>
                </div>

                {/* Login Form */}
                <LoginForm />

                {/* Footer Link */}
                {/* <p className="text-center mt-8 text-neutral-600 text-xs font-medium">
                    New Player? <span className="text-red-500 cursor-pointer hover:underline">Register your Deck</span>
                </p> */}
            </div>
        </div>
    );
}

export default LoginPage