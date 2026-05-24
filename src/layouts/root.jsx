import Card from "../components/Card";
import { useGame } from "../contexts/GameContext";

export default function Root({ children }) {
  const game = useGame();

  return (
    <div className="bg-gray-100 flex items-center justify-center w-screen h-screen relative">
      {game.getPlayerHand(0).map((card) => {
        return (
          <Card
            onClick={() => {
              if (game.state == "pass") {
                game.playPassCard(0, card);
              } else {
                game.playCard(0, card);
              }
            }}
            className={"-ml-30 hover:mb-30 transition-all"}
            card={card}
          />
        );
      })}
    </div>
  );
}
