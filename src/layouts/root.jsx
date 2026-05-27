import clsx from "clsx";
import { useEffect } from "react";
import Card from "../components/Card.v2";
import { useGame } from "../contexts/GameContext";

function PlayerHand({ game, id, position, flipped, controller }) {
  const cards = game.getPlayerHand(id);
  const isHorizontal = position === "bottom" || position === "top";

  const passCards = game.getPassingCards(id);
  const passesSent = game.round?.passes?.[id]?.unsent === false;
  const canSend = passCards.length === 3 && !passesSent;

  // --- Automation for Random Controller ---
  useEffect(() => {
    if (controller !== "random") return;

    // 1. Handle Passing Phase Automation
    if (game.state === "pass" && !passesSent) {
      if (passCards.length < 3) {
        // Find cards that haven't been selected for passing yet
        const availableCards = cards.filter(
          (card) => !passCards.includes(card.replace(".", "")),
        );
        if (availableCards.length > 0) {
          // Select a random available card
          const randomCard =
            availableCards[Math.floor(Math.random() * availableCards.length)];
          game.playPassCard(id, randomCard);
        }
      } else if (canSend) {
        // Once 3 cards are selected, send them after a slight delay
        const timer = setTimeout(() => {
          game.sendPasses(id);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }

    // 2. Handle Playing Phase Automation
    if (game.state === "play" && game.isPlayerTurn(id)) {
      // Filter cards that have a dot '.' indicating they are legal to play
      const playableCards = cards.filter((card) => card.includes("."));

      if (playableCards.length > 0) {
        const timer = setTimeout(() => {
          const randomCard =
            playableCards[Math.floor(Math.random() * playableCards.length)];
          game.playCard(id, randomCard);
        }, 1000); // 1-second delay for natural gameplay rhythm
        return () => clearTimeout(timer);
      }
    }
  }, [
    game.state,
    game.round?.passes,
    cards,
    passCards,
    id,
    controller,
    passesSent,
    canSend,
    game.isPlayerTurn(id),
  ]);

  // --- Layout Classes Setup ---
  let containerClass = "absolute flex z-10 ";
  if (position === "bottom")
    containerClass += "flex-row -bottom-2 left-1/2 -translate-x-1/2 pb-2";
  if (position === "top")
    containerClass += "flex-row -top-32 left-1/2 -translate-x-1/2 pt-10";
  if (position === "left")
    containerClass += "flex-col -left-28 top-1/2 -translate-y-1/2 pl-10";
  if (position === "right")
    containerClass += "flex-col -right-28 top-1/2 -translate-y-1/2 pr-10";

  return (
    <div className={containerClass}>
      {/* Send Passes Button */}
      {game.state === "pass" && !flipped && (
        <div
          className={clsx(
            "absolute flex items-center justify-center",
            position === "bottom" && "top-0 left-1/2 -translate-x-1/2 -mt-12",
            position === "top" && "bottom-0 left-1/2 -translate-x-1/2 -mb-12",
            position === "left" && "right-0 top-1/2 -translate-y-1/2 -mr-32",
            position === "right" && "left-0 top-1/2 -translate-y-1/2 -ml-32",
          )}
        >
          {!passesSent && (
            <button
              onClick={() => game.sendPasses(id)}
              disabled={!canSend}
              className={clsx(
                "px-4 py-2 font-bold whitespace-nowrap -mt-50",
                canSend
                  ? "bg-[#ab5236] text-white hover:bg-[#ab5236] cursor-pointer"
                  : "bg-black/30 text-gray-200",
              )}
            >
              Send Passes
            </button>
          )}
          {passesSent && (
            <span className="bg-green-500 text-white px-4 py-2 rounded font-bold whitespace-nowrap shadow-md">
              Ready
            </span>
          )}
        </div>
      )}

      {/* Turn indicator */}
      {/* {game.state === "play" && game.isPlayerTurn(id) && (
        <div
          className={clsx(
            "absolute pointer-events-none rounded-full shadow-[0_0_20px_rgba(72,187,120,0.8)] border-4 border-green-500",
            position === "bottom" && "-inset-6",
            position === "top" && "-inset-6",
            position === "left" && "-inset-6",
            position === "right" && "-inset-6",
          )}
        />
      )} */}

      {cards.map((card, idx) => {
        let selected = false;
        let enabled = false;

        if (game.state === "pass") {
          selected = passCards.includes(card.replace(".", ""));
          enabled = !passesSent;
        } else {
          if (game.isPlayerTurn(id) && card.includes(".")) {
            enabled = true;
          }
        }

        const isFirst = idx === 0;
        let overlapClass = "";
        if (!isFirst) {
          if (isHorizontal) {
            if (flipped) overlapClass = "-ml-32";
            else overlapClass = "-ml-24";
          } else {
            if (flipped) overlapClass = "-mt-52";
            else overlapClass = "-mt-48";
          }
        }

        let transformClass = "";
        if (selected) {
          if (position === "bottom") transformClass = "-translate-y-10";
        }

        return (
          <div
            key={card + idx}
            className={clsx(
              overlapClass,
              "transition-transform relative",
              transformClass,
            )}
          >
            <Card
              shadow={!flipped}
              fanning={
                !flipped
                  ? {
                      total: cards.length,
                      position: idx + 0.5,
                    }
                  : null
              }
              flipped={flipped}
              onClick={() => {
                if (game.state === "pass") {
                  if (!passesSent) {
                    if (!selected) {
                      game.playPassCard(id, card);
                    } else {
                      game.unplayPassCard(id, card);
                    }
                  }
                } else {
                  console.log(
                    "PLAYING CARD: ",
                    id,
                    card,
                    enabled,
                    game.isPlayerTurn(0),
                  );
                  if (enabled) {
                    game.playCard(id, card);
                  }
                }
              }}
              enabled={enabled}
              selected={selected}
              className={clsx(
                "hover:scale-105 transition-all text-sm",
                enabled ? "cursor-pointer" : "pointer-events-none",
                position === "left" && "rotate-90",
                position === "right" && "-rotate-90",
              )}
              card={card.replace(".", "")}
            />
          </div>
        );
      })}
    </div>
  );
}

function GameTable({ game }) {
  const trick = game.getTable();

  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full flex items-center justify-center">
      <div className="relative w-full h-full">
        {/* Render cards based on trick object */}
        {trick && trick["0"] && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
            <Card
              key={"Card key: " + trick["0"]}
              card={trick["0"]}
              enabled
              size="sm"
            />
          </div>
        )}
        {trick && trick["1"] && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
            <Card
              key={"Card key: " + trick["1"]}
              card={trick["1"]}
              className=" rotate-90"
              enabled
              size="sm"
            />
          </div>
        )}
        {trick && trick["2"] && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
            <Card
              key={"Card key: " + trick["2"]}
              card={trick["2"]}
              className=" rotate-180"
              enabled
              size="sm"
            />
          </div>
        )}
        {trick && trick["3"] && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
            <Card
              key={"Card key: " + trick["3"]}
              card={trick["3"]}
              className=" -rotate-90"
              enabled
              size="sm"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function Root({ children }) {
  const game = useGame();

  return (
    <div className="bg-[#10522c] flex items-center justify-center w-screen h-screen relative overflow-hidden font-sans">
      <img src="/corner.png" className="absolute left-0 bottom-0 z-1" />
      <img src="/corner.png" className="absolute left-0 top-0 rotate-90 z-1" />
      <img
        src="/corner.png"
        className="absolute right-0 bottom-0 -rotate-90 z-1"
      />
      <img
        src="/corner.png"
        className="absolute right-0 top-0 rotate-180 z-1"
      />

      <img
        src="/border-v.png"
        className="absolute left-0 h-screen w-[54px] z-0"
      />
      <img
        src="/border-v.png"
        className="absolute right-0 h-screen w-[54px] z-0 rotate-180"
      />
      <div className="absolute top-0 w-screen h-[54px] z-0 bg-[url('/border-h.png')] bg-repeat-x bg-auto" />
      <div className="absolute bottom-0 w-screen h-[54px] z-0 rotate-180 bg-[url('/border-h.png')] bg-repeat-x bg-auto" />

      <GameTable game={game} />

      <PlayerHand game={game} id={0} position="bottom" controller="player" />
      <PlayerHand
        game={game}
        id={1}
        position="left"
        flipped
        controller="random"
      />
      <PlayerHand
        game={game}
        id={2}
        position="top"
        flipped
        controller="random"
      />
      <PlayerHand
        game={game}
        id={3}
        position="right"
        flipped
        controller="random"
      />
    </div>
  );
}
