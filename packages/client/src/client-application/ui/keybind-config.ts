import { iterateNumericEnumKeyedRecord } from "@speed-dungeon/common";
import cloneDeep from "lodash.clonedeep";
import { makeAutoObservable } from "mobx";

export const HOTKEYS = {
  CANCEL: "Escape",
  MAIN_1: "KeyF",
  MAIN_2: "KeyA",
  ALT_1: "KeyR",
  ALT_2: "KeyQ",
  SIDE_1: "KeyG",
  SIDE_2: "KeyT",
  RIGHT_MAIN: "KeyD",
  LEFT_MAIN: "KeyS",
  RIGHT_ALT: "KeyE",
  LEFT_ALT: "KeyW",
  BOTTOM_LEFT: "KeyX",
  BOTTOM_RIGHT: "KeyC",
  BOTTOM_ALT: "KeyV",
};

export enum HotkeyButtonTypes {
  ToggleInventory,
  ToggleViewEquipment,
  EquipAltSlot,
  DropItem,
  ToggleViewingAbilityTree,
  AllocateAbilityPoint,
  CycleBack,
  CycleForward,
  CycleBackAlternate,
  CycleForwardAlternate,
  Confirm,
  TakeAllItems,
  ViewItemsOnGround,
  ToggleAssignAttributesMenu,
  OpenConfirmConvertToShardMenu,
  CycleTargetingSchemes,
  ToggleHostGameForm,
  RefreshGameList,
  QuickStartRace,
  QuickStartProgression,
  ToggleSavedCharacterManager,
  ExploreNextRoom,
  OperateVendingMachine,
  VoteToStayOnFloor,
  VoteToDescendFloor,
  ToggleCombatLog,
  SelectPreviousWeaponSlot,
  SelectNextWeaponSlot,
  ConfirmLeaveOnPartyWipe,
  SelectMenuItem1,
  SelectMenuItem2,
  SelectMenuItem3,
  SelectMenuItem4,
  SelectMenuItem5,
  SelectMenuItem6,
  SelectMenuItem7,
  SelectMenuItem8,
  SelectMenuItem9,
}

export const MENU_ITEM_HOTKEY_TYPES: HotkeyButtonTypes[] = [
  HotkeyButtonTypes.SelectMenuItem1,
  HotkeyButtonTypes.SelectMenuItem2,
  HotkeyButtonTypes.SelectMenuItem3,
  HotkeyButtonTypes.SelectMenuItem4,
  HotkeyButtonTypes.SelectMenuItem5,
  HotkeyButtonTypes.SelectMenuItem6,
  HotkeyButtonTypes.SelectMenuItem7,
  HotkeyButtonTypes.SelectMenuItem8,
  HotkeyButtonTypes.SelectMenuItem9,
];

export type KeyCode = string;

