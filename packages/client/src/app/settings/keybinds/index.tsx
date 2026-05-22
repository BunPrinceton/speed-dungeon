"use client";
import { useClientApplication } from "@/hooks/create-client-application-context";
import {
  HotkeyButtonTypes,
  HOTKEY_ACTION_LABELS,
  keybindFromEvent,
  letterFromKeyCode,
} from "@/client-application/ui/keybind-config";
import { iterateNumericEnumKeyedRecord } from "@speed-dungeon/common";
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import ButtonBasic from "@/app/components/atoms/ButtonBasic";

const HIGHLIGHT_DURATION_MS = 1800;

export const KeybindsTab = observer(() => {
  const clientApplication = useClientApplication();
  const { keybinds, inputs } = clientApplication.uiStore;
  const [capturingFor, setCapturingFor] = useState<HotkeyButtonTypes | null>(null);
  const [confirmingResetAll, setConfirmingResetAll] = useState(false);
  const [highlightedRow, setHighlightedRow] = useState<HotkeyButtonTypes | null>(null);

  useEffect(() => {
    if (capturingFor === null) return;
    inputs.setHotkeysDisabled(true);

    const handler = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.code === "Escape") {
        setCapturingFor(null);
        return;
      }

      const modifierOnlyCodes = new Set([
        "ShiftLeft",
        "ShiftRight",
        "ControlLeft",
        "ControlRight",
        "AltLeft",
        "AltRight",
        "MetaLeft",
        "MetaRight",
      ]);
      if (modifierOnlyCodes.has(e.code)) return;

      const newBind = keybindFromEvent(e);
      const result = keybinds.setKeybindWithConflictWarning(capturingFor, newBind);
      for (const action of result.conflictingActions) flashRow(action);
      setCapturingFor(null);
    };

    window.addEventListener("keydown", handler, { capture: true });
    return () => {
      window.removeEventListener("keydown", handler, { capture: true });
      inputs.setHotkeysDisabled(false);
    };
  }, [capturingFor, inputs, keybinds]);

  function flashRow(action: HotkeyButtonTypes) {
    setHighlightedRow(action);
    setTimeout(() => {
      setHighlightedRow((prev) => (prev === action ? null : prev));
    }, HIGHLIGHT_DURATION_MS);
  }

  function handleResetRow(action: HotkeyButtonTypes) {
    const result = keybinds.resetKeybind(action);
    for (const a of result.conflictingActions) flashRow(a);
  }

  const notice = keybinds.lastConflictNotice;

  return (
    <div className="flex flex-col" style={{ width: "560px" }}>
      {notice && (
        <div
          className="border border-yellow-500 bg-yellow-900/40 text-yellow-100 p-2 mb-2 flex justify-between items-center"
          role="status"
        >
          <span>
            Heads up: <span className="font-bold">{letterFromKeyCode(notice.keycode)}</span> is
            also bound to{" "}
            <span className="italic">
              {notice.conflictingActions
                .map((a) => HOTKEY_ACTION_LABELS[a])
                .join(", ")}
            </span>
            . Both will fire when you press it.
          </span>
          <button
            type="button"
            className="ml-2 px-2 border border-yellow-500 hover:bg-yellow-800"
            onClick={() => keybinds.clearConflictNotice()}
            aria-label="dismiss notice"
          >
            ×
          </button>
        </div>
      )}

      <p className="text-sm text-slate-300 mb-2">
        Click <span className="italic">Edit</span> on any row, then press a key (with optional
        Shift / Ctrl / Alt / Meta). Press <span className="italic">Escape</span> to cancel.
        Browser-reserved shortcuts (Ctrl+T, Cmd+W, F5, etc.) cannot be captured.
      </p>

      <div className="border border-slate-400">
        <div className="grid grid-cols-[1fr_1fr_auto_auto] items-center bg-slate-800 border-b border-slate-400 text-sm">
          <div className="p-2">Action</div>
          <div className="p-2">Key</div>
          <div className="p-2" />
          <div className="p-2" />
        </div>
        {iterateNumericEnumKeyedRecord(HOTKEY_ACTION_LABELS).map(([action, label]) => {
          const isCapturing = capturingFor === action;
          const isHighlighted = highlightedRow === action;
          const bindString = keybinds.getKeybindString(action) || "(unbound)";
          return (
            <div
              key={action}
              className={`grid grid-cols-[1fr_1fr_auto_auto] items-center border-b border-slate-400 last:border-b-0 transition-colors duration-700 ${
                isHighlighted ? "bg-yellow-900/60" : ""
              }`}
            >
              <div className="p-2">{label}</div>
              <div className="p-2 font-mono">
                {isCapturing ? (
                  <span className="italic text-slate-300">Press a key…</span>
                ) : (
                  bindString
                )}
              </div>
              <div className="p-1">
                {isCapturing ? (
                  <button
                    type="button"
                    className="border border-slate-400 px-2 py-1 hover:bg-slate-950"
                    onClick={() => setCapturingFor(null)}
                  >
                    Cancel
                  </button>
                ) : (
                  <button
                    type="button"
                    className="border border-slate-400 px-2 py-1 hover:bg-slate-950"
                    onClick={() => {
                      keybinds.clearConflictNotice();
                      setCapturingFor(action);
                    }}
                  >
                    Edit
                  </button>
                )}
              </div>
              <div className="p-1 pr-2">
                <button
                  type="button"
                  className="border border-slate-400 px-2 py-1 hover:bg-slate-950"
                  onClick={() => handleResetRow(action)}
                  disabled={isCapturing}
                >
                  Reset
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-end">
        {confirmingResetAll ? (
          <div className="flex items-center">
            <span className="mr-2 text-sm">Reset all keybinds to defaults?</span>
            <ButtonBasic
              extraStyles="mr-2 bg-slate-700"
              onClick={() => setConfirmingResetAll(false)}
            >
              Cancel
            </ButtonBasic>
            <ButtonBasic
              onClick={() => {
                keybinds.resetDefaults();
                setConfirmingResetAll(false);
              }}
            >
              Confirm
            </ButtonBasic>
          </div>
        ) : (
          <ButtonBasic onClick={() => setConfirmingResetAll(true)}>Reset All</ButtonBasic>
        )}
      </div>
    </div>
  );
});
