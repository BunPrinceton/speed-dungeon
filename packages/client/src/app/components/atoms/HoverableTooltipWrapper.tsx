import { useClientApplication } from "@/hooks/create-client-application-context";
import { TooltipContent } from "@/client-application/ui/tooltips";
import React, { ReactNode, useEffect, useRef } from "react";

interface Props {
  tooltipText?: string | TooltipContent;
  extraStyles?: string;
  offsetTop?: number;
  children: ReactNode;
}

export default function HoverableTooltipWrapper(props: Props) {
  const clientApplication = useClientApplication();
  const { uiStore } = clientApplication;
  const { tooltips } = uiStore;

  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => tooltips.hideTooltip();
  }, []);

  function handleFocus() {
    if (props.tooltipText) {
      const content: TooltipContent =
        typeof props.tooltipText === "string"
          ? { type: "text", text: props.tooltipText }
          : props.tooltipText;
      tooltips.showTooltip(elementRef.current, content);
    }
  }

  function handleBlur() {
    tooltips.hideTooltip();
  }

  return (
    <div
      className={`h-fit w-fit ${props.extraStyles} p-0`}
      ref={elementRef}
      onMouseEnter={handleFocus}
      onMouseLeave={handleBlur}
      onFocus={handleFocus}
      onBlur={handleBlur}
      tabIndex={0}
    >
      {props.children}
    </div>
  );
}
