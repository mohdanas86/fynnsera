// "use client";
// import { Button } from "@/components/ui/button";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { useMyContext } from "@/context/MyContext";
// import { useState, useEffect } from "react";
// import Loding from "../_components/Loding";
// import { useRouter } from "next/navigation";
// import { z } from "zod";

// // Define separate Zod schemas for each input field
// const fileNameSchema = z
//   .string()
//   .min(3, "File name must be greater than 3 characters.");
// const balanceSchema = z.preprocess(
//   (val) => parseFloat(val),
//   z.number({ invalid_type_error: "Balance must be a valid number." })
// );

// export default function UploadModal({
//   provider,
//   userId,
//   onClose,
//   onUploadSuccess,
// }) {
//   const {
//     catogerizationModelHandle,
//     setUserTransaction,
//     setSelectedFileData,
//     handleSelect,
//   } = useMyContext();
//   const [fileName, setFileName] = useState("");
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [uploadMode, setUploadMode] = useState(""); // "new" or "merge"
//   const [existingFiles, setExistingFiles] = useState([]); // Array of [key, file]
//   const [selectedMergeFileKey, setSelectedMergeFileKey] = useState("");
//   const router = useRouter();
//   const [currentBalance, setCurrentBalance] = useState("");
//   const [loading, setLoading] = useState(false);

//   // Validation error states
//   const [fileNameError, setFileNameError] = useState("");
//   const [currentBalanceError, setCurrentBalanceError] = useState("");
//   const [fileInputError, setFileInputError] = useState("");

//   // Read user data from localStorage
//   const getUserData = () => {
//     return JSON.parse(localStorage.getItem(userId)) || { uploadedFiles: {} };
//   };

//   // Save user data to localStorage
//   const saveUserData = (data) => {
//     localStorage.setItem(userId, JSON.stringify(data));
//   };

//   // When the modal opens, filter the user's uploaded files by the chosen provider.
//   useEffect(() => {
//     const userData = getUserData();
//     const files = Object.entries(userData.uploadedFiles || {}).filter(
//       ([, file]) => file.provider === provider
//     );
//     setExistingFiles(files);
//   }, [provider, userId]);

//   // Validate file name on blur
//   const validateFileName = () => {
//     try {
//       fileNameSchema.parse(fileName);
//       setFileNameError("");
//     } catch (e) {
//       setFileNameError(e.errors[0].message);
//     }
//   };

//   // Validate current balance on blur
//   const validateCurrentBalance = () => {
//     try {
//       balanceSchema.parse(currentBalance);
//       setCurrentBalanceError("");
//     } catch (e) {
//       setCurrentBalanceError(e.errors[0].message);
//     }
//   };

//   // Handle file select with PDF check
//   const handleFileSelect = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       if (file.type !== "application/pdf") {
//         setFileInputError("Only PDF files are allowed.");
//         setSelectedFile(null);
//       } else {
//         setFileInputError("");
//         setSelectedFile(file);
//       }
//     }
//   };

//   // // handle file upload
//   const handleUpload = async () => {
//     // Validate required fields before uploading
//     if (!selectedFile || !fileName) {
//       alert("Please complete all fields.");
//       return;
//     }
//     // Run validations one more time prior to starting the upload
//     try {
//       fileNameSchema.parse(fileName);
//     } catch (e) {
//       setFileNameError(e.errors[0].message);
//       return;
//     }
//     try {
//       balanceSchema.parse(currentBalance);
//     } catch (e) {
//       setCurrentBalanceError(e.errors[0].message);
//       return;
//     }
//     if (fileInputError) {
//       alert("Please choose a valid PDF file.");
//       return;
//     }

//     setLoading(true);

//     const maxSize = 10 * 1024 * 1024;
//     if (selectedFile.size > maxSize) {
//       alert("File size should be less than 10MB.");
//       setLoading(false);
//       return;
//     }

//     const formData = new FormData();
//     formData.append("file", selectedFile);
//     formData.append("userId", userId);

//     try {
//       // 1. Upload file to text-extract API
//       const url = `${process.env.NEXT_PUBLIC_PDF_TEXT_EXTRACTOR}`;
//       // console.log(url);
//       const res = await fetch(url, {
//         method: "POST",
//         body: formData,
//       });

//       if (!res.ok) {
//         throw new Error(`Text extraction failed with status: ${res.status}`);
//       }

//       const data = await res.json();
//       const newTransactions = data.transactions || data;

//       if (!Array.isArray(newTransactions)) {
//         throw new Error("Invalid transaction data format.");
//       }

//       // 2. Categorize the data using the model
//       const categorizedTransactions = await catogerizationModelHandle(
//         newTransactions
//       );

//       // console.log(
//       //   "new file categorizedTransactions: ",
//       //   categorizedTransactions
//       // );

//       if (!Array.isArray(categorizedTransactions)) {
//         throw new Error("Categorized data is not in expected format.");
//       }

//       // 3. Get existing user data
//       const userData = getUserData();
//       const files = userData.uploadedFiles || {};

