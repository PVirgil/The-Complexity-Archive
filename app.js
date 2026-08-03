const exhibits = [
  {
    title: "The Shape",
    subtitle: "A finite window into infinite geometric recursion.",
    category: "GEOMETRY",
    score: 98.2,
    body: "This exhibit visualizes a recursively transformed field: points become lines, lines become nested structures, and those structures feed their own output back into the next scale. It is not literally the single most complicated possible shape; it is a candidate chosen to represent geometric complexity through self-similarity, non-linearity, density, and scale.",
    stats: { Information: 96, Structure: 99, Computation: 94, Perception: 100 },
    type: "fractal"
  },
  {
    title: "The Color",
    subtitle: "A color that never occupies just one place in color space.",
    category: "PERCEPTION",
    score: 91.4,
    body: "Human color perception is already a compression system. This exhibit continuously moves through hue, saturation, luminance and local contrast so that the experienced color depends on its neighbors and on time.",
    stats: { Information: 82, Structure: 87, Computation: 91, Perception: 100 },
    type: "color"
  },
  {
    title: "The Pattern",
    subtitle: "Order repeatedly approaching chaos without becoming noise.",
    category: "SYSTEMS",
    score: 95.7,
    body: "A procedural field generates nested structures at multiple scales. Small changes propagate outward, creating a pattern that remains coherent while resisting simple compression.",
    stats: { Information: 95, Structure: 97, Computation: 96, Perception: 94 },
    type: "pattern"
  },
  {
    title: "The Number",
    subtitle: "Magnitude pushed beyond ordinary human intuition.",
    category: "MATHEMATICS",
    score: 99.1,
    body: "Some numbers are not difficult because of their digits, but because the processes required to describe them grow beyond practical representation. This exhibit treats number as structure rather than notation.",
    stats: { Information: 100, Structure: 98, Computation: 100, Perception: 91 },
    type: "number"
  },
  {
    title: "The Machine",
    subtitle: "A system whose output becomes the input to its next state.",
    category: "COMPUTATION",
    score: 97.3,
    body: "Recursive systems can create enormous apparent complexity from compact rules. The machine exhibit visualizes a network whose state continually modifies its own future behavior.",
    stats: { Information: 94, Structure: 98, Computation: 100, Perception: 97 },
    type: "machine"
  },
  {
    title: "The Language",
    subtitle: "Meaning nested inside meaning nested inside meaning.",
    category: "LANGUAGE",
    score: 93.8,
    body: "Language can encode recursion, ambiguity, context and references to itself. This exhibit treats language as a living graph of relationships rather than a simple sequence of words.",
    stats: { Information: 97, Structure: 96, Computation: 88, Perception: 94 },
    type: "language"
  }
];

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];


/* =========================================================
   CANVAS HELPERS
   ========================================================= */

function fitCanvas(canvas) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();

  const width = Math.max(1, Math.floor(rect.width * dpr));
  const height = Math.max(1, Math.floor(rect.height * dpr));

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }

  return {
    ctx: canvas.getContext("2d"),
    width,
    height,
    dpr
  };
}

function clearCanvas(canvas) {
  const { ctx, width, height } = fitCanvas(canvas);
  ctx.clearRect(0, 0, width, height);
  return { ctx, width, height };
}


/* =========================================================
   HERO ORBITS
   ========================================================= */

/*
The hero uses TWO canvases:

orbit-canvas
    z-index: 1
    draws orbit sections and dots that are BEHIND the orb.

orbit-front-canvas
    z-index: 3
    draws orbit sections and dots that are IN FRONT of the orb.

The DOM orb itself is z-index: 2.

This guarantees:

rear orbit
↓
ORB
↓
front orbit

instead of trying to fake depth using CSS clip-path.
*/

const orbitCanvas = $("#orbit-canvas");

let frontOrbitCanvas = null;
let orbitCtx = null;
let frontOrbitCtx = null;


/*
Rotate a 3D point around X, Y and Z.
*/

