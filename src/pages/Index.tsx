import { useState } from 'react';
import Icon from '@/components/ui/icon';

const therapyCards = [
  {
    id: 1,
    title: 'Дыхание 4-7-8',
    description: 'Вдох на 4 счёта, задержка на 7, выдох на 8. Повтори 3 раза.',
    category: 'Дыхание',
    icon: 'Wind' as const,
  },
  {
    id: 2,
    title: 'Техника 5-4-3-2-1',
    description: 'Назови 5 вещей, которые видишь, 4 — которые слышишь, 3 — которые чувствуешь, 2 запаха, 1 вкус.',
    category: 'Заземление',
    icon: 'Eye' as const,
  },
  {
    id: 3,
    title: 'Это временно',
    description: 'То, что ты чувствуешь сейчас — не навсегда. Эмоции приходят и уходят, как волны.',
    category: 'Аффирмация',
    icon: 'Waves' as const,
  },
  {
    id: 4,
    title: 'Прогрессивная релаксация',
    description: 'Напряги мышцы лица на 5 секунд, затем расслабь. Спустись вниз по телу.',
    category: 'Расслабление',
    icon: 'Sparkles' as const,
  },
  {
    id: 5,
    title: 'Ты в безопасности',
    description: 'Оглянись вокруг. Прямо сейчас, в этот момент, ты в безопасности.',
    category: 'Заземление',
    icon: 'Shield' as const,
  },
  {
    id: 6,
    title: 'Мысли — не факты',
    description: 'Твои тревожные мысли — это просто мысли. Они не определяют реальность.',
    category: 'КПТ',
    icon: 'Brain' as const,
  },
  {
    id: 7,
    title: 'Позволь себе чувствовать',
    description: 'Ты имеешь право на любые эмоции. Не нужно их подавлять или судить.',
    category: 'Принятие',
    icon: 'Heart' as const,
  },
  {
    id: 8,
    title: 'Квадратное дыхание',
    description: 'Вдох 4, удержание 4, выдох 4, пауза 4. Представь, как рисуешь квадрат.',
    category: 'Дыхание',
    icon: 'Square' as const,
  },
  {
    id: 9,
    title: 'Что в твоей власти?',
    description: 'Отпусти то, что не можешь контролировать. Сосредоточься на том, что в твоих руках.',
    category: 'Контроль',
    icon: 'Hand' as const,
  },
  {
    id: 10,
    title: 'Ты уже справлялся раньше',
    description: 'Вспомни трудные моменты в прошлом. Ты через них прошёл. И сейчас справишься.',
    category: 'Опыт',
    icon: 'History' as const,
  },
  {
    id: 11,
    title: 'Пауза перед реакцией',
    description: 'Между стимулом и реакцией есть пространство. Используй его.',
    category: 'Осознанность',
    icon: 'Pause' as const,
  },
  {
    id: 12,
    title: 'Визуализация безопасного места',
    description: 'Закрой глаза. Представь место, где ты чувствуешь себя спокойно. Побудь там минуту.',
    category: 'Визуализация',
    icon: 'Home' as const,
  },
  {
    id: 13,
    title: 'Прогресс, а не совершенство',
    description: 'Ты не обязан быть идеальным. Достаточно двигаться вперёд маленькими шагами.',
    category: 'Принятие',
    icon: 'TrendingUp' as const,
  },
  {
    id: 14,
    title: 'Переформулируй',
    description: 'Вместо "Я не справлюсь" попробуй "Это сложно, но я могу попробовать".',
    category: 'КПТ',
    icon: 'RefreshCw' as const,
  },
  {
    id: 15,
    title: 'Холодная вода на лицо',
    description: 'Умой лицо холодной водой 30 секунд. Это активирует нырятельный рефлекс и успокаивает.',
    category: 'Физиология',
    icon: 'Droplet' as const,
  },
  {
    id: 16,
    title: 'Ты делаешь всё, что можешь',
    description: 'В данный момент, с теми ресурсами, что у тебя есть — ты делаешь максимум.',
    category: 'Самосострадание',
    icon: 'Check' as const,
  },
  {
    id: 17,
    title: 'Сканирование тела',
    description: 'Пройдись вниманием от макушки до пальцев ног. Где чувствуется напряжение?',
    category: 'Осознанность',
    icon: 'User' as const,
  },
  {
    id: 18,
    title: 'Благодарность',
    description: 'Назови 3 вещи, за которые ты благодарен прямо сейчас. Даже самые простые.',
    category: 'Практика',
    icon: 'Gift' as const,
  },
  {
    id: 19,
    title: 'Эмоция — гость, не хозяин',
    description: 'Страх, тревога, грусть — они приходят в гости. Но не остаются навсегда.',
    category: 'Метафора',
    icon: 'DoorOpen' as const,
  },
  {
    id: 20,
    title: 'Обнять себя',
    description: 'Физически обними себя. Давление на тело успокаивает нервную систему.',
    category: 'Физиология',
    icon: 'HeartHandshake' as const,
  },
];

