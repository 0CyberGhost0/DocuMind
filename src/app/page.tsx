"use client";
import { FileUpload } from "./components/ui/file-upload";
import { PlaceholdersAndVanishInput } from "./components/ui/placeholders-and-vanish-input";
import { useState, useRef, FormEvent } from "react";
import { motion } from "framer-motion";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [answer, setAnswer] = useState<string>("");
  const [question, setQuestion] = useState<string>("");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

  // Use ref to store uploaded file data to prevent losing it on re-renders
  const fileDataRef = useRef<File | null>(null);

  const handleFileUpload = async (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      if (!file.type.includes("pdf")) {
        setAnswer("Please upload a PDF file");
        return;
      }

      // Store the file in ref for later use
      fileDataRef.current = file;
      setFileName(file.name);
      setIsLoading(true);

      try {
        // Create object URL for PDF preview
        const objectUrl = URL.createObjectURL(file);
        setPdfUrl(objectUrl);

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }

        setAnswer(data.summary);
      } catch (error) {
        console.error("Error uploading file:", error);
        setAnswer("Sorry, there was an error processing your PDF.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleQuestionSubmit = async (e: FormEvent) => {
    e.preventDefault(); // Prevent form submission from reloading the page

    if (!question.trim() || !pdfUrl) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get answer");
      }

      setAnswer(data.answer);
      setQuestion("");
    } catch (error) {
      console.error("Error:", error);
      setAnswer(
        error instanceof Error
          ? error.message
          : "Sorry, there was an error processing your question."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (question.trim()) {
        handleQuestionSubmit(e as unknown as FormEvent);
      }
    }
  };

  const placeholders = [
    "What's the main topic of this document?",
    "Summarize the key findings...",
    "Explain the methodology used...",
    "What are the conclusions?",
  ];

  return (
    <main className="min-h-screen bg-black text-gray-200">
      <div className="container mx-auto p-6">
        {/* Header */}
        <header className="py-6 mb-8 text-center">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
            DocuMind
          </h1>
          <p className="mt-3 text-lg text-gray-400">
            Intelligent conversations with your documents
          </p>
        </header>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)]">
          {/* Left Side - PDF Display */}
          <div className="lg:w-3/5 flex flex-col rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-xl">
            {pdfUrl ? (
              <>
                <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
                  <h2 className="font-medium truncate max-w-xs text-gray-300">{fileName}</h2>
                  <button
                    onClick={() => setPdfUrl(null)}
                    className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded-md hover:bg-zinc-800 transition"
                  >
                    Change file
                  </button>
                </div>
                <div className="flex-1 bg-white">
                  <iframe
                    src={pdfUrl}
                    className="w-full h-full"
                    title="PDF Viewer"
                  />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-10 h-full">
                <div className="w-24 h-24 mb-6 text-gray-500 opacity-70">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold mb-3 text-center text-gray-200">Upload Your PDF</h2>
                <p className="text-gray-400 mb-8 text-center max-w-md">
                  Drop a PDF document to analyze and chat with its contents. Our AI will help you extract insights.
                </p>
                <FileUpload onChange={handleFileUpload} />
              </div>
            )}
          </div>

          {/* Right Side - Chat Interface */}
          <div className="lg:w-2/5 flex flex-col rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-xl">
            <div className="p-4 border-b border-zinc-800 bg-zinc-950">
              <h2 className="font-medium text-gray-200">Ask Questions</h2>
            </div>

            {/* Chat Messages / Answer Display */}
            <div className="flex-1 p-6 overflow-y-auto bg-zinc-900">
              {answer ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 rounded-lg bg-zinc-800 shadow-sm"
                >
                  <p className="leading-relaxed whitespace-pre-wrap text-gray-200">{answer}</p>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                  {pdfUrl ? (
                    <>
                      <div className="w-16 h-16 text-gray-500 opacity-70">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                      </div>
                      <p className="text-gray-400">Ask a question about your document</p>
                    </>
                  ) : (
                    <p className="text-gray-500">Upload a PDF to start the conversation</p>
                  )}
                </div>
              )}
            </div>

            {/* Question Input - No form, just direct event handling */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-950">
              <div className="relative">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyPress={handleInputKeyPress}
                  disabled={!pdfUrl || isLoading}
                  placeholder={pdfUrl ? placeholders[Math.floor(Math.random() * placeholders.length)] : "Upload a PDF first..."}
                  className="w-full p-3 pr-12 bg-zinc-800 border border-zinc-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                />
                <button
                  onClick={(e) => handleQuestionSubmit(e as unknown as FormEvent)}
                  disabled={!pdfUrl || !question.trim() || isLoading}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-500 disabled:text-gray-600 disabled:cursor-not-allowed"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {isLoading && (
                <div className="flex justify-center mt-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-purple-600 animate-pulse"></div>
                    <div className="w-3 h-3 rounded-full bg-blue-600 animate-pulse delay-150"></div>
                    <div className="w-3 h-3 rounded-full bg-purple-600 animate-pulse delay-300"></div>
                    <span className="text-xs text-gray-500 ml-2">Processing...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}