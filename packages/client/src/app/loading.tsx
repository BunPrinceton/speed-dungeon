"use client";
import React from "react";
import LoadingSpinner from "./components/atoms/LoadingSpinner";

const loadingMessages = [
  "Travelling to a new area",
  "Descending deeper",
  "Approaching destination",
  "Refilling autoinjectors",
  "Collating affixes",
  "Researching loot tables",
];

export default function Loading() {
  const loadingMessage =
    loadingMessages[Math.floor(Math.random() * loadingMessages.length)] ?? "Loading";
  return (
    <main className="h-screen w-screen pt-10 flex flex-col items-center">
      <h1 className="mb-4">{loadingMessage}...</h1>
      <div className="h-10 w-10">
        <LoadingSpinner />
      </div>
    </main>
  );
}
