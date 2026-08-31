"""Offline sample provider.

Generates real, self-contained HTML designs with no network or API keys, so the
whole arena flow is playable end-to-end out of the box. Each arena model maps to
a design persona (palette, typography, flavor), and output is deterministic per
(model, prompt, category) so refreshes are stable while different models produce
visibly different designs for the same prompt.

Swap in live model output by setting DESIGNARENA_GENERATION_MODE=live once
provider API keys are configured.
"""
from __future__ import annotations

import random
import re

from ...models import ArenaModel
from .base import GenerationResult

# ---------------------------------------------------------------------------
# Personas
# ---------------------------------------------------------------------------

PERSONAS: dict[str, dict] = {
    "gpt-5-5": {"hue": 222, "accent": 262, "mode": "light", "radius": 14, "font": "'Segoe UI',system-ui,sans-serif", "flavor": "corporate"},
    "gpt-5-mini": {"hue": 210, "accent": 160, "mode": "light", "radius": 10, "font": "system-ui,sans-serif", "flavor": "minimal"},
    "claude-opus-4-8": {"hue": 24, "accent": 350, "mode": "cream", "radius": 12, "font": "Georgia,'Times New Roman',serif", "flavor": "editorial"},
    "claude-sonnet-4-6": {"hue": 30, "accent": 200, "mode": "light", "radius": 16, "font": "'Avenir Next',system-ui,sans-serif", "flavor": "glass"},
    "gemini-3-pro": {"hue": 217, "accent": 45, "mode": "light", "radius": 20, "font": "Roboto,system-ui,sans-serif", "flavor": "playful"},
    "gemini-3-flash": {"hue": 190, "accent": 330, "mode": "dark", "radius": 8, "font": "Roboto,system-ui,sans-serif", "flavor": "neon"},
    "glm-5-2": {"hue": 152, "accent": 262, "mode": "dark", "radius": 6, "font": "'JetBrains Mono',ui-monospace,monospace", "flavor": "neon"},
    "deepseek-v4": {"hue": 240, "accent": 190, "mode": "dark", "radius": 4, "font": "ui-monospace,monospace", "flavor": "brutalist"},
    "grok-4-1": {"hue": 0, "accent": 0, "mode": "dark", "radius": 0, "font": "Impact,'Arial Black',sans-serif", "flavor": "brutalist"},
    "llama-4-maverick": {"hue": 205, "accent": 28, "mode": "light", "radius": 24, "font": "'Trebuchet MS',sans-serif", "flavor": "playful"},
    "qwen3-max": {"hue": 265, "accent": 315, "mode": "gradient", "radius": 18, "font": "system-ui,sans-serif", "flavor": "glass"},
    "kimi-k2-5": {"hue": 340, "accent": 45, "mode": "cream", "radius": 10, "font": "'Palatino Linotype',Palatino,serif", "flavor": "editorial"},
    "mistral-large-3": {"hue": 18, "accent": 210, "mode": "light", "radius": 8, "font": "'Gill Sans','Segoe UI',sans-serif", "flavor": "minimal"},
    "minimax-m2-5": {"hue": 130, "accent": 55, "mode": "dark", "radius": 12, "font": "Verdana,sans-serif", "flavor": "retro"},
}

_DEFAULT_PERSONA = {"hue": 200, "accent": 40, "mode": "light", "radius": 12, "font": "system-ui,sans-serif", "flavor": "minimal"}

_STOPWORDS = {
    "a", "an", "the", "for", "of", "and", "or", "to", "with", "in", "on", "that",
    "this", "these", "those", "where", "when", "what", "who", "how", "which",
    "you", "your", "i", "we", "my", "me", "it", "its", "is", "are", "be", "can",
    "will", "into", "from", "at", "by", "as", "so", "then", "like", "want",
    "need", "some", "called", "named", "about",
    "make", "create", "build", "design", "generate", "please", "app",
    "website", "site", "page", "landing", "component", "game", "logo", "chart", "ascii", "art",
}

_BRAND_RE = re.compile(r"\b(?:called|named)\s+['\"]?([A-Za-z][\w'-]*)", re.IGNORECASE)


class SampleProvider:
    async def generate(self, model: ArenaModel, prompt: str, category: str) -> GenerationResult:
        rng = random.Random(f"{model.slug}::{category}::{prompt}")
        persona = dict(PERSONAS.get(model.slug, _DEFAULT_PERSONA))
        # Small deterministic drift so shared archetypes still differ.
        persona["hue"] = (persona["hue"] + rng.randint(-12, 12)) % 360
        gen = {
            "website": _website,
            "ui-component": _component,
            "dataviz": _dataviz,
            "game": _game,
            "svg-logo": _logo,
            "ascii-art": _ascii,
        }.get(category, _website)
        html = gen(prompt, persona, rng)
        return GenerationResult(html=html, latency_ms=rng.randint(900, 3400))


# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------

def _words(prompt: str, n: int = 4) -> list[str]:
    # A "called X" / "named X" brand always leads — it's the word users expect
    # to see on the design.
    m = _BRAND_RE.search(prompt)
    brand = m.group(1) if m else None
    tokens = [
        w
        for w in re.findall(r"[A-Za-z0-9']+", prompt)
        if w.lower() not in _STOPWORDS and (brand is None or w.lower() != brand.lower())
    ]
    out = ([brand] if brand else []) + tokens
    return out[:n] or ["Studio"]


def _title(prompt: str, n: int = 3) -> str:
    return " ".join(w.capitalize() for w in _words(prompt, n))


def _esc(s: str) -> str:
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def _palette(p: dict) -> dict:
    h, a = p["hue"], p["accent"]
    mode = p["mode"]
    if mode == "dark":
        return {"bg": f"hsl({h},18%,9%)", "surface": f"hsl({h},16%,14%)", "text": f"hsl({h},15%,92%)",
                "muted": f"hsl({h},10%,60%)", "primary": f"hsl({h},85%,60%)", "accent": f"hsl({a},90%,62%)",
                "border": f"hsl({h},14%,24%)"}
    if mode == "cream":
        return {"bg": f"hsl({h},45%,96%)", "surface": "#fffdf8", "text": f"hsl({h},30%,14%)",
                "muted": f"hsl({h},12%,42%)", "primary": f"hsl({h},70%,42%)", "accent": f"hsl({a},75%,50%)",
                "border": f"hsl({h},25%,86%)"}
    if mode == "gradient":
        return {"bg": f"linear-gradient(135deg,hsl({h},70%,14%),hsl({a},60%,22%))", "surface": "hsla(0,0%,100%,.08)",
                "text": "hsl(0,0%,97%)", "muted": "hsla(0,0%,100%,.65)", "primary": f"hsl({h},90%,68%)",
                "accent": f"hsl({a},95%,66%)", "border": "hsla(0,0%,100%,.18)"}
    return {"bg": f"hsl({h},40%,98%)", "surface": "#ffffff", "text": f"hsl({h},35%,12%)",
            "muted": f"hsl({h},10%,45%)", "primary": f"hsl({h},80%,48%)", "accent": f"hsl({a},85%,55%)",
            "border": f"hsl({h},20%,88%)"}


def _flavor_css(p: dict, c: dict) -> str:
    f = p["flavor"]
    if f == "brutalist":
        return f".card,.btn{{border:3px solid {c['text']};box-shadow:6px 6px 0 {c['text']};border-radius:0}} h1,h2{{text-transform:uppercase;letter-spacing:.04em}}"
    if f == "glass":
        return f".card{{backdrop-filter:blur(14px);background:hsla(0,0%,100%,.55);border:1px solid hsla(0,0%,100%,.5);box-shadow:0 18px 50px hsla(220,40%,20%,.14)}} body{{background-image:radial-gradient(60% 50% at 20% 10%,{c['accent']}22,transparent),radial-gradient(50% 40% at 90% 80%,{c['primary']}26,transparent)}}"
    if f == "neon":
        return f".btn,.chip{{box-shadow:0 0 18px {c['primary']}66}} h1{{text-shadow:0 0 24px {c['primary']}aa}} .card{{border:1px solid {c['primary']}55}}"
    if f == "editorial":
        return f"h1,h2{{font-weight:600}} .rule{{border-top:1px solid {c['border']}}} .kicker{{font-family:system-ui,sans-serif;text-transform:uppercase;letter-spacing:.22em;font-size:11px;color:{c['accent']}}}"
    if f == "playful":
        return ".card{transition:transform .18s}.card:hover{transform:translateY(-4px) rotate(-.4deg)} .blob{position:absolute;border-radius:50%;filter:blur(2px);opacity:.5}"
    if f == "retro":
        return f".card{{border:2px dashed {c['border']}}} .btn{{border:2px solid {c['text']};box-shadow:3px 3px 0 {c['accent']}}}"
    return ""


