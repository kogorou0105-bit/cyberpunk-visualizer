import { useState, useRef } from "react";
import CyberpunkCanvas from "./components/CyberpunkCanvas";
import { audioEngine } from "./utils/AudioEngine";

const PLAYLIST = [
  { name: "Cascade Breathe", url: "/cascade-breathe-future-garage-412839.mp3" },
  { name: "Hype Drill Music", url: "/hype-drill-music-438398.mp3" },
  {
    name: "The Last Point",
    url: "/the-last-point-beat-electronic-digital-394291.mp3",
  },
];

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [customTrackName, setCustomTrackName] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const bassRef = useRef(null);
  const bassBarRef = useRef(null);
  const fpsRef = useRef(null);
  const lastTimeRef = useRef(0);
  const fileInputRef = useRef(null);

  const updateHud = (bassAvg) => {
    if (bassRef.current) bassRef.current.innerText = Math.floor(bassAvg);
    if (bassBarRef.current) {
      const scale = bassAvg / 255;
      bassBarRef.current.style.width = `${scale * 100}%`;
      bassBarRef.current.style.backgroundColor =
        scale > 0.8 ? "#ff0055" : "#00ffcc";
      bassBarRef.current.style.boxShadow = `0 0 ${scale * 20}px ${
        scale > 0.8 ? "#ff0055" : "#00ffcc"
      }`;
    }

    const now = performance.now();
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = now;
      return;
    }
    const delta = now - lastTimeRef.current;
    if (delta >= 500) {
      const fps = Math.round((1 * 1000) / (delta / 30));
      if (fpsRef.current) fpsRef.current.innerText = fps;
      lastTimeRef.current = now;
    }
  };

  const handlePlayToggle = async () => {
    if (!isInitialized) {
      await audioEngine.playTrack(PLAYLIST[0].url);
      setIsInitialized(true);
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        audioEngine.pause();
      } else {
        audioEngine.resume();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const changeTrack = (dir) => {
    let next = trackIndex + dir;
    if (next < 0) next = PLAYLIST.length - 1;
    if (next >= PLAYLIST.length) next = 0;

    setTrackIndex(next);
    setCustomTrackName(null);
    audioEngine.playTrack(PLAYLIST[next].url);
    setIsPlaying(true);
    setIsInitialized(true);
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    const success = await audioEngine.playTrack(file);
    if (success) {
      // 成功播放后，设置自定义文件名，保留 "File:" 前缀
      setCustomTrackName(`File: ${file.name}`);
      setIsPlaying(true);
      setIsInitialized(true);
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0)
      handleFileUpload(e.dataTransfer.files[0]);
  };

  const handleCanvasInteract = () => {
    if (isInitialized && !isPlaying) setIsPlaying(true);
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        background: "#000",
        overflow: "hidden",
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* 1. HUD */}
      <div
        id="ui-layer"
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          display: "flex",
          gap: 20,
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        <div className="hud-box">
          <div className="hud-title">SYSTEM STATUS</div>
          <div className="hud-value" ref={fpsRef}>
            --
          </div>
        </div>
        <div className="hud-box">
          <div className="hud-title">BASS ENERGY</div>
          <div className="hud-value" ref={bassRef}>
            0
          </div>
          <div
            style={{
              width: "100%",
              height: 4,
              background: "#333",
              marginTop: 5,
            }}
          >
            <div
              ref={bassBarRef}
              style={{ width: "0%", height: "100%", background: "#ff0055" }}
            ></div>
          </div>
        </div>
      </div>

      {/* 2. Standby UI */}
      {!isPlaying && !isDragging && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 15,
            pointerEvents: "none",
            textAlign: "center",
            animation: "pulse 2s infinite",
          }}
        >
          <div
            style={{
              border: "1px solid #0ff",
              padding: "40px 60px",
              background: "rgba(0, 20, 40, 0.7)",
              backdropFilter: "blur(5px)",
              boxShadow: "0 0 20px rgba(0, 255, 255, 0.2)",
            }}
          >
            <h1
              style={{
                color: "#0ff",
                fontSize: "24px",
                letterSpacing: "4px",
                margin: "0 0 20px 0",
                fontFamily: "Courier New",
              }}
            >
              SYSTEM STANDBY
            </h1>

            <div
              style={{
                color: "#fff",
                fontSize: "14px",
                lineHeight: "24px",
                fontFamily: "Courier New",
              }}
            >
              <div>&gt; AWAITING INPUT STREAM...</div>
              <div>
                &gt; PRESS <strong>PLAY</strong> TO START
              </div>
              <div
                style={{
                  color: "#ff0055",
                  marginTop: "15px",
                  fontWeight: "bold",
                }}
              >
                [ OR DRAG & DROP MP3 FILE ]
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- 【修复】3. Track Info (增强可见性) --- */}
      <div
        style={{
          position: "absolute",
          bottom: 180, // 确保位置不被控制栏挡住
          width: "100%",
          textAlign: "center",
          // 颜色改为亮白，并增加文字阴影
          color: "#fff",
          textShadow: "0 0 10px #0ff",
          pointerEvents: "none",
          letterSpacing: 2,
          zIndex: 30, // 【关键】强制置顶
          fontFamily: "Courier New",
          fontWeight: "bold",
          fontSize: "16px",
        }}
      >
        TRACK: {customTrackName || PLAYLIST[trackIndex].name}
      </div>

      {/* 4. Controls */}
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          bottom: 40,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 20,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 20,
            padding: "15px 30px",
            background: "rgba(0,0,0,0.8)",
            borderRadius: 50,
            border: "1px solid #333",
            backdropFilter: "blur(10px)",
          }}
        >
          <button className="btn" onClick={() => changeTrack(-1)}>
            PREV
          </button>
          <button className="btn btn-play" onClick={handlePlayToggle}>
            {isPlaying ? "PAUSE" : "PLAY"}
          </button>
          <button className="btn" onClick={() => changeTrack(1)}>
            NEXT
          </button>
          <button className="btn" onClick={() => fileInputRef.current?.click()}>
            UPLOAD
          </button>
        </div>
        <div
          style={{
            color: "#00ffcc",
            fontSize: "10px",
            letterSpacing: "1px",
            opacity: 0.7,
          }}
        >
          * DRAG & DROP SUPPORTED
        </div>
      </div>

      <CyberpunkCanvas
        onUpdateHud={updateHud}
        onInteract={handleCanvasInteract}
      />

      <input
        type="file"
        accept="audio/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={(e) => handleFileUpload(e.target.files[0])}
      />

      {/* Drag Overlay */}
      {isDragging && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            zIndex: 999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            border: "4px dashed #0ff",
            boxSizing: "border-box",
            pointerEvents: "none",
          }}
        >
          <h1
            style={{
              color: "#0ff",
              fontSize: "3rem",
              margin: 0,
              textShadow: "0 0 20px #0ff",
              fontFamily: "Courier New",
            }}
          >
            DETECTING DATA STREAM
          </h1>
          <p style={{ color: "#fff", marginTop: 20, letterSpacing: 2 }}>
            DROP FILE TO INJECT AUDIO
          </p>
        </div>
      )}

      <style>{`
        .hud-box { border: 1px solid rgba(0, 255, 255, 0.3); background: rgba(0, 20, 40, 0.6); padding: 10px; min-width: 120px; backdrop-filter: blur(4px); }
        .hud-title { font-size: 10px; color: #ff0055; margin-bottom: 5px; font-weight: bold; }
        .hud-value { font-family: monospace; font-size: 18px; color: #0ff; }
        .btn { background: transparent; border: 1px solid #0ff; color: #0ff; padding: 10px 20px; border-radius: 20px; cursor: pointer; font-weight: bold; min-width: 80px; transition: all 0.2s; }
        .btn:hover { background: rgba(0, 255, 255, 0.1); box-shadow: 0 0 15px #0ff; }
        .btn-play { border-color: #ff0055; color: #ff0055; }
        .btn-play:hover { background: rgba(255, 0, 85, 0.1); box-shadow: 0 0 15px #ff0055; }
        
        @keyframes pulse {
          0% { opacity: 0.8; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.02); }
          100% { opacity: 0.8; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </div>
  );
}

export default App;
