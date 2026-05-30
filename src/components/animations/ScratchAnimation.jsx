import React, { useEffect, useRef, useState } from 'react';

// Звук стирания (можно заменить на свой файл)
const SCRATCH_SOUND_URL = 'https://cdn.freesound.org/previews/550/550659_12071503-lq.mp3';

const ScratchAnimation = ({ winner, onComplete }) => {
  const canvasRef = useRef(null);
  const [revealed, setRevealed] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // 1. Рисуем серебряный слой
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#C0C0C0');
    gradient.addColorStop(0.25, '#E8E8E8');
    gradient.addColorStop(0.5, '#A9A9A9');
    gradient.addColorStop(0.75, '#D3D3D3');
    gradient.addColorStop(1, '#808080');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Добавляем текстуру "шума"
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    for (let i = 0; i < 1000; i++) {
      ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2);
    }

    // Текст на серебре
    ctx.fillStyle = '#555';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('СТИРАЙТЕ...', width / 2, height / 2);

    // 2. Запускаем анимацию стирания
    const audio = new Audio(SCRATCH_SOUND_URL);
    audio.loop = true;
    audio.play().catch(e => console.log('Audio play failed (interaction needed)'));

    let progress = 0;
    const speed = 2; // Скорость стирания

    const animate = () => {
      progress += speed;
      
      // Эффект "стирания" через случайные круги
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 1)';
      
      for (let i = 0; i < 5; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const radius = Math.random() * 20 + 10;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      if (progress < 100) {
        requestAnimationFrame(animate);
      } else {
        // Финиш
        setRevealed(true);
        setIsAnimating(false);
        audio.pause();
        audio.currentTime = 0;
        if (onComplete) onComplete();
      }
    };

    // Небольшая задержка перед стартом
    setTimeout(() => {
      animate();
    }, 500);

  }, [winner, onComplete]);

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[1.6/1] rounded-xl overflow-hidden shadow-2xl transform transition-transform duration-500"
         style={revealed ? { transform: 'scale(1.05)' } : {}}>
      
      {/* Слой с именем победителя (подложка) */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-700 flex items-center justify-center p-6">
        <h2 className="text-4xl md:text-5xl font-black text-white text-center drop-shadow-lg uppercase tracking-wider">
          {winner}
        </h2>
      </div>

      {/* Серебряный слой (Canvas) */}
      <canvas
        ref={canvasRef}
        width={400}
        height={250}
        className="absolute inset-0 w-full h-full cursor-pointer"
      />
    </div>
  );
};

export default ScratchAnimation;