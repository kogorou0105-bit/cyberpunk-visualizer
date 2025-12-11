// src/components/CyberpunkCanvas.jsx
import { useEffect, useRef } from "react";
import { audioEngine } from "../utils/AudioEngine";

const SYNTH_COLORS = [
  "#FF0055",
  "#FF00CC",
  "#CC00FF",
  "#0099FF",
  "#00FFCC",
  "#00FF00",
  "#FFFF00",
  "#FF9900",
  "#FF3333",
  "#FFFFFF",
];

class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 8 + 3;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.life = 1.0;
    this.decay = Math.random() * 0.03 + 0.015;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.95;
    this.vy *= 0.95;
    this.life -= this.decay;
  }
  draw(ctx) {
    if (this.life <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.life;
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, Math.max(0, 12 * this.life), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// 【新增】onInteract 属性
const CyberpunkCanvas = ({ onUpdateHud, onInteract }) => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let frameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    const render = (timestamp) => {
      frameId = requestAnimationFrame(render);
      const { width, height } = canvas;
      const dataArray = audioEngine.getFrequencyData();

      let bassSum = 0;
      for (let i = 0; i < 20; i++) bassSum += dataArray[i] || 0;
      const bassAvg = bassSum / 20;
      if (onUpdateHud) onUpdateHud(bassAvg);

      ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const bassScale = bassAvg / 255;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.shadowBlur = 20 + bassScale * 50;
      ctx.shadowColor = bassScale > 0.6 ? "#ff0055" : "#00ffcc";
      ctx.beginPath();
      const coreRadius = 50 + bassScale * 100;
      ctx.arc(0, 0, coreRadius, 0, Math.PI * 2);
      ctx.strokeStyle = ctx.shadowColor;
      ctx.lineWidth = 5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, coreRadius * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.restore();

      const radius = 150;
      const barWidth = (Math.PI * 2) / (dataArray.length || 1);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(timestamp * 0.0002);

      for (let i = 0; i < dataArray.length; i++) {
        const val = dataArray[i];
        const barHeight = val * 1.5;
        const hue = i * 2 + 180;

        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.rotate(barWidth);

        if (val > 10) {
          ctx.fillRect(0, radius, barWidth * width * 0.005, barHeight);
          ctx.fillStyle = `hsla(${hue}, 100%, 50%, 0.3)`;
          ctx.fillRect(0, radius, barWidth * width * 0.005, -barHeight * 0.2);
        }
      }
      ctx.restore();

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw(ctx);
        if (p.life <= 0) particles.splice(i, 1);
      }
    };

    render();

    const handleMouseDown = (e) => {
      // 1. 触发合成器声音
      const xRatio = e.clientX / window.innerWidth;
      const noteIndex = audioEngine.playSynth(xRatio);
      const color = SYNTH_COLORS[noteIndex % SYNTH_COLORS.length];

      // 2. 生成粒子
      for (let i = 0; i < 12; i++) {
        particlesRef.current.push(new Particle(e.clientX, e.clientY, color));
      }

      // 3. 【新增】通知父组件“用户交互了”
      if (onInteract) onInteract();
    };

    window.addEventListener("mousedown", handleMouseDown);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousedown", handleMouseDown);
      cancelAnimationFrame(frameId);
    };
  }, [onUpdateHud, onInteract]); // 依赖项里加上 onInteract

  return (
    <canvas
      ref={canvasRef}
      style={{ display: "block", width: "100vw", height: "100vh" }}
    />
  );
};

export default CyberpunkCanvas;