def _base_css(p: dict, c: dict) -> str:
    return (
        f"*{{box-sizing:border-box;margin:0}}body{{background:{c['bg']};color:{c['text']};"
        f"font-family:{p['font']};min-height:100vh;-webkit-font-smoothing:antialiased}}"
        f".card{{background:{c['surface']};border:1px solid {c['border']};border-radius:{p['radius']}px;padding:24px}}"
        f".btn{{display:inline-block;background:{c['primary']};color:{'#101014' if p['mode'] in ('dark','gradient') else '#fff'};"
        f"padding:12px 22px;border-radius:{max(p['radius'] - 2, 0)}px;font-weight:700;text-decoration:none;border:0;cursor:pointer}}"
        f".muted{{color:{c['muted']}}} .chip{{display:inline-block;padding:4px 12px;border-radius:999px;"
        f"border:1px solid {c['border']};font-size:12px;color:{c['muted']}}}"
        + _flavor_css(p, c)
    )


# ---------------------------------------------------------------------------
# Category generators
# ---------------------------------------------------------------------------

def _website(prompt: str, p: dict, rng: random.Random) -> str:
    c = _palette(p)
    title = _esc(_title(prompt))
    kw = [_esc(w.capitalize()) for w in (_words(prompt, 6) + ["Craft", "Momentum", "Clarity"])[:3]]
    taglines = [
        "Built for people who notice the details.",
        "Less noise. More signal.",
        "Everything you need, nothing you don't.",
        "Quietly powerful. Loudly loved.",
    ]
    feats = [
        ("Fast by default", "Rendered in milliseconds, everywhere on earth."),
        ("Thoughtful design", "Every pixel argued over so you don't have to."),
        ("Plays well with others", "Integrates with the tools you already use."),
        ("Grows with you", "From side project to main character."),
    ]
    rng.shuffle(feats)
    stats = [(f"{rng.randint(10, 98)}k", "happy users"), (f"{rng.randint(91, 99)}%", "satisfaction"), (f"{rng.randint(3, 24)}ms", "median load")]
    cards = "".join(
        f"<div class='card'><div style='width:34px;height:34px;border-radius:{max(p['radius'] - 4, 4)}px;background:{c['primary']}22;display:flex;align-items:center;justify-content:center;color:{c['accent']};font-weight:800;margin-bottom:12px'>{i + 1}</div>"
        f"<h3 style='margin-bottom:8px'>{t}</h3><p class='muted' style='line-height:1.6'>{d}</p></div>"
        for i, (t, d) in enumerate(feats[:3])
    )
    statel = "".join(
        f"<div style='text-align:center'><div style='font-size:34px;font-weight:800;color:{c['accent']}'>{v}</div><div class='muted' style='font-size:13px'>{l}</div></div>"
        for v, l in stats
    )
    quotes = [
        ("It just feels considered. Every screen.", "Ana R., product lead"),
        ("Switched the whole team over in a week.", "Marcus T., founder"),
        ("The rare tool that respects your attention.", "Priya S., designer"),
    ]
    quote, who = rng.choice(quotes)

    # Hero variant by persona flavor — the big visual differentiator between models.
    flavor = p["flavor"]
    hero_style = "editorial" if flavor == "editorial" else ("split" if flavor in ("glass", "playful", "corporate", "retro") else rng.choice(["centered", "split"]))
    if hero_style == "split":
        visual = (
            f"<div style='flex:1;min-width:280px;position:relative'>"
            f"<div class='card' style='padding:14px;box-shadow:0 24px 60px {c['primary']}33'>"
            f"<div style='display:flex;gap:6px;margin-bottom:10px'><span style='width:10px;height:10px;border-radius:50%;background:#ff5f57'></span><span style='width:10px;height:10px;border-radius:50%;background:#febc2e'></span><span style='width:10px;height:10px;border-radius:50%;background:#28c840'></span></div>"
            f"<div style='height:120px;border-radius:{max(p['radius'] - 4, 4)}px;background:linear-gradient(135deg,{c['primary']},{c['accent']})'></div>"
            f"<div style='height:10px;width:70%;border-radius:5px;background:{c['border']};margin:14px 0 8px'></div>"
            f"<div style='height:10px;width:45%;border-radius:5px;background:{c['border']}'></div>"
            f"<div style='display:flex;gap:8px;margin-top:14px'><span class='chip'>{kw[1]}</span><span class='chip'>{kw[2]}</span></div>"
            f"</div></div>"
        )
        hero = (
            f"<section class='hero' style='display:flex;gap:6vw;align-items:center;flex-wrap:wrap'>"
            f"<div style='flex:1.2;min-width:300px'><span class='kicker chip'>{kw[1]} &middot; {kw[2]}</span>"
            f"<h1 style='margin:18px 0'>{title}</h1>"
            f"<p class='muted' style='font-size:19px;line-height:1.6;max-width:520px'>{rng.choice(taglines)}</p>"
            f"<div style='margin-top:26px;display:flex;gap:14px'><a class='btn'>Start free</a><a class='chip' style='padding:12px 20px'>See how it works</a></div></div>"
            f"{visual}</section>"
        )
    elif hero_style == "editorial":
        hero = (
            f"<section class='hero' style='max-width:820px'>"
            f"<div class='kicker' style='margin-bottom:14px'>{kw[1]} &mdash; issue no. {rng.randint(1, 24)}</div>"
            f"<h1 style='margin:0 0 22px;font-size:clamp(40px,7vw,76px)'>{title}</h1>"
            f"<div class='rule' style='margin-bottom:22px'></div>"
            f"<p class='muted' style='font-size:20px;line-height:1.65;max-width:600px'>{rng.choice(taglines)} A quiet argument for doing fewer things, beautifully.</p>"
            f"<div style='margin-top:26px;display:flex;gap:14px'><a class='btn'>Start reading</a><span class='chip' style='padding:12px 20px'>About {kw[0]}</span></div></section>"
        )
    else:
        hero = (
            f"<section class='hero' style='text-align:center;margin:0 auto'>"
            f"<span class='kicker chip'>{kw[1]} &middot; {kw[2]}</span>"
            f"<h1 style='margin:18px auto'>{title}</h1>"
            f"<p class='muted' style='font-size:19px;line-height:1.6;max-width:560px;margin:0 auto'>{rng.choice(taglines)}</p>"
            f"<div style='margin-top:26px;display:flex;gap:14px;justify-content:center'><a class='btn'>Start free</a><a class='chip' style='padding:12px 20px'>See how it works</a></div></section>"
        )

    return f"""<!DOCTYPE html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'>
<title>{title}</title><style>{_base_css(p, c)}
nav{{display:flex;justify-content:space-between;align-items:center;padding:20px 6vw}}
.hero{{padding:8vh 6vw 6vh}}
h1{{font-size:clamp(34px,6vw,64px);line-height:1.05;letter-spacing:-.02em}}
.grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px;padding:0 6vw 40px}}
.stats{{display:flex;gap:56px;padding:34px 6vw;border-top:1px solid {c['border']};border-bottom:1px solid {c['border']};flex-wrap:wrap;justify-content:center}}
.quote{{padding:52px 6vw;text-align:center}}
.cta{{margin:0 6vw 44px;padding:44px;border-radius:{p['radius'] + 4}px;background:linear-gradient(120deg,{c['primary']},{c['accent']});color:#fff;text-align:center}}
footer{{padding:28px 6vw;color:{c['muted']};font-size:13px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;border-top:1px solid {c['border']}}}</style></head><body>
<nav><div style='font-weight:800;font-size:18px'>{kw[0]}<span style='color:{c['accent']}'>.</span></div>
<div style='display:flex;gap:22px;align-items:center'><span class='muted'>Product</span><span class='muted'>Pricing</span><span class='muted'>Journal</span><a class='btn' style='padding:9px 16px'>Get started</a></div></nav>
{hero}
<div class='stats'>{statel}</div>
<section style='padding:44px 6vw 8px'><h2 style='margin-bottom:20px'>Why {kw[0]}?</h2></section>
<div class='grid'>{cards}</div>
<div class='quote'><div style='font-size:24px;line-height:1.5;max-width:620px;margin:0 auto'>&ldquo;{quote}&rdquo;</div><div class='muted' style='margin-top:14px'>&mdash; {who}</div></div>
<div class='cta'><h2 style='margin-bottom:8px'>Ready when you are.</h2><p style='opacity:.85;margin-bottom:18px'>Set up takes two minutes. Your future self says thanks.</p><a class='btn' style='background:#fff;color:#111'>Create your {kw[0]}</a></div>
<footer><span>&copy; 2026 {kw[0]}</span><span>Privacy &middot; Terms &middot; Status</span><span>Made with intent</span></footer></body></html>"""


