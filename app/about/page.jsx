// "use client";
import React from "react";

export const generateMetadata = () => {
  return {
    title: "About | FYNSERA",
    description:
      "View and manage your AI-powered financial dashboard in FYNSERA.",
    openGraph: {
      title: "About | FYNSERA",
      description: "AI-powered financial tools at your fingertips.",
      url: "https://fynsera.netlify.app/about",
      images: [
        {
          url: "https://fynsera.netlify.app/og-about.jpg",
          width: 1200,
          height: 630,
          alt: "FYNSERA About",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "About | FYNSERA",
      description: "Your personal finance dashboard powered by AI.",
      images: ["https://fynsera.netlify.app/og-about.jpg"],
    },
  };
};

export default function About() {
  return (
    <>
      <script type="application/ld+json">
        {`
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "FYNSERA",
  "url": "https://fynsera.netlify.app",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "All",
  "description": "FYNSERA is an AI-powered finance assistant that helps you manage budgets, track expenses, and reach your financial goals.",
  "browserRequirements": "Requires JavaScript. Works on modern browsers.",
  "inLanguage": "en",
  "creator": {
    "@type": "Organization",
    "name": "FYNSERA",
    "url": "https://fynsera.netlify.app"
  }
}
`}
      </script>

      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <header className="bg-gradient-to-r from-blue-500 to-indigo-600 py-12 text-center">
          <div className="container mx-auto px-6">
            <h1 className="text-4xl font-bold text-white">
              AI-Powered Personal Finance Assistant
            </h1>
            <p className="mt-4 text-xl text-gray-100">
              Revolutionizing your financial future with AI-driven insights
            </p>
          </div>
        </header>

        {/* About Section */}
        <main className="container mx-auto px-6 py-12">
          <section className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              About the Project
            </h2>
            <p className="text-gray-700 text-lg max-w-3xl mx-auto">
              Our AI-Powered Personal Finance Assistant helps you take control
              of your finances. By integrating with your bank, we provide
              personalized insights into your spending, budgeting, and savings
              strategies.
            </p>
          </section>

          {/* Key Features Section */}
          <section>
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
              Key Features
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Transaction Categorization",
                  description:
                    "AI categorizes your spending across groceries, bills, entertainment, and more.",
                },
                {
                  title: "Budget Recommendations",
                  description:
                    "Receive personalized suggestions to optimize your spending and save more.",
                },
                {
                  title: "Goal Tracking",
                  description:
                    "Set and track financial goals effortlessly to stay on track.",
                },
                {
                  title: "AI Chatbot",
                  description:
                    "Ask questions like ‘How much did I spend on food?’ and get real-time insights.",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="p-6 bg-white rounded-lg shadow text-center"
                >
                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
