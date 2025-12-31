export const CanvasPlaceholder = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-5">
      <div className="w-full max-w-6xl px-8">
        {/* Main Title */}
        <div className="text-center mb-16">
          <h1 
            className="text-8xl mb-6"
            style={{ 
              fontFamily: 'Pacifico, cursive',
              color: 'rgba(107, 114, 128, 0.12)',
              letterSpacing: '0.02em',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
            }}
          >
            excelidraw
          </h1>
          <p 
            className="text-lg"
            style={{ 
              fontFamily: 'Pacifico, cursive',
              color: 'rgba(107, 114, 128, 0.23)',
              fontWeight: 300
            }}
          >
            All your data is saved locally in your browser.
          </p>
        </div>

        {/* Features with Arrows */}
        <div className="relative mt-20">
          {/* Top Left - Menu */}
          <div className="absolute bottom-[230px] left-[0px]">
            <svg width="100" height="100" viewBox="0 0 100 100" className="opacity-30">
              <defs>
                <marker id="arrowhead1" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                  <polygon points="0 0, 10 3, 0 6" fill="rgba(107, 114, 128, 0.5)" />
                </marker>
              </defs>
              <path
                d="M 80 80 Q 60 60, 40 30 L 20 10"
                stroke="rgba(107, 114, 128, 0.5)"
                strokeWidth="2"
                fill="none"
                markerEnd="url(#arrowhead1)"
              />
            </svg>
            <p
              className="text-sm mt-2 ml-12"
              style={{
                fontFamily: 'Outfit, sans-serif',
                color: 'rgba(107, 114, 128, 0.4)',
                fontWeight: 300,
                whiteSpace: 'nowrap'
              }}
            >
              Customize colors<br />& styles
            </p>
          </div>

          {/* Top Center - Toolbar */}
          <div className="absolute bottom-[270px] left-[50%] translate-x-[-50%]">
            <svg width="80" height="80" viewBox="0 0 80 80" className="opacity-30 mx-auto">
              <defs>
                <marker id="arrowhead2" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                  <polygon points="0 0, 10 3, 0 6" fill="rgba(107, 114, 128, 0.5)" />
                </marker>
              </defs>
              <path
                d="M 40 70 L 40 10"
                stroke="rgba(107, 114, 128, 0.5)"
                strokeWidth="2"
                fill="none"
                markerEnd="url(#arrowhead2)"
              />
            </svg>
            <p
              className="text-sm text-center"
              style={{
                fontFamily: 'Outfit, sans-serif',
                color: 'rgba(107, 114, 128, 0.4)',
                fontWeight: 300,
                whiteSpace: 'nowrap'
              }}
            >
              Pick a tool &<br />Start drawing!
            </p>
          </div>

          {/* Bottom Left - Zoom Controls */}
          <div className="absolute bottom-[-100px] left-[90px]">
            <p
              className="text-sm mb-2 ml-8"
              style={{
                fontFamily: 'Outfit, sans-serif',
                color: 'rgba(107, 114, 128, 0.4)',
                fontWeight: 300,
                whiteSpace: 'nowrap'
              }}
            >
              Zoom in & out
            </p>
            <svg width="100" height="80" viewBox="0 0 100 80" className="opacity-30">
              <defs>
                <marker id="arrowhead4" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                  <polygon points="0 0, 10 3, 0 6" fill="rgba(107, 114, 128, 0.5)" />
                </marker>
              </defs>
              <path
                d="M 80 10 Q 60 30, 40 50 L 20 70"
                stroke="rgba(107, 114, 128, 0.5)"
                strokeWidth="2"
                fill="none"
                markerEnd="url(#arrowhead4)"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
