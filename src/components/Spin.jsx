import React, { useRef, useState } from "react";
import acronyms from "./data";

export default function TextFormatter() {
  const textRef = useRef();
  const [copied, setCopied] = useState(false);

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
    const allowedSmallWords = new Set(["and", "or"]);
    const wordsToRemove = new Set([
      "a","an","as","at","but","by","for","if","in","nor",
      "of","on","the","to","vs","via","with"
    ]);
    const uncountable = new Set([
      "business","news","mathematics","physics","economics",
      "ethics","linguistics","politics","statistics","measles",
      "diabetes","series","species","athletics","gymnastics",
      "molasses","crossroads","headquarters","means","newsreels",
      "shears","premises","scissors","outskirts","works","data","cannabis"
    ]);
    const capitalize = (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();

    el.value = el.value
      .trim()
      .replace(/[^\w\s-]/g,"")
      .replace(/\s*&\s*/g," and ")
      .replace(/\s*-\s*/g,"-")
      .split(/\s+/)
      .filter(w => !wordsToRemove.has(w.toLowerCase()))
      .map((word,index)=>{
        const parts = word.split("-").map((part)=>{
          const upper = part.toUpperCase();
          if(ACRONYM_MAP.has(upper)) return ACRONYM_MAP.get(upper);
          if(uncountable.has(part.toLowerCase())) return capitalize(part);
          let singular = part;
          if(part.length>3 && part.endsWith("s")) singular=part.slice(0,-1);
          if(allowedSmallWords.has(singular.toLowerCase()) && index!==0)
            return singular.toLowerCase();
          return capitalize(singular);
        });
        return parts.join("-");
      })
      .join(" ");
    autoCopy();
  };

  const toSentenceCase = () => {
    const el = textRef.current;
    el.value = el.value.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g,c=>c.toUpperCase());
    autoCopy();
  };

  const toCapitalize = () => {
    const el = textRef.current;
    el.value = el.value.replace(/\b\w/g,c=>c.toUpperCase());
    autoCopy();
  };

  const toInverse = () => {
    const el = textRef.current;
    el.value = el.value.split("").map(c=>c===c.toUpperCase()?c.toLowerCase():c.toUpperCase()).join("");
    autoCopy();
  };

  const clearText = () => {
    textRef.current.value = "";
    setCopied(false);
  };

  const buttons = [
    { label: "UPPERCASE", color: "blue", onClick: toUpperCase },
    { label: "lowercase", color: "green", onClick: toLowerCase },
    { label: "Title Case ⭐", color: "purple", onClick: toTitleCase },
    { label: "Sentence Case", color: "yellow", onClick: toSentenceCase },
    { label: "Capitalize", color: "indigo", onClick: toCapitalize },
    { label: "iNvErSe", color: "pink", onClick: toInverse },
    { label: "Clear", color: "red", onClick: clearText },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-gray-200 p-4 sm:p-8 overflow-hidden">
      {/* Background medical shadows */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-[url('/medical-shadow.svg')] bg-no-repeat bg-center bg-cover opacity-10"></div>
      </div>

      {/* Neumorphic Card */}
      <div className="relative z-10 bg-gray-200 shadow-xl rounded-3xl p-8 sm:p-10 md:p-12 w-full max-w-5xl min-h-[60vh] flex flex-col">
        {/* Title */}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-6 text-gray-700 tracking-tight">
          Text Formatter
        </h1>

        {/* Textarea wrapper with relative for notification */}
        <div className="relative flex-1 w-full">
          <textarea
            ref={textRef}
            className="w-full h-[250px] bg-gray-200 border-none rounded-2xl p-4 text-gray-800 focus:outline-none resize-none text-base placeholder-gray-500"
            placeholder="Type your clean text here..."
            style={{ boxShadow: "inset 5px 5px 10px #bebebe, inset -5px -5px 10px #ffffff" }}
          />

          {/* Copied notification inside textarea wrapper */}
          {copied && (
            <div className="absolute top-2 right-2 bg-green-600 text-white px-3 py-1 text-xs rounded-lg shadow-md select-none">
              ✅ Copied!
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-3 mt-8 justify-center">
          {buttons.map((btn, idx) => {
            const isActive = btn.label === "Title Case ⭐";
            return (
              <button
                key={idx}
                onClick={btn.onClick}
                className={`bg-gray-200 text-${btn.color}-600 px-4 py-2 text-xs sm:text-sm md:text-sm font-semibold rounded-xl shadow-md`}
                style={{
                  boxShadow: "3px 3px 6px #b8b8b8, -3px -3px 6px #ffffff",
                  opacity: isActive ? 1 : 0.3,
                  cursor: "pointer",
                }}
              >
                {btn.label}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <p className="mt-10 text-center text-gray-500 text-xs sm:text-sm">
          Powered by Pc
        </p>
      </div>
    </div>
  );
}
