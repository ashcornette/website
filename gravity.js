// gravity.js — physics simulation for ashcornette.com
// Adapted from renecoignard.com

const GRAVITY          = 0.25;
const PENDULUM_DELAY   = 1250;
const PENDULUM_RELEASE = 8000;
const RESTITUTION_TEXT = 0.2;
const FRICTION_TEXT    = 0.007;
const AIR_TEXT         = 0.001;
const WALL_THICKNESS   = 50;

const {
    Engine, Bodies, Body, Composite, Runner,
    Mouse, MouseConstraint, Constraint, Events
} = Matter;

const canvas = document.querySelector('canvas');
const svg    = document.querySelector('svg');
const dpr    = window.devicePixelRatio || 1;
const ctx    = canvas.getContext('2d');

let hoveredLink  = null;
let mouseDownPos = null;

const hitTest = (b, cx, cy) => {
    const dx = cx - b.position.x;
    const dy = cy - b.position.y;
    const cos = Math.cos(-b.angle);
    const sin = Math.sin(-b.angle);
    const lx = dx * cos - dy * sin;
    const ly = dx * sin + dy * cos;
    return Math.abs(lx) < b._meta.w / 2 + 5 && Math.abs(ly) < b._meta.h / 2 + 5;
};

const fontSize = Math.max(14, Math.round(innerWidth * 0.014));
const measure  = document.createElement('canvas').getContext('2d');
measure.font   = `200 ${fontSize}px "IBM Plex Mono", monospace`;

const items = [...document.querySelectorAll('svg text')].reduce((acc, el) => {
    const r = el.getBoundingClientRect();
    if (!r.width && !r.height) return acc;
    const a     = el.closest('a');
    const ctm   = el.getScreenCTM();
    const label = el.textContent.trim();
    acc.push({
        label,
        x:      r.left + r.width  / 2,
        y:      r.top  + r.height / 2,
        w:      Math.max(measure.measureText(label).width, 20),
        h:      Math.max(fontSize * 1.4, 20),
        angle:  ctm ? Math.atan2(ctm.b, ctm.a) : 0,
        isLink: !!a,
        href:   a ? a.getAttribute('href') : null,
        fill:   a ? '#111' : '#7e7e7e',
    });
    return acc;
}, []);

const resizeCanvas = () => {
    canvas.width        = innerWidth  * dpr;
    canvas.height       = innerHeight * dpr;
    canvas.style.width  = `${innerWidth}px`;
    canvas.style.height = `${innerHeight}px`;
    ctx.scale(dpr, dpr);
};

document.body.classList.add('physics-active');
resizeCanvas();

const engine = Engine.create({ gravity: { y: GRAVITY } });
Runner.run(Runner.create(), engine);

const wall = (x, y, w, h) => Bodies.rectangle(x, y, w, h, { isStatic: true });
Composite.add(engine.world, [
    wall(innerWidth / 2, innerHeight + WALL_THICKNESS / 2, innerWidth  * 2, WALL_THICKNESS),
    wall(innerWidth / 2,              -WALL_THICKNESS / 2, innerWidth  * 2, WALL_THICKNESS),
    wall(            -WALL_THICKNESS / 2, innerHeight / 2, WALL_THICKNESS,  innerHeight * 2),
    wall(innerWidth + WALL_THICKNESS / 2, innerHeight / 2, WALL_THICKNESS,  innerHeight * 2),
]);

const bodies = items.map(item => {
    const b = Bodies.rectangle(item.x, item.y, item.w, item.h, {
        restitution: RESTITUTION_TEXT,
        friction:    FRICTION_TEXT,
        frictionAir: AIR_TEXT,
        angle: item.angle,
    });
    b._meta = item;
    Body.setStatic(b, true);
    return b;
});
Composite.add(engine.world, bodies);

const linkBodies = bodies.filter(b =>  b._meta.isLink);
const wordBodies = bodies.filter(b => !b._meta.isLink);

