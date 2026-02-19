"use client";
import { useState } from "react";

export default function GameBoard({ deckId }: { deckId: string }) {
  const [hand, setHand] = useState<any[]>([]);

  const drawCard = async () => {
    const res = await fetch(`/api/game/draw?deckId=${deckId}`);
    const data = await res.json();
    setHand([...hand, ...data.cards]);
  };

  return (
    <div className="bg-neutral-900 border border-white/5 rounded-[2.5rem] h-full p-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-50" />
      
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-xl font-bold uppercase tracking-tighter">Active Table</h2>
        <button onClick={drawCard} className="bg-rose-600 hover:bg-rose-500 px-6 py-2 rounded-full font-bold transition">
          HIT ME
        </button>
      </div>

      <div className="flex flex-wrap gap-4 justify-center items-center h-64">
        {hand.length > 0 ? (
          hand.map((card, i) => (
            <img key={i} src={card.image} alt={card.code} className="w-32 hover:-translate-y-4 transition-transform duration-300 drop-shadow-2xl" />
          ))
        ) : (
          <div className="border-2 border-dashed border-white/10 rounded-2xl w-32 h-44 flex items-center justify-center text-neutral-600 italic">
            Empty Hand
          </div>
        )}
      </div>
    </div>
  );
}