def _component(prompt: str, p: dict, rng: random.Random) -> str:
    c = _palette(p)
    low = prompt.lower()
    title = _esc(_title(prompt, 2))
    if any(k in low for k in ("pricing", "plan", "subscription")):
        body = _pricing_card(p, c, rng)
    elif any(k in low for k in ("form", "signup", "sign up", "login", "log in", "register")):
        body = _form_card(p, c, title)
    elif any(k in low for k in ("player", "music", "audio", "podcast")):
        body = _player_card(p, c, title, rng)
    else:
        body = _profile_card(p, c, title, rng)
    return f"""<!DOCTYPE html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'>
<style>{_base_css(p, c)} body{{display:flex;align-items:center;justify-content:center;padding:24px}}</style></head>
<body>{body}</body></html>"""


def _pricing_card(p: dict, c: dict, rng: random.Random) -> str:
    price = rng.choice([9, 12, 19, 29])
    rows = "".join(
        f"<li style='display:flex;gap:10px;padding:7px 0'><span style='color:{c['accent']}'>&#10003;</span><span>{f}</span></li>"
        for f in ["Unlimited projects", "Priority support", "Custom domains", "Team seats included"]
    )
    return f"""<div class='card' style='width:320px'>
<span class='chip'>Most popular</span>
<h2 style='margin:14px 0 4px'>Pro</h2>
<div><span style='font-size:44px;font-weight:800'>${price}</span><span class='muted'>/mo</span></div>
<ul style='list-style:none;padding:14px 0'>{rows}</ul>
<button class='btn' style='width:100%'>Upgrade to Pro</button>
<p class='muted' style='font-size:12px;text-align:center;margin-top:10px'>Cancel anytime. No hidden fees.</p></div>"""


