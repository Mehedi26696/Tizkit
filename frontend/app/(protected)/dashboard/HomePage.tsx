import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLinkIcon } from 'lucide-react';

interface HomePageProps {
  onNavigateToEditor: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigateToEditor }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/70 backdrop-blur-xl border-b border-gray-100 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent font-aloevera">
                  Tizkit
                </h1>
                <p className="text-xs text-gray-500 font-aloevera">LaTeX Made Visual</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="default"
                onClick={onNavigateToEditor}
                className="shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 flex items-center gap-2"
              >
                <ExternalLinkIcon className="w-4 h-4" /> Launch Editor
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-2 mb-8">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-blue-700 font-aloevera">AI-Powered LaTeX Platform</span>
            </div>
            
            <h2 className="text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight font-aloevera">
              Create Beautiful
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                LaTeX Documents
              </span>
            </h2>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-aloevera mb-10">
              Transform your ideas into professional LaTeX documents. Build tables, design diagrams, 
              and convert images with our intelligent visual editor—no LaTeX expertise required.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                variant="default"
                size="lg"
                onClick={onNavigateToEditor}
                rightIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                }
                className="shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/60 transform hover:scale-105 transition-all duration-300"
              >
                Get Started Free
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white hover:bg-gray-50 border-2 border-gray-200"
              >
                Learn More
              </Button>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
            {/* Table Editor Card */}
            <Card 
              variant="glass" 
              padding="lg" 
              className="group hover:shadow-2xl hover:scale-105 transition-all duration-500 cursor-pointer bg-gradient-to-br from-white to-blue-50/30 border-2 border-blue-100/50"
            >
              <a href="/features/table" className="block">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition duration-500"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-500">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 font-aloevera group-hover:text-blue-600 transition duration-300">
                  Table Editor
                </h3>
                <p className="text-gray-600 mb-6 font-aloevera leading-relaxed">
                  Design stunning data tables with our intuitive visual interface. Customize styling, 
                  formatting, and export to perfect LaTeX code instantly.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="shadow-sm">Visual Editor</Badge>
                  <Badge variant="secondary" className="shadow-sm">LaTeX Export</Badge>
                  <Badge variant="secondary" className="shadow-sm">Responsive</Badge>
                </div>
              </a>
            </Card>

            {/* Diagram Editor Card */}
            <Card 
              variant="glass" 
              padding="lg" 
              className="group hover:shadow-2xl hover:scale-105 transition-all duration-500 cursor-pointer bg-gradient-to-br from-white to-purple-50/30 border-2 border-purple-100/50"
            >
              <a href="/features/diagram" className="block">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition duration-500"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-500">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 font-aloevera group-hover:text-purple-600 transition duration-300">
                  Diagram Editor
                </h3>
                <p className="text-gray-600 mb-6 font-aloevera leading-relaxed">
                  Create professional TikZ diagrams, flowcharts, and technical illustrations 
                  with drag-and-drop simplicity. Export clean, publication-ready LaTeX.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="shadow-sm">TikZ Powered</Badge>
                  <Badge variant="secondary" className="shadow-sm">Flowcharts</Badge>
                  <Badge variant="secondary" className="shadow-sm">Diagrams</Badge>
                </div>
              </a>
            </Card>

            {/* Image to LaTeX Card */}
            <Card 
              variant="glass" 
              padding="lg" 
              className="group hover:shadow-2xl hover:scale-105 transition-all duration-500 cursor-pointer bg-gradient-to-br from-white to-green-50/30 border-2 border-green-100/50"
            >
              <a href="/features/imagetolatex" className="block">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition duration-500"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-500">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 font-aloevera group-hover:text-green-600 transition duration-300">
                  Image to LaTeX
                </h3>
                <p className="text-gray-600 mb-6 font-aloevera leading-relaxed">
                  Upload images containing equations or text. Our AI-powered OCR and formula 
                  recognition instantly converts them to editable LaTeX code.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="shadow-sm">AI OCR</Badge>
                  <Badge variant="secondary" className="shadow-sm">Gemini Enhanced</Badge>
                  <Badge variant="secondary" className="shadow-sm">Accurate</Badge>
                </div>
              </a>
            </Card>

            {/* Handwritten Flowchart Card */}
            <Card 
              variant="default" 
              padding="lg" 
              className="group hover:shadow-2xl hover:scale-105 transition-all duration-500 cursor-pointer bg-gradient-to-br from-white to-orange-50/30 border-2 border-orange-100/50"
            >
              <a href="/features/handwrittenflowcharttolatex" className="block">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition duration-500"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-500">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 font-aloevera group-hover:text-orange-600 transition duration-300">
                  Handwritten Flowchart
                </h3>
                <p className="text-gray-600 mb-6 font-aloevera leading-relaxed">
                  Upload handwritten flowcharts and let Gemini Flash 2.0 analyze and convert 
                  them to professional TikZ LaTeX diagrams automatically.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="shadow-sm">Gemini Flash 2.0</Badge>
                  <Badge variant="secondary" className="shadow-sm">AI Analysis</Badge>
                  <Badge variant="secondary" className="shadow-sm">TikZ Export</Badge>
                </div>
              </a>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-2 mb-6">
              <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-medium text-indigo-700 font-aloevera">Powerful Features</span>
            </div>
            <h3 className="text-5xl font-bold text-gray-900 mb-6 font-aloevera">
              Everything You Need for
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Professional Documents
              </span>
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-aloevera">
              A complete toolkit designed to streamline your LaTeX workflow
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: 'Real-time Preview', 
                desc: 'See your changes instantly compiled',
                color: 'blue'
              },
              { 
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                ),
                title: 'Precision Control', 
                desc: 'Fine-tune every element with ease',
                color: 'indigo'
              },
              { 
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                ),
                title: 'No Setup Required', 
                desc: 'Works directly in your browser',
                color: 'purple'
              },
              { 
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                ),
                title: 'Responsive Design', 
                desc: 'Works perfectly on any device',
                color: 'pink'
              },
              { 
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                ),
                title: 'Rich Formatting', 
                desc: 'Colors, fonts, styles and more',
                color: 'green'
              },
              { 
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                ),
                title: 'Copy & Export', 
                desc: 'Use your code anywhere, anytime',
                color: 'yellow'
              },
              { 
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                ),
                title: 'AI-Powered', 
                desc: 'Smart error correction & suggestions',
                color: 'red'
              },
              { 
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                ),
                title: 'Cloud Ready', 
                desc: 'Save and sync across devices',
                color: 'cyan'
              }
            ].map((feature, index) => (
              <Card 
                key={index} 
                variant="default" 
                padding="lg" 
                className="group hover:shadow-xl hover:scale-105 transition-all duration-300 border-2 hover:border-blue-200 cursor-pointer"
              >
                <div className={`w-16 h-16 bg-gradient-to-br from-${feature.color}-100 to-${feature.color}-200 rounded-2xl flex items-center justify-center mb-4 text-${feature.color}-600 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  {feature.icon}
                </div>
                <h4 className="font-bold text-gray-900 mb-2 text-lg font-aloevera">{feature.title}</h4>
                <p className="text-sm text-gray-600 font-aloevera leading-relaxed">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h3 className="text-4xl lg:text-5xl font-bold text-white mb-6 font-aloevera">
            Ready to Transform Your LaTeX Workflow?
          </h3>
          <p className="text-xl text-blue-100 mb-10 font-aloevera max-w-2xl mx-auto">
            Join thousands of researchers, students, and professionals creating beautiful documents with Tizkit
          </p>
          <Button
            variant="default"
            size="lg"
            onClick={onNavigateToEditor}
            className="bg-white text-blue-600 hover:bg-gray-50 shadow-2xl hover:shadow-white/20 transform hover:scale-105 transition-all duration-300"
            rightIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            }
          >
            Start Creating for Free
              <Button
                variant="default"
                onClick={onNavigateToEditor}
                className="w-full py-3 text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:scale-105 transition-transform duration-200"
              >
                Launch Visual Editor
              </Button>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-75"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold font-aloevera">Tizkit</h1>
                  <p className="text-sm text-gray-400 font-aloevera">LaTeX Made Visual</p>
                </div>
              </div>
              <p className="text-gray-400 mb-6 font-aloevera leading-relaxed max-w-md">
                Professional LaTeX editing made simple and accessible for everyone. 
                Create beautiful documents without the complexity.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4 font-aloevera">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-white transition font-aloevera">Features</a></li>
                <li><a href="/features/table" className="text-gray-400 hover:text-white transition font-aloevera">Table Editor</a></li>
                <li><a href="/features/diagram" className="text-gray-400 hover:text-white transition font-aloevera">Diagram Editor</a></li>
                <li><a href="/features/imagetolatex" className="text-gray-400 hover:text-white transition font-aloevera">Image to LaTeX</a></li>
                <li><a href="/features/handwrittenflowcharttolatex" className="text-gray-400 hover:text-white transition font-aloevera">Handwritten Flowchart</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4 font-aloevera">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition font-aloevera">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition font-aloevera">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition font-aloevera">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition font-aloevera">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400 font-aloevera mb-4 md:mb-0">
              © 2025 Tizkit. Built with ❤️ for the LaTeX community.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z" clipRule="evenodd"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};