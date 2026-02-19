export default function Sidebar({ user }: any) {
  return (
    <aside className="w-64 bg-neutral-900 border-r border-white/5 p-8 flex flex-col items-center">
      <div className="w-20 h-20 bg-gradient-to-br from-rose-500 to-red-700 rounded-3xl flex items-center justify-center text-4xl mb-6 shadow-lg shadow-rose-500/20 rotate-3">
        ♥
      </div>
      
      <div className="text-center mb-10">
        <h4 className="font-black uppercase tracking-tighter text-lg">{user.name}</h4>
        <p className="text-rose-500 text-xs font-bold uppercase tracking-widest">Pro Member</p>
      </div>

      <nav className="w-full space-y-2">
        {["Play Game", "Inventory", "Shop", "Settings"].map((item) => (
          <button key={item} className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 text-neutral-400 hover:text-white transition">
            {item}
          </button>
        ))}
      </nav>
    </aside>
  );
}