This file is a merged representation of the entire codebase, combined into a single document by Repomix.
The content has been processed where security check has been disabled.

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Security check has been disabled - content may contain sensitive information
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
assets/
  button.png
  card.png
  project-liquid.gif
  video.mov
liquid-glass-example/
  public/
    favicon.ico
  src/
    pages/
      api/
        hello.ts
      _app.tsx
      _document.tsx
      index.tsx
    styles/
      globals.css
  .gitignore
  next.config.ts
  package.json
  postcss.config.mjs
  README.md
  tsconfig.json
src/
  index.tsx
  shader-utils.ts
  utils.ts
.gitignore
esbuild.config.js
LICENSE
package.json
README.md
tsconfig.json
```

# Files

## File: liquid-glass-example/src/pages/api/hello.ts
````typescript
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next"

type Data = {
  name: string
}

export default function handler(_req: NextApiRequest, res: NextApiResponse<Data>) {
  res.status(200).json({ name: "John Doe" })
}
````

## File: liquid-glass-example/src/pages/_app.tsx
````typescript
import "@/styles/globals.css"
import type { AppProps } from "next/app"

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
````

## File: liquid-glass-example/src/pages/_document.tsx
````typescript
import { Html, Head, Main, NextScript } from "next/document"

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
````

## File: liquid-glass-example/src/pages/index.tsx
````typescript
import { Geist } from "next/font/google"
import { useState, useRef } from "react"
import LiquidGlass from "liquid-glass-react"
import { LogOutIcon, Github } from "lucide-react"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

export default function Home() {
  // User Info Card Controls
  const [displacementScale, setDisplacementScale] = useState(100)
  const [blurAmount, setBlurAmount] = useState(0.5)
  const [saturation, setSaturation] = useState(140)
  const [aberrationIntensity, setAberrationIntensity] = useState(2)
  const [elasticity, setElasticity] = useState(0)
  const [cornerRadius, setCornerRadius] = useState(32)
  const [userInfoOverLight, setUserInfoOverLight] = useState(false)
  const [userInfoMode, setUserInfoMode] = useState<"standard" | "polar" | "prominent" | "shader">("standard")

  // Log Out Button Controls
  const [logoutDisplacementScale, setLogoutDisplacementScale] = useState(64)
  const [logoutBlurAmount, setLogoutBlurAmount] = useState(0.1)
  const [logoutSaturation, setLogoutSaturation] = useState(130)
  const [logoutAberrationIntensity, setLogoutAberrationIntensity] = useState(2)
  const [logoutElasticity, setLogoutElasticity] = useState(0.35)
  const [logoutCornerRadius, setLogoutCornerRadius] = useState(100)
  const [logoutOverLight, setLogoutOverLight] = useState(false)
  const [logoutMode, setLogoutMode] = useState<"standard" | "polar" | "prominent" | "shader">("standard")

  // Shared state
  const [activeTab, setActiveTab] = useState<"userInfo" | "logOut">("userInfo")
  const containerRef = useRef<HTMLDivElement>(null)

  const [scroll, setScroll] = useState(0)

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    requestAnimationFrame(() => {
      setScroll((event?.target as any)?.scrollTop)
    })
  }

  const scrollingOverBrightSection = scroll > 230 && scroll < 500

  return (
    <div
      className={`${geistSans.className} grid grid-cols-1 grid-rows-2 md:grid-rows-1 md:grid-cols-3 shadow-2xl w-full max-w-5xl mx-auto md:my-10 h-screen md:max-h-[calc(100vh-5rem)] md:rounded-3xl overflow-hidden font-[family-name:var(--font-geist-sans)]`}
    >
      {/* Left Panel - Glass Effect Demo */}
      <div className="flex-1 relative overflow-auto min-h-screen md:col-span-2" ref={containerRef} onScroll={handleScroll}>
        <div className="w-full min-h-[200vh] absolute top-0 left-0 pb-96 mb-96">
          <img src="https://picsum.photos/2000/2000" className="w-full h-96 object-cover" />
          <div className="flex flex-col gap-2" id="bright-section">
            <h2 className="text-2xl font-semibold my-5 text-center">Some Heading</h2>
            <p className="px-10">
              Bacon ipsum dolor amet hamburger Bacon ipsum dolor amet hamburger <br />
              Bacon ipsum dolor amet hamburger Bacon ipsum dolor amet hamburger
              <br />
              Bacon ipsum dolor amet hamburger Bacon ipsum dolor amet hamburger
              <br />
              Bacon ipsum dolor amet hamburger Bacon ipsum dolor amet hamburger
              <br />
              Bacon ipsum dolor amet hamburger Bacon ipsum dolor amet hamburger
              <br />
              Bacon ipsum dolor amet hamburger Bacon ipsum dolor amet hamburger
            </p>
          </div>
          <img src="https://picsum.photos/1200/1200" className="w-full h-80 object-cover my-10" />
          <img src="https://picsum.photos/1400/1300" className="w-full h-72 object-cover my-10" />
          <img src="https://picsum.photos/1100/1200" className="w-full h-96 object-cover my-10 mb-96" />
        </div>

        {activeTab === "userInfo" && (
          <LiquidGlass
              displacementScale={displacementScale}
              blurAmount={blurAmount}
              saturation={saturation}
              aberrationIntensity={aberrationIntensity}
              elasticity={elasticity}
              cornerRadius={cornerRadius}
              mouseContainer={containerRef}
              overLight={scrollingOverBrightSection || userInfoOverLight}
              mode={userInfoMode}
              style={{
                position: "fixed",
                top: "25%",
                left: "40%",
              }}
            >
              <div className="w-72 text-shadow-lg">
                <h3 className="text-xl font-semibold mb-4">User Info</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-black/10 backdrop-blur rounded-full flex items-center justify-center text-white font-semibold">JD</div>
                    <div>
                      <p className="font-medium">John Doe</p>
                      <p className="text-sm text-white">Software Engineer</p>
                    </div>
                  </div>
                  <div className="pt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-white">Email:</span>
                      <span className="text-sm">john.doe@example.com</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-white">Location:</span>
                      <span className="text-sm">San Francisco, CA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-white">Joined:</span>
                      <span className="text-sm">March 2023</span>
                    </div>
                  </div>
                </div>
              </div>
            </LiquidGlass>
        )}

        {activeTab === "logOut" && (
          <LiquidGlass
            displacementScale={logoutDisplacementScale}
            blurAmount={logoutBlurAmount}
            saturation={logoutSaturation}
            aberrationIntensity={logoutAberrationIntensity}
            elasticity={logoutElasticity}
            cornerRadius={logoutCornerRadius}
            mouseContainer={containerRef}
            overLight={scrollingOverBrightSection || logoutOverLight}
            mode={logoutMode}
            padding="8px 16px"
            onClick={() => {
              console.log("Logged out")
            }}
            style={{
              position: "fixed",
              top: "20%",
              left: "40%",
            }}
          >
            <h3 className="text-lg font-medium flex items-center gap-2">
              Log Out
              <LogOutIcon className="w-5 h-5" />
            </h3>
          </LiquidGlass>
        )}
      </div>

      {/* Right Panel - Control Panel */}
      <div className="row-start-2 rounded-t-3xl md:rounded-none md:col-start-3 bg-gray-900/80 h-full overflow-y-auto backdrop-blur-md border-l border-white/10 p-8 flex flex-col">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Glassy Boi but Web</h2>
            <a href="https://github.com/rdev/liquid-glass-react" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg" title="View on GitHub">
              <Github className="w-6 h-6" />
            </a>
          </div>
          <p className="text-white/60 text-sm">Liquid Glass container effect for React. With settings and effects and stuff.</p>

          <p className="font-semibold text-yellow-300 text-xs mt-2 leading-snug">⚠️ This doesn't fully work in Safari and Firefox. You will not see edge refraction on non-chromium browsers.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex mb-6 bg-white/5 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("userInfo")}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === "userInfo" ? "bg-blue-500 text-white shadow-lg" : "text-white/70 hover:text-white hover:bg-white/10"}`}
          >
            User Info Card
          </button>
          <button
            onClick={() => setActiveTab("logOut")}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === "logOut" ? "bg-blue-500 text-white shadow-lg" : "text-white/70 hover:text-white hover:bg-white/10"}`}
          >
            Log Out Button
          </button>
        </div>

        <div className="space-y-8 flex-1">
          {activeTab === "userInfo" && (
            <>
              <div>
                <span className="block text-sm font-semibold text-white/90 mb-3">Refraction Mode</span>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="userInfoModeStandard"
                      name="userInfoMode"
                      value="standard"
                      checked={userInfoMode === "standard"}
                      onChange={(e) => setUserInfoMode(e.target.value as "standard" | "polar" | "prominent" | "shader")}
                      className="w-4 h-4 accent-blue-500"
                    />
                    <label htmlFor="userInfoModeStandard" className="text-sm text-white/90">
                      Standard
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="userInfoModePolar"
                      name="userInfoMode"
                      value="polar"
                      checked={userInfoMode === "polar"}
                      onChange={(e) => setUserInfoMode(e.target.value as "standard" | "polar" | "prominent" | "shader")}
                      className="w-4 h-4 accent-blue-500"
                    />
                    <label htmlFor="userInfoModePolar" className="text-sm text-white/90">
                      Polar
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="userInfoModeProminent"
                      name="userInfoMode"
                      value="prominent"
                      checked={userInfoMode === "prominent"}
                      onChange={(e) => setUserInfoMode(e.target.value as "standard" | "polar" | "prominent" | "shader")}
                      className="w-4 h-4 accent-blue-500"
                    />
                    <label htmlFor="userInfoModeProminent" className="text-sm text-white/90">
                      Prominent
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="userInfoModeShader"
                      name="userInfoMode"
                      value="shader"
                      checked={userInfoMode === "shader"}
                      onChange={(e) => setUserInfoMode(e.target.value as "standard" | "polar" | "prominent" | "shader")}
                      className="w-4 h-4 accent-blue-500"
                    />
                    <label htmlFor="userInfoModeShader" className="text-sm text-white/90">
                      Shader (Experimental)
                    </label>
                  </div>
                </div>
                <p className="text-xs text-white/50 mt-2">Controls the refraction calculation method</p>
              </div>

              <div>
                <span className="block text-sm font-semibold text-white/90 mb-3">Displacement Scale</span>
                <div className="mb-2">
                  <span className="text-xl font-mono text-blue-300">{displacementScale}</span>
                </div>
                <input type="range" min="0" max="200" step="1" value={displacementScale} onChange={(e) => setDisplacementScale(Number(e.target.value))} className="w-full" />
                <p className="text-xs text-white/50 mt-2">Controls the intensity of edge distortion</p>
              </div>

              <div>
                <span className="block text-sm font-semibold text-white/90 mb-3">Blur Amount</span>
                <div className="mb-2">
                  <span className="text-xl font-mono text-green-300">{blurAmount.toFixed(1)}</span>
                </div>
                <input type="range" min="0" max="1" step="0.01" value={blurAmount} onChange={(e) => setBlurAmount(Number(e.target.value))} className="w-full" />
                <p className="text-xs text-white/50 mt-2">Controls backdrop blur intensity</p>
              </div>

              <div>
                <span className="block text-sm font-semibold text-white/90 mb-3">Saturation</span>
                <div className="mb-2">
                  <span className="text-xl font-mono text-purple-300">{saturation}%</span>
                </div>
                <input type="range" min="100" max="300" step="10" value={saturation} onChange={(e) => setSaturation(Number(e.target.value))} className="w-full" />
                <p className="text-xs text-white/50 mt-2">Controls color saturation of the backdrop</p>
              </div>

              <div>
                <span className="block text-sm font-semibold text-white/90 mb-3">Chromatic Aberration</span>
                <div className="mb-2">
                  <span className="text-xl font-mono text-cyan-300">{aberrationIntensity}</span>
                </div>
                <input type="range" min="0" max="20" step="1" value={aberrationIntensity} onChange={(e) => setAberrationIntensity(Number(e.target.value))} className="w-full" />
                <p className="text-xs text-white/50 mt-2">Controls RGB channel separation intensity</p>
              </div>

              <div>
                <span className="block text-sm font-semibold text-white/90 mb-3">Elasticity</span>
                <div className="mb-2">
                  <span className="text-xl font-mono text-orange-300">{elasticity.toFixed(2)}</span>
                </div>
                <input type="range" min="0" max="1" step="0.05" value={elasticity} onChange={(e) => setElasticity(Number(e.target.value))} className="w-full" />
                <p className="text-xs text-white/50 mt-2">Controls how much the glass reaches toward the cursor</p>
              </div>

              <div>
                <span className="block text-sm font-semibold text-white/90 mb-3">Corner Radius</span>
                <div className="mb-2">
                  <span className="text-xl font-mono text-pink-300">{cornerRadius === 999 ? "Full" : `${cornerRadius}px`}</span>
                </div>
                <input type="range" min="0" max="100" step="1" value={cornerRadius} onChange={(e) => setCornerRadius(Number(e.target.value))} className="w-full" />
                <p className="text-xs text-white/50 mt-2">Controls the roundness of the glass corners</p>
              </div>

              <div>
                <span className="block text-sm font-semibold text-white/90 mb-3">Over Light</span>
                <div className="flex items-center space-x-3">
                  <input type="checkbox" id="userInfoOverLight" checked={userInfoOverLight} onChange={(e) => setUserInfoOverLight(e.target.checked)} className="w-5 h-5 accent-blue-500" />
                  <label htmlFor="userInfoOverLight" className="text-sm text-white/90">
                    Tint liquid glass dark (use for bright backgrounds)
                  </label>
                </div>
                <p className="text-xs text-white/50 mt-2">Makes the glass darker for better visibility on light backgrounds</p>
              </div>
            </>
          )}

          {activeTab === "logOut" && (
            <>
              <div>
                <span className="block text-sm font-semibold text-white/90 mb-3">Refraction Mode</span>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="logoutModeStandard"
                      name="logoutMode"
                      value="standard"
                      checked={logoutMode === "standard"}
                      onChange={(e) => setLogoutMode(e.target.value as "standard" | "polar" | "prominent" | "shader")}
                      className="w-4 h-4 accent-blue-500"
                    />
                    <label htmlFor="logoutModeStandard" className="text-sm text-white/90">
                      Standard
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="logoutModePolar"
                      name="logoutMode"
                      value="polar"
                      checked={logoutMode === "polar"}
                      onChange={(e) => setLogoutMode(e.target.value as "standard" | "polar" | "prominent" | "shader")}
                      className="w-4 h-4 accent-blue-500"
                    />
                    <label htmlFor="logoutModePolar" className="text-sm text-white/90">
                      Polar
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="logoutModeProminent"
                      name="logoutMode"
                      value="prominent"
                      checked={logoutMode === "prominent"}
                      onChange={(e) => setLogoutMode(e.target.value as "standard" | "polar" | "prominent" | "shader")}
                      className="w-4 h-4 accent-blue-500"
                    />
                    <label htmlFor="logoutModeProminent" className="text-sm text-white/90">
                      Prominent
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="logoutModeShader"
                      name="logoutMode"
                      value="shader"
                      checked={logoutMode === "shader"}
                      onChange={(e) => setLogoutMode(e.target.value as "standard" | "polar" | "prominent" | "shader")}
                      className="w-4 h-4 accent-blue-500"
                    />
                    <label htmlFor="logoutModeShader" className="text-sm text-white/90">
                      Shader
                    </label>
                  </div>
                </div>
                <p className="text-xs text-white/50 mt-2">Controls the refraction calculation method</p>
              </div>

              <div>
                <span className="block text-sm font-semibold text-white/90 mb-3">Displacement Scale</span>
                <div className="mb-2">
                  <span className="text-xl font-mono text-blue-300">{logoutDisplacementScale}</span>
                </div>
                <input type="range" min="0" max="200" step="1" value={logoutDisplacementScale} onChange={(e) => setLogoutDisplacementScale(Number(e.target.value))} className="w-full" />
                <p className="text-xs text-white/50 mt-2">Controls the intensity of edge distortion</p>
              </div>

              <div>
                <span className="block text-sm font-semibold text-white/90 mb-3">Blur Amount</span>
                <div className="mb-2">
                  <span className="text-xl font-mono text-green-300">{logoutBlurAmount.toFixed(1)}</span>
                </div>
                <input type="range" min="0" max="1" step="0.01" value={logoutBlurAmount} onChange={(e) => setLogoutBlurAmount(Number(e.target.value))} className="w-full" />
                <p className="text-xs text-white/50 mt-2">Controls backdrop blur intensity</p>
              </div>

              <div>
                <span className="block text-sm font-semibold text-white/90 mb-3">Saturation</span>
                <div className="mb-2">
                  <span className="text-xl font-mono text-purple-300">{logoutSaturation}%</span>
                </div>
                <input type="range" min="100" max="300" step="10" value={logoutSaturation} onChange={(e) => setLogoutSaturation(Number(e.target.value))} className="w-full" />
                <p className="text-xs text-white/50 mt-2">Controls color saturation of the backdrop</p>
              </div>

              <div>
                <span className="block text-sm font-semibold text-white/90 mb-3">Chromatic Aberration</span>
                <div className="mb-2">
                  <span className="text-xl font-mono text-cyan-300">{logoutAberrationIntensity}</span>
                </div>
                <input type="range" min="0" max="20" step="1" value={logoutAberrationIntensity} onChange={(e) => setLogoutAberrationIntensity(Number(e.target.value))} className="w-full" />
                <p className="text-xs text-white/50 mt-2">Controls RGB channel separation intensity</p>
              </div>

              <div>
                <span className="block text-sm font-semibold text-white/90 mb-3">Elasticity</span>
                <div className="mb-2">
                  <span className="text-xl font-mono text-orange-300">{logoutElasticity.toFixed(2)}</span>
                </div>
                <input type="range" min="0" max="1" step="0.05" value={logoutElasticity} onChange={(e) => setLogoutElasticity(Number(e.target.value))} className="w-full" />
                <p className="text-xs text-white/50 mt-2">Controls how much the glass reaches toward the cursor</p>
              </div>

              <div>
                <span className="block text-sm font-semibold text-white/90 mb-3">Corner Radius</span>
                <div className="mb-2">
                  <span className="text-xl font-mono text-pink-300">{logoutCornerRadius === 999 ? "Full" : `${logoutCornerRadius}px`}</span>
                </div>
                <input type="range" min="0" max="100" step="1" value={logoutCornerRadius} onChange={(e) => setLogoutCornerRadius(Number(e.target.value))} className="w-full" />
                <p className="text-xs text-white/50 mt-2">Controls the roundness of the glass corners</p>
              </div>

              <div>
                <span className="block text-sm font-semibold text-white/90 mb-3">Over Light</span>
                <div className="flex items-center space-x-3">
                  <input type="checkbox" id="logoutOverLight" checked={logoutOverLight} onChange={(e) => setLogoutOverLight(e.target.checked)} className="w-5 h-5 accent-blue-500" />
                  <label htmlFor="logoutOverLight" className="text-sm text-white/90">
                    Tint liquid glass dark (use for bright backgrounds)
                  </label>
                </div>
                <p className="text-xs text-white/50 mt-2">Makes the glass darker for better visibility on light backgrounds</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
````

## File: liquid-glass-example/src/styles/globals.css
````css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}

/* Custom range slider styling */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  background: #00000033;
  border-radius: 999px;
  cursor: pointer;
  height: 24px;
}

input[type="range"]::-webkit-slider-track {
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.3), rgba(168, 85, 247, 0.3));
  height: 6px;
  border-radius: 3px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  background: linear-gradient(135deg, #60a5fa, #a78bfa);
  height: 24px;
  width: 24px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4), 0 0 0 0 rgba(96, 165, 250, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

input[type="range"]::-webkit-slider-thumb:hover {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  transform: scale(1.15);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5), 0 0 0 8px rgba(96, 165, 250, 0.2);
  border-color: white;
}

input[type="range"]::-webkit-slider-thumb:active {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.6), 0 0 0 12px rgba(96, 165, 250, 0.3);
}

input[type="range"]::-moz-range-track {
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.3), rgba(168, 85, 247, 0.3));
  height: 6px;
  border-radius: 3px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

input[type="range"]::-moz-range-thumb {
  background: linear-gradient(135deg, #60a5fa, #a78bfa);
  height: 24px;
  width: 24px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

input[type="range"]::-moz-range-thumb:hover {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  transform: scale(1.15);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5);
  border-color: white;
}

input[type="range"]:focus {
  outline: none;
}

input[type="range"]:focus::-webkit-slider-thumb {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4), 0 0 0 4px rgba(96, 165, 250, 0.3);
}
````

## File: liquid-glass-example/.gitignore
````
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# env files (can opt-in for committing if needed)
.env*

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
````

## File: liquid-glass-example/next.config.ts
````typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  experimental: {
    externalDir: true,
  },
};

export default nextConfig;
````

## File: liquid-glass-example/package.json
````json
{
  "name": "liquid-glass-example",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "liquid-glass-react": "^1.0.2",
    "lucide-react": "^0.514.0",
    "next": "15.3.3",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@tailwindcss/postcss": "^4",
    "tailwindcss": "^4"
  }
}
````

## File: liquid-glass-example/postcss.config.mjs
````javascript
const config = {
  plugins: ["@tailwindcss/postcss"],
};

export default config;
````

## File: liquid-glass-example/README.md
````markdown
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.
````

## File: liquid-glass-example/tsconfig.json
````json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
````

## File: src/index.tsx
````typescript
import { type CSSProperties, forwardRef, useCallback, useEffect, useId, useRef, useState } from "react"
import { ShaderDisplacementGenerator, fragmentShaders } from "./shader-utils"
import { displacementMap, polarDisplacementMap, prominentDisplacementMap } from "./utils"

// Generate shader-based displacement map using shaderUtils
const generateShaderDisplacementMap = (width: number, height: number): string => {
  const generator = new ShaderDisplacementGenerator({
    width,
    height,
    fragment: fragmentShaders.liquidGlass,
  })

  const dataUrl = generator.updateShader()
  generator.destroy()

  return dataUrl
}

const getMap = (mode: "standard" | "polar" | "prominent" | "shader", shaderMapUrl?: string) => {
  switch (mode) {
    case "standard":
      return displacementMap
    case "polar":
      return polarDisplacementMap
    case "prominent":
      return prominentDisplacementMap
    case "shader":
      return shaderMapUrl || displacementMap
    default:
      throw new Error(`Invalid mode: ${mode}`)
  }
}

/* ---------- SVG filter (edge-only displacement) ---------- */
const GlassFilter: React.FC<{ id: string; displacementScale: number; aberrationIntensity: number; width: number; height: number; mode: "standard" | "polar" | "prominent" | "shader"; shaderMapUrl?: string }> = ({
  id,
  displacementScale,
  aberrationIntensity,
  width,
  height,
  mode,
  shaderMapUrl,
}) => (
  <svg style={{ position: "absolute", width, height }} aria-hidden="true">
    <defs>
      <radialGradient id={`${id}-edge-mask`} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="black" stopOpacity="0" />
        <stop offset={`${Math.max(30, 80 - aberrationIntensity * 2)}%`} stopColor="black" stopOpacity="0" />
        <stop offset="100%" stopColor="white" stopOpacity="1" />
      </radialGradient>
      <filter id={id} x="-35%" y="-35%" width="170%" height="170%" colorInterpolationFilters="sRGB">
        <feImage id="feimage" x="0" y="0" width="100%" height="100%" result="DISPLACEMENT_MAP" href={getMap(mode, shaderMapUrl)} preserveAspectRatio="xMidYMid slice" />

        {/* Create edge mask using the displacement map itself */}
        <feColorMatrix
          in="DISPLACEMENT_MAP"
          type="matrix"
          values="0.3 0.3 0.3 0 0
                 0.3 0.3 0.3 0 0
                 0.3 0.3 0.3 0 0
                 0 0 0 1 0"
          result="EDGE_INTENSITY"
        />
        <feComponentTransfer in="EDGE_INTENSITY" result="EDGE_MASK">
          <feFuncA type="discrete" tableValues={`0 ${aberrationIntensity * 0.05} 1`} />
        </feComponentTransfer>

        {/* Original undisplaced image for center */}
        <feOffset in="SourceGraphic" dx="0" dy="0" result="CENTER_ORIGINAL" />

        {/* Red channel displacement with slight offset */}
        <feDisplacementMap in="SourceGraphic" in2="DISPLACEMENT_MAP" scale={displacementScale * (mode === "shader" ? 1 : -1)} xChannelSelector="R" yChannelSelector="B" result="RED_DISPLACED" />
        <feColorMatrix
          in="RED_DISPLACED"
          type="matrix"
          values="1 0 0 0 0
                 0 0 0 0 0
                 0 0 0 0 0
                 0 0 0 1 0"
          result="RED_CHANNEL"
        />

        {/* Green channel displacement */}
        <feDisplacementMap in="SourceGraphic" in2="DISPLACEMENT_MAP" scale={displacementScale * ((mode === "shader" ? 1 : -1) - aberrationIntensity * 0.05)} xChannelSelector="R" yChannelSelector="B" result="GREEN_DISPLACED" />
        <feColorMatrix
          in="GREEN_DISPLACED"
          type="matrix"
          values="0 0 0 0 0
                 0 1 0 0 0
                 0 0 0 0 0
                 0 0 0 1 0"
          result="GREEN_CHANNEL"
        />

        {/* Blue channel displacement with slight offset */}
        <feDisplacementMap in="SourceGraphic" in2="DISPLACEMENT_MAP" scale={displacementScale * ((mode === "shader" ? 1 : -1) - aberrationIntensity * 0.1)} xChannelSelector="R" yChannelSelector="B" result="BLUE_DISPLACED" />
        <feColorMatrix
          in="BLUE_DISPLACED"
          type="matrix"
          values="0 0 0 0 0
                 0 0 0 0 0
                 0 0 1 0 0
                 0 0 0 1 0"
          result="BLUE_CHANNEL"
        />

        {/* Combine all channels with screen blend mode for chromatic aberration */}
        <feBlend in="GREEN_CHANNEL" in2="BLUE_CHANNEL" mode="screen" result="GB_COMBINED" />
        <feBlend in="RED_CHANNEL" in2="GB_COMBINED" mode="screen" result="RGB_COMBINED" />

        {/* Add slight blur to soften the aberration effect */}
        <feGaussianBlur in="RGB_COMBINED" stdDeviation={Math.max(0.1, 0.5 - aberrationIntensity * 0.1)} result="ABERRATED_BLURRED" />

        {/* Apply edge mask to aberration effect */}
        <feComposite in="ABERRATED_BLURRED" in2="EDGE_MASK" operator="in" result="EDGE_ABERRATION" />

        {/* Create inverted mask for center */}
        <feComponentTransfer in="EDGE_MASK" result="INVERTED_MASK">
          <feFuncA type="table" tableValues="1 0" />
        </feComponentTransfer>
        <feComposite in="CENTER_ORIGINAL" in2="INVERTED_MASK" operator="in" result="CENTER_CLEAN" />

        {/* Combine edge aberration with clean center */}
        <feComposite in="EDGE_ABERRATION" in2="CENTER_CLEAN" operator="over" />
      </filter>
    </defs>
  </svg>
)

/* ---------- container ---------- */
const GlassContainer = forwardRef<
  HTMLDivElement,
  React.PropsWithChildren<{
    className?: string
    style?: React.CSSProperties
    displacementScale?: number
    blurAmount?: number
    saturation?: number
    aberrationIntensity?: number
    mouseOffset?: { x: number; y: number }
    onMouseLeave?: () => void
    onMouseEnter?: () => void
    onMouseDown?: () => void
    onMouseUp?: () => void
    active?: boolean
    overLight?: boolean
    cornerRadius?: number
    padding?: string
    glassSize?: { width: number; height: number }
    onClick?: () => void
    mode?: "standard" | "polar" | "prominent" | "shader"
  }>
>(
  (
    {
      children,
      className = "",
      style,
      displacementScale = 25,
      blurAmount = 12,
      saturation = 180,
      aberrationIntensity = 2,
      onMouseEnter,
      onMouseLeave,
      onMouseDown,
      onMouseUp,
      active = false,
      overLight = false,
      cornerRadius = 999,
      padding = "24px 32px",
      glassSize = { width: 270, height: 69 },
      onClick,
      mode = "standard",
    },
    ref,
  ) => {
    const filterId = useId()
    const [shaderMapUrl, setShaderMapUrl] = useState<string>("")

    const isFirefox = navigator.userAgent.toLowerCase().includes("firefox")

    // Generate shader displacement map when in shader mode
    useEffect(() => {
      if (mode === "shader") {
        const url = generateShaderDisplacementMap(glassSize.width, glassSize.height)
        setShaderMapUrl(url)
      }
    }, [mode, glassSize.width, glassSize.height])

    const backdropStyle = {
      filter: isFirefox ? null : `url(#${filterId})`,
      backdropFilter: `blur(${(overLight ? 12 : 4) + blurAmount * 32}px) saturate(${saturation}%)`,
    }

    return (
      <div ref={ref} className={`relative ${className} ${active ? "active" : ""} ${Boolean(onClick) ? "cursor-pointer" : ""}`} style={style} onClick={onClick}>
        <GlassFilter mode={mode} id={filterId} displacementScale={displacementScale} aberrationIntensity={aberrationIntensity} width={glassSize.width} height={glassSize.height} shaderMapUrl={shaderMapUrl} />

        <div
          className="glass"
          style={{
            borderRadius: `${cornerRadius}px`,
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
            gap: "24px",
            padding,
            overflow: "hidden",
            transition: "all 0.2s ease-in-out",
            boxShadow: overLight ? "0px 16px 70px rgba(0, 0, 0, 0.75)" : "0px 12px 40px rgba(0, 0, 0, 0.25)",
          }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
        >
          {/* backdrop layer that gets wiggly */}
          <span
            className="glass__warp"
            style={
              {
                ...backdropStyle,
                position: "absolute",
                inset: "0",
              } as CSSProperties
            }
          />

          {/* user content stays sharp */}
          <div
            className="transition-all duration-150 ease-in-out text-white"
            style={{
              position: "relative",
              zIndex: 1,
              font: "500 20px/1 system-ui",
              textShadow: overLight ? "0px 2px 12px rgba(0, 0, 0, 0)" : "0px 2px 12px rgba(0, 0, 0, 0.4)",
            }}
          >
            {children}
          </div>
        </div>
      </div>
    )
  },
)

