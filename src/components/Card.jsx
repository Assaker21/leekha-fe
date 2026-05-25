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

export default function Card({
  card,
  className,
  enabled,
  selected,
  onClick,
  flipped,
}) {
  const suit = getCardSuit(card);
  const rank = getRank(getCardValue(card));
  return (
    <div
      onClick={onClick}
      className={clsx(
        "relative min-w-40 w-40 max-w-40 h-60 relative flex flex-row items-center justify-center z-0",
        className,
        enabled ? "" : "bg-gray-400 pointer-events-none",
        selected ? "-mb-30" : "",
      )}
    >
      <img
        className="w-full h-full absolute translate-x-2"
        src={"/cards/shadow.png"}
      />
      <img
        className="w-full h-full"
        src={
          flipped ? "/cards/back.png" : `/cards/${card.replace(".", "")}.png`
        }
      />
      {/* <CardMark card={card} className={"absolute left-0 top-1 "} />
      <CardMark
        card={card}
        className={"absolute right-0 bottom-1 rotate-180"}
      /> */}
      {/* <span className={clsx("text-7xl", "text-" + getSuitColor(suit))}>
        {getSuitCharacter(suit)}
      </span> */}
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
