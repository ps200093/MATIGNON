import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Plus,
  Minus,
  Share2,
  Sparkles,
  Check,
  Copy,
  Download,
  MapPin,
  CalendarDays,
  RefreshCw,
} from "lucide-react";
import QRCode from "qrcode";
import Modal from "./Modal";

type EventInfo = {
  mode: "preview" | "live";
  title: string;
  venue: string;
  address: string | null;
  start: string | null;
  end: string | null;
  publicUrl: string | null;
  privacyNotice: string | null;
};
type Receipt = { id: string; mode: "preview" | "live" };
const key = () =>
  crypto.randomUUID?.() ||
  `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;

function Ornament() {
  return (
    <svg
      viewBox="0 0 240 240"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <circle cx="120" cy="120" r="112" strokeWidth="0.7" />
      <circle cx="120" cy="120" r="103" strokeWidth="2" />
      <circle cx="120" cy="120" r="96" strokeDasharray="1 5" strokeWidth="2" />
      {Array.from({ length: 16 }, (_, i) => (
        <g key={i} transform={`rotate(${i * 22.5} 120 120)`}>
          <path
            d="M120 30 C95 53 105 78 120 91 C135 78 145 53 120 30Z"
            strokeWidth="1"
          />
          <path
            d="M120 43 C111 59 113 72 120 80 C127 72 129 59 120 43Z"
            strokeWidth="0.6"
          />
          <path
            d="M116 19 L120 11 L124 19 L120 25Z"
            fill="currentColor"
            stroke="none"
          />
        </g>
      ))}
      <circle cx="120" cy="120" r="34" strokeWidth="1.5" />
      <circle cx="120" cy="120" r="27" strokeWidth="0.5" />
    </svg>
  );
}

export default function App() {
  const [opened, setOpened] = useState(false);
  const [opening, setOpening] = useState(false);
  const [motion, setMotion] = useState(
    () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [event, setEvent] = useState<EventInfo | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [modal, setModal] = useState<"rsvp" | "share" | null>(null);
  const [toast, setToast] = useState("");
  const [qr, setQr] = useState("");
  const [qrError, setQrError] = useState(false);
  const [name, setName] = useState("");
  const [attendance, setAttendance] = useState("yes");
  const [guests, setGuests] = useState(1);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const requestKey = useRef(key());
  const submitted = useRef("");
  const heroRef = useRef<HTMLElement>(null);
  const openingTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const shareUrl = event?.publicUrl || `${window.location.origin}/`;
  const localUrl = /localhost|127\.0\.0\.1/.test(shareUrl);
  const preview = event?.mode !== "live";
  async function loadEvent() {
    setLoadError(false);
    try {
      const r = await fetch("/api/event", {
        signal: AbortSignal.timeout(10000),
      });
      if (!r.ok) throw new Error();
      setEvent(await r.json());
    } catch {
      setLoadError(true);
    }
  }
  useEffect(() => {
    void loadEvent();
    return () => clearTimeout(openingTimer.current);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.motion = motion ? "on" : "off";
  }, [motion]);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setMotion(!media.matches);
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    if (!opened) return;
    heroRef.current?.focus({ preventScroll: true });
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.15 },
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [opened]);
  useEffect(() => {
    if (modal !== "share") return;
    setQrError(false);
    QRCode.toDataURL(shareUrl, {
      width: 600,
      margin: 3,
      errorCorrectionLevel: "M",
      color: { dark: "#151310", light: "#faf6eb" },
    })
      .then(setQr)
      .catch(() => setQrError(true));
  }, [modal, shareUrl]);
  function openInvitation() {
    if (opening) return;
    setOpening(true);
    openingTimer.current = setTimeout(
      () => {
        setOpened(true);
        window.scrollTo(0, 0);
      },
      motion ? 1000 : 0,
    );
  }
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setToast("초대장 링크를 복사했습니다.");
    } catch {
      setToast("아래 주소를 길게 눌러 복사해주세요.");
    }
  }
  async function share() {
    if (!navigator.share) return copyLink();
    try {
      await navigator.share({
        title: "MATIGNON SEOUL · You’re invited",
        text: "일상 밖의 순간, 당신과 함께.",
        url: shareUrl,
      });
    } catch (e) {
      if (!(e instanceof DOMException && e.name === "AbortError"))
        void copyLink();
    }
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy || !event) return;
    const next: Record<string, string> = {};
    if (name.trim().length < 2 || name.trim().length > 40)
      next.name = "성함 또는 닉네임을 2~40자로 입력해주세요.";
    if (!consent)
      next.consent = preview
        ? "미리보기 안내를 확인해주세요."
        : "개인정보 수집·이용 안내에 동의해주세요.";
    setErrors(next);
    if (Object.keys(next).length) {
      document.getElementById(Object.keys(next)[0])?.focus();
      return;
    }
    const fields = {
      name: name.trim(),
      attendance,
      guests: attendance === "yes" ? guests : 1,
      consent,
    };
    const serialized = JSON.stringify(fields);
    if (submitted.current && submitted.current !== serialized)
      requestKey.current = key();
    submitted.current = serialized;
    setBusy(true);
    try {
      const r = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, requestKey: requestKey.current }),
        signal: AbortSignal.timeout(12000),
      });
      const data = await r.json();
      if (!r.ok)
        throw new Error(
          data.error || "응답을 보내지 못했습니다. 다시 시도해주세요.",
        );
      setReceipt(data);
    } catch (error) {
      setErrors({
        submit:
          error instanceof Error &&
          error.name !== "TimeoutError" &&
          error.message !== "Failed to fetch"
            ? error.message
            : "연결을 확인하고 다시 시도해주세요. 입력 내용은 그대로 유지됩니다.",
      });
    } finally {
      setBusy(false);
    }
  }
  function calendar() {
    if (!event?.start || !event.end) return;
    const stamp = (d: string) =>
      new Date(d)
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}/, "");
    const escape = (s: string) =>
      s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/[,;]/g, "\\$&");
    const value = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//MATIGNON//Invitation//KO",
      "BEGIN:VEVENT",
      `UID:${stamp(event.start)}@matignon`,
      `DTSTAMP:${stamp(new Date().toISOString())}`,
      `DTSTART:${stamp(event.start)}`,
      `DTEND:${stamp(event.end)}`,
      `SUMMARY:${escape(event.title)}`,
      `LOCATION:${escape(event.address || event.venue)}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(
      new Blob([value], { type: "text/calendar;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "matignon.ics";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
  const date = event?.start
    ? new Intl.DateTimeFormat("ko-KR", {
        month: "long",
        day: "numeric",
        weekday: "long",
        timeZone: "Asia/Seoul",
      }).format(new Date(event.start))
    : "일정 추후 안내";
  const time = event?.start
    ? new Intl.DateTimeFormat("ko-KR", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: "Asia/Seoul",
      }).format(new Date(event.start))
    : "";

  return (
    <div className={`experience ${opened ? "is-open" : ""}`}>
      {!opened ? (
        <main className={`cover ${opening ? "opening" : ""}`}>
          <div className="cover-frame" aria-hidden="true" />
          <div className="cover-ornament ornament-top" aria-hidden="true">
            <Ornament />
          </div>
          <div className="cover-ornament ornament-bottom" aria-hidden="true">
            <Ornament />
          </div>
          <div className="cover-content">
            <span className="cover-monogram" aria-hidden="true">
              M
            </span>
            <p className="eyebrow">A PRIVATE EVENING</p>
            <h1 className="cover-title">
              You're
              <br />
              <span>Invited</span>
            </h1>
            <div className="cover-rule" aria-hidden="true">
              <span />✦<span />
            </div>
            <p className="cover-venue">
              MATIGNON <span>SEOUL</span>
            </p>
            <p className="cover-korean">재즈가 흐르는 밤, 당신을 초대합니다.</p>
            <button
              className="open-link"
              onClick={openInvitation}
              disabled={opening}
            >
              초대장 열기 <ArrowRight size={17} />
            </button>
          </div>
          {preview && <span className="preview-label">INVITATION PREVIEW</span>}
        </main>
      ) : (
        <>
          <header className="header">
            <a
              className="header-brand"
              href="#top"
              aria-label="초대장 처음으로"
            >
              MATIGNON <span>SEOUL</span>
            </a>
            <div className="header-actions">
              <button
                className={`icon-button ${motion ? "active" : ""}`}
                onClick={() => setMotion(!motion)}
                aria-label={motion ? "애니메이션 끄기" : "애니메이션 켜기"}
                aria-pressed={motion}
              >
                <Sparkles size={17} />
              </button>
              <button
                className="icon-button"
                onClick={() => setModal("share")}
                aria-label="초대장 공유"
              >
                <Share2 size={17} />
              </button>
            </div>
          </header>
          <main>
            <section
              className="hero"
              id="top"
              ref={heroRef}
              tabIndex={-1}
              aria-label="MATIGNON 프라이빗 초대장"
            >
              <div className="hero-topline">
                <span className="eyebrow">YOU ARE INVITED</span>
              </div>
              <div className="hero-heading">
                <h1>
                  Jazz
                  <br />
                  <em>after dark.</em>
                </h1>
              </div>
              <div className="hero-frame">
                <img
                  className="hero-photo"
                  src="/assets/jazz-lounge.png"
                  alt="버건디 커튼과 그랜드 피아노, 은은한 조명이 있는 재즈 라운지 콘셉트"
                  fetchPriority="high"
                />
                <div className="hero-beam" />
                <span className="photo-signature" aria-hidden="true">
                  Matignon
                </span>
              </div>
              <p className="image-caption">AI 콘셉트 이미지</p>
              <p className="hero-copy">좋은 음악과 한 잔, 그리고 당신.</p>
            </section>
            <section className="details section-pad reveal" id="details">
              <h2 className="visually-hidden">일정과 장소</h2>
              <dl>
                <div>
                  <dt>
                    <CalendarDays size={17} /> WHEN
                  </dt>
                  <dd>
                    {date}
                    <small>{time}</small>
                    {event?.start && (
                      <button className="text-link" onClick={calendar}>
                        캘린더에 저장 <Plus size={14} />
                      </button>
                    )}
                  </dd>
                </div>
                <div>
                  <dt>
                    <MapPin size={17} /> WHERE
                  </dt>
                  <dd>
                    {event?.venue || "MATIGNON SEOUL"}
                    <small>{event?.address || "상세 주소 추후 안내"}</small>
                    {event?.address && (
                      <a
                        className="text-link"
                        href={`https://map.naver.com/p/search/${encodeURIComponent(event.address)}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        지도에서 보기 <ArrowUpRight size={14} />
                      </a>
                    )}
                  </dd>
                </div>
              </dl>
            </section>
            <section className="rsvp-section section-pad reveal" id="rsvp">
              <h2>Be our guest.</h2>
              <button
                className="gold-button"
                onClick={() => setModal("rsvp")}
                disabled={!event}
              >
                {receipt ? "내 응답 확인하기" : "참석 여부 알려주기"}
                <ArrowUpRight size={19} />
              </button>
              {loadError && (
                <div className="load-error" role="alert">
                  초대장 정보를 불러오지 못했습니다.
                  <button className="text-link" onClick={loadEvent}>
                    <RefreshCw size={14} /> 다시 불러오기
                  </button>
                </div>
              )}
              <span className="rsvp-footnote">
                {preview
                  ? "미리보기 · 실제 참석 등록은 되지 않습니다"
                  : "함께할 수 있다면 알려주세요."}
              </span>
            </section>
          </main>
          <footer className="footer">
            <button className="text-link" onClick={() => setModal("share")}>
              초대장 공유 <Share2 size={13} />
            </button>
            <small>MATIGNON SEOUL</small>
          </footer>
          <div
            className="sticky-rsvp"
            role="region"
            aria-label="참석 응답 바로가기"
          >
            <div>
              <span className="eyebrow">YOU'RE INVITED</span>
              <span>{event?.venue || "MATIGNON SEOUL"}</span>
            </div>
            <button onClick={() => setModal("rsvp")} disabled={!event}>
              {receipt ? "응답 확인" : "RSVP"}
              <ArrowUpRight size={17} />
            </button>
          </div>
        </>
      )}
      {modal === "share" && (
        <Modal title="Share the night." onClose={() => setModal(null)}>
          <p className="sheet-description">
            같은 순간을 함께하고 싶은 사람에게.
          </p>
          <div className="qr-card">
            {qr ? (
              <img
                src={qr}
                alt="초대장 접속 QR 코드"
                width="220"
                height="220"
              />
            ) : (
              <p role="status">
                {qrError
                  ? "QR 생성에 실패했습니다. 링크를 이용해주세요."
                  : "QR을 만들고 있습니다…"}
              </p>
            )}
            <span className="eyebrow">SCAN TO OPEN YOUR INVITATION</span>
          </div>
          <input
            className="share-url"
            aria-label="초대장 주소"
            readOnly
            value={shareUrl}
            onFocus={(e) => e.target.select()}
          />
          {localUrl && (
            <p className="preview-note">
              현재는 이 컴퓨터용 주소입니다. 휴대폰 공유에는 공개 배포 주소 또는
              같은 Wi-Fi의 PC 주소가 필요합니다.
            </p>
          )}
          <div className="share-actions">
            <button className="outline-button" onClick={copyLink}>
              <Copy size={16} /> 링크 복사
            </button>
            <a
              className={`outline-button ${!qr ? "is-disabled" : ""}`}
              href={qr || undefined}
              download="matignon-invitation-qr.png"
              aria-disabled={!qr}
            >
              <Download size={16} /> QR 저장
            </a>
          </div>
          <button className="gold-button" onClick={share}>
            초대장 공유하기 <Share2 size={17} />
          </button>
        </Modal>
      )}
      {modal === "rsvp" && (
        <Modal
          title={
            receipt
              ? receipt.mode === "preview"
                ? "With thanks."
                : "Thank you."
              : "Be our guest."
          }
          onClose={() => {
            if (!busy) setModal(null);
          }}
        >
          {receipt ? (
            <div className="receipt" aria-live="polite">
              <div className="receipt-check">
                <Check size={26} />
              </div>
              <p>
                {receipt.mode === "preview"
                  ? "미리보기 응답이 완료되었습니다."
                  : "참석 응답이 접수되었습니다."}
              </p>
              <div className="ticket">
                <span className="eyebrow">
                  {receipt.mode === "preview"
                    ? "PREVIEW RESPONSE"
                    : "RSVP RECEIPT"}
                </span>
                <h3>{name}</h3>
                <span>
                  {attendance === "yes"
                    ? `참석 · ${guests}명`
                    : "아쉽지만 불참"}
                </span>
                <div className="ticket-cut" />
                <span className="ticket-brand">MATIGNON SEOUL</span>
                <small>{receipt.id.slice(0, 18)}</small>
              </div>
              <p className="preview-note">
                {receipt.mode === "preview"
                  ? "미리보기이며 입력 내용은 저장되지 않습니다."
                  : "응답이 안전하게 저장되었습니다. 이 화면은 입장권이 아닌 응답 확인서입니다."}
              </p>
              <button className="gold-button" onClick={() => setModal(null)}>
                초대장으로 돌아가기 <ArrowRight size={17} />
              </button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <p className="sheet-description">
                {preview
                  ? "참석 응답 과정을 미리 체험해보세요."
                  : "당신을 맞이할 수 있도록 참석 여부를 알려주세요."}
              </p>
              <fieldset disabled={busy}>
                <div className="field">
                  <label htmlFor="name">성함 또는 닉네임</label>
                  <input
                    id="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setErrors((previous) => ({ ...previous, name: "" }));
                    }}
                    autoComplete="name"
                    placeholder="어떻게 불러드릴까요?"
                    maxLength={40}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                  />
                  {errors.name && (
                    <p className="field-error" id="name-error">
                      {errors.name}
                    </p>
                  )}
                </div>
                <div className="field">
                  <span id="attendance-label" className="field-label">
                    참석 여부
                  </span>
                  <div
                    className="attendance-options"
                    role="group"
                    aria-labelledby="attendance-label"
                  >
                    <button
                      type="button"
                      aria-pressed={attendance === "yes"}
                      onClick={() => setAttendance("yes")}
                    >
                      함께할게요{" "}
                      <span aria-hidden="true">
                        {attendance === "yes" ? <Check size={15} /> : "↗"}
                      </span>
                    </button>
                    <button
                      type="button"
                      aria-pressed={attendance === "no"}
                      onClick={() => setAttendance("no")}
                    >
                      다음에 만나요{" "}
                      <span aria-hidden="true">
                        {attendance === "no" ? <Check size={15} /> : "↗"}
                      </span>
                    </button>
                  </div>
                </div>
                {attendance === "yes" && (
                  <div className="guest-field">
                    <div>
                      <span className="field-label">참석 인원</span>
                      <small>본인을 포함한 인원</small>
                    </div>
                    <div className="stepper">
                      <button
                        type="button"
                        aria-label="참석 인원 줄이기"
                        disabled={guests === 1}
                        onClick={() => setGuests(guests - 1)}
                      >
                        <Minus size={15} />
                      </button>
                      <output aria-live="polite">{guests}</output>
                      <button
                        type="button"
                        aria-label="참석 인원 늘리기"
                        disabled={guests === 4}
                        onClick={() => setGuests(guests + 1)}
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                  </div>
                )}
                <div className="consent-wrap">
                  <label className="consent-label">
                    <input
                      id="consent"
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => {
                        setConsent(e.target.checked);
                        setErrors((previous) => ({ ...previous, consent: "" }));
                      }}
                      aria-invalid={!!errors.consent}
                      aria-describedby="consent-info"
                    />
                    <span>
                      {preview
                        ? "미리보기임을 확인했습니다."
                        : "개인정보 수집·이용에 동의합니다."}
                    </span>
                  </label>
                  <p id="consent-info" className="consent-info">
                    {preview
                      ? "입력 내용은 저장되지 않습니다."
                      : event?.privacyNotice}
                  </p>
                  {errors.consent && (
                    <p className="field-error">{errors.consent}</p>
                  )}
                </div>
              </fieldset>
              {errors.submit && (
                <p className="field-error submit-error" role="alert">
                  {errors.submit}
                </p>
              )}
              <button
                className="gold-button"
                type="submit"
                disabled={busy || !event}
                aria-busy={busy}
              >
                {busy
                  ? "응답을 보내는 중…"
                  : preview
                    ? "미리보기 응답 보내기"
                    : "참석 응답 보내기"}
                {busy ? (
                  <span className="spinner" />
                ) : (
                  <ArrowUpRight size={19} />
                )}
              </button>
            </form>
          )}
        </Modal>
      )}
      <div className={`toast ${toast ? "show" : ""}`} role="status">
        {toast}
      </div>
    </div>
  );
}
