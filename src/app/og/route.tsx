import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000000',
          backgroundImage: 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)',
        }}
      >
        {/* Main Logo */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              fontSize: '120px',
              fontWeight: 'bold',
              color: '#ff6b35',
              textShadow: '0 0 20px rgba(255, 107, 53, 0.5)',
              marginBottom: '20px',
            }}
          >
            FLAAME
          </div>
          <div
            style={{
              fontSize: '32px',
              color: '#ffffff',
              fontWeight: '600',
              marginBottom: '10px',
            }}
          >
            Hip-Hop Battle Platform
          </div>
          <div
            style={{
              fontSize: '20px',
              color: '#cccccc',
              textAlign: 'center',
              maxWidth: '600px',
              lineHeight: '1.4',
            }}
          >
            Rappers battle. Producers drop beats. Fans decide.
          </div>
        </div>

        {/* Feature Icons */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '60px',
            marginTop: '40px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🎤</div>
            <div style={{ fontSize: '16px', color: '#ffffff', fontWeight: '500' }}>Battle Rap</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔥</div>
            <div style={{ fontSize: '16px', color: '#ffffff', fontWeight: '500' }}>Earn Flames</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🎵</div>
            <div style={{ fontSize: '16px', color: '#ffffff', fontWeight: '500' }}>Download Beats</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🏆</div>
            <div style={{ fontSize: '16px', color: '#ffffff', fontWeight: '500' }}>Climb Ranks</div>
          </div>
        </div>

        {/* URL */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            right: '40px',
            fontSize: '18px',
            color: '#ff6b35',
            fontWeight: '600',
          }}
        >
          flaame.co
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
