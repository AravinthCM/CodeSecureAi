import React, { useState } from "react";
import { Shield, Code, Server, Zap } from "lucide-react";

export default function HomePage() {
  const [selectedType, setSelectedType] = useState(null);
  const [code, setCode] = useState("");

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setCode("");
  };

  const handleAnalyze = () => {
    if (code.trim()) {
      alert("Analyzing your code... This would connect to your AI backend!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      {/* Playful geometric characters in background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-600 rounded-full opacity-20"></div>
        <div
          className="absolute bottom-20 right-20 w-48 h-48 bg-yellow-400 opacity-20"
          style={{ clipPath: "circle(50% at 50% 50%)" }}
        ></div>
        <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-orange-500 opacity-20 transform rotate-45"></div>
      </div>

      <div className="relative w-full max-w-4xl">
        {/* Header with playful design */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Shield className="w-20 h-20 text-purple-600" strokeWidth={2} />
              <Code className="w-10 h-10 text-blue-600 absolute -bottom-2 -right-2" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-800 mb-3">
            Code Secure AI
          </h1>
          <p className="text-xl text-gray-600">
            Transform your code into secure, optimized perfection ✨
          </p>
        </div>

        {/* Main card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Code type selection */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              What type of code are you working with?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Frontend Card */}
              <button
                onClick={() => handleTypeSelect("frontend")}
                className={`p-6 rounded-2xl border-3 transition-all duration-300 transform hover:scale-105 ${
                  selectedType === "frontend"
                    ? "bg-purple-600 border-purple-600 text-white shadow-lg"
                    : "bg-white border-gray-200 text-gray-700 hover:border-purple-400"
                }`}
              >
                <div className="flex flex-col items-center space-y-3">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      selectedType === "frontend"
                        ? "bg-purple-700"
                        : "bg-purple-100"
                    }`}
                  >
                    <Code
                      className={
                        selectedType === "frontend"
                          ? "text-white"
                          : "text-purple-600"
                      }
                      size={32}
                    />
                  </div>
                  <span className="font-bold text-lg">Frontend</span>
                  <span className="text-sm opacity-80">
                    React, Vue, HTML/CSS
                  </span>
                </div>
              </button>

              {/* Backend Card */}
              <button
                onClick={() => handleTypeSelect("backend")}
                className={`p-6 rounded-2xl border-3 transition-all duration-300 transform hover:scale-105 ${
                  selectedType === "backend"
                    ? "bg-yellow-400 border-yellow-400 text-gray-900 shadow-lg"
                    : "bg-white border-gray-200 text-gray-700 hover:border-yellow-400"
                }`}
              >
                <div className="flex flex-col items-center space-y-3">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      selectedType === "backend"
                        ? "bg-yellow-500"
                        : "bg-yellow-100"
                    }`}
                  >
                    <Server
                      className={
                        selectedType === "backend"
                          ? "text-gray-900"
                          : "text-yellow-600"
                      }
                      size={32}
                    />
                  </div>
                  <span className="font-bold text-lg">Backend</span>
                  <span className="text-sm opacity-80">
                    Node.js, Python, Java
                  </span>
                </div>
              </button>

              {/* Fullstack Card */}
              <button
                onClick={() => handleTypeSelect("fullstack")}
                className={`p-6 rounded-2xl border-3 transition-all duration-300 transform hover:scale-105 ${
                  selectedType === "fullstack"
                    ? "bg-gradient-to-br from-purple-600 to-orange-500 border-orange-500 text-white shadow-lg"
                    : "bg-white border-gray-200 text-gray-700 hover:border-orange-400"
                }`}
              >
                <div className="flex flex-col items-center space-y-3">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      selectedType === "fullstack"
                        ? "bg-orange-600"
                        : "bg-orange-100"
                    }`}
                  >
                    <Zap
                      className={
                        selectedType === "fullstack"
                          ? "text-white"
                          : "text-orange-600"
                      }
                      size={32}
                    />
                  </div>
                  <span className="font-bold text-lg">Full Stack</span>
                  <span className="text-sm opacity-80">
                    Complete Application
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Code input area */}
          <div
            className={`transition-all duration-500 ${
              selectedType ? "opacity-100" : "opacity-40 pointer-events-none"
            }`}
          >
            <label className="block text-lg font-semibold text-gray-800 mb-3">
              Paste your code here
            </label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={!selectedType}
              placeholder={
                selectedType
                  ? "Paste your code and let AI secure it..."
                  : "Select a code type first..."
              }
              className="w-full h-64 p-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 focus:border-purple-500 font-mono text-sm resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
            />

            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {selectedType && (
                  <span className="inline-flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span>Ready to analyze {selectedType} code</span>
                  </span>
                )}
              </div>

              <button
                onClick={handleAnalyze}
                disabled={!selectedType || !code.trim()}
                className={`px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                  selectedType && code.trim()
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg hover:shadow-xl"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <span className="flex items-center space-x-2">
                  <Shield size={20} />
                  <span>Analyze & Secure</span>
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-white/80 backdrop-blur rounded-2xl p-4">
            <div className="text-3xl mb-2">🔒</div>
            <div className="font-semibold text-gray-800">Security First</div>
          </div>
          <div className="bg-white/80 backdrop-blur rounded-2xl p-4">
            <div className="text-3xl mb-2">⚡</div>
            <div className="font-semibold text-gray-800">Performance Boost</div>
          </div>
          <div className="bg-white/80 backdrop-blur rounded-2xl p-4">
            <div className="text-3xl mb-2">💡</div>
            <div className="font-semibold text-gray-800">Smart Suggestions</div>
          </div>
        </div>
      </div>
    </div>
  );
}
