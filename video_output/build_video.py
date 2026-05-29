#!/usr/bin/env python3
"""
Atlas Method - Cinematic Edit
60s | B&W | High contrast | Grain | Minimal text
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
OUT = f"{BASE}/atlas_method.mp4"
FPS = 30
W, H = 576, 1024

# Each segment: (clip_key, start_sec, duration_sec)
# Structure:
#   INTRO      0-10s  → slow, sparse, fade in
#   ESCALADA  10-35s  → increasing rhythm
#   CLIMAX    35-50s  → rapid fire 0.5s cuts
#   RESOLUCIÓN 50-60s → one clean shot, fade out
segments = [
    # INTRO – slow, breathing
    ("c2", 2.0,  4.5),   # 0–4.5s   first human shot
    ("c1", 1.0,  3.0),   # 4.5–7.5s
    ("c3", 0.5,  2.5),   # 7.5–10s

    # ESCALADA – increasing cuts
    ("c4", 3.0,  3.0),   # 10–13s
    ("c5", 8.0,  2.5),   # 13–15.5s
    ("c1", 12.0, 2.0),   # 15.5–17.5s
    ("c2", 10.0, 2.0),   # 17.5–19.5s
    ("c4", 15.0, 1.5),   # 19.5–21s
    ("c5", 22.0, 1.5),   # 21–22.5s
    ("c3", 8.0,  1.5),   # 22.5–24s
    ("c1", 20.0, 1.5),   # 24–25.5s
    ("c2", 20.0, 1.5),   # 25.5–27s
    ("c5", 35.0, 1.2),   # 27–28.2s
    ("c4", 25.0, 1.2),   # 28.2–29.4s
    ("c1", 28.0, 1.2),   # 29.4–30.6s
    ("c3", 12.0, 1.2),   # 30.6–31.8s
    ("c2", 30.0, 1.0),   # 31.8–32.8s
    ("c5", 45.0, 1.0),   # 32.8–33.8s
    ("c4", 35.0, 1.0),   # 33.8–34.8s
    ("c1", 35.0, 0.2),   # 34.8–35s

    # CLIMAX – rapid fire
    ("c5", 50.0, 0.5),   # 35–35.5s
    ("c2", 38.0, 0.5),   # 35.5–36s
    ("c4", 40.0, 0.5),   # 36–36.5s
    ("c1", 40.0, 0.5),   # 36.5–37s
    ("c3", 15.0, 0.5),   # 37–37.5s
    ("c5", 55.0, 0.5),   # 37.5–38s
    ("c2", 42.0, 0.5),   # 38–38.5s
    ("c4", 45.0, 0.5),   # 38.5–39s
    ("c1", 42.0, 0.5),   # 39–39.5s
    ("c5", 60.0, 0.5),   # 39.5–40s
    ("c3", 18.0, 0.5),   # 40–40.5s
    ("c2", 44.0, 0.5),   # 40.5–41s
    ("c4", 48.0, 0.5),   # 41–41.5s
    ("c1", 44.0, 0.5),   # 41.5–42s
    ("c5", 65.0, 0.5),   # 42–42.5s
    ("c4", 50.0, 0.5),   # 42.5–43s
    ("c2", 46.0, 0.5),   # 43–43.5s
    ("c1", 45.0, 0.5),   # 43.5–44s
    ("c3", 20.0, 0.5),   # 44–44.5s
    ("c5", 70.0, 0.5),   # 44.5–45s
    ("c4", 55.0, 0.5),   # 45–45.5s
    ("c2", 48.0, 0.5),   # 45.5–46s
    ("c1", 46.0, 0.5),   # 46–46.5s
    ("c5", 75.0, 0.5),   # 46.5–47s
    ("c3", 22.0, 0.5),   # 47–47.5s
    ("c4", 60.0, 0.5),   # 47.5–48s
    ("c2", 49.0, 0.5),   # 48–48.5s
    ("c5", 80.0, 0.5),   # 48.5–49s
    ("c1", 47.0, 0.5),   # 49–49.5s
    ("c4", 65.0, 0.5),   # 49.5–50s

    # RESOLUCIÓN – slow, clean, silence
    ("c2", 5.0,  10.0),  # 50–60s   final clean shot
]

# Text overlays: (text, start_sec, end_sec, y_position_ratio)
TEXT = [
    ("We were not designed\nfor infinite stimulation.", 5.0, 9.5, 0.72),
    ("Attention became the product.", 22.0, 26.0, 0.72),
    ("Atlas Method", 52.5, 59.0, 0.75),
]

def build_filter_complex(segments, text_overlays):
    inputs_map = {}  # clip_key -> input index
    input_files = []

    # Map unique clips to input indices
    for seg in segments:
        key = seg[0]
        if key not in inputs_map:
            inputs_map[key] = len(input_files)
            input_files.append(CLIPS[key])

    filter_lines = []
    seg_labels = []

    for i, (key, start, dur) in enumerate(segments):
        idx = inputs_map[key]
        vl = f"[seg{i}v]"
        al = f"[seg{i}a]"

        # Trim, set fps, scale to exact size
        v_filter = (
            f"[{idx}:v]"
            f"trim=start={start}:duration={dur},"
            f"setpts=PTS-STARTPTS,"
            f"fps={FPS},"
            f"scale={W}:{H}:force_original_aspect_ratio=increase,"
            f"crop={W}:{H}"
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
        seg_labels.append((vl, al))

    # Concatenate all segments
    n = len(segments)
    concat_in = "".join(v + a for v, a in seg_labels)
    filter_lines.append(f"{concat_in}concat=n={n}:v=1:a=1[rawv][rawa]")

    # Color grading: B&W + high contrast + grain
    grading = (
        "[rawv]"
        "hue=s=0,"                          # desaturate to B&W
        "eq=contrast=1.45:brightness=-0.05:gamma=0.95,"  # high contrast
        "unsharp=luma_msize_x=5:luma_msize_y=5:luma_amount=0.3,"  # subtle sharpening
        "noise=alls=8:allf=t+u"             # film grain
        "[graded]"
    )
    filter_lines.append(grading)

    # Fade in / fade out on video
    total_dur = sum(s[2] for s in segments)
    fade_filter = (
        f"[graded]"
        f"fade=t=in:st=0:d=1.5:color=black,"
        f"fade=t=out:st={total_dur - 2.0}:d=2.0:color=black"
        "[faded]"
    )
    filter_lines.append(fade_filter)

    # Text overlays – build chain
    prev = "faded"
    for j, (txt, ts, te, yr) in enumerate(text_overlays):
        y_px = int(H * yr)
        label_out = f"txt{j}"
        # Escape colons/apostrophes for drawtext
        safe_txt = txt.replace("'", "’").replace(":", r"\:")
        lines = safe_txt.split("\n")

        current = prev
        for li, line in enumerate(lines):
            y_offset = y_px + li * 48
            lo = f"{label_out}_l{li}"
            dt = (
                f"[{current}]drawtext="
                f"text='{line}':"
                f"fontcolor=white:"
                f"fontsize=36:"
                f"font=Arial:"
                f"x=(w-text_w)/2:"
                f"y={y_offset}:"
                f"alpha='if(gte(t,{ts})*lte(t,{te}),"
                f"if(lt(t,{ts+0.6}),(t-{ts})/{0.6},"
                f"if(gt(t,{te-0.6}),({te}-t)/{0.6},1)),0)':"
                f"bordercolor=black:borderw=2"
                f"[{lo}]"
            )
            filter_lines.append(dt)
            current = lo
        prev = current

    # Audio fade
    filter_lines.append(
        f"[rawa]afade=t=in:ss=0:d=1.5,"
        f"afade=t=out:st={total_dur - 2.0}:d=2.0"
        "[outa]"
    )

    return input_files, filter_lines, f"[{prev}]", "[outa]"


def main():
    input_files, filter_lines, vout, aout = build_filter_complex(segments, TEXT)

    cmd = ["ffmpeg", "-y"]
    for f in input_files:
        cmd += ["-i", f]

    filter_str = ";\n".join(filter_lines)
    cmd += [
        "-filter_complex", filter_str,
        "-map", vout,
        "-map", aout,
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "20",
        "-c:a", "aac",
        "-b:a", "192k",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        OUT
    ]

    # Write command for debug
    with open(f"{BASE}/ffmpeg_cmd.sh", "w") as fh:
        fh.write("ffmpeg -y \\\n")
        for f in input_files:
            fh.write(f"  -i '{f}' \\\n")
        fh.write(f"  -filter_complex '\n{filter_str}\n' \\\n")
        fh.write(f"  -map '{vout}' -map '{aout}' \\\n")
        fh.write(f"  -c:v libx264 -preset medium -crf 20 \\\n")
        fh.write(f"  -c:a aac -b:a 192k -pix_fmt yuv420p \\\n")
        fh.write(f"  '{OUT}'\n")

    print("Running FFmpeg...")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print("STDERR:", result.stderr[-3000:])
    else:
        size = os.path.getsize(OUT) / 1e6
        print(f"Done! {OUT} ({size:.1f} MB)")

if __name__ == "__main__":
    main()
