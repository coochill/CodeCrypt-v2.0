// src/components/AITutorWidget.jsx
import { useState } from "react";
import { FaRobot } from "react-icons/fa";
import { toolsFaq } from "../data/aiTutorData";

function AITutorWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hi! I’m the CodeCrypt AI Tutor. Choose a tool and a question, and I’ll explain how it works.",
    },
  ]);
  const [selectedToolId, setSelectedToolId] = useState("caesar"); // default

  const selectedTool =
    toolsFaq.find((t) => t.id === selectedToolId) || toolsFaq[0];

  const handleQuestionClick = (q) => {
    // Add user question + bot answer as chat bubbles
    setMessages((prev) => [
      ...prev,
      { from: "user", text: q.label },
      { from: "bot", text: q.answer },
    ]);
  };

  const handleToolChange = (event) => {
    const newId = event.target.value;
    setSelectedToolId(newId);
    const tool = toolsFaq.find((t) => t.id === newId);

    if (tool) {
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: `You selected ${tool.name}. Choose a question below to learn how it works.`,
        },
      ]);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        from: "bot",
        text: "Chat cleared. Choose a tool and question to start again.",
      },
    ]);
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-40 group">
        <button
          onClick={() => setIsOpen((o) => !o)}
          className="rounded-full shadow-lg p-4 text-white bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition"
        >
          <FaRobot className="w-6 h-6" />
        </button>

      {/* Tooltip */}
        <span className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
          {isOpen ? "Close Tutor" : "Open AI Tutor"}
        </span>
      </div>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-40 w-80 max-h-[75vh] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold flex items-center justify-between">
            <span>CodeCrypt AI Tutor</span>
            <button
              onClick={handleClear}
              className="text-xs underline text-blue-100 hover:text-white"
            >
              Clear
            </button>
          </div>

          {/* Tool selector */}
          <div className="px-3 py-2 border-b border-gray-200 bg-gray-50 text-xs">
            <label className="block mb-1 font-semibold text-gray-700">
              Tool you want to learn:
            </label>
            <select
              value={selectedToolId}
              onChange={handleToolChange}
              className="w-full border rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {toolsFaq.map((tool) => (
                <option key={tool.id} value={tool.id}>
                  {tool.name}
                </option>
              ))}
            </select>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${
                  m.from === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-3 py-2 rounded-lg max-w-[80%] whitespace-pre-wrap ${
                    m.from === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Suggested questions */}
          <div className="border-t border-gray-200 p-2 bg-gray-50">
            <div className="text-xs font-semibold text-gray-700 mb-1">
              Quick questions for {selectedTool.name}:
            </div>
            <div className="flex flex-wrap gap-1">
              {selectedTool.questions.map((q) => (
                <button
                  key={q.id}
                  onClick={() => handleQuestionClick(q)}
                  className="text-xs border border-blue-500 text-blue-600 rounded-full px-3 py-1 hover:bg-blue-50"
                >
                  {q.label}
                </button>
              ))}
              {selectedTool.questions.length === 0 && (
                <span className="text-xs text-gray-500">
                  No questions defined yet.
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AITutorWidget;
