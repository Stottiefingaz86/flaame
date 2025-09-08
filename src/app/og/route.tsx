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
          position: 'relative',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 40px',
            backgroundColor: '#1a1a1a',
            borderBottom: '1px solid #333',
          }}
        >
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff' }}>
            Flaame
          </div>
          <div style={{ display: 'flex', gap: '20px', fontSize: '16px', color: '#cccccc' }}>
            <span style={{ color: '#ff6b35' }}>Home</span>
            <span>Arena</span>
            <span>Beats</span>
            <span>Leaderboard</span>
          </div>
        </div>

        {/* Main Content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 40px',
            textAlign: 'center',
          }}
        >
          {/* Hero Section */}
          <div
            style={{
              fontSize: '80px',
              fontWeight: 'bold',
              color: '#ffffff',
              marginBottom: '20px',
              textShadow: '0 0 20px rgba(255, 255, 255, 0.3)',
            }}
          >
            Flaame
          </div>
          
          <div
            style={{
              fontSize: '36px',
              color: '#ffffff',
              fontWeight: '600',
              marginBottom: '16px',
            }}
          >
            Plug in that microphone.
          </div>
          
          <div
            style={{
              fontSize: '24px',
              color: '#cccccc',
              marginBottom: '40px',
              lineHeight: '1.4',
            }}
          >
            Rappers battle. Producers drop beats. Fans decide.
          </div>

          {/* CTA Button */}
          <div
            style={{
              backgroundColor: '#ff6b35',
              color: '#ffffff',
              padding: '16px 32px',
              borderRadius: '8px',
              fontSize: '20px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '40px',
            }}
          >
            🎤 Enter Arena
          </div>

          {/* Giveaway Alert */}
          <div
            style={{
              backgroundColor: '#1a1a1a',
              border: '2px solid #ff6b35',
              borderLeft: '6px solid #ff6b35',
              padding: '20px 30px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '40px',
            }}
          >
            <div style={{ fontSize: '24px' }}>🏆</div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff', marginBottom: '4px' }}>
                Giveaway Alert!
              </div>
              <div style={{ fontSize: '16px', color: '#cccccc' }}>
                First 50 Winners will get put into a draw to Win $100 Amazon Voucher.
              </div>
            </div>
          </div>

          {/* Stepper */}
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff', marginBottom: '20px', textAlign: 'center' }}>
              Ready to Battle?
            </div>
            <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: '#cccccc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>⬇️</span>
                <span>Download Beat</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🎤</span>
                <span>Record Battle</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>⚔️</span>
                <span>Create Battle</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>👥</span>
                <span>Wait for Challenger</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>✅</span>
                <span>Users Vote</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '40px',
            fontSize: '16px',
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
