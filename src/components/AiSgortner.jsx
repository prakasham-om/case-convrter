import { useState } from "react";
import axios from "axios";

export default function App() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const handleGenerate = async () => {
  try {
    const res = await axios.post("http://localhost:8080/api/generate", {
      userInput: input.trim(),   // <-- make sure no empty string
    });
    setOutput(res.data.output);
  } catch (err) {
    console.error(err);
    setOutput("Error generating text");
  }
};


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4">AI Tagline Generator</h1>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter your idea..."
        className="border rounded px-4 py-2 w-80 mb-4"
      />
      <button
        onClick={handleGenerate}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Generate
      </button>
      {output && (
        <p className="mt-6 text-lg font-semibold text-gray-800">
          {output}
        </p>
      )}
    </div>
  );
}