function rotate3D(x, y, z, rx, ry, rz) {
  const cosX = Math.cos(rx);
  const sinX = Math.sin(rx);

  const cosY = Math.cos(ry);
  const sinY = Math.sin(ry);

  const cosZ = Math.cos(rz);
  const sinZ = Math.sin(rz);

  /* X rotation */

  const y1 = y * cosX - z * sinX;
  const z1 = y * sinX + z * cosX;
  const x1 = x;

  /* Y rotation */

  const x2 = x1 * cosY + z1 * sinY;
  const z2 = -x1 * sinY + z1 * cosY;
  const y2 = y1;

  /* Z rotation */

  const x3 = x2 * cosZ - y2 * sinZ;
  const y3 = x2 * sinZ + y2 * cosZ;

  return {
    x: x3,
    y: y3,
    z: z2
  };
}


/*
Generate points around one actual ellipse.

Every point has:

x = screen position
y = screen position
z = depth

z < 0 = behind orb
z >= 0 = in front of orb
*/

function generateOrbit({
  cx,
  cy,
  radiusX,
  radiusY,
  rotateX,
  rotateY,
  rotateZ,
  phase,
  segments = 320
}) {
  const points = [];

  for (let i = 0; i <= segments; i++) {
    const angle =
      (i / segments) * Math.PI * 2 +
      phase;

    const localX =
      Math.cos(angle) * radiusX;

    const localY =
      Math.sin(angle) * radiusY;

    const point = rotate3D(
      localX,
      localY,
      0,
      rotateX,
      rotateY,
      rotateZ
    );

    points.push({
      x: cx + point.x,
      y: cy + point.y,
      z: point.z
    });
  }

  return points;
}


/*
Draw only one depth side of an orbit.

front = false:
draw only points behind the sphere.

front = true:
draw only points in front of the sphere.
*/

function drawDepthHalf(
  ctx,
  points,
  front,
  color,
  lineWidth
) {
  ctx.beginPath();

  let active = false;

  for (let i = 0; i < points.length; i++) {
    const point = points[i];

    const pointIsFront =
      point.z >= 0;

    if (pointIsFront !== front) {
      active = false;
      continue;
    }

    if (!active) {
      ctx.moveTo(
        point.x,
        point.y
      );

      active = true;
    } else {
      ctx.lineTo(
        point.x,
        point.y
      );
    }
  }

  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";

  ctx.stroke();
}


/*
Return the exact location of a moving dot
on the same ellipse used to draw the orbit.
*/

function orbitPoint(
  cx,
  cy,
  radiusX,
  radiusY,
  rotateX,
  rotateY,
  rotateZ,
  angle
) {
  const localX =
    Math.cos(angle) * radiusX;

  const localY =
    Math.sin(angle) * radiusY;

  const point = rotate3D(
    localX,
    localY,
    0,
    rotateX,
    rotateY,
    rotateZ
  );

  return {
    x: cx + point.x,
    y: cy + point.y,
    z: point.z
  };
}


/*
Green satellite.
*/

