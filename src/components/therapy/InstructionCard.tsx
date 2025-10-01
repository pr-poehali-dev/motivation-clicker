import Icon from '@/components/ui/icon';
import Lottie from 'lottie-react';

interface InstructionCardProps {
  isDragging: boolean;
  isExiting: boolean;
  dragOffset: { x: number; y: number };
  rotation: number;
  opacity: number;
  swipeAnimation: any;
  onStart: (clientX: number, clientY: number) => void;
  onMove: (clientX: number, clientY: number) => void;
  onEnd: () => void;
}

const InstructionCard = ({
  isDragging,
  isExiting,
  dragOffset,
  rotation,
  opacity,
  swipeAnimation,
  onStart,
  onMove,
  onEnd
}: InstructionCardProps) => {
  return (
    <div
      key="instruction-card"
      className="absolute w-full h-[560px] cursor-grab active:cursor-grabbing animate-fade-in"
      style={{
        transform: `translateX(${dragOffset.x}px) rotate(${rotation}deg)`,
        transition: isDragging ? 'none' : isExiting ? 'transform 0.3s ease-in, opacity 0.3s ease-in' : 'transform 0.3s ease-out',
        opacity: isExiting ? 0 : opacity,
      }}
      onMouseDown={(e) => onStart(e.clientX, e.clientY)}
      onMouseMove={(e) => onMove(e.clientX, e.clientY)}
      onMouseUp={onEnd}
      onMouseLeave={onEnd}
      onTouchStart={(e) => {
        e.preventDefault();
        onStart(e.touches[0].clientX, e.touches[0].clientY);
      }}
      onTouchMove={(e) => {
        e.preventDefault();
        onMove(e.touches[0].clientX, e.touches[0].clientY);
      }}
      onTouchEnd={onEnd}
    >
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 h-full flex flex-col items-center justify-center text-center border border-purple-100 dark:border-purple-900 transition-colors duration-300 relative overflow-y-auto">
        <div className="mb-4">
          {swipeAnimation ? (
            <div className="bg-white rounded-2xl p-2">
              <Lottie
                animationData={swipeAnimation}
                loop={true}
                autoplay={true}
                style={{ width: 80, height: 80 }}
              />
            </div>
          ) : (
            <Icon name="Hand" size={48} className="text-primary" />
          )}
        </div>

        <div className="mb-3 px-4 py-1 bg-purple-50 dark:bg-purple-900/30 rounded-full">
          <span className="text-xs font-medium text-primary">Инструкция</span>
        </div>

        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">Добро пожаловать!</h2>
        
        <div className="space-y-3 text-gray-600 dark:text-gray-300 text-sm px-2">
          <p className="leading-relaxed">
            Это мини-сессия с психологом через карточки. Я помогу разобраться в причинах твоего состояния и найти пути решения.
          </p>
          
          <p className="leading-relaxed font-semibold text-purple-700 dark:text-purple-400">
            Результат: ты получишь осознание своих паттернов и конкретный план действий.
          </p>
          
          <div className="space-y-2 pt-2">
            <p className="flex items-center gap-2 justify-center">
              <span className="text-xl">👉</span>
              <span>Свайп вправо — Да</span>
            </p>
            <p className="flex items-center gap-2 justify-center">
              <span className="text-xl">👈</span>
              <span>Свайп влево — Нет</span>
            </p>
          </div>
        </div>

        <div className="mt-3 text-sm text-gray-400 dark:text-gray-500">
          Свайпни, чтобы начать сессию
        </div>
      </div>

      {isDragging && Math.abs(dragOffset.x) > 50 && (
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl font-bold pointer-events-none"
          style={{
            color: dragOffset.x > 0 ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)',
          }}
        >
          {dragOffset.x > 0 ? '✅' : '❌'}
        </div>
      )}
    </div>
  );
};

export default InstructionCard;
