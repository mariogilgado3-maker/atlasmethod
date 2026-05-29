#!/usr/bin/env python3
"""
Atlas Method – Cinematic Intro v2
60s | 4 acts | 70% slow / 30% tension | Narrative arc
"""
import subprocess, os

BASE = "/home/user/atlasmethod/video_output"
CLIPS = {
    "c1": f"{BASE}/2812744d-Download.mp4",      # 48s
    "c2": f"{BASE}/516d109d-Download_1.mp4",     # 50s
    "c3": f"{BASE}/c6d2706c-Download_2.mp4",     # 25s
    "c4": f"{BASE}/b0ff6a9f-Download_3.mp4",     # 70s
    "c5": f"{BASE}/d88d0d35-Download_4.mp4",     # 87s
}
OUT = f"{BASE}/atlas_method_v2.mp4"
FPS = 30
W, H = 576, 1024

# Each segment: (clip_key, start_sec, duration_sec, grade)
# grade: "color" | "bw" | "bw_flash" | "bright"
# "color"    = full color, warm, normal life
# "bw"       = desaturated, high contrast, tension
# "bw_flash" = B&W + ultra fast + boost contrast
# "bright"   = desaturated but lifted brightness, clarity

segments = [
    # ── ACT 1: NORMALIDAD (0–14s) ────────────────────────────────────────────
    # Color. Slow. Normal life. People with phones but unbothered.
    ("c2",  1.0,  5.0, "color"),   #  0– 5s  slow establishing
    ("c1",  2.0,  4.5, "color"),   #  5– 9.5s
    ("c4",  4.0,  4.5, "color"),   #  9.5–14s

    # ── ACT 2: SOBRECARGA (14–34s) ───────────────────────────────────────────
    # B&W enters. Rhythm accelerates. Distraction, multitasking, speed.
    ("c5", 10.0,  3.5, "bw"),      # 14–17.5s  first B&W shock
    ("c3",  1.0,  2.5, "bw"),      # 17.5–20s
    ("c2", 15.0,  2.5, "bw"),      # 20–22.5s
    ("c4", 18.0,  2.0, "bw"),      # 22.5–24.5s
    ("c1", 15.0,  2.0, "bw"),      # 24.5–26.5s
    ("c5", 25.0,  1.5, "bw"),      # 26.5–28s
    ("c3",  8.0,  1.5, "bw"),      # 28–29.5s
    ("c2", 22.0,  1.2, "bw"),      # 29.5–30.7s
    ("c4", 28.0,  1.2, "bw"),      # 30.7–31.9s
    ("c1", 25.0,  1.0, "bw"),      # 31.9–32.9s
    ("c5", 38.0,  1.0, "bw"),      # 32.9–33.9s
    ("c3", 12.0,  0.1, "bw"),      # 33.9–34s

    # ── ACT 3: SATURACIÓN (34–50s) ───────────────────────────────────────────
    # Mechanical, addictive, repetitive. Rapid flashes. Peak chaos.
    ("c5", 45.0,  0.8, "bw_flash"),# 34–34.8s
    ("c2", 30.0,  0.8, "bw_flash"),# 34.8–35.6s
    ("c4", 38.0,  0.8, "bw_flash"),# 35.6–36.4s
    ("c1", 32.0,  0.8, "bw_flash"),# 36.4–37.2s
    ("c3", 18.0,  0.8, "bw_flash"),# 37.2–38s
    ("c5", 52.0,  0.6, "bw_flash"),# 38–38.6s
    ("c2", 36.0,  0.6, "bw_flash"),# 38.6–39.2s
    ("c4", 44.0,  0.6, "bw_flash"),# 39.2–39.8s
    ("c1", 38.0,  0.6, "bw_flash"),# 39.8–40.4s
    ("c5", 58.0,  0.5, "bw_flash"),# 40.4–40.9s
    ("c3", 21.0,  0.5, "bw_flash"),# 40.9–41.4s
    ("c2", 40.0,  0.5, "bw_flash"),# 41.4–41.9s
    ("c4", 50.0,  0.5, "bw_flash"),# 41.9–42.4s
    ("c1", 42.0,  0.5, "bw_flash"),# 42.4–42.9s
    ("c5", 64.0,  0.5, "bw_flash"),# 42.9–43.4s
    ("c3", 23.0,  0.5, "bw_flash"),# 43.4–43.9s
    ("c4", 55.0,  0.5, "bw_flash"),# 43.9–44.4s
    ("c2", 43.0,  0.5, "bw_flash"),# 44.4–44.9s
    ("c5", 70.0,  0.5, "bw_flash"),# 44.9–45.4s
    ("c1", 44.0,  0.5, "bw_flash"),# 45.4–45.9s
    ("c4", 60.0,  0.5, "bw_flash"),# 45.9–46.4s
    ("c5", 75.0,  0.5, "bw_flash"),# 46.4–46.9s
    ("c2", 45.0,  0.5, "bw_flash"),# 46.9–47.4s
    ("c3", 24.0,  0.3, "bw_flash"),# 47.4–47.7s
    ("c4", 62.0,  0.3, "bw_flash"),# 47.7–48s
    # Hard cut to black implied by the drop in act 4
    ("c1", 46.0,  2.0, "bw"),      # 48–50s  deceleration

    # ── ACT 4: CLARIDAD (50–60s) ─────────────────────────────────────────────
    # Everything drops. Slower. Lifted, almost bright. Silence. Atlas Method.
    ("c2",  5.0, 10.0, "bright"),  # 50–60s  clean, calm, resolution
]

