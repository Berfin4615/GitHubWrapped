import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type Wrapped = {
  ok: boolean;
  year: number;
  profile: { login: string; name: string | null; avatarUrl: string };
  totals: { totalContributions: number; commits: number; issues: number; prs: number; reviews: number };
  peakDay: { date: string | null; count: number };
};

export default function Dashboard() {
  const api = "http://localhost:4000"; 
  const nav = useNavigate();

  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState<Wrapped | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load(y: number) {
    const token = localStorage.getItem("app_token");
    if (!token) return nav("/", { replace: true });

    setLoading(true);
    setErr(null);

    const r = await fetch(`${api}/api/wrapped/${y}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const j = await r.json();

    if (!j.ok) setErr(JSON.stringify(j.error));
    else setData(j);

    setLoading(false);
  }

  useEffect(() => {
    load(year);
  }, []);

  function logout() {
    localStorage.removeItem("app_token");
    nav("/", { replace: true });
  }

  return (
    <div className="min-h-screen min-w-screen text-white bg-slate-950 p-6">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
            <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-r from-fuchsia-500/30 to-cyan-400/30 blur-3xl" />
            <div className="absolute -bottom-40 right-[-120px] h-[520px] w-[520px] rounded-full bg-gradient-to-r from-indigo-500/25 to-blue-400/25 blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.12),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(236,72,153,0.10),transparent_55%)]" />
        </div>
        <div className="mx-auto my-auto max-w-4xl">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl justify-center font-bold">Your Wrapped</h1>
                <button onClick={logout} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10">
                    Logout
                </button>
            </div>

            <div className="mt-4 flex gap-2 items-center">
                <input
                    className="w-28 rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none"
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                />
                <button
                    onClick={() => load(year)}
                    className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15 border border-white/10"
                >
                    {loading ? "Loading..." : "Get"}
                </button>
            </div>

            {err && <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm">{err}</div>}

            {data && (
            <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-3">
                <img src={data.profile.avatarUrl} className="h-12 w-12 rounded-2xl" />
                <div>
                    <div className="font-semibold">{data.profile.name ?? data.profile.login}</div>
                    <div className="text-sm text-white/60">@{data.profile.login}</div>
                </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Card title="Total Contributions" value={data.totals.totalContributions} />
                <Card title="Peak Day" value={`${data.peakDay.count} (${data.peakDay.date ?? "-"})`} />
                <Card title="Commits" value={data.totals.commits} />
                <Card title="PRs" value={data.totals.prs} />
                <Card title="Issues" value={data.totals.issues} />
                <Card title="Reviews" value={data.totals.reviews} />
                </div>
            </div>
            )}
        </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: any }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
      <div className="text-xs text-white/60">{title}</div>
      <div className="mt-2 text-2xl font-extrabold">{value}</div>
    </div>
  );
}