def _form_card(p: dict, c: dict, title: str) -> str:
    inp = f"width:100%;padding:12px;border-radius:{max(p['radius'] - 4, 0)}px;border:1px solid {c['border']};background:transparent;color:{c['text']};margin:6px 0 14px"
    return f"""<div class='card' style='width:340px'>
<h2 style='margin-bottom:6px'>{title}</h2><p class='muted' style='margin-bottom:16px'>Welcome back — sign in to continue.</p>
<label class='muted' style='font-size:13px'>Email</label><input style='{inp}' placeholder='you@example.com'>
<label class='muted' style='font-size:13px'>Password</label><input type='password' style='{inp}' placeholder='••••••••'>
<button class='btn' style='width:100%'>Continue</button>
<p class='muted' style='font-size:12px;margin-top:12px;text-align:center'>Forgot password? <span style='color:{c['accent']}'>Reset it</span></p></div>"""


def _player_card(p: dict, c: dict, title: str, rng: random.Random) -> str:
    bars = "".join(
        f"<div style='width:4px;height:{rng.randint(8, 40)}px;background:{c['primary']};border-radius:2px'></div>"
        for _ in range(28)
    )
    return f"""<div class='card' style='width:340px'>
<div style='display:flex;gap:14px;align-items:center'>
<div style='width:64px;height:64px;border-radius:{p['radius']}px;background:linear-gradient(135deg,{c['primary']},{c['accent']})'></div>
<div><div style='font-weight:700'>{title}</div><div class='muted' style='font-size:13px'>Arena Sessions, Vol. 1</div></div></div>
<div style='display:flex;gap:3px;align-items:flex-end;height:48px;margin:18px 0'>{bars}</div>
<div style='display:flex;justify-content:center;gap:18px;align-items:center'>
<span class='muted' style='font-size:20px'>&#9198;</span><button class='btn' style='border-radius:999px;width:52px;height:52px;font-size:18px'>&#9654;</button><span class='muted' style='font-size:20px'>&#9197;</span></div>
<div style='display:flex;justify-content:space-between;margin-top:12px' class='muted'><span style='font-size:12px'>1:24</span><span style='font-size:12px'>3:51</span></div></div>"""


def _profile_card(p: dict, c: dict, title: str, rng: random.Random) -> str:
    stats = "".join(
        f"<div style='text-align:center'><div style='font-weight:800'>{rng.randint(12, 480)}</div><div class='muted' style='font-size:12px'>{l}</div></div>"
        for l in ("Projects", "Followers", "Wins")
    )
    return f"""<div class='card' style='width:320px;text-align:center'>
<div style='width:76px;height:76px;border-radius:50%;margin:4px auto 12px;background:linear-gradient(135deg,{c['primary']},{c['accent']});display:flex;align-items:center;justify-content:center;font-size:30px;color:#fff;font-weight:800'>{title[:1]}</div>
<h2>{title}</h2><p class='muted' style='margin:6px 0 16px'>Designs things. Ships often.</p>
<div style='display:flex;justify-content:space-around;padding:14px 0;border-top:1px solid {c['border']};border-bottom:1px solid {c['border']}'>{stats}</div>
<div style='display:flex;gap:10px;margin-top:16px'><button class='btn' style='flex:1'>Follow</button><button class='chip' style='flex:1;padding:12px;background:transparent;cursor:pointer'>Message</button></div></div>"""


