import { twinkleTwinkle } from '@memory/data/twinkle-twinkle-little-star';
import { NextPage } from 'next';
import { useEffect, useRef, useState } from 'react';

const NODE_ENV = process.env.NODE_ENV ?? 'development';

const whiteKeys = [
  { id: 'c', note: 'C' },
  { id: 'd', note: 'D' },
  { id: 'e', note: 'E' },
  { id: 'f', note: 'F' },
  { id: 'g', note: 'G' },
  { id: 'a', note: 'A' },
  { id: 'b', note: 'B' },
];

const blackKeys = [
  { id: 'cs', note: 'C#', position: 0 },
  { id: 'ds', note: 'D#', position: 1 },
  { id: 'fs', note: 'F#', position: 3 },
  { id: 'gs', note: 'G#', position: 4 },
  { id: 'as', note: 'A#', position: 5 },
];

const allNotes = [...whiteKeys, ...blackKeys];

const levels: string[][] = [
  ['c', 'd'],
  ['c', 'cs', 'd'],
  ['c', 'cs', 'd', 'ds'],
  ['c', 'cs', 'd', 'ds', 'e'],
  ['c', 'cs', 'd', 'ds', 'e', 'f'],
  ['c', 'cs', 'd', 'ds', 'e', 'f', 'fs'],
  ['c', 'cs', 'd', 'ds', 'e', 'f', 'fs', 'g'],
  ['c', 'cs', 'd', 'ds', 'e', 'f', 'fs', 'g', 'gs'],
  ['c', 'cs', 'd', 'ds', 'e', 'f', 'fs', 'g', 'gs', 'a'],
  ['c', 'cs', 'd', 'ds', 'e', 'f', 'fs', 'g', 'gs', 'a', 'as'],
  ['c', 'cs', 'd', 'ds', 'e', 'f', 'fs', 'g', 'gs', 'a', 'as', 'b'],
];

