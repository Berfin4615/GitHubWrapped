import '../index.css';
import { useState } from "react";

export default function Home() {
    const api = import.meta.env.VITE_API_URL;
    const [view, setView] = useState("home");
    console.log("api: ",import.meta.env.VITE_API_URL)

    return (
        <div className="relative min-h-screen min-w-screen text-white flex justify-center">
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-r from-fuchsia-500/30 to-cyan-400/30 blur-3xl" />
                <div className="absolute -bottom-40 right-[-120px] h-[520px] w-[520px] rounded-full bg-gradient-to-r from-indigo-500/25 to-blue-400/25 blur-3xl" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.12),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(236,72,153,0.10),transparent_55%)]" />
            </div>

            <div className="relative z-10 min-h-screen min-w-screen flex items-center justify-center px-6">
                <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-10 shadow-[0_0_60px_rgba(99,102,241,0.18)] text-center">
                    {view === "home" ? (
                        <div>
                            <h1 className="text-5xl sm:text-6xl font-semibold tracking-wide font-serif">
                                GitHub Wrapped
                            </h1>
                            <p className="mt-3 text-lg text-white/60">in 2025</p>

                            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                                <button onClick={() => setView("login")} className="rounded-2xl px-6 py-3 text-sm font-semibold hover:opacity-95">
                                    Login with GitHub
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <button
                                onClick={() => setView("home")}
                                className="flex items-center justify-start rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
                            >
                                ← Back
                            </button>

                            <div className="flex pt-4 items-center justify-center">
                                <div className="text-center">
                                <h2 className="text-2xl font-bold">Login</h2>
                                <p className="mt-1 text-sm text-white/60">
                                    Log in to access the GitHub Wrapped.
                                </p>
                                </div>
                            </div>
                            <a
                                href={`http://localhost:4000/auth/github`}
                                className="mt-4 inline-flex items-center justify-start rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm !text-white/80 hover:bg-white/10 !no-underline"

                            >
                                Login with GitHub OAuth
                            </ a>
                        </div>

                    )}
                </div>
            </div>
        </div>
  )
}
