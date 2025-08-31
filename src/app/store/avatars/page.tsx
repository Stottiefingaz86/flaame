import { getSupabaseServerClient } from '@/lib/db'
import AvatarCard from '@/components/store/AvatarCard'
import { Avatar } from '@/lib/db'

export default async function AvatarsStorePage() {
  const supabase = await getSupabaseServerClient()
  
  // Get all avatars
  const { data: avatars, error } = await supabase
    .from('avatars')
    .select('*')
    .order('cost_flames', { ascending: true })
    
  if (error) {
    console.error('Error fetching avatars:', error)
  }
  
  // Get current user's profile
  const { data: { user } } = await supabase.auth.getUser()
  let userProfile = null
  
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('flames_balance, avatar_id')
      .eq('id', user.id)
      .single()
      
    userProfile = profile
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Avatar Store
          </h1>
          <p className="text-gray-300 text-lg">
            Customize your profile with unique avatars
          </p>
          {userProfile && (
            <div className="mt-4 text-sm text-gray-400">
              Your balance: <span className="text-orange-500 font-semibold">{userProfile.flames_balance} 🔥</span>
            </div>
          )}
        </div>

        {/* Avatars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {avatars?.map((avatar) => (
            <AvatarCard
              key={avatar.id}
              avatar={avatar as Avatar}
              userBalance={userProfile?.flames_balance || 0}
              isOwned={userProfile?.avatar_id === avatar.id}
            />
          ))}
        </div>

        {(!avatars || avatars.length === 0) && (
          <div className="text-center py-12">
            <p className="text-gray-400">No avatars available</p>
          </div>
        )}
      </div>
    </div>
  )
}