GlassContainer.displayName = "GlassContainer"

interface LiquidGlassProps {
  children: React.ReactNode
  displacementScale?: number
  blurAmount?: number
  saturation?: number
  aberrationIntensity?: number
  elasticity?: number
  cornerRadius?: number
  globalMousePos?: { x: number; y: number }
  mouseOffset?: { x: number; y: number }
  mouseContainer?: React.RefObject<HTMLElement | null> | null
  className?: string
  padding?: string
  style?: React.CSSProperties
  overLight?: boolean
  mode?: "standard" | "polar" | "prominent" | "shader"
  onClick?: () => void
}

export default function LiquidGlass({
  children,
  displacementScale = 70,
  blurAmount = 0.0625,
  saturation = 140,
  aberrationIntensity = 2,
  elasticity = 0.15,
  cornerRadius = 999,
  globalMousePos: externalGlobalMousePos,
  mouseOffset: externalMouseOffset,
  mouseContainer = null,
  className = "",
  padding = "24px 32px",
  overLight = false,
  style = {},
  mode = "standard",
  onClick,
}: LiquidGlassProps) {
  const glassRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [glassSize, setGlassSize] = useState({ width: 270, height: 69 })
  const [internalGlobalMousePos, setInternalGlobalMousePos] = useState({ x: 0, y: 0 })
  const [internalMouseOffset, setInternalMouseOffset] = useState({ x: 0, y: 0 })

  // Use external mouse position if provided, otherwise use internal
  const globalMousePos = externalGlobalMousePos || internalGlobalMousePos
  const mouseOffset = externalMouseOffset || internalMouseOffset

  // Internal mouse tracking
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const container = mouseContainer?.current || glassRef.current
      if (!container) {
        return
      }

      const rect = container.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      setInternalMouseOffset({
        x: ((e.clientX - centerX) / rect.width) * 100,
        y: ((e.clientY - centerY) / rect.height) * 100,
      })

      setInternalGlobalMousePos({
        x: e.clientX,
        y: e.clientY,
      })
    },
    [mouseContainer],
  )

  // Set up mouse tracking if no external mouse position is provided
  useEffect(() => {
    if (externalGlobalMousePos && externalMouseOffset) {
      // External mouse tracking is provided, don't set up internal tracking
      return
    }

    const container = mouseContainer?.current || glassRef.current
    if (!container) {
      return
    }

    container.addEventListener("mousemove", handleMouseMove)

    return () => {
      container.removeEventListener("mousemove", handleMouseMove)
    }
  }, [handleMouseMove, mouseContainer, externalGlobalMousePos, externalMouseOffset])

  // Calculate directional scaling based on mouse position
  const calculateDirectionalScale = useCallback(() => {
    if (!globalMousePos.x || !globalMousePos.y || !glassRef.current) {
      return "scale(1)"
    }

    const rect = glassRef.current.getBoundingClientRect()
    const pillCenterX = rect.left + rect.width / 2
    const pillCenterY = rect.top + rect.height / 2
    const pillWidth = glassSize.width
    const pillHeight = glassSize.height

    const deltaX = globalMousePos.x - pillCenterX
    const deltaY = globalMousePos.y - pillCenterY

    // Calculate distance from mouse to pill edges (not center)
    const edgeDistanceX = Math.max(0, Math.abs(deltaX) - pillWidth / 2)
    const edgeDistanceY = Math.max(0, Math.abs(deltaY) - pillHeight / 2)
    const edgeDistance = Math.sqrt(edgeDistanceX * edgeDistanceX + edgeDistanceY * edgeDistanceY)

    // Activation zone: 200px from edges
    const activationZone = 200

    // If outside activation zone, no effect
    if (edgeDistance > activationZone) {
      return "scale(1)"
    }

    // Calculate fade-in factor (1 at edge, 0 at activation zone boundary)
    const fadeInFactor = 1 - edgeDistance / activationZone

    // Normalize the deltas for direction
    const centerDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    if (centerDistance === 0) {
      return "scale(1)"
    }

    const normalizedX = deltaX / centerDistance
    const normalizedY = deltaY / centerDistance

    // Calculate stretch factors with fade-in
    const stretchIntensity = Math.min(centerDistance / 300, 1) * elasticity * fadeInFactor

    // X-axis scaling: stretch horizontally when moving left/right, compress when moving up/down
    const scaleX = 1 + Math.abs(normalizedX) * stretchIntensity * 0.3 - Math.abs(normalizedY) * stretchIntensity * 0.15

    // Y-axis scaling: stretch vertically when moving up/down, compress when moving left/right
    const scaleY = 1 + Math.abs(normalizedY) * stretchIntensity * 0.3 - Math.abs(normalizedX) * stretchIntensity * 0.15

    return `scaleX(${Math.max(0.8, scaleX)}) scaleY(${Math.max(0.8, scaleY)})`
  }, [globalMousePos, elasticity, glassSize])

  // Helper function to calculate fade-in factor based on distance from element edges
  const calculateFadeInFactor = useCallback(() => {
    if (!globalMousePos.x || !globalMousePos.y || !glassRef.current) {
      return 0
    }

    const rect = glassRef.current.getBoundingClientRect()
    const pillCenterX = rect.left + rect.width / 2
    const pillCenterY = rect.top + rect.height / 2
    const pillWidth = glassSize.width
    const pillHeight = glassSize.height

    const edgeDistanceX = Math.max(0, Math.abs(globalMousePos.x - pillCenterX) - pillWidth / 2)
    const edgeDistanceY = Math.max(0, Math.abs(globalMousePos.y - pillCenterY) - pillHeight / 2)
    const edgeDistance = Math.sqrt(edgeDistanceX * edgeDistanceX + edgeDistanceY * edgeDistanceY)

    const activationZone = 200
    return edgeDistance > activationZone ? 0 : 1 - edgeDistance / activationZone
  }, [globalMousePos, glassSize])

  // Helper function to calculate elastic translation
  const calculateElasticTranslation = useCallback(() => {
    if (!glassRef.current) {
      return { x: 0, y: 0 }
    }

    const fadeInFactor = calculateFadeInFactor()
    const rect = glassRef.current.getBoundingClientRect()
    const pillCenterX = rect.left + rect.width / 2
    const pillCenterY = rect.top + rect.height / 2

    return {
      x: (globalMousePos.x - pillCenterX) * elasticity * 0.1 * fadeInFactor,
      y: (globalMousePos.y - pillCenterY) * elasticity * 0.1 * fadeInFactor,
    }
  }, [globalMousePos, elasticity, calculateFadeInFactor])

  // Update glass size whenever component mounts or window resizes
  useEffect(() => {
    const updateGlassSize = () => {
      if (glassRef.current) {
        const rect = glassRef.current.getBoundingClientRect()
        setGlassSize({ width: rect.width, height: rect.height })
      }
    }

    updateGlassSize()
    window.addEventListener("resize", updateGlassSize)
    return () => window.removeEventListener("resize", updateGlassSize)
  }, [])

  const transformStyle = `translate(calc(-50% + ${calculateElasticTranslation().x}px), calc(-50% + ${calculateElasticTranslation().y}px)) ${isActive && Boolean(onClick) ? "scale(0.96)" : calculateDirectionalScale()}`

  const baseStyle = {
    ...style,
    transform: transformStyle,
    transition: "all ease-out 0.2s",
  }

  const positionStyles = {
    position: baseStyle.position || "relative",
    top: baseStyle.top || "50%",
    left: baseStyle.left || "50%",
  }

  return (
    <>
      {/* Over light effect */}
      <div
        className={`bg-black transition-all duration-150 ease-in-out pointer-events-none ${overLight ? "opacity-20" : "opacity-0"}`}
        style={{
          ...positionStyles,
          height: glassSize.height,
          width: glassSize.width,
          borderRadius: `${cornerRadius}px`,
          transform: baseStyle.transform,
          transition: baseStyle.transition,
        }}
      />
      <div
        className={`bg-black transition-all duration-150 ease-in-out pointer-events-none mix-blend-overlay ${overLight ? "opacity-100" : "opacity-0"}`}
        style={{
          ...positionStyles,
          height: glassSize.height,
          width: glassSize.width,
          borderRadius: `${cornerRadius}px`,
          transform: baseStyle.transform,
          transition: baseStyle.transition,
        }}
      />

      <GlassContainer
        ref={glassRef}
        className={className}
        style={baseStyle}
        cornerRadius={cornerRadius}
        displacementScale={overLight ? displacementScale * 0.5 : displacementScale}
        blurAmount={blurAmount}
        saturation={saturation}
        aberrationIntensity={aberrationIntensity}
        glassSize={glassSize}
        padding={padding}
        mouseOffset={mouseOffset}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseDown={() => setIsActive(true)}
        onMouseUp={() => setIsActive(false)}
        active={isActive}
        overLight={overLight}
        onClick={onClick}
        mode={mode}
      >
        {children}
      </GlassContainer>

      {/* Border layer 1 - extracted from glass container */}
      <span
        style={{
          ...positionStyles,
          height: glassSize.height,
          width: glassSize.width,
          borderRadius: `${cornerRadius}px`,
          transform: baseStyle.transform,
          transition: baseStyle.transition,
          pointerEvents: "none",
          mixBlendMode: "screen",
          opacity: 0.2,
          padding: "1.5px",
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          boxShadow: "0 0 0 0.5px rgba(255, 255, 255, 0.5) inset, 0 1px 3px rgba(255, 255, 255, 0.25) inset, 0 1px 4px rgba(0, 0, 0, 0.35)",
          background: `linear-gradient(
          ${135 + mouseOffset.x * 1.2}deg,
          rgba(255, 255, 255, 0.0) 0%,
          rgba(255, 255, 255, ${0.12 + Math.abs(mouseOffset.x) * 0.008}) ${Math.max(10, 33 + mouseOffset.y * 0.3)}%,
          rgba(255, 255, 255, ${0.4 + Math.abs(mouseOffset.x) * 0.012}) ${Math.min(90, 66 + mouseOffset.y * 0.4)}%,
          rgba(255, 255, 255, 0.0) 100%
        )`,
        }}
      />

      {/* Border layer 2 - duplicate with mix-blend-overlay */}
      <span
        style={{
          ...positionStyles,
          height: glassSize.height,
          width: glassSize.width,
          borderRadius: `${cornerRadius}px`,
          transform: baseStyle.transform,
          transition: baseStyle.transition,
          pointerEvents: "none",
          mixBlendMode: "overlay",
          padding: "1.5px",
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          boxShadow: "0 0 0 0.5px rgba(255, 255, 255, 0.5) inset, 0 1px 3px rgba(255, 255, 255, 0.25) inset, 0 1px 4px rgba(0, 0, 0, 0.35)",
          background: `linear-gradient(
          ${135 + mouseOffset.x * 1.2}deg,
          rgba(255, 255, 255, 0.0) 0%,
          rgba(255, 255, 255, ${0.32 + Math.abs(mouseOffset.x) * 0.008}) ${Math.max(10, 33 + mouseOffset.y * 0.3)}%,
          rgba(255, 255, 255, ${0.6 + Math.abs(mouseOffset.x) * 0.012}) ${Math.min(90, 66 + mouseOffset.y * 0.4)}%,
          rgba(255, 255, 255, 0.0) 100%
        )`,
        }}
      />

      {/* Hover effects */}
      {Boolean(onClick) && (
        <>
          <div
            style={{
              ...positionStyles,
              height: glassSize.height,
              width: glassSize.width + 1,
              borderRadius: `${cornerRadius}px`,
              transform: baseStyle.transform,
              pointerEvents: "none",
              transition: "all 0.2s ease-out",
              opacity: isHovered || isActive ? 0.5 : 0,
              backgroundImage: "radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 50%)",
              mixBlendMode: "overlay",
            }}
          />
          <div
            style={{
              ...positionStyles,
              height: glassSize.height,
              width: glassSize.width + 1,
              borderRadius: `${cornerRadius}px`,
              transform: baseStyle.transform,
              pointerEvents: "none",
              transition: "all 0.2s ease-out",
              opacity: isActive ? 0.5 : 0,
              backgroundImage: "radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 80%)",
              mixBlendMode: "overlay",
            }}
          />
          <div
            style={{
              ...baseStyle,
              height: glassSize.height,
              width: glassSize.width + 1,
              borderRadius: `${cornerRadius}px`,
              position: baseStyle.position,
              top: baseStyle.top,
              left: baseStyle.left,
              pointerEvents: "none",
              transition: "all 0.2s ease-out",
              opacity: isHovered ? 0.4 : isActive ? 0.8 : 0,
              backgroundImage: "radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 100%)",
              mixBlendMode: "overlay",
            }}
          />
        </>
      )}
    </>
  )
}
````

