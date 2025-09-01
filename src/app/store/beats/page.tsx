import { getSupabaseServerClient } from '@/lib/db'
import BeatCard from '@/components/store/BeatCard'
import { Beat } from '@/lib/db'

export default async function BeatsStorePage() {
  const supabase = await getSupabaseServerClient()
  
  // Get all beats
  const { data: beats, error } = await supabase
    .from('beats')
    .select('*')
    .order('cost_flames', { ascending: true })
    
  if (error) {
    console.error('Error fetching beats:', error)
  }
  
  // Get current user's profile and licenses
  const { data: { user } } = await supabase.auth.getUser()
  let userProfile = null
  let userLicenses: string[] = []
  
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('flames_balance')
      .eq('id', user.id)
      .single()
      
    userProfile = profile
    
    // Get user's beat licenses
    const { data: licenses } = await supabase
      .from('beat_licenses')
      .select('beat_id')
      .eq('buyer_id', user.id)
      
    userLicenses = licenses?.map(l => l.beat_id) || []
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Beat Store
          </h1>
          <p className="text-gray-300 text-lg">
            Purchase exclusive beats for your battles
          </p>
          {userProfile && (
            <div className="mt-4 text-sm text-gray-400">
              Your balance: <span className="text-orange-500 font-semibold">{userProfile.flames_balance} 🔥</span>
            </div>
          )}
        </div>

        {/* Beats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {beats?.map((beat) => (
            <BeatCard
              key={beat.id}
              beat={beat as Beat}
              userBalance={userProfile?.flames_balance || 0}
              isOwned={userLicenses.includes(beat.id)}
            />
          ))}
        </div>

        {(!beats || beats.length === 0) && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm">No beats available</p>
          </div>
        )}
      </div>
    </div>
  )
}
