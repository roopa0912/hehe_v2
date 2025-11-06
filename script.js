const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('scoreValue');
const clearMessage = document.getElementById('clearMessage');

// Set canvas size
function resizeCanvas() {
    const size = canvas.offsetWidth;
    canvas.width = size;
    canvas.height = size;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Game variables
let score = 0;
let paddle = {
    width: 80,
    height: 12,
    x: 0,
    y: 0
};

let ball = {
    x: 0,
    y: 0,
    radius: 6,
    dx: 3,
    dy: -3,
    launched: false
};

let dots = [];
let mouseX = 0;
let gameEnded = false;

function init() {
    paddle.x = canvas.width / 2 - paddle.width / 2;
    paddle.y = canvas.height - 40;
    ball.x = canvas.width / 2;
    ball.y = paddle.y - ball.radius - 2;
    createDots();
}

// Create dots
function createDots() {
    dots = [];
    clearMessage.classList.remove('show');
    const rows = 4;
    const cols = 6;
    const dotSize = 10;
    const spacing = canvas.width / (cols + 1);
    const topMargin = canvas.height * 0.15;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            dots.push({
                x: spacing * (col + 1),
                y: topMargin + row * 40,
                size: dotSize,
                active: true
            });
        }
    }
}

// Handle mouse/touch movement
function updateMousePosition(e) {
    const rect = canvas.getBoundingClientRect();
    if (e.touches) {
        mouseX = (e.touches[0].clientX - rect.left) * (canvas.width / rect.width);
    } else {
        mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    }
}

canvas.addEventListener('mousemove', updateMousePosition);
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    updateMousePosition(e);
});

canvas.addEventListener('click', () => {
    if (!ball.launched) {
        ball.launched = true;
    }
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    updateMousePosition(e);
    if (!ball.launched) {
        ball.launched = true;
    }
});

// Game loop
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update paddle position
    paddle.x = mouseX - paddle.width / 2;
    paddle.x = Math.max(0, Math.min(canvas.width - paddle.width, paddle.x));

    // Move ball only if game hasn't ended
    if (ball.launched && !gameEnded) {
        ball.x += ball.dx;
        ball.y += ball.dy;

        // Wall collisions
        if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
            ball.dx = -ball.dx;
        }
        if (ball.y - ball.radius < 0) {
            ball.dy = -ball.dy;
        }

        // Paddle collision
        if (
            ball.y + ball.radius > paddle.y &&
            ball.y - ball.radius < paddle.y + paddle.height &&
            ball.x > paddle.x &&
            ball.x < paddle.x + paddle.width
        ) {
            ball.dy = -Math.abs(ball.dy);
            // Add some angle based on where it hits the paddle
            const hitPos = (ball.x - paddle.x) / paddle.width;
            ball.dx = (hitPos - 0.5) * 6;
        }

        // Bottom boundary (reset)
        if (ball.y - ball.radius > canvas.height) {
            ball.launched = false;
            ball.x = paddle.x + paddle.width / 2;
            ball.y = paddle.y - ball.radius - 2;
            ball.dx = 3;
            ball.dy = -3;
        }

        // Dot collisions
        dots.forEach(dot => {
            if (dot.active) {
                const dist = Math.sqrt(
                    Math.pow(ball.x - dot.x, 2) + 
                    Math.pow(ball.y - dot.y, 2)
                );

                if (dist < ball.radius + dot.size) {
                    dot.active = false;
                    score++;
                    scoreDisplay.textContent = score;
                    ball.dy = -ball.dy;

                    // Check if all dots cleared
                    if (dots.every(d => !d.active)) {
                        gameEnded = true;
                        clearMessage.classList.add('show');
                    }
                }
            }
        });
    } else if (!gameEnded) {
        // Ball follows paddle before launch
        ball.x = paddle.x + paddle.width / 2;
        ball.y = paddle.y - ball.radius - 2;
    }

    // Draw dots
    dots.forEach(dot => {
        if (dot.active) {
            ctx.fillStyle = '#ffd89b';
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // Draw ball
    ctx.fillStyle = '#ffd89b';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw paddle
    ctx.fillStyle = '#ffd89b';
    ctx.beginPath();
    ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 6);
    ctx.fill();

    requestAnimationFrame(draw);
}

init();
draw();
