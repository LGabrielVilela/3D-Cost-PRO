import {
  Calculator,
  FileText,
  LayoutDashboard,
  Package,
  Printer,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Exibido nos 4 atalhos principais da barra inferior no mobile. */
  primaryMobile?: boolean;
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    primaryMobile: true,
    description: "Visão geral do seu negócio",
  },
  {
    label: "Calculadora",
    href: "/calculadora",
    icon: Calculator,
    primaryMobile: true,
    description: "Calcule custos e preços de impressão",
  },
  {
    label: "Orçamentos",
    href: "/orcamentos",
    icon: FileText,
    primaryMobile: true,
    description: "Gerencie e envie orçamentos",
  },
  {
    label: "Clientes",
    href: "/clientes",
    icon: Users,
    primaryMobile: true,
    description: "Cadastro de clientes",
  },
  {
    label: "Materiais",
    href: "/materiais",
    icon: Package,
    description: "Cadastro de filamentos e materiais",
  },
  {
    label: "Impressoras",
    href: "/impressoras",
    icon: Printer,
    description: "Cadastro de impressoras",
  },
  {
    label: "Configurações",
    href: "/configuracoes",
    icon: Settings,
    description: "Empresa, precificação e orçamento",
  },
];
