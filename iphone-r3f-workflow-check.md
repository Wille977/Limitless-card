# Can I do R3F creative coding entirely from my iPhone in this app?

**Question:** Build small Three.js / React Three Fiber experiments and view them
rendering live on my iPhone, smoothly enough to screen-record for X — using this
app, no Mac.

## The one-sentence truth

This app can **build** the project from your phone, but it **cannot show you a
live, smooth, screen-recordable 3D scene on your iPhone screen**. The code runs
on a remote Anthropic server, not your phone, and there is no live
preview / port-forwarding feature that pipes a running Vite dev server to your
phone's browser.

---

## 1. Can I create R3F + Vite projects from scratch on my phone, no Mac?

**Yes.** You type prompts; I scaffold the entire project — `npm create vite`,
install `three`, `@react-three/fiber`, `@react-three/drei`, write the
components, run the dev server and `npm run build` to prove it compiles. No Mac
touches this. This part is 100% real and works right now.

## 2. Where does the code run — phone or remote server?

**A remote server.** Confirmed from this container: it's Anthropic-managed cloud
infrastructure (Node v22.22.2 here), isolated and **ephemeral** — it's wiped
after the session ends. Your phone is just a thin client sending text and
showing my output. Nothing executes on the iPhone itself.

> Consequence: anything you want to keep **must be committed and pushed to
> GitHub**, or it's gone.

## 3. Is there a live preview rendering the actual 3D scene on my phone, smooth enough to screen-record?

**No.** This is the hard limit. From the official "Claude Code on the web" docs:

- Networking here is **outbound-only** through an allowlist/proxy. There is
  **no inbound port forwarding, no tunnel, no preview URL** feature.
- A Vite dev server *can run* inside this container (`localhost:5173`), but
  **your phone's Safari cannot reach it** — there's no mechanism in this app to
  expose it to your device.
- This container has **no browser and no ffmpeg installed**, so I can't even
  render the canvas to video for you. At most I could install a headless
  browser and send you a **static PNG** of the scene — useful as a sanity check,
  useless for smooth X video.

So: no live 3D on your phone screen, and nothing screen-recordable, **from this
app directly.**

## 4. Walk me through the spinning cube...

Skipped — this was gated on "yes to all," and #3 is no. See the recommended
workflow below for how to actually get a live, recordable cube on your phone.

## 5. What works on iPhone vs. what needs something else

| Step | From this app on iPhone? |
|---|---|
| Scaffold R3F + Vite project | ✅ Yes |
| Write/edit all the code | ✅ Yes |
| Install deps, compile, build | ✅ Yes (runs on remote server) |
| Commit + push to GitHub | ✅ Yes |
| **See the spinning cube render live** | ❌ Not here |
| **Smooth playback to screen-record for X** | ❌ Not here |

**Important:** the missing piece does *not* require a Mac. You just need to
render the page **somewhere your iPhone browser can open it.** Two phone-only
routes:

- **Deploy it.** I push the repo to GitHub → connect it to
  **Vercel / Netlify / GitHub Pages** (one-time setup from your phone) → every
  push auto-deploys → you open the live URL in Safari and screen-record it.
  Smooth, real WebGL, full quality. This is the cleanest phone-only loop.
- **Browser-native IDE.** Tools like **StackBlitz** or **CodeSandbox** run Vite
  *inside* mobile Safari via WebContainers and give you a live preview tab on
  the same screen. Great for instant iteration.

---

## Recommended loop for X content (zero Mac)

1. I scaffold a clean R3F + Vite repo here and push it.
2. You connect it to Vercel once (from your phone).
3. From then on: you describe a tweak → I push → Vercel redeploys in ~20s → you
   refresh Safari and screen-record.

That's a genuine "same workflow as my Mac" loop, entirely from your iPhone — the
rendering just happens at a live URL instead of inside this chat.
