"use client";
import { useState, useEffect } from "react";
import { useMyContext } from "@/context/MyContext";
import { useSession } from "next-auth/react";
import UploadModal from "./UploadModal"; // Adjust the path if needed
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

//pdf icons
export const RupeePddIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-4 h-4"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 9h3.75m-4.5 2.625h4.5M12 18.75 9.75 16.5h.375a2.625 2.625 0 0 0 0-5.25H9.75m.75-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
    />
  </svg>
);

export default function UploadPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { userId, userFileLogs, handleSelect } = useMyContext();
  const [selectedProvider, setSelectedProvider] = useState(""); // Default to PhonePe
  const [showModal, setShowModal] = useState(false);

  const handleProviderSelect = (provider) => {
    setSelectedProvider(provider);
  };

  const handleOpenModal = () => {
    if (!selectedProvider) {
      return alert("Please select a provider.");
    }
    setShowModal(true);
  };

  const handleFileSelect = (file) => {
    handleSelect(file);
    router.push("/dashboard/transactions");
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800 lg:p-10 p-4">
      <h1 className="text-2xl font-bold lg:mb-6 mb-4 text-[var(--color-heading)]">
        Upload Transactions
      </h1>

      {/* Shadcn UI Provider selection dropdown */}
      <div className="mb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="w-[200px] flex justify-between items-center rounded-[2px]"
              variant="outline"
            >
              <span>
                {selectedProvider ? selectedProvider : "Select Provider"}
              </span>
              <span>
                <ChevronDown className="w-4 h-4" />
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[200px]">
            <DropdownMenuLabel>Providers</DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => handleProviderSelect("phonepe")}>
              PhonePe
            </DropdownMenuItem>
            {/* Add more providers as needed */}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Button
        onClick={handleOpenModal}
        className="bg-[var(--color-primary)] text-white rounded-[2px] hover:bg-[var(--color-primary-dark)] w-[200px]"
      >
        Upload File
      </Button>

      {/* Show PhonePe instructions if selected */}
      {(selectedProvider === "" || "phonepe") && (
        <div className="mt-6 bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg max-w-lg text-sm">
          <h2 className="font-semibold mb-2">
            How to Download Transaction PDF from PhonePe
          </h2>
          <ol className="list-decimal list-inside space-y-1">
            <li>
              Open the <strong>PhonePe</strong> app on your mobile device.
            </li>
            <li>
              Go to the <strong>History</strong> or{" "}
              <strong>Transactions</strong> tab.
            </li>
            <li>
              Select the date range or specific transaction history you want.
            </li>
            <li>
              Look for the <strong>Download PDF</strong> or{" "}
              <strong>Statement</strong> option.
            </li>
            <li>Download and save the PDF to your device.</li>
            <li>Come back here and upload the file using the button above.</li>
          </ol>
        </div>
      )}

      {showModal && (
        <UploadModal
          provider={selectedProvider}
          userId={userId}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* SHOW ALL FILE LOGS FOR THIS USER */}
      <h1 className="text-2xl font-bold lg:mb-6 mb-4 text-[var(--color-heading)] mt-8">
        Your Files
      </h1>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6 gap-4">
        {userFileLogs?.data?.length > 0 ? (
          userFileLogs.data.map((v, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-lg shadow-sm p-5 hover:shadow-md transition-all bg-white cursor-pointer"
              onClick={() => handleFileSelect(v)}
            >
              <div className="flex items-start justify-between mb-3">
                <img src="/pdf.png" alt="file" className="w-10 h-10" />
                <span className="text-gray-500 p-2 border rounded-full bg-gray-50">
                  <RupeePddIcon />
                </span>
              </div>
              <div className="text-sm font-medium truncate text-[var(--color-heading)]">
                {v.filename}
              </div>
              <div className="text-xs text-[var(--color-para)] mt-1">
                Balance: ₹{v.currentBalance}
              </div>
              <div className="text-xs text-[var(--color-para)]">
                Provider: {v.provider}
              </div>
              <div className="text-xs text-[var(--color-para)]">
                Totoal Transactions: {v.transactions.length}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-[var(--color-para)] text-sm">
            No files found.
          </div>
        )}
      </div>
    </div>
  );
}
