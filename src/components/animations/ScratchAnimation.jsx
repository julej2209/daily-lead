import React, { useEffect, useRef, useState } from 'react';

// ГРОМКИЙ звук стирания (несколько источников для громкости)
const SCRATCH_SOUNDS = [
  'https://assets.mixkit.co/sfx/preview/mixkit-sand-sifting-sound-1943.mp3',
  'https://assets.mixkit.co/sfx/preview/mixkit-paper-tearing-sound-effect-1946.mp3',
  'https://assets.mixkit.co/sfx/preview/mixkit-scratching-cardboard-1942.mp3'
];

const ScratchAnimation = ({ winner, onComplete }) => {
  const canvasRef = useRef(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const audioRefs = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !winner) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Очистка холста
    ctx.clearRect(0, 0, width, height);

    // 1. Рисуем серебряный защитный слой
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#C0C0C0');
    gradient.addColorStop(0.25, '#E8E8E8');
    gradient.addColorStop(0.5, '#A8A8A8');
    gradient.addColorStop(0.75, '#D8D8D8');
    gradient.addColorStop(1, '#B0B0B0');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Текстура "металлического блеска"
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    for (let i = 0; i < 800; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 2 + 0.5;
      ctx.fillRect(x, y, size, size);
    }

    // Текст "CARD"
    ctx.fillStyle = '#888';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CARD', width / 2, height / 2);

    // 2. ЗАПУСКАЕМ ГРОМКИЙ ЗВУК (несколько источников одновременно)
    const playLoudSound = () => {
      // Очищаем старые аудио
      audioRefs.current.forEach(audio => {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
      audioRefs.current = [];

      // Создаём несколько аудио для усиления эффекта
      SCRATCH_SOUNDS.forEach((url, index) => {
        const audio = new Audio(url);
        audio.volume = 1.0; // МАКСИМАЛЬНАЯ ГРОМКОСТЬ
        audio.loop = true;
        
        // Небольшая задержка для каждого источника для объёма
        setTimeout(() => {
          audio.play().catch(e => console.log(`Audio ${index} failed:`, e));
        }, index * 50);
        
        audioRefs.current.push(audio);
      });
    };

    // 3. Создаём МНОЖЕСТВЕННЫЕ зигзагообразные царапины (как рукой)
    const createMultipleZigzagPaths = () => {
      const allPaths = [];
      const duration = 2000; // 2 секунды
      const fps = 60;
      const totalFrames = (duration / 1000) * fps; // 120 кадров
      
      // Создаём 5-7 параллельных траекторий (как несколько пальцев/движений)
      const numPaths = 6;
      
      for (let p = 0; p < numPaths; p++) {
        const path = [];
        const startY = (height / (numPaths + 1)) * (p + 1); // Распределяем по вертикали
        const zigzagAmplitude = 25 + Math.random() * 20; // Разная амплитуда
        const zigzagFrequency = 8 + Math.random() * 4; // Разная частота
        const phaseOffset = Math.random() * Math.PI * 2; // Случайная фаза
        
        for (let i = 0; i <= totalFrames; i++) {
          const t = i / totalFrames;
          const x = (width * 0.05) + (width * 0.9) * t; // От 5% до 95% ширины
          
          // Зигзаг с наложением случайности (как реальная рука)
          const zigzag = Math.sin(t * Math.PI * zigzagFrequency + phaseOffset) * zigzagAmplitude;
          const randomWobble = (Math.random() - 0.5) * 30; // Случайное дрожание руки
          
          const y = startY + zigzag + randomWobble;
          
          path.push({
            x,
            y,
            radius: 20 + Math.random() * 15, // Разный размер "царапин"
            pressure: 0.6 + Math.random() * 0.4 // Разная интенсивность
          });
        }
        
        allPaths.push(path);
      }
      
      return allPaths;
    };

    const scratchPaths = createMultipleZigzagPaths();
    
    // 4. Анимация интенсивного стирания
    let currentFrame = 0;
    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      ctx.globalCompositeOperation = 'destination-out';
      
      // Рисуем ВСЕ траектории до текущего кадра
      const framesToDraw = Math.floor(scratchPaths[0].length * progress);
      
      scratchPaths.forEach((path, pathIndex) => {
        for (let i = 0; i < framesToDraw; i++) {
          const point = path[i];
          if (!point) continue;
          
          // Основная царапина (интенсивная)
          const grad = ctx.createRadialGradient(
            point.x, point.y, 0,
            point.x, point.y, point.radius * point.pressure
          );
          grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
          grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.9)');
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          
          ctx.beginPath();
          ctx.ellipse(
            point.x, point.y,
            point.radius * 1.5, // Вытянутая форма (как царапина)
            point.radius * 0.6,
            Math.random() * Math.PI, // Случайный угол
            0, Math.PI * 2
          );
          ctx.fillStyle = grad;
          ctx.fill();
          
          // Дополнительные микро-царапины вокруг
          if (i % 2 === 0) {
            for (let j = 0; j < 3; j++) {
              const offsetX = (Math.random() - 0.5) * 50;
              const offsetY = (Math.random() - 0.5) * 50;
              const radius = Math.random() * 10 + 3;
              
              ctx.beginPath();
              ctx.arc(point.x + offsetX, point.y + offsetY, radius, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(0, 0, 0, ${0.3 + Math.random() * 0.4})`;
              ctx.fill();
            }
          }
        }
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Анимация завершена
        setIsRevealed(true);
        
        // Останавливаем все звуки
        audioRefs.current.forEach(audio => {
          if (audio) {
            audio.pause();
            audio.currentTime = 0;
          }
        });
        audioRefs.current = [];
        
        if (onComplete) {
          setTimeout(() => onComplete(), 300);
        }
      }
    };

    // Запускаем звук и анимацию
    playLoudSound();
    const startTimeout = setTimeout(() => {
      animate();
    }, 50);

    return () => {
      clearTimeout(startTimeout);
      audioRefs.current.forEach(audio => {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
    };
  }, [winner, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Контейнер карточки */}
      <div 
        className={`relative w-full max-w-md aspect-[1.6/1] rounded-2xl overflow-hidden shadow-lg transition-all duration-700 ease-out ${
          isRevealed ? 'scale-105 shadow-2xl' : 'scale-100'
        }`}
      >
        {/* Слой с именем победителя (нижний слой) */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-800 flex items-center justify-center p-6">
          <div className="text-center">
            <h2 className="text-5xl md:text-6xl font-black text-white drop-shadow-2xl uppercase tracking-wider animate-pulse">
              {winner}
            </h2>
            <p className="text-purple-200 mt-3 text-lg font-medium">Сегодня ведёт встречу</p>
          </div>
        </div>

        {/* Серебряный защитный слой (Canvas) - верхний слой */}
        <canvas
          ref={canvasRef}
          width={400}
          height={250}
          className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${
            isRevealed ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
          style={{ touchAction: 'none' }}
        />
      </div>

      {/* Подсказка */}
      {!isRevealed && (
        <p className="text-gray-500 text-sm mt-4 animate-pulse font-medium">
          ✦ Открываем карту... ✦
        </p>
      )}
    </div>
  );
};

export default ScratchAnimation;