function drawOrbitDot(
  ctx,
  point,
  dpr
) {
  ctx.save();

  ctx.fillStyle = "#d7ff63";

  ctx.shadowColor =
    "rgba(215,255,99,.95)";

  ctx.shadowBlur =
    12 * dpr;

  ctx.beginPath();

  ctx.arc(
    point.x,
    point.y,
    4 * dpr,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.restore();
}


/*
Create the canvas that sits ABOVE the orb.
*/

function createFrontOrbitCanvas() {
  if (!orbitCanvas) return;

  if ($("#orbit-front-canvas")) {
    frontOrbitCanvas =
      $("#orbit-front-canvas");

    frontOrbitCtx =
      frontOrbitCanvas.getContext("2d");

    return;
  }

  frontOrbitCanvas =
    document.createElement("canvas");

  frontOrbitCanvas.id =
    "orbit-front-canvas";

  frontOrbitCanvas.setAttribute(
    "aria-hidden",
    "true"
  );

  Object.assign(
    frontOrbitCanvas.style,
    {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      zIndex: "3",
      pointerEvents: "none"
    }
  );

  orbitCanvas.parentElement.appendChild(
    frontOrbitCanvas
  );

  frontOrbitCtx =
    frontOrbitCanvas.getContext("2d");
}


/*
Resize both orbit canvases.
*/

function sizeOrbitCanvases() {
  if (!orbitCanvas) return null;

  const rect =
    orbitCanvas.getBoundingClientRect();

  const dpr =
    Math.min(
      window.devicePixelRatio || 1,
      2
    );

  const width =
    Math.max(
      1,
      Math.round(rect.width * dpr)
    );

  const height =
    Math.max(
      1,
      Math.round(rect.height * dpr)
    );

  if (
    orbitCanvas.width !== width ||
    orbitCanvas.height !== height
  ) {
    orbitCanvas.width = width;
    orbitCanvas.height = height;
  }

  if (frontOrbitCanvas) {
    if (
      frontOrbitCanvas.width !== width ||
      frontOrbitCanvas.height !== height
    ) {
      frontOrbitCanvas.width = width;
      frontOrbitCanvas.height = height;
    }
  }

  return {
    width,
    height,
    dpr
  };
}


/*
Main orbit renderer.
*/

function renderHeroOrbits(time = 0) {
  if (
    !orbitCanvas ||
    !frontOrbitCanvas
  ) {
    return;
  }

  const dimensions =
    sizeOrbitCanvases();

  if (!dimensions) return;

  const {
    width,
    height,
    dpr
  } = dimensions;

  orbitCtx =
    orbitCanvas.getContext("2d");

  frontOrbitCtx =
    frontOrbitCanvas.getContext("2d");

  orbitCtx.clearRect(
    0,
    0,
    width,
    height
  );

  frontOrbitCtx.clearRect(
    0,
    0,
    width,
    height
  );

  const cx =
    width / 2;

  const cy =
    height / 2;

  /*
  Scale orbit dimensions according to the
  actual hero area.

  Desktop retains the large original feel.
  Mobile scales naturally.
  */

  const stage =
    Math.min(width, height);

  const orbitScale =
    stage / 480;

  /*
  Three independently tilted orbital planes.

  radiusX / radiusY define the actual ellipse.

  rotateX/Y/Z determine how each ellipse sits
  in three-dimensional space.
  */

  const orbits = [
    {
      radiusX:
        205 * orbitScale,

      radiusY:
        205 * orbitScale,

      rotateX:
        72 * Math.PI / 180,

      rotateY:
        0,

      rotateZ:
        14 * Math.PI / 180,

      phase:
        0,

      dotOffset:
        0,

      dotSpeed:
        0.00048,

      alpha:
        .34
    },

    {
      radiusX:
        205 * orbitScale,

      radiusY:
        205 * orbitScale,

      rotateX:
        0,

      rotateY:
        67 * Math.PI / 180,

      rotateZ:
        35 * Math.PI / 180,

      phase:
        1.2,

      dotOffset:
        2.1,

      dotSpeed:
        -0.00040,

      alpha:
        .28
    },

    {
      radiusX:
        240 * orbitScale,

      radiusY:
        240 * orbitScale,

      rotateX:
        58 * Math.PI / 180,

      rotateY:
        35 * Math.PI / 180,

      rotateZ:
        0,

      phase:
        2.4,

      dotOffset:
        4.2,

      dotSpeed:
        0.00031,

      alpha:
        .20
    }
  ];


  /*
  ---------------------------------------------------------
  DRAW REAR HALVES
  ---------------------------------------------------------

  These are on orbitCanvas at z-index 1.

  The DOM orb at z-index 2 naturally covers them.
  */

  orbits.forEach((orbit) => {
    const points =
      generateOrbit({
        cx,
        cy,

        radiusX:
          orbit.radiusX,

        radiusY:
          orbit.radiusY,

        rotateX:
          orbit.rotateX,

        rotateY:
          orbit.rotateY,

        rotateZ:
          orbit.rotateZ,

        /*
        Slowly rotate the entire path without
        ever resetting visibly.
        */

        phase:
          orbit.phase +
          time * 0.00008
      });

    drawDepthHalf(
      orbitCtx,
      points,
      false,
      `rgba(255,255,255,${orbit.alpha})`,
      1.15 * dpr
    );
  });


  /*
  ---------------------------------------------------------
  DRAW FRONT HALVES
  ---------------------------------------------------------

  These are on orbit-front-canvas at z-index 3,
  which is ABOVE the orb.
  */

  orbits.forEach((orbit) => {
    const points =
      generateOrbit({
        cx,
        cy,

        radiusX:
          orbit.radiusX,

        radiusY:
          orbit.radiusY,

        rotateX:
          orbit.rotateX,

        rotateY:
          orbit.rotateY,

        rotateZ:
          orbit.rotateZ,

        phase:
          orbit.phase +
          time * 0.00008
      });

    drawDepthHalf(
      frontOrbitCtx,
      points,
      true,
      `rgba(255,255,255,${orbit.alpha + .16})`,
      1.2 * dpr
    );
  });


  /*
  ---------------------------------------------------------
  GREEN DOTS
  ---------------------------------------------------------

  These do NOT orbit around the sphere.

  Their X/Y position is calculated directly
  from the exact ellipse equation.

  Therefore every green dot physically follows
  its corresponding white orbit line.
  */

  orbits.forEach((orbit) => {
    const angle =
      orbit.dotOffset +
      time * orbit.dotSpeed;

    const dot =
      orbitPoint(
        cx,
        cy,

        orbit.radiusX,
        orbit.radiusY,

        orbit.rotateX,
        orbit.rotateY,
        orbit.rotateZ,

        angle
      );

    /*
    If dot.z is positive, the dot is on the
    front side of the orbital plane.

    Draw it above the orb.

    Otherwise draw it behind the orb.
    */

    if (dot.z >= 0) {
      drawOrbitDot(
        frontOrbitCtx,
        dot,
        dpr
      );
    } else {
      drawOrbitDot(
        orbitCtx,
        dot,
        dpr
      );
    }
  });


  requestAnimationFrame(
    renderHeroOrbits
  );
}


/*
Start orbit renderer.
*/

if (orbitCanvas) {
  createFrontOrbitCanvas();

  requestAnimationFrame(
    renderHeroOrbits
  );
}


/* =========================================================
   AMBIENT BACKGROUND
   ========================================================= */

const ambient =
  $("#ambient-canvas");

if (ambient) {
  const ctx =
    ambient.getContext("2d");

  let particles = [];

  function resizeAmbient() {
    const dpr =
      Math.min(
        window.devicePixelRatio || 1,
        2
      );

    ambient.width =
      innerWidth * dpr;

    ambient.height =
      innerHeight * dpr;

    particles =
      Array.from(
        { length: 55 },
        () => ({
          x:
            Math.random() *
            ambient.width,

          y:
            Math.random() *
            ambient.height,

          r:
            Math.random() *
            1.4 *
            dpr +
            .3,

          vx:
            (Math.random() - .5) *
            .08 *
            dpr,

          vy:
            (Math.random() - .5) *
            .08 *
            dpr
        })
      );
  }

  function animateAmbient() {
    ctx.clearRect(
      0,
      0,
      ambient.width,
      ambient.height
    );

    ctx.fillStyle =
      "rgba(255,255,255,.7)";

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) {
        p.x = ambient.width;
      }

      if (p.x > ambient.width) {
        p.x = 0;
      }

      if (p.y < 0) {
        p.y = ambient.height;
      }

      if (p.y > ambient.height) {
        p.y = 0;
      }

      ctx.beginPath();

      ctx.arc(
        p.x,
        p.y,
        p.r,
        0,
        Math.PI * 2
      );

      ctx.fill();
    });

    requestAnimationFrame(
      animateAmbient
    );
  }

  resizeAmbient();

  window.addEventListener(
    "resize",
    resizeAmbient
  );

  animateAmbient();
}


