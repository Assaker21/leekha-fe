import clsx from "clsx";
import { getCardSuit, getCardValue } from "../contexts/GameContext";

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
  if (value <= 10) return value;
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

export default function Card({ card, className, enabled, selected, onClick }) {
  const suit = getCardSuit(card);
  const rank = getRank(getCardValue(card));
  return (
    <div
      onClick={onClick}
      className={clsx(
        "bg-white rounded-xl min-w-40 w-40 max-w-40 h-60 relative flex flex-row items-center justify-center shadow-sm shadow-grey-900 z-0",
        className,
        enabled ? "" : "opacity-50 pointer-events-none",
        selected ? "-mb-30" : "",
      )}
    >
      <CardMark card={card} className={"absolute left-0 top-1 "} />
      <CardMark
        card={card}
        className={"absolute right-0 bottom-1 rotate-180"}
      />
      <span className={clsx("text-7xl", "text-" + getSuitColor(suit))}>
        {getSuitCharacter(suit)}
      </span>
    </div>
  );
}

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
