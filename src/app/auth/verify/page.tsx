"use client";

import { VerifyForm } from "@/components/verify-form";

export default function VerifyPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <VerifyForm />
      </div>
    </div>
  );
}