## File: src/shader-utils.ts
````typescript
// Adapted from https://github.com/shuding/liquid-glass

export interface Vec2 {
  x: number
  y: number
}

export interface ShaderOptions {
  width: number
  height: number
  fragment: (uv: Vec2, mouse?: Vec2) => Vec2
  mousePosition?: Vec2
}

function smoothStep(a: number, b: number, t: number): number {
  t = Math.max(0, Math.min(1, (t - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

function length(x: number, y: number): number {
  return Math.sqrt(x * x + y * y)
}

function roundedRectSDF(x: number, y: number, width: number, height: number, radius: number): number {
  const qx = Math.abs(x) - width + radius
  const qy = Math.abs(y) - height + radius
  return Math.min(Math.max(qx, qy), 0) + length(Math.max(qx, 0), Math.max(qy, 0)) - radius
}

function texture(x: number, y: number): Vec2 {
  return { x, y }
}

// Shader fragment functions for different effects
export const fragmentShaders = {
  liquidGlass: (uv: Vec2): Vec2 => {
    const ix = uv.x - 0.5
    const iy = uv.y - 0.5
    const distanceToEdge = roundedRectSDF(ix, iy, 0.3, 0.2, 0.6)
    const displacement = smoothStep(0.8, 0, distanceToEdge - 0.15)
    const scaled = smoothStep(0, 1, displacement)
    return texture(ix * scaled + 0.5, iy * scaled + 0.5)
  },
}

export type FragmentShaderType = keyof typeof fragmentShaders

export class ShaderDisplacementGenerator {
  private canvas: HTMLCanvasElement
  private context: CanvasRenderingContext2D
  private canvasDPI = 1

  constructor(private options: ShaderOptions) {
    this.canvas = document.createElement("canvas")
    this.canvas.width = options.width * this.canvasDPI
    this.canvas.height = options.height * this.canvasDPI
    this.canvas.style.display = "none"

    const context = this.canvas.getContext("2d")
    if (!context) {
      throw new Error("Could not get 2D context")
    }
    this.context = context
  }

  updateShader(mousePosition?: Vec2): string {
    const w = this.options.width * this.canvasDPI
    const h = this.options.height * this.canvasDPI

    let maxScale = 0
    const rawValues: number[] = []

    // Calculate displacement values
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const uv: Vec2 = { x: x / w, y: y / h }

        const pos = this.options.fragment(uv, mousePosition)
        const dx = pos.x * w - x
        const dy = pos.y * h - y

        maxScale = Math.max(maxScale, Math.abs(dx), Math.abs(dy))
        rawValues.push(dx, dy)
      }
    }

    // Improved normalization to prevent artifacts while maintaining intensity
    if (maxScale > 0) {
      maxScale = Math.max(maxScale, 1) // Ensure minimum scale to prevent over-normalization
    } else {
      maxScale = 1
    }

    // Create ImageData and fill it
    const imageData = this.context.createImageData(w, h)
    const data = imageData.data

    // Convert to image data with smoother normalization
    let rawIndex = 0
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dx = rawValues[rawIndex++]
        const dy = rawValues[rawIndex++]

        // Smooth the displacement values at edges to prevent hard transitions
        const edgeDistance = Math.min(x, y, w - x - 1, h - y - 1)
        const edgeFactor = Math.min(1, edgeDistance / 2) // Smooth within 2 pixels of edge

        const smoothedDx = dx * edgeFactor
        const smoothedDy = dy * edgeFactor

        const r = smoothedDx / maxScale + 0.5
        const g = smoothedDy / maxScale + 0.5

        const pixelIndex = (y * w + x) * 4
        data[pixelIndex] = Math.max(0, Math.min(255, r * 255)) // Red channel (X displacement)
        data[pixelIndex + 1] = Math.max(0, Math.min(255, g * 255)) // Green channel (Y displacement)
        data[pixelIndex + 2] = Math.max(0, Math.min(255, g * 255)) // Blue channel (Y displacement for SVG filter compatibility)
        data[pixelIndex + 3] = 255 // Alpha channel
      }
    }

    this.context.putImageData(imageData, 0, 0)
    return this.canvas.toDataURL()
  }

  destroy(): void {
    this.canvas.remove()
  }

  getScale(): number {
    return this.canvasDPI
  }
}
````

