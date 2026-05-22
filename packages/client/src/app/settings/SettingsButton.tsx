"use client";
import { useClientApplication } from "@/hooks/create-client-application-context";
import { DialogElementName } from "@/client-application/ui/dialogs";

interface Props {
  extraStyles?: string;
  label?: string;
}

export function SettingsButton({ extraStyles = "", label = "SETTINGS" }: Props) {
  const clientApplication = useClientApplication();
  const { dialogs } = clientApplication.uiStore;

  return (
    <button
      type="button"
      onClick={() => {
        console.log("[SettingsButton] clicked, toggling AppSettings dialog");
        dialogs.toggle(DialogElementName.AppSettings);
      }}
      style={{ position: "relative", zIndex: 100 }}
      className={`border border-slate-400 h-10 cursor-pointer pr-4 pl-4
        flex justify-center items-center pointer-events-auto ${extraStyles}`}
    >
      {label}
    </button>
  );
}
