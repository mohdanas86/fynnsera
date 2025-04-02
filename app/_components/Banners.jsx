import React, { memo } from "react";

const Banners = memo(() => {
  return (
    <div className="mx-auto max-w-7xl grid grid-cols-1 gap-6">
      {/* Section 1: image left, text right on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12 px-8">
        <div className="flex items-center justify-center">
          <img
            src="/img/span (3).png"
            loading="lazy"
            className="w-[90%] max-w-[400px] drop-shadow-lg"
            alt="Financial Insights"
          />
        </div>
        <div className="flex flex-col gap-6 items-start text-left">
          <h2 className="text-2xl font-extrabold leading-tight text-gray-900">
            Smart Transaction Categorization
          </h2>
          <p className="text-gray-700 text-lg font-medium">
            AI intelligently classifies your expenses (e.g., groceries,
            entertainment, bills) for a clearer financial overview.
          </p>
        </div>
      </div>

      {/* Section 2: reverse on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12 px-8">
        {/* Image becomes second on md */}
        <div className="flex items-center justify-center md:order-2">
          <img
            src="/img/span (2).png"
            loading="lazy"
            className="w-[90%] max-w-[400px] drop-shadow-lg"
            alt="Financial Insights"
          />
        </div>
        {/* Text becomes first on md */}
        <div className="flex flex-col gap-6 items-start text-left md:order-1">
          <h2 className="text-2xl font-extrabold leading-tight text-gray-900">
            Achieve Financial Independence
          </h2>
          <p className="text-gray-700 text-lg font-medium">
            Gain control over your finances with AI-driven insights tailored to
            your spending habits.
          </p>
        </div>
      </div>

      {/* Section 3: image left, text right on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12 px-8">
        <div className="flex items-center justify-center">
          <img
            src="/img/span (1).png"
            loading="lazy"
            className="w-[90%] max-w-[400px] drop-shadow-lg"
            alt="Financial Insights"
          />
        </div>
        <div className="flex flex-col gap-6 items-start text-left">
          <h2 className="text-2xl font-extrabold leading-tight text-gray-900">
            Accelerate Your Savings Goals
          </h2>
          <p className="text-gray-700 text-lg font-medium">
            Get personalized strategies to save smarter and reach your financial
            targets faster.
          </p>
        </div>
      </div>

      {/* Section 4: reverse on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12 px-8">
        {/* Image becomes second on md */}
        <div className="flex items-center justify-center md:order-2">
          <img
            src="/img/span.png"
            loading="lazy"
            className="w-[90%] max-w-[400px] drop-shadow-lg"
            alt="Financial Insights"
          />
        </div>
        {/* Text becomes first on md */}
        <div className="flex flex-col gap-6 items-start text-left md:order-1">
          <h2 className="text-2xl font-extrabold leading-tight text-gray-900">
            Trade Smarter with AI
          </h2>
          <p className="text-gray-700 text-lg font-medium">
            Analyze your trading patterns through automated insights based on
            your trade logs.
          </p>
        </div>
      </div>

      {/* Section 5: image left, text right on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12 px-8">
        <div className="flex items-center justify-center">
          <img
            src="/img/group.png"
            loading="lazy"
            className="w-[90%] max-w-[400px] drop-shadow-lg"
            alt="Financial Insights"
          />
        </div>
        <div className="flex flex-col gap-6 items-start text-left">
          <h2 className="text-2xl font-extrabold leading-tight text-gray-900">
            Invest in the Future
          </h2>
          <p className="text-gray-700 text-lg font-medium">
            Teach financial literacy by allowing families to explore investment
            opportunities like stocks and ETFs, building long-term wealth
            together.
          </p>
        </div>
      </div>
    </div>
  );
});

export default Banners;
