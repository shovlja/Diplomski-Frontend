import * as React from "react";
import { RegisterHero } from "@/components/auth/RegisterHero";
import { LoginForm } from "@/components/auth/LoginForm";
import bgRegister from "@/assets/MainBack.jpg";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen w-full">
      <RegisterHero imageSrc={bgRegister} />
      <LoginForm />
    </div>
  );
}
