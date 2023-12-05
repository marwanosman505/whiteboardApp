const canvas = document.getElementById('Canvas');
const ctx = canvas.getContext('2d');

const overlay = document.getElementById('overlay');
const ctxo = overlay.getContext('2d');

let coord = { x: 0, y: 0 };

var prevStart = { x: 0, y: 0 };
var prevWidth = 0;
var prevHeight = 0;

var radius = 0;

let controls = false;

let draw = false;
let rectangle = false;
let circle = false;
let text = false;
let erase = false;



window.addEventListener('load', () => {
    resize();

    window.addEventListener('click', handleOutsideClick);
    document.addEventListener("mousedown", startdrawing);
    document.addEventListener("mousemove", sketch);
    document.addEventListener("mouseup", stopdrawing);
    document.addEventListener("mouseout", stopdrawing);
    window.addEventListener('resize', resize);
    redraw();


});


async function saveState() {
    console.log("before save")

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    await fetch('/WhiteBoard', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'canvasState', data: imageData }),
    });

    console.log("after save")

}

async function redraw() {
    /*  
      console.log("before redraw")
  
      const response = await fetch('/WhiteBoard');
      
      const latestDrawing = await response.json();
      console.log(latestDrawing.JSON);
   
      if (latestDrawing) {
          ctx.putImageData(latestDrawing.data, 0, 0);
      }
  
      console.log("after redraw")
      */

    console.log("before redraw");

    try {
        const response = await fetch('/WhiteBoard');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        var latestDrawing = await response.json();
        latestDrawing = JSON.parse(response);
        
        console.log("Latest Drawing:", latestDrawing);

        if (latestDrawing && latestDrawing.data) {
            ctx.putImageData(latestDrawing.data, 0, 0);
        }
    } catch (error) {
        console.error('Error:', error);
    }

    console.log("after redraw");

}


function resize() {
    ctx.canvas.width = canvas.clientWidth;
    ctx.canvas.height = canvas.clientHeight;
}

function setFalse(state) {
    draw = state;
    rectangle = state;
    circle = state;
    text = state;
    erase = state;
}

function getPosition(event) {
    coord.x = event.clientX - canvas.offsetLeft;
    coord.y = event.clientY - canvas.offsetTop;

}

function startdrawing(event) {
    controls = true;
    getPosition(event);
}

function stopdrawing() {
    controls = false;

    if (rectangle) {
        ctx.strokeRect(prevStart.x, prevStart.y, prevWidth, prevHeight);

    } else if (circle) {
        ctx.arc(coord.x, coord.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
    }

    //saveState();

}

function sketch(event) {
    if (!controls) return;


    //get first posistion of mouse for shapes
    var mouseX = parseInt(event.clientX - canvas.offsetLeft);
    var mouseY = parseInt(event.clientY - canvas.offsetTop);


    ctx.lineWidth = 2;
    ctx.strokeStyle = 'black';

    if (draw) {
        // Drawing a line
        ctx.beginPath();
        ctx.lineCap = 'round';
        ctx.moveTo(coord.x, coord.y);
        getPosition(event);
        ctx.lineTo(coord.x, coord.y);
        ctx.stroke();

    } else if (rectangle) {

        var width = mouseX - coord.x;
        var height = mouseY - coord.y;
        ctxo.clearRect(0, 0, canvas.width, canvas.height);
        ctxo.strokeRect(coord.x, coord.y, width, height);

        prevStart.x = coord.x;
        prevStart.y = coord.y;
        prevWidth = width;
        prevHeight = height;

    } else if (erase) {

        // Clear the area with the eraser
        ctx.clearRect(mouseX, mouseY, 30, 30);

    } else if (text) {

        // Get text input from the user
        const inputText = prompt('Enter text:');
        if (inputText !== null) {
            ctx.font = '16px Arial';
            ctx.fillStyle = 'black';
            ctx.fillText(inputText, coord.x, coord.y);
        }
        controls = false; // Stop adding text after one input

    } else if (circle) {

        ctx.beginPath();
        radius = Math.sqrt(Math.pow(mouseX - coord.x, 2) + Math.pow(mouseY - coord.y, 2));
        ctxo.arc(coord.x, coord.y, radius, 0, 2 * Math.PI);
        ctxo.stroke();
    }



}

function selectDraw() {
    setFalse(false);
    draw = true;

    canvas.style.cursor = "crosshair";
    document.addEventListener("mousedown", startdrawing);
    document.addEventListener("mousemove", sketch);
    document.addEventListener("mouseup", stopdrawing);
    document.addEventListener("mouseout", stopdrawing);

}

function selectRectangle() {
    setFalse(false);
    rectangle = true;

    canvas.style.cursor = "crosshair";
    document.addEventListener("mousedown", startdrawing);
    document.addEventListener("mousemove", sketch);
    document.addEventListener("mouseup", stopdrawing);
    document.addEventListener("mouseout", stopdrawing);

}

function selectErase() {
    setFalse(false);
    erase = true;

    canvas.style.cursor = "crosshair"
    document.addEventListener("mousedown", startdrawing);
    document.addEventListener("mousemove", sketch);
    document.addEventListener("mouseup", stopdrawing);
    document.addEventListener("mouseout", stopdrawing);

}

function selectAddText() {
    setFalse(false);
    text = true;

    canvas.style.cursor = "crosshair";
    document.addEventListener("mousedown", startdrawing);
    document.addEventListener("mousemove", sketch);
    document.addEventListener("mouseup", stopdrawing);
    document.addEventListener("mouseout", stopdrawing);

}

function selectCircle() {
    setFalse(false);
    circle = true;

    canvas.style.cursor = "crosshair";
    document.addEventListener("mousedown", startdrawing);
    document.addEventListener("mousemove", sketch);
    document.addEventListener("mouseup", stopdrawing);
    document.addEventListener("mouseout", stopdrawing);
}

function handleOutsideClick(event) {

    // Check if the clicked element is outside the menu and canvas
    if (!document.getElementById("sidemenu").contains(event.target) &&
        !document.getElementById("canvasContainer").contains(event.target)
    ) {
        // Handle the click outside the menu and canvas
        canvas.style.cursor = "default";
        document.removeEventListener("mousedown", startdrawing);
        document.removeEventListener("mousemove", sketch);
        document.removeEventListener("mouseup", stopdrawing);
        document.removeEventListener("mouseout", stopdrawing);
        controls = false;
        setFalse(false);
    }

}