## File: src/utils.ts
````typescript
export const displacementMap =
  "data:image/jpeg;base64,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cUAUAkEkziomgGgkoxZGgxZFQFQlYnQHRdPfj/10KCSCKESCNiVkViPSLpD0h6I0Q0I0A2IoBWBIJIBKBIJoJIJ2R2J0JWBUJ0JUB0XTv479dFZDYiglYigkhEgjZFQjRFQjRFQjQigFYigHYigmgEgmglYlYnQlQlYlQHQlQnQ9P/kf1yVkNiNCNkNiVENiNiViNEViNkVCVgKCViViViSCViSCVgdCViVCViVCdgVCVCdD1D+U/XBWQ2I0I2Q2JUQ2I0JWQ0I2JUQ2JUI2JUI2J0JWJWJWA2R0BWJ0I2JUJ2BUJUJ0P//EABkQAQEBAQEBAAAAAAAAAAAAAAECABEDEP/aAAgBAQABAgB1atWrVq1atWrVq1atWrVq1atWrVq1atWrVq+OrVq1atWrVq1atWrVq1atWrVq1atWrVq1atXxVppppppdWrVq1atWrVq1NNNNNNNNNNNPVWmmmmms6tWrVq1atWpppppppppppppp6q0000uc51atWrVq1ammmmmmmmmmmmmt1Vpppc5znVq1atWrVqaaaaaaaaaaaaaeqtNLnOc51atWrVq1ammmmmmmmmmmmmnqrS5znOc6tWrVq16222mmmmmmlVppp6tKuc5znOrVq1a9TbbbbTTTTTSq000qtLnOc5zq1atWrW0222200000qqqtKqrnOc5zq1atTbbbbbbbbTTTSqqqqqq5znOc6tTTTbbbbbbbbTTTSqqqqrlVznOctNNNtttttttttNNNNKqqqrqznKqrTTTTbbbbbbbbbTTTSqqqqrqznOc5aaaabbbbbbbbbaaaaVVVVVdWc5znVq1NNttttttttttNNKqqqqudWc5znVq16tbbbbbbbbbbTTSqqqq5XVnOc6tWrVrb1tttttttttNNKqqqqrWrK5VWmmm2230bbbbbbaaaXOc5zlVa1KuVVppptttt9G22222mmlzlVznK6tWVVWmmmm2222222222mlznOc5znLWppVVWmmm22222229bTWrOc5znOcq1qaaVpWmm222222229erVqznOc5znKtatStK0rTbTTbbbberXr1as5znOc5aVpppppWlabaabbbb1ta9WrVnOc5znU0rTTTTTTTTTbTTbbbTWvVq1as5znOdTTStNNNNNNNNNtNNtttN6tWvVq1ZznOrU00rTTTTTTTTTTTTTbTWvVq1atWrOc6tTTTStNNNNNNNNNNtNNtNa9WrVq1Z1Z1NNNNNK1q1NNNNNNNNNNNtNatWrVq1atWrU00000rWrVq1atWrVq1alaaa1atWrVq1NNNammmmla1atWrVq1aterVq16tWrVnVqa1NK1qaaaVX/xAAWEAADAAAAAAAAAAAAAAAAAAAhgJD/2gAIAQEAAz8AaExf/8QAGhEBAQEBAQEBAAAAAAAAAAAAAQISEQADEP/aAAgBAgEBAgDx48ePHjx48ePHjx48ePHjx48ePHjx48ePHj86IiIiIiInjx48ePHjx48IiIiIj0oooooooooRERER73ve60UUUUUUVrWiiiiiihERERER73ve97ooooorRWiiiiihKERERER73ve973RRRRWtFFFFFFCIiIiIiPe973ve60UUVrRRRRRRQiIlCIiI973ve973pRRWiiiiiiiiiiiiiiihEe973ve973RRWtFFFFFFFFFFFFFFFFFFa13ve973WitaKKKKKKKKKKKKKKKKKK1rWtd1rutFa1oooooooooooosssooorWta1rWta1rRRRRRRRRRRZZZZZZZZZWta1rWta1rRRRRRRRRZZZZZZZZZZZZe9a1rWta1rWitaKLLLLLLLLLLLLLLLLL3rWta1rWtFbLLLLLLLLLLLLLLLLLLLL3vWta1rWita1ssssssss+hZZZZZZZZe961rWta0Vre97LLLLLLLLLLLPoWWWWWXrWta1oorWta3ssss+hZZZZ9Cyyyyyyyyiita1orWta1ve9llllllllllllllllFFa0VorWta1ve9llllllllllllllllllFFFaK1rWta1rWiyyyyyyyyyyyyiiiiiiitFFa1rWta1oosoosssssoooosoooorRRRWta1rWta0UUUUUWUUUUUUUUUUUVoooorWta1rWtaKKKKKKmiiiiiiiiiiiiiiitd73ve61oSiiipoqaKKKKKKKKKK0UUUVrve973vREREZoSihEooooorRRRRWtd73ve9EREREREoSiiiiitFllllla73ve9ERERERESiiiiiitH0PoWWWWVrXe96IiIiMoiJRRRRRRWjwlFFllllFFd6IiIiIlCUUUUUUUUUePHjx48ePCIiIiIiIiUUUUUUUUUUUePHjx48ePHjx48ePHjx48IiUUUUUUJRRRX//xAAWEQADAAAAAAAAAAAAAAAAAAABYJD/2gAIAQIBAz8AtEV7/8QAFxEBAQEBAAAAAAAAAAAAAAAAAAECEP/aAAgBAwEBAgCtNNNNNNNNNNNNNNNNNNNNNNNNNNNNNcrTTTTTTTTTTTTTTTTTTTTTTTTTTTTTXKrTTTTTTTU000000000000000000001FVpppppqampqaaaaaaaaaaaaaaaaaaaa5Vaaaaampqampqammmmmmmmmmmlaaaaaaiq0001NTU1NTU1NTTTTTTTTTTSqqtNNNcqtNNSyzU1LNTU1NTTTTTTTTTSqqq001ytNLLLLNTU1NTU1NTbbbTTTTTSqqq001ytNLLLLLNTU1NTU3NttttNNNNNKqq001KrSyyyyyzU1NTU3Nzc02220000qqqqrSqqyyyyyzU1NTU3Nzc3NttttNNNKqqqqqqssssss1NTU3Nzc3NzbbbbTTTSqqqqqqrLLLLLNTU1Nzc3Nzc22220000qqqqqqqqssss1NTU3Nzc3NzbbbbbTTSqqqqqqqqqqzU1NTc3Nzc3Nzbc22000qqqqqqqqqqqtTU3Nzc3Nzc3NtzbTTSqqqqrKqqqqqtNNzc23Nzc3Nzc3NTU1KqqqrKqqqqqtNNNNttzc3Nzc3NzU1NLLLLLKqqqqqqqq0022223Nzc3NzU1NSyyyyyyqqqqqqqrTTbbbbc3Nzc3NTU1LLLLLLKsqqqqqqrTTTTbbbc3Nzc1NTUsssssssqqqqqqrTTTTTbbbTc3NTU1NTUsssssqqqqqqqq0000222023NTU1NTUsssssqqqqqqqq000000003NTU1NTU1LLLLLNKrTSqqqqtNNNNNNtNNTU1NSzUssss00qq0qqqqrTTTTTTTTTU1NTUs1LLLNNNKrTTTSqqq00000000001NTU1LNTU0000qtNNNKqqqtNNNNNNNNTU1NTUs1NNNNNKss1NNNK00qtK0000001NNTU0s000000qq000001NKrStNNNNK1NNNNStNNNNNKqtNNNNNNNK0000000rU0000rTTTTTSq00000rTTTTTTTTTTTTTTTTStNNNNKr/xAAUEQEAAAAAAAAAAAAAAAAAAACg/9oACAEDAQM/AAAf/9k="

