import React, { memo } from "react";
import { Card } from "@/components/ui/card";

const featuresData = [
  {
    icon: "/img/span (4).png",
    title: "Track Earnings & Spending",
    description:
      "AI analyzes bank transactions and categorizes expenses for easy understanding.",
  },
  {
    icon: "/img/span (5).png",
    title: "Savings Goals Made Simple",
    description: "Set savings goals together.",
  },
  {
    icon: "/img/span (6).png",
    title: "Investing for Future Growth",
    description:
      "Research investment options like stocks and ETFs, building long-term wealth as a family.",
  },
  {
    icon: "/img/span (7).png",
    title: "Cash Back That Counts",
    description:
      "Smart spending leads to 1% cash back* directly reinvested into savings goals.",
  },
  {
    icon: "/img/span (8).png",
    title: "AI Chatbot Assistance",
    description:
      "Ask about monthly spending habits, budgeting tips, or investment insights for instant help.",
  },
];

const Features = memo(() => {
  return (
    <div className="lg:py-12 py-6 px-6 mx-auto max-w-7xl">
      <div className="text-center mb-12">
        <h2 className="lg:text-4xl text-2xl font-extrabold text-gray-900">
          Take Control of Your Finances with Smart Insights
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-5 gap-8">
        {featuresData.map((feature) => (
          <Card
            key={feature.title} // Assuming titles are unique
            className="flex flex-col items-start p-6 rounded-lg bg-white"
          >
            <img
              src={feature.icon}
              alt={feature.title}
              loading="lazy"
              className="w-16 h-16 mb-2 transition-all animate-pulse"
            />
            <div className="des flex flex-col gap-2 items-start justify-center">
              <h3 className="font-semibold text-gray-800">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
});

export default Features;
