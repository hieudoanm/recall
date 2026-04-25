import '@memory/styles/globals.css';
import type { AppProps } from 'next/app';
import { Geist, Geist_Mono } from 'next/font/google';
import { FC } from 'react';
import { HeadTemplate } from '../templates/HeadTemplate';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const App: FC<AppProps> = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <HeadTemplate basic={{ title: 'Memory' }} />
      <div className={`${geistSans.className} ${geistMono.className}`}>
        <Component {...pageProps} />
      </div>
    </>
  );
};

export default App;
