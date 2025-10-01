export const getIconForQuestion = (question: string, category: string): string => {
  const lowerQ = question.toLowerCase();
  
  if (lowerQ.includes('тревог') || lowerQ.includes('беспоко')) return 'AlertCircle';
  if (lowerQ.includes('груст') || lowerQ.includes('печал')) return 'CloudRain';
  if (lowerQ.includes('злос') || lowerQ.includes('раздра')) return 'Flame';
  if (lowerQ.includes('стыд') || lowerQ.includes('вин')) return 'EyeOff';
  if (lowerQ.includes('страх') || lowerQ.includes('боишь')) return 'Ghost';
  if (lowerQ.includes('люд') || lowerQ.includes('друз')) return 'Users';
  if (lowerQ.includes('партнёр') || lowerQ.includes('отношен')) return 'Heart';
  if (lowerQ.includes('родител') || lowerQ.includes('семь')) return 'Home';
  if (lowerQ.includes('коллег') || lowerQ.includes('работ')) return 'Briefcase';
  if (lowerQ.includes('утр')) return 'Sunrise';
  if (lowerQ.includes('вечер') || lowerQ.includes('ноч')) return 'Moon';
  if (lowerQ.includes('сон') || lowerQ.includes('уста')) return 'BedDouble';
  if (lowerQ.includes('голод') || lowerQ.includes('ед')) return 'UtensilsCrossed';
  if (lowerQ.includes('мысл') || lowerQ.includes('дума')) return 'Brain';
  if (lowerQ.includes('избега')) return 'ArrowBigLeft';
  if (lowerQ.includes('помога')) return 'HandHeart';
  if (lowerQ.includes('поддержк')) return 'Users';
  if (lowerQ.includes('хобби')) return 'Palette';
  if (lowerQ.includes('спорт')) return 'Dumbbell';
  if (lowerQ.includes('медитац') || lowerQ.includes('дыхан')) return 'Wind';
  if (lowerQ.includes('готов') || lowerQ.includes('попроб')) return 'Rocket';
  if (lowerQ.includes('план')) return 'ListChecks';
  if (lowerQ.includes('изменен')) return 'RefreshCw';
  
  if (category.includes('screening')) return 'Search';
  if (category.includes('triggers')) return 'Zap';
  if (category.includes('cognition')) return 'Brain';
  if (category.includes('behavior')) return 'GitBranch';
  if (category.includes('resources')) return 'Battery';
  if (category.includes('action')) return 'Target';
  
  return 'MessageCircle';
};
