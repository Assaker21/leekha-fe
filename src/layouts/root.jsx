import Card from "../components/Card";
import { useGame } from "../contexts/GameContext";
import clsx from "clsx";

function PlayerHand({ game, id, position, flipped }) {
  const cards = game.getPlayerHand(id);
  const isHorizontal = position === "bottom" || position === "top";

  let containerClass = "absolute flex z-10 ";
  if (position === "bottom")
    containerClass += "flex-row bottom-4 left-1/2 -translate-x-1/2 pb-10";
  if (position === "top")
    containerClass += "flex-row top-4 left-1/2 -translate-x-1/2 pt-10";
  if (position === "left")
    containerClass += "flex-col left-4 top-1/2 -translate-y-1/2 pl-10";
  if (position === "right")
    containerClass += "flex-col right-4 top-1/2 -translate-y-1/2 pr-10";

  const passCards = game.getPassingCards(id);
  const passesSent = game.round?.passes?.[id]?.unsent === false;
  const canSend = passCards.length === 3 && !passesSent;

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
                "px-4 py-2 rounded font-bold shadow-md whitespace-nowrap",
                canSend
                  ? "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                  : "bg-gray-300 text-gray-500",
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
      {game.state === "play" && game.isPlayerTurn(id) && (
        <div
          className={clsx(
            "absolute pointer-events-none rounded-full shadow-[0_0_20px_rgba(72,187,120,0.8)] border-4 border-green-500",
            position === "bottom" && "-inset-6",
            position === "top" && "-inset-6",
            position === "left" && "-inset-6",
            position === "right" && "-inset-6",
          )}
        />
      )}

      {cards.map((card, idx) => {
        let selected = false;
        let enabled = false;

        if (game.state === "pass") {
          selected = passCards.includes(card.replace(".", ""));
          enabled = !passesSent; // not already sent
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

        // Shift selected cards
        let transformClass = "";
        if (selected) {
          if (position === "bottom") transformClass = "";
          if (position === "top") transformClass = "";
          if (position === "left") transformClass = "";
          if (position === "right") transformClass = "";
        }

        return (
          <div
            key={card + idx}
            className={clsx(
              overlapClass,
              "transition-transform",
              transformClass,
              !enabled && "opacity-60",
              position == "top" && "-translate-y-40",
              position == "left" && "-translate-x-40",
              position == "right" && "translate-x-40",
            )}
          >
            <Card
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
                  if (enabled) {
                    game.playCard(id, card);
                  }
                }
              }}
              enabled={true}
              selected={false} // handled by wrapper above
              className={clsx(
                "hover:scale-105 transition-all text-sm", // hover scale
                enabled ? "cursor-pointer" : "pointer-events-none",
                position === "left" && "rotate-90",
                position === "right" && "-rotate-90",
              )}
              card={card.replace(".", "")} // Pass cleaned card without dot
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
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border-8 shadow-2xl flex items-center justify-center">
      <div className="relative w-full h-full">
        {/* Render cards based on trick object */}
        {trick && trick["0"] && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
            <Card card={trick["0"]} className="shadow-lg transform scale-75" />
          </div>
        )}
        {trick && trick["1"] && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
            <Card
              card={trick["1"]}
              className="shadow-lg transform scale-75 rotate-90"
            />
          </div>
        )}
        {trick && trick["2"] && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
            <Card
              card={trick["2"]}
              className="shadow-lg transform scale-75 rotate-180"
            />
          </div>
        )}
        {trick && trick["3"] && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
            <Card
              card={trick["3"]}
              className="shadow-lg transform scale-75 -rotate-90"
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
    <div className="bg-gray-900 flex items-center justify-center w-screen h-screen relative overflow-hidden font-sans">
      <GameTable game={game} />

      <PlayerHand game={game} id={0} position="bottom" />
      <PlayerHand game={game} id={1} position="left" flipped />
      <PlayerHand game={game} id={2} position="top" flipped />
      <PlayerHand game={game} id={3} position="right" flipped />
    </div>
  );
}
