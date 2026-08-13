import { useEffect, useRef } from 'react';

const COLORS = ['#0b0420', '#1a0b33', '#2d1b4e', '#4a2c6d', '#7b2d8e', '#c2379a', '#ff4d80', '#ff7a3d', '#ffb454', '#ffe0a3', '#2de0d0', '#4ecdc4', '#7ff5ff', '#f2f0ff'];

export function CityCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    const draw = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const scale = Math.max(1, Math.floor(window.devicePixelRatio));
      canvas.width = width * scale;
      canvas.height = height * scale;
      context.scale(scale, scale);
      context.imageSmoothingEnabled = false;
      context.fillStyle = COLORS[0];
      context.fillRect(0, 0, width, height);
      for (let star = 0; star < 36; star += 1) {
        const x = (star * 79) % width;
        const y = (star * 41) % Math.max(80, height * 0.52);
        context.fillStyle = star % 4 === 0 ? COLORS[12] : COLORS[9];
        context.fillRect(x, y, 2, 2);
      }
      const layers = [
        { base: height * 0.65, color: COLORS[2], seed: 47, min: 25, max: 84 },
        { base: height * 0.77, color: COLORS[3], seed: 71, min: 38, max: 138 },
        { base: height * 0.94, color: COLORS[1], seed: 59, min: 48, max: 175 },
      ];
      layers.forEach(({ base, color, seed, min, max }, layer) => {
        let x = -(seed % 32);
        let i = 0;
        while (x < width + 28) {
          const buildingWidth = 24 + ((i * seed) % 38);
          const buildingHeight = min + ((i * seed * 3) % (max - min));
          context.fillStyle = color;
          context.fillRect(x, base - buildingHeight, buildingWidth, buildingHeight);
          context.fillStyle = layer === 2 ? COLORS[10] : COLORS[6];
          for (let lightY = base - buildingHeight + 12; lightY < base - 8; lightY += 18) {
            if ((lightY + i) % 3 !== 0) context.fillRect(x + 8, lightY, 4, 4);
          }
          x += buildingWidth + 8;
          i += 1;
        }
      });
    };
    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, []);
  return <canvas ref={canvasRef} className="city-canvas" aria-hidden="true" />;
}
