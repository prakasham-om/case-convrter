import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import acronyms from "./data";
import { FaServer, FaTimes } from "react-icons/fa";

// Move static data outside component to prevent recreation
const STATIC_SETS = {
  UNCOUNTABLE: new Set([
    "business", "news", "mathematics", "physics", "economics", "success", "analysis", 
    "progress", "process", "dynamics", "pants", "sprorts", "trousers", "jeans", 
    "shorts", "glasses", "clothes", "scissors", "headquarters", "series", "species",
    "ethics", "linguistics", "politics", "statistics", "measles", "diabetes", 
    "athletics", "gymnastics", "analytics", "barracks", "means", "newsreels", 
    "premises", "works", "crossroads", "outskirts", "molasses", "pajamas", "scales", 
    "tongs", "pliers", "spectacles", "shears", "robotics", "genetics", "optics", 
    "electronics", "aerodynamics", "mechanics", "thermodynamics", "semantics", 
    "phonetics", "pragmatics", "hydraulics", "acoustics", "aesthetics", "epidemiomics", 
    "cryogenics", "microelectronics", "nanotechnics", "geophysics", "biophysics", 
    "cybernetics", "ergonomics", "kinematics", "psycholinguistics", "sociolinguistics", 
    "psychotics", "econometrics", "genomics", "metaphysics", "neurogenetics", "cannabis", 
    "pharmacogenomics"
  ]),
  WORDS_TO_REMOVE: new Set([
    "a", "an", "as", "at", "but", "by", "for", "if", "in", "nor", "of", "on", 
    "the", "to", "vs", "via", "with"
  ]),
  ALLOWED_SMALL_WORDS: new Set(["and", "or"])
};

const ACRONYM_MAP = new Map(acronyms.map(a => [a.toUpperCase(), a]));

// Memoized button component to prevent re-renders
const MemoizedButton = React.memo(({ label, color, onClick }) => (
  <button
    onClick={onClick}
    className={`relative bg-[#e8ebee] text-${color} px-4 py-2 text-xs sm:text-sm md:text-sm font-semibold rounded-xl shadow-md`}
    style={{ boxShadow: "3px 3px 6px #c1c4c8, -3px -3px 6px #ffffff", cursor: "pointer" }}
  >
    {label}
  </button>
));

