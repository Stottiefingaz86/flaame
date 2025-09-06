'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Headphones, Flame, Shirt, CreditCard } from 'lucide-react'
import { PrintfulService, PrintfulProduct } from '@/lib/printful'
import CheckoutModal from '@/components/store/CheckoutModal'
import { useUser } from '@/contexts/UserContext'

export default function StorePage() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState('personalize')
  const [merchProducts, setMerchProducts] = useState<PrintfulProduct[]>([])
  const [isLoadingMerch, setIsLoadingMerch] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<PrintfulProduct | null>(null)
  const [showCheckout, setShowCheckout] = useState(false)

  // Load merch products when merch tab is selected
  useEffect(() => {
    if (activeTab === 'merch' && merchProducts.length === 0) {
      loadMerchProducts()
    }
  }, [activeTab, merchProducts.length])


  const loadMerchProducts = async () => {
    setIsLoadingMerch(true)
    try {
      console.log('Loading merch products...')
      
      // Call our server-side API instead of Printful directly
      const response = await fetch('/api/printful/products')
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('API response:', data)
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      setMerchProducts(data.products || [])
    } catch (error) {
      console.error('Failed to load merch products:', error)
    } finally {
      setIsLoadingMerch(false)
    }
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Flaame Store</h1>
        <p className="text-gray-400 text-lg">Personalize your profile and buy flames to support your favorite battles</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-black/20 backdrop-blur-md border border-white/10">
          <TabsTrigger 
            value="personalize" 
            className="rounded-xl data-[state=active]:bg-white/20 data-[state=active]:text-white"
          >
            <Headphones className="w-4 h-4 mr-2" />
            Personalize
          </TabsTrigger>
          <TabsTrigger 
            value="flames" 
            className="rounded-xl data-[state=active]:bg-white/20 data-[state=active]:text-white"
          >
            <Flame className="w-4 h-4 mr-2" />
            Buy Flames
          </TabsTrigger>
          <TabsTrigger 
            value="merch" 
            className="rounded-xl data-[state=active]:bg-white/20 data-[state=active]:text-white"
          >
            <Shirt className="w-4 h-4 mr-2" />
            Merch
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personalize" className="mt-8">
          <div className="text-center py-12">
            <Headphones className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">Personalize Your Profile</h3>
            <p className="text-gray-500">Customize your avatar and username with unique effects and badges</p>
            <div className="mt-6">
              <span className="inline-block bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full px-6 py-3 text-lg font-semibold">
                Coming Soon
              </span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="flames" className="mt-8">
          <div className="text-center py-12">
            <Flame className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">Buy Flames</h3>
            <p className="text-gray-500">Purchase flames to support battles and unlock premium features</p>
            <div className="mt-6">
              <span className="inline-block bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full px-6 py-3 text-lg font-semibold">
                Coming Soon
              </span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="merch" className="mt-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Flaame Merch</h2>
            <p className="text-gray-400">Represent your favorite battle platform with official Flaame merchandise</p>
          </div>
          
          {isLoadingMerch ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center py-12">
                  <div className="animate-pulse">
                    <div className="w-full h-64 bg-gray-700 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/2 mx-auto mb-4"></div>
                    <div className="h-10 bg-gray-700 rounded w-1/3 mx-auto"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : merchProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {merchProducts.map((product) => (
                <Card key={product.id} className="bg-black/20 backdrop-blur-md border border-white/10 hover:bg-black/30 transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="aspect-square overflow-hidden rounded-lg mb-3">
                      <img 
                        src={product.thumbnail_url} 
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardTitle className="text-white text-lg line-clamp-2">{product.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-orange-400">
                        {product.currency} {product.retail_price}
                      </span>
                      <span className="text-gray-400 text-sm">
                        {product.variants.length} variants
                      </span>
                    </div>
                    <Button 
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                      onClick={() => {
                        setSelectedProduct(product)
                        setShowCheckout(true)
                      }}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Buy Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Shirt className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">No merch available</h3>
              <p className="text-gray-500">Check back soon for new Flaame merchandise!</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Checkout Modal */}
      {selectedProduct && (
        <CheckoutModal
          isOpen={showCheckout}
          onClose={() => {
            setShowCheckout(false)
            setSelectedProduct(null)
          }}
          product={selectedProduct}
        />
      )}
    </div>
  )
}
