import React, { useState, useRef } from "react";
import { Upload, Image as ImageIcon, Loader2, Download, Settings2, Sparkles, RefreshCcw, Check, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const TARGET_AUDIENCES = ["Children (4-8)", "Tweens (9-12)", "Teens (13-17)"];
const MEDIUMS = [
  "Coloring Book Page",
  "Storybook Illustration",
  "Cartoon Poster",
  "Trading Card Art",
  "Game Asset",
  "Toy Packaging Art"
];
const STYLES = [
  "Black & White Line Art (Outlined)",
  "vibrant 2D Cartoon",
  "Soft Watercolor",
  "3D Render Style",
  "Anime / Manga Style",
  "Retro Pop Art"
];

const ENGINES = [
  { id: "fast", name: "Iterate (Nano Banana)", icon: Zap, desc: "Fast drafts" },
  { id: "high", name: "Finalize (Imagen/Veo)", icon: Sparkles, desc: "Max quality" },
];

export default function App() {
  const [productImage, setProductImage] = useState<{ url: string; mimeType: string } | null>(null);
  const [targetAudience, setTargetAudience] = useState(TARGET_AUDIENCES[0]);
  const [medium, setMedium] = useState(MEDIUMS[0]);
  const [style, setStyle] = useState(STYLES[0]);
  const [engine, setEngine] = useState(ENGINES[0].id);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProductImage({
        url: reader.result as string,
        mimeType: file.type,
      });
      setError(null);
    };
    reader.onerror = () => setError("Failed to read file.");
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!productImage) {
      setError("Please upload a product image first.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const res = await fetch("/api/generate-marketing-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: productImage.url,
          mimeType: productImage.mimeType,
          targetAudience,
          medium,
          style,
          engine,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Generation failed.");
      }

      setGeneratedImage(data.imageUrl);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h1 className="font-semibold tracking-tight text-lg">Product Visualizer</h1>
          </div>
          <div className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div> AI Ready
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 lg:py-12">
        <div className="grid lg:grid-cols-[380px,1fr] gap-8">
          
          {/* Left Column: Controls */}
          <div className="flex flex-col gap-6">
            {/* Upload Area */}
            <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60">
              <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Source Product
              </h2>
              
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleImageUpload}
              />

              {productImage ? (
                <div className="relative group rounded-xl overflow-hidden bg-slate-100 border border-slate-200 aspect-square">
                  <img 
                    src={productImage.url} 
                    alt="Uploaded product" 
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white text-slate-900 px-4 py-2 rounded-full text-sm font-medium shadow-sm hover:scale-105 transition-transform"
                    >
                      Change Image
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-square border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-3 text-slate-500 hover:border-indigo-400 hover:bg-slate-50 transition-colors"
                >
                  <div className="p-3 bg-white rounded-full shadow-sm">
                    <Upload className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold text-indigo-600">Click to upload</span> product
                  </div>
                </button>
              )}
            </section>

            {/* Options */}
            <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60">
              <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Settings2 className="w-4 h-4" /> Marketing Setup
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Target Audience</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none transition-shadow hover:bg-white"
                    value={targetAudience}
                    onChange={e => setTargetAudience(e.target.value)}
                  >
                    {TARGET_AUDIENCES.map(aud => <option key={aud} value={aud}>{aud}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Medium Focus</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none transition-shadow hover:bg-white"
                    value={medium}
                    onChange={e => setMedium(e.target.value)}
                  >
                    {MEDIUMS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Visual Style</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none transition-shadow hover:bg-white"
                    value={style}
                    onChange={e => setStyle(e.target.value)}
                  >
                    {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </section>

            {/* Engine Selection */}
            <section className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200/60 flex items-center gap-1 overflow-hidden">
                {ENGINES.map(eng => {
                  const Icon = eng.icon;
                  const isSelected = engine === eng.id;
                  return (
                    <button
                      key={eng.id}
                      onClick={() => setEngine(eng.id)}
                      className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl text-xs transition-all ${isSelected ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                      <Icon className={`w-4 h-4 mb-1 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span className="font-semibold">{eng.name}</span>
                      <span className="opacity-70 text-[10px]">{eng.desc}</span>
                    </button>
                  )
                })}
            </section>

            {/* Action Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !productImage}
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-medium shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Visualize Product
                </>
              )}
            </button>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 text-red-600 text-sm p-4 rounded-xl border border-red-200"
              >
                {error}
              </motion.div>
            )}

          </div>

          {/* Right Column: Preview Area */}
          <div className="flex flex-col">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 flex-1 min-h-[500px] overflow-hidden flex flex-col relative">
              
              {!isGenerating && !generatedImage && (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center max-w-sm mx-auto">
                  <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center border border-slate-100 mb-6 relative">
                    <ImageIcon className="w-8 h-8 text-slate-300" />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center">
                       <Sparkles className="w-4 h-4 text-indigo-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-slate-800 mb-2">Ready to Visualize</h3>
                  <p className="text-sm">Upload your product and tweak the marketing settings to generate cohesive scenes and assets.</p>
                </div>
              )}

              {isGenerating && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-indigo-600">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  >
                    <RefreshCcw className="w-10 h-10 mb-4 opacity-80" />
                  </motion.div>
                  <p className="font-medium animate-pulse">Running AI pipeline...</p>
                  <p className="text-xs opacity-70 mt-2 text-slate-500">Ensure product consistency.</p>
                </div>
              )}

              <AnimatePresence mode="popLayout">
                {generatedImage && !isGenerating && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-1 w-full h-full p-4 flex flex-col"
                  >
                    <div className="w-full flex-1 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative group">
                      <img 
                        src={generatedImage} 
                        alt="Generated presentation" 
                        className="w-full h-full object-contain"
                      />
                      {/* Download Overlay */}
                      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
                        <a 
                          href={generatedImage} 
                          download="marketing-visual.png"
                          className="bg-white/90 backdrop-blur text-slate-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white flex items-center gap-2 shadow-sm transition-colors"
                        >
                          <Download className="w-4 h-4" /> Save Image
                        </a>
                      </div>
                    </div>
                    
                    <div className="mt-4 px-2 flex items-center justify-between">
                       <div className="flex items-center gap-2 text-sm text-slate-600">
                         <Check className="w-4 h-4 text-emerald-500" />
                         <span>Generated with <span className="font-medium">{engine === 'fast' ? "Nano Banana" : "Imagen/Veo Pipeline"}</span></span>
                       </div>
                       <button onClick={handleGenerate} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                          <RefreshCcw className="w-3.5 h-3.5" /> Re-roll
                       </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>

        </div>
      </main>

    </div>
  );
}