export const DEFAULT_KEYBINDS: Record<HotkeyButtonTypes, KeyCode[]> = {
  [HotkeyButtonTypes.ToggleInventory]: [HOTKEYS.MAIN_1, "KeyI"],
  [HotkeyButtonTypes.ToggleViewEquipment]: [HOTKEYS.ALT_1],
  [HotkeyButtonTypes.EquipAltSlot]: [HOTKEYS.ALT_1],
  [HotkeyButtonTypes.DropItem]: [HOTKEYS.MAIN_2],
  [HotkeyButtonTypes.ToggleViewingAbilityTree]: [HOTKEYS.BOTTOM_ALT],
  [HotkeyButtonTypes.AllocateAbilityPoint]: [HOTKEYS.MAIN_1],
  [HotkeyButtonTypes.CycleBack]: [HOTKEYS.LEFT_MAIN],
  [HotkeyButtonTypes.CycleForward]: [HOTKEYS.RIGHT_MAIN],
  [HotkeyButtonTypes.Confirm]: [HOTKEYS.MAIN_1],
  [HotkeyButtonTypes.TakeAllItems]: [HOTKEYS.MAIN_2],
  [HotkeyButtonTypes.ViewItemsOnGround]: [HOTKEYS.ALT_1],
  [HotkeyButtonTypes.ToggleAssignAttributesMenu]: [HOTKEYS.MAIN_2],
  [HotkeyButtonTypes.CycleBackAlternate]: [HOTKEYS.LEFT_ALT],
  [HotkeyButtonTypes.CycleForwardAlternate]: [HOTKEYS.RIGHT_ALT],
  [HotkeyButtonTypes.OpenConfirmConvertToShardMenu]: [HOTKEYS.SIDE_2],
  [HotkeyButtonTypes.CycleTargetingSchemes]: [HOTKEYS.MAIN_2],
  [HotkeyButtonTypes.ToggleHostGameForm]: ["KeyA"],
  [HotkeyButtonTypes.RefreshGameList]: ["KeyR"],
  [HotkeyButtonTypes.QuickStartRace]: [HOTKEYS.SIDE_1],
  [HotkeyButtonTypes.QuickStartProgression]: [HOTKEYS.MAIN_1],
  [HotkeyButtonTypes.ToggleSavedCharacterManager]: ["KeyS"],
  [HotkeyButtonTypes.ExploreNextRoom]: [HOTKEYS.SIDE_1],
  [HotkeyButtonTypes.OperateVendingMachine]: [HOTKEYS.SIDE_2],
  [HotkeyButtonTypes.VoteToStayOnFloor]: [HOTKEYS.SIDE_1],
  [HotkeyButtonTypes.VoteToDescendFloor]: [HOTKEYS.SIDE_2],
  [HotkeyButtonTypes.ToggleCombatLog]: ["KeyL"],
  [HotkeyButtonTypes.SelectPreviousWeaponSlot]: [HOTKEYS.BOTTOM_LEFT],
  [HotkeyButtonTypes.SelectNextWeaponSlot]: [HOTKEYS.BOTTOM_RIGHT],
  [HotkeyButtonTypes.ConfirmLeaveOnPartyWipe]: [HOTKEYS.SIDE_1],
  [HotkeyButtonTypes.SelectMenuItem1]: ["Digit1", "Numpad1"],
  [HotkeyButtonTypes.SelectMenuItem2]: ["Digit2", "Numpad2"],
  [HotkeyButtonTypes.SelectMenuItem3]: ["Digit3", "Numpad3"],
  [HotkeyButtonTypes.SelectMenuItem4]: ["Digit4", "Numpad4"],
  [HotkeyButtonTypes.SelectMenuItem5]: ["Digit5", "Numpad5"],
  [HotkeyButtonTypes.SelectMenuItem6]: ["Digit6", "Numpad6"],
  [HotkeyButtonTypes.SelectMenuItem7]: ["Digit7", "Numpad7"],
  [HotkeyButtonTypes.SelectMenuItem8]: ["Digit8", "Numpad8"],
  [HotkeyButtonTypes.SelectMenuItem9]: ["Digit9", "Numpad9"],
};

export const HOTKEY_ACTION_LABELS: Record<HotkeyButtonTypes, string> = {
  [HotkeyButtonTypes.ToggleInventory]: "Toggle Inventory",
  [HotkeyButtonTypes.ToggleViewEquipment]: "View Equipment",
  [HotkeyButtonTypes.EquipAltSlot]: "Equip Alt Slot",
  [HotkeyButtonTypes.DropItem]: "Drop Item",
  [HotkeyButtonTypes.ToggleViewingAbilityTree]: "Ability Tree",
  [HotkeyButtonTypes.AllocateAbilityPoint]: "Allocate Ability Point",
  [HotkeyButtonTypes.CycleBack]: "Cycle Back",
  [HotkeyButtonTypes.CycleForward]: "Cycle Forward",
  [HotkeyButtonTypes.CycleBackAlternate]: "Cycle Back (Alt)",
  [HotkeyButtonTypes.CycleForwardAlternate]: "Cycle Forward (Alt)",
  [HotkeyButtonTypes.Confirm]: "Confirm",
  [HotkeyButtonTypes.TakeAllItems]: "Take All Items",
  [HotkeyButtonTypes.ViewItemsOnGround]: "View Items on Ground",
  [HotkeyButtonTypes.ToggleAssignAttributesMenu]: "Assign Attributes",
  [HotkeyButtonTypes.OpenConfirmConvertToShardMenu]: "Convert to Shards",
  [HotkeyButtonTypes.CycleTargetingSchemes]: "Cycle Targeting",
  [HotkeyButtonTypes.ToggleHostGameForm]: "Toggle Host Game Form",
  [HotkeyButtonTypes.RefreshGameList]: "Refresh Game List",
  [HotkeyButtonTypes.QuickStartRace]: "Quick Start Race",
  [HotkeyButtonTypes.QuickStartProgression]: "Quick Start Progression",
  [HotkeyButtonTypes.ToggleSavedCharacterManager]: "Toggle Character Manager",
  [HotkeyButtonTypes.ExploreNextRoom]: "Explore Next Room",
  [HotkeyButtonTypes.OperateVendingMachine]: "Operate Vending Machine",
  [HotkeyButtonTypes.VoteToStayOnFloor]: "Vote to Stay on Floor",
  [HotkeyButtonTypes.VoteToDescendFloor]: "Vote to Descend",
  [HotkeyButtonTypes.ToggleCombatLog]: "Toggle Combat Log",
  [HotkeyButtonTypes.SelectPreviousWeaponSlot]: "Previous Weapon Slot",
  [HotkeyButtonTypes.SelectNextWeaponSlot]: "Next Weapon Slot",
  [HotkeyButtonTypes.ConfirmLeaveOnPartyWipe]: "Leave Game (on Party Wipe)",
  [HotkeyButtonTypes.SelectMenuItem1]: "Select Menu Item 1",
  [HotkeyButtonTypes.SelectMenuItem2]: "Select Menu Item 2",
  [HotkeyButtonTypes.SelectMenuItem3]: "Select Menu Item 3",
  [HotkeyButtonTypes.SelectMenuItem4]: "Select Menu Item 4",
  [HotkeyButtonTypes.SelectMenuItem5]: "Select Menu Item 5",
  [HotkeyButtonTypes.SelectMenuItem6]: "Select Menu Item 6",
  [HotkeyButtonTypes.SelectMenuItem7]: "Select Menu Item 7",
  [HotkeyButtonTypes.SelectMenuItem8]: "Select Menu Item 8",
  [HotkeyButtonTypes.SelectMenuItem9]: "Select Menu Item 9",
};

