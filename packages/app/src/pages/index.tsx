import { NextPage } from 'next';
import { useEffect, useRef, useState } from 'react';

type Phase = 'ready' | 'show' | 'input' | 'result';

const TIME_PER_DIGIT = 650; // ms
const MIN_TIME = 1200;
const MAX_TIME = 6000;

const chunkDigits = (value: string, size = 3) =>
  value.match(new RegExp(`.{1,${size}}`, 'g'))?.join(' ') ?? value;

const generateNumber = (length: number) =>
  Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');

const HomePage: NextPage = () => {
  const [phase, setPhase] = useState<Phase>('ready');
  const [level, setLevel] = useState(1);
  const [number, setNumber] = useState('');
  const [input, setInput] = useState('');
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const blurActive = () => {
    (document.activeElement as HTMLElement | null)?.blur();
  };

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
    intervalRef.current = setInterval(() => {
      setCountdown((c) => Math.max(0, c - 1));
    }, 1000);

    // switch to input phase
    timerRef.current = setTimeout(() => {
      clearTimers();
      setCountdown(0);
      setPhase('input');
    }, duration);
  };

  const start = () => {
    blurActive();
    setLevel(1);
    setMessage('');
    startRound(1);
  };

  const submit = () => {
    blurActive();

    if (input === number) {
      setMessage('Correct! Level up 🎉');
      setLevel((l) => l + 1);
    } else {
      setMessage(`Wrong 😢 The number was ${chunkDigits(number)}`);
      setLevel(1);
    }
    setPhase('result');
  };

  const next = () => {
    blurActive();
    setMessage('');
    startRound(level);
  };

  // 🔑 Keyboard support
  const handleKeyDown = (keyboardEvent: React.KeyboardEvent) => {
    if (keyboardEvent.key !== 'Enter') return;

    // 🚫 let the form handle Enter
    if (phase === 'input') return;

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

          <div className="flex justify-center gap-2">
            <span className="badge badge-primary">Level {level}</span>
            {phase === 'show' && <span className="badge">⏱ {countdown}s</span>}
          </div>

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
                e.stopPropagation(); // 🔑 stops bubbling
                if (input) submit();
              }}
              className="space-y-2">
              <input
                autoFocus
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="input input-bordered w-full text-center text-xl tracking-widest"
                placeholder="Type here"
              />
              <button
                type="submit"
                className="btn btn-success w-full"
                disabled={!input}>
                Submit
              </button>
              <p className="text-xs opacity-50">Press Enter</p>
            </form>
          )}

          {phase === 'result' && (
            <>
              <p className="font-medium">{message}</p>
              <button className="btn btn-secondary" onClick={next}>
                Next
              </button>
              <p className="text-xs opacity-50">Press Enter</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
