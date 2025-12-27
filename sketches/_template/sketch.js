import p5 from 'p5';

// p5.js Global Mode
// In p5.js v2, calling 'new p5()' without arguments triggers global mode,
// attaching setup(), draw(), etc. to the window object.
new p5();

window.setup = function() {
  createCanvas(windowWidth, windowHeight);
};

window.draw = function() {
  background(30);
  
  // Example: Draw a circle at the mouse position
  noStroke();
  fill(255, 100, 100);
  circle(mouseX, mouseY, 50);
};

window.windowResized = function() {
  resizeCanvas(windowWidth, windowHeight);
};
