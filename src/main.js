let baseLayer;
let scratchLayer;
let particles = [];
let cursorImg;
const brushSize = 10;

class ScratchParticle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-1, 1);
    this.vy = random(-0.5, 0);
    this.size = random(2, 4);
    this.rotation = random(TWO_PI);
    this.rotationSpeed = random(-0.05, 0.05);
    this.alpha = random(180, 255);
    this.points = [];

    // Create irregular flake shape
    const numPoints = floor(random(5, 8));
    for (let i = 0; i < numPoints; i++) {
      const angle = (TWO_PI * i) / numPoints;
      const radius = this.size * random(0.7, 1);
      this.points.push({
        x: cos(angle) * radius,
        y: sin(angle) * radius,
      });
    }
  }

  update() {
    this.x += this.vx;
    this.vy += 0.15; // Heavier gravity for more realistic fall
    this.y += this.vy;
    this.rotation += this.rotationSpeed;

    // Slow down horizontal movement
    this.vx *= 0.98;

    // Fade out slower
    this.alpha -= 2;

    return this.alpha > 0;
  }

  draw() {
    push();
    translate(this.x, this.y);
    rotate(this.rotation);

    // Draw irregular flake
    noStroke();
    fill(40, 40, 40, this.alpha); // Dark gray, almost black
    beginShape();
    for (let point of this.points) {
      vertex(point.x, point.y);
    }
    endShape(CLOSE);
    pop();
  }
}

function preload() {
  cursorImg = loadImage("/stylus.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  baseLayer = createGraphics(windowWidth, windowHeight);
  scratchLayer = createGraphics(windowWidth, windowHeight);

  drawRainbowGradient();

  scratchLayer.background(0);
  //   drawHeart();

  noCursor();
}

function drawRainbowGradient() {
  // Create horizontal rainbow gradient
  baseLayer.noFill();
  for (let x = 0; x < width; x++) {
    let inter = map(x, 0, width, 0, 1);
    let gradientColor;

    // Create rainbow effect similar to HTML version
    if (inter < 0.2) {
      gradientColor = lerpColor(
        color(255, 0, 0),
        color(255, 165, 0),
        map(inter, 0, 0.2, 0, 1)
      ); // red to orange
    } else if (inter < 0.4) {
      gradientColor = lerpColor(
        color(255, 165, 0),
        color(255, 255, 0),
        map(inter, 0.2, 0.4, 0, 1)
      ); // orange to yellow
    } else if (inter < 0.6) {
      gradientColor = lerpColor(
        color(255, 255, 0),
        color(0, 128, 0),
        map(inter, 0.4, 0.6, 0, 1)
      ); // yellow to green
    } else if (inter < 0.8) {
      gradientColor = lerpColor(
        color(0, 128, 0),
        color(0, 0, 255),
        map(inter, 0.6, 0.8, 0, 1)
      ); // green to blue
    } else {
      gradientColor = lerpColor(
        color(0, 0, 255),
        color(75, 0, 130),
        map(inter, 0.8, 1, 0, 1)
      ); // blue to indigo
    }

    baseLayer.stroke(gradientColor);
    baseLayer.line(x, 0, x, height);
  }
}

function drawHeart() {
  scratchLayer.push();
  scratchLayer.translate(width / 2, height / 2);
  scratchLayer.scale(2);
  scratchLayer.stroke("#FFD700");
  scratchLayer.strokeWeight(3);
  scratchLayer.noFill();

  scratchLayer.arc(-50, -50, 100, 100, PI, 0);
  scratchLayer.arc(50, -50, 100, 100, PI, 0);
  scratchLayer.line(-100, -50, 0, 75);
  scratchLayer.line(100, -50, 0, 75);

  scratchLayer.pop();
}

function drawCustomCursor() {
  push();
  translate(mouseX, mouseY);

  // Rotate cursor when scratching (mouseIsPressed)
  if (mouseIsPressed) {
    rotate(-PI / 4); // -45 degrees like in HTML
  }

  // Draw the cursor image
  // Adjust the positioning so the cursor tip aligns with the mouse position
  // You may need to adjust these offset values based on your cursor image
  imageMode(LEFT);
  image(cursorImg, 0, 0, 200, 100); // Adjust size as needed

  pop();
}

function draw() {
  // Draw base and scratch layers
  image(baseLayer, 0, 0);
  image(scratchLayer, 0, 0);

  // Update and draw particles
  for (let i = particles.length - 1; i >= 0; i--) {
    if (!particles[i].update()) {
      particles.splice(i, 1);
      continue;
    }
    particles[i].draw();
  }

  drawCustomCursor();
}

function createParticles(x, y) {
  const numParticles = floor(random(4, 8));
  for (let i = 0; i < numParticles; i++) {
    particles.push(new ScratchParticle(x + random(-5, 5), y + random(-5, 5)));
  }
}

function mouseDragged() {
  // Create particles
  createParticles(mouseX, mouseY);

  // Erase scratch layer
  scratchLayer.erase();
  scratchLayer.circle(mouseX, mouseY, brushSize * 2);
  scratchLayer.noErase();
  return false;
}

function touchMoved() {
  createParticles(touches[0].x, touches[0].y);

  scratchLayer.erase();
  scratchLayer.circle(touches[0].x, touches[0].y, brushSize * 2);
  scratchLayer.noErase();
  return false;
}
