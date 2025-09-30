import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const motivationalPhrases = [
  'Всё идёт своим чередом 🌸',
  'Ты в безопасности здесь и сейчас 🕊️',
  'Дыши спокойно, ты на верном пути 🌿',
  'Каждый момент — это новое начало 🌅',
  'Ты достаточно хорош таким, какой ты есть 💙',
  'Позволь себе просто быть 🦋',
  'Твои чувства важны и имеют значение 🌊',
  'Прими этот момент с добротой к себе 🌺',
  'Ты делаешь всё, что можешь — и этого достаточно 🌙',
  'Мир поддерживает тебя 🌍',
  'Твоё присутствие здесь имеет смысл ✨',
  'Отпусти то, что не можешь контролировать 🍃',
  'Ты заслуживаешь покоя и отдыха 🌌',
  'Доверься процессу жизни 🌻',
  'В тишине есть сила 🧘',
];

interface FloatingPhrase {
  id: number;
  text: string;
  x: number;
  y: number;
}

const Index = () => {
  const [energy, setEnergy] = useState(0);
  const [floatingPhrases, setFloatingPhrases] = useState<FloatingPhrase[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    setEnergy((prev) => prev + 10);
    setIsAnimating(true);

    const randomPhrase = motivationalPhrases[Math.floor(Math.random() * motivationalPhrases.length)];
    const buttonRect = document.getElementById('energy-button')?.getBoundingClientRect();
    
    const newPhrase: FloatingPhrase = {
      id: Date.now(),
      text: randomPhrase,
      x: window.innerWidth / 2,
      y: buttonRect ? buttonRect.top + 40 : window.innerHeight / 2,
    };

    setFloatingPhrases((prev) => [...prev, newPhrase]);

    setTimeout(() => {
      setFloatingPhrases((prev) => prev.filter((p) => p.id !== newPhrase.id));
    }, 1500);

    setTimeout(() => setIsAnimating(false), 200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxNDcsIDUxLCAyMzQsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
      
      <div className="relative z-10 text-center max-w-md w-full animate-fade-in">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-2">Энергия</h1>
          <p className="text-gray-500 text-lg">для Влада</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-purple-100">
          <div className="mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Icon name="Zap" size={32} className="text-primary" />
              <span className="text-6xl font-bold text-gray-800 transition-all duration-300">
                {energy}
              </span>
            </div>
            <p className="text-gray-500 text-sm">единиц энергии</p>
          </div>

          <Button
            id="energy-button"
            onClick={handleClick}
            size="lg"
            className={`w-full h-20 text-xl font-semibold rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl ${
              isAnimating ? 'scale-95' : 'scale-100'
            }`}
          >
            <Icon name="Sparkles" size={24} className="mr-2" />
            Получить энергию
          </Button>

          <div className="mt-6 flex justify-center gap-4 text-gray-400">
            <Icon name="Sparkles" size={20} className="animate-pulse-scale" />
            <Icon name="Sun" size={20} className="animate-pulse-scale" style={{ animationDelay: '0.3s' }} />
            <Icon name="Heart" size={20} className="animate-pulse-scale" style={{ animationDelay: '0.6s' }} />
          </div>
        </div>

        <p className="text-gray-400 text-sm">
          Нажимай на кнопку и получай мотивацию! 💜
        </p>
      </div>

      {floatingPhrases.map((phrase) => (
        <div
          key={phrase.id}
          className="fixed text-2xl font-medium text-primary animate-float-up pointer-events-none z-50 px-4 text-center"
          style={{
            left: '50%',
            top: `${phrase.y}px`,
            transform: 'translateX(-50%)',
            textShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
          }}
        >
          {phrase.text}
        </div>
      ))}
    </div>
  );
};

export default Index;