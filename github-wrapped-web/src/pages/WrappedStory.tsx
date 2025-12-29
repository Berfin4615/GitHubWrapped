import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
import confetti from "canvas-confetti";
import { useNavigate } from "react-router-dom";

type Wrapped = {
    ok: boolean;
    year: number;
    profile: { login: string; name: string | null; avatarUrl: string };
    totals: { totalContributions: number; commits: number; issues: number; prs: number; reviews: number };
    peakDay: { date: string | null; count: number };
};

const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0, filter: "blur(6px)" }),
    center: { x: 0, opacity: 1, filter: "blur(0px)" },
    exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0, filter: "blur(6px)" }),
};

export default function WrappedStory() {
    const api = "http://localhost:4000";
    const nav = useNavigate();

    const [year] = useState(new Date().getFullYear());
    const [data, setData] = useState<Wrapped | null>(null);
    const [err, setErr] = useState<string | null>(null);

    const [idx, setIdx] = useState(0);
    const [dir, setDir] = useState(1);
    const [paused, setPaused] = useState(false);

    const timerRef = useRef<number | null>(null);
    const durationMs = 4200; // Spotify gibi hızlı

    useEffect(() => {
        (async () => {
        const token = localStorage.getItem("app_token");
        if (!token) return nav("/", { replace: true });

        const r = await fetch(`${api}/api/wrapped/${year}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const j = await r.json();

        if (!j.ok) setErr(JSON.stringify(j.error));
        else setData(j);
        })();
    }, []);

    const slides = useMemo(() => {
        if (!data) return [];
        const name = data.profile.name ?? data.profile.login;
        return [
        {
            key: "intro",
            bg: "from-fuchsia-600 via-indigo-600 to-cyan-500",
            title: `Hey ${name}`,
            subtitle: `${data.year} GitHub Wrapped`,
            render: () => (
                <div className="text-center">
                    <img
                        src={data.profile.avatarUrl}
                        className="mx-auto h-20 w-20 rounded-3xl border border-white/20 shadow-[0_0_40px_rgba(255,255,255,0.12)]"
                    />
                    <div className="mt-5 text-4xl sm:text-5xl font-extrabold tracking-tight">
                        {data.year} Wrapped
                    </div>
                    <div className="mt-3 text-white/80">
                        Let's take a look at your contributions
                    </div>
                </div>
            ),
        },
        {
            key: "total",
            bg: "from-indigo-700 via-fuchsia-600 to-purple-600",
            title: "Total Contributions",
            render: () => (
                <BigNumber
                    value={data.totals.totalContributions}
                    suffix=""
                    caption="commits + PRs + reviews + issues"
                />
            ),
        },
        {
            key: "commits",
            bg: "from-cyan-600 via-indigo-600 to-fuchsia-600",
            title: "Commits",
            render: () => <BigNumber value={data.totals.commits} caption="commit contributions" />,
        },
        {
            key: "prs",
            bg: "from-fuchsia-600 via-indigo-600 to-cyan-600",
            title: "Pull Requests",
            render: () => <BigNumber value={data.totals.prs} caption="pull requests" />,
        },
        {
            key: "peak",
            bg: "from-purple-700 via-indigo-700 to-blue-600",
            title: "Peak Day",
            render: () => {
                const trDate = data.peakDay.date
                ? new Date(`${data.peakDay.date}T00:00:00`).toLocaleDateString("tr-TR", {
                    day: "2-digit",
                    month: "numeric",
                    year: "numeric",
                    })
                : "-";

                return (
                    <div className="text-center">
                        <div className="text-6xl sm:text-7xl font-extrabold">
                            With <CountUp end={data.peakDay.count} duration={1.2} /> commits
                        </div>

                        <div className="mt-3 text-white/90 text-lg">{trDate}</div>
                    </div>
                );
            },
        },
        {
            key: "end",
            bg: "from-emerald-600 via-cyan-600 to-indigo-700",
            title: "Share time",
            onEnter: () => {
            confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
            },
            render: () => (
                <div className="text-center">
                    <div className="text-4xl sm:text-5xl font-extrabold">That’s a wrap.</div>
        

                    <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => nav("/lastdashboard", { replace: true })}
                        className="rounded-2xl bg-white/10 border border-white/15 px-6 py-3 text-sm font-semibold hover:bg-white/15"
                    >
                        See All Picture
                    </button>
                    </div>
                </div>
            ),
        }];
    }, [data, nav]);

    useEffect(() => {
        if (!slides.length) return;

        slides[idx]?.onEnter?.();

        if (paused) return;

        if (timerRef.current) window.clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => {
        next();
        }, durationMs);

        return () => {
            if (timerRef.current) window.clearTimeout(timerRef.current);
        };
    }, [idx, paused, slides.length]);

    function next() {
        setDir(1);
        setIdx((p) => Math.min(p + 1, slides.length - 1));
    }
    function prev() {
        setDir(-1);
        setIdx((p) => Math.max(p - 1, 0));
    }

    function logout() {
        localStorage.removeItem("app_token");
        nav("/", { replace: true });
    }

    if (err) return <div className="min-h-screen min-w-screen bg-slate-950 text-white p-6">{err}</div>;

    return (
        <div className="min-h-screen min-w-screen bg-slate-950 text-white flex items-center justify-center p-4">
            <div
                className="relative w-full max-w-[520px] aspect-[9/16] rounded-[32px] overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(99,102,241,0.25)]"
                onMouseDown={() => setPaused(true)}
                onMouseUp={() => setPaused(false)}
                onMouseLeave={() => setPaused(false)}
                onTouchStart={() => setPaused(true)}
                onTouchEnd={() => setPaused(false)}
            >
            <div className="absolute top-3 left-3 right-3 z-20 flex gap-2">
            {slides.map((_, i) => (
                <div key={i} className="h-1.5 flex-1 rounded-full bg-white/20 overflow-hidden">
                <motion.div
                    className="h-full w-full bg-white/80"
                    initial={{ width: "0%" }}
                    animate={{
                    width: i < idx ? "100%" : i === idx ? "100%" : "0%",
                    }}
                    transition={{
                    duration: i === idx && !paused ? durationMs / 1000 : 0.2,
                    ease: "linear",
                    }}
                />
                </div>
            ))}
            </div>

            <div className="absolute top-8 left-4 right-4 z-20 flex items-center justify-between">
            <button
                onClick={logout}
                className="rounded-xl  border border-white/15 px-3 py-2 text-xs "
            >
                Logout
            </button>
            <div className="text-xs text-white/70">{data ? `@${data.profile.login}` : "loading..."}</div>
            </div>

            <button
                type="button"
                onClick={prev}
                className="absolute inset-y-0 left-0 w-1/3 z-10 bg-transparent opacity-0 border-0 appearance-none"
                aria-label="Previous"
            />

            <button
                type="button"
                onClick={next}
                className="absolute inset-y-0 right-0 w-1/3 z-10 bg-transparent opacity-0 border-0 appearance-none"
                aria-label="Next"
            />

            <div className="absolute inset-0">
                <AnimatePresence custom={dir} mode="popLayout">
                    <motion.div
                    key={slides[idx]?.key || "loading"}
                    custom={dir}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className={`h-full w-full bg-gradient-to-br ${slides[idx]?.bg || "from-slate-800 to-slate-900"}`}
                    >
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.12),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(0,0,0,0.35),transparent_60%)]" />

                    <div className="relative w-full h-full p-7 flex flex-col">
                        <div className="mt-16">
                        <div className="text-sm font-semibold tracking-wide text-white/85">
                            {slides[idx]?.title}
                        </div>
                        <div className="mt-2 text-white/70 text-sm">
                            {slides[idx]?.subtitle}
                        </div>
                        </div>

                        <div className="flex-1 flex items-center justify-center">
                        {slides[idx]?.render?.() || (
                            <div className="text-white/80">Loading…</div>
                        )}
                        </div>

                        <div className="mb-2 flex items-center justify-between text-xs text-white/70">
                        <span>{paused ? "Paused" : "Tap right: next"}</span>
                        <span>
                            {idx + 1}/{slides.length || 1}
                        </span>
                        </div>
                    </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
        </div>
    );
    }

function BigNumber({
    value,
    suffix = "",
    caption,
}: {
    value: number;
    suffix?: string;
    caption: string;
}) {
    return (
        <div className="text-center">
            <div className="text-7xl sm:text-8xl font-extrabold tracking-tight drop-shadow">
                <CountUp end={value} duration={1.25} separator="," />
                <span className="text-4xl sm:text-5xl font-extrabold">{suffix}</span>
            </div>
            <div className="mt-3 text-white/80 text-sm">{caption}</div>
        </div>
    );
}
