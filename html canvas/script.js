const canvasEl = document.getElementById("canvas1");
const canvasContext = canvasEl.getContext("2d");
const particlesArray = [];
const TWO_PI = Math.PI * 2; // cached so it isn't recomputed every draw call

let hue = 0;

// PSEUDOCODE — Particle:
//   on create: spawn at mouse position, random size/velocity, current hue color
//   on update: move by velocity each frame, shrink size until nearly gone
//   on draw:   stroke a circle at current position with particle's color

class Particle {
  constructor() {
    this.x = mouseCoordinates.x;
    this.y = mouseCoordinates.y;
    this.size = Math.random() * 16 + 1;
    this.speedX = Math.random() * 3 - 1.5; // range: -1.5 to +1.5
    this.speedY = Math.random() * 3 - 1.5;
    this.color = `hsl(${hue}, 100%, 50%)`;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.size >= 0.2) this.size -= 0.1;
  }

  draw() {
    canvasContext.fillStyle = this.color;
    canvasContext.beginPath();
    canvasContext.arc(this.x, this.y, this.size, 0, TWO_PI);
    canvasContext.fill();
  }
}

// PSEUDOCODE — handleParticles:
//   for each particle i:
//     update and draw particle i
//     for each particle j after i:
//       if distance between i and j < 100px:
//         draw a connecting line between them
//     if particle i is too small: remove it from the array

function handleParticles() {
  for (let i = 0; i < particlesArray.length; i++) {
    particlesArray[i].update();
    particlesArray[i].draw();

    // batch all lines for particle i into one path — single stroke() instead of one per line
    canvasContext.beginPath();
    canvasContext.strokeStyle = particlesArray[i].color;
    for (let j = i + 1; j < particlesArray.length; j++) {
      const dx = particlesArray[i].x - particlesArray[j].x;
      const dy = particlesArray[i].y - particlesArray[j].y;
      // squared distance avoids Math.sqrt — compare 100² instead of 100
      if (dx * dx + dy * dy < 10000) {
        canvasContext.moveTo(particlesArray[i].x, particlesArray[i].y);
        canvasContext.lineTo(particlesArray[j].x, particlesArray[j].y);
      }
    }
    canvasContext.stroke(); // one GPU flush for all lines from particle i

    if (particlesArray[i].size <= 0.3) {
      particlesArray.splice(i, 1);
      i--; // step back so the shifted element isn't skipped
    }
  }
}

canvasEl.width = window.innerWidth;
canvasEl.height = window.innerHeight;

const mouseCoordinates = {
  x: undefined,
  y: undefined,
};

// PSEUDOCODE — handleClick:
//   record mouse position
//   spawn 10 new particles at that position

function handleClick(event) {
  mouseCoordinates.x = event.x;
  mouseCoordinates.y = event.y;
  for (let i = 0; i < 10; i++) {
    particlesArray.push(new Particle());
  }
}

// PSEUDOCODE — handleMove:
//   record mouse position
//   if below particle cap: spawn 5 new particles at current position

function handleMove(event) {
  mouseCoordinates.x = event.x;
  mouseCoordinates.y = event.y;
  if (particlesArray.length < 150) {
    // cap prevents O(n²) loop from getting too expensive
    for (let i = 0; i < 5; i++) {
      particlesArray.push(new Particle());
    }
  }
}

// PSEUDOCODE — animate (runs every frame via requestAnimationFrame):
//   paint a semi-transparent black rect over the canvas (creates motion-trail effect)
//   update + draw all particles and their connecting lines
//   advance hue so color cycles over time
//   schedule the next frame

function animate() {
  // semi-transparent fill instead of clearRect creates a fade/trail effect
  canvasContext.fillStyle = "rgba(0, 0, 0, 0.2)";
  canvasContext.fillRect(0, 0, canvasEl.width, canvasEl.height);
  handleParticles();
  hue++;
  requestAnimationFrame(animate);
}

function throttle(fn, delay) {
  let isThrottled = false;

  return (...args) => {
    if (isThrottled) return;

    fn(...args);
    isThrottled = true;

    setTimeout(() => {
      isThrottled = false;
    }, delay);
  };
}

const throttledHandleMove = throttle(handleMove, 16);

canvasEl.addEventListener("click", handleClick);
canvasEl.addEventListener("mousemove", throttledHandleMove);

animate();
