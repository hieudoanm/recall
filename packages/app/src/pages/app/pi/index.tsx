import { PI } from '@memory/data/pi';
import { NextPage } from 'next';
import { useEffect, useMemo, useState } from 'react';

const DIGIT_WIDTH = 24;
const VIEWPORT_OFFSET = 4 * DIGIT_WIDTH;
const HIGH_SCORE_KEY = 'pi-high-score';

type Mode = 'practice' | 'game';

const getHighScore = () => {
  if (typeof window === 'undefined') return 0;
  const saved = Number(localStorage.getItem(HIGH_SCORE_KEY));
  return Number.isNaN(saved) ? 0 : saved;
};

const AppPage: NextPage = () => {
  const digits = useMemo(() => PI.split(''), []);

  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<Mode>('practice');

  const [
    { locked = false, lastResult = null, revealedIndex = null, highScore = 0 },
    setGameState,
  ] = useState<{
    locked: boolean;
    lastResult: 'correct' | 'wrong' | null;
    revealedIndex: number | null;
    highScore: number;
  }>({
    locked: false,
    lastResult: null,
    revealedIndex: null,
    highScore: getHighScore(),
  });

  // Theme
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window === 'undefined') return 'dark';
    return (localStorage.getItem('theme') as 'dark' | 'light') ?? 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Keyboard handling
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // PRACTICE MODE
      if (mode === 'practice') {
        if (e.key === 'ArrowRight') {
          setIndex((i) => Math.min(i + 1, digits.length - 1));
        }
        if (e.key === 'ArrowLeft') {
          setIndex((i) => Math.max(i - 1, 0));
        }
        return;
      }

      // GAME MODE
      if (mode === 'game' && !locked && /^[0-9.]$/.test(e.key)) {
        const guess = e.key;
        const correct = digits[index];

        setGameState((p) => ({ ...p, revealedIndex: index }));

        if (guess === correct) {
          setGameState((p) => ({ ...p, lastResult: 'correct' }));
          setTimeout(() => {
            setIndex((i) => Math.min(i + 1, digits.length - 1));
            setGameState((p) => ({
              ...p,
              lastResult: null,
              revealedIndex: null,
            }));
          }, 200);
        } else {
          setGameState((previous) => {
            const newHighScore = Math.max(previous.highScore, index);
            localStorage.setItem(HIGH_SCORE_KEY, String(newHighScore));
            return {
              ...previous,
              locked: true,
              lastResult: 'wrong',
              highScore: newHighScore,
            };
          });
        }
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [mode, index, digits, locked]);

  const retry = () => {
    setIndex(0);
    setGameState((previous) => ({
      ...previous,
      locked: false,
      lastResult: null,
      revealedIndex: null,
    }));
  };

  return (
    <div className="bg-base-100 text-base-content flex h-screen items-center justify-center overflow-hidden">
      <div className="flex flex-col items-center gap-4">
        {/* Theme */}
        <button
          className="btn btn-ghost btn-xs"
          onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}>
          {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
        </button>

        {/* Mode Switch */}
        <div className="flex gap-2">
          <button
            className={`btn btn-xs ${mode === 'practice' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setMode('practice')}>
            Practice
          </button>
          <button
            className={`btn btn-xs ${mode === 'game' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => {
              setMode('game');
              retry();
            }}>
            Game
          </button>
        </div>

        {/* Score */}
        {mode === 'game' && (
          <div className="text-xs opacity-70">
            <span>Score: {index}</span>
            <span className="mx-2">•</span>
            <span className="font-semibold">Best: {highScore}</span>
          </div>
        )}

        {/* Digits */}
        <div className="border-accent rounded-md border border-dashed px-4 py-2">
          <div className="relative h-12 w-54 overflow-hidden">
            <div
              className="absolute top-0 flex h-12 transition-[left] duration-300 ease-out"
              style={{ left: `${VIEWPORT_OFFSET - index * DIGIT_WIDTH}px` }}>
              {digits.map((d, i) => {
                const isCurrent = i === index;
                const isPast = i < index;
                const isRevealed = revealedIndex === i;

                const showDigit = mode === 'practice' || isPast || isRevealed;

                return (
                  <div
                    key={i}
                    className={[
                      'flex h-12 w-6 items-center justify-center text-4xl transition-colors select-none',
                      isCurrent ? 'text-accent' : 'opacity-40',
                      lastResult === 'wrong' && isCurrent && 'text-error',
                      lastResult === 'correct' && isCurrent && 'text-success',
                    ].join(' ')}>
                    {showDigit ? d : '•'}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center text-xs opacity-60">
          {mode === 'practice' ? (
            <>
              <div>Use ← → arrow keys</div>
              <div>Index: {index}</div>
            </>
          ) : locked ? (
            <>
              <div className="text-error font-semibold">Mistake!</div>
              <div>You reached digit {index}</div>
            </>
          ) : (
            <>
              <div>Type the next digit of π</div>
              <div>Index: {index}</div>
            </>
          )}
        </div>

        {/* Retry */}
        {mode === 'game' && locked && (
          <button className="btn btn-error btn-sm" onClick={retry}>
            Retry
          </button>
        )}

        {/* Numpad */}
        {mode === 'game' && !locked && (
          <div className="mt-2 grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0].map((n) => (
              <button
                key={n}
                className="btn btn-secondary btn-sm"
                onClick={() =>
                  window.dispatchEvent(
                    new KeyboardEvent('keydown', { key: String(n) })
                  )
                }>
                {n}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppPage;
