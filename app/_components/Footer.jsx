import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <footer className="bg-white mt-6">
      <div className="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 rounded-lg bg-indigo-600 p-6 shadow-lg sm:flex-row sm:justify-between">
          <strong className="text-xl text-white sm:text-xl">
            Manage Your Finances Smarter with AI
          </strong>
          <Link
            className="inline-flex items-center gap-2 rounded-full border border-white bg-white px-6 py-2 text-indigo-600 hover:bg-transparent hover:text-white transition"
            href="/signin"
          >
            Get Started
            <svg
              className="size-5 rtl:rotate-180"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* About */}
          <div>
            <h3 className="text-lg font-medium text-gray-900">About</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-700 hover:text-gray-500">
                  Our Story
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-700 hover:text-gray-500">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-700 hover:text-gray-500">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-lg font-medium text-gray-900">Features</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-700 hover:text-gray-500">
                  AI Budgeting
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-700 hover:text-gray-500">
                  Expense Tracking
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-700 hover:text-gray-500">
                  Investment Insights
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-medium text-gray-900">Support</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-700 hover:text-gray-500">
                  FAQs
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-700 hover:text-gray-500">
                  Live Chat
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-700 hover:text-gray-500">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} AI Finance Assistant. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
