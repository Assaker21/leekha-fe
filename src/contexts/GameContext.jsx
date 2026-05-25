import { createContext, useContext, useState, useEffect, useMemo } from "react";

const GameContext = createContext(null);

export function getCardSuit(card) {
  return card[0];
}

export function getCardValue(card) {
  return Number(card.replace(card[0], "").replace(".", ""));
}

function isQueenOfSpades(card) {
  return getCardSuit(card) === "s" && getCardValue(card) === 12;
}

function isTenOfDiamonds(card) {
  return getCardSuit(card) === "d" && getCardValue(card) === 10;
}

function createDeck() {
  const suits = ["h", "d", "c", "s"];
  const values = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

  return suits.flatMap((suit) => values.map((value) => suit + value));
}

function createShuffledDeck() {
  const deck = createDeck();
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function getTrickDetails(trick) {
  if (!trick) return { completed: false, winner: { card: null, player: null } };

  let winningCard = trick[trick.start];
  let winningPlayer = trick.start;

  if (!winningCard)
    return { completed: false, winner: { card: null, player: null } };

  const startingSuit = getCardSuit(winningCard);

  Object.values(trick).forEach((card) => {
    if (typeof card !== "string") return;
    if (card.includes(startingSuit)) {
      if (getCardValue(winningCard) < getCardValue(card)) {
        winningCard = card;
        winningPlayer = Number(
          Object.keys(trick).find(
            (key) => trick[key] === card && key !== "start",
          ),
        );
      }
    }
  });

  return {
    completed: Object.keys(trick).length === 5,
    winner: {
      card: winningCard,
      player: winningPlayer,
    },
  };
}

export function GameProvider({ children }) {
  const [rounds, setRounds] = useState([]);
  const [round, roundIndex] = useMemo(() => {
    if (!rounds?.length) {
      return [startRound(), -1];
    }

    const lastRound = rounds[rounds.length - 1];

    if (
      lastRound?.tricks?.length === 13 &&
      getTrickDetails(lastRound?.tricks[12]).completed
    ) {
      return [startRound(), -1];
    }

    if (!lastRound.tricks?.length) lastRound.tricks = [];

    return [lastRound, rounds.length - 1];
  }, [rounds]);

  const trick = useMemo(() => {
    if (!round.tricks?.length) {
      return {};
    }

    return round.tricks[round.tricks.length - 1];
  }, [round]);

  const state = useMemo(() => {
    if (Object.keys(round?.passes || {}).length === 4) {
      if (
        Object.values(round?.passes).every(
          (pass) => pass.cards.length === 3 && !pass.unsent,
        )
      ) {
        return "play";
      }
    }
    return "pass";
  }, [round]);

  function start() {
    setRounds([]);
  }

  function startRound() {
    const round = {
      hands: {},
      tricks: [],
      passes: {},
    };

    const deck = createShuffledDeck();
    for (let i = 0; i < 4; i++) {
      round.hands[i] = deck.slice(i * 13, i * 13 + 13);
    }

    return round;
  }

  function getPlayerHand(id) {
    if (!round.hands[id]) return [];

    // initial hand
    let hand = [...round.hands[id]];

    // received cards
    const receivedCards = Object.values(round.passes || {}).find(
      (pass) => pass.to === id && !pass.unsent,
    )?.cards;
    if (receivedCards) {
      hand = hand.concat(receivedCards);
    }

    // given cards
    const givenCards = round.passes?.[id]?.cards || [];
    if (state === "play" || !round.passes?.[id]?.unsent) {
      hand = hand.filter((card) => !givenCards.includes(card));
    }

    // normal tricks
    hand = hand.filter(
      (card) => !round.tricks.find((trick) => trick[id] === card),
    );

    // sort hand by suit then value
    hand.sort((a, b) => {
      const suitA = getCardSuit(a);
      const suitB = getCardSuit(b);

      if (suitA !== suitB) {
        // Explicitly handle "h" vs "s" in both directions
        if (suitA === "h" && suitB === "s") return 1;
        if (suitA === "s" && suitB === "h") return -1;

        // Fallback for all other suit combinations
        return suitA.localeCompare(suitB);
      }

      // If suits are the same, sort by value
      return getCardValue(a) - getCardValue(b);
    });

    // find playable cards
    if (state === "pass") {
      // In pass state, if cards are already sent, you can't select anymore
      if (
        !round.passes?.[id]?.unsent &&
        round.passes?.[id]?.cards?.length > 0
      ) {
        return hand; // no dot
      }
      if (round.passes?.[id]?.unsent || !round.passes?.[id]) {
        console.log("PASSES: ", round.passes);
        const value = Object.values(round.passes).find(
          (value) => value?.to == id,
        );

        console.log("VALUE NOT TO BE SENT: ", value?.cards);

        return hand
          .filter((v) => !value?.cards?.find((c) => c == v))
          .map((c) => c + ".");
      }
      return hand.map((card) => card + ".");
    } else if (state === "play") {
      if (Object.keys(trick).length === 0 || getTrickDetails(trick).completed) {
        // lead any card
        return hand.map((card) => card + ".");
      }

      const leadingSuit = getCardSuit(trick[trick.start]);
      const hasLeadingSuit = hand.some(
        (card) => getCardSuit(card) === leadingSuit,
      );

      if (hasLeadingSuit) {
        return hand.map((card) => {
          if (getCardSuit(card) === leadingSuit) {
            return card + ".";
          }
          return card;
        });
      } else {
        const hasQofS = hand.some(isQueenOfSpades);
        const has10ofD = hand.some(isTenOfDiamonds);

        if (hasQofS) {
          return hand.map((card) =>
            isQueenOfSpades(card) ? card + "." : card,
          );
        } else if (has10ofD) {
          return hand.map((card) =>
            isTenOfDiamonds(card) ? card + "." : card,
          );
        } else {
          // all hand is allowed
          return hand.map((card) => card + ".");
        }
      }
    }

    return hand;
  }

  function getPlayerBag(id) {
    let bag = [];
    round.tricks.forEach((trick) => {
      const trickDetails = getTrickDetails(trick);
      if (trickDetails.completed && trickDetails.winner.player === id) {
        Object.keys(trick).forEach((k) => {
          if (k !== "start") bag.push(trick[k]);
        });
      }
    });
    return bag;
  }

  function getPassingCards(id) {
    return round?.passes?.[id]?.cards || [];
  }

  function getTable() {
    return trick;
  }

  function isPlayerTurn(id) {
    if (state !== "play") return false;

    if (round.tricks.length === 0) {
      // Find who has the 2 of clubs (c2)
      for (let i = 0; i < 4; i++) {
        const hand = getPlayerHand(i).map((c) => c.replace(".", ""));
        if (hand.includes("c2")) return id === i;
      }
      return id === 0; // fallback
    }

    const currentTrick = round.tricks[round.tricks.length - 1];
    const details = getTrickDetails(currentTrick);

    if (details.completed) {
      return details.winner.player === id; // Winner of previous trick leads
    }

    // Trick is ongoing
    const playersPlayed = Object.keys(currentTrick).filter(
      (k) => k !== "start",
    ).length;
    const nextPlayer = (currentTrick.start + playersPlayed) % 4;
    return id === nextPlayer;
  }

  function updateRound(newRound) {
    setRounds((rounds) => {
      if (roundIndex === -1) {
        return [...rounds, newRound];
      } else {
        const newRounds = [...rounds];
        newRounds[roundIndex] = newRound;
        return newRounds;
      }
    });
  }

  function playPassCard(id, card) {
    if (state === "play") return false;

    const r = { ...round };
    r.passes = { ...r.passes };
    const cleanCard = card.replace(".", "");

    if (!r.passes[id] || !r.passes[id].unsent) {
      r.passes[id] = { cards: [], to: (id + 1) % 4, unsent: true };
    }

    if (r.passes[id].cards.length >= 3) return false;
    if (r.passes[id].cards.includes(cleanCard)) return false;

    r.passes[id] = {
      ...r.passes[id],
      cards: [...r.passes[id].cards, cleanCard],
    };

    updateRound(r);
  }

  function unplayPassCard(id, card) {
    if (state === "play") return false;

    const r = { ...round };
    r.passes = { ...r.passes };
    const cleanCard = card.replace(".", "");

    if (!r.passes[id] || !r.passes[id].unsent) return false;

    const cards = r.passes[id].cards.filter((c) => c !== cleanCard);
    r.passes[id] = { ...r.passes[id], cards };

    updateRound(r);
  }

  function sendPasses(id) {
    if (state === "play") return false;

    const r = { ...round };
    r.passes = { ...r.passes };

    if (!r.passes[id] || r.passes[id].cards.length !== 3) return false;

    r.passes[id] = { ...r.passes[id], unsent: false };

    updateRound(r);
  }

  function playCard(id, card) {
    if (state === "pass") return false;
    if (!isPlayerTurn(id)) return false;

    const cleanCard = card.replace(".", "");
    const r = { ...round };
    r.tricks = [...r.tricks];

    const lastTrick =
      r.tricks.length > 0 ? r.tricks[r.tricks.length - 1] : null;
    let currentTrickDetails = getTrickDetails(lastTrick);

    if (!lastTrick || currentTrickDetails.completed) {
      // Must play 2 of clubs on first trick if first player
      // if (r.tricks.length === 0) {
      //   const hand = getPlayerHand(id).map((c) => c.replace(".", ""));
      //   if (hand.includes("c2") && cleanCard !== "c2") {
      //     return false;
      //   }
      // }
      r.tricks.push({ start: id, [id]: cleanCard });
    } else {
      const updatedTrick = { ...lastTrick };
      updatedTrick[id] = cleanCard;
      r.tricks[r.tricks.length - 1] = updatedTrick;
    }

    updateRound(r);
  }

  useEffect(() => {
    start();
  }, []);

  return (
    <GameContext.Provider
      value={{
        start,
        getPlayerBag,
        getPlayerHand,
        getTable,
        getPassingCards,
        isPlayerTurn,
        playPassCard,
        unplayPassCard,
        sendPasses,
        playCard,
        state,
        round,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within an GameProvider");
  }
  return context;
}