/* =========================================================
   GENERATIVE EXHIBIT VISUALS
   ========================================================= */

function drawFractal(
  canvas,
  time = 0
) {
  const {
    ctx,
    width,
    height
  } = fitCanvas(canvas);

  ctx.clearRect(
    0,
    0,
    width,
    height
  );

  ctx.fillStyle =
    "#08080b";

  ctx.fillRect(
    0,
    0,
    width,
    height
  );

  const cx =
    width / 2;

  const cy =
    height / 2;

  const count = 180;

  for (
    let i = 0;
    i < count;
    i++
  ) {
    const t =
      i / count;

    const angle =
      i * 2.399 +
      time * .0002;

    const radius =
      Math.sqrt(t) *
      Math.min(
        width,
        height
      ) *
      .44;

    const x =
      cx +
      Math.cos(angle) *
      radius;

    const y =
      cy +
      Math.sin(angle) *
      radius;

    const hue =
      160 +
      t * 170 +
      time * .015;

    ctx.fillStyle =
      `hsla(${hue},90%,65%,${.25 + t * .55})`;

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      1 + t * 3,
      0,
      Math.PI * 2
    );

    ctx.fill();
  }
}


function drawColor(
  canvas,
  time = 0
) {
  const {
    ctx,
    width,
    height
  } = fitCanvas(canvas);

  const gradient =
    ctx.createLinearGradient(
      0,
      0,
      width,
      height
    );

  gradient.addColorStop(
    0,
    `hsl(${time * .02 % 360},90%,60%)`
  );

  gradient.addColorStop(
    .35,
    `hsl(${(time * .02 + 90) % 360},95%,62%)`
  );

  gradient.addColorStop(
    .7,
    `hsl(${(time * .02 + 200) % 360},85%,55%)`
  );

  gradient.addColorStop(
    1,
    `hsl(${(time * .02 + 310) % 360},90%,65%)`
  );

  ctx.fillStyle =
    gradient;

  ctx.fillRect(
    0,
    0,
    width,
    height
  );

  const radial =
    ctx.createRadialGradient(
      width * .35,
      height * .3,
      0,
      width * .35,
      height * .3,
      width * .7
    );

  radial.addColorStop(
    0,
    "rgba(255,255,255,.35)"
  );

  radial.addColorStop(
    1,
    "rgba(0,0,0,.45)"
  );

  ctx.fillStyle =
    radial;

  ctx.fillRect(
    0,
    0,
    width,
    height
  );
}


