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

const cardUtils = {
  getSuitColor,
  getRank,
  getSuitCharacter,
  fan,
  fanRotate,
  getCard2,
};

export default cardUtils;
