import { LayoutDashboard, Upload, FileText, CreditCard, Receipt } from "lucide-react";

export const features = [
  {
    iconName: "ArrowUpCircle",
    iconColor: "text-purple-500",
    title: "Upload Files",
    description:
      "Easily upload your files to our secure cloud storage and access them from anywhere.",
  },
  {
    iconName: "Shield",
    iconColor: "text-green-500",
    title: "Secure Storage",
    description:
      "Your files are encrypted and stored securely in our cloud infrastructure.",
  },
  {
    iconName: "Share2",
    iconColor: "text-purple-500",
    title: "Simple Sharing",
    description:
      "Share files with anyone using secure links that you control.",
  },
  {
    iconName: "CreditCard",
    iconColor: "text-red-500",
    title: "Flexible Credits",
    description:
      "Pay only for what you use with our credit-based system.",
  },
  {
    iconName: "FileText",
    iconColor: "text-red-500",
    title: "File Management",
    description:
      "Organize, preview, and manage your files from any device.",
  },
  {
    iconName: "Clock",
    iconColor: "text-indigo-500",
    title: "Transaction History",
    description:
      "Keep track of all your credit purchases and usage.",
  },
];


export const SLIDE_MENU_DATA = [
  {
    id: "01",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
   {
    id: "02",
    label: "Upload",
    icon: Upload,
    path: "/upload",
  },
  {
    id: "03",
    label: "My Files",
    icon: FileText,
    path: "/my-files",
  },
  {
    id: "04",
    label: "Subscriptions",
    icon: CreditCard, 
    path: "/subscriptions",
  },
  { 
    id: "05",
    label: "Transactions",
    icon: Receipt,
    path: "/transactions",
  },
];
