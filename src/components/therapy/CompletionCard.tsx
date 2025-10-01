import Icon from '@/components/ui/icon';

interface CompletionCardProps {
  historyLength: number;
  onRestart: () => void;
}

const CompletionCard = ({ historyLength, onRestart }: CompletionCardProps) => {
  return (
    <div className="text-center animate-fade-in">
      <div className="mb-4">
        <Icon name="CheckCircle" size={64} className="text-green-500 mx-auto" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Сессия завершена! 🎉</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-4">Ты ответил на {historyLength} вопросов</p>
      <button
        onClick={onRestart}
        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all"
      >
        Начать новую сессию
      </button>
    </div>
  );
};

export default CompletionCard;
