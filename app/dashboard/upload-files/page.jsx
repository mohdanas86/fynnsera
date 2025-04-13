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

export default function UploadPage() {
  const { data: session, status } = useSession();
  const { userId } = useMyContext();
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

  return (
    <div className="flex flex-col min-h-screen bg-white lg:px-4 text-gray-800">
      <h1 className="text-2xl font-bold mb-4">Upload Transactions</h1>

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
          // onUploadSuccess={(data) => {
          //   alert("Upload success");
          // }}
        />
      )}
    </div>
  );
}
