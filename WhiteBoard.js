//WINDOW MUST BE MAXIMIZED FOR CANVAS TO PERSIST

const canvas = document.getElementById('Canvas');
const ctx = canvas.getContext('2d');

//for drawing shapes, not displayed
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
    redraw();
    resize();
    
    window.addEventListener('click', handleOutsideClick);
    document.addEventListener("mousedown", startdrawing);
    document.addEventListener("mousemove", sketch);
    document.addEventListener("mouseup", stopdrawing);
    document.addEventListener("mouseout", stopdrawing);
    window.addEventListener('resize', resize);

});

function showMessage(message) {
    //show laoding/saving message
    document.getElementById('Message').style.display = 'block';
    document.getElementById('MessageTxt').textContent = message;
}

function hideMessage() {
    //hide loading/saving message
   document.getElementById('Message').style.display = 'none';
}

async function saveState() {
    //store pixel data from canvas and write to db
   const prevImageData = ctx.getImageData(0, 0, canvas.width, canvas.height); 
   await redraw();

    showMessage('Saving...');
    const newImageData = ctx.getImageData(0, 0, canvas.width, canvas.height); 
    
    // merge
    const mergeddata = mergeImageData(prevImageData, newImageData);

    await fetch('/WhiteBoard', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type:'canvasState', data: mergeddata.data }),
    });
    
    hideMessage();
    await redraw();
    

}

async function clearState(){
    ctx.clearRect(0,0,canvas.width, canvas.height);

    showMessage('Saving...');
    const newImageData = ctx.getImageData(0, 0, canvas.width, canvas.height); 
    
    // merge

    await fetch('/WhiteBoard', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type:'canvasState', data: newImageData.data }),
    });
    
    hideMessage();
    await redraw();

}

function mergeImageData(imageData1, imageData2) {
    // Ensure the dimensions of both ImageData objects are the same
    if (imageData1.width !== imageData2.width || imageData1.height !== imageData2.height) {
      throw new Error('Image dimensions do not match');
    }
  
    const mergedImageData = new ImageData(imageData1.width, imageData1.height);
    const totalPixels = imageData1.width * imageData1.height;
  
    // Merge pixel data
    for (let i = 0; i < totalPixels * 4; i += 4) {
      // Average the pixel values from both ImageData objects
      mergedImageData.data[i] = Math.floor((imageData1.data[i] + imageData2.data[i]) / 2);
      mergedImageData.data[i + 1] = Math.floor((imageData1.data[i + 1] + imageData2.data[i + 1]) / 2);
      mergedImageData.data[i + 2] = Math.floor((imageData1.data[i + 2] + imageData2.data[i + 2]) / 2);
      mergedImageData.data[i + 3] = Math.floor((imageData1.data[i + 3] + imageData2.data[i + 3]) / 2);
    }
  
    return mergedImageData;
  }

async function redraw() {
    //load pixel data from db and put back on canvas

    showMessage('Loading...');
    try {
        const response = await fetch('/WhiteBoard');
        const latestDrawing = await response.json();

        if (latestDrawing && latestDrawing.type === 'canvasState') {
          
            // Get the image data from the response
            const imageData = latestDrawing.data;
           
            // Convert the data back into ImageData
             const imageDataObject = ctx.createImageData(canvas.width, canvas.height);
            //const imageDataObject = ctx.createImageData(ctx.getImageData(0, 0, canvas.width, canvas.height));
            imageDataObject.data.set(Object.values(imageData));

            // Put the ImageData on the canvas
            ctx.putImageData(imageDataObject, 0, 0);
        }

    } catch (error) {
        console.error('Error:', error);
    }

    hideMessage();

}

function resize() {
    //resize canvas
    ctx.canvas.width = canvas.clientWidth;
    ctx.canvas.height = canvas.clientHeight;
}

function setFalse(state) {
    //turn off/on all controls
    draw = state;
    rectangle = state;
    circle = state;
    text = state;
    erase = state;
}

function getPosition(event) {
    //get position of click
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