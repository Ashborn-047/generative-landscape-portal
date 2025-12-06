/**
 * Generative Art - Insta Frame
 * Interactive landscape generator with customizable themes and export features
 */

// Canvas Setup
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const simplex = new SimplexNoise();

// Initial Resolution (Vertical)
let renderWidth = 1080;
let renderHeight = 1920;

canvas.width = renderWidth;
canvas.height = renderHeight;

// State Variables
let time = 0;
let isPaused = false;
let isRecording = false;

let mouseX = 0;
let mouseY = 0;
let targetMouseX = 0;
let targetMouseY = 0;

// Configuration
const config = {
    layerCount: 12,
    speed: 0.0025,
    circleRadiusRatio: 0.35, // Relative to the SMALLEST dimension
};

// --- THEME CONFIGURATION ---
const themes = {
    midnight: {
        hue: 220,
        sat: 8,
        skyTop: '#050505',
        skyHorizon: 'hsl(220, 8%, 25%)',
        innerSkyTop: '#e0e0e0',
        innerSkyBottom: '#404040'
    },
    ocean: {
        hue: 205,
        sat: 50,
        skyTop: '#00151f',
        skyHorizon: 'hsl(205, 50%, 25%)',
        innerSkyTop: '#e0f7fa',
        innerSkyBottom: '#006064'
    },
    dunes: {
        hue: 35,
        sat: 45,
        skyTop: '#1a1005',
        skyHorizon: 'hsl(35, 45%, 20%)',
        innerSkyTop: '#fff8e1',
        innerSkyBottom: '#4e342e'
    },
    forest: {
        hue: 150,
        sat: 35,
        skyTop: '#051405',
        skyHorizon: 'hsl(150, 30%, 18%)',
        innerSkyTop: '#e8f5e9',
        innerSkyBottom: '#1b5e20'
    }
};

let activeTheme = themes.midnight;

// --- RESOLUTION CONTROL ---
function setResolution(type) {
    // Update UI buttons
    const buttons = document.querySelectorAll('.frame-btn');
    buttons.forEach(b => b.classList.remove('active'));

    if (type === 'vertical') {
        renderWidth = 1080;
        renderHeight = 1920;
        document.getElementById('btn-vertical').classList.add('active');
    } else {
        renderWidth = 1920;
        renderHeight = 1080;
        document.getElementById('btn-cinematic').classList.add('active');
    }

    canvas.width = renderWidth;
    canvas.height = renderHeight;
}

// --- THEME CONTROL ---
function setTheme(themeName) {
    if (themes[themeName]) {
        activeTheme = themes[themeName];

        // Update UI to show active theme
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`theme-${themeName}`).classList.add('active');
    }
}

// Resize handling for CSS display only (Canvas buffer remains HD)
function resize() {
    // CSS handles visual scaling
}

// --- DRAWING FUNCTIONS ---

function drawFrame() {
    const w = canvas.width;
    const h = canvas.height;
    const goldColor = '#C5A059';
    const margin = 60;
    const gap = 15;

    ctx.save();
    ctx.shadowBlur = 20;
    ctx.shadowColor = 'rgba(0,0,0,0.8)';

    // Outer Border
    ctx.strokeStyle = goldColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(margin, margin, w - (margin * 2), h - (margin * 2));

    // Inner Border
    ctx.strokeStyle = 'rgba(197, 160, 89, 0.6)';
    ctx.lineWidth = 2;
    ctx.strokeRect(margin + gap, margin + gap, w - ((margin + gap) * 2), h - ((margin + gap) * 2));

    // Corner Accents
    const cornerSize = 40;
    ctx.lineWidth = 6;

    // Top Left
    ctx.beginPath();
    ctx.moveTo(margin, margin + cornerSize);
    ctx.lineTo(margin, margin);
    ctx.lineTo(margin + cornerSize, margin);
    ctx.stroke();

    // Bottom Right
    ctx.beginPath();
    ctx.moveTo(w - margin, h - margin - cornerSize);
    ctx.lineTo(w - margin, h - margin);
    ctx.lineTo(w - margin - cornerSize, h - margin);
    ctx.stroke();

    ctx.restore();
}

