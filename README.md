# 🕯️ Velvet Hours

> A daily intimate serialized story app — personalized, chapter-by-chapter, powered by Claude AI.

---

## 🚀 Deploy in 15 Minutes (No coding experience needed)

### Step 1 — Get Your Anthropic API Key
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up / log in
3. Click **API Keys** → **Create Key**
4. Copy the key (starts with `sk-ant-...`) — save it somewhere safe

---

### Step 2 — Put the Code on GitHub
1. Go to [github.com](https://github.com) and create a free account
2. Click **New Repository** → name it `velvet-hours` → click **Create**
3. Upload all these files by dragging them into the GitHub interface
   - Or if you know git: `git init`, `git add .`, `git commit -m "init"`, `git push`

---

### Step 3 — Deploy to Vercel (Free)
1. Go to [vercel.com](https://vercel.com) and sign up with your GitHub account
2. Click **Add New Project**
3. Select your `velvet-hours` repository → click **Import**
4. **Before clicking Deploy**, click **Environment Variables** and add:
   - Key: `ANTHROPIC_API_KEY`
   - Value: your key from Step 1
5. Click **Deploy** 🎉

Vercel will give you a live URL like `https://velvet-hours.vercel.app` in ~2 minutes.

---

### Step 4 — Lock Down CORS (Optional but recommended)
Once you have your live URL, go to Vercel → Project Settings → Environment Variables and add:
- Key: `ALLOWED_ORIGIN`
- Value: `https://your-actual-domain.com`

This stops other sites from using your API key.

---

## 💻 Running Locally (For testing)

```bash
# 1. Install dependencies
npm install

# 2. Install Vercel CLI
npm install -g vercel

# 3. Set up your local environment
cp .env.example .env.local
# Edit .env.local and add your ANTHROPIC_API_KEY

# 4. Run locally (starts both frontend + API proxy)
vercel dev
```

Then open [http://localhost:3000](http://localhost:3000)

---

## 💰 Monetization (When you're ready)

### Add Stripe Payments
1. Sign up at [stripe.com](https://stripe.com)
2. Create a product: "Velvet Hours Premium" at $7.99/mo
3. Add a `/api/checkout.js` Vercel function to create Stripe sessions
4. Gate chapters 3+ behind a `isPremium` check

### Add User Accounts (Optional)
- Use [Clerk](https://clerk.com) for auth — free tier, drop-in React components
- Store user progress in [Vercel KV](https://vercel.com/storage/kv) (free tier)

---

## 📁 Project Structure

```
velvet-hours/
├── api/
│   └── story.js          ← Vercel serverless function (your API proxy)
├── src/
│   ├── main.jsx          ← React entry point
│   └── App.jsx           ← Main app component
├── index.html            ← HTML shell
├── vercel.json           ← Vercel routing config
├── vite.config.js        ← Local dev config
├── package.json
├── .env.example          ← Environment variable template
└── .gitignore
```

---

## 💸 Cost Estimate

| Usage | Monthly Cost |
|-------|-------------|
| 100 users, 1 chapter/day | ~$3–5 |
| 1,000 users, 1 chapter/day | ~$30–50 |
| 10,000 users, 1 chapter/day | ~$300–500 |

At $7.99/mo subscription: **1,000 subscribers = ~$7,500/mo revenue vs ~$50 API cost.**

---

## 🛠️ Tech Stack

- **Frontend**: React + Vite
- **Backend**: Vercel Edge Functions (serverless)
- **AI**: Anthropic Claude (claude-sonnet-4)
- **Hosting**: Vercel (free tier works to start)

---

Built with ❤️ using Claude AI.
