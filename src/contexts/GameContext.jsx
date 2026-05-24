import { createContext, useContext, useState, useEffect, useMemo } from "react";

const GameContext = createContext(null);

export function getCardSuit(card) {
  return card[0];
}

export function getCardValue(card) {
  return Number(card.replace(card[0], ""));
}

function isQueenOfSpades(card) {
  return getCardSuit(card) == "s" && getCardValue(card) == 12;
}

function isTenOfDiamonds(card) {
  return getCardSuit(card) == "d" && getCardValue(card) == 10;
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
  const winningCard = trick[trick.start];
  const winningPlayer = trick.start;

  const startingSuit = getCardSuit(trick[trick.start]);

  Object.values((card) => {
    if (card.includes(startingSuit)) {
      if (getCardValue(winningCard) < getCardValue(card)) {
        winningCard = card;
        winningPlayer = Object.keys(trick).find(
          (key) => trick[key] === winningCard,
        );
      }
    }
  });

  return {
    completed: !Object.values(trick).find((v) => !v),
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
      lastRound?.tricks?.length == 13 &&
      getTrickDetails(lastRound?.tricks[12]).completed
    ) {
      return [startRound(), -1];
    }

    if (!lastRound.tricks?.length) lastRound.tricks = [];

    return [rounds[rounds.length - 1], rounds.length - 1];
  }, [rounds]);

  const trick = useMemo(() => {
    if (!round.tricks?.length) {
      return {};
    }

    return round.tricks[round.tricks.length - 1];
  }, [round]);

  const state = useMemo(() => {
    if (Object.values(round?.passes)?.length == 4) {
      if (Object.values(round?.passes).find((pass) => pass.cards.length == 3)) {
        return "play";
      }
    }
    return "pass";
  }, [round]);

  // const roundss = {
  //   hands: {
  //     0: [],
  //     1: [],
  //     2: [],
  //     3: [],
  //   },
  //   tricks: [
  //     {
  //       0: "h13",
  //       1: "h2",
  //       2: "h5",
  //       3: "s9",
  //       start: 0,
  //     },
  //   ],
  //   passes: {
  //     0: { to: 1, cards: ["h2", "h3", "h4"] },
  //     1: { to: 2, cards: ["h2", "h3", "h4"] },
  //     2: { to: 3, cards: ["h2", "h3", "h4"] },
  //     3: { to: 0, cards: ["h2", "h3", "h4"] },
  //   },
  // };

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
    // initial hand
    let hand = [...round.hands[id]];
    console.log("HAND: ", hand);

    // received cards
    const receivedCards = Object.values(round.passes).find(
      (pass) => pass.to == id,
    )?.cards;
    hand.concat(receivedCards);

    console.log("HAND: ", hand);

    // given cards
    hand = hand.filter((card) => card != round.passes[id]);

    console.log("HAND: ", hand);

    // normal tricks
    hand = hand.filter(
      (card) => !round.tricks.find((trick) => trick[id] == card),
    );

    console.log("HAND: ", hand);

    // find playable cardsa
    if (state == "pass") {
      console.log("HAND PASS: ", hand);
      return hand.map((card) => card + ".");
    } else if (state == "play") {
      const leadingSuit = getCardSuit(trick[trick.start]);
      if (hand.find((card) => getCardSuit(card) == leadingSuit)) {
        hand = hand.map((card) => {
          if (getCardSuit(card) == leadingSuit) {
            return card + ".";
          }
          return card;
        });
      } else {
        if (hand.find(isQueenOfSpades)) {
          hand = hand.map((card) => {
            if (isQueenOfSpades(card)) {
              return card + ".";
            }
            return card;
          });
        } else if (hand.find(isTenOfDiamonds)) {
          hand = hand.map((card) => {
            if (isTenOfDiamonds(card)) {
              return card + ".";
            }
            return card;
          });
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
      if (trickDetails.winner.player == id) {
        bag.concat(...Object.values(trick));
      }
    });

    return bag;
  }

  function getPassingCards(id) {}

  function getTable() {
    return trick;
  }

  function isPlayerTurn(id) {
    if (trick[id]) {
      if (Object.keys(trick).length == 4) {
        return getTrickDetails(trick).winner.player == id;
      } else return false;
    } else {
      return Boolean(trick[(id - 1) % 4]);
    }
  }

  function updateRound(newRound) {
    setRounds((rounds) => {
      if (roundIndex == -1) {
        return [...rounds, newRound];
      } else {
        rounds = [...rounds];
        rounds[roundIndex] = newRound;
      }
    });
  }

  function playPassCard(id, card) {
    if (state == "play") return false;
    const r = { ...round };
    r.passes = { ...r.passes };

    if (!r.passes[id]?.cards?.length) {
      r.passes[id] = { cards: [], to: (id + 1) % 4, unsent: true };
    }

    r.passes[id].cards.push(card);

    updateRound(r);
  }

  function unplayPassCard(id, card) {
    if (state == "play") return false;
    const r = { ...round };
    r.passes = { ...r.passes };

    if (!r.passes[id]?.cards?.length) {
      r.passes[id] = { cards: [], to: (id + 1) % 4, unsent: true };
    }

    let index = r.passes[id].cards.findIndex((c) => c == card);
    if (index != -1) {
      r.passes[id].cards.splice(index, 1);
    }

    updateRound(r);
  }

  function sendPasses(id) {
    if (state == "play") return false;

    const r = { ...round };
    r.passes = { ...r.passes };

    delete r.passes[id].unsent;

    updateRound(r);
  }

  function playCard(id, card) {
    if (state == "pass") return false;

    const r = { ...round };
    r.tricks = [...r.tricks];
    r.passes = { ...r.passes };

    const lastTrick = r.tricks[r.tricks.length - 1];
    if (!lastTrick[i]) {
      r.tricks[r.tricks.length - 1][id] = card;
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
        isPlayerTurn,
        playPassCard,
        unplayPassCard,
        sendPasses,
        playCard,
        state,
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
  console.log("CONTEXT: ", context);
  return context;
}
