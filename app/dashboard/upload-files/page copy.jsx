"use client";
import { useState } from "react";

export default function UploadPage() {
  const [transactions, setTransactions] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:8000/extract-text", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      console.log("data : ", data);
      setTransactions(data.transactions || data);
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6 text-gray-800">
      <div className="group relative w-[420px]">
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-cyan-200/60 border border-gray-200">
          <div className="absolute -left-16 -top-16 h-32 w-32 rounded-full bg-gradient-to-br from-cyan-300/20 to-sky-300/0 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:opacity-80" />
          <div className="absolute -right-16 -bottom-16 h-32 w-32 rounded-full bg-gradient-to-br from-sky-300/20 to-cyan-300/0 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:opacity-80" />

          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Upload Files
                </h3>
                <p className="text-sm text-gray-500">
                  Drag & drop your files here
                </p>
              </div>
              <div className="rounded-lg bg-cyan-100 p-2">
                <svg
                  className="h-6 w-6 text-cyan-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
            </div>

            <div className="group/dropzone mt-6">
              <div className="relative rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 transition-colors group-hover/dropzone:border-cyan-400">
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  className="absolute inset-0 z-50 h-full w-full cursor-pointer opacity-0"
                  onChange={handleUpload}
                />
                <div className="space-y-6 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white shadow">
                    <svg
                      className="h-10 w-10 text-cyan-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <p className="text-base font-medium text-gray-700">
                      Drop your files here or browse
                    </p>
                    <p className="text-sm text-gray-500">Supported: PDF</p>
                    <p className="text-xs text-gray-400">Max size: 10MB</p>
                  </div>
                </div>
              </div>
            </div>

            {transactions && (
              <div className="mt-6 text-sm max-h-[300px] overflow-y-auto rounded-xl bg-gray-100 p-4 border border-gray-200">
                <h2 className="text-gray-800 font-semibold mb-2">
                  Extracted Transactions
                </h2>
                <pre className="whitespace-pre-wrap text-gray-700">
                  {JSON.stringify(transactions, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
