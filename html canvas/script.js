const canvasEl = document.getElementById("canvas1");
const canvasContext = canvasEl.getContext("2d");

// window.addEventListener("resize", function () {
//   canvasEl.width = window.innerWidth;
//   canvasEl.height = window.innerHeight;
//   canvasContext.strokeStyle = "red";
//   canvasContext.beginPath();
//   canvasContext.arc(100, 100, 50, 0, Math.PI * 2);
//   canvasContext.stroke();
// });

canvasEl.width = window.innerWidth;
canvasEl.height = window.innerHeight;
// canvasContext.strokeStyle = "red";
// canvasContext.beginPath();
// canvasContext.arc(100, 100, 50, 0, Math.PI * 2);
// canvasContext.stroke();

const mouseCoordinates = {
  x: undefined,
  y: undefined,
};

function drawCircle(xCoord = 100, yCoord = 100) {
  canvasContext.strokeStyle = "red";
  canvasContext.beginPath();
  canvasContext.arc(xCoord, yCoord, 50, 0, Math.PI * 2);
  canvasContext.stroke();
}

function handleClick(event) {
  mouseCoordinates.x = event.x;
  mouseCoordinates.y = event.y;

  drawCircle(mouseCoordinates.x, mouseCoordinates.y);
}

function handleMove(event) {
  mouseCoordinates.x = event.x;
  mouseCoordinates.y = event.y;

  drawCircle(mouseCoordinates.x, mouseCoordinates.y);
}

canvasEl.addEventListener("click", handleClick);
canvasEl.addEventListener("mousemove", handleMove);
