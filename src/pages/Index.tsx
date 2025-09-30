import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import Lottie from 'lottie-react';

interface Card {
  id: number;
  question: string;
  category: string;
  type?: 'question' | 'insight';
  insight?: string;
}

interface Answer {
  question: string;
  answer: boolean;
}

const THERAPY_URL = 'https://functions.poehali.dev/aa8579aa-b123-4fcd-aa83-0c89accb40dc';
const SESSION_URL = 'https://functions.poehali.dev/da0083c2-29d8-4bba-9002-7a5225186e44';

const Index = () => {
  const [clientId, setClientId] = useState<string>('');
  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [history, setHistory] = useState<Answer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showInstructionCard, setShowInstructionCard] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [isExiting, setIsExiting] = useState(false);
  const [cardKey, setCardKey] = useState(0);
  const [swipeAnimation, setSwipeAnimation] = useState<any>(null);
  const [animationLoopCount, setAnimationLoopCount] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    fetch('/swipe.json')
      .then(res => res.json())
      .then(data => setSwipeAnimation(data))
      .catch(err => console.error('Failed to load animation:', err));
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const getClientId = (): string => {
    if (typeof window !== 'undefined' && (window as any).yaCounter101026698) {
      return (window as any).yaCounter101026698.getClientID() || 'anonymous';
    }
    return 'anonymous';
  };

  const fetchCards = async (currentHistory: Answer[], currentCount: number) => {
    try {
      const response = await fetch(THERAPY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: currentHistory,
          current_count: currentCount
        })
      });
      const data = await response.json();
      return data.cards || [];
    } catch (error) {
      console.error('Failed to fetch cards:', error);
      return [];
    }
  };

  const initialCards: Card[] = [
    { id: 0, question: "Ты чувствуешь тревогу прямо сейчас?", category: "diagnostic" },
    { id: 1, question: "Это чувство мешает тебе в повседневной жизни?", category: "diagnostic" },
    { id: 2, question: "Ты хочешь что-то изменить в своей жизни?", category: "diagnostic" },
    { id: 3, question: "Есть ли у тебя поддержка со стороны близких?", category: "diagnostic" },
    { id: 4, question: "Ты готов работать над собой?", category: "diagnostic" }
  ];

  useEffect(() => {
    const initSession = async () => {
      const id = getClientId();
      setClientId(id);
      
      try {
        const response = await fetch(`${SESSION_URL}?client_id=${id}`);
        const sessionData = await response.json();
        
        if (sessionData.cards && sessionData.cards.length > 0) {
          setCards(sessionData.cards);
          setHistory(sessionData.history || []);
          if (sessionData.current_index > 0) {
            setShowInstructionCard(false);
            setCurrentIndex(sessionData.current_index);
          }
        } else {
          setCards(initialCards);
        }
      } catch (error) {
        console.error('Failed to load session:', error);
        setCards(initialCards);
      }
    };
    initSession();
  }, []);

  useEffect(() => {
    if (currentIndex >= 0 && cards.length - currentIndex <= 3) {
      const prefetchCards = async () => {
        const newCards = await fetchCards(history, cards.length);
        if (newCards.length > 0) {
          setCards(prev => [...prev, ...newCards]);
        }
      };
      prefetchCards();
    }
  }, [currentIndex, cards.length, history]);

  const currentCard = cards[currentIndex];
  const hasMoreCards = currentIndex < cards.length;

  const saveSession = async (newHistory: Answer[], newIndex: number, currentCards: Card[]) => {
    if (!clientId) return;
    
    try {
      await fetch(SESSION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          history: newHistory,
          current_index: newIndex,
          cards: currentCards
        })
      });
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  };

  const handleSkipInstruction = () => {
    setShowInstructionCard(false);
    setCurrentIndex(0);
  };

  const handleAnswer = (answer: boolean | null = null) => {
    if (showInstructionCard) {
      handleSkipInstruction();
      return;
    }
    
    if (!currentCard) return;
    
    const isInsightCard = currentCard.type === 'insight';
    const newHistory = isInsightCard 
      ? history 
      : [...history, { question: currentCard.question, answer: answer as boolean }];
    const newIndex = currentIndex + 1;
    setHistory(newHistory);
    
    setIsExiting(true);
    setDragOffset({ x: answer ? window.innerWidth : -window.innerWidth, y: 0 });
    
    setTimeout(async () => {
      setIsExiting(false);
      setCurrentIndex(newIndex);
      setDragOffset({ x: 0, y: 0 });
      setCardKey(prev => prev + 1);
      
      if (cards.length - newIndex <= 3) {
        const newCards = await fetchCards(newHistory, cards.length);
        if (newCards.length > 0) {
          setCards(prev => [...prev, ...newCards]);
        }
      }
      
      await saveSession(newHistory, newIndex, cards);
    }, 300);
  };

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
      handleAnswer(dragOffset.x > 0);
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const rotation = isDragging ? dragOffset.x / 20 : 0;
  const opacity = Math.max(0.5, 1 - Math.abs(dragOffset.x) / 300);

  const handleRestart = async () => {
    if (!clientId) return;
    
    setIsLoading(true);
    
    try {
      await fetch(`${SESSION_URL}?client_id=${clientId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
    
    setCurrentIndex(0);
    setHistory([]);
    const initialCards = await fetchCards([], 0);
    setCards(initialCards);
    await saveSession([], 0, initialCards);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-950 dark:to-indigo-950 flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-500">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxNDcsIDUxLCAyMzQsIDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40 dark:opacity-20" />

      <div className="absolute top-6 right-6 z-20 flex gap-2">
        <button
          onClick={handleRestart}
          className="p-3 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:scale-110 transition-transform"
          title="Начать заново"
        >
          <Icon name="RotateCcw" size={24} className="text-gray-700 dark:text-gray-200" />
        </button>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-3 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:scale-110 transition-transform"
        >
          <Icon name={isDarkMode ? 'Sun' : 'Moon'} size={24} className="text-gray-700 dark:text-gray-200" />
        </button>
      </div>

      <div className="relative w-full max-w-sm h-[600px] flex items-center justify-center mb-6">
        {showInstructionCard ? (
          <div
            key="instruction-card"
            className="absolute w-full h-[560px] cursor-grab active:cursor-grabbing animate-fade-in"
            style={{
              transform: `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) rotate(${rotation}deg)`,
              transition: isDragging ? 'none' : isExiting ? 'transform 0.3s ease-in, opacity 0.3s ease-in' : 'transform 0.3s ease-out',
              opacity: isExiting ? 0 : opacity,
            }}
            onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
            onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
            onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
            onTouchEnd={handleEnd}
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
        ) : !hasMoreCards ? (
          <div className="text-center animate-fade-in">
            <div className="mb-4">
              <Icon name="CheckCircle" size={64} className="text-green-500 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Сессия завершена! 🎉</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Ты ответил на {history.length} вопросов</p>
            <button
              onClick={handleRestart}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all"
            >
              Начать новую сессию
            </button>
          </div>
        ) : currentCard.type === 'insight' ? (
          <div
            key={cardKey}
            className="absolute w-full h-[560px] animate-fade-in"
          >
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-3xl shadow-2xl p-8 h-full flex flex-col items-center justify-center text-center border-2 border-purple-200 dark:border-purple-800 transition-colors duration-300 relative overflow-y-auto">
              <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-2xl">
                <Icon name="Lightbulb" size={48} className="text-amber-500" />
              </div>

              <div className="mb-4 px-4 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                <span className="text-xs font-medium text-amber-700 dark:text-amber-400">{currentCard.category}</span>
              </div>

              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Промежуточная сводка</h2>

              <p className="text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap max-w-sm">
                {currentCard.insight || currentCard.question}
              </p>

              <button
                onClick={() => handleAnswer(null)}
                className="mt-6 px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg"
              >
                Понятно, дальше
              </button>
            </div>
          </div>
        ) : (
          <div
            key={cardKey}
            className="absolute w-full h-[560px] cursor-grab active:cursor-grabbing animate-fade-in"
            style={{
              transform: `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) rotate(${rotation}deg)`,
              transition: isDragging ? 'none' : isExiting ? 'transform 0.3s ease-in, opacity 0.3s ease-in' : 'transform 0.3s ease-out',
              opacity: isExiting ? 0 : opacity,
            }}
            onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
            onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
            onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
            onTouchEnd={handleEnd}
          >
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 h-full flex flex-col items-center justify-center text-center border border-purple-100 dark:border-purple-900 transition-colors duration-300 relative">

              
              <div className="mb-6 p-4 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-2xl">
                <Icon name="MessageCircle" size={48} className="text-primary" />
              </div>

              <div className="mb-4 px-4 py-1 bg-purple-50 dark:bg-purple-900/30 rounded-full">
                <span className="text-xs font-medium text-primary">{currentCard.category}</span>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">{currentCard.question}</h2>

              <div className="mt-6 text-sm text-gray-400 dark:text-gray-500">
                Вопрос {currentIndex + 1}
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
        )}
      </div>
    </div>
  );
};

export default Index;