function drawLandscapeSystem(mode) {
    const w = canvas.width;
    const h = canvas.height;

    for (let i = 0; i < config.layerCount; i++) {
        const progress = i / (config.layerCount - 1);

        // Geometry scales with dimensions
        const amplitude = h * (0.08 + (progress * 0.15));
        const yOffset = (h * 0.25) + (progress * (h * 0.6));

        const frequency = 0.0008 + (progress * 0.0005);
        const scrollSpeed = time * (0.2 + (progress * 1.0));

        ctx.beginPath();
        ctx.moveTo(0, h);

        // Optimized step size based on resolution
        const step = w > 1500 ? 15 : 10;

        for (let x = 0; x <= w; x += step) {
            const noiseX = x * frequency + scrollSpeed;
            const noiseY = i * 20;

            let n = simplex.noise2D(noiseX, noiseY);
            n += simplex.noise2D(noiseX * 2.0 + 100, noiseY) * 0.5;
            n = n / 1.5;

            const horizonShift = mouseY * (h * 0.15) * progress;

            const y = yOffset + (n * amplitude) + horizonShift;
            ctx.lineTo(x, y);
        }

        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();

        // --- COLORING ---

        if (mode === 'dark') {
            const startL = 25;
            const endL = 2;
            const l = startL - (progress * (startL - endL));

            const grd = ctx.createLinearGradient(0, yOffset - amplitude, 0, h);
            grd.addColorStop(0, `hsl(${activeTheme.hue}, ${activeTheme.sat}%, ${l}%)`);
            grd.addColorStop(1, `hsl(${activeTheme.hue}, ${activeTheme.sat}%, ${l - 5}%)`);
            ctx.fillStyle = grd;
            ctx.fill();

        } else if (mode === 'light') {
            // Negative Film Effect
            const l = 15 + (progress * 80);
            const grd = ctx.createLinearGradient(0, 0, 0, h);

            const negSat = activeTheme.sat * 0.2;

            grd.addColorStop(0, `hsl(${activeTheme.hue}, ${negSat}%, ${l}%)`);
            grd.addColorStop(1, `hsl(${activeTheme.hue}, ${negSat}%, ${Math.min(100, l + 15)}%)`);
            ctx.fillStyle = grd;
            ctx.fill();
        }
    }
}

function animate() {
    requestAnimationFrame(animate);

    if (isPaused && !isRecording) return;

    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;
    time += config.speed;

    const w = canvas.width;
    const h = canvas.height;

    // --- RENDER SCENE ---

    // Background
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, activeTheme.skyTop);
    skyGrad.addColorStop(0.4, activeTheme.skyHorizon);
    skyGrad.addColorStop(1, activeTheme.skyTop);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // 1. Dark Layers
    drawLandscapeSystem('dark');

    // 2. Light Circle Overlay
    ctx.save();
    const cx = w / 2;
    const cy = h / 2;

    // Radius: Use the smallest dimension to ensure it always fits
    const radius = Math.min(w, h) * config.circleRadiusRatio;

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();

    // Inner Sky
    const innerSky = ctx.createLinearGradient(0, 0, 0, h);
    innerSky.addColorStop(0, activeTheme.innerSkyTop);
    innerSky.addColorStop(0.5, activeTheme.innerSkyBottom);
    ctx.fillStyle = innerSky;
    ctx.fillRect(0, 0, w, h);

    drawLandscapeSystem('light');
    ctx.restore();

    // 3. The Golden Frame
    drawFrame();
}

// --- RECORDING LOGIC ---

function startRecording() {
    if (isRecording) return;
    isRecording = true;
    btnRecord.textContent = "Recording...";
    btnRecord.disabled = true;

    const stream = canvas.captureStream(60);
    const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 8000000 // Higher bitrate for quality
    });

    const chunks = [];
    recorder.ondataavailable = e => chunks.push(e.data);

    recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // Filename includes resolution
        a.download = `generative_art_${canvas.width}x${canvas.height}.webm`;
        a.click();

        isRecording = false;
        btnRecord.textContent = "Record Video";
        btnRecord.disabled = false;
    };

    recorder.start();

    setTimeout(() => {
        recorder.stop();
    }, 6000);
}

// --- EVENT LISTENERS ---

window.addEventListener('resize', resize);
resize();

window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    // Scaling logic must account for dynamic canvas resolution
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const actualX = (e.clientX - rect.left) * scaleX;
    const actualY = (e.clientY - rect.top) * scaleY;

    targetMouseX = (actualX / canvas.width) - 0.5;
    targetMouseY = (actualY / canvas.height) - 0.5;
});

// Touch support for mobile
window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const actualX = (touch.clientX - rect.left) * scaleX;
        const actualY = (touch.clientY - rect.top) * scaleY;

        targetMouseX = (actualX / canvas.width) - 0.5;
        targetMouseY = (actualY / canvas.height) - 0.5;
    }
});

// Button Event Listeners
const btnPause = document.getElementById('btn-pause');
btnPause.addEventListener('click', () => {
    isPaused = !isPaused;
    btnPause.textContent = isPaused ? 'Resume' : 'Pause / Play';
});

const btnRecord = document.getElementById('btn-record');
btnRecord.addEventListener('click', startRecording);

// Resolution buttons
document.getElementById('btn-vertical').addEventListener('click', () => setResolution('vertical'));
document.getElementById('btn-cinematic').addEventListener('click', () => setResolution('cinematic'));

// Theme buttons
document.getElementById('theme-midnight').addEventListener('click', () => setTheme('midnight'));
document.getElementById('theme-ocean').addEventListener('click', () => setTheme('ocean'));
document.getElementById('theme-dunes').addEventListener('click', () => setTheme('dunes'));
document.getElementById('theme-forest').addEventListener('click', () => setTheme('forest'));

// --- START ANIMATION ---
animate();
