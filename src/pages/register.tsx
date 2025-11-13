// src/pages/register.tsx
import { RegisterHero } from "../components/auth/RegisterHero";
import { RegisterForm } from "../components/auth/RegisterForm";
import bgRegister from "../assets/MainBack.jpg";

export default function RegisterPage() {
  return (
    <div className="relative min-h-screen w-full">
      <RegisterHero imageSrc={bgRegister} />
      <RegisterForm />
    </div>
  );
}
