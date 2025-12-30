"use client";

import { motion } from "framer-motion";
import { HelpCircle, MessageCircle, Mail, Github, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const faqs = [
  {
    question: "How do I create a new project?",
    answer:
      "Navigate to the Dashboard and click the 'New Project' button. Enter a name and description, then start adding sub-projects like Tables, Diagrams, or Documents.",
  },
  {
    question: "What is the difference between 'Templates' and 'System Templates'?",
    answer:
      "'Templates' in the main navigation are your personal, custom-saved LaTeX preambles. 'System Templates' under Resources are pre-made templates provided by TizKit that you can copy and use.",
  },
  {
    question: "How does Image-to-LaTeX work?",
    answer:
      "Upload an image containing text or mathematical formulas. Our AI (powered by Google Gemini Vision) will analyze the image and extract the content as LaTeX code.",
  },
  {
    question: "Can I export my work as a PDF?",
    answer:
      "Yes! In any sub-project editor, click the 'Export' button. You can choose between PDF and PNG formats. The LaTeX code is compiled using the Tectonic engine.",
  },
  {
    question: "How do I save my work?",
    answer:
      "TizKit auto-saves your work every few seconds. You can also manually save by pressing Ctrl+S (Cmd+S on Mac).",
  },
  {
    question: "What LaTeX packages are supported?",
    answer:
      "TizKit uses the Tectonic LaTeX distribution, which supports all standard packages including amsmath, tikz, graphicx, booktabs, xcolor, and many more.",
  },
];

export default function HelpCenterPage() {
  const router = useRouter();

  return (
    <div className="p-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Help Center</h1>
        <p className="text-gray-600 mt-2">
          Find answers to common questions or get in touch with our support team.
        </p>
      </motion.div>

      {/* FAQs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-10"
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white border border-gray-200 rounded-lg p-5"
            >
              <div className="flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-[#FA5F55] mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-sm text-gray-600">{faq.answer}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Contact Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-10"
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
          Contact Support
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="mailto:support@tizkit.com"
            className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-[#FA5F55]/50 transition-all"
          >
            <div className="p-2 bg-[#FA5F55]/10 rounded-lg">
              <Mail className="w-5 h-5 text-[#FA5F55]" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Email Us</h3>
              <p className="text-xs text-gray-500">support@tizkit.com</p>
            </div>
          </a>

          <a
            href="https://github.com/Mehedi26696/Latex-Helper---Tizkit/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-400 transition-all"
          >
            <div className="p-2 bg-gray-100 rounded-lg">
              <Github className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">GitHub Issues</h3>
              <p className="text-xs text-gray-500">Report bugs & features</p>
            </div>
          </a>

          <a
            href="#"
            className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-500/50 transition-all"
          >
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Community</h3>
              <p className="text-xs text-gray-500">Join our Discord</p>
            </div>
          </a>
        </div>
      </motion.div>
    </div>
  );
}
