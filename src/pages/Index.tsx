import { useState, useRef } from 'react';
import { useSprings, animated, to as interpolate } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
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

const to = (i: number) => ({
  x: 0,
  y: i * -4,
  scale: 1,
  rot: -10 + Math.random() * 20,
  delay: i * 100,
});

const from = (_i: number) => ({ x: 0, rot: 0, scale: 1.5, y: -1000 });

const trans = (r: number, s: number) =>
  `perspective(1500px) rotateX(30deg) rotateY(${r / 10}deg) rotateZ(${r}deg) scale(${s})`;

const Index = () => {
  const [gone] = useState(() => new Set());
  const [liked, setLiked] = useState<number[]>([]);
  const [disliked, setDisliked] = useState<number[]>([]);

  const [props, api] = useSprings(therapyCards.length, (i) => ({
    ...to(i),
    from: from(i),
  }));

  const bind = useDrag(
    ({ args: [index], active, movement: [mx], direction: [xDir], velocity: [vx] }) => {
      const trigger = vx > 0.2;
      if (!active && trigger) {
        gone.add(index);
        const cardId = therapyCards[index].id;
        if (mx > 0) {
          setLiked((prev) => [...prev, cardId]);
        } else {
          setDisliked((prev) => [...prev, cardId]);
        }
      }
      api.start((i) => {
        if (index !== i) return;
        const isGone = gone.has(index);
        const x = isGone ? (200 + window.innerWidth) * xDir : active ? mx : 0;
        const rot = mx / 100 + (isGone ? xDir * 10 * vx : 0);
        const scale = active ? 1.1 : 1;
        return {
          x,
          rot,
          scale,
          delay: undefined,
          config: { friction: 50, tension: active ? 800 : isGone ? 200 : 500 },
        };
      });
      if (!active && gone.size === therapyCards.length) {
        setTimeout(() => {
          gone.clear();
          api.start((i) => to(i));
        }, 600);
      }
    }
  );

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

      <div className="relative w-full max-w-md h-[500px] flex items-center justify-center">
        {props.map(({ x, y, rot, scale }, i) => (
          <animated.div
            key={therapyCards[i].id}
            style={{
              transform: interpolate([x, y], (x, y) => `translate3d(${x}px,${y}px,0)`),
              position: 'absolute',
              width: '100%',
              height: '450px',
              willChange: 'transform',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              touchAction: 'none',
            }}
          >
            <animated.div
              {...bind(i)}
              style={{
                transform: interpolate([rot, scale], trans),
                width: '100%',
                height: '100%',
              }}
              className="bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center justify-center text-center border border-purple-100 cursor-grab active:cursor-grabbing"
            >
              <div className="mb-6 p-4 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl">
                <Icon name={therapyCards[i].icon} size={48} className="text-primary" />
              </div>

              <div className="mb-2 px-4 py-1 bg-purple-50 rounded-full">
                <span className="text-xs font-medium text-primary">{therapyCards[i].category}</span>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">{therapyCards[i].title}</h2>

              <p className="text-gray-600 text-lg leading-relaxed">{therapyCards[i].description}</p>
            </animated.div>
          </animated.div>
        ))}
      </div>

      <div className="relative z-10 mt-8 flex gap-4 text-gray-400 text-sm">
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