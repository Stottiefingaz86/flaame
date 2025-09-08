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
          backgroundColor: '#000000',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
        }}
      >
        {/* Main Logo */}
        <div
          style={{
            fontSize: '100px',
            fontWeight: 'bold',
            color: '#ff6b35',
            marginBottom: '30px',
            textShadow: '0 0 30px rgba(255, 107, 53, 0.5)',
          }}
        >
          FLAAME
        </div>
        
        {/* Subtitle */}
        <div
          style={{
            fontSize: '32px',
            color: '#ffffff',
            fontWeight: '600',
            marginBottom: '20px',
          }}
        >
          Hip-Hop Battle Platform
        </div>
        
        {/* Tagline */}
        <div
          style={{
            fontSize: '24px',
            color: '#cccccc',
            marginBottom: '40px',
            textAlign: 'center',
            lineHeight: '1.4',
          }}
        >
          Rappers battle. Producers drop beats. Fans decide.
        </div>

        {/* Hero Text */}
        <div
          style={{
            fontSize: '36px',
            color: '#ffffff',
            fontWeight: '600',
            marginBottom: '30px',
            textAlign: 'center',
          }}
        >
          Plug in that microphone.
        </div>

        {/* CTA Button */}
        <div
          style={{
            backgroundColor: '#ff6b35',
            color: '#ffffff',
            padding: '20px 40px',
            borderRadius: '12px',
            fontSize: '24px',
            fontWeight: '600',
            marginBottom: '40px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          🎤 Enter Arena
        </div>

        {/* Giveaway Alert */}
        <div
          style={{
            backgroundColor: '#1a1a1a',
            border: '3px solid #ff6b35',
            borderLeft: '8px solid #ff6b35',
            padding: '25px 35px',
            borderRadius: '12px',
            marginBottom: '30px',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
          }}
        >
          <div style={{ fontSize: '32px' }}>🏆</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff', marginBottom: '6px' }}>
              Giveaway Alert!
            </div>
            <div style={{ fontSize: '18px', color: '#cccccc' }}>
              First 50 Winners will get put into a draw to Win $100 Amazon Voucher.
            </div>
          </div>
        </div>

        {/* Features */}
        <div
          style={{
            display: 'flex',
            gap: '40px',
            fontSize: '18px',
            color: '#ffffff',
            marginTop: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>🎤</span>
            <span>Battle Rap</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>🔥</span>
            <span>Earn Flames</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>🎵</span>
            <span>Download Beats</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>🏆</span>
            <span>Climb Ranks</span>
          </div>
        </div>

        {/* URL */}
        <div
          style={{
            position: 'absolute',
            bottom: '30px',
            right: '40px',
            fontSize: '20px',
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
