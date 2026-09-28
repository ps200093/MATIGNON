import { useCallback, useEffect, useRef } from "react";

type IntroVideoProps = {
  onComplete: () => void;
};

export default function IntroVideo({ onComplete }: IntroVideoProps) {
  const completed = useRef(false);

  const complete = useCallback(() => {
    if (completed.current) return;
    completed.current = true;
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    const fallback = window.setTimeout(complete, 3000);
    return () => window.clearTimeout(fallback);
  }, [complete]);

  return (
    <section className="intro-video" aria-label="MATIGNON 인트로 영상">
      <video
        autoPlay
        muted
        playsInline
        preload="auto"
        src="/assets/champagne-pour-intro.webm"
        onEnded={complete}
        onError={complete}
      />
    </section>
  );
}
