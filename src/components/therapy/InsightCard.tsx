import Icon from '@/components/ui/icon';

interface Card {
  id: number;
  question: string;
  category: string;
  type?: 'question' | 'insight';
  insight?: string;
}

interface InsightCardProps {
  card: Card;
  cardKey: number;
  isDragging: boolean;
  isExiting: boolean;
  dragOffset: { x: number; y: number };
  rotation: number;
  opacity: number;
  onStart: (clientX: number, clientY: number) => void;
  onMove: (clientX: number, clientY: number) => void;
  onEnd: () => void;
}

const InsightCard = ({
  card,
  cardKey,
  isDragging,
  isExiting,
  dragOffset,
  rotation,
  opacity,
  onStart,
  onMove,
  onEnd
}: InsightCardProps) => {
  return (
    <div
      key={cardKey}
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
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-3xl shadow-2xl p-6 h-full flex flex-col items-center justify-center text-center border-2 border-purple-200 dark:border-purple-800 transition-colors duration-300 relative">
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-2xl">
          <Icon name="Lightbulb" size={48} className="text-amber-500" />
        </div>

        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">Промежуточная сводка</h2>

        <p className="text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap text-sm px-4">
          {card.insight || card.question}
        </p>

        <div className="mt-6 text-xs text-gray-400 dark:text-gray-500">
          Свайпни вправо если полезно, влево если нет
        </div>
      </div>

      {isDragging && Math.abs(dragOffset.x) > 50 && (
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl font-bold pointer-events-none"
          style={{
            color: dragOffset.x > 0 ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)',
          }}
        >
          {dragOffset.x > 0 ? '👍' : '👎'}
        </div>
      )}
    </div>
  );
};

export default InsightCard;
