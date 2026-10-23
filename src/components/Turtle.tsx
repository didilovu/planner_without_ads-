export function Turtle({ happy = false }: { happy?: boolean }) {
  return (
    <svg
      className={happy ? "turtle happy" : "turtle"}
      viewBox="0 0 180 130"
      fill="none"
      aria-label="Красноухая черепашка"
      role="img"
    >
      <path d="M32 81 17 92l17 2" fill="#8EA27F" />
      <ellipse cx="52" cy="104" rx="14" ry="9" fill="#A7BC91" />
      <ellipse
        className="flipper"
        cx="110"
        cy="104"
        rx="15"
        ry="9"
        fill="#A7BC91"
      />
      <path
        d="M28 87c0-41 24-62 57-62s53 25 53 62c-29 24-83 23-110 0Z"
        fill="#718A75"
      />
      <path
        d="m59 39 24 14 27-14M83 53v27l-28 17M83 80l30 16M30 73l25-4 4-30M55 69l28 11M110 39l3 30 24 5M113 69 83 80"
        stroke="#A8BB98"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <ellipse cx="139" cy="72" rx="29" ry="28" fill="#B7C9A8" />
      <path
        d="m119 72 10 3m25-3 9-3"
        stroke="#E8A19A"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <g className="eyes">
        <circle cx="131" cy="64" r="3" fill="#354B3F" />
        <circle cx="151" cy="62" r="3" fill="#354B3F" />
      </g>
      <path
        d="M137 79q6 5 11-1"
        stroke="#465E4C"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="157" cy="56" r="2" fill="#E5EEDC" />
    </svg>
  );
}
