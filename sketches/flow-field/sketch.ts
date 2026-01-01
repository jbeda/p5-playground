import p5 from 'p5';
import { createNoise3D } from 'simplex-noise';
import { Pane } from 'tweakpane';

const sketch = (p: p5) => {
  const PARAMS = {
    step: 10,
    noiseScale: 0.005,
    speed: 0.02,
    color1: '#4169e1', // Royal Blue
    color2: '#ff7f50', // Coral
  };

  let zOff = 0; // Time dimension for noise
  let showFps = false;
  const noise3D = createNoise3D();
  let pane: Pane;

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    
    pane = new Pane({ title: 'Settings', expanded: false });
    pane.addBinding(PARAMS, 'step', { min: 5, max: 50, step: 1, label: 'Grid Step' });
    pane.addBinding(PARAMS, 'noiseScale', { min: 0.001, max: 0.05, label: 'Zoom' });
    pane.addBinding(PARAMS, 'speed', { min: 0, max: 0.1, step: 0.001, label: 'Speed' });
    pane.addBinding(PARAMS, 'color1', { label: 'Color Start' });
    pane.addBinding(PARAMS, 'color2', { label: 'Color End' });
  };

  p.draw = () => {
    p.background(0);

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
        const mag = p.map(n2, -1, 1, 0, PARAMS.step/2.0);

        const t = p.map(mag, 0, PARAMS.step, 0, 1);
        
        let bucketIdx = Math.floor(t * buckets);
        if (bucketIdx >= buckets) bucketIdx = buckets - 1;
        if (bucketIdx < 0) bucketIdx = 0;

        const x2 = x + p.cos(angle) * mag;
        const y2 = y + p.sin(angle) * mag;
        
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
            p.vertex(linesByBucket[i][j], linesByBucket[i][j+1]);
            p.vertex(linesByBucket[i][j+2], linesByBucket[i][j+3]);
        }
        p.endShape();
    }
    
    zOff += PARAMS.speed;

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
