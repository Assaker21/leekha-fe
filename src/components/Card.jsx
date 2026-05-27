import clsx from "clsx";
import { getCardSuit, getCardValue } from "../contexts/GameContext";
import { useEffect, useRef, useState } from "react";

function getSuitColor(suit) {
  // Normalize the input to lowercase to handle mixed casing
  const lowerSuit = suit.toLowerCase();

  if (lowerSuit === "h" || lowerSuit === "d") {
    return "red-500";
  } else if (lowerSuit === "c" || lowerSuit === "s") {
    return "black";
  }
  return "gray-500";
}

function getRank(value) {
  if (value <= 10) return "" + value;
  if (value == 11) return "J";
  if (value == 12) return "Q";
  if (value == 13) return "K";
  if (value == 14) return "A";
}

function getSuitCharacter(suit) {
  const lowerSuit = suit.toLowerCase();

  if (lowerSuit === "h") {
    return "♥";
  } else if (lowerSuit === "d") {
    return "♦";
  } else if (lowerSuit === "c") {
    return "♣";
  } else if (lowerSuit === "s") {
    return "♠";
  }
  return "?";
}

const FANNING_POWER = 0.4;

function fan(x) {
  return (-0.25 * (x - 6.5) * (x - 6.5) + 10) * FANNING_POWER;
}

function fanRotate(x) {
  let multiplier = 1;
  if (x < 6.5) multiplier = -1;
  return multiplier * 0.25 * (x - 6.5) * (x - 6.5) * FANNING_POWER;
}

function getCard2(card) {
  let suit = getCardSuit(card).toUpperCase();
  let rank = getRank(getCardValue(card)).toUpperCase();

  return rank + "-" + suit + ".png";
}

export default function Card({
  card,
  className,
  enabled,
  selected,
  onClick,
  flipped,
  fanning,
  size = "md",
}) {
  const cardRef = useRef(null);
  const [shadowOffset, setShadowOffset] = useState({ x: -5, y: 5 }); // Default static offsets

  useEffect(() => {
    const updateShadow = () => {
      if (!cardRef.current) return;

      // 1. Get dimensions of the card and the screen
      const rect = cardRef.current.getBoundingClientRect();
      const cardCenterX = rect.left + rect.width / 2;
      const cardCenterY = rect.top + rect.height / 2;

      const screenCenterX = window.innerWidth / 2;
      const screenCenterY = window.innerHeight / 2;

      // 2. Calculate distance from screen center (-1 to 1 range)
      const deltaX = (cardCenterX - screenCenterX) / screenCenterX;
      const deltaY = (cardCenterY - screenCenterY) / screenCenterY;

      // 3. Define max shadow displacement in pixels (e.g., max 15px offset)
      const maxOffset = 15;

      // Opposite direction simulates a light source at the center of the screen
      setShadowOffset({
        x: deltaX * maxOffset,
        y: deltaY * maxOffset,
      });
    };

    // Run on mount, scroll, and window resize
    updateShadow();
    window.addEventListener("scroll", updateShadow, { passive: true });
    window.addEventListener("resize", updateShadow);

    return () => {
      window.removeEventListener("scroll", updateShadow);
      window.removeEventListener("resize", updateShadow);
    };
  }, []);

  return (
    <div
      ref={cardRef} // Attached to outer container to track its position
      onClick={onClick}
      className={clsx(
        "relative flex flex-row items-center justify-center z-0",
        className,
        size === "xs" && "min-w-30 w-30 max-w-30 h-45",
        size === "sm" && "min-w-34 w-34 max-w-34 h-51",
        size === "md" && "min-w-36 w-36 max-w-36 h-54",
        size === "lg" && "min-w-40 w-40 max-w-40 h-60",
      )}
      style={
        fanning
          ? {
              transform: `translate(${0}px, ${-fan(fanning.position) * 3}px) rotate(${fanRotate(fanning.position)}deg)`,
            }
          : null
      }
    >
      {/* Dynamic Shadow Image */}
      <img
        className="w-full h-full absolute z-0 opacity-20 will-change-transform"
        src={"/cards/shadow.png"}
        style={{
          transform: `translate(${shadowOffset.x}px, ${shadowOffset.y}px)`,
        }}
      />

      <img
        className="w-full h-full absolute z-0"
        src={
          flipped
            ? "/cards2/back-red.png"
            : true
              ? `/cards2/${getCard2(card)}`
              : `/cards/${card.replace(".", "")}.png`
        }
      />

      {!enabled && !flipped ? (
        <img
          className="w-full h-full opacity-20 absolute top-0 left-0 z-0"
          src={"/cards/shadow.png"}
          // style={{
          //   transform: `translate(${shadowOffset.x}px, ${shadowOffset.y}px)`,
          // }}
        />
      ) : null}
    </div>
  );
}

//  {/* <CardMark card={card} className={"absolute left-0 top-1 "} />
//       <CardMark
//         card={card}
//         className={"absolute right-0 bottom-1 rotate-180"}
//       /> */}
//       {/* <span className={clsx("text-7xl", "text-" + getSuitColor(suit))}>
//         {getSuitCharacter(suit)}
//       </span> */}
function CardMark({ card, className }) {
  const suit = getCardSuit(card);
  const rank = getRank(getCardValue(card));
  return (
    <div
      className={clsx(
        "flex flex-col gap-0 items-center w-8",
        className,
        "text-" + getSuitColor(suit),
      )}
    >
      <span>{rank}</span>
      <span className={clsx("text-2xl -mt-2", "text-" + getSuitColor(suit))}>
        {getSuitCharacter(suit)}
      </span>
    </div>
  );
}
