import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import cardUtils from "../utils/card";

export default function Card({
  position,
  card,
  className,
  enabled,
  selected,
  onClick,
  flipped,
  fanning,
  size = "md",
  shadow,
}) {
  const cardRef = useRef(null);
  const [shadowOffset, setShadowOffset] = useState({ x: -5, y: 5 });

  useEffect(() => {
    function updateShadow() {
      if (!cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const cardCenterX = rect.left + rect.width / 2;
      const cardCenterY = rect.top + rect.height / 2;

      const screenCenterX = window.innerWidth / 2;
      const screenCenterY = window.innerHeight / 2;

      const deltaX = (cardCenterX - screenCenterX) / screenCenterX;
      const deltaY = (cardCenterY - screenCenterY) / screenCenterY;

      const magnitude = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      const finalX = deltaX / (magnitude || 1);
      const finalY = deltaY / (magnitude || 1);

      const maxOffset = selected ? 50 : 15;

      setShadowOffset({
        x: finalX * maxOffset,
        y: finalY * maxOffset,
      });
    }

    updateShadow();
    window.addEventListener("resize", updateShadow);

    return () => {
      window.removeEventListener("resize", updateShadow);
    };
  }, [selected]);

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      className={clsx(
        "relative flex flex-row items-center justify-center z-0",
        className,
        size === "xs" && "min-w-30 w-30 max-w-30 h-45",
        size === "sm" && "min-w-34 w-34 max-w-34 h-51",
        size === "md" && "min-w-36 w-36 max-w-36 h-54",
        size === "lg" && "min-w-40 w-40 max-w-40 h-60",
      )}
      style={
        fanning
          ? {
              transform: `translate(${0}px, ${-cardUtils.fan(fanning.position) * 3}px) rotate(${cardUtils.fanRotate(fanning.position)}deg)`,
            }
          : null
      }
    >
      {/* Dynamic Shadow Image */}
      {shadow ? (
        <img
          className="w-full h-full absolute z-0 opacity-20 will-change-transform"
          src={"/cards/shadow.png"}
          style={{
            transform: `translate(${shadowOffset.x}px, ${shadowOffset.y}px)`,
            transition: "transform 0.1s ease-in-out",
          }}
        />
      ) : null}

      <img
        className="w-full h-full absolute z-0"
        src={
          flipped
            ? "/cards2/back-red.png"
            : true
              ? `/cards2/${cardUtils.getCard2(card)}`
              : `/cards/${card.replace(".", "")}.png`
        }
      />

      {!enabled && !flipped ? (
        <img
          className="w-full h-full opacity-20 absolute top-0 left-0 z-0"
          src={"/cards/shadow.png"}
        />
      ) : null}
    </div>
  );
}
