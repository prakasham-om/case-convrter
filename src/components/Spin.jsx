import React, { useRef,useState } from "react";
import acronyms from "./data";

export default function TextFormatter() {
  const textRef = useRef();
  const [copied,setCopied]=useState(false);
  const toUpperCase = () => {
    textRef.current.value = textRef.current.value.toUpperCase();
  };

  const toLowerCase = () => {
    textRef.current.value = textRef.current.value.toLowerCase();
  };


// Build a canonical map from your acronyms array
const ACRONYM_MAP = new Map(acronyms.map(a => [a.toUpperCase(), a]));

const toTitleCase = () => {
  const el = textRef.current;

  el.value = el.value
    .trim()
    // 🔹 Replace "&" with "and"
    .replace(/\s*&\s*/g, " and ")
    // 🔹 Remove spaces around hyphens
    .replace(/\s*-\s*/g, "-")
    .split(/\s+/)
    .map((word, index) => {
      const parts = word.split("-").map((part, partIndex) => {
        const upper = part.toUpperCase();

        // ✅ Check for acronyms
        if (ACRONYM_MAP.has(upper)) {
          return ACRONYM_MAP.get(upper);
        }

        // ✅ Handle small words
        const smallWords = [
          "and", "or", "if", "of", "in", "on", "at", "to", "for", "by", "with", "a", "an"
        ];
        if (smallWords.includes(part.toLowerCase()) && index !== 0) {
          return part.toLowerCase();
        }

        // ✅ Singularize common plurals (basic rule: remove trailing 's' / 'es')
        let singular = part;
        if (/ies$/i.test(singular)) {
          singular = singular.replace(/ies$/i, "y"); // e.g., "Technologies" → "Technology"
        } else if (/ses$/i.test(singular)) {
          singular = singular.replace(/ses$/i, "s"); // e.g., "Processes" → "Process"
        } else if (/s$/i.test(singular) && singular.length > 3) {
          singular = singular.replace(/s$/i, ""); // e.g., "Solutions" → "Solution"
        }

        // ✅ Default Title Case
        return singular.charAt(0).toUpperCase() + singular.slice(1).toLowerCase();
      });

      return parts.join("-");
    })
    .join(" ");
};




  // ✅ Sentence Case
  const toSentenceCase = () => {
    const el = textRef.current;
    el.value = el.value
      .toLowerCase()
      .replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
  };

  // ✅ Capitalize Each Word
  const toCapitalize = () => {
    const el = textRef.current;
    el.value = el.value.replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // ✅ Inverse Case
  const toInverse = () => {
    const el = textRef.current;
    el.value = el.value
      .split("")
      .map((c) =>
        c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()
      )
      .join("");
  };

  // ✅ Clear
  const clearText = () => {
    textRef.current.value = "";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
  <div className="relative bg-white shadow-2xl rounded-2xl p-6 w-full max-w-5xl min-h-[60vh] flex flex-col">
    
    {/* Title */}
    <h1 className="text-lg font-semibold text-center mb-4 text-gray-700">
      📝 Smart Text Formatter
    </h1>

    {/* Copy Button → stick to top-right, responsive */}
    <button
      onClick={() => {
        if (textRef.current) {
          navigator.clipboard.writeText(textRef.current.value);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      }}
      className="absolute top-4 right-4 bg-teal-500 text-white px-3 py-1 text-xs rounded-lg shadow hover:bg-teal-600 transition"
    >
      {copied ? "Copied!" : "Copy 📋"}
    </button>

    {/* Textarea */}
    <textarea
      ref={textRef}
      className="flex-1 w-full h-[300px] border rounded-xl p-4 text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none text-base"
      placeholder="Enter your text here..."
    />

    {/* Buttons → wrap nicely on small devices */}
    <div className="flex flex-wrap gap-2 mt-4 justify-center">
      <button onClick={toUpperCase} className="bg-blue-500 text-white px-3 py-1 text-xs rounded-lg shadow hover:bg-blue-600 opacity-40 hover:opacity-90">
        UPPERCASE
      </button>
      <button onClick={toLowerCase} className="bg-green-500 text-white px-3 py-1 text-xs rounded-lg shadow hover:bg-green-600 opacity-40 hover:opacity-90">
        lowercase
      </button>
      <button onClick={toTitleCase} className="bg-purple-700 text-white px-3 py-1 text-xs rounded-lg shadow hover:bg-purple-900 ">
        Title Case ⭐
      </button>
      <button onClick={toSentenceCase} className="bg-yellow-600 text-white px-3 py-1 text-xs rounded-lg shadow hover:bg-yellow-700 opacity-40 hover:opacity-90">
        Sentence Case
      </button>
      <button onClick={toCapitalize} className="bg-indigo-500 text-white px-3 py-1 text-xs rounded-lg shadow hover:bg-indigo-600 opacity-40 hover:opacity-90">
        Capitalize
      </button>
      <button onClick={toInverse} className="bg-pink-500 text-white px-3 py-1 text-xs rounded-lg shadow hover:bg-pink-600 opacity-40 hover:opacity-90">
        iNvErSe
      </button>
      <button onClick={clearText} className="bg-red-500 text-white px-3 py-1 text-xs rounded-lg shadow hover:bg-red-600 opacity-40 hover:opacity-90">
        Clear
      </button>
    </div>
  </div>
</div>

  );
}
