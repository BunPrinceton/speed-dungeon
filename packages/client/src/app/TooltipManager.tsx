import React, { useRef } from "react";
import { ZIndexLayers } from "./z-index-layers";
import { observer } from "mobx-react-lite";
import { useClientApplication } from "@/hooks/create-client-application-context";
import { TooltipContent } from "@/client-application/ui/tooltips";
import { CONDITION_INDICATOR_ICONS } from "@/app/icons";
import { COMBATANT_CONDITION_NAME_STRINGS } from "@speed-dungeon/common";

function TooltipRenderer({ content }: { content: TooltipContent }) {
  switch (content.type) {
    case "text":
      return <>{content.text}</>;
    case "condition":
      return (
        <div className="flex items-center">
          <div className="h-10 mr-2 p-1 border border-slate-400 bg-slate-700">
            {CONDITION_INDICATOR_ICONS[content.conditionName]}
          </div>
          <div>
            {COMBATANT_CONDITION_NAME_STRINGS[content.conditionName]}: {content.description}
            {content.debugText}
          </div>
        </div>
      );
  }
}

export const TooltipManager = observer(() => {
  const { content, position } = useClientApplication().uiStore.tooltips.get();
  const tooltipRef = useRef<HTMLDivElement>(null);

  if (position === null || content === null) return <></>;
  const { x, y } = position;

  return (
    <div
      className={`absolute`}
      style={{ top: `${y}px`, left: `${x}px`, zIndex: ZIndexLayers.Tooltip }}
      ref={tooltipRef}
    >
      <div
        id="hoverable-tooltip"
        className="border border-slate-400 bg-slate-950 text-zinc-300 p-2 -translate-x-1/2 -translate-y-[100%] max-w-96"
      >
        <TooltipRenderer content={content} />
      </div>
    </div>
  );
});