export const polarDisplacementMap =
  "data:image/jpeg;base64,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"

export const prominentDisplacementMap =
  "data:image/png;base64,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"
````

## File: .gitignore
````
# Based on https://raw.githubusercontent.com/github/gitignore/main/Node.gitignore

# Logs

logs
_.log
npm-debug.log_
yarn-debug.log*
yarn-error.log*
lerna-debug.log*
.pnpm-debug.log*

# Caches

.cache

# Diagnostic reports (https://nodejs.org/api/report.html)

report.[0-9]_.[0-9]_.[0-9]_.[0-9]_.json

# Runtime data

pids
_.pid
_.seed
*.pid.lock

# Directory for instrumented libs generated by jscoverage/JSCover

lib-cov

# Coverage directory used by tools like istanbul

coverage
*.lcov

# nyc test coverage

.nyc_output

# Grunt intermediate storage (https://gruntjs.com/creating-plugins#storing-task-files)

.grunt

# Bower dependency directory (https://bower.io/)

bower_components

# node-waf configuration

.lock-wscript

# Compiled binary addons (https://nodejs.org/api/addons.html)

build/Release

# Dependency directories

node_modules/
jspm_packages/

# Snowpack dependency directory (https://snowpack.dev/)

web_modules/

# TypeScript cache

