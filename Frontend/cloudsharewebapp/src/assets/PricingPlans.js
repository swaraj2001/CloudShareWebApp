export const pricingPlans = [
  {
    name: "Free",
    description: "Perfect for getting started",
    price: 0,
    currency: "₹",
    period: "forever",
    buttonText: "Get Started",
    popular: false,

    features: [
      "5 file uploads",
      "Basic file sharing",
      "7-day file retention",
      "Email support",
    ],
  },

  {
    name: "Premium",
    description: "For individuals with larger needs",
    price: 50,
    currency: "₹",
    period: "per month",
    buttonText: "Go Premium",
    popular: true,

    features: [
      "50 file uploads",
      "Advanced file sharing",
      "30-day file retention",
      "Priority email support",
      "File analytics",
    ],
  },

  {
    name: "Ultimate",
    description: "For teams and businesses",
    price: 250,
    currency: "₹",
    period: "per month",
    buttonText: "Go Ultimate",
    popular: false,

    features: [
      "250 file uploads",
      "Team sharing capabilities",
      "Unlimited file retention",
      "24/7 priority support",
      "Advanced analytics",
      "API access",
    ],
  },
];

