#!/usr/bin/env python3
"""抓取网页并抽成纯文本，便于人工核对交互/美术/许可描述。"""
import re
import ssl
import sys
import urllib.request

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"


def get(url, limit=400000):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "en-US,en;q=0.9"})
    with urllib.request.urlopen(req, timeout=60, context=ctx) as r:
        return r.read(limit).decode("utf-8", "ignore")


def to_text(html):
    html = re.sub(r"(?is)<(script|style|noscript|svg)[^>]*>.*?</\1>", " ", html)
    html = re.sub(r"(?is)<!--.*?-->", " ", html)
    html = re.sub(r"(?is)<br\s*/?>", "\n", html)
    html = re.sub(r"(?is)</(p|div|li|h[1-6]|tr|section)>", "\n", html)
    txt = re.sub(r"(?s)<[^>]+>", " ", html)
    import html as h
    txt = h.unescape(txt)
    txt = re.sub(r"[ \t\xa0]+", " ", txt)
    lines = [ln.strip() for ln in txt.split("\n")]
    lines = [ln for ln in lines if ln]
    out, seen = [], set()
    for ln in lines:
        if ln in seen and len(ln) < 4:
            continue
        seen.add(ln)
        out.append(ln)
    return "\n".join(out)


if __name__ == "__main__":
    for url in sys.argv[1:]:
        print(f"\n{'='*70}\n### {url}\n{'='*70}")
        try:
            print(to_text(get(url))[:14000])
        except Exception as e:
            print(f"ERROR: {e}")
