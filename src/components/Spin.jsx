import React, { useRef, useState } from "react";
import acronyms from "./data";

export default function TextFormatter() {
  const textRef = useRef();
  const [copied, setCopied] = useState(false);

  // 🔹 helper to copy automatically
  const autoCopy = () => {
    if (textRef.current && textRef.current.value.trim()) {
      navigator.clipboard.writeText(textRef.current.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toUpperCase = () => {
    textRef.current.value = textRef.current.value.toUpperCase();
    autoCopy();
  };

  const toLowerCase = () => {
    textRef.current.value = textRef.current.value.toLowerCase();
    autoCopy();
  };

  const ACRONYM_MAP = new Map(acronyms.map((a) => [a.toUpperCase(), a]));

  const toTitleCase = () => {
    const el = textRef.current;

    el.value = el.value
      .trim()
      .replace(/\s*&\s*/g, " and ")
      .replace(/\s*-\s*/g, "-")
      .split(/\s+/)
      .map((word, index) => {
        const parts = word.split("-").map((part) => {
          const upper = part.toUpperCase();
          if (ACRONYM_MAP.has(upper)) return ACRONYM_MAP.get(upper);

          const smallWords = [
            "and","or","if","of","in","on","at","to","for","by","with","a","an"
          ];
          if (smallWords.includes(part.toLowerCase()) && index !== 0) {
            return part.toLowerCase();
          }

          let singular = part;
          if (/ies$/i.test(singular)) singular = singular.replace(/ies$/i, "y");
          else if (/ses$/i.test(singular)) singular = singular.replace(/ses$/i, "s");
          else if (/s$/i.test(singular) && singular.length > 3)
            singular = singular.replace(/s$/i, "");

          return singular.charAt(0).toUpperCase() + singular.slice(1).toLowerCase();
        });

        return parts.join("-");
      })
      .join(" ");

    autoCopy();
  };

  const toSentenceCase = () => {
    const el = textRef.current;
    el.value = el.value
      .toLowerCase()
      .replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
    autoCopy();
  };

  const toCapitalize = () => {
    const el = textRef.current;
    el.value = el.value.replace(/\b\w/g, (c) => c.toUpperCase());
    autoCopy();
  };

  const toInverse = () => {
    const el = textRef.current;
    el.value = el.value
      .split("")
      .map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()))
      .join("");
    autoCopy();
  };

  const clearText = () => {
    textRef.current.value = "";
    setCopied(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="relative bg-white shadow-2xl rounded-2xl p-6 w-full max-w-5xl min-h-[60vh] flex flex-col">
        <h1 className="text-lg font-semibold text-center mb-4 text-gray-700">
          📝 Smart Text Formatter
        </h1>

        {/* textarea */}
        <textarea
          ref={textRef}
          className="flex-1 w-full h-[300px] border rounded-xl p-4 text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none text-base"
          placeholder="Enter your text here..."
        />

        {/* copy status */}
        {copied && (
          <p className="text-green-600 text-sm text-center mt-2">
            ✅ Copied to clipboard
          </p>
        )}

        {/* action buttons */}
        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          <button onClick={toUpperCase} className="bg-blue-500 text-white px-3 py-1 text-xs rounded-lg shadow hover:bg-blue-600 opacity-40 hover:opacity-100">
            UPPERCASE
          </button>
          <button onClick={toLowerCase} className="bg-green-500 text-white px-3 py-1 text-xs rounded-lg shadow hover:bg-green-600 opacity-40 hover:opacity-100">
            lowercase
          </button>
          <button onClick={toTitleCase} className="bg-purple-700 text-white px-3 py-1 text-xs rounded-lg shadow hover:bg-purple-900 ">
            Title Case ⭐
          </button>
          <button onClick={toSentenceCase} className="bg-yellow-600 text-white px-3 py-1 text-xs rounded-lg shadow hover:bg-yellow-700 opacity-40 hover:opacity-100">
            Sentence Case
          </button>
          <button onClick={toCapitalize} className="bg-indigo-500 text-white px-3 py-1 text-xs rounded-lg shadow hover:bg-indigo-600 opacity-40 hover:opacity-100">
            Capitalize
          </button>
          <button onClick={toInverse} className="bg-pink-500 text-white px-3 py-1 text-xs rounded-lg shadow hover:bg-pink-600 opacity-40 hover:opacity-100">
            iNvErSe
          </button>
          <button onClick={clearText} className="bg-red-500 text-white px-3 py-1 text-xs rounded-lg shadow hover:bg-red-600 opacity-40 hover:opacity-100">
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