*.tsbuildinfo

# Optional npm cache directory

.npm

# Optional eslint cache

.eslintcache

# Optional stylelint cache

.stylelintcache

# Microbundle cache

.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history

.node_repl_history

# Output of 'npm pack'

*.tgz

# Yarn Integrity file

.yarn-integrity

# dotenv environment variable files

.env
.env.development.local
.env.test.local
.env.production.local
.env.local

# parcel-bundler cache (https://parceljs.org/)

.parcel-cache

# Next.js build output

.next
out

# Nuxt.js build / generate output

.nuxt
dist

# Build output
dist/

# Gatsby files

# Comment in the public line in if your project uses Gatsby and not Next.js

# https://nextjs.org/blog/next-9-1#public-directory-support

# public

# vuepress build output

.vuepress/dist

# vuepress v2.x temp and cache directory

.temp

# Docusaurus cache and generated files

.docusaurus

# Serverless directories

.serverless/

# FuseBox cache

.fusebox/

# DynamoDB Local files

.dynamodb/

# TernJS port file

.tern-port

# Stores VSCode versions used for testing VSCode extensions

.vscode-test

# yarn v2

.yarn/cache
.yarn/unplugged
.yarn/build-state.yml
.yarn/install-state.gz
.pnp.*

# IntelliJ based IDEs
.idea

