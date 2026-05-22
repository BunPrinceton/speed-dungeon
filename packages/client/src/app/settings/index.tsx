"use client";
import { HTTP_REQUEST_NAMES, SPACING_REM_SMALL } from "@/client-consts";
import React, { useEffect, useState } from "react";
import { HotkeyButton } from "../components/atoms/HotkeyButton";
import XShape from "../../../public/img/basic-shapes/x-shape.svg";
import { PasswordResetEmailForm } from "../lobby/auth-forms/password-reset-email-form";
import Divider from "../components/atoms/Divider";
import { DeleteAccountForm } from "../lobby/auth-forms/delete-account-form";
import { ChangeUsernameForm } from "../lobby/auth-forms/change-username-form";
import { ZIndexLayers } from "../z-index-layers";
import { observer } from "mobx-react-lite";
import { useClientApplication } from "@/hooks/create-client-application-context";
import { DialogElementName } from "@/client-application/ui/dialogs";
import { KeybindsTab } from "./keybinds";

type SettingsTab = "account" | "keybinds";

export const Settings = observer(() => {
  const clientApplication = useClientApplication();
  const { session } = clientApplication;
  const { dialogs, httpRequests } = clientApplication.uiStore;
  const settingsIsOpen = dialogs.isOpen(DialogElementName.AppSettings);
  const { usernameOption } = session;
  const [activeTab, setActiveTab] = useState<SettingsTab>("keybinds");

  useEffect(() => {
    httpRequests.clearRequestTracker(HTTP_REQUEST_NAMES.DELETE_ACCOUNT);
    httpRequests.clearRequestTracker(HTTP_REQUEST_NAMES.CHANGE_USERNAME);
    httpRequests.clearRequestTracker(HTTP_REQUEST_NAMES.PASSWORD_RESET_EMAIL);
  }, [settingsIsOpen, httpRequests]);

  if (!settingsIsOpen) return <></>;

  return (
    <section
      aria-label="settings menu"
      className={`fixed inset-0 bg-slate-700 pointer-events-auto`}
      style={{ zIndex: 9999 }}
    >
      <div
        className="h-10 w-full border-b border-slate-400 flex items-center justify-between"
        style={{ paddingLeft: `${SPACING_REM_SMALL}rem` }}
      >
        <h2 className="text-lg">Settings</h2>
        <HotkeyButton
          className="p-2 h-full w-fit border cursor-pointer"
          hotkeys={["Escape"]}
          ariaLabel="close settings window"
          onClick={() => {
            dialogs.setIsOpen(DialogElementName.AppSettings, false);
            delete httpRequests.requests[HTTP_REQUEST_NAMES.PASSWORD_RESET_EMAIL];
          }}
        >
          <XShape className="h-full w-full fill-slate-400" />
        </HotkeyButton>
      </div>

      <div className="flex h-[calc(100%-2.5rem)]">
        <nav
          aria-label="settings tabs"
          className="w-40 border-r border-slate-400 flex flex-col bg-slate-800"
        >
          <SettingsTabButton
            label="Keybinds"
            isActive={activeTab === "keybinds"}
            onClick={() => setActiveTab("keybinds")}
          />
          <SettingsTabButton
            label="Account"
            isActive={activeTab === "account"}
            onClick={() => setActiveTab("account")}
          />
        </nav>

        <div
          className="flex-1 overflow-auto"
          style={{ padding: `${SPACING_REM_SMALL}rem` }}
        >
          {activeTab === "account" ? (
            usernameOption ? (
              <AccountPanel username={usernameOption} />
            ) : (
              <div className="text-slate-300">Log in to manage your account.</div>
            )
          ) : (
            <KeybindsTab />
          )}
        </div>
      </div>
    </section>
  );
});

function SettingsTabButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left p-3 border-b border-slate-400 hover:bg-slate-950 ${
        isActive ? "bg-slate-950 border-l-4 border-l-slate-200" : ""
      }`}
      aria-current={isActive ? "page" : undefined}
    >
      {label}
    </button>
  );
}

function AccountPanel({ username }: { username: string }) {
  return (
    <div className="flex flex-col">
      <h3 className="self-end">
        Logged in as <span className="italic">{username}</span>
      </h3>
      <Divider />
      <div style={{ width: `450px` }}>
        <PasswordResetEmailForm />
        <Divider />
      </div>
      <div style={{ width: `450px` }}>
        <DeleteAccountForm />
        <Divider />
      </div>
      <div style={{ width: `450px` }}>
        <ChangeUsernameForm />
      </div>
    </div>
  );
}
