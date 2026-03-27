"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function page() {
  const router = useRouter();
  return (
    <main className="flex flex-col justify-center items-center h-full">
      <h1 className="text-3xl mb-10">404 - page not found</h1>
      <h3 className="text-xl mb-6">You've wandered alone into an empty room of the dungeon...</h3>
      <button
        className="border border-slate-400 h-10 cursor-pointer pr-4 pl-4 flex justify-center items-center pointer-events-auto"
        onClick={() => {
          router.push("/");
        }}
      >
        RETURN TO YOUR PARTY
      </button>
    </main>
  );
}
