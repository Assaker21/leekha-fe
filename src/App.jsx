import { GameProvider } from "./contexts/GameContext";
import Root from "./layouts/root";

export default function App() {
  return (
    <GameProvider>
      <Root />
    </GameProvider>
  );
}
