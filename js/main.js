const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");


// Dimensiones del canvas
const window_height = 600;
const window_width = 600;

canvas.height = window_height;
canvas.width = window_width;

// Lista de colores aleatorios
const colors = ["red", "blue", "green", "purple", "orange", "pink", "yellow", "cyan", "magenta", "lime"];

class Circle {
    constructor(x, y, radius, color, text, speed) {
        this.posX = x;
        this.posY = y;
        this.radius = radius;
        this.color = color;
        this.text = text;
        this.speed = speed;
        this.dx = (Math.random() > 0.5 ? 1 : -1) * this.speed;
        this.dy = (Math.random() > 0.5 ? 1 : -1) * this.speed;
    }

    draw(context) {
        context.beginPath();
        context.fillStyle = this.color;
        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
        context.fill();
        context.closePath();

        context.fillStyle = "white";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = "bold 16px Arial";
        context.fillText(this.text, this.posX, this.posY);
    }

    update(context) {
        this.draw(context);

        // Rebote en bordes del canvas
        if ((this.posX + this.radius) > window_width || (this.posX - this.radius) < 0) {
            this.dx = -this.dx;
        }
        if ((this.posY + this.radius) > window_height || (this.posY - this.radius) < 0) {
            this.dy = -this.dy;
        }

        this.posX += this.dx;
        this.posY += this.dy;
    }
}

// Función para generar un círculo sin superposición con los demás
function createRandomCircle(existingCircles, index) {
    let radius = Math.floor(Math.random() * 30) + 20;
    let x, y;
    let validPosition = false;

    while (!validPosition) {
        x = Math.random() * (window_width - 2 * radius) + radius;
        y = Math.random() * (window_height - 2 * radius) + radius;
        validPosition = true;

        for (let other of existingCircles) {
            let dx = x - other.posX;
            let dy = y - other.posY;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < radius + other.radius) {
                validPosition = false;
                break;
            }
        }
    }

    let speed = Math.random() * 2 + 1;
    let color = colors[index % colors.length];

    return new Circle(x, y, radius, color, index.toString(), speed);
}

let circles = [];

function initCircles() {
    let count = parseInt(document.getElementById("circleCount").value) || 5;
    circles = [];

    for (let i = 0; i < count; i++) {
        circles.push(createRandomCircle(circles, i + 1));
    }
}

// Función para detectar colisión entre dos círculos
function detectCollision(circle1, circle2) {
    let dx = circle2.posX - circle1.posX;
    let dy = circle2.posY - circle1.posY;
    let distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (circle1.radius + circle2.radius);
}

// Resolver colisión cambiando direcciones
function resolveCollision(circle1, circle2) {
    circle1.dx = -circle1.dx;
    circle1.dy = -circle1.dy;
    circle2.dx = -circle2.dx;
    circle2.dy = -circle2.dy;

    let dx = circle2.posX - circle1.posX;
    let dy = circle2.posY - circle1.posY;
    let distance = Math.sqrt(dx * dx + dy * dy);
    let overlap = (circle1.radius + circle2.radius) - distance;

    if (overlap > 0) {
        let separation = overlap / 2;
        let angle = Math.atan2(dy, dx);
        
        circle1.posX -= Math.cos(angle) * separation;
        circle1.posY -= Math.sin(angle) * separation;
        circle2.posX += Math.cos(angle) * separation;
        circle2.posY += Math.sin(angle) * separation;
    }
}

// Animación
function updateCanvas() {
    requestAnimationFrame(updateCanvas);
    ctx.clearRect(0, 0, window_width, window_height);
    
    let collisionDetected = false;

    for (let i = 0; i < circles.length; i++) {
        circles[i].update(ctx);

        for (let j = i + 1; j < circles.length; j++) {
            if (detectCollision(circles[i], circles[j])) {
                collisionDetected = true;
                resolveCollision(circles[i], circles[j]);
                // Crear un nuevo objeto de Audio para cada colisión, permitiendo sonidos simultáneos
                const sonido = new Audio("assets/audio/quack.mp3");
                sonido.play();
            }
        }
    }

    canvas.style.background = collisionDetected ? "red" : "#ff8";
}

// Reiniciar y generar nuevos círculos
function restartCircles() {
    initCircles();
}

initCircles();
updateCanvas();
