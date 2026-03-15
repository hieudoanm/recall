import { NextPage } from 'next';
import { useEffect, useRef, useState } from 'react';
import { PiEyeFill, PiEyeSlashFill } from 'react-icons/pi';

type Phase = 'ready' | 'show' | 'input' | 'result';

const TIME_PER_DIGIT = 650; // ms
const MIN_TIME = 1200;
const MAX_TIME = 6000;

const chunkDigits = (value: string, size = 3) => {
  const firstGroupLength = value.length % size || size;
  const first = value.slice(0, firstGroupLength);
  const rest = value
    .slice(firstGroupLength)
    .match(new RegExp(`.{1,${size}}`, 'g'))
    ?.join(',');
  return rest ? `${first},${rest}` : first;
};

const generateNumber = (length: number) =>
  Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');

const highlightMistakes = (input: string, correct: string) =>
  input
    .split('')
    .map((digit, i) =>
      digit === correct[i]
        ? digit
        : `<span class="text-red-500 font-bold">${digit}</span>`
    )
    .join('');

const HomePage: NextPage = () => {
  const [lastRoundFailed, setLastRoundFailed] = useState(false);
  const [phase, setPhase] = useState<Phase>('ready');
  const [level, setLevel] = useState(1);
  const [number, setNumber] = useState('');
  const [input, setInput] = useState('');
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [mask, setMask] = useState(false);
  const [highStreak, setHighStreak] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('highStreak');
      return stored ? parseInt(stored, 10) : 0;
    }
    return 0;
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const blurActive = () =>
    (document.activeElement as HTMLElement | null)?.blur();

  const clearTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const startRound = (nextLevel = level) => {
    clearTimers();

    const value = generateNumber(nextLevel);
    const duration = Math.min(
      MAX_TIME,
      Math.max(MIN_TIME, nextLevel * TIME_PER_DIGIT)
    );

    setNumber(value);
    setInput('');
    setPhase('show');
    setCountdown(Math.ceil(duration / 1000));

    // countdown ticker
    intervalRef.current = setInterval(
      () => setCountdown((c) => Math.max(0, c - 1)),
      1000
    );

    timerRef.current = setTimeout(() => {
      clearTimers();
      setCountdown(0);
      setPhase('input');
      inputRef.current?.focus();
    }, duration);
  };

  const start = () => {
    blurActive();
    setLevel(1);
    setMessage('');
    startRound(1);
  };

  const updateHighStreak = (newStreak: number) => {
    setHighStreak((prev) => {
      const high = Math.max(prev, newStreak);
      localStorage.setItem('highStreak', high.toString());
      return high;
    });
  };
  const submit = () => {
    blurActive();
    if (input === number) {
      setMessage('Correct! Level up 🎉');
      setLevel((l) => l + 1);
      updateHighStreak(level);
      setLastRoundFailed(false); // round succeeded
    } else {
      const highlighted = highlightMistakes(input, number);
      setMessage(
        `Wrong 😢 The number was <span class="font-bold">${chunkDigits(
          number
        )}</span><br/>Your input: <span>${highlighted}</span>`
      );
      setLevel(1);
      setLastRoundFailed(true); // round failed, reset game
    }
    setPhase('result');
  };

  const next = () => {
    blurActive();
    setMessage('');
    startRound(level);
  };

  // Keyboard support
  const handleKeyDown = (keyboardEvent: React.KeyboardEvent) => {
    if (keyboardEvent.key !== 'Enter') return;
    if (phase === 'input') return; // form handles Enter
    if (phase === 'ready') start();
    if (phase === 'result') next();
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Enter') return;
      if (phase === 'ready') start();
      if (phase === 'input' && input) submit();
      if (phase === 'result') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, input]);

  return (
    <div
      className="bg-base-200 flex min-h-screen items-center justify-center p-4"
      tabIndex={0}
      onKeyDown={handleKeyDown}>
      <div className="card bg-base-100 w-full max-w-sm shadow-xl">
        <div className="card-body space-y-4 text-center">
          <h1 className="text-3xl font-bold tracking-wide">Recall</h1>

          {/* Badges Section */}
          <div className="flex justify-center gap-2">
            <span className="badge badge-secondary">Level {level}</span>
            <span className="badge badge-accent">🏆 Best {highStreak}</span>
          </div>

          {/* Countdown Section */}
          {phase === 'show' && (
            <div className="mt-2 flex justify-center">
              <span className="badge badge-info badge-xl">⏱ {countdown}s</span>
            </div>
          )}

          {phase === 'ready' && (
            <>
              <p className="text-base-content/70">
                Memorize the number and type it back.
              </p>
              <button className="btn btn-primary" onClick={start}>
                Start
              </button>
              <p className="text-xs opacity-50">Press Enter</p>
            </>
          )}

          {phase === 'show' && (
            <div className="font-mono text-4xl tracking-widest">
              {chunkDigits(number)}
            </div>
          )}

          {phase === 'input' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (input) submit();
              }}
              className="relative space-y-2">
              <div className="relative flex items-center">
                <input
                  autoFocus
                  ref={inputRef}
                  type={mask ? 'password' : 'text'} // keep mask functionality
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="input input-bordered w-full text-center text-xl tracking-widest"
                  placeholder="Type here"
                  maxLength={number.length} // prevent extra chars
                />
                <button
                  type="button"
                  className="absolute right-2"
                  onClick={() => setMask((m) => !m)}>
                  {mask ? (
                    <PiEyeSlashFill className="h-5 w-5 text-gray-500" />
                  ) : (
                    <PiEyeFill className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>
              <button
                type="submit"
                className="btn btn-success w-full"
                disabled={input.length !== number.length} // enable only when input matches number length
              >
                Submit
              </button>
              <p className="text-xs opacity-50">
                {input.length}/{number.length} digits
              </p>
            </form>
          )}

          {phase === 'result' && (
            <div className="space-y-2">
              <p
                className="text-center font-medium"
                dangerouslySetInnerHTML={{ __html: message }}></p>
              <button className="btn btn-secondary w-full" onClick={next}>
                {lastRoundFailed ? 'Start Over' : 'Next'}
              </button>
              <p className="text-xs opacity-50">Press Enter</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
