import p5 from 'p5';

const sketch = (p: p5) => {
  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
  };

  p.draw = () => {
    p.background(30);

    // Example: Draw a circle at the mouse position
    p.noStroke();
    p.fill(255, 100, 100);
    p.circle(p.mouseX, p.mouseY, 50);
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
};

new p5(sketch);