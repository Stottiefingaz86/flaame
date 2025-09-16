// Server-side rendered landing page for SEO
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Flaame - Hip-Hop Battle Platform | Rap Battles & Beat Downloads',
  description: 'Join the ultimate hip-hop battle platform! Compete in rap battles, download exclusive beats, earn flames, and climb the leaderboard. Free registration for rappers and producers.',
}

export default function SEOLanding() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-4">
            Flaame - Hip-Hop Battle Platform
          </h1>
          <p className="text-xl text-gray-300 text-center">
            Where Rappers Battle, Producers Drop Beats, and Fans Decide
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          
          {/* Hero Section */}
          <section className="mb-16 text-center">
            <h2 className="text-3xl font-bold mb-6">
              The Ultimate Hip-Hop Battle Arena
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Flaame is the premier hip-hop battle platform where rappers compete in epic freestyle battles, 
              producers share exclusive beats, and the community votes on winners. Join thousands of artists 
              building their reputation in the hip-hop scene.
            </p>
            <div className="flex gap-4 justify-center">
              <Link 
                href="/arena" 
                className="bg-orange-500 hover:bg-orange-600 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Enter Battle Arena
              </Link>
              <Link 
                href="/beats" 
                className="border border-white/20 hover:bg-white/10 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Browse Beats
              </Link>
            </div>
          </section>

          {/* Features */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Platform Features</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              
              <div className="bg-gray-900/50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">Rap Battle Arena</h3>
                <p className="text-gray-300">
                  Compete against other rappers in organized battles. Challenge specific artists 
                  or join open battles to test your freestyle skills.
                </p>
              </div>

              <div className="bg-gray-900/50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">Beat Marketplace</h3>
                <p className="text-gray-300">
                  Download exclusive hip-hop beats from talented producers. Find the perfect 
                  instrumental for your next battle or recording.
                </p>
              </div>

              <div className="bg-gray-900/50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">Community Voting</h3>
                <p className="text-gray-300">
                  Let the hip-hop community decide battle winners through fair voting. 
                  Build your reputation based on real fan feedback.
                </p>
              </div>

              <div className="bg-gray-900/50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">Leaderboard System</h3>
                <p className="text-gray-300">
                  Climb the ranks and earn flames for victories. Track your progress 
                  and see how you stack up against other rappers.
                </p>
              </div>

              <div className="bg-gray-900/50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">Producer Spotlight</h3>
                <p className="text-gray-300">
                  Featured beat makers get recognition for their work. Submit your 
                  beats and gain exposure in the hip-hop community.
                </p>
              </div>

              <div className="bg-gray-900/50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">Artist Profiles</h3>
                <p className="text-gray-300">
                  Build your hip-hop profile with battle history, achievements, 
                  and fan following. Establish your presence in the scene.
                </p>
              </div>

            </div>
          </section>

          {/* How It Works */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">How Flaame Works</h2>
            <div className="grid md:grid-cols-2 gap-8">
              
              <div className="space-y-6">
                <h3 className="text-2xl font-bold">For Rappers</h3>
                <ol className="space-y-4 text-gray-300">
                  <li className="flex gap-3">
                    <span className="bg-orange-500 text-black w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                    <span>Create your free rapper profile on Flaame</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-orange-500 text-black w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                    <span>Join existing battles or challenge specific rappers</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-orange-500 text-black w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                    <span>Record your rap over provided beats</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-orange-500 text-black w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                    <span>Community votes determine the winner</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-orange-500 text-black w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">5</span>
                    <span>Earn flames and climb the leaderboard</span>
                  </li>
                </ol>
              </div>

              <div className="space-y-6">
                <h3 className="text-2xl font-bold">For Producers</h3>
                <ol className="space-y-4 text-gray-300">
                  <li className="flex gap-3">
                    <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                    <span>Register as a producer on the platform</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                    <span>Upload your original hip-hop beats</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                    <span>Set licensing terms and pricing</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                    <span>Rappers use your beats in battles</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">5</span>
                    <span>Gain exposure and potential sales</span>
                  </li>
                </ol>
              </div>

            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center py-16 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your Hip-Hop Journey?</h2>
            <p className="text-lg text-gray-300 mb-8">
              Join thousands of rappers and producers already building their careers on Flaame
            </p>
            <Link 
              href="/auth" 
              className="bg-orange-500 hover:bg-orange-600 px-12 py-4 rounded-lg font-bold text-lg transition-colors inline-block"
            >
              Join Flaame Today - It's Free!
            </Link>
          </section>

          {/* Keywords Section */}
          <section className="mt-16 text-center">
            <h2 className="text-2xl font-bold mb-4">Hip-Hop Battle Platform Keywords</h2>
            <div className="text-gray-400 text-sm space-x-2">
              <span>hip hop battles,</span>
              <span>rap battles,</span>
              <span>freestyle battles,</span>
              <span>battle rap platform,</span>
              <span>hip hop competition,</span>
              <span>rap contest,</span>
              <span>beat downloads,</span>
              <span>hip hop beats,</span>
              <span>rap community,</span>
              <span>music battles,</span>
              <span>freestyle rap,</span>
              <span>hip hop platform,</span>
              <span>rap battle arena,</span>
              <span>hip hop leaderboard,</span>
              <span>rap skills,</span>
              <span>beat marketplace</span>
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-800">
        <div className="max-w-4xl mx-auto text-center text-gray-400">
          <p>&copy; 2024 Flaame. All rights reserved. The ultimate hip-hop battle platform.</p>
          <div className="mt-4 space-x-4">
            <Link href="/contact" className="hover:text-white">Contact</Link>
            <Link href="/help" className="hover:text-white">Help</Link>
            <Link href="/blog" className="hover:text-white">Blog</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
