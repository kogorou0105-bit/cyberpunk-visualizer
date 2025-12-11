# 🎵 Cyberpunk Audio Visualizer / 赛博朋克音频可视化引擎

> An interactive, high-performance audio visualization experiment built with React, Vite, and the Web Audio API.
>
> 一个基于 React、Vite 和 Web Audio API 构建的交互式高性能音频可视化实验项目。

## 📖 Introduction / 项目简介

**English**
This project transforms audio frequencies into a real-time, cyberpunk-aesthetic visual experience. Unlike standard visualizers, it features an **interactive layer** that allows users to "jam" over the music using a built-in synthesizer. It effectively bridges the gap between passive listening and active creation, wrapped in a futuristic UI.

**中文**
本项目将音频频率转化为实时的赛博朋克风格视觉体验。与普通的可视化工具不同，它内置了一个**交互式合成器**层，允许用户在音乐播放的同时通过点击屏幕进行“即兴演奏”。项目在极具未来感的 UI 包裹下，实现了被动聆听与主动创造的融合。

## ✨ Key Features / 核心功能

- **Real-time Visualization (实时可视化)**:
  - Utilizes `AnalyserNode` and FFT (Fast Fourier Transform) to map audio frequencies to a dynamic 360° rotational spectrum.
  - 利用 `AnalyserNode` 和 FFT（快速傅里叶变换）将音频频率映射为动态的 360° 旋转频谱。
- **Interactive Synthesizer (交互式合成器)**:
  - Click anywhere to trigger a "Super Saw" synth sound tuned to a **Pentatonic scale**.
  - Integrated with a **Delay/Feedback (Echo)** system for a spacious, atmospheric sound.
  - 点击屏幕任意位置触发“Super Saw”合成器音效，自动校准至**五声音阶**。
  - 集成 **Delay/Feedback（回声）** 系统，创造空灵的空间感。
- **Particle System (粒子系统)**:
  - Physics-based particle explosions triggered by user interaction.
  - Uses `globalCompositeOperation = 'lighter'` for neon glow effects.
  - 基于物理引擎的粒子爆炸效果，由用户交互触发。
  - 使用 `globalCompositeOperation = 'lighter'` 实现霓虹发光效果。
- **Drag & Drop Injection (拖拽注入)**:
  - Users can inject their own local MP3 files directly into the "system" via a customized drag-and-drop interface with immersive overlay animations.
  - 用户可以通过定制的拖拽界面直接将本地 MP3 文件“注入”系统，并配有沉浸式的遮罩动画。
- **Immersive HUD (沉浸式 HUD)**:
  - Real-time monitoring of **FPS** and **Bass Energy**.
  - Standby mode with "System Waiting" animations.
  - 实时监控 **FPS（帧率）** 和 **低音能量值**。
  - 带有“系统待机”动画的待机模式。

## 🛠 Tech Stack / 技术栈

- **Frontend Framework**: React 18, Vite
- **Graphics**: HTML5 Canvas 2D API
- **Audio**: Web Audio API (Oscillators, GainNodes, DelayNodes, BiquadFilter, Analysers)
- **Styling**: CSS-in-JS & CSS Modules (Cyberpunk Neon Style)

## ⚡ Technical Highlights (Architecture) / 技术亮点（架构）

To ensure smooth performance (60FPS) while managing complex state, the project adopts a strict **Separation of Concerns**:
为了在管理复杂状态的同时确保流畅的性能（60FPS），项目采用了严格的**关注点分离**架构：

### 1. Logic Layer: `AudioEngine.js` (Singleton)

- **Role**: Manages the `AudioContext` lifecycle and signal graph.
- **Implementation**: Encapsulates complexity (Oscillators, Filters, Delay lines) into a singleton class. It handles data processing purely and exposes simple methods like `playTrack()` and `playSynth()`.
- **职责**：管理 `AudioContext` 生命周期和音频信号图。
- **实现**：将振荡器、滤波器、延迟线等复杂逻辑封装在单例类中。它纯粹处理数据，仅暴露 `playTrack()` 和 `playSynth()` 等简单方法。

### 2. Rendering Layer: `CyberpunkCanvas.jsx`

- **Role**: Handles high-performance graphics rendering.
- **Implementation**:
  - Runs outside React's render cycle using a `requestAnimationFrame` loop.
  - Uses `useRef` to manage mutable state (particles array) to avoid triggering React reconciliations for every frame.
- **职责**：处理高性能图形渲染。
- **实现**：
  - 通过 `requestAnimationFrame` 循环在 React 渲染周期之外运行。
  - 使用 `useRef` 管理可变状态（如粒子数组），避免每一帧都触发 React 的协调过程（Re-render）。

### 3. Control Layer: `App.jsx`

- **Role**: Manages UI state and user interactions.
- **Implementation**:
  - Handles Playlist logic, Drag & Drop events, and Play/Pause states.
  - Updates the high-frequency HUD elements (like the Bass Meter) via **Direct DOM Manipulation** (refs) instead of React State to maximize performance.
- **职责**：管理 UI 状态和用户交互。
- **实现**：
  - 处理播放列表逻辑、拖拽事件和播放/暂停状态。
  - 通过**直接 DOM 操作**（refs）而非 React State 来更新高频变化的 HUD 元素（如低音条），以最大化性能。

## 🚀 Getting Started / 快速开始

### Prerequisites / 前置要求

- Node.js (v14+)
- npm or yarn

### Installation / 安装步骤

1. **Clone the repository / 克隆仓库**

   ```bash
   git clone https://github.com/kogorou0105-bit/cyberpunk-visualizer.git
   cd cyberpunk-visualizer
   ```

2. **Install dependencies / 安装依赖**

   ```bash
   npm install
   ```

3. **Start the development server / 启动开发服务器**

   ```bash
   npm run dev
   ```

4. **Open in Browser / 浏览器打开**
   Visit `http://localhost:5173` to verify.

## 🎮 Controls / 操作指南

| Action           | Description                  | 操作                | 说明                         |
| :--------------- | :--------------------------- | :------------------ | :--------------------------- |
| **Play / Pause** | Toggle background music      | **播放 / 暂停**     | 切换背景音乐播放状态         |
| **Prev / Next**  | Switch tracks in playlist    | **上一首 / 下一首** | 切换预设播放列表中的曲目     |
| **Click Canvas** | Play Synth & Spawn Particles | **点击屏幕**        | 演奏合成器并生成粒子特效     |
| **Drag & Drop**  | Upload local `.mp3` file     | **拖拽文件**        | 上传本地 `.mp3` 文件进行播放 |
