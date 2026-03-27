import React from "react";
import { UserAuthStatus, UserChannelDisplayData } from "@speed-dungeon/common";
import { SPACING_REM_SMALL } from "@/client-consts";
import HoverableTooltipWrapper from "@/app/components/atoms/HoverableTooltipWrapper";
import StarShape from "../../../../public/img/basic-shapes/star.svg";
import { observer } from "mobx-react-lite";
import { useClientApplication } from "@/hooks/create-client-application-context";

interface Props {
  username: string;
  displayData: UserChannelDisplayData;
}

function getPingColor(pingMs: number): string {
  if (pingMs < 80) return "text-green-600";
  if (pingMs < 150) return "text-yellow-400";
  return "text-red-400";
}

export const UserPlaque = observer(({ username, displayData }: Props) => {
  const clientApplication = useClientApplication();
  const thisTabUsername = clientApplication.session.usernameOption;
  const pingMs = clientApplication.uiStore.connectionStatus.pingMs;
  const bgStyle = displayData.authStatus === UserAuthStatus.Guest ? "bg-slate-700" : "bg-slate-950";
  const isCurrentUser = thisTabUsername === username;

  let thisIsYouMarker = <span />;
  if (isCurrentUser) {
    thisIsYouMarker = (
      <HoverableTooltipWrapper tooltipText="This is you">
        <div className="mr-2 h-4 w-4">
          <StarShape className="fill-slate-400 h-full w-full" />
        </div>
      </HoverableTooltipWrapper>
    );
  }

  return (
    <li
      className={`h-10 ${bgStyle} border border-slate-400 flex items-center mb-2 pl-2 pointer-events-auto`}
      style={{
        marginRight: `${SPACING_REM_SMALL}rem`,
      }}
    >
      {thisIsYouMarker}
      <div className="overflow-hidden whitespace-nowrap text-ellipsis flex-1">{username}</div>
      {isCurrentUser && pingMs !== null && (
        <div className={`mr-2 text-xs font-mono ${getPingColor(pingMs)}`}>
          {pingMs}ms
        </div>
      )}
    </li>
  );
});