const AppPage: NextPage = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [started, setStarted] = useState(false);
  const [target, setTarget] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [ripple, setRipple] = useState(false);
  const [isPracticing, setIsPracticing] = useState(false);
  const [feedback, setFeedback] = useState<{
    correctId?: string;
    wrongId?: string;
  } | null>(null);
  const [highlightedKey, setHighlightedKey] = useState<string | null>(null);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    const saved = localStorage.getItem('pitch-high-score');
    if (saved) setHighScore(Number.parseInt(saved, 10));
  }, []);

  const playTone = (id: string) => {
    try {
      const note: string =
        NODE_ENV === 'development'
          ? `/audio/3/${id}.mp3`
          : `/pitch.perfect/audio/3/${id}.mp3`;
      const audio = new Audio(note);
      audioRef.current = audio;
      audio.play();

      setRipple(true);
      setTimeout(() => setRipple(false), 600);
    } catch (error) {
      console.error(error);
    }
  };

  const playTwinkle = async () => {
    if (isPracticing) return;

    setIsPracticing(true);
    setStarted(false);
    setTarget(null);

    for (const { note, duration } of twinkleTwinkle) {
      setHighlightedKey(note);
      playTone(note);
      await new Promise((res) => setTimeout(res, duration));
      setHighlightedKey(null);
    }

    setIsPracticing(false);
  };

  const nextRound = () => {
    const availableNotes = levels[level - 1];
    const random =
      availableNotes[Math.floor(Math.random() * availableNotes.length)];

    setTarget(random);
    playTone(random);
  };

  const startGame = () => {
    setScore(0);
    setStarted(true);
    nextRound();
  };

  const handleGuess = (id: string) => {
    if (!started || !target || isPracticing) return;

    if (id === target) {
      // Correct
      setFeedback({ correctId: id });

      const newScore = score + 1;
      setScore(newScore);

      if (newScore % 10 === 0 && level < levels.length) {
        setLevel(level + 1);
      }

      setTimeout(() => {
        setFeedback(null);
        nextRound();
      }, 700);
    } else {
      // Wrong
      setFeedback({ correctId: target, wrongId: id });

      setTimeout(() => {
        if (score > highScore) {
          setHighScore(score);
          localStorage.setItem('pitch-high-score', score.toString());
        }

        setFeedback(null);
        setScore(0);
        setStarted(false);
        setTarget(null);
      }, 900);
    }
  };

  const playPractice = async () => {
    if (isPracticing) return;

    setIsPracticing(true);
    setStarted(false);
    setTarget(null);

    for (const { id: key } of whiteKeys) {
      setHighlightedKey(key);
      playTone(key);

      await new Promise((res) => setTimeout(res, 800));
      setHighlightedKey(null);
    }

    setIsPracticing(false);
  };

  return (
    <div className="h-screen w-screen bg-[#F4F8FF]">
      <div className="mx-auto flex h-full w-full max-w-4xl flex-col px-6 py-10">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="text-2xl font-extrabold text-gray-800">
            Pitch Trainer
          </div>
          <div className="text-lg font-bold text-gray-700">
            Level {level} | Score: {score} | High: {highScore}
          </div>
        </div>

        <div className="relative flex grow items-center justify-center">
          {/* Buttons */}
          {!started && (
            <div className="mb-8 flex flex-col justify-center gap-4 md:flex-row">
              <button
                onClick={startGame}
                disabled={isPracticing}
                className="rounded-2xl bg-green-500 px-8 py-4 text-lg font-extrabold text-white shadow-[0_6px_0_#15803D] transition-all active:translate-y-1 active:shadow-[0_2px_0_#15803D] disabled:opacity-50">
                Start
              </button>

              <button
                onClick={playPractice}
                disabled={isPracticing}
                className="rounded-2xl bg-blue-500 px-8 py-4 text-lg font-extrabold text-white shadow-[0_6px_0_#1D4ED8] transition-all active:translate-y-1 active:shadow-[0_2px_0_#1D4ED8] disabled:opacity-50">
                Practice
              </button>

              <button
                onClick={playTwinkle}
                disabled={isPracticing}
                className="rounded-2xl bg-purple-500 px-8 py-4 text-lg font-extrabold text-white shadow-[0_6px_0_#7C3AED] transition-all active:translate-y-1 active:shadow-[0_2px_0_#7C3AED] disabled:opacity-50">
                Twinkle
              </button>
            </div>
          )}

          {/* Center Ripple */}
          {ripple && (
            <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
              <div className="h-32 w-32 animate-ping rounded-full bg-blue-300 opacity-30" />
            </div>
          )}
        </div>

        {/* Keyboard */}
        <div className="relative h-64 w-full">
          <div className="flex h-full gap-2">
            {whiteKeys.map(({ id, note }) => (
              <button
                key={id}
                onClick={() => {
                  if (started) {
                    handleGuess(id); // handle guess during game
                  } else {
                    playTone(id); // play note freely when game not started
                  }
                }}
                className={`relative flex flex-1 items-end justify-center rounded-2xl border-4 transition-all duration-150 active:translate-y-1 ${
                  feedback?.correctId === id
                    ? 'border-green-600 bg-green-400 shadow-[0_6px_0_#15803D]'
                    : feedback?.wrongId === id
                      ? 'border-red-600 bg-red-400 shadow-[0_6px_0_#B91C1C]'
                      : highlightedKey === id
                        ? 'border-blue-500 bg-blue-300 shadow-[0_6px_0_#2563EB]'
                        : 'border-gray-200 bg-white shadow-[0_6px_0_#E5E7EB]'
                }`}>
                <span className="mb-4 text-lg font-extrabold text-gray-700">
                  {note}
                </span>
              </button>
            ))}
          </div>

          {blackKeys.map(({ id, note, position }) => (
            <button
              key={id}
              onClick={() => {
                if (started) {
                  handleGuess(id);
                } else {
                  playTone(id);
                }
              }}
              className={`absolute top-0 z-10 h-40 w-[9%] -translate-x-1/2 rounded-xl border-4 transition-all duration-150 active:translate-y-1 ${
                feedback?.correctId === id
                  ? 'border-green-700 bg-green-500 shadow-[0_6px_0_#166534]'
                  : feedback?.wrongId === id
                    ? 'border-red-700 bg-red-500 shadow-[0_6px_0_#7F1D1D]'
                    : 'border-gray-800 bg-gray-900 shadow-[0_6px_0_#111827]'
              }`}
              style={{ left: `${((position + 1) * 100) / 7}%` }}>
              <div className="flex h-full items-end justify-center pb-2 text-xs font-bold text-white">
                {note}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AppPage;