# Text overlays: (text, start_sec, end_sec)
TEXT = [
    ("Every second, a new stimulus.",  15.5, 19.5),
    ("Attention became the product.",  28.0, 32.5),
    # Resolución — "mejor rutina" x3 rápido, luego Atlas Method
    ("mejor rutina",                   50.5, 51.8),
    ("mejor rutina",                   52.1, 53.4),
    ("mejor rutina",                   53.7, 55.0),
    ("Atlas Method",                   56.5, 59.5),
]

def grade_filter(grade: str) -> str:
    """Return ffmpeg video filters for the given grade (no brackets)."""
    if grade == "color":
        return (
            "eq=contrast=1.1:brightness=0.02:saturation=1.1,"
            "unsharp=luma_msize_x=3:luma_msize_y=3:luma_amount=0.15"
        )
    elif grade == "bw":
        return (
            "hue=s=0,"
            "eq=contrast=1.45:brightness=-0.06:gamma=0.92,"
            "unsharp=luma_msize_x=5:luma_msize_y=5:luma_amount=0.25,"
            "noise=alls=6:allf=t+u"
        )
    elif grade == "bw_flash":
        return (
            "hue=s=0,"
            "eq=contrast=1.7:brightness=-0.1:gamma=0.85,"
            "unsharp=luma_msize_x=7:luma_msize_y=7:luma_amount=0.4,"
            "noise=alls=12:allf=t+u"
        )
    elif grade == "bright":
        return (
            "hue=s=0,"
            "eq=contrast=1.1:brightness=0.12:gamma=1.15,"
            "unsharp=luma_msize_x=3:luma_msize_y=3:luma_amount=0.1"
        )
    return ""


def build():
    inputs_map = {}
    input_files = []
    for seg in segments:
        key = seg[0]
        if key not in inputs_map:
            inputs_map[key] = len(input_files)
            input_files.append(CLIPS[key])

    filter_lines = []
    seg_video_labels = []
    seg_audio_labels = []

    for i, (key, start, dur, grade) in enumerate(segments):
        idx = inputs_map[key]
        vl = f"[s{i}v]"
        al = f"[s{i}a]"
        gf = grade_filter(grade)

        v_filter = (
            f"[{idx}:v]"
            f"trim=start={start}:duration={dur},"
            f"setpts=PTS-STARTPTS,"
            f"fps={FPS},"
            f"scale={W}:{H}:force_original_aspect_ratio=increase,"
            f"crop={W}:{H},"
            + gf +
            f"{vl}"
        )
        a_filter = (
            f"[{idx}:a]"
            f"atrim=start={start}:duration={dur},"
            f"asetpts=PTS-STARTPTS"
            f"{al}"
        )
        filter_lines.append(v_filter)
        filter_lines.append(a_filter)
        seg_video_labels.append(vl)
        seg_audio_labels.append(al)

    n = len(segments)
    # concat expects interleaved [v0][a0][v1][a1]...[vN][aN]
    interleaved = "".join(v + a for v, a in zip(seg_video_labels, seg_audio_labels))
    filter_lines.append(
        f"{interleaved}concat=n={n}:v=1:a=1[rawv][rawa]"
    )

    total_dur = sum(s[2] for s in segments)

    # Global fade in/out
    filter_lines.append(
        f"[rawv]"
        f"fade=t=in:st=0:d=2.0:color=black,"
        f"fade=t=out:st={total_dur - 2.5}:d=2.5:color=black"
        "[faded]"
    )

    # Text overlays
    prev = "faded"
    for j, (txt, ts, te) in enumerate(TEXT):
        lo = f"t{j}"
        is_atlas = "Atlas" in txt
        is_rutina = "rutina" in txt
        fontsize = 58 if is_atlas else (30 if is_rutina else 34)
        y_expr = "h*0.50" if is_atlas else ("h*0.50" if is_rutina else "h*0.78")
        # Escape text for drawtext
        safe = txt.replace("'", "\\'").replace(":", "\\:")
        dt = (
            f"[{prev}]drawtext="
            f"text='{safe}':"
            f"fontcolor=white:"
            f"fontsize={fontsize}:"
            f"font=Arial:"
            f"x=(w-text_w)/2:"
            f"y={y_expr}:"
            f"enable='between(t,{ts},{te})':"
            f"bordercolor=black:borderw=2"
            f"[{lo}]"
        )
        filter_lines.append(dt)
        prev = lo

    # Audio fade
    filter_lines.append(
        f"[rawa]"
        f"afade=t=in:ss=0:d=2.0,"
        f"afade=t=out:st={total_dur - 2.5}:d=2.5"
        "[outa]"
    )

    filter_str = ";\n".join(filter_lines)

    # Write filter to file to avoid shell-escaping issues
    script_path = f"{BASE}/filter.txt"
    with open(script_path, "w") as fh:
        fh.write(filter_str)

    cmd = ["ffmpeg", "-y"]
    for f in input_files:
        cmd += ["-i", f]
    cmd += [
        "-filter_complex_script", script_path,
        "-map", f"[{prev}]",
        "-map", "[outa]",
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "20",
        "-c:a", "aac",
        "-b:a", "192k",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        OUT,
    ]

    print("Rendering Atlas Method v2…")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print("ERROR:\n", result.stderr[-4000:])
    else:
        size = os.path.getsize(OUT) / 1e6
        print(f"Done → {OUT} ({size:.1f} MB, {total_dur:.1f}s)")


if __name__ == "__main__":
    build()
