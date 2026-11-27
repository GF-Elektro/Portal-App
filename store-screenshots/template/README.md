# Store image template

`render.html` lays out the G&F Portal EU store images (captions, red panorama background, device frames, mascot) and `render.mjs` screenshots it in headless Chrome.

This folder holds what the **Snap Store featured banner** needs (`banner` set, 3840×1280, 3:1): the English phone captures for the three phones, the app icon and the mascot. The mascot is cut out of its red photo background in the page itself.

## Render the Snap banner

```bash
node store-screenshots/template/render.mjs store-screenshots/template/out en banner
```

The PNG lands in `store-screenshots/template/out/en/banner/banner.png` (`out/` is git-ignored). Snapcraft takes JPEG or PNG between 720×240 and 4320×1440; the published banner is a 2880×960 JPEG:

```bash
sips -z 960 2880 store-screenshots/template/out/en/banner/banner.png --out /tmp/banner.png && sips -s format jpeg -s formatOptions 90 /tmp/banner.png --out store-screenshots/listing/snap/banner.jpg
```

Layout knobs for the banner can be passed as `?mp=` JSON on `render.html` (`pw` phone width, `x0` first phone x, `mx`/`my`/`ms` mascot centre and size, `tol` cutout tolerance), all as fractions of the canvas.

## Animated GitHub README banner

`render-gif.mjs` renders the same banner with `?anim=1`: energy packets run along the cable, the nodes flare as they pass, the lightning bolts flicker, the phones float, the mascot moves, a spark runs along the line under the tagline, and a glint sweeps the badge and each phone screen. Every effect is a Web Animation with one shared period, paused and seeked frame by frame, so the GIF loops without a seam.

```bash
node store-screenshots/template/render-gif.mjs store-screenshots/listing/github/banner.gif 1280 15 4800
```

Arguments: output path, width, fps, loop length in ms, language. It needs ImageMagick (`magick`). `COLORS`, `DITHER` and `FUZZ` environment variables tune the encoding (defaults 160, None, 1.5%); the defaults keep the 1280-px GIF around 4.5 MB. A `-poster.png` of the first frame is written next to the GIF.

## Galaxy Store seller page

`gbanner` (2:1, rendered at 1312×648) and `gbg` (the plain panorama, rendered at 2880×2400) are the Seller Portal profile images. They need only the three English phone captures that are already in `shots/en/`.

```bash
node store-screenshots/template/render.mjs store-screenshots/template/out en gbanner,gbg
```

`gwbg` (the plain panorama, rendered at 2048×1000) is the Galaxy Watch brand background, exported as `watch-brand-background.jpg` (1024×500).

Samsung wants JPG under 4 MB: background 1440×1200, profile 240×240, banner 656×324. The exported files are in `store-screenshots/listing/galaxy/` (the profile is `listing/logos/box-1080.png` scaled down).

## Other sets

`render.html` also has the Play, App Store, Microsoft Store, header, search and poster layouts (`?set=play|iphone|ipad|duo|mac|msstore|header|search|poster`). Those need the full set of portal captures under `shots/<lang>/` (`phone-*`, `tablet-*`, `desktop-*`), which are not in the repo. Captures must be anonymised before they are committed: this repo is public.

Needs Google Chrome in `/Applications` and Node 22+ (global `WebSocket`); the Inter font loads from Google Fonts.