# Finder (MacOS) folder config
.DS_Store

liquid-glass-example/src/components
````

## File: esbuild.config.js
````javascript
const esbuild = require('esbuild');
const path = require('path');

const createBuildConfig = (format) => ({
  entryPoints: ['src/index.ts'],
  bundle: true,
  format,
  outfile: format === 'esm' ? 'dist/index.esm.js' : 'dist/index.js',
  external: ['react', 'react-dom'],
  target: ['es2020'],
  jsx: 'automatic',
  jsxImportSource: 'react',
  minify: process.env.NODE_ENV === 'production',
  sourcemap: true,
  platform: 'browser',
  splitting: false,
  loader: {
    '.tsx': 'tsx',
    '.ts': 'ts',
    '.js': 'js',
    '.jsx': 'jsx'
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }
});

const buildAll = async () => {
  try {
    console.log('🚀 Building ESM bundle...');
    await esbuild.build(createBuildConfig('esm'));
    console.log('✅ ESM bundle built successfully');

    console.log('🚀 Building CJS bundle...');
    await esbuild.build(createBuildConfig('cjs'));
    console.log('✅ CJS bundle built successfully');

    console.log('🎉 All bundles built successfully!');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
};

const watch = async () => {
  try {
    console.log('👀 Starting watch mode for ESM bundle...');
    const ctx = await esbuild.context(createBuildConfig('esm'));
    await ctx.watch();
    console.log('✅ Watch mode active - listening for changes...');
  } catch (error) {
    console.error('❌ Watch mode failed:', error);
    process.exit(1);
  }
};

// Check command line arguments
const args = process.argv.slice(2);
if (args.includes('--watch')) {
  watch();
} else {
  buildAll();
}

module.exports = { createBuildConfig, buildAll, watch };
````

## File: LICENSE
````
Copyright 2025 MAX ROVENSKY

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
````

## File: package.json
````json
{
  "name": "liquid-glass-react",
  "version": "1.1.1",
  "description": "Apple's Liquid Glass effect for React",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "workspaces": ["liquid-glass"],
  "scripts": {
    "build": "npm run clean && npm run build:esm && npm run build:cjs && npm run build:types",
    "build:esm": "esbuild src/index.tsx --bundle --format=esm --outfile=dist/index.esm.js --external:react --external:react-dom",
    "build:cjs": "esbuild src/index.tsx --bundle --format=cjs --outfile=dist/index.js --external:react --external:react-dom",
    "build:types": "tsc --emitDeclarationOnly --outDir dist",
    "clean": "rm -rf dist",
    "dev": "npm run build:esm -- --watch",
    "prepublishOnly": "npm run build"
  },
  "peerDependencies": {
    "react": ">=18",
    "react-dom": ">=18"
  },
  "devDependencies": {
    "@biomejs/biome": "^1.9.4",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "esbuild": "^0.19.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.0.0"
  },
  "keywords": ["react", "component", "library", "typescript"],
  "author": "",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": ""
  }
}
````

