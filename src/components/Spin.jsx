import React, { useRef, useState, useEffect } from "react";
import acronyms from "./data";
import { FaServer, FaTimes } from "react-icons/fa";

export default function TextFormatter() {
  const textRef = useRef();
  const [copied, setCopied] = useState(false);
  const [hasText, setHasText] = useState(false);
  const [bankActive, setBankActive] = useState(false);
  const [wordBank, setWordBank] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Undo/Redo refs
  const undoStack = useRef([]);
  const redoStack = useRef([]);
  const maxStack = 100;
  const isCtrlPressed = useRef(false);
  const lastSavedValue = useRef(""); // Track last saved value to avoid duplicates

  // Load word bank and bankActive from localStorage
  useEffect(() => {
    try {
      const savedWordBank = localStorage.getItem("caseConverter_wordBank");
      const savedBankActive = localStorage.getItem("caseConverter_bankActive");

      if (savedWordBank) setWordBank(JSON.parse(savedWordBank));
      if (savedBankActive) setBankActive(JSON.parse(savedBankActive));
    } catch (error) {}
    finally { setIsLoaded(true); }
  }, []);

  // Save word bank
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("caseConverter_wordBank", JSON.stringify(wordBank));
  }, [wordBank, isLoaded]);

  // Save bankActive
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("caseConverter_bankActive", JSON.stringify(bankActive));
  }, [bankActive, isLoaded]);

  const toggleBank = () => setBankActive(prev => !prev);

  // Handle text selection for auto adding to bank
  const handleTextSelect = () => {
    if (!bankActive) return;
    const selection = window.getSelection().toString().trim();
    if (selection && selection.length > 0 && !wordBank.includes(selection)) {
      setWordBank(prev => [...prev, selection]);
    }
  };

  const textInsert = (word) => {
    if (!bankActive) return;
    const currentText = textRef.current.value.trim();
    if (!currentText.split(/\s+/).includes(word)) {
      saveUndo();
      textRef.current.value = currentText ? currentText + " " + word : word;
      handleInputChange({ target: { value: textRef.current.value } });
    }
  };

  const removeWord = (word) => setWordBank(prev => prev.filter(w => w !== word));
  const clearBank = () => setWordBank([]);

  const autoCopy = () => {
    if (textRef.current && textRef.current.value.trim()) {
      navigator.clipboard.writeText(textRef.current.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setHasText(value.trim().length > 0);
    
    // Save undo state when user types (with debouncing to avoid too many saves)
    if (value !== lastSavedValue.current) {
      saveUndo();
      lastSavedValue.current = value;
    }
  };

  // Undo/Redo logic
  const saveUndo = () => {
    const value = textRef.current.value;
    
    // Only save if different from last undo state
    if (!undoStack.current.length || undoStack.current[undoStack.current.length - 1] !== value) {
      undoStack.current.push(value);
      if (undoStack.current.length > maxStack) undoStack.current.shift();
      redoStack.current = []; // Clear redo stack when new change is made
    }
  };

  const handleUndo = () => {
    if (undoStack.current.length > 1) {
      // Save current state to redo stack before undoing
      redoStack.current.push(textRef.current.value);
      
      // Remove current state and go to previous
      const current = undoStack.current.pop();
      const previous = undoStack.current[undoStack.current.length - 1];
      
      textRef.current.value = previous;
      lastSavedValue.current = previous;
      handleInputChange({ target: { value: previous } });
    } else if (undoStack.current.length === 1) {
      // If only one state left, clear the text
      redoStack.current.push(textRef.current.value);
      undoStack.current.pop();
      textRef.current.value = "";
      lastSavedValue.current = "";
      handleInputChange({ target: { value: "" } });
    }
  };

  const handleRedo = () => {
    if (redoStack.current.length) {
      const lastRedo = redoStack.current.pop();
      undoStack.current.push(lastRedo);
      textRef.current.value = lastRedo;
      lastSavedValue.current = lastRedo;
      handleInputChange({ target: { value: lastRedo } });
    }
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      isCtrlPressed.current = true;

      // Ctrl+Z or Cmd+Z for Undo
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }

      // Ctrl+Y or Ctrl+Shift+Z or Cmd+Shift+Z for Redo - FIXED THE SYNTAX ERROR HERE
      if ((e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
    }
  };

  const handleKeyUp = (e) => {
    if (!e.ctrlKey && !e.metaKey) {
      isCtrlPressed.current = false;
    }
  };

  // Initialize undo stack with empty value
  useEffect(() => {
    if (textRef.current) {
      undoStack.current.push(textRef.current.value);
      lastSavedValue.current = textRef.current.value;
    }
  }, []);

  // Text transformations
  const ACRONYM_MAP = new Map(acronyms.map(a => [a.toUpperCase(), a]));

  const toTitleCase = () => transformText(titleCaseTransform);
  const toUpperCase = () => transformText(val => val.toUpperCase());
  const toLowerCase = () => transformText(val => val.toLowerCase());
  const toSentenceCase = () => transformText(val => val.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase()));
  const toCapitalize = () => transformText(val => val.replace(/\b\w/g, c => c.toUpperCase()));
  const toInverse = () => transformText(val => val.split("").map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join(""));
  const clearText = () => { saveUndo(); textRef.current.value = ""; handleInputChange({ target: { value: "" } }); };

  const transformText = (fn) => {
    saveUndo();
    textRef.current.value = fn(textRef.current.value);
    handleInputChange({ target: { value: textRef.current.value } });
    autoCopy();
  };

  const titleCaseTransform = (str) => {
    const allowedSmallWords = new Set(["and", "or"]);
    const wordsToRemove = new Set(["a","an","as","at","but","by","for","if","in","nor","of","on","the","to","vs","via","with"]);
    const uncountable = new Set([
      "business","news","mathematics","physics","economics","success","analysis","progress","process","dynamics","pants",
      "sprorts","trousers","jeans","shorts","glasses","clothes","scissors","headquarters","series","species",
      "ethics","linguistics","politics","statistics","measles","diabetes","series","species","athletics","gymnastics",
      "analytics","barracks","headquarters","means","newsreels","premises","works","crossroads","outskirts","molasses",
      "clothes","jeans","shorts","trousers","pajamas","scales","tongs","pliers","spectacles","shears","scissors","physics",
      "politics","linguistics","economics","statistics","ethics","gymnastics","analytics","mathematics","diabetes","news",
      "physics","mathematics","physics","economics","analytics","robotics","genetics","optics","electronics","aerodynamics",
      "mechanics","dynamics","thermodynamics","semantics","phonetics","pragmatics","hydraulics","acoustics","aesthetics",
      "epidemiomics","cryogenics","microelectronics","nanotechnics","geophysics","biophysics","cybernetics","ergonomics",
      "kinematics","psycholinguistics","sociolinguistics","psychotics","econometrics","politics","analytics","mathematics",
      "physics","linguistics","statistics","genomics","metaphysics","neurogenetics","cannabis","semantics","pharmacogenomics",
      "electronics","mechanics","optics","economics","physics"
    ]);

    const capitalize = w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();

    return str
      .trim()
      .replace(/&/g, " and ")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s*-\s*/g, "-")
      .split(/\s+/)
      .filter(w => !wordsToRemove.has(w.toLowerCase()))
      .map((word, index) => {
        const parts = word.split("-").map(part => {
          const upper = part.toUpperCase();
          if (ACRONYM_MAP.has(upper)) return ACRONYM_MAP.get(upper);
          if (uncountable.has(part.toLowerCase())) return capitalize(part);

          let singular = part;
          if (part.toLowerCase().endsWith("ies") && part.length > 3) singular = part.slice(0, -3) + "y";
          else if (part.toLowerCase().endsWith("es") && part.length > 3) singular = part.slice(0, -2);
          else if (part.toLowerCase().endsWith("s") && part.length > 3) singular = part.slice(0, -1);

          if (allowedSmallWords.has(singular.toLowerCase()) && index !== 0)
            return singular.toLowerCase();
          return capitalize(singular);
        });
        return parts.join("-");
      })
      .join(" ");
  };

  const buttons = [
    { label: "UPPERCASE", color: "gray-500", onClick: toUpperCase },
    { label: "lowercase", color: "gray-500", onClick: toLowerCase },
    { label: "Title Case", color: "purple-800", onClick: toTitleCase },
    { label: "Sentence Case", color: "gray-500", onClick: toSentenceCase },
    { label: "Capitalize", color: "gray-500", onClick: toCapitalize },
    { label: "iNvErSe", color: "gray-500", onClick: toInverse },
    { label: "Clear", color: "red-600", onClick: clearText },
  ];

  return (
    <div
      className="min-h-screen flex flex-col items-center bg-[#e8ebee] p-4 sm:p-8"
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      tabIndex={0} // Make div focusable for key events
    >
      <div className="fixed top-6 right-6 z-20">
        <FaServer
          onClick={toggleBank}
          className={`text-2xl cursor-pointer transition-colors ${bankActive ? "text-green-500" : "text-gray-600"} hover:text-gray-800`}
        />
      </div>

      {bankActive && (
        <div className="w-full max-w-5xl mb-6 bg-blue-50 rounded-2xl p-4 border border-blue-200 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-blue-800">Word Bank</h3>
            {wordBank.length > 0 && (
              <button
                onClick={clearBank}
                className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 flex items-center gap-1"
              >
                <FaTimes size={10} />
                Clear All
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {wordBank.length > 0 ? (
              wordBank.map((word, idx) => (
                <div
                  key={idx}
                  className="group relative px-3 py-1 bg-white border border-blue-300 rounded-lg text-xs cursor-pointer hover:bg-blue-100 transition-colors"
                >
                  <span onClick={() => textInsert(word)} className="pr-2">{word}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeWord(word); }}
                    className="opacity-0 group-hover:opacity-100 absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] transition-opacity hover:bg-red-600"
                  >×</button>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400">Select text in the area below to add to bank</p>
            )}
          </div>
        </div>
      )}

      <div className="bg-[#e8ebee] shadow-xl rounded-3xl p-8 sm:p-10 md:p-12 w-full max-w-5xl min-h-[60vh] flex flex-col">
        <h1 className="text-xl sm:text-xl md:text-3xl font-bold text-center mb-6 text-gray-500 tracking-tight">Case Converter</h1>
        <div className="relative flex-1 w-full">
          <textarea
            ref={textRef}
            onMouseUp={handleTextSelect}
            onKeyUp={handleTextSelect}
            onChange={handleInputChange}
            className={`w-full h-[250px] border-none rounded-2xl p-4 text-gray-800 focus:outline-none resize-none text-base placeholder-gray-500 transition-shadow duration-500 ${hasText ? "shadow-[inset_5px_5px_12px_#cfd8e2,inset_-5px_-5px_12px_#f6f9ff]" : "shadow-[inset_5px_5px_12px_#c3c7ca,inset_-5px_-5px_12px_#ffffff]"}`}
            placeholder="Type your clean text here... Select any word to automatically add to bank when server is ON"
          />
          {copied && <div className="absolute top-2 right-2 bg-green-600 text-white px-3 py-1 text-xs rounded-lg shadow-md select-none">✅ Copied!</div>}
        </div>

        <div className="flex flex-wrap gap-3 mt-8 justify-center">
          {buttons.map((btn, idx) => (
            <button
              key={idx}
              onClick={btn.onClick}
              className={`relative bg-[#e8ebee] text-${btn.color} px-4 py-2 text-xs sm:text-sm md:text-sm font-semibold rounded-xl shadow-md`}
              style={{ boxShadow: "3px 3px 6px #c1c4c8, -3px -3px 6px #ffffff", cursor: "pointer" }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <p className="mt-10 text-center text-gray-500 text-xs sm:text-sm">Powered by Pc</p>
      </div>
    </div>
  );
}