// Memoized word bank item component
const WordBankItem = React.memo(({ word, onInsert, onRemove }) => (
  <div className="group relative px-3 py-1 bg-white border border-blue-300 rounded-lg text-xs cursor-pointer hover:bg-blue-100 transition-colors">
    <span onClick={() => onInsert(word)} className="pr-2">{word}</span>
    <button
      onClick={(e) => { e.stopPropagation(); onRemove(word); }}
      className="opacity-0 group-hover:opacity-100 absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] transition-opacity hover:bg-red-600"
    >×</button>
  </div>
));

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
  const lastSavedValue = useRef("");

  // Load initial data
  useEffect(() => {
    try {
      const savedWordBank = localStorage.getItem("caseConverter_wordBank");
      const savedBankActive = localStorage.getItem("caseConverter_bankActive");

      if (savedWordBank) setWordBank(JSON.parse(savedWordBank));
      if (savedBankActive) setBankActive(JSON.parse(savedBankActive));
    } catch (error) {
      console.error("Error loading from localStorage:", error);
    } finally { 
      setIsLoaded(true); 
    }
  }, []);

  // Save to localStorage - combined into one effect
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("caseConverter_wordBank", JSON.stringify(wordBank));
    localStorage.setItem("caseConverter_bankActive", JSON.stringify(bankActive));
  }, [wordBank, bankActive, isLoaded]);

  // Memoized callbacks
  const toggleBank = useCallback(() => setBankActive(prev => !prev), []);

  const handleTextSelect = useCallback(() => {
    if (!bankActive) return;
    const selection = window.getSelection().toString().trim();
    if (selection && selection.length > 0) {
      setWordBank(prev => 
        prev.includes(selection) ? prev : [...prev, selection]
      );
    }
  }, [bankActive]);

  // Undo/Redo logic - FIXED VERSION
  const saveUndo = useCallback((value = null) => {
    const currentValue = value !== null ? value : textRef.current.value;
    
    if (!undoStack.current.length || undoStack.current[undoStack.current.length - 1] !== currentValue) {
      undoStack.current.push(currentValue);
      if (undoStack.current.length > maxStack) undoStack.current.shift();
      redoStack.current = [];
      lastSavedValue.current = currentValue;
    }
  }, []);

  const handleUndo = useCallback(() => {
    if (undoStack.current.length > 1) {
      const currentValue = textRef.current.value;
      // Save current state to redo stack before undoing
      redoStack.current.push(currentValue);
      
      // Remove current state and go to previous
      undoStack.current.pop(); // Remove current
      const previous = undoStack.current[undoStack.current.length - 1];
      
      textRef.current.value = previous;
      lastSavedValue.current = previous;
      setHasText(previous.trim().length > 0);
    } else if (undoStack.current.length === 1) {
      // If only one state left, clear the text
      const currentValue = textRef.current.value;
      redoStack.current.push(currentValue);
      undoStack.current.pop();
      textRef.current.value = "";
      lastSavedValue.current = "";
      setHasText(false);
    }
  }, []);

  const handleRedo = useCallback(() => {
    if (redoStack.current.length > 0) {
      const currentValue = textRef.current.value;
      const lastRedo = redoStack.current.pop();
      
      // Save current state to undo stack
      undoStack.current.push(currentValue);
      if (undoStack.current.length > maxStack) undoStack.current.shift();
      
      textRef.current.value = lastRedo;
      lastSavedValue.current = lastRedo;
      setHasText(lastRedo.trim().length > 0);
    }
  }, []);

  const textInsert = useCallback((word) => {
    if (!bankActive) return;
    const currentText = textRef.current.value.trim();
    if (!currentText.split(/\s+/).includes(word)) {
      const newValue = currentText ? currentText + " " + word : word;
      saveUndo(newValue);
      textRef.current.value = newValue;
      setHasText(newValue.trim().length > 0);
    }
  }, [bankActive, saveUndo]);

  const removeWord = useCallback((word) => 
    setWordBank(prev => prev.filter(w => w !== word)), []);

  const clearBank = useCallback(() => setWordBank([]), []);

  const autoCopy = useCallback(() => {
    if (textRef.current && textRef.current.value.trim()) {
      navigator.clipboard.writeText(textRef.current.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setHasText(value.trim().length > 0);
    
    // Use setTimeout to ensure we capture the final value after typing
    setTimeout(() => {
      if (textRef.current && textRef.current.value !== lastSavedValue.current) {
        saveUndo();
      }
    }, 0);
  }, [saveUndo]);

  const handleKeyDown = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      isCtrlPressed.current = true;

      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }

      if ((e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
    }
  }, [handleUndo, handleRedo]);

  const handleKeyUp = useCallback((e) => {
    if (!e.ctrlKey && !e.metaKey) {
      isCtrlPressed.current = false;
    }
  }, []);

  // Initialize undo stack with empty value
  useEffect(() => {
    if (textRef.current) {
      const initialValue = textRef.current.value;
      undoStack.current.push(initialValue);
      lastSavedValue.current = initialValue;
    }
  }, []);

  // Memoized text transformations
  const titleCaseTransform = useCallback((str) => {
    const { UNCOUNTABLE, WORDS_TO_REMOVE, ALLOWED_SMALL_WORDS } = STATIC_SETS;

    const capitalize = w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();

    return str
      .trim()
      .replace(/&/g, " and ")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s*-\s*/g, "-")
      .split(/\s+/)
      .filter(w => !WORDS_TO_REMOVE.has(w.toLowerCase()))
      .map((word, index) => {
        const parts = word.split("-").map(part => {
          const upper = part.toUpperCase();
          if (ACRONYM_MAP.has(upper)) return ACRONYM_MAP.get(upper);
          if (UNCOUNTABLE.has(part.toLowerCase())) return capitalize(part);

           let singular = part;
           if (part.toLowerCase().endsWith("ies") && part.length > 3) singular = part.slice(0, -3) + "y";
          // else if (part.toLowerCase().endsWith("es") && part.length > 3) singular = part.slice(0, -2);
          // else if (part.toLowerCase().endsWith("s") && part.length > 3) singular = part.slice(0, -1);

          if (ALLOWED_SMALL_WORDS.has(singular.toLowerCase()) && index !== 0)
            return singular.toLowerCase();
          return capitalize(singular);
        });
        return parts.join("-");
      })
      .join(" ");
  }, []);

  // Fixed transformation functions - save undo state properly
  const transformText = useCallback((fn) => {
    const currentValue = textRef.current.value;
    const newValue = fn(currentValue);
    
    // Save the state BEFORE transformation for undo
    saveUndo(currentValue);
    
    // Apply transformation
    textRef.current.value = newValue;
    setHasText(newValue.trim().length > 0);
    lastSavedValue.current = newValue;
    
    autoCopy();
  }, [saveUndo, autoCopy]);

  // Memoized transformation functions
  const toTitleCase = useCallback(() => transformText(titleCaseTransform), [transformText, titleCaseTransform]);
  const toUpperCase = useCallback(() => transformText(val => val.toUpperCase()), [transformText]);
  const toLowerCase = useCallback(() => transformText(val => val.toLowerCase()), [transformText]);
  const toSentenceCase = useCallback(() => transformText(val => val.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase())), [transformText]);
  const toCapitalize = useCallback(() => transformText(val => val.replace(/\b\w/g, c => c.toUpperCase())), [transformText]);
  const toInverse = useCallback(() => transformText(val => val.split("").map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join("")), [transformText]);
  
  const clearText = useCallback(() => { 
    const currentValue = textRef.current.value;
    saveUndo(currentValue);
    textRef.current.value = ""; 
    setHasText(false);
    lastSavedValue.current = "";
  }, [saveUndo]);

  // Memoized buttons array
  const buttons = useMemo(() => [
    { label: "UPPERCASE", color: "gray-500", onClick: toUpperCase },
    { label: "lowercase", color: "gray-500", onClick: toLowerCase },
    { label: "Title Case", color: "purple-800", onClick: toTitleCase },
    { label: "Sentence Case", color: "gray-500", onClick: toSentenceCase },
    { label: "Capitalize", color: "gray-500", onClick: toCapitalize },
    { label: "iNvErSe", color: "gray-500", onClick: toInverse },
    { label: "Clear", color: "red-600", onClick: clearText },
  ], [toUpperCase, toLowerCase, toTitleCase, toSentenceCase, toCapitalize, toInverse, clearText]);

  // Memoized word bank items
  const wordBankItems = useMemo(() => 
    wordBank.map((word, idx) => (
      <WordBankItem
        key={`${word}-${idx}`}
        word={word}
        onInsert={textInsert}
        onRemove={removeWord}
      />
    )), [wordBank, textInsert, removeWord]
  );

  return (
    <div
      className="min-h-screen flex flex-col items-center bg-[#e8ebee] p-4 sm:p-8"
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      tabIndex={0}
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
              wordBankItems
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
            <MemoizedButton
              key={idx}
              label={btn.label}
              color={btn.color}
              onClick={btn.onClick}
            />
          ))}
        </div>

        <p className="mt-10 text-center text-gray-500 text-xs sm:text-sm">Powered by Siva</p>
      </div>
    </div>
  );
}