// word bodies remain permanently static — they act as anchors/obstacles
// only links participate in the chain reaction
const sortedLinks  = [...linkBodies].sort((a, b) => a.position.y - b.position.y);
const contactBody  = sortedLinks[0];
const staticBodies = new Set(sortedLinks.slice(1));
linkBodies.forEach(b => { b._isActive = true; });

const drop = b => {
    Body.setStatic(b, false);
    Body.setVelocity(b, { x: 0, y: 0 });
    Body.setAngularVelocity(b, 0);
    b.positionImpulse.x = 0;
    b.positionImpulse.y = 0;
};

setTimeout(() => {
    Body.setStatic(contactBody, false);
    Body.setVelocity(contactBody, { x: 0, y: 0 });

    const lx = contactBody._meta.w / 2;
    const ly = contactBody._meta.h / 2;

    const pendulum = Constraint.create({
        pointA: { x: contactBody.position.x + lx, y: contactBody.position.y - ly },
        bodyB:  contactBody,
        pointB: { x: lx, y: -ly },
        stiffness: 0.02,
        damping:   0.01,
        length:    0,
    });

    Composite.add(engine.world, pendulum);
    Body.setVelocity(contactBody, { x: 0, y: 0 });

    setTimeout(() => {
        Composite.remove(engine.world, pendulum);
        drop(contactBody);
    }, PENDULUM_RELEASE);
}, PENDULUM_DELAY);

Composite.add(engine.world, MouseConstraint.create(engine, {
    mouse: (() => { const m = Mouse.create(canvas); m.pixelRatio = dpr; return m; })(),
    constraint: { stiffness: 0.2 },
}));

Events.on(engine, 'collisionStart', ({ pairs }) => {
    pairs.forEach(({ bodyA: a, bodyB: b }) => {
        if (a._isActive && !a.isStatic && staticBodies.has(b)) {
            staticBodies.delete(b);
            b._isActive = true;
            drop(b);
        }
        if (b._isActive && !b.isStatic && staticBodies.has(a)) {
            staticBodies.delete(a);
            a._isActive = true;
            drop(a);
        }
    });
});

canvas.addEventListener('mousedown', ({ clientX: cx, clientY: cy }) => {
    mouseDownPos = { x: cx, y: cy };
});

canvas.addEventListener('click', ({ clientX: cx, clientY: cy }) => {
    if (!mouseDownPos) return;
    const dx = cx - mouseDownPos.x;
    const dy = cy - mouseDownPos.y;
    if (dx * dx + dy * dy > 25) return;
    const hit = linkBodies.find(b => hitTest(b, cx, cy));
    if (!hit) return;
    const href = hit._meta.href;
    if (href.startsWith('http') || href.startsWith('//')) window.open(href, '_blank');
    else location.href = href;
});

canvas.addEventListener('mousemove', ({ clientX: cx, clientY: cy }) => {
    hoveredLink = linkBodies.find(b => hitTest(b, cx, cy));
    canvas.style.cursor = hoveredLink ? 'pointer' : 'default';
});

window.addEventListener('resize', resizeCanvas);

const underlineH = Math.max(1, Math.round(fontSize * 0.07));
const underlineY = Math.round(fontSize * 0.44);

const loop = () => {
    Engine.update(engine, 1000 / 60);

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, innerWidth, innerHeight);

    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.font         = `200 ${fontSize}px "IBM Plex Mono", monospace`;

    bodies.forEach(b => {
        const m = b._meta;
        ctx.save();
        ctx.translate(b.position.x, b.position.y);
        ctx.rotate(b.angle);
        ctx.fillStyle = m.fill;
        if (m.isLink && b !== hoveredLink) {
            ctx.fillRect(-m.w / 2, underlineY, m.w, underlineH);
        }
        ctx.fillText(m.label, 0, 0);
        ctx.restore();
    });

    requestAnimationFrame(loop);
};

requestAnimationFrame(loop);