export interface ParsedKeybind {
  code: string;
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  meta: boolean;
}

const MODIFIER_TOKENS = ["Ctrl", "Shift", "Alt", "Meta"] as const;
type ModifierToken = (typeof MODIFIER_TOKENS)[number];

export function parseKeybind(keybind: KeyCode): ParsedKeybind {
  const parts = keybind.split("+");
  const code = parts[parts.length - 1] ?? "";
  const mods = new Set(parts.slice(0, -1));
  return {
    code,
    ctrl: mods.has("Ctrl"),
    shift: mods.has("Shift"),
    alt: mods.has("Alt"),
    meta: mods.has("Meta"),
  };
}

export function formatKeybind(parsed: ParsedKeybind): KeyCode {
  const parts: string[] = [];
  if (parsed.ctrl) parts.push("Ctrl");
  if (parsed.shift) parts.push("Shift");
  if (parsed.alt) parts.push("Alt");
  if (parsed.meta) parts.push("Meta");
  parts.push(parsed.code);
  return parts.join("+");
}

export function keybindFromEvent(e: KeyboardEvent): KeyCode {
  return formatKeybind({
    code: e.code,
    ctrl: e.ctrlKey,
    shift: e.shiftKey,
    alt: e.altKey,
    meta: e.metaKey,
  });
}

export function eventMatchesKeybind(e: KeyboardEvent, keybind: KeyCode): boolean {
  const parsed = parseKeybind(keybind);
  return (
    e.code === parsed.code &&
    e.ctrlKey === parsed.ctrl &&
    e.shiftKey === parsed.shift &&
    e.altKey === parsed.alt &&
    e.metaKey === parsed.meta
  );
}

export function letterFromKeyCode(keycode: KeyCode) {
  const parsed = parseKeybind(keycode);
  const modParts: string[] = [];
  if (parsed.ctrl) modParts.push("Ctrl");
  if (parsed.shift) modParts.push("Shift");
  if (parsed.alt) modParts.push("Alt");
  if (parsed.meta) modParts.push("Meta");
  const letter = parsed.code.startsWith("Key") ? parsed.code.slice(3) : parsed.code;
  return [...modParts, letter].join("+");
}

export const VIEW_EQUIPMENT_HOTKEY = HOTKEYS.ALT_1;

export interface ConflictNotice {
  conflictingActions: HotkeyButtonTypes[];
  keycode: KeyCode;
  at: number;
}

