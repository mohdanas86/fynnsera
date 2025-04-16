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
import Loding from "../_components/Loding";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { toast } from "sonner";
import axios from "axios";

// Define separate Zod schemas for each input field
const fileNameSchema = z
  .string()
  .min(3, "File name must be greater than 3 characters.");
const balanceSchema = z.preprocess(
  (val) => parseFloat(val),
  z.number({ invalid_type_error: "Balance must be a valid number." })
);

export default function UploadModal({
  provider,
  userId,
  onClose,
  onUploadSuccess,
}) {
  const {
    catogerizationModelHandle,
    setUserTransaction,
    setSelectedFileData,
    handleSelect,
    userFileLogs,
    setUserFileLogs,
  } = useMyContext();
  const [fileName, setFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMode, setUploadMode] = useState(""); // "new" or "merge"
  const [existingFiles, setExistingFiles] = useState([]); // Array of [key, file]
  const [selectedMergeFileKey, setSelectedMergeFileKey] = useState("");
  const router = useRouter();
  const [currentBalance, setCurrentBalance] = useState("");
  const [loading, setLoading] = useState(false);

  // Validation error states
  const [fileNameError, setFileNameError] = useState("");
  const [currentBalanceError, setCurrentBalanceError] = useState("");
  const [fileInputError, setFileInputError] = useState("");

  // Read user data from localStorage
  const getUserData = () => {
    const data = { uploadedFiles: userFileLogs.data } || {
      uploadedFiles: {},
    };
    // console.log("userFiledata : ", { uploadedFiles: userFileLogs.data });
    return data;
  };

  // When the modal opens, filter the user's uploaded files by the chosen provider.
  useEffect(() => {
    const userData = getUserData();
    const files = Object.entries(userData.uploadedFiles || {}).filter(
      ([, file]) => file.provider === provider
    );
    setExistingFiles(files);
    // If no existing files, automatically set the mode to "new"
    if (files.length === 0) {
      setUploadMode("new");
    }
  }, [provider, userId]);

  // Validate file name on blur (for new file creation)
  const validateFileName = () => {
    try {
      fileNameSchema.parse(fileName);
      setFileNameError("");
    } catch (e) {
      setFileNameError(e.errors[0].message);
    }
  };

  // Validate current balance on blur (for new file creation)
  const validateCurrentBalance = () => {
    try {
      balanceSchema.parse(currentBalance);
      setCurrentBalanceError("");
    } catch (e) {
      setCurrentBalanceError(e.errors[0].message);
    }
  };

  // Handle file select with PDF check
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setFileInputError("Only PDF files are allowed.");
        toast("Only PDF files are allowed.");
        setSelectedFile(null);
      } else {
        setFileInputError("");
        setSelectedFile(file);
      }
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    // Ensure a file is selected
    if (!selectedFile) {
      // alert("Please select a PDF file.");
      toast("Please select a PDF file.");
      return;
    }
    // For new file creation, ensure file name and current balance are provided and valid.
    if (uploadMode === "new") {
      if (!fileName) {
        // alert("Please enter a file name.");
        toast("Please enter a file name.");
        return;
      }
      try {
        fileNameSchema.parse(fileName);
      } catch (e) {
        setFileNameError(e.errors[0].message);
        return;
      }
      try {
        balanceSchema.parse(currentBalance);
      } catch (e) {
        setCurrentBalanceError(e.errors[0].message);
        return;
      }
    }
    // For merge mode, ensure that a file has been selected to merge with.
    if (uploadMode === "merge" && !selectedMergeFileKey) {
      // alert("Please select a file to merge with.");
      toast("Please select a file to merge with.");
      return;
    }
    if (fileInputError) {
      // alert("Please choose a valid PDF file.");
      toast("Please choose a valid PDF file.");
      return;
    }

    setLoading(true);

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      // alert("File size should be less than 10MB.");
      toast("File size should be less than 10MB.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("userId", userId);

    try {
      // 1. Upload file to text-extract API
      const url = `${process.env.NEXT_PUBLIC_PDF_TEXT_EXTRACTOR}`;
      const res = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        toast(`Text extraction failed with status: ${res.status}`);
        throw new Error(`Text extraction failed with status: ${res.status}`);
      }

      const data = await res.json();
      const newTransactions = data.transactions || data;

      if (!Array.isArray(newTransactions)) {
        toast(`Invalid transaction data format.`);
        throw new Error("Invalid transaction data format.");
      }

      // 2. Categorize the data using the model
      const categorizedTransactions = await catogerizationModelHandle(
        newTransactions
      );

      // 3. Get existing user data
      const userData = getUserData();
      const files = userData.uploadedFiles || {};

      if (uploadMode === "merge") {
        const fileId = userFileLogs.data[selectedMergeFileKey]._id; // file id

        // Call the PATCH endpoint to update the file in the database
        const response = await axios.patch("/api/transaction-log", {
          uploadMode: "merge",
          fileId: fileId,
          categorizedTransactions: categorizedTransactions,
        });
        // console.log(
        //   "Merge update response:",
        //   response.data.updatedFile.transactions
        // );
        setSelectedFileData(response.data.updatedFile);
        handleSelect(response.data.updatedFile);
        setUserTransaction(response.data.updatedFile.transactions);
      } else {
        // Create new file
        const nextIndex = Object.keys(files).length;
        files[nextIndex] = {
          provider,
          userId,
          currentBalance: parseFloat(currentBalance) || 0,
          filename: fileName,
          transactions: categorizedTransactions,
        };
        const newFileData = files[nextIndex];
        // upload data in db
        await axios.post("/api/transaction-log", newFileData, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        setSelectedFileData(newFileData);
        handleSelect(newFileData);
        setUserTransaction(newFileData.transactions);
        toast.success("File Uploaded Successfully!");
      }

      // 5. Trigger success callback, close modal and navigate to dashboard
      const response = await axios.get(`/api/transaction-log?userId=${userId}`);
      setUserFileLogs(response.data);
      onUploadSuccess?.(categorizedTransactions);
      onClose();
      router.push("/dashboard");
    } catch (error) {
      // console.error("❌ Upload error:", error.message || error);
      // alert("Failed to upload and categorize file.");
      toast.error("Failed to upload file.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loding />;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--model-bg)] bg-opacity-40">
      <div className="bg-white p-6 lg:rounded-xl rounded-sm shadow-xl w-[90%] max-w-md relative">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Upload PDF</h2>

        {/* PDF drop zone */}
        <div className="group relative mb-1">
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

        <div className="mb-3 text-sm">
          {fileInputError ? (
            <span className="text-red-600">{fileInputError}</span>
          ) : (
            <span className="text-gray-500">Please select a PDF file</span>
          )}
        </div>

        {/* For new file creation mode show file name and balance inputs */}
        {uploadMode === "new" && (
          <>
            {/* Filename input */}
            <input
              type="text"
              placeholder="Enter file name"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              onBlur={validateFileName}
              className="mb-1 w-full border px-3 py-2 rounded-[2px] mt-2"
            />
            <div className="mb-3 text-sm">
              {fileNameError ? (
                <span className="text-red-600">{fileNameError}</span>
              ) : (
                <span className="text-gray-500">
                  Example: Last Month Transaction
                </span>
              )}
            </div>

            {/* Current Balance input */}
            <input
              type="number"
              placeholder="Enter current balance"
              value={currentBalance}
              onChange={(e) => setCurrentBalance(e.target.value)}
              onBlur={validateCurrentBalance}
              className="mb-1 w-full border px-3 py-2 rounded-[2px]"
            />
            <div className="mb-3 text-sm">
              {currentBalanceError ? (
                <span className="text-red-600">{currentBalanceError}</span>
              ) : (
                <span className="text-gray-500">Example: 1234.56</span>
              )}
            </div>
          </>
        )}

        {/* Upload mode options */}
        {selectedFile &&
          (existingFiles.length > 0 ? (
            <div className="mb-4">
              {/* Two buttons shown when there are existing files */}
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
              {/* If merge mode is selected, show the dropdown to select an existing file */}
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
            // If there are no existing files, only show the new file creation option.
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
