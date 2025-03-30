import React, { memo } from "react";

const Banners = memo(() => {
  return (
    <div className="mx-auto max-w-7xl grid grid-cols-1 gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12 px-8">
        {/* Left Content */}
        <div className="flex items-center justify-center">
          <img
            src="/img/span (3).png"
            loading="lazy"
            className="w-[90%] max-w-[400px] drop-shadow-lg"
            alt="Financial Insights"
          />
        </div>
        {/* Right Content */}
        <div className="flex flex-col gap-6 items-start text-left">
          <h2 className="text-2xl font-extrabold leading-tight text-gray-900">
            Smart Spending Insights
          </h2>
          <p className="text-gray-700 text-lg font-medium">
            AI categorizes transactions (e.g., groceries, entertainment, bills)
            and provides real-time notifications to track your kids' or teens'
            spending habits.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12 px-8">
        {/* Left Content */}
        <div className="flex flex-col gap-6 items-start text-left">
          <h2 className="text-2xl font-extrabold leading-tight text-gray-900">
            Power Financial Independence
          </h2>
          <p className="text-gray-700 text-lg font-medium">
            Support your teen’s journey from their first job to their first car
            with personalized financial advice and budgeting tools tailored to
            their needs.
          </p>
        </div>
        {/* Right Content */}
        <div className="flex items-center justify-center">
          <img
            src="/img/span (2).png"
            loading="lazy"
            className="w-[90%] max-w-[400px] drop-shadow-lg"
            alt="Financial Insights"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12 px-8">
        {/* Left Content */}
        <div className="flex items-center justify-center">
          <img
            src="/img/span (1).png"
            loading="lazy"
            className="w-[90%] max-w-[400px] drop-shadow-lg"
            alt="Financial Insights"
          />
        </div>
        {/* Right Content */}
        <div className="flex flex-col gap-6 items-start text-left">
          <h2 className="text-2xl font-extrabold leading-tight text-gray-900">
            Safety & Connectivity Features
          </h2>
          <p className="text-gray-700 text-lg font-medium">
            Stay connected with spending alerts, AI-powered fraud detection, and
            budgeting tools, all accessible through iOS and Android.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12 px-8">
        {/* Left Content */}
        <div className="flex flex-col gap-6 items-start text-left">
          <h2 className="text-2xl font-extrabold leading-tight text-gray-900">
            Supercharge Savings Goals
          </h2>
          <p className="text-gray-700 text-lg font-medium">
            Set ambitious savings goals as a family and earn rewards of up to 5%
            on savings* while tracking progress together.
          </p>
        </div>
        {/* Right Content */}
        <div className="flex items-center justify-center">
          <img
            src="/img/span.png"
            loading="lazy"
            className="w-[90%] max-w-[400px] drop-shadow-lg"
            alt="Financial Insights"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12 px-8">
        {/* Left Content */}
        <div className="flex items-center justify-center">
          <img
            src="/img/group.png"
            loading="lazy"
            className="w-[90%] max-w-[400px] drop-shadow-lg"
            alt="Financial Insights"
          />
        </div>
        {/* Right Content */}
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
