import { useEffect, useState } from "react";
import { Play } from "@/components/daniel/play";
import { Title } from "@/components/daniel/title";
import { useGame } from "@/game/store";

export function Game() {
  const started = useGame((s) => s.career.started);
  const hydrate = useGame((s) => s.hydrate);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydrate();
    setReady(true);
  }, [hydrate]);

  if (ready && started) {
    return (
      <div className="app-stage">
        <div className="app-device">
          <Play />
        </div>
      </div>
    );
  }
  return (
    <div className="app-stage">
      <div className="app-device">
        <Title ready={ready} />
      </div>
    </div>
  );
}
