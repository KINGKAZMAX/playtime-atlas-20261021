#!/usr/bin/env python3
"""批量抓取参考站首页/条款页，抽取许可相关上下文，用于 REFERENCE-DESIGN.md 的许可栏。"""
import re
import ssl
import sys
import urllib.request
from html import unescape

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from fetch_text import get, to_text  # noqa: E402

KEYS = [
    (r"creative\s*commons|CC\s+BY|CC0|public\s*domain|all\s+rights\s+reserved",
     "LICENSE"),
    (r"permitted\s+for\s+(educational|non-?commercial)|non-?commercial\s+use|educational\s+use",
     "USE"),
    (r"trademark|logos?\s+(and|or)\s+design|copyright\s+(©|&copy;|\d{4})|©\s*\d{4}",
     "RIGHTS"),
]

PAGES = [
    ("NVM Sheffield", "https://thenvm.org/privacy-policy/"),
    ("NVM Sheffield", "https://thenvm.org/terms-and-conditions/"),
    ("NVM USA", "https://nvmusa.org/"),
    ("Computer History Museum", "https://www.computerhistory.org/about/terms-of-use/"),
    ("Computer History Museum", "https://www.computerhistory.org/about/"),
    ("Centre for Computing History", "https://computinghistory.org.uk/privacy/"),
    ("Centre for Computing History", "https://computinghistory.org.uk/terms-conditions/"),
    ("Museum of the Game / KLOV", "https://www.arcade-museum.com/Game_Main.aspx"),
    ("Video Game History Foundation", "https://www.videogamehistory.org/"),
    ("Games That Weren't", "https://www.gamesthatwerent.com/about/"),
    ("Emulation Nation", "https://www.emulatorzone.com/"),
    ("Console Passion", "https://www.consolepassion.com/"),
    ("Old Computer Museum", "http://www.old-computers.com/"),
    ("Internet Archive Software", "https://archive.org/details/software"),
    ("Google Arts & Culture", "https://artsandculture.google.com/"),
]


def snippets(text):
    out = []
    for pat, label in KEYS:
        for m in re.finditer(pat, text, re.I):
            s = max(0, m.start() - 160)
            e = min(len(text), m.end() + 160)
            snip = re.sub(r"\s+", " ", text[s:e]).strip()
            if snip not in [o[1] for o in out]:
                out.append((label, snip))
            if len(out) > 40:
                break
    return out


for name, url in PAGES:
    print(f"\n{'='*72}\n## {name}\n   {url}")
    try:
        t = to_text(get(url))
        lines = [ln for ln in t.split("\n") if len(ln) > 25]
        hits = snippets("\n".join(lines))
        if not hits:
            print("   (no license keywords found on this page)")
        for label, snip in hits[:8]:
            print(f"   [{label}] …{snip}…")
    except Exception as e:
        print(f"   ERROR: {type(e).__name__}: {e}")