//       if (uploadMode === "merge") {
//         if (!selectedMergeFileKey) {
//           alert("Please select a file to merge with.");
//           setLoading(false);
//           return;
//         }
//         const newFileData = (files[selectedMergeFileKey].transactions = [
//           ...files[selectedMergeFileKey].transactions,
//           ...categorizedTransactions,
//         ].sort((a, b) => new Date(a.date) - new Date(b.date)));
//         // console.log("newFileData : ", newFileData);
//         setSelectedFileData(newFileData);
//         handleSelect(newFileData);
//         setUserTransaction(newFileData.transactions);
//       } else {
//         const nextIndex = Object.keys(files).length;
//         const newFileData = (files[nextIndex] = {
//           provider,
//           userId,
//           currentBalance: parseFloat(currentBalance) || 0,
//           filename: fileName,
//           transactions: categorizedTransactions,
//         });
//         setSelectedFileData(newFileData);
//         handleSelect(newFileData);
//         setUserTransaction(newFileData.transactions);
//       }

//       // 4. Save updated data
//       saveUserData({ uploadedFiles: files });

//       // 5. Trigger success callback, close UI and navigate
//       onUploadSuccess?.(categorizedTransactions);
//       onClose();
//       // setUserTransaction(categorizedTransactions);

//       router.push("/dashboard");
//     } catch (error) {
//       console.error("❌ Upload error:", error.message || error);
//       alert("Failed to upload and categorize file. Check console for details.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) return <Loding />;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--model-bg)] bg-opacity-40">
//       <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md relative">
//         <h2 className="text-lg font-semibold mb-4 text-gray-800">Upload PDF</h2>

//         {/* Filename input */}
//         <input
//           type="text"
//           placeholder="Enter file name"
//           value={fileName}
//           onChange={(e) => setFileName(e.target.value)}
//           onBlur={validateFileName}
//           className="mb-1 w-full border px-3 py-2 rounded-[2px]"
//         />
//         <div className="mb-3 text-sm">
//           {fileNameError ? (
//             <span className="text-red-600">{fileNameError}</span>
//           ) : (
//             <span className="text-gray-500">
//               Example: Last Month Transaction
//             </span>
//           )}
//         </div>

//         {/* Current Balance input */}
//         <input
//           type="number"
//           placeholder="Enter current balance"
//           value={currentBalance}
//           onChange={(e) => setCurrentBalance(e.target.value)}
//           onBlur={validateCurrentBalance}
//           className="mb-1 w-full border px-3 py-2 rounded-[2px]"
//         />
//         <div className="mb-3 text-sm">
//           {currentBalanceError ? (
//             <span className="text-red-600">{currentBalanceError}</span>
//           ) : (
//             <span className="text-gray-500">Example: 1234.56</span>
//           )}
//         </div>

//         {/* PDF drop zone */}
//         <div className="group relative mb-1">
//           <div className="relative rounded-[2px] border-2 border-dashed border-gray-300 bg-gray-50 p-8">
//             <input
//               type="file"
//               accept="application/pdf"
//               className="absolute inset-0 z-50 h-full w-full cursor-pointer opacity-0"
//               onChange={handleFileSelect}
//             />
//             <div className="space-y-6 text-center">
//               <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow">
//                 <svg
//                   className="h-8 w-8 text-cyan-600"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
//                   />
//                 </svg>
//               </div>
//               <div className="space-y-2">
//                 <p className="text-base font-medium text-gray-700">
//                   Drop your PDF here or browse
//                 </p>
//                 <p className="text-sm text-gray-500">Supported: PDF</p>
//                 <p className="text-xs text-gray-400">Max size: 10MB</p>
//               </div>
//             </div>
//           </div>
//         </div>
//         <div className="mb-3 text-sm">
//           {fileInputError ? (
//             <span className="text-red-600">{fileInputError}</span>
//           ) : (
//             <span className="text-gray-500">Please select a PDF file</span>
//           )}
//         </div>

//         {/* Upload mode options */}
//         {selectedFile &&
//           (existingFiles.length > 0 ? (
//             <div className="mb-4">
//               <div className="flex items-center space-x-4">
//                 <button
//                   onClick={() => setUploadMode("new")}
//                   className={`px-4 py-2 rounded-[2px] ${
//                     uploadMode === "new"
//                       ? "bg-teal-600 text-white"
//                       : "bg-gray-200 text-gray-800"
//                   }`}
//                 >
//                   Create New
//                 </button>
//                 <button
//                   onClick={() => setUploadMode("merge")}
//                   className={`px-4 py-2 rounded-[2px] ${
//                     uploadMode === "merge"
//                       ? "bg-teal-600 text-white"
//                       : "bg-gray-200 text-gray-800"
//                   }`}
//                 >
//                   Merge
//                 </button>
//               </div>
//               {uploadMode === "merge" && (
//                 <div className="mt-3">
//                   <Select
//                     value={selectedMergeFileKey}
//                     onValueChange={(value) => setSelectedMergeFileKey(value)}
//                   >
//                     <SelectTrigger className="w-full">
//                       <SelectValue placeholder="Select file to merge with" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {existingFiles.map(([key, file]) => (
//                         <SelectItem key={key} value={key}>
//                           {file.filename}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <div className="mb-4">
//               <Button
//                 onClick={() => setUploadMode("new")}
//                 className="rounded-[2px] bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white"
//               >
//                 Create New
//               </Button>
//             </div>
//           ))}

//         <div className="flex justify-end mt-6">
//           <Button
//             onClick={handleUpload}
//             className="rounded-[2px] bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white"
//           >
//             Upload File
//           </Button>
//           <Button
//             variant="outline"
//             onClick={onClose}
//             className="hover:text-gray-700 ml-4 rounded-[2px]"
//           >
//             Cancel
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }
