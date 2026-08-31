import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mis Arroces",
  description: "Calculadora de proporciones y capa para la paella perfecta.",
};

export default function CalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
