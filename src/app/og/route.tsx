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
        }}
      >
        {/* Top Navigation */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '15px 30px',
            backgroundColor: '#1a1a1a',
            borderBottom: '1px solid #333',
          }}
        >
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff' }}>
            Flaame
          </div>
          <div style={{ display: 'flex', gap: '25px', fontSize: '14px', color: '#cccccc' }}>
            <span style={{ color: '#ff6b35', backgroundColor: '#ff6b35', color: '#ffffff', padding: '4px 8px', borderRadius: '4px' }}>Home</span>
            <span>Battles</span>
            <span>Beats</span>
            <span>Leaderboard</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '14px', color: '#ffffff' }}>50 🔥</span>
            <div style={{ width: '24px', height: '24px', backgroundColor: '#ff6b35', borderRadius: '50%' }}></div>
            <span style={{ fontSize: '14px' }}>🔍</span>
            <span style={{ fontSize: '14px' }}>💬</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            padding: '40px 30px',
            gap: '30px',
          }}
        >
          {/* Left Content */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Flaame Logo */}
            <div
              style={{
                fontSize: '60px',
                fontWeight: 'bold',
                color: '#ffffff',
                marginBottom: '20px',
              }}
            >
              Flaame
            </div>

            {/* Hero Text */}
            <div
              style={{
                fontSize: '28px',
                color: '#ffffff',
                fontWeight: '600',
                marginBottom: '12px',
                textAlign: 'center',
              }}
            >
              Plug in that microphone.
            </div>

            {/* Subtext */}
            <div
              style={{
                fontSize: '18px',
                color: '#cccccc',
                marginBottom: '25px',
                textAlign: 'center',
              }}
            >
              Rappers battle. Producers drop beats. Fans decide.
            </div>

            {/* CTA Button */}
            <div
              style={{
                backgroundColor: '#ff6b35',
                color: '#ffffff',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '25px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              🎤 Enter Battles
            </div>

            {/* Giveaway Alert */}
            <div
              style={{
                backgroundColor: '#1a1a1a',
                border: '2px solid #ff6b35',
                borderLeft: '6px solid #ff6b35',
                padding: '15px 20px',
                borderRadius: '8px',
                marginBottom: '25px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div style={{ fontSize: '20px' }}>🏆</div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffffff', marginBottom: '2px' }}>
                  Giveaway Alert!
                </div>
                <div style={{ fontSize: '12px', color: '#cccccc' }}>
                  First 50 Winners will get put into a draw to Win $100 Amazon Voucher.
                </div>
              </div>
            </div>

            {/* Stepper */}
            <div
              style={{
                backgroundColor: '#1a1a1a',
                padding: '20px',
                borderRadius: '8px',
                width: '100%',
                maxWidth: '500px',
              }}
            >
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff', marginBottom: '15px', textAlign: 'center' }}>
                Ready to Battle?
              </div>
              <div style={{ display: 'flex', gap: '15px', fontSize: '12px', color: '#cccccc', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '16px' }}>⬇️</span>
                  <span>Go to Beats</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '16px' }}>🎤</span>
                  <span>Record your verse</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '16px' }}>⚔️</span>
                  <span>Upload & challenge</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '16px' }}>👥</span>
                  <span>Someone joins battle</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '16px' }}>✅</span>
                  <span>Fans decide winner</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Chat Panel */}
          <div
            style={{
              width: '300px',
              backgroundColor: '#1a1a1a',
              borderRadius: '8px',
              padding: '15px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Chat Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffffff' }}>Flaame Chat</div>
                <div style={{ fontSize: '12px', color: '#cccccc' }}>Live battle talk</div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ fontSize: '12px' }}>⚙️</span>
                <span style={{ fontSize: '12px' }}>✕</span>
              </div>
            </div>

            {/* Chat Tabs */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
              <span style={{ fontSize: '14px', color: '#ff6b35', borderBottom: '2px solid #ff6b35', paddingBottom: '4px' }}>Chat</span>
              <span style={{ fontSize: '14px', color: '#cccccc' }}>Online</span>
            </div>

            {/* Chat Messages */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px' }}>👑</span>
                <span style={{ fontSize: '12px', color: '#ffffff' }}>Flaame Legendary</span>
                <span style={{ fontSize: '10px', color: '#888' }}>04:25 PM</span>
              </div>
              <div style={{ fontSize: '12px', color: '#cccccc', marginLeft: '20px' }}>Welcome to flaame.co</div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px' }}>🎤</span>
                <span style={{ fontSize: '12px', color: '#ffffff' }}>stottiefingaz Newcomer</span>
                <span style={{ fontSize: '10px', color: '#888' }}>07:14 PM</span>
              </div>
              <div style={{ fontSize: '12px', color: '#cccccc', marginLeft: '20px' }}>Hello</div>
            </div>

            {/* Chat Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '15px' }}>
              <span style={{ fontSize: '12px' }}>😀</span>
              <span style={{ fontSize: '12px' }}>📎</span>
              <div style={{ flex: 1, backgroundColor: '#333', padding: '8px', borderRadius: '4px', fontSize: '12px', color: '#888' }}>
                Type your message...
              </div>
              <span style={{ fontSize: '12px', color: '#ff6b35' }}>✈️</span>
            </div>
          </div>
        </div>

        {/* URL */}
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '30px',
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
