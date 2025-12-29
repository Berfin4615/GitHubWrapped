import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import "dotenv/config";

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));

const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.get("/auth/github", (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: process.env.GITHUB_REDIRECT_URI, 
    scope: "read:user user:email",
  });

  res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
});

app.get("/auth/github/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("Missing code");

  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenJson = await tokenRes.json();
    if (!tokenJson.access_token) {
      return res.status(400).send("Token exchange failed: " + JSON.stringify(tokenJson));
    }

    const ghToken = tokenJson.access_token;

    const meRes = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${ghToken}` },
    });
    const me = await meRes.json();

    const appToken = jwt.sign(
      { ghToken, ghLogin: me.login, ghId: me.id },
      process.env.APP_JWT_SECRET || "dev-secret",
      { expiresIn: "7d" }
    );

    const redirect = new URL(CLIENT_URL + "/auth/callback");
    redirect.searchParams.set("token", appToken);

    res.redirect(redirect.toString());
  } catch (e) {
    console.error(e);
    res.status(500).send("Server error: " + e.message);
  }
});

function verifyAppToken(req, res, next) {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ ok: false, error: "Missing token" });

    try {
        req.user = jwt.verify(token, process.env.APP_JWT_SECRET || "dev-secret");
        next();
    } catch {
        return res.status(401).json({ ok: false, error: "Invalid token" });
    }
    }

    app.get("/api/wrapped/:year", verifyAppToken, async (req, res) => {
    const year = Number(req.params.year);
    if (!year || year < 2008) return res.status(400).json({ ok: false, error: "Invalid year" });

    const from = new Date(Date.UTC(year, 0, 1, 0, 0, 0)).toISOString();
    const to = new Date(Date.UTC(year + 1, 0, 1, 0, 0, 0)).toISOString();

    const query = `
        query($from: DateTime!, $to: DateTime!) {
        viewer {
            login
            name
            avatarUrl
            contributionsCollection(from: $from, to: $to) {
            contributionCalendar {
                totalContributions
                weeks { contributionDays { date contributionCount } }
            }
            totalCommitContributions
            totalIssueContributions
            totalPullRequestContributions
            totalPullRequestReviewContributions
            }
        }
        }
    `;

    try {
        const r = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${req.user.ghToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, variables: { from, to } }),
        });

        const j = await r.json();
        if (j.errors) return res.status(400).json({ ok: false, error: j.errors });

        const v = j.data.viewer;
        const cc = v.contributionsCollection;

        let peak = { date: null, count: -1 };
        const days = cc.contributionCalendar.weeks.flatMap(w => w.contributionDays);
        for (const d of days) if (d.contributionCount > peak.count) peak = { date: d.date, count: d.contributionCount };

        return res.json({
        ok: true,
        year,
        profile: { login: v.login, name: v.name, avatarUrl: v.avatarUrl },
        totals: {
            totalContributions: cc.contributionCalendar.totalContributions,
            commits: cc.totalCommitContributions,
            issues: cc.totalIssueContributions,
            prs: cc.totalPullRequestContributions,
            reviews: cc.totalPullRequestReviewContributions,
        },
        peakDay: peak,
        });
    } catch (e) {
        return res.status(500).json({ ok: false, error: e.message });
    }
});

app.listen(PORT, () => console.log(`API http://localhost:${PORT}`));
