/** Shared reference-inspired mascot, including a lightweight celebratory blink. */
export function Turtle({ happy = false }: { happy?: boolean }) {
  return (
    <svg
      className={happy ? "turtle happy" : "turtle"}
      viewBox="0 0 1536 1024"
      fill="none"
      aria-label="Красноухая черепашка"
      role="img"
    >
      <image
        href={`${import.meta.env.BASE_URL}turtle.webp`}
        width="1536"
        height="1024"
      />
      {happy && (
        <g className="turtle-blink" aria-hidden="true">
          <ellipse cx="383" cy="568" rx="53" ry="52" fill="#C6C483" />
          <path
            d="M348 572 Q383 600 418 568"
            stroke="#282817"
            strokeWidth="10"
            strokeLinecap="round"
          />
        </g>
      )}
    </svg>
  );
}