## File: README.md
````markdown
# Liquid Glass React

Apple's Liquid Glass effect for React.

Card Example              |  Button Example
:-------------------------:|:-------------------------:
![](https://github.com/rdev/liquid-glass-react/raw/master/assets/card.png)  |  ![](https://github.com/rdev/liquid-glass-react/raw/master/assets/button.png)

## 🎬  Demo

[Click here](https://liquid-glass.maxrovensky.com) to see it in action!

![project liquid gif](./assets/project-liquid.gif)

## ✨ Features

- Proper edgy bending and refraction
- Multiple refraction modes
- Configurable frosty level
- Supports arbitrary child elements
- Configurable paddings
- Correct hover and click effects
- Edges and highlights take on the underlying light like Apple's does
- Configurable chromatic aberration
- Configurable elasticity, to mimic Apple's "liquid" feel

> **⚠️ NOTE:** Safari and Firefox only partially support the effect (displacement will not be visible)

## 🚀 Usage

### Installation

```bash
npm install liquid-glass-react
```

### Basic Usage

```tsx
import LiquidGlass from 'liquid-glass-react'

function App() {
  return (
    <LiquidGlass>
      <div className="p-6">
        <h2>Your content here</h2>
        <p>This will have the liquid glass effect</p>
      </div>
    </LiquidGlass>
  )
}
```

### Button Example

```tsx
<LiquidGlass
  displacementScale={64}
  blurAmount={0.1}
  saturation={130}
  aberrationIntensity={2}
  elasticity={0.35}
  cornerRadius={100}
  padding="8px 16px"
  onClick={() => console.log('Button clicked!')}
>
  <span className="text-white font-medium">Click Me</span>
</LiquidGlass>
```

### Mouse Container Example

When you want the glass effect to respond to mouse movement over a larger area (like a parent container), use the `mouseContainer` prop:

```tsx
function App() {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={containerRef} className="w-full h-screen bg-image">
      <LiquidGlass
        mouseContainer={containerRef}
        elasticity={0.3}
        style={{ position: 'fixed', top: '50%', left: '50%' }}
      >
        <div className="p-6">
          <h2>Glass responds to mouse anywhere in the container</h2>
        </div>
      </LiquidGlass>
    </div>
  )
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | - | The content to render inside the glass container |
| `displacementScale` | `number` | `70` | Controls the intensity of the displacement effect |
| `blurAmount` | `number` | `0.0625` | Controls the blur/frosting level |
| `saturation` | `number` | `140` | Controls color saturation of the glass effect |
| `aberrationIntensity` | `number` | `2` | Controls chromatic aberration intensity |
| `elasticity` | `number` | `0.15` | Controls the "liquid" elastic feel (0 = rigid, higher = more elastic) |
| `cornerRadius` | `number` | `999` | Border radius in pixels |
| `className` | `string` | `""` | Additional CSS classes |
| `padding` | `string` | - | CSS padding value |
| `style` | `React.CSSProperties` | - | Additional inline styles |
| `overLight` | `boolean` | `false` | Whether the glass is over a light background |
| `onClick` | `() => void` | - | Click handler |
| `mouseContainer` | `React.RefObject<HTMLElement \| null> \| null` | `null` | Container element to track mouse movement on (defaults to the glass component itself) |
| `mode` | `"standard" \| "polar" \| "prominent" \| "shader"` | `"standard"` | Refraction mode for different visual effects. `shader` is the most accurate but not the most stable. |
| `globalMousePos` | `{ x: number; y: number }` | - | Global mouse position coordinates for manual control |
| `mouseOffset` | `{ x: number; y: number }` | - | Mouse position offset for fine-tuning positioning |
````

## File: tsconfig.json
````json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["DOM", "DOM.Iterable", "ES6"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "ESNext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": false,
    "declaration": true,
    "declarationMap": true,
    "outDir": "dist",
    "jsx": "react-jsx"
  },
  "include": [
    "src"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
````
