interface IFeedbackProps {
  onScore: (score: number) => void
}

export const Feedback = ({ onScore }: IFeedbackProps) => (
  <div className='absolute mx-2 sm:mx-0 sm:w-auto bottom-32 sm:bottom-32 sm:right-8 bg-white text-black flex flex-col items-center justify-center gap-2 p-4 rounded-3xl shadow-popup border border-unleash'>
    <span className='font-bold mb-1'>
      How would you rate this AI assistant?
    </span>
    <div className='flex gap-2 flex-wrap'>
      {[1, 2, 3, 4, 5, 6, 7].map(score => (
        <button
          key={score}
          className='bg-unleash text-white rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold hover:bg-unleash-dark transition-colors'
          data-testid={`chatbot-rating-${score}`}
          onClick={() => onScore(score)}
        >
          {score}
        </button>
      ))}
    </div>
    <div className='justify-between w-full hidden sm:flex text-gray-500'>
      <span className='text-left'>Very bad</span>
      <span className='text-right'>Very good</span>
    </div>
  </div>
)
