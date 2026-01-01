import p5 from 'p5';
import { createNoise3D } from 'simplex-noise';
import { Pane } from 'tweakpane';

const sketch = (p: p5) => {
  const PARAMS = {
    step: 10,
    noiseScale: 0.005,
    speed: 0.2,
    length: 0.5,
    color1: '#4169e1', // Royal Blue
    color2: '#ff7f50', // Coral
    colorBG: '#000000',
    debug: false,

    // Bounce
    bounceBPM: 80,
    bounceDecay: 0.01,
    bounceTimeBoost: 0.25,
    bounceBGColor: '#000',
    bounceLengthBoost: 1
  };

  let zOff = 0; // Time dimension for noise
  let tLastFrameTime = 0;
  let showFps = false;
  const noise3D = createNoise3D();
  let pane: Pane;

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);

    const pane = new Pane({ title: 'Settings', expanded: true });
    pane.addBinding(PARAMS, 'step', { min: 5, max: 50, step: 1, label: 'Grid Step' });
    pane.addBinding(PARAMS, 'noiseScale', { min: 0.001, max: 0.05, label: 'Zoom' });
    pane.addBinding(PARAMS, 'speed', { min: 0, max: 1.0, step: 0.01, label: 'Speed' });
    pane.addBinding(PARAMS, 'length', { min: 0, max: 5.0, step: 0.01, label: 'Length' });
    pane.addBinding(PARAMS, 'color1', { label: 'Color Start' });
    pane.addBinding(PARAMS, 'color2', { label: 'Color End' });
    pane.addBinding(PARAMS, 'colorBG', { label: 'Background' });
    pane.addBinding(PARAMS, 'debug', { label: 'Debug' });


    const bounce = pane.addFolder({ title: "Bounce", expanded: true })
    bounce.addBinding(PARAMS, 'bounceBPM', { min: 0, max: 200, label: 'BPM' });
    bounce.addBinding(PARAMS, 'bounceDecay', { min: 0.001, max: 0.05, step: 0.001, label: 'Decay' });
    bounce.addBinding(PARAMS, 'bounceTimeBoost', { min: 0, max: 0.5, step: 0.01, label: 'Time Boost' });
    bounce.addBinding(PARAMS, 'bounceBGColor', { label: 'Background' });
    bounce.addBinding(PARAMS, 'bounceLengthBoost', { min: 0, max: 10.0, step: 0.01, label: 'Length Boost' });
  };

  // Perform the definite integral for an exponential function from a to be with
  // decay factor k
  // Exponential decay = e^(-k*t)
  // Definite integral from a to b
  //   (e^(-ka) - e^(-kb))/k
  function ComputeExpDecay(a: number, b: number, k: number): number {
    return (-Math.exp(-k * b) + Math.exp(-k * a)) / k;
  }

  p.draw = () => {
    // Keep track of time since last frame as deltaTime seems buggy?
    const now = p.millis();
    const tDelta = now - tLastFrameTime;
    tLastFrameTime = now;

    // Update Bounce Boost
    let boostFraction = 0;
    let boostProgress = 0;
    if (PARAMS.bounceBPM > 0) {
      const k = PARAMS.bounceDecay;
      const msPerBounce = 60000 / PARAMS.bounceBPM;
      const tLastFrameStart = now - tDelta;

      // Figure out the bounce relative times for this frame
      const tBounceStart = now - (now % msPerBounce);
      const tBounceFrameStart = Math.max(tBounceStart, tLastFrameStart) % msPerBounce;
      const tBounceNow = now % msPerBounce;

      // Compute exponential decay for total bounce and this frame
      const bounceTotal = ComputeExpDecay(0, msPerBounce, k);
      const bounceFrame = ComputeExpDecay(tBounceFrameStart, tBounceNow, k);
      const bounceProgress = ComputeExpDecay(0, tBounceNow, k);
      boostProgress = bounceProgress / bounceTotal;
      boostFraction = bounceFrame / bounceTotal;

      if (boostFraction > 0.001 && PARAMS.debug) {
        console.log(`Frame:
  tDelta:             ${tDelta.toFixed(2)}
  now:                ${now.toFixed(2)}
  tLastFrameStart:    ${tLastFrameStart.toFixed(2)}
  tBounceStart:       ${tBounceStart.toFixed(2)}
  tBounceFrameStart:  ${tBounceFrameStart.toFixed(2)}
  tBounceNow:         ${tBounceNow.toFixed(2)}
  boostFraction:      ${boostFraction.toFixed(3)}
  boostProgress:      ${boostProgress.toFixed(3)}`);
      }
    }

    // Update time based on time since last frame.  Include the boost
    const zBoost = boostFraction * PARAMS.bounceTimeBoost;
    const zDelta = PARAMS.speed * tDelta / 1000.0 + (PARAMS.speed * zBoost);
    zOff += zDelta;

    p.background(p.lerpColor(
      p.color(PARAMS.bounceBGColor),
      p.color(PARAMS.colorBG),
      boostProgress));

    // Draw Flow Field
    p.strokeWeight(1);
    const c1 = p.color(PARAMS.color1);
    const c2 = p.color(PARAMS.color2);

    const buckets = 32;
    const linesByBucket: number[][] = Array.from({ length: buckets }, () => []);

    // Use PARAMS.step and PARAMS.noiseScale
    for (let x = 0; x < p.width; x += PARAMS.step) {
      for (let y = 0; y < p.height; y += PARAMS.step) {
        const n1 = noise3D(x * PARAMS.noiseScale, y * PARAMS.noiseScale, zOff);
        const angle = p.map(n1, -1, 1, 0, p.TWO_PI * 4);
        const n2 = noise3D(x * PARAMS.noiseScale + 20, y * PARAMS.noiseScale, zOff);
        let magn = p.map(n2, -1, 1, 0, PARAMS.step * PARAMS.length);
        const magnBoost = 1 + (1-boostProgress) * PARAMS.bounceLengthBoost;
        magn *= magnBoost;

        const t = p.map(n2, -1, 1, 0, 1);
        let bucketIdx = Math.floor(t * buckets);
        if (bucketIdx >= buckets) bucketIdx = buckets - 1;
        if (bucketIdx < 0) bucketIdx = 0;

        const x2 = x + p.cos(angle) * magn;
        const y2 = y + p.sin(angle) * magn;

        linesByBucket[bucketIdx].push(x, y, x2, y2);
      }
    }

    for (let i = 0; i < buckets; i++) {
      if (linesByBucket[i].length === 0) continue;

      const bucketT = (i + 0.5) / buckets;
      const c = p.lerpColor(c1, c2, bucketT);
      p.stroke(c);

      p.beginShape(p.LINES);
      for (let j = 0; j < linesByBucket[i].length; j += 4) {
        p.vertex(linesByBucket[i][j], linesByBucket[i][j + 1]);
        p.vertex(linesByBucket[i][j + 2], linesByBucket[i][j + 3]);
      }
      p.endShape();
    }

    if (showFps) {
      p.push();
      p.resetMatrix();
      p.fill(255);
      p.noStroke();
      p.textSize(16);
      p.textAlign(p.LEFT, p.TOP);
      p.text(`FPS: ${p.frameRate().toFixed(1)}`, 10, 10);
      p.pop();
    }
  };


  p.keyPressed = () => {
    if (p.key === 'f' || p.key === 'F') {
      showFps = !showFps;
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
};

new p5(sketch);
