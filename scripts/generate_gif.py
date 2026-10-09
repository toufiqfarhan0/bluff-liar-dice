import os
import math
from PIL import Image, ImageDraw, ImageFont

def create_table_gif(output_path="public/bluff-table-animation.gif"):
    SCALE = 2
    FINAL_W, FINAL_H = 540, 540
    W, H = FINAL_W * SCALE, FINAL_H * SCALE
    cx, cy = W // 2, H // 2
    table_radius = 210 * SCALE

    # Fonts scaled 2x
    font_bold_xl = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 38 * SCALE)
    font_bold_lg = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 22 * SCALE)
    font_bold_md = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 16 * SCALE)
    font_bold_sm = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 13 * SCALE)
    font_bold_xs = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 11 * SCALE)
    font_regular_sm = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 13 * SCALE)
    font_regular_xs = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 11 * SCALE)

    # Dice dot layout helper
    def draw_die(draw, x, y, size, face):
        r = size // 5
        draw.rounded_rectangle([x, y, x + size, y + size], radius=r, fill="#ffffff", outline="#e6e6e6", width=2 * SCALE)
        dot_r = max(2 * SCALE, size // 9)
        dot_color = "#181818"
        mid = size // 2
        p1 = size // 4 + 2 * SCALE
        p2 = size * 3 // 4 - 2 * SCALE

        dots = []
        if face == 1:
            dots = [(mid, mid)]
        elif face == 2:
            dots = [(p1, p1), (p2, p2)]
        elif face == 3:
            dots = [(p1, p1), (mid, mid), (p2, p2)]
        elif face == 4:
            dots = [(p1, p1), (p2, p1), (p1, p2), (p2, p2)]
        elif face == 5:
            dots = [(p1, p1), (p2, p1), (mid, mid), (p1, p2), (p2, p2)]
        elif face == 6:
            dots = [(p1, p1), (p2, p1), (p1, mid), (p2, mid), (p1, p2), (p2, p2)]

        for dx, dy in dots:
            draw.ellipse([x + dx - dot_r, y + dy - dot_r, x + dx + dot_r, y + dy + dot_r], fill=dot_color)

    # Seated players around felt table
    players = [
        {"name": "You", "letter": "F", "angle": -math.pi / 2, "dice": 4, "is_you": True},
        {"name": "Viper", "letter": "V", "angle": 0, "dice": 5, "is_you": False},
        {"name": "Mila", "letter": "M", "angle": math.pi / 2, "dice": 5, "is_you": False},
        {"name": "0xTeo", "letter": "X", "angle": math.pi, "dice": 5, "is_you": False},
    ]

    states = [
        # Step 1: You bid 1 Twos, turn on Viper
        {
            "active": 1,
            "actions": {0: "Bid 1 Twos"},
            "bid": (1, 2, "You", "1 Twos"),
            "clock": 19,
            "total_dice": 19,
            "duration": 1800,
        },
        {
            "active": 1,
            "actions": {0: "Bid 1 Twos"},
            "bid": (1, 2, "You", "1 Twos"),
            "clock": 16,
            "total_dice": 19,
            "duration": 1200,
        },
        # Step 2: Viper raises to 2 Twos, turn on Mila
        {
            "active": 2,
            "actions": {1: "Bid 2 Twos"},
            "bid": (2, 2, "Viper", "2 Twos"),
            "clock": 20,
            "total_dice": 19,
            "duration": 1600,
        },
        {
            "active": 2,
            "actions": {1: "Bid 2 Twos"},
            "bid": (2, 2, "Viper", "2 Twos"),
            "clock": 17,
            "total_dice": 19,
            "duration": 1200,
        },
        # Step 3: Mila raises to 3 Fours, turn on 0xTeo
        {
            "active": 3,
            "actions": {2: "Bid 3 Fours"},
            "bid": (3, 4, "Mila", "3 Fours"),
            "clock": 19,
            "total_dice": 19,
            "duration": 1600,
        },
        {
            "active": 3,
            "actions": {2: "Bid 3 Fours"},
            "bid": (3, 4, "Mila", "3 Fours"),
            "clock": 16,
            "total_dice": 19,
            "duration": 1200,
        },
        # Step 4: 0xTeo raises to 4 Fours, turn on You
        {
            "active": 0,
            "actions": {3: "Bid 4 Fours"},
            "bid": (4, 4, "0xTeo", "4 Fours"),
            "clock": 20,
            "total_dice": 19,
            "duration": 1600,
        },
        {
            "active": 0,
            "actions": {3: "Bid 4 Fours"},
            "bid": (4, 4, "0xTeo", "4 Fours"),
            "clock": 18,
            "total_dice": 19,
            "duration": 1200,
        },
        # Step 5: You call BLUFF! Showdown
        {
            "active": -1,
            "actions": {0: "Called BLUFF!"},
            "bid": (4, 4, "0xTeo", "4 Fours"),
            "clock": 0,
            "total_dice": 19,
            "showdown": True,
            "duration": 3000,
        },
    ]

    frames = []

    for state in states:
        im = Image.new("RGBA", (W, H), (12, 15, 11, 255))
        draw = ImageDraw.Draw(im)

        # Card container with rounded border
        draw.rounded_rectangle(
            [15 * SCALE, 15 * SCALE, W - 15 * SCALE, H - 15 * SCALE],
            radius=24 * SCALE,
            fill="#0f140d",
            outline="#1e2617",
            width=2 * SCALE,
        )

        # Outer felt circle
        draw.ellipse(
            [cx - table_radius, cy - table_radius, cx + table_radius, cy + table_radius],
            fill="#0e150b",
            outline="#2e3b23",
            width=3 * SCALE,
        )
        # Inner decorative felt ring
        inner_r = table_radius - 35 * SCALE
        draw.ellipse(
            [cx - inner_r, cy - inner_r, cx + inner_r, cy + inner_r],
            outline="#232f1b",
            width=2 * SCALE,
        )

        # Draw seated players
        seat_dist = 148 * SCALE
        for i, p in enumerate(players):
            px = int(cx + math.cos(p["angle"]) * seat_dist)
            py = int(cy + math.sin(p["angle"]) * seat_dist)
            is_active = (i == state["active"])

            # Active glow halo
            if is_active:
                for glow_r in range(36 * SCALE, 23 * SCALE, -2 * SCALE):
                    alpha = int(75 * (glow_r - 23 * SCALE) / (13 * SCALE))
                    draw.ellipse(
                        [px - glow_r, py - glow_r, px + glow_r, py + glow_r],
                        outline=(251, 213, 61, alpha),
                        width=2 * SCALE,
                    )

            # Avatar circle
            border_color = "#FBD53D" if (p["is_you"] or is_active) else "#d97706"
            draw.ellipse(
                [px - 24 * SCALE, py - 24 * SCALE, px + 24 * SCALE, py + 24 * SCALE],
                fill="#1c2415",
                outline=border_color,
                width=3 * SCALE,
            )

            # Letter in avatar
            letter_color = "#FBD53D" if p["is_you"] else "#f1f4ec"
            letter_bbox = draw.textbbox((0, 0), p["letter"], font=font_bold_lg)
            lw = letter_bbox[2] - letter_bbox[0]
            lh = letter_bbox[3] - letter_bbox[1]
            draw.text((px - lw // 2, py - lh // 2 - 2 * SCALE), p["letter"], fill=letter_color, font=font_bold_lg)

            # Dice badge
            bx, by = px + 14 * SCALE, py + 14 * SCALE
            draw.ellipse(
                [bx - 11 * SCALE, by - 11 * SCALE, bx + 11 * SCALE, by + 11 * SCALE],
                fill="#12160e",
                outline="#FBD53D",
                width=2 * SCALE,
            )
            dice_txt = str(p["dice"])
            dbbox = draw.textbbox((0, 0), dice_txt, font=font_bold_xs)
            draw.text(
                (bx - (dbbox[2] - dbbox[0]) // 2, by - (dbbox[3] - dbbox[1]) // 2 - 1 * SCALE),
                dice_txt,
                fill="#FBD53D",
                font=font_bold_xs,
            )

            # Name below avatar
            name_color = "#FBD53D" if p["is_you"] else "#f1f4ec"
            nbbox = draw.textbbox((0, 0), p["name"], font=font_bold_sm)
            nw = nbbox[2] - nbbox[0]
            name_y = py + 28 * SCALE
            draw.text((px - nw // 2, name_y), p["name"], fill=name_color, font=font_bold_sm)

            # Action pill below name
            action_text = state["actions"].get(i)
            if action_text:
                abbox = draw.textbbox((0, 0), action_text, font=font_bold_xs)
                aw = abbox[2] - abbox[0] + 18 * SCALE
                ah = 20 * SCALE
                pill_x = px - aw // 2
                pill_y = name_y + 20 * SCALE
                bg_col = "#2a120d" if "BLUFF" in action_text else "#1b2214"
                bd_col = "#f2603c" if "BLUFF" in action_text else "#2f3a22"
                txt_col = "#f2603c" if "BLUFF" in action_text else "#FBD53D"
                draw.rounded_rectangle(
                    [pill_x, pill_y, pill_x + aw, pill_y + ah],
                    radius=10 * SCALE,
                    fill=bg_col,
                    outline=bd_col,
                    width=2 * SCALE,
                )
                draw.text(
                    (px - (abbox[2] - abbox[0]) // 2, pill_y + 2 * SCALE),
                    action_text,
                    fill=txt_col,
                    font=font_bold_xs,
                )

        # Center Table Display
        if state.get("showdown"):
            sb_w, sb_h = 210 * SCALE, 120 * SCALE
            draw.rounded_rectangle(
                [cx - sb_w // 2, cy - sb_h // 2, cx + sb_w // 2, cy + sb_h // 2],
                radius=18 * SCALE,
                fill="#1c120c",
                outline="#f2603c",
                width=2 * SCALE,
            )
            t1 = "SHOWDOWN"
            t1_b = draw.textbbox((0, 0), t1, font=font_bold_sm)
            draw.text((cx - (t1_b[2] - t1_b[0]) // 2, cy - 45 * SCALE), t1, fill="#f2603c", font=font_bold_sm)

            t2 = "CUPS LIFTED"
            t2_b = draw.textbbox((0, 0), t2, font=font_bold_xs)
            draw.text((cx - (t2_b[2] - t2_b[0]) // 2, cy - 25 * SCALE), t2, fill="#98a08e", font=font_bold_xs)

            t3 = "Found 5 Fours on table"
            t3_b = draw.textbbox((0, 0), t3, font=font_bold_sm)
            draw.text((cx - (t3_b[2] - t3_b[0]) // 2, cy - 3 * SCALE), t3, fill="#FBD53D", font=font_bold_sm)

            t4 = "Bid was Good · You lost 1 die"
            t4_b = draw.textbbox((0, 0), t4, font=font_regular_xs)
            draw.text((cx - (t4_b[2] - t4_b[0]) // 2, cy + 20 * SCALE), t4, fill="#f1f4ec", font=font_regular_xs)

            t5 = "Next round starting..."
            t5_b = draw.textbbox((0, 0), t5, font=font_bold_xs)
            draw.text((cx - (t5_b[2] - t5_b[0]) // 2, cy + 38 * SCALE), t5, fill="#98a08e", font=font_bold_xs)
        else:
            # 1. "CURRENT BID"
            hdr = "CURRENT BID"
            h_bbox = draw.textbbox((0, 0), hdr, font=font_bold_xs)
            draw.text((cx - (h_bbox[2] - h_bbox[0]) // 2, cy - 64 * SCALE), hdr, fill="#6b7362", font=font_bold_xs)

            # 2. Big quantity number + Die icon
            qty_str = str(state["bid"][0])
            q_bbox = draw.textbbox((0, 0), qty_str, font=font_bold_xl)
            qw = q_bbox[2] - q_bbox[0]
            die_size = 42 * SCALE
            total_w = qw + 12 * SCALE + die_size
            start_x = cx - total_w // 2

            draw.text((start_x, cy - 44 * SCALE), qty_str, fill="#f1f4ec", font=font_bold_xl)
            draw_die(draw, start_x + qw + 12 * SCALE, cy - 38 * SCALE, die_size, state["bid"][1])

            # 3. Bid description e.g. "1 Twos"
            desc = state["bid"][3]
            d_bbox = draw.textbbox((0, 0), desc, font=font_bold_md)
            draw.text((cx - (d_bbox[2] - d_bbox[0]) // 2, cy + 10 * SCALE), desc, fill="#FBD53D", font=font_bold_md)

            # 4. "by <name>"
            by_txt = f"by {state['bid'][2]}"
            by_bbox = draw.textbbox((0, 0), by_txt, font=font_regular_sm)
            draw.text((cx - (by_bbox[2] - by_bbox[0]) // 2, cy + 32 * SCALE), by_txt, fill="#98a08e", font=font_regular_sm)

            # 5. Divider & clock
            draw.line([cx - 50 * SCALE, cy + 54 * SCALE, cx + 50 * SCALE, cy + 54 * SCALE], fill="#232a1b", width=1 * SCALE)
            time_txt = f"{state['clock']}s  ·  {state['total_dice']} dice"
            t_bbox = draw.textbbox((0, 0), time_txt, font=font_regular_xs)
            draw.text((cx - (t_bbox[2] - t_bbox[0]) // 2, cy + 60 * SCALE), time_txt, fill="#6b7362", font=font_regular_xs)

        # Downsample to target size with Lanczos anti-aliasing
        downsampled = im.resize((FINAL_W, FINAL_H), Image.Resampling.LANCZOS)
        frames.append((downsampled.convert("RGB"), state["duration"]))

    images = [f[0] for f in frames]
    durations = [f[1] for f in frames]

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    images[0].save(
        output_path,
        save_all=True,
        append_images=images[1:],
        duration=durations,
        loop=0,
        optimize=True,
    )
    print(f"Generated ultra-crisp animated GIF to {output_path} ({len(images)} frames, {os.path.getsize(output_path)} bytes)")

if __name__ == "__main__":
    create_table_gif()