function drawPattern(
  canvas,
  time = 0
) {
  const {
    ctx,
    width,
    height
  } = fitCanvas(canvas);

  ctx.fillStyle =
    "#08080b";

  ctx.fillRect(
    0,
    0,
    width,
    height
  );

  const spacing =
    Math.max(
      16,
      width / 24
    );

  for (
    let x = -spacing;
    x < width + spacing;
    x += spacing
  ) {
    for (
      let y = -spacing;
      y < height + spacing;
      y += spacing
    ) {
      const wave =
        Math.sin(
          x * .015 +
          y * .02 +
          time * .001
        );

      const radius =
        spacing *
        (.12 + Math.abs(wave) * .3);

      ctx.strokeStyle =
        `rgba(215,255,99,${.08 + Math.abs(wave) * .3})`;

      ctx.lineWidth = 1;

      ctx.beginPath();

      ctx.arc(
        x +
        Math.sin(
          time * .0008 +
          y * .01
        ) *
        spacing *
        .35,

        y +
        Math.cos(
          time * .0007 +
          x * .01
        ) *
        spacing *
        .35,

        radius,
        0,
        Math.PI * 2
      );

      ctx.stroke();
    }
  }
}


function drawNumber(
  canvas,
  time = 0
) {
  const {
    ctx,
    width,
    height,
    dpr
  } = fitCanvas(canvas);

  ctx.fillStyle =
    "#08080b";

  ctx.fillRect(
    0,
    0,
    width,
    height
  );

  ctx.font =
    `${12 * dpr}px "Space Mono", monospace`;

  ctx.textBaseline =
    "top";

  const chars =
    "314159265358979323846264338327950288419716939937510";

  const stepX =
    13 * dpr;

  const stepY =
    17 * dpr;

  for (
    let y = 0;
    y < height;
    y += stepY
  ) {
    for (
      let x = 0;
      x < width;
      x += stepX
    ) {
      const index =
        Math.floor(
          x / stepX +
          y / stepY * 17 +
          time * .002
        ) %
        chars.length;

      const value =
        Math.sin(
          x * .01 +
          y * .015 +
          time * .001
        );

      ctx.fillStyle =
        value > .45
          ? "#d7ff63"
          : `rgba(255,255,255,${.08 + Math.abs(value) * .3})`;

      ctx.fillText(
        chars[index],
        x,
        y
      );
    }
  }
}


