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

## Other sets

`render.html` also has the Play, App Store, Microsoft Store, header, search and poster layouts (`?set=play|iphone|ipad|duo|mac|msstore|header|search|poster`). Those need the full set of portal captures under `shots/<lang>/` (`phone-*`, `tablet-*`, `desktop-*`), which are not in the repo. Captures must be anonymised before they are committed: this repo is public.

Needs Google Chrome in `/Applications` and Node 22+ (global `WebSocket`); the Inter font loads from Google Fonts.
