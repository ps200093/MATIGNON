import { useEffect, useState } from "react";
import { CalendarDays, MapPin, Share2, Sparkles } from "lucide-react";
import { openingSchedule } from "./openingSchedule";

type EventInfo = {
  title: string;
  venue: string;
  address: string | null;
  start: string | null;
  end: string | null;
  publicUrl: string | null;
};

const fallbackStart = "2026-10-02T18:00:00+09:00";

export default function MoulinRougeInvitation() {
  const [event, setEvent] = useState<EventInfo | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [notice, setNotice] = useState("");

  useEffect(() => {
    void fetch("/api/event", { signal: AbortSignal.timeout(10000) })
      .then((response) => (response.ok ? response.json() : null))
      .then(setEvent)
      .catch(() => setEvent(null));
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(""), 2600);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const start = event?.start || fallbackStart;
  const startsAt = Date.parse(start);
  const remaining = Math.max(0, startsAt - now);
  const countdown = remaining
    ? `${Math.floor(remaining / 86400000)}일 ${String(
        Math.floor((remaining / 3600000) % 24),
      ).padStart(2, "0")}:${String(
        Math.floor((remaining / 60000) % 60),
      ).padStart(2, "0")}:${String(
        Math.floor((remaining / 1000) % 60),
      ).padStart(2, "0")}`
    : "행사가 시작되었습니다.";
  const counter = remaining
    ? [
        ["DAYS", String(Math.floor(remaining / 86400000)).padStart(2, "0")],
        [
          "HRS",
          String(Math.floor((remaining / 3600000) % 24)).padStart(2, "0"),
        ],
        ["MINS", String(Math.floor((remaining / 60000) % 60)).padStart(2, "0")],
        ["SECS", String(Math.floor((remaining / 1000) % 60)).padStart(2, "0")],
      ]
    : [];

  async function shareInvitation() {
    const url = event?.publicUrl || window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "MATIGNON LIVE BAR",
          text: "A night at MATIGNON LIVE BAR.",
          url,
        });
        return;
      }
      await navigator.clipboard.writeText(url);
      setNotice("초대장 링크를 복사했습니다.");
    } catch {
      setNotice("초대장 링크를 복사하지 못했습니다.");
    }
  }

  return (
    <main className="moulin" aria-label="MATIGNON 라이브 바 초대장">
      <div className="moulin-curtain moulin-curtain-left" aria-hidden="true" />
      <div className="moulin-curtain moulin-curtain-right" aria-hidden="true" />
      <header className="moulin-header">
        <span>MATIGNON · SEOUL</span>
        <button onClick={shareInvitation} aria-label="초대장 공유">
          <Share2 size={17} />
        </button>
      </header>
      <section className="moulin-hero">
        <p className="moulin-kicker">ONE NIGHT ONLY · LIVE BAR</p>
        <div className="moulin-marquee" aria-hidden="true">
          <span>✦</span>
          <span>✦</span>
          <span>✦</span>
          <span>✦</span>
          <span>✦</span>
          <span>✦</span>
          <span>✦</span>
        </div>
        <p className="moulin-presents">MATIGNON PRESENTS</p>
        <h1>
          Cabaret
          <em>After Dark</em>
        </h1>
        <p className="moulin-live">
          <Sparkles size={14} aria-hidden="true" /> LIVE MUSIC · COCKTAILS ·
          MIDNIGHT
        </p>
      </section>
      <section className="moulin-card" aria-labelledby="moulin-event-title">
        <h2 id="moulin-event-title">Tonight&apos;s performance</h2>
        <dl>
          <div>
            <dt>
              <CalendarDays size={16} /> WHEN
            </dt>
            <dd className="moulin-opening-schedule">
              {openingSchedule.map((opening) => (
                <span className="moulin-opening-slot" key={opening.label}>
                  <strong>{opening.label}</strong>
                  <span>{opening.date}</span>
                  <span>{opening.time}</span>
                </span>
              ))}
            </dd>
          </div>
          <div>
            <dt>
              <MapPin size={16} /> WHERE
            </dt>
            <dd>
              {event?.venue || "MATIGNON SEOUL"}
              <small>{event?.address || "서울 강남구 압구정로50길 24"}</small>
              <small>주차 : 매장 바로 옆 발렛 부스 이용 가능</small>
            </dd>
          </div>
        </dl>
      </section>
      <section className="moulin-countdown" aria-label="행사 시작 카운트다운">
        <p>THE CURTAIN RISES IN</p>
        <time role="timer" aria-label="행사 시작까지 남은 시간">
          <span className="visually-hidden">{countdown}</span>
          {counter.length ? (
            <span className="moulin-counter" aria-hidden="true">
              {counter.map(([label, value]) => (
                <span className="moulin-counter-group" key={label}>
                  <strong>{value}</strong>
                  <small>{label}</small>
                </span>
              ))}
            </span>
          ) : (
            countdown
          )}
        </time>
        <span>DOORS · 18:00 · MATIGNON SEOUL</span>
      </section>
      <footer className="moulin-footer">
        <span>MATIGNON LIVE BAR</span>
        <span>SEOUL · 2026</span>
      </footer>
      <div className={`moulin-notice ${notice ? "show" : ""}`} role="status">
        {notice}
      </div>
    </main>
  );
}