def _dataviz(prompt: str, p: dict, rng: random.Random) -> str:
    c = _palette(p)
    title = _esc(_title(prompt))
    low = prompt.lower()
    if any(k in low for k in ("trend", "over time", "growth", "line", "timeline")):
        kind = "line"
    elif any(k in low for k in ("share", "breakdown", "donut", "pie", "distribution", "split")):
        kind = "donut"
    else:
        kind = rng.choice(["bar", "bar", "line", "donut"])

    labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    vals = [rng.randint(18, 96) for _ in labels]
    peak, avg = max(vals), sum(vals) // len(vals)
    grid = "".join(
        f"<line x1='50' x2='500' y1='{230 - y}' y2='{230 - y}' stroke='{c['border']}' stroke-width='1'/>" for y in (0, 60, 120, 180)
    )

    if kind == "bar":
        marks = ""
        for i, (l, v) in enumerate(zip(labels, vals)):
            h = int(180 * v / peak)
            x = 60 + i * 62
            fill = c["accent"] if v == peak else c["primary"]
            marks += (
                f"<rect x='{x}' y='{230 - h}' width='38' height='{h}' rx='{min(p['radius'], 8)}' fill='{fill}' opacity='.92'/>"
                f"<text x='{x + 19}' y='{222 - h}' text-anchor='middle' font-size='11' fill='{c['muted']}'>{v}</text>"
                f"<text x='{x + 19}' y='250' text-anchor='middle' font-size='12' fill='{c['muted']}'>{l}</text>"
            )
        chart = f"<svg viewBox='0 0 520 260' style='width:100%'>{grid}{marks}</svg>"
        legend = f"<span style='font-size:12px'><span style='display:inline-block;width:10px;height:10px;background:{c['primary']};border-radius:2px'></span> daily</span><span style='font-size:12px'><span style='display:inline-block;width:10px;height:10px;background:{c['accent']};border-radius:2px'></span> peak day</span>"
    elif kind == "line":
        pts = []
        for i, v in enumerate(vals):
            x = 70 + i * 62
            y = 230 - int(180 * v / peak)
            pts.append((x, y))
        poly = " ".join(f"{x},{y}" for x, y in pts)
        area = f"70,230 {poly} {pts[-1][0]},230"
        dots = "".join(
            f"<circle cx='{x}' cy='{y}' r='4.5' fill='{c['accent'] if vals[i] == peak else c['primary']}'/>"
            f"<text x='{x}' y='{y - 12}' text-anchor='middle' font-size='11' fill='{c['muted']}'>{vals[i]}</text>"
            for i, (x, y) in enumerate(pts)
        )
        xlab = "".join(f"<text x='{70 + i * 62}' y='250' text-anchor='middle' font-size='12' fill='{c['muted']}'>{l}</text>" for i, l in enumerate(labels))
        chart = (
            f"<svg viewBox='0 0 520 260' style='width:100%'>{grid}"
            f"<polygon points='{area}' fill='{c['primary']}22'/>"
            f"<polyline points='{poly}' fill='none' stroke='{c['primary']}' stroke-width='3' stroke-linejoin='round' stroke-linecap='round'/>"
            f"{dots}{xlab}</svg>"
        )
        legend = f"<span style='font-size:12px'><span style='display:inline-block;width:10px;height:10px;background:{c['primary']};border-radius:2px'></span> this week &middot; avg {avg}</span>"
    else:  # donut
        seg_labels = [_esc(w.capitalize()) for w in (_words(prompt, 8) + ["Alpha", "Beta", "Gamma", "Delta"])[:4]]
        segs = [rng.randint(10, 40) for _ in seg_labels]
        total = sum(segs)
        circumference = 2 * 3.14159 * 80
        offset = 0.0
        arcs = ""
        colors = [c["primary"], c["accent"], f"hsl({(p['hue'] + 130) % 360},70%,55%)", c["muted"]]
        for v, col in zip(segs, colors):
            frac = v / total
            arcs += (
                f"<circle cx='130' cy='130' r='80' fill='none' stroke='{col}' stroke-width='34' "
                f"stroke-dasharray='{frac * circumference:.1f} {circumference:.1f}' "
                f"stroke-dashoffset='{-offset * circumference:.1f}' transform='rotate(-90 130 130)'/>"
            )
            offset += frac
        rows = "".join(
            f"<div style='display:flex;justify-content:space-between;gap:18px;padding:7px 0;border-bottom:1px solid {c['border']}'>"
            f"<span><span style='display:inline-block;width:10px;height:10px;background:{col};border-radius:2px;margin-right:8px'></span>{l}</span>"
            f"<b>{v * 100 // total}%</b></div>"
            for l, v, col in zip(seg_labels, segs, colors)
        )
        chart = (
            f"<div style='display:flex;gap:28px;align-items:center;flex-wrap:wrap'>"
            f"<svg viewBox='0 0 260 260' style='width:220px'>{arcs}"
            f"<text x='130' y='124' text-anchor='middle' font-size='30' font-weight='800' fill='{c['text']}'>{total}</text>"
            f"<text x='130' y='148' text-anchor='middle' font-size='12' fill='{c['muted']}'>total</text></svg>"
            f"<div style='flex:1;min-width:180px'>{rows}</div></div>"
        )
        legend = f"<span style='font-size:12px'>share of total &middot; {len(segs)} segments</span>"

    return f"""<!DOCTYPE html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'>
<style>{_base_css(p, c)} body{{display:flex;align-items:center;justify-content:center;padding:24px}}</style></head><body>
<div class='card' style='width:560px;max-width:96vw'>
<div style='display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px'>
<h2>{title}</h2><span class='chip'>Last 7 days</span></div>
<p class='muted' style='margin-bottom:10px'>Daily activity &middot; avg {avg} &middot; peak {peak}</p>
{chart}
<div style='display:flex;gap:16px;margin-top:8px' class='muted'>{legend}</div>
</div></body></html>"""


