import p5 from 'p5';

const sketch = (p: p5) => {
  const step = 10; // Grid resolution
  const noiseScale = 0.005; // Scale for noise
  let zOff = 0; // Time dimension for noise

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
  };

  p.draw = () => {
    p.background(0);

    // Draw Flow Field
    p.stroke(255);
    p.strokeWeight(1);
    for (let x = 0; x < p.width; x += step) {
      for (let y = 0; y < p.height; y += step) {
        const n = p.noise(x * noiseScale, y * noiseScale, zOff);
        const angle = p.map(n, 0, 1, 0, p.TWO_PI * 4);
        const x2 = x + p.cos(angle) * step;
        const y2 = y + p.sin(angle) * step;
        p.line(x, y, x2, y2);
      }
    }
    zOff += 0.01;
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
};

new p5(sketch);
