import type { Metadata } from "next";
import DoctorQuestions from "@/components/DoctorQuestions";
import { siteName } from "@/config";

export const metadata: Metadata = {
  title: `Doctor Questions | ${siteName}`,
  description: "Build a list of questions to take to your next appointment. It stays on your device.",
};

export default function QuestionsPage() {
  return (
    <main className="min-h-screen">
      <DoctorQuestions />
    </main>
  );
}
