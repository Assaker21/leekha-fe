import { GameProvider } from "./contexts/GameContext";
import Init from "./layouts/init";
import Root from "./layouts/root";

export default function App() {
  return (
    <GameProvider>
      <Root />
    </GameProvider>
  );
}
