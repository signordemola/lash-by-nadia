# Recording a Portfolio Demo: Lash by Nadia

This guide outlines the recommended recording flow and the best tool configurations for capturing a cinematic, high-end product demo of the **Lash by Nadia** booking app on Linux.

---

## 1. The Demo Script (60–90 Seconds)

Keep the video snappy. Edit out long loading pauses to maintain a high-quality presentation.

### Act 1: The Client Funnel (0:00 – 0:45)
1. **The Hook**: Start on the landing hero section. Scroll down smoothly to show the treatment cards.
2. **Treatment Select**: Click **Select** on a service (e.g., *Classic Set*), then click **Continue** (showing Zustand state transition).
3. **Slot Scheduling**: Pick a date, choose a slot, and point out the live **Slot-Hold Timer** block at the top.
4. **Intake Details**: Fill in mock name, email, and phone info. Proceed to the late policy checkbox step.
5. **Deposit Payment**: Show the secure Stripe deposit entry page (mocked for easy checkout testing) and click pay.
6. **Success**: Land on the booking confirmation receipt page.

### Act 2: Responsiveness Highlight (0:45 – 1:00)
1. Resize your window or cut to a pre-recorded mobile viewport frame (375px width).
2. Show how the landing cards stack elegantly, making the Select and price tags full-width.

### Act 3: Owner Admin Panel (1:00 – 1:30)
1. Go to `/login` and sign in.
2. Show **Today's View**: highlight the metrics stats cards (Revenue, Bookings, No-shows) and the weekly glance calendar cards.
3. Show **Data Tables**: click on the **Appointments** and **Clients** routes to show the sorting headers and input searching filter.
4. Show the mobile drawer: toggle mobile width in devtools to show the hamburger menu sliding in the styled sidebar drawer.

---

## 2. Screen Studio Alternatives for Linux

*Screen Studio* is currently macOS-exclusive, but you can achieve the exact same cinematic results (smooth panning, auto-zooms, and custom canvas backgrounds) on Linux using these methods:

### Method A: Web-Based Cinematic Recorders (Easiest)
Web-based recorders run directly inside Chrome/Firefox on Linux and have built-in editor capabilities:
* **Tella.tv**: The closest web-based alternative to Screen Studio. It lets you record your screen, automatically adds polished browser frames, allows you to change aspect ratios, and lets you crop/zoom easily in the browser.
* **Loom.com**: Good for quick recordings with a round camera bubble, though it lacks auto-zooms.

### Method B: OBS Studio + Linux Plugins (Advanced & Free)
To get dynamic zooming on Linux during a live recording, you can use OBS Studio (which runs natively on Linux) with helper plugins:
1. **OBS Zoom-to-Mouse**: A popular Python script/plugin for OBS that smoothly pans and zooms your screen capture based on where your cursor moves.
2. **Input Overlay**: An OBS plugin that shows your keyboard clicks and mouse presses on screen in a clean, minimalist style.

### Method C: Record raw, Edit in Kdenlive / DaVinci Resolve (High Quality)
Record a raw 1080p or 4K recording using a lightweight GNOME recorder like **Kooha** or **OBS**, then edit it:
1. Create a project with a solid pastel color background (matching the warm rose-gold theme `#FAF9F6`).
2. Layer your raw recording inside a rounded-corner frame (`border-radius: 12px` or crop filter) with a subtle drop-shadow.
3. Manually keyframe the **Scale** and **Position** properties in your editor to smoothly zoom in on buttons or input fields as you type.

---

## 3. Recording Checklist

- [ ] Set browser zoom level to **110%** so text and details are highly legible on small mobile screens.
- [ ] Run `pnpm dev` with the seeded database (`pnpm prisma db seed`) so the dashboard displays mock metrics, appointments, and client records.
- [ ] Hide the Next.js development indicator bubble by inspecting it and setting `display: none !important;` on the dev element wrapper so it looks like a clean production site.
