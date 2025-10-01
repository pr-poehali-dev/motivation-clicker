import Icon from '@/components/ui/icon';

interface Card {
  id: number;
  question: string;
  category: string;
  type?: 'question' | 'insight';
  insight?: string;
}

interface TherapyCardProps {
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
  getIconForQuestion: (question: string, category: string) => string;
}

const TherapyCard = ({
  card,
  cardKey,
  isDragging,
  isExiting,
  dragOffset,
  rotation,
  opacity,
  onStart,
  onMove,
  onEnd,
  getIconForQuestion
}: TherapyCardProps) => {
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
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 h-full flex flex-col items-center justify-center text-center border border-purple-100 dark:border-purple-900 transition-colors duration-300 relative overflow-y-auto">
        
        <div className="mb-6 p-4 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-2xl">
          <Icon name={getIconForQuestion(card.question, card.category)} size={48} className="text-primary" />
        </div>

        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 px-2">{card.question}</h2>
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

export default TherapyCard;
