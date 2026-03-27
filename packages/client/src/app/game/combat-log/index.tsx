import Divider from "@/app/components/atoms/Divider";
import React from "react";
import { useState } from "react";
import { HotkeyButton } from "@/app/components/atoms/HotkeyButton";
import { observer } from "mobx-react-lite";
import { useClientApplication } from "@/hooks/create-client-application-context";
import {
  GAME_LOG_MESSAGE_STYLE_STRINGS,
  GameLogMessage,
  GameLogMessageContent,
} from "@/client-application/event-log/game-log-messages";
import { ItemLink } from "@/client-application/event-log/item-link";
import { DetailableEntityFocus } from "@/client-application/detailables/detailable-entity-focus";
import { CRAFTING_ACTION_PAST_TENSE_STRINGS, CraftingAction } from "@speed-dungeon/common";

export const GameLog = observer(() => {
  const [expanded, setExpanded] = useState(false);
  const clientApplication = useClientApplication();
  const { eventLogStore, detailableEntityFocus } = clientApplication;
  const gameLogMessages = eventLogStore.getMessages();

  const expandedStyle = expanded
    ? "absolute bg-slate-700 p-2 top-0 right-0 h-screen w-screen"
    : "h-full";

  const expandButtonText = expanded ? "Restore (L)" : "Maximize (L)";

  return (
    <div className={`flex flex-col pointer-events-auto ${expandedStyle}`}>
      <div className="flex justify-between">
        <h3 className="flex-grow-0 flex-shrink">Message Log</h3>
        <HotkeyButton
          onClick={() => {
            setExpanded(!expanded);
          }}
          hotkeys={["KeyL"]}
        >
          {expandButtonText}
        </HotkeyButton>
      </div>
      <Divider />
      <div className="list-none overflow-y-auto flex flex-col-reverse flex-1 pb-[4px]">
        <ul>
          {gameLogMessages.map((message, i) => (
            <GameLogMessageElement
              key={message.timestamp + i}
              message={message}
              detailablesFocus={detailableEntityFocus}
            />
          ))}
        </ul>
      </div>
    </div>
  );
});

function GameLogMessageElement({
  message,
  detailablesFocus,
}: {
  message: GameLogMessage;
  detailablesFocus: DetailableEntityFocus;
}) {
  const color = GAME_LOG_MESSAGE_STYLE_STRINGS[message.style];

  return (
    <li className={color}>
      <GameLogContentRenderer content={message.content} detailablesFocus={detailablesFocus} />
    </li>
  );
}

function GameLogContentRenderer({
  content,
  detailablesFocus,
}: {
  content: GameLogMessageContent;
  detailablesFocus: DetailableEntityFocus;
}) {
  switch (content.type) {
    case "text":
      return <>{content.text}</>;
    case "itemLink":
      return (
        <div>
          {content.posterName} calls attention to{" "}
          <ItemLink item={content.item} detailablesFocus={detailablesFocus} />
        </div>
      );
    case "craftResult": {
      let resultSuffix = null;
      if (content.itemAfter) {
        const verb =
          content.craftingAction === CraftingAction.Reform ||
          content.craftingAction === CraftingAction.Shake
            ? "resulting in"
            : "and created";
        resultSuffix = (
          <span>
            {" "}
            {verb} <ItemLink item={content.itemAfter} detailablesFocus={detailablesFocus} />
          </span>
        );
      }
      return (
        <div>
          {content.crafterName} {CRAFTING_ACTION_PAST_TENSE_STRINGS[content.craftingAction]}{" "}
          <ItemLink item={content.itemBefore} detailablesFocus={detailablesFocus} />
          {resultSuffix}
        </div>
      );
    }
  }
}
