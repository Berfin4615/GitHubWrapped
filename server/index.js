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

app.listen(PORT, () => console.log(`API http://localhost:${PORT}`));