const Index = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState<number[]>([]);
  const [disliked, setDisliked] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const currentCard = therapyCards[currentIndex];
  const hasMoreCards = currentIndex < therapyCards.length;

  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setStartPos({ x: clientX, y: clientY });
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    const deltaX = clientX - startPos.x;
    const deltaY = clientY - startPos.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (Math.abs(dragOffset.x) > 100) {
      if (dragOffset.x > 0) {
        setLiked((prev) => [...prev, currentCard.id]);
      } else {
        setDisliked((prev) => [...prev, currentCard.id]);
      }
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setDragOffset({ x: 0, y: 0 });
      }, 200);
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const handleLike = () => {
    setLiked((prev) => [...prev, currentCard.id]);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleDislike = () => {
    setDisliked((prev) => [...prev, currentCard.id]);
    setCurrentIndex((prev) => prev + 1);
  };

  const rotation = isDragging ? dragOffset.x / 20 : 0;
  const opacity = Math.max(0.5, 1 - Math.abs(dragOffset.x) / 300);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxNDcsIDUxLCAyMzQsIDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40" />

      <div className="relative z-10 mb-8 text-center animate-fade-in">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Терапевтические карточки</h1>
        <p className="text-gray-500">Свайпай вправо, если откликается 💜</p>
      </div>

      <div className="relative z-10 flex items-center justify-center mb-8">
        <div className="flex gap-8">
          <div className="flex items-center gap-2 text-red-500">
            <Icon name="X" size={24} />
            <span className="text-2xl font-bold">{disliked.length}</span>
          </div>
          <div className="flex items-center gap-2 text-green-500">
            <Icon name="Heart" size={24} />
            <span className="text-2xl font-bold">{liked.length}</span>
          </div>
        </div>
      </div>

      <div className="relative w-full max-w-md h-[500px] flex items-center justify-center mb-6">
        {!hasMoreCards ? (
          <div className="text-center animate-fade-in">
            <div className="mb-4">
              <Icon name="CheckCircle" size={64} className="text-green-500 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Все карточки просмотрены! 🎉</h2>
            <p className="text-gray-600 mb-4">Ты изучил {liked.length} техник, которые тебе откликнулись</p>
            <button
              onClick={() => {
                setCurrentIndex(0);
                setLiked([]);
                setDisliked([]);
              }}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all"
            >
              Начать заново
            </button>
          </div>
        ) : (
          <div
            className="absolute w-full h-[450px] cursor-grab active:cursor-grabbing"
            style={{
              transform: `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) rotate(${rotation}deg)`,
              transition: isDragging ? 'none' : 'transform 0.3s ease-out',
              opacity,
            }}
            onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
            onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
            onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
            onTouchEnd={handleEnd}
          >
            <div className="bg-white rounded-3xl shadow-2xl p-8 h-full flex flex-col items-center justify-center text-center border border-purple-100">
              <div className="mb-6 p-4 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl">
                <Icon name={currentCard.icon} size={48} className="text-primary" />
              </div>

              <div className="mb-2 px-4 py-1 bg-purple-50 rounded-full">
                <span className="text-xs font-medium text-primary">{currentCard.category}</span>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">{currentCard.title}</h2>

              <p className="text-gray-600 text-lg leading-relaxed">{currentCard.description}</p>

              <div className="mt-6 text-sm text-gray-400">
                {currentIndex + 1} / {therapyCards.length}
              </div>
            </div>

            {isDragging && Math.abs(dragOffset.x) > 50 && (
              <div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl font-bold pointer-events-none"
                style={{
                  color: dragOffset.x > 0 ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)',
                }}
              >
                {dragOffset.x > 0 ? '💚' : '❌'}
              </div>
            )}
          </div>
        )}
      </div>

      {hasMoreCards && (
        <div className="relative z-10 flex gap-6">
          <button
            onClick={handleDislike}
            className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center text-red-500 hover:scale-110 transition-transform"
          >
            <Icon name="X" size={32} />
          </button>
          <button
            onClick={handleLike}
            className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center text-green-500 hover:scale-110 transition-transform"
          >
            <Icon name="Heart" size={32} />
          </button>
        </div>
      )}

      <div className="relative z-10 mt-6 flex gap-4 text-gray-400 text-sm">
        <div className="flex items-center gap-2">
          <Icon name="ArrowLeft" size={16} />
          <span>Пропустить</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Откликается</span>
          <Icon name="ArrowRight" size={16} />
        </div>
      </div>
    </div>
  );
};

export default Index;