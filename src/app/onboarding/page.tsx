import type { Metadata } from "next";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";

export const metadata: Metadata = { title: "Make it yours" };

export default function OnboardingPage() {
  return (
    <main id="main-content" className="min-h-screen px-4 py-5 sm:px-6 sm:py-8">
      <OnboardingFlow />
    </main>
  );
}

