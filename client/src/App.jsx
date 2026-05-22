import { useState } from "react";
import axios from "axios";

function App() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);

  const analyze = async () => {
    try {
      const res = await axios.post("http://localhost:5000/analyze", {
        text,
      });

      // handle both cases (nested or clean backend)
      setResult(res.data.result ? res.data.result : res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // Highlight function
  const highlightText = (text, highlights) => {
    if (!highlights) return text;

    let highlighted = text;

    highlights.forEach((word) => {
      const safeWord = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // escape regex
      const regex = new RegExp(`(${safeWord})`, "gi");

      highlighted = highlighted.replace(
        regex,
        `<span style="background-color:red;color:white;padding:2px;border-radius:4px;">$1</span>`
      );
    });

    return highlighted;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-6">AI Scam Detector</h1>

      <textarea
        className="w-full max-w-xl p-4 text-white  rounded mb-4"
        rows="4"
        placeholder="Paste message here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button
        onClick={analyze}
        className="bg-red-500 px-6 py-2 rounded hover:bg-red-600"
      >
        Analyze
      </button>

      {result && (
        <>
          {/* RESULT BOX */}
          <div
            className={`mt-6 p-4 rounded w-full max-w-xl ${
              result.label === "High Risk"
                ? "bg-red-700"
                : result.label === "Medium Risk"
                ? "bg-yellow-600"
                : "bg-green-700"
            }`}
          >
            <p className="text-lg font-bold">{result.label}</p>
            <p>Score: {result.score}%</p>

            {/* PROGRESS BAR */}
            <div className="w-full bg-gray-700 h-3 rounded mt-3">
              <div
                className={`h-3 rounded ${
                  result.label === "High Risk"
                    ? "bg-red-500"
                    : result.label === "Medium Risk"
                    ? "bg-yellow-400"
                    : "bg-green-500"
                }`}
                style={{ width: `${result.score}%` }}
              ></div>
            </div>

            {/* REASONS */}
            <div className="mt-3">
              <strong>Reasons:</strong>
              <ul className="list-disc ml-5">
                {result.reasons?.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>

            {/* SIGNALS */}
            <div className="mt-2">
              <strong>Detected Signals:</strong>
              <div className="flex gap-2 mt-1 flex-wrap">
                {result.highlights?.map((h, i) => (
                  <span
                    key={i}
                    className="bg-black px-2 py-1 rounded text-sm"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>

            {/* URLS */}
            {result.urls && result.urls.length > 0 && (
              <div className="mt-2">
                <strong>Detected Links:</strong>
                <ul className="ml-5 list-disc">
                  {result.urls.map((url, i) => (
                    <li key={i} className="text-blue-300">
                      {url}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* HIGHLIGHTED MESSAGE */}
          <div className="mt-4 bg-gray-800 p-4 rounded w-full max-w-xl">
            <strong>Analyzed Message:</strong>
            <p
              className="mt-2"
              dangerouslySetInnerHTML={{
                __html: highlightText(text, result.highlights),
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default App;