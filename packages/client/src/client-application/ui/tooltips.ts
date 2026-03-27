import { CombatantConditionName, Point } from "@speed-dungeon/common";
import { makeAutoObservable } from "mobx";

export type TooltipContent =
  | { type: "text"; text: string }
  | {
      type: "condition";
      conditionName: CombatantConditionName;
      description: string;
      debugText?: string;
    };

export class TooltipStore {
  private position: null | Point = null;
  private content: null | TooltipContent = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get() {
    return { content: this.content, position: this.position };
  }

  private set(content: TooltipContent, position: Point) {
    this.position = position;
    this.content = content;
  }

  private moveTo(position: Point) {
    this.position = position;
  }

  private clear() {
    this.position = null;
    this.content = null;
  }

  showTooltip(
    elementOption: null | HTMLDivElement,
    content: TooltipContent,
    offsetTop: number = 4
  ) {
    if (!elementOption) return;
    const { x, y, width, height } = elementOption.getBoundingClientRect();
    let tooltipX = x + width / 2.0;
    let tooltipY = -9999; // send it off screen for measuring before showing it

    this.set(content, { x: tooltipX, y: tooltipY });

    // measure tooltip after render
    requestAnimationFrame(() => {
      const tooltipElement = document.getElementById("hoverable-tooltip");
      if (!tooltipElement) return console.info("no tooltip found");

      const tooltipRect = tooltipElement.getBoundingClientRect();

      if (y - tooltipRect.height - offsetTop < 0) {
        tooltipY = Math.max(tooltipY, y + height + offsetTop + tooltipRect.height);
      } else {
        tooltipY = y - offsetTop;
      }

      if (tooltipRect.x < 0 || x + tooltipRect.x < 0) {
        tooltipX = x + tooltipRect.width / 2;
      } else if (tooltipRect.x + tooltipRect.width + 5 > window.innerWidth) {
        tooltipX = x - tooltipRect.width / 2 - 10;
      }

      this.moveTo({ x: tooltipX, y: tooltipY });
    });
  }

  hideTooltip() {
    this.clear();
  }
}