function drawMachine(
  canvas,
  time = 0
) {
  const {
    ctx,
    width,
    height
  } = fitCanvas(canvas);

  ctx.fillStyle =
    "#08080b";

  ctx.fillRect(
    0,
    0,
    width,
    height
  );

  const nodes =
    Array.from(
      { length: 34 },
      (_, i) => {
        const angle =
          i * 2.399 +
          time * .00008;

        const radius =
          Math.sqrt(i / 34) *
          Math.min(
            width,
            height
          ) *
          .43;

        return {
          x:
            width / 2 +
            Math.cos(angle) *
            radius,

          y:
            height / 2 +
            Math.sin(angle) *
            radius
        };
      }
    );

  ctx.lineWidth = 1;

  for (
    let i = 0;
    i < nodes.length;
    i++
  ) {
    for (
      let j = i + 1;
      j < nodes.length;
      j++
    ) {
      const a =
        nodes[i];

      const b =
        nodes[j];

      const distance =
        Math.hypot(
          a.x - b.x,
          a.y - b.y
        );

      if (
        distance <
        Math.min(
          width,
          height
        ) *
        .2
      ) {
        ctx.strokeStyle =
          `rgba(255,255,255,${Math.max(0, .16 - distance / 1000)})`;

        ctx.beginPath();

        ctx.moveTo(
          a.x,
          a.y
        );

        ctx.lineTo(
          b.x,
          b.y
        );

        ctx.stroke();
      }
    }
  }

  nodes.forEach(
    (node, index) => {
      ctx.fillStyle =
        index % 7 === 0
          ? "#d7ff63"
          : "rgba(255,255,255,.7)";

      ctx.beginPath();

      ctx.arc(
        node.x,
        node.y,
        index % 7 === 0 ? 4 : 2,
        0,
        Math.PI * 2
      );

      ctx.fill();
    }
  );
}


function drawLanguage(
  canvas,
  time = 0
) {
  const {
    ctx,
    width,
    height,
    dpr
  } = fitCanvas(canvas);

  ctx.fillStyle =
    "#08080b";

  ctx.fillRect(
    0,
    0,
    width,
    height
  );

  const words = [
    "SELF",
    "MEANING",
    "RECURSION",
    "CONTEXT",
    "SIGN",
    "REFERENCE",
    "SYNTAX",
    "MEMORY",
    "LANGUAGE",
    "MODEL"
  ];

  ctx.textAlign =
    "center";

  ctx.textBaseline =
    "middle";

  words.forEach(
    (word, i) => {
      const angle =
        i / words.length *
        Math.PI *
        2 +
        time * .0001;

      const radius =
        Math.min(
          width,
          height
        ) *
        (.18 + (i % 3) * .08);

      const x =
        width / 2 +
        Math.cos(angle) *
        radius;

      const y =
        height / 2 +
        Math.sin(angle) *
        radius;

      ctx.font =
        `${(10 + (i % 4) * 3) * dpr}px "Space Mono", monospace`;

      ctx.fillStyle =
        i % 3 === 0
          ? "#d7ff63"
          : "rgba(255,255,255,.55)";

      ctx.fillText(
        word,
        x,
        y
      );
    }
  );
}


function drawVisual(
  canvas,
  type,
  time
) {
  if (!canvas) return;

  switch (type) {
    case "fractal":
      drawFractal(
        canvas,
        time
      );
      break;

    case "color":
      drawColor(
        canvas,
        time
      );
      break;

    case "pattern":
      drawPattern(
        canvas,
        time
      );
      break;

    case "number":
      drawNumber(
        canvas,
        time
      );
      break;

    case "machine":
      drawMachine(
        canvas,
        time
      );
      break;

    case "language":
      drawLanguage(
        canvas,
        time
      );
      break;
  }
}


/* =========================================================
   EXHIBIT CARD ANIMATION
   ========================================================= */

const exhibitCards =
  $$(".exhibit");

function animateExhibits(time) {
  exhibitCards.forEach(
    (card, index) => {
      const canvas =
        $("canvas", card);

      const exhibit =
        exhibits[index];

      if (
        canvas &&
        exhibit
      ) {
        drawVisual(
          canvas,
          exhibit.type,
          time
        );
      }
    }
  );

  requestAnimationFrame(
    animateExhibits
  );
}

if (exhibitCards.length) {
  requestAnimationFrame(
    animateExhibits
  );
}


/* =========================================================
   EXHIBIT DIALOG
   ========================================================= */

const dialog =
  $("#exhibit-dialog");

