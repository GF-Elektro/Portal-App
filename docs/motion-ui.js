/* Landing page motion, built on Motion (motion.dev, the vanilla-JS edition of
   Framer Motion), vendored at vendor/motion.min.js.
   Everything here is decoration: if Motion is missing or the visitor prefers
   reduced motion, the page stays fully visible and usable. */
(function () {
    'use strict';

    var root = document.documentElement;
    var M = window.Motion;

    if (!root.classList.contains('js-motion')) return;
    if (!M || typeof M.animate !== 'function') {
        root.classList.remove('js-motion');
        return;
    }

    var animate = M.animate;
    var stagger = M.stagger;
    var inView = M.inView;
    var ease = [0.22, 1, 0.36, 1];
    var spring = { type: 'spring', stiffness: 260, damping: 24 };

    function show(el) {
        el.style.opacity = '1';
    }

    /* 1. Hero: copy lines rise in one after another, the app card springs in. */
    function heroIntro() {
        var lines = document.querySelectorAll('.hero-content > *');
        if (lines.length) {
            animate(
                lines,
                { opacity: [0, 1], y: [18, 0], filter: ['blur(6px)', 'blur(0px)'] },
                { duration: 0.7, delay: stagger(0.08, { startDelay: 0.05 }), ease: ease }
            );
        }

        var card = document.querySelector('.glass-card');
        if (card) {
            animate(
                card,
                { opacity: [0, 1], scale: [0.92, 1], y: [24, 0] },
                { type: 'spring', stiffness: 140, damping: 18, delay: 0.25 }
            );
            tilt(card);
        }

        var icon = document.querySelector('.app-icon-large');
        if (icon) {
            animate(icon, { y: [0, -8, 0] }, { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 });
        }
    }

    /* 2. The app card follows the pointer with a gentle 3D tilt. */
    function tilt(card) {
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

        card.addEventListener('pointermove', function (event) {
            var r = card.getBoundingClientRect();
            var px = (event.clientX - r.left) / r.width - 0.5;
            var py = (event.clientY - r.top) / r.height - 0.5;
            animate(
                card,
                { rotateX: -py * 10, rotateY: px * 12, y: -6, transformPerspective: 900 },
                { type: 'spring', stiffness: 220, damping: 20 }
            );
        });

        card.addEventListener('pointerleave', function () {
            animate(card, { rotateX: 0, rotateY: 0, y: 0 }, { type: 'spring', stiffness: 160, damping: 18 });
        });
    }

    /* 3. Sections reveal as they scroll into view; grids stagger their items. */
    function reveals() {
        var singles = document.querySelectorAll('[data-reveal]');
        var groups = document.querySelectorAll('[data-reveal-group]');

        if (typeof inView !== 'function') {
            singles.forEach(show);
            groups.forEach(function (g) { Array.prototype.forEach.call(g.children, show); });
            return;
        }

        singles.forEach(function (el) {
            inView(el, function () {
                animate(el, { opacity: [0, 1], y: [28, 0] }, { duration: 0.75, ease: ease });
            }, { amount: 0.2 });
        });

        groups.forEach(function (group) {
            inView(group, function () {
                animate(
                    Array.prototype.slice.call(group.children),
                    { opacity: [0, 1], y: [32, 0], scale: [0.97, 1] },
                    { duration: 0.7, delay: stagger(0.09), ease: ease }
                );
            }, { amount: 0.15 });
        });
    }

    /* 4. Cards and badges lift with a spring on hover and press. */
    function hoverSprings() {
        if (!window.matchMedia('(hover: hover)').matches) return;

        var lift = document.querySelectorAll('.store-card, .feature-card, .resource-card');
        lift.forEach(function (el) {
            el.addEventListener('pointerenter', function () { animate(el, { y: -4 }, spring); });
            el.addEventListener('pointerleave', function () { animate(el, { y: 0 }, spring); });
        });

        var press = document.querySelectorAll('.official-store-badge, .testflight-badge, .ms-store-badge, .download-row .btn');
        press.forEach(function (el) {
            el.addEventListener('pointerenter', function () { animate(el, { scale: 1.03 }, spring); });
            el.addEventListener('pointerleave', function () { animate(el, { scale: 1 }, spring); });
            el.addEventListener('pointerdown', function () { animate(el, { scale: 0.97 }, { type: 'spring', stiffness: 500, damping: 30 }); });
            el.addEventListener('pointerup', function () { animate(el, { scale: 1.03 }, spring); });
        });
    }

    /* 5. Download option panels (Windows / Linux / Android) slide in when opened. */
    function panels() {
        var observer = new MutationObserver(function (records) {
            records.forEach(function (record) {
                var panel = record.target;
                if (panel.hidden) return;
                animate(panel, { opacity: [0, 1], y: [-8, 0] }, { duration: 0.35, ease: ease });
                var options = panel.querySelectorAll('.linux-option');
                if (options.length) {
                    animate(options, { opacity: [0, 1], y: [10, 0] }, { duration: 0.4, delay: stagger(0.05, { startDelay: 0.05 }), ease: ease });
                }
            });
        });
        document.querySelectorAll('.linux-options').forEach(function (panel) {
            observer.observe(panel, { attributes: true, attributeFilter: ['hidden'] });
        });
    }

    /* 6. Stagger the shine sweeps so the badges don't flash in unison. */
    function shineOffsets() {
        document.querySelectorAll('.shine').forEach(function (el, i) {
            el.style.setProperty('--shine-delay', (1.4 + i * 0.35).toFixed(2) + 's');
        });
    }

    function start() {
        root.classList.add('motion-ready');
        shineOffsets();
        heroIntro();
        reveals();
        hoverSprings();
        panels();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();
