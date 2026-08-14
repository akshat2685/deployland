import { useEffect, useRef } from 'react';
import { usePlayerStore } from '../store/player-store';
import { calculateProductionPercentage } from '../engine/progression';
import { getCourseLevels } from '../content/course-registry';

export function CityCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const completed = usePlayerStore((player) => player.completedLevels);
  const levels = getCourseLevels('cicd');
  const prodPercent = calculateProductionPercentage(levels, completed);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationFrame: number;
    let time = 0;

    const draw = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const scale = Math.max(1, Math.floor(window.devicePixelRatio || 1));
      
      if (canvas.width !== width * scale || canvas.height !== height * scale) {
        canvas.width = width * scale;
        canvas.height = height * scale;
      }
      
      ctx.save();
      ctx.scale(scale, scale);
      ctx.imageSmoothingEnabled = false;
      
      // 1. Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#2d5bb9');
      skyGrad.addColorStop(0.5, '#5c94fc');
      skyGrad.addColorStop(0.85, '#94bcfc');
      skyGrad.addColorStop(1, '#c8dcfa');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);
      
      // 2. Parallax Clouds (Slow)
      for (let i = 0; i < 8; i++) {
        const cx = ((i * 180 + time * 8) % (width + 250)) - 120;
        const cy = 30 + ((i * 37) % (height * 0.25));
        
        // Cloud Shadow
        ctx.fillStyle = '#b8d0f8';
        ctx.fillRect(cx, cy + 8, 72, 20);
        ctx.fillRect(cx + 8, cy, 56, 16);
        
        // Cloud Main White
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx, cy + 4, 72, 16);
        ctx.fillRect(cx + 8, cy - 4, 48, 12);
        ctx.fillRect(cx + 20, cy - 10, 24, 8);
      }
      
      // 3. Far Mountains (Silhouette)
      ctx.fillStyle = '#3a5088';
      const mSpacing = 140;
      for (let i = -1; i < width / mSpacing + 2; i++) {
        const mx = i * mSpacing - ((time * 2) % mSpacing);
        const mHeight = 140 + ((i * 47) % 60);
        const mBase = height - 60;
        
        ctx.beginPath();
        ctx.moveTo(mx, mBase);
        ctx.lineTo(mx + mSpacing * 0.5, mBase - mHeight);
        ctx.lineTo(mx + mSpacing, mBase);
        ctx.fill();
        
        // Snow Peak
        ctx.fillStyle = '#d8e4f8';
        ctx.beginPath();
        ctx.moveTo(mx + mSpacing * 0.4, mBase - mHeight + 30);
        ctx.lineTo(mx + mSpacing * 0.5, mBase - mHeight);
        ctx.lineTo(mx + mSpacing * 0.6, mBase - mHeight + 30);
        ctx.lineTo(mx + mSpacing * 0.5, mBase - mHeight + 22);
        ctx.fill();
        ctx.fillStyle = '#3a5088';
      }

      // 4. Midground DevOps City Skyline & Factories
      const groundY = height - 36;
      let bx = -(time * 5 % 160);
      let idx = 0;
      
      while (bx < width + 120) {
        const bWidth = 48 + ((idx * 29) % 52);
        const bHeight = 70 + ((idx * 67) % 110);
        const bY = groundY - bHeight;
        const isRestored = ((idx * 19) % 100) < Math.max(15, prodPercent);

        // Factory Building Shadow / Outline
        ctx.fillStyle = '#182030';
        ctx.fillRect(bx, bY, bWidth, bHeight);
        
        // Factory Wall Facade
        ctx.fillStyle = isRestored ? '#485870' : '#283040';
        ctx.fillRect(bx + 3, bY + 3, bWidth - 6, bHeight - 3);

        // Factory Roof details (Smokestack or Antenna)
        if (idx % 2 === 0) {
          // Smokestack
          const stackX = bx + bWidth * 0.6;
          const stackW = 12;
          const stackH = 28;
          ctx.fillStyle = '#182030';
          ctx.fillRect(stackX, bY - stackH, stackW, stackH);
          ctx.fillStyle = isRestored ? '#c86820' : '#384050';
          ctx.fillRect(stackX + 2, bY - stackH + 2, stackW - 4, stackH - 2);

          // Animated Smoke Puffs if restored
          if (isRestored) {
            const puffTime = (time * 1.5 + idx) % 3;
            const puffY = bY - stackH - puffTime * 14;
            const puffX = stackX + 4 + Math.sin(time + idx) * 6;
            ctx.fillStyle = 'rgba(240, 244, 255, 0.7)';
            ctx.fillRect(puffX - 4, puffY, 8 + puffTime * 3, 6 + puffTime * 2);
          }
        } else {
          // Antenna with Blinking Red Safety Beacon
          const antX = bx + bWidth * 0.3;
          ctx.fillStyle = '#182030';
          ctx.fillRect(antX, bY - 20, 3, 20);
          
          if (Math.floor(time * 3 + idx) % 2 === 0) {
            ctx.fillStyle = '#ff2828';
            ctx.fillRect(antX - 2, bY - 24, 7, 5);
          }
        }

        // Factory Windows
        const cols = Math.floor((bWidth - 12) / 12);
        const rows = Math.floor((bHeight - 16) / 18);
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const wx = bx + 8 + c * 14;
            const wy = bY + 12 + r * 18;
            
            if (isRestored && (r + c + idx) % 3 !== 0) {
              // Glowing yellow or cyan window
              ctx.fillStyle = (r + c) % 2 === 0 ? '#ffe038' : '#38e8f8';
              ctx.fillRect(wx, wy, 8, 10);
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(wx + 2, wy + 2, 2, 2);
            } else {
              ctx.fillStyle = '#141820';
              ctx.fillRect(wx, wy, 8, 10);
            }
          }
        }

        // Inter-factory Green Pipes
        if (idx % 2 === 1) {
          const pipeY = groundY - 30 - ((idx * 17) % 30);
          ctx.fillStyle = '#0c1219';
          ctx.fillRect(bx + bWidth, pipeY - 2, 24, 10);
          ctx.fillStyle = isRestored ? '#20c040' : '#146020';
          ctx.fillRect(bx + bWidth, pipeY, 24, 6);
        }

        bx += bWidth + 14;
        idx++;
      }

      // 5. Foreground Earth & Grass Ground
      ctx.fillStyle = '#0c1219';
      ctx.fillRect(0, groundY - 2, width, height - groundY + 2);

      // Grass Rim
      ctx.fillStyle = '#38c838';
      ctx.fillRect(0, groundY, width, 8);
      ctx.fillStyle = '#209820';
      ctx.fillRect(0, groundY + 8, width, 6);

      // Dirt Texture
      ctx.fillStyle = '#783808';
      ctx.fillRect(0, groundY + 14, width, height - groundY - 14);

      // Animated Data Cable along the grass
      ctx.fillStyle = '#182438';
      ctx.fillRect(0, groundY + 10, width, 4);
      
      // Moving Data Packets on Ground Conduit
      const packetSpacing = 48;
      for (let p = 0; p < width / packetSpacing + 1; p++) {
        const px = (p * packetSpacing + time * 30) % width;
        ctx.fillStyle = prodPercent > 0 ? '#38e8f8' : '#687890';
        ctx.fillRect(px, groundY + 10, 8, 4);
      }

      ctx.restore();
    };
    
    const loop = () => {
      time += 0.04;
      draw();
      animationFrame = requestAnimationFrame(loop);
    };
    loop();
    
    window.addEventListener('resize', draw);
    return () => {
      window.removeEventListener('resize', draw);
      cancelAnimationFrame(animationFrame);
    };
  }, [prodPercent]);
  
  return <canvas ref={canvasRef} className="city-canvas" aria-hidden="true" />;
}
