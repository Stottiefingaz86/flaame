import { getSupabaseServerClient } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Flame, Crown, Palette } from 'lucide-react'

export default async function ProfileCustomizePage() {
  const supabase = await getSupabaseServerClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Authentication Required</h1>
          <p className="text-gray-400">Please sign in to customize your profile.</p>
        </div>
      </div>
    )
  }
  
  // Get user's profile and inventory
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
    
  const { data: inventory } = await supabase
    .from('inventory')
    .select(`
      item_kind,
      item_id,
      avatars!inventory_item_id_fkey (name, image_url),
      cosmetics!inventory_item_id_fkey (label, value)
    `)
    .eq('user_id', user.id)
    
  // Organize inventory by type
  const ownedAvatars = inventory?.filter(item => item.item_kind === 'avatar') || []
  const ownedBadges = inventory?.filter(item => item.item_kind === 'badge') || []
  const ownedThemes = inventory?.filter(item => item.item_kind === 'theme_color') || []
  
  // Get current equipped items
  const currentAvatar = ownedAvatars.find(item => item.item_id === profile?.avatar_id)
  const currentBadge = ownedBadges.find(item => item.item_id === profile?.profile_icon)
  const currentTheme = ownedThemes.find(item => item.item_id === profile?.profile_color)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Profile Customization
          </h1>
          <p className="text-gray-300 text-lg">
            Equip your purchased avatars and cosmetics
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Avatar Section */}
          <Card className="bg-black/20 backdrop-blur-md border-white/10">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Crown className="w-6 h-6 text-yellow-500" />
                <CardTitle className="text-white">Avatar</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {ownedAvatars.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {ownedAvatars.map((item) => (
                    <div
                      key={item.item_id}
                      className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        currentAvatar?.item_id === item.item_id
                          ? 'border-yellow-500 bg-yellow-500/10'
                          : 'border-white/20 hover:border-white/40'
                      }`}
                    >
                      <img
                        src={item.avatars?.image_url}
                        alt={item.avatars?.name}
                        className="w-full h-32 object-cover rounded"
                      />
                      <p className="text-white text-sm mt-2 text-center">
                        {item.avatars?.name}
                      </p>
                      {currentAvatar?.item_id === item.item_id && (
                        <div className="absolute top-2 right-2 bg-yellow-500 text-white p-1 rounded-full">
                          <Crown className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">No avatars owned</p>
                  <Button variant="flame" asChild>
                    <a href="/store/avatars">Browse Avatars</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Badge Section */}
          <Card className="bg-black/20 backdrop-blur-md border-white/10">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Flame className="w-6 h-6 text-orange-500" />
                <CardTitle className="text-white">Profile Badge</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {ownedBadges.length > 0 ? (
                <div className="grid grid-cols-3 gap-4">
                  {ownedBadges.map((item) => (
                    <div
                      key={item.item_id}
                      className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all text-center ${
                        currentBadge?.item_id === item.item_id
                          ? 'border-orange-500 bg-orange-500/10'
                          : 'border-white/20 hover:border-white/40'
                      }`}
                    >
                      <div className="text-3xl mb-2">{item.cosmetics?.value}</div>
                      <p className="text-white text-sm">
                        {item.cosmetics?.label}
                      </p>
                      {currentBadge?.item_id === item.item_id && (
                        <div className="absolute top-2 right-2 bg-orange-500 text-white p-1 rounded-full">
                          <Flame className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">No badges owned</p>
                  <Button variant="flame" asChild>
                    <a href="/store/badges">Browse Badges</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Theme Color Section */}
          <Card className="bg-black/20 backdrop-blur-md border-white/10">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Palette className="w-6 h-6 text-purple-500" />
                <CardTitle className="text-white">Theme Color</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {ownedThemes.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {ownedThemes.map((item) => (
                    <div
                      key={item.item_id}
                      className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        currentTheme?.item_id === item.item_id
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-white/20 hover:border-white/40'
                      }`}
                    >
                      <div
                        className="w-full h-16 rounded mb-2"
                        style={{ backgroundColor: item.cosmetics?.value }}
                      />
                      <p className="text-white text-sm text-center">
                        {item.cosmetics?.label}
                      </p>
                      {currentTheme?.item_id === item.item_id && (
                        <div className="absolute top-2 right-2 bg-purple-500 text-white p-1 rounded-full">
                          <Palette className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">No theme colors owned</p>
                  <Button variant="flame" asChild>
                    <a href="/store/themes">Browse Themes</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profile Preview */}
          <Card className="bg-black/20 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Profile Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 p-4 rounded-lg bg-white/5">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-xl">
                  {currentBadge?.cosmetics?.value || profile?.username?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-white font-semibold">{profile?.username}</h3>
                  <p className="text-gray-400 text-sm">
                    Balance: {profile?.flames_balance} 🔥
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