const dialogClose =
  $(".dialog-close");

const dialogCanvas =
  $("#dialog-canvas");

let activeDialogExhibit =
  null;

let dialogAnimationFrame =
  null;


function populateDialog(
  exhibit
) {
  if (!dialog) return;

  const eyebrow =
    $(".dialog-copy .eyebrow");

  const title =
    $(".dialog-copy h2");

  const subtitle =
    $(".dialog-subtitle");

  const body =
    $(".dialog-copy p:not(.eyebrow):not(.dialog-subtitle)");

  if (eyebrow) {
    eyebrow.textContent =
      exhibit.category;
  }

  if (title) {
    title.textContent =
      exhibit.title;
  }

  if (subtitle) {
    subtitle.textContent =
      exhibit.subtitle;
  }

  if (body) {
    body.textContent =
      exhibit.body;
  }

  const statElements =
    $$(".stat", dialog);

  Object.entries(
    exhibit.stats
  ).forEach(
    ([name, value], index) => {
      const stat =
        statElements[index];

      if (!stat) return;

      const label =
        $("span", stat);

      const strong =
        $("strong", stat);

      if (label) {
        label.textContent =
          name;
      }

      if (strong) {
        strong.textContent =
          value;
      }
    }
  );
}


function animateDialog(time) {
  if (
    !activeDialogExhibit ||
    !dialogCanvas
  ) {
    return;
  }

  drawVisual(
    dialogCanvas,
    activeDialogExhibit.type,
    time
  );

  dialogAnimationFrame =
    requestAnimationFrame(
      animateDialog
    );
}


function openExhibit(index) {
  if (!dialog) return;

  const exhibit =
    exhibits[index];

  if (!exhibit) return;

  activeDialogExhibit =
    exhibit;

  populateDialog(
    exhibit
  );

  dialog.showModal();

  cancelAnimationFrame(
    dialogAnimationFrame
  );

  dialogAnimationFrame =
    requestAnimationFrame(
      animateDialog
    );
}


function closeExhibit() {
  if (!dialog) return;

  activeDialogExhibit =
    null;

  cancelAnimationFrame(
    dialogAnimationFrame
  );

  dialog.close();
}


exhibitCards.forEach(
  (card, index) => {
    card.addEventListener(
      "click",
      () => openExhibit(index)
    );

    card.addEventListener(
      "keydown",
      event => {
        if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();

          openExhibit(index);
        }
      }
    );
  }
);


if (dialogClose) {
  dialogClose.addEventListener(
    "click",
    closeExhibit
  );
}


if (dialog) {
  dialog.addEventListener(
    "click",
    event => {
      if (
        event.target === dialog
      ) {
        closeExhibit();
      }
    }
  );
}


/* =========================================================
   COMPLEXITY MACHINE
   ========================================================= */

const machineCanvas =
  $("#machine-canvas");

const machineDomain =
  $("#machine-domain");

const machineIntensity =
  $("#machine-intensity");

const machineGenerate =
  $("#machine-generate");

const machineScore =
  $("#machine-score");

const machineTitle =
  $("#machine-title");

const machineDescription =
  $("#machine-description");

const rangeValue =
  $(".range-value");


const domainData = {
  geometry: {
    title:
      "Recursive Geometry Field",

    description:
      "A recursively transformed geometric system whose local structures continually alter the larger field.",

    base:
      91
  },

  color: {
    title:
      "Chromatic Interference Field",

    description:
      "A continuously changing color system built from perceptual contrast, hue drift and overlapping gradients.",

    base:
      84
  },

  language: {
    title:
      "Self-Referential Language Engine",

    description:
      "A semantic network in which meaning depends on references that recursively point toward other references.",

    base:
      89
  },

  computation: {
    title:
      "Recursive Computation Network",

    description:
      "A network whose state alters the rules governing its next state, producing increasingly complex behavior.",

    base:
      94
  },

  pattern: {
    title:
      "Emergent Pattern System",

    description:
      "A field of interacting local rules that generates coherent global structures without a central designer.",

    base:
      88
  }
};


let machineSeed =
  Math.random() *
  10000;


