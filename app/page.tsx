import { LandingPage } from "@/components/landing-page";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  console.log("session from landing page", session);

  // Redirect authenticated users to dashboard
  if (session) {
    redirect("/dashboard");
  }

  return <LandingPage />;
}