def _game(prompt: str, p: dict, rng: random.Random) -> str:
    c = _palette(p)
    title = _esc(_title(prompt, 2))
    return f"""<!DOCTYPE html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'>
<style>{_base_css(p, c)} body{{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:20px}}
canvas{{border:1px solid {c['border']};border-radius:{p['radius']}px;background:{c['surface']};touch-action:none}}</style></head><body>
<h2>{title}</h2><div class='muted'>Move with &larr; &rarr; (or A/D). Catch the falling gems.</div>
<div style='display:flex;gap:18px;align-items:center'><span class='chip'>Score: <b id='s'>0</b></span><span class='chip'>Lives: <b id='l'>3</b></span><button class='btn' id='r' style='padding:8px 16px'>Restart</button></div>
<canvas id='c' width='420' height='300'></canvas>
<script>
const cv=document.getElementById('c'),x2=cv.getContext('2d');let px=190,score=0,lives=3,gems=[],t=0,over=false,started=false;
const keys={{}};
addEventListener('keydown',e=>{{keys[e.key]=1;if(['ArrowLeft','ArrowRight','a','d'].includes(e.key))started=true}});
addEventListener('keyup',e=>keys[e.key]=0);
document.getElementById('r').onclick=()=>{{px=190;score=0;lives=3;gems=[];over=false;started=false;upd()}};
function upd(){{document.getElementById('s').textContent=score;document.getElementById('l').textContent=lives}}
function loop(){{
 if(!over){{
  if(keys['ArrowLeft']||keys['a'])px-=5.2;if(keys['ArrowRight']||keys['d'])px+=5.2;
  px=Math.max(0,Math.min(380,px));
  if(started&&++t%42===0)gems.push({{x:Math.random()*400,y:-12,v:1.6+Math.random()*1.8+score*0.04}});
  for(const g of gems)g.y+=g.v;
  gems=gems.filter(g=>{{
   if(g.y>270&&g.x>px-12&&g.x<px+52){{score++;upd();return false}}
   if(g.y>300){{lives--;upd();if(lives<=0)over=true;return false}}
   return true}});
 }}
 x2.clearRect(0,0,420,300);
 x2.fillStyle='{c["primary"]}';x2.beginPath();x2.roundRect(px,278,40,14,6);x2.fill();
 for(const g of gems){{x2.fillStyle='{c["accent"]}';x2.save();x2.translate(g.x+6,g.y+6);x2.rotate(t/20);x2.fillRect(-6,-6,12,12);x2.restore()}}
 if(!started&&!over){{x2.fillStyle='{c["muted"]}';x2.font='600 17px sans-serif';x2.textAlign='center';x2.fillText('Press ← or → to start',210,150)}}
 if(over){{x2.fillStyle='{c["text"]}';x2.font='700 26px sans-serif';x2.textAlign='center';x2.fillText('Game over — '+score+' gems',210,150)}}
 requestAnimationFrame(loop)}}
loop();
</script></body></html>"""


