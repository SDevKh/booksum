import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Sparkles, BookOpen, Upload, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { extractPagesFromPdf, extractPagesFromTxt } from "@/utils/pdfParser";

export default function BookSearchHero({ onSearch, onTextExtracted, isLoading }) {
  const [bookInput, setBookInput] = useState("");
  const [isDragActive, setIsDragActive] = useState(false);
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (bookInput.trim()) onSearch(bookInput.trim());
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const processFile = async (file) => {
    setFileError("");
    const fileType = file.type;
    const name = file.name;

    // Guess title and author from file name
    let title = name.replace(/\.[^/.]+$/, ""); // strip extension
    let author = "Uploaded File";

    if (title.includes(" - ")) {
      const parts = title.split(" - ");
      title = parts[0].trim();
      author = parts[1].trim();
    } else if (title.includes(" by ")) {
      const parts = title.split(" by ");
      title = parts[0].trim();
      author = parts[1].trim();
    }

    try {
      let pages = [];
      if (fileType === "application/pdf" || name.endsWith(".pdf")) {
        pages = await extractPagesFromPdf(file);
      } else if (fileType === "text/plain" || name.endsWith(".txt")) {
        const rawText = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = () => reject(new Error("Failed to read text file"));
          reader.readAsText(file);
        });
        pages = extractPagesFromTxt(rawText);
      } else {
        setFileError("Unsupported file type. Please upload a PDF or TXT file.");
        return;
      }

      if (!pages || pages.length === 0) {
        setFileError("The file seems to be empty or unreadable.");
        return;
      }

      onTextExtracted(pages, title, author);
    } catch (err) {
      console.error(err);
      setFileError(err.message || "Failed to parse file.");
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const suggestions = [
    "Atomic Habits by James Clear",
    "Thinking, Fast and Slow by Daniel Kahneman",
    "The Psychology of Money by Morgan Housel",
    "Deep Work by Cal Newport",
    "Sapiens by Yuval Noah Harari",
  ];

  return (
    <section className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-16 pb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary text-sm font-medium text-secondary-foreground mb-6">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            AI-Powered Book Summaries
          </div>
          <div className="flex justify-center mb-6">
            <a
              href="https://digitalheroesco.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm"
            >
              Built for Digital Heroes
            </a>
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-4">
            Get the <span className="italic text-accent">wisdom</span> of any book
            <br />in minutes
          </h1>

          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10">
            Key takeaways, powerful stories, and actionable insights — explained simply so you can learn and apply faster.
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative max-w-xl mx-auto animate-fade-in"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={bookInput}
                onChange={(e) => setBookInput(e.target.value)}
                placeholder='Try "Atomic Habits" or "Rich Dad Poor Dad"'
                className="pl-12 h-14 text-base rounded-xl border-2 border-border focus:border-primary bg-card shadow-sm w-full"
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              disabled={!bookInput.trim() || isLoading}
              className="h-14 w-full sm:w-auto px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base shadow-lg shadow-primary/20 shrink-0"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Summarize
                </>
              )}
            </Button>
          </div>
        </motion.form>

        {/* Drag and Drop Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 max-w-xl mx-auto"
        >
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => !isLoading && fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all duration-300 ${isLoading ? "pointer-events-none opacity-55" : ""
              } ${isDragActive
                ? "border-accent bg-accent/5 scale-[1.02]"
                : "border-border hover:border-primary/40 hover:bg-secondary/30"
              }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt"
              className="hidden"
              onChange={handleFileChange}
              disabled={isLoading}
            />

            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <Upload className="w-6 h-6 animate-bounce-slow" />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  Drag & drop a book file here, or <span className="text-accent hover:underline">browse</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports PDF or TXT documents (up to 50 pages)
                </p>
              </div>
            </div>

            {fileError && (
              <div className="mt-4 flex items-center gap-2 justify-center text-sm text-red-500 font-medium bg-red-500/10 py-2 px-3 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{fileError}</span>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8"
        >
          <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider font-medium">Popular books</p>
          <div className="flex flex-wrap justify-center gap-2">
            {suggestions.map((book) => (
              <button
                key={book}
                onClick={() => { setBookInput(book); onSearch(book); }}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-secondary transition-all disabled:opacity-50"
              >
                <BookOpen className="w-3 h-3" />
                {book.split(" by ")[0]}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