export class KeybindConfig {
  private hotkeys = cloneDeep(DEFAULT_KEYBINDS);
  public lastConflictNotice: ConflictNotice | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    this.loadUserPreferences();
  }

  getKeybind(button: HotkeyButtonTypes): KeyCode[] {
    return this.hotkeys[button];
  }

  getMenuItemBinds(itemNumber: number): KeyCode[] {
    const action = MENU_ITEM_HOTKEY_TYPES[itemNumber - 1];
    if (action === undefined) return [];
    return this.hotkeys[action];
  }

  getAllBindings(): Record<HotkeyButtonTypes, KeyCode[]> {
    return this.hotkeys;
  }

  getKeybindString(button: HotkeyButtonTypes) {
    const hotkeys = this.getKeybind(button);
    if (hotkeys.length === 0) return "";
    return hotkeys.map((keycode) => letterFromKeyCode(keycode)).join(", ");
  }

  getActionsBoundTo(keycode: KeyCode, except?: HotkeyButtonTypes): HotkeyButtonTypes[] {
    const matches: HotkeyButtonTypes[] = [];
    for (const [action, keys] of iterateNumericEnumKeyedRecord(this.hotkeys)) {
      if (action === except) continue;
      if (keys.includes(keycode)) matches.push(action);
    }
    return matches;
  }

  addKeybind(button: HotkeyButtonTypes, keycode: KeyCode) {
    const keys = this.hotkeys[button];
    if (!keys.includes(keycode)) {
      this.hotkeys[button] = [...keys, keycode];
      this.persistUserPreferences();
    }
  }

  setKeybind(button: HotkeyButtonTypes, keycode: KeyCode) {
    this.hotkeys[button] = [keycode];

    this.persistUserPreferences();
  }

  setKeybindWithConflictWarning(
    button: HotkeyButtonTypes,
    keycode: KeyCode
  ): { conflictingActions: HotkeyButtonTypes[] } {
    const conflictingActions = this.getActionsBoundTo(keycode, button);
    this.hotkeys[button] = [keycode];
    if (conflictingActions.length > 0) {
      this.lastConflictNotice = { conflictingActions, keycode, at: Date.now() };
    } else {
      this.lastConflictNotice = null;
    }
    this.persistUserPreferences();
    return { conflictingActions };
  }

  removeKeybind(button: HotkeyButtonTypes, keycode: KeyCode) {
    const keys = this.hotkeys[button].filter((k) => k !== keycode);
    this.hotkeys[button] = keys;
    this.persistUserPreferences();
  }

  resetKeybind(button: HotkeyButtonTypes): { conflictingActions: HotkeyButtonTypes[] } {
    const defaults = cloneDeep(DEFAULT_KEYBINDS[button]);
    this.hotkeys[button] = defaults;
    const conflictSet = new Set<HotkeyButtonTypes>();
    let conflictKey: KeyCode = defaults[0] ?? "";
    for (const defaultKey of defaults) {
      const others = this.getActionsBoundTo(defaultKey, button);
      for (const a of others) conflictSet.add(a);
      if (others.length > 0) conflictKey = defaultKey;
    }
    const conflictingActions = Array.from(conflictSet);
    if (conflictingActions.length > 0) {
      this.lastConflictNotice = {
        conflictingActions,
        keycode: conflictKey,
        at: Date.now(),
      };
    } else {
      this.lastConflictNotice = null;
    }
    this.persistUserPreferences();
    return { conflictingActions };
  }

  resetDefaults() {
    const clonedDefaults = cloneDeep(DEFAULT_KEYBINDS);
    for (const [key, value] of iterateNumericEnumKeyedRecord(clonedDefaults)) {
      this.hotkeys[key] = value;
    }
    this.lastConflictNotice = null;
    this.persistUserPreferences();
  }

  clearConflictNotice() {
    this.lastConflictNotice = null;
  }

  persistUserPreferences() {
    this.saveToLocalStorage();
    // later check if logged in and save to account settings
  }

  private saveToLocalStorage() {
    if (typeof window === "undefined") return;
    localStorage.setItem("keybinds", JSON.stringify(this.hotkeys));
  }

  loadUserPreferences() {
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage() {
    if (typeof window === "undefined") return;
    const data = localStorage.getItem("keybinds");
    if (!data) return console.info("no keybinds to load");

    try {
      const loaded = JSON.parse(data) as Record<HotkeyButtonTypes, KeyCode[]>;
      for (const [key, value] of iterateNumericEnumKeyedRecord(loaded)) {
        this.hotkeys[key] = value;
      }
    } catch (e) {
      console.error("failed to parse keybinds", e);
    }
  }
}
