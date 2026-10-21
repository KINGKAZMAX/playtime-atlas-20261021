#!/usr/bin/env bash
# 10-era-console — 来源可达性核验脚本
# 用法: bash scripts/verify_sources.sh > /tmp/sources_report.txt
set -u
UA="Mozilla/5.0 (compatible; PLAYTIME-Atlas-SourceCheck/1.0; +local research)"

check () {
  local url="$1"
  local code
  code=$(curl -s -o /dev/null -m 25 -L -A "$UA" -w "%{http_code}" "$url")
  printf "%s  %s\n" "$code" "$url"
}

echo "===== WIKIPEDIA ARTICLES ====="
for p in \
  "SNES" "Sega_Mega_Drive" "TurboGrafx-16" "Neo_Geo_(console)" "Sega_Saturn" \
  "PlayStation" "Nintendo_64" "3DO_Interactive_Multiplayer" "Atari_Jaguar" \
  "Virtual_Boy" "Game_Boy_Color" "Sega_Dreamcast" "WonderSwan" "Neo_Geo_Pocket" \
  "Game_Gear" "Philips_CD-i" "FM_Towns_Marty" "Amiga_CD32" "Apple_Pippin" \
  "Mode_7" "List_of_video_game_consoles" "Video_game" "Video_game_music" \
  "Z-buffering" "Affine_texture_mapping" "CD-ROM" "History_of_video_games" \
  "Frame_rate" "Atari_Jaguar_(console)" ; do
  check "https://en.wikipedia.org/wiki/$p"
done

echo
echo "===== OFFICIAL / MUSEUM / ARCHIVE ====="
for u in \
  "https://www.nintendo.co.jp/corporate/en/history/index.html" \
  "https://www.nintendo.co.jp/corporate/en/history/hardware/index.html" \
  "https://www.sega.jp/history/hard/" \
  "https://www.sega.jp/history/soft/" \
  "https://www.museumofplay.org/games/" \
  "https://www.museumofplay.org/blog/console-gaming-history/" \
  "https://www.computerhistory.org/" \
  "https://americanhistory.si.edu/collections/object-groups/computers" \
  "https://www.britannica.com/technology/video-game" \
  "https://www.internetarchive.org/" \
  "https://segaretro.org/" \
  "https://en.wikipedia.org/wiki/Template:Video_game_consoles" ; do
  check "$u"
done
