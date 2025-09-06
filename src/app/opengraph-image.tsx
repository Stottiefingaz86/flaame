import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Flaame - Hip-Hop Battle Platform'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1b1b 50%, #1a1a1a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui',
          position: 'relative',
        }}
      >
        {/* Background Pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 80%, rgba(255, 140, 0, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 69, 0, 0.1) 0%, transparent 50%)',
          }}
        />
        
        {/* Main Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            zIndex: 1,
          }}
        >
          {/* Logo/Brand */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #ff8c00, #ff4500)',
              backgroundClip: 'text',
              color: 'transparent',
              marginBottom: 20,
              textShadow: '0 0 30px rgba(255, 140, 0, 0.5)',
            }}
          >
            FLAAME
          </div>
          
          {/* Tagline */}
          <div
            style={{
              fontSize: 32,
              color: '#ffffff',
              marginBottom: 10,
              fontWeight: '600',
            }}
          >
            Hip-Hop Battle Platform
          </div>
          
          {/* Description */}
          <div
            style={{
              fontSize: 20,
              color: '#cccccc',
              maxWidth: 800,
              lineHeight: 1.4,
              marginBottom: 30,
            }}
          >
            Compete in epic rap battles, earn flames, and climb the leaderboard
          </div>
          
          {/* Features */}
          <div
            style={{
              display: 'flex',
              gap: 40,
              marginTop: 20,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                color: '#ffffff',
              }}
            >
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#ff8c00' }}>🎤</div>
              <div style={{ fontSize: 16, marginTop: 5 }}>Battle Rap</div>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                color: '#ffffff',
              }}
            >
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#ff8c00' }}>🔥</div>
              <div style={{ fontSize: 16, marginTop: 5 }}>Earn Flames</div>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                color: '#ffffff',
              }}
            >
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#ff8c00' }}>🎵</div>
              <div style={{ fontSize: 16, marginTop: 5 }}>Download Beats</div>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                color: '#ffffff',
              }}
            >
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#ff8c00' }}>🏆</div>
              <div style={{ fontSize: 16, marginTop: 5 }}>Climb Ranks</div>
            </div>
          </div>
        </div>
        
        {/* Bottom Accent */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, #ff8c00, #ff4500, #ff8c00)',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  )
}
