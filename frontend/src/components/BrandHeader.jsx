export default function BrandHeader({ alert = false }) {
  return (
    <header className={`brand-header${alert ? " brand-header-danger" : ""}`}>
      <span className="brand-shield" aria-hidden="true">
        <svg viewBox="0 0 32 36" focusable="false">
          <path d="M16 2 28 7v9c0 8-5 14-12 18C9 30 4 24 4 16V7l12-5Z" />
          <path d="m10 17 4 4 8-9" />
        </svg>
      </span>
      <span>DisasterLens AI</span>
    </header>
  );
}