def _logo(prompt: str, p: dict, rng: random.Random) -> str:
    c = _palette(p)
    word = _esc(_words(prompt, 1)[0].capitalize())
    kind = rng.choice(["orbit", "rings", "grid"])
    if kind == "orbit":
        n = rng.randint(3, 6)
        shapes = ""
        for i in range(n):
            ang = i * (360 / n) + rng.randint(0, 30)
            shapes += (
                f"<g transform='rotate({ang} 60 60)'><circle cx='60' cy='28' r='{rng.randint(8, 15)}' "
                f"fill='{c['primary'] if i % 2 == 0 else c['accent']}' opacity='{rng.choice(['0.85', '0.65', '1'])}'/></g>"
            )
        shapes += f"<circle cx='60' cy='60' r='18' fill='{c['text']}'/>"
    elif kind == "rings":
        shapes = (
            f"<circle cx='60' cy='60' r='44' fill='none' stroke='{c['primary']}' stroke-width='9' stroke-dasharray='200 77' stroke-linecap='round' transform='rotate({rng.randint(0, 359)} 60 60)'/>"
            f"<circle cx='60' cy='60' r='27' fill='none' stroke='{c['accent']}' stroke-width='9' stroke-dasharray='120 50' stroke-linecap='round' transform='rotate({rng.randint(0, 359)} 60 60)'/>"
            f"<circle cx='60' cy='60' r='9' fill='{c['text']}'/>"
        )
    else:  # grid
        r = max(p["radius"] // 2, 3)
        cells = [(28, 28), (66, 28), (28, 66), (66, 66)]
        accent_i = rng.randrange(4)
        shapes = "".join(
            f"<rect x='{x}' y='{y}' width='30' height='30' rx='{r}' fill='{c['accent'] if i == accent_i else c['primary']}' "
            f"opacity='{1 if i == accent_i else 0.82}' transform='rotate({rng.choice([0, 0, 45])} {x + 15} {y + 15})'/>"
            for i, (x, y) in enumerate(cells)
        )
    mark = f"<svg viewBox='0 0 120 120' width='120'>{shapes}</svg>"
    return f"""<!DOCTYPE html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'>
<style>{_base_css(p, c)} body{{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;padding:24px}}</style></head><body>
<div class='card' style='display:flex;flex-direction:column;align-items:center;gap:14px;padding:44px 60px'>
{mark}<div style='font-size:34px;font-weight:800;letter-spacing:-.02em'>{word}<span style='color:{c['accent']}'>&#9679;</span></div>
<span class='muted'>brand mark &middot; v1</span></div>
<div style='display:flex;gap:12px'>
<div style='background:#101014;border-radius:{p['radius']}px;padding:18px 26px'><svg viewBox='0 0 120 120' width='44'>{shapes}</svg></div>
<div style='background:#fff;border:1px solid {c['border']};border-radius:{p['radius']}px;padding:18px 26px'><svg viewBox='0 0 120 120' width='44'>{shapes}</svg></div>
</div></body></html>"""


_ASCII_PIECES = {
    "rocket": r"""
       /\
      /  \
     |    |
     | () |
    /|    |\
   / |    | \
  |__|____|__|
     /_\/_\
""",
    "fox": r"""
   /\   /\
  //\\_//\\
  \_     _/
   / * * \
   \_\O/_/
   /  ^  \
  / .   . \
""",
    "mountain": r"""
        /\
       /  \  /\
      / /\ \/  \
     / /  \ \ * \
    /_/____\_\___\
""",
    "robot": r"""
    [o_o]
   /|===|\
  d |___| b
    || ||
    Lb dJ
""",
    "cat": r"""
   /\_/\
  ( o.o )
   > ^ <
  /|   |\
   |___|
""",
}


def _ascii(prompt: str, p: dict, rng: random.Random) -> str:
    c = _palette(p)
    low = prompt.lower()
    key = next((k for k in _ASCII_PIECES if k in low), None)
    if key is None:
        aliases = {"space": "rocket", "ship": "rocket", "animal": "fox", "dog": "fox", "hill": "mountain", "peak": "mountain", "ai": "robot", "bot": "robot", "kitten": "cat"}
        key = next((v for k, v in aliases.items() if k in low), rng.choice(list(_ASCII_PIECES)))
    art = _ASCII_PIECES[key]
    word = _words(prompt, 2)
    banner = " ".join(w.upper() for w in word)
    edge = rng.choice(["=", "~", "*", "#"])
    frame = edge * (max(len(banner) + 8, 26))
    return f"""<!DOCTYPE html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'>
<style>*{{box-sizing:border-box;margin:0}}body{{background:hsl({p['hue']},20%,8%);color:{c['primary']};min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:ui-monospace,'Courier New',monospace;padding:20px}}
pre{{font-size:15px;line-height:1.25;text-shadow:0 0 14px {c['primary']}55}} .dim{{color:hsl({p['hue']},15%,45%)}}</style></head><body>
<pre>
<span class='dim'>{frame}</span>
   {banner}
<span class='dim'>{frame}</span>
{_esc(art)}
<span class='dim'>  &gt; rendered in glorious 7-bit</span>
</pre></body></html>"""