function updateMachineCopy() {
  if (
    !machineDomain ||
    !machineIntensity
  ) {
    return;
  }

  const domain =
    machineDomain.value;

  const intensity =
    Number(
      machineIntensity.value
    );

  const data =
    domainData[domain] ||
    domainData.geometry;

  const score =
    Math.min(
      99.9,
      data.base +
      intensity *
      .75 +
      Math.random() *
      1.8
    );

  if (machineTitle) {
    machineTitle.textContent =
      data.title;
  }

  if (machineDescription) {
    machineDescription.textContent =
      data.description;
  }

  if (machineScore) {
    machineScore.textContent =
      score.toFixed(1);
  }

  if (rangeValue) {
    rangeValue.textContent =
      intensity;
  }
}


function drawMachineGenerator(time) {
  if (!machineCanvas) return;

  const {
    ctx,
    width,
    height
  } = fitCanvas(machineCanvas);

  ctx.fillStyle =
    "#09090b";

  ctx.fillRect(
    0,
    0,
    width,
    height
  );

  const intensity =
    Number(
      machineIntensity?.value ||
      5
    );

  const count =
    35 +
    intensity * 7;

  const domain =
    machineDomain?.value ||
    "geometry";

  const cx =
    width / 2;

  const cy =
    height / 2;

  for (
    let i = 0;
    i < count;
    i++
  ) {
    const ratio =
      i / count;

    const angle =
      i * 2.399 +
      time * .00015 +
      machineSeed;

    const radius =
      Math.sqrt(ratio) *
      Math.min(
        width,
        height
      ) *
      .46;

    const wobble =
      Math.sin(
        time * .0007 +
        i * .7
      ) *
      intensity *
      2;

    const x =
      cx +
      Math.cos(angle) *
      (radius + wobble);

    const y =
      cy +
      Math.sin(angle) *
      (radius + wobble);

    const hueBase = {
      geometry: 165,
      color: time * .02,
      language: 75,
      computation: 250,
      pattern: 320
    }[domain] || 165;

    ctx.fillStyle =
      `hsla(${hueBase + ratio * 120},85%,65%,${.18 + ratio * .65})`;

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      1.5 + ratio * 4,
      0,
      Math.PI * 2
    );

    ctx.fill();

    if (
      i > 0 &&
      i % 3 === 0
    ) {
      const previousAngle =
        (i - 3) * 2.399 +
        time * .00015 +
        machineSeed;

      const previousRadius =
        Math.sqrt(
          (i - 3) /
          count
        ) *
        Math.min(
          width,
          height
        ) *
        .46;

      const px =
        cx +
        Math.cos(
          previousAngle
        ) *
        previousRadius;

      const py =
        cy +
        Math.sin(
          previousAngle
        ) *
        previousRadius;

      ctx.strokeStyle =
        `rgba(255,255,255,${.025 + ratio * .08})`;

      ctx.lineWidth = 1;

      ctx.beginPath();

      ctx.moveTo(
        px,
        py
      );

      ctx.lineTo(
        x,
        y
      );

      ctx.stroke();
    }
  }

  requestAnimationFrame(
    drawMachineGenerator
  );
}


if (machineCanvas) {
  requestAnimationFrame(
    drawMachineGenerator
  );
}


if (machineIntensity) {
  machineIntensity.addEventListener(
    "input",
    updateMachineCopy
  );
}


if (machineDomain) {
  machineDomain.addEventListener(
    "change",
    () => {
      machineSeed =
        Math.random() *
        10000;

      updateMachineCopy();
    }
  );
}


if (machineGenerate) {
  machineGenerate.addEventListener(
    "click",
    () => {
      machineSeed =
        Math.random() *
        10000;

      updateMachineCopy();
    }
  );
}


updateMachineCopy();


/* =========================================================
   SMOOTH INTERNAL LINKS
   ========================================================= */

$$('a[href^="#"]').forEach(
  link => {
    link.addEventListener(
      "click",
      event => {
        const id =
          link.getAttribute(
            "href"
          );

        if (
          !id ||
          id === "#"
        ) {
          return;
        }

        const target =
          $(id);

        if (!target) return;

        event.preventDefault();

        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    );
  }
);


/* =========================================================
   RESIZE
   ========================================================= */

window.addEventListener(
  "resize",
  () => {
    sizeOrbitCanvases();
  }
);
