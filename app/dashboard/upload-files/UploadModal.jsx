"use client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMyContext } from "@/context/MyContext";
import { useState, useEffect } from "react";

export default function UploadModal({
  provider,
  userId,
  onClose,
  onUploadSuccess,
}) {
  const [fileName, setFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMode, setUploadMode] = useState(""); // "new" or "merge"
  const [existingFiles, setExistingFiles] = useState([]); // Array of [key, file]
  const [selectedMergeFileKey, setSelectedMergeFileKey] = useState("");
  const [currentBalance, setCurrentBalance] = useState("");
  const { catogerizationModelHandle } = useMyContext();

  // Read user data from localStorage
  const getUserData = () => {
    return JSON.parse(localStorage.getItem(userId)) || { uploadedFiles: {} };
  };

  // Save user data to localStorage
  const saveUserData = (data) => {
    localStorage.setItem(userId, JSON.stringify(data));
  };

  // When the modal opens, filter the user's uploaded files by the chosen provider.
  useEffect(() => {
    const userData = getUserData();
    const files = Object.entries(userData.uploadedFiles || {}).filter(
      ([, file]) => file.provider === provider
    );
    setExistingFiles(files);
  }, [provider, userId]);

  const handleFileSelect = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile || !fileName) {
      alert("Please complete all fields.");
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      alert("File size should be less than 10MB.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("userId", userId);

    try {
      // 1. Upload file to text-extract API
      const res = await fetch("http://localhost:8000/extract-text", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Text extraction failed with status: ${res.status}`);
      }

      const data = await res.json();
      const newTransactions = data.transactions || data;

      if (!Array.isArray(newTransactions)) {
        throw new Error("Invalid transaction data format.");
      }

      // 2. Categorize the data using the model
      const categorizedTransactions = await catogerizationModelHandle(
        newTransactions
      );

      if (!Array.isArray(categorizedTransactions)) {
        throw new Error("Categorized data is not in expected format.");
      }

      // 3. Get existing user data
      const userData = getUserData();
      const files = userData.uploadedFiles || {};

      if (uploadMode === "merge") {
        if (!selectedMergeFileKey) {
          alert("Please select a file to merge with.");
          return;
        }

        files[selectedMergeFileKey].transactions = [
          ...files[selectedMergeFileKey].transactions,
          ...categorizedTransactions,
        ].sort((a, b) => new Date(a.date) - new Date(b.date));
      } else {
        const nextIndex = Object.keys(files).length;
        files[nextIndex] = {
          provider,
          userId,
          currentBalance: parseFloat(currentBalance) || 0,
          filename: fileName,
          transactions: categorizedTransactions,
        };
      }

      // 4. Save updated data
      saveUserData({ uploadedFiles: files });

      // 5. Trigger success callback and close UI
      onUploadSuccess?.(categorizedTransactions);
      onClose();
    } catch (error) {
      console.error("❌ Upload error:", error.message || error);
      alert("Failed to upload and categorize file. Check console for details.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--model-bg)] bg-opacity-40">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md relative">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Upload PDF</h2>

        {/* Filename input */}
        <input
          type="text"
          placeholder="Enter file name"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          className="mb-3 w-full border px-3 py-2 rounded-[2px]"
        />

        {/* Current Balance input */}
        <input
          type="number"
          placeholder="Enter current balance"
          value={currentBalance}
          onChange={(e) => setCurrentBalance(e.target.value)}
          className="mb-3 w-full border px-3 py-2 rounded-[2px]"
        />

        {/* PDF drop zone */}
        <div className="group relative mb-4">
          <div className="relative rounded-[2px] border-2 border-dashed border-gray-300 bg-gray-50 p-8">
            <input
              type="file"
              accept="application/pdf"
              className="absolute inset-0 z-50 h-full w-full cursor-pointer opacity-0"
              onChange={handleFileSelect}
            />
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow">
                <svg
                  className="h-8 w-8 text-cyan-600"
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
                  Drop your PDF here or browse
                </p>
                <p className="text-sm text-gray-500">Supported: PDF</p>
                <p className="text-xs text-gray-400">Max size: 10MB</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upload mode options */}
        {selectedFile &&
          (existingFiles.length > 0 ? (
            <div className="mb-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setUploadMode("new")}
                  className={`px-4 py-2 rounded-[2px] ${
                    uploadMode === "new"
                      ? "bg-teal-600 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  Create New
                </button>
                <button
                  onClick={() => setUploadMode("merge")}
                  className={`px-4 py-2 rounded-[2px] ${
                    uploadMode === "merge"
                      ? "bg-teal-600 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  Merge
                </button>
              </div>
              {uploadMode === "merge" && (
                <div className="mt-3">
                  <Select
                    value={selectedMergeFileKey}
                    onValueChange={(value) => setSelectedMergeFileKey(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select file to merge with" />
                    </SelectTrigger>
                    <SelectContent>
                      {existingFiles.map(([key, file]) => (
                        <SelectItem key={key} value={key}>
                          {file.filename}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          ) : (
            <div className="mb-4">
              <Button
                onClick={() => setUploadMode("new")}
                className="rounded-[2px] bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white"
              >
                Create New
              </Button>
            </div>
          ))}

        <div className="flex justify-end mt-6">
          <Button
            onClick={handleUpload}
            className="rounded-[2px] bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white"
          >
            Upload File
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="hover:text-gray-700 ml-4 rounded-[2px]"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
