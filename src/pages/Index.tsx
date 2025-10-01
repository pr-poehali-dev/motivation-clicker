import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import TherapyCard from '@/components/therapy/TherapyCard';
import InsightCard from '@/components/therapy/InsightCard';
import InstructionCard from '@/components/therapy/InstructionCard';
import CompletionCard from '@/components/therapy/CompletionCard';
import { getIconForQuestion } from '@/utils/iconMapper';

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

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, []);

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
      setIsExiting(true);
      setDragOffset({ x: window.innerWidth, y: 0 });
      setTimeout(() => {
        handleSkipInstruction();
        setIsExiting(false);
        setDragOffset({ x: 0, y: 0 });
        setCardKey(prev => prev + 1);
      }, 300);
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
    setDragOffset({ x: answer !== null && !isInsightCard ? (answer ? window.innerWidth : -window.innerWidth) : window.innerWidth, y: 0 });
    
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
    setDragOffset({ x: deltaX, y: 0 });
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
          <InstructionCard
            isDragging={isDragging}
            isExiting={isExiting}
            dragOffset={dragOffset}
            rotation={rotation}
            opacity={opacity}
            swipeAnimation={swipeAnimation}
            onStart={handleStart}
            onMove={handleMove}
            onEnd={handleEnd}
          />
        ) : !hasMoreCards ? (
          <CompletionCard 
            historyLength={history.length}
            onRestart={handleRestart}
          />
        ) : currentCard.type === 'insight' ? (
          <InsightCard
            card={currentCard}
            cardKey={cardKey}
            isDragging={isDragging}
            isExiting={isExiting}
            dragOffset={dragOffset}
            rotation={rotation}
            opacity={opacity}
            onStart={handleStart}
            onMove={handleMove}
            onEnd={handleEnd}
          />
        ) : (
          <TherapyCard
            card={currentCard}
            cardKey={cardKey}
            isDragging={isDragging}
            isExiting={isExiting}
            dragOffset={dragOffset}
            rotation={rotation}
            opacity={opacity}
            onStart={handleStart}
            onMove={handleMove}
            onEnd={handleEnd}
            getIconForQuestion={getIconForQuestion}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
