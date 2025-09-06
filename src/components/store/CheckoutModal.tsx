'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, CreditCard, Truck, CheckCircle } from 'lucide-react'
import { PrintfulProduct } from '@/lib/printful'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  product: PrintfulProduct
}

interface CheckoutForm {
  name: string
  email: string
  address1: string
  address2: string
  city: string
  state: string
  zip: string
  country: string
  phone: string
}

export default function CheckoutModal({ isOpen, onClose, product }: CheckoutModalProps) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<CheckoutForm>({
    name: '',
    email: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
    phone: ''
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)

  const handleInputChange = (field: keyof CheckoutForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleCheckout = async () => {
    setIsProcessing(true)
    
    try {
      // 1. Create payment intent with Stripe
      const paymentResponse = await fetch('/api/payment/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(product.retail_price),
          currency: product.currency.toLowerCase(),
          metadata: {
            product_id: product.id.toString(),
            product_name: product.name
          }
        })
      })

      if (!paymentResponse.ok) {
        throw new Error('Payment setup failed')
      }

      const paymentData = await paymentResponse.json()

      // 2. Create order in Printful
      const orderResponse = await fetch('/api/printful/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: {
            name: form.name,
            address1: form.address1,
            address2: form.address2,
            city: form.city,
            state_code: form.state,
            country_code: form.country,
            zip: form.zip,
            phone: form.phone,
            email: form.email
          },
          items: [{
            variant_id: product.variants[0]?.id || 0,
            quantity: 1,
            retail_price: product.retail_price
          }],
          retail_costs: {
            currency: product.currency,
            subtotal: product.retail_price,
            tax: '0.00',
            shipping: '0.00',
            total: product.retail_price
          },
          shipping: 'STANDARD',
          external_id: paymentData.paymentIntentId
        })
      })

      if (!orderResponse.ok) {
        throw new Error('Order creation failed')
      }

      const orderData = await orderResponse.json()
      setOrderId(orderData.order_id)
      setStep(3) // Success step
      
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Checkout failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="bg-black/90 border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">
                {step === 1 && 'Checkout'}
                {step === 2 && 'Payment'}
                {step === 3 && 'Order Confirmed'}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>

            <CardContent className="space-y-6">
              {step === 1 && (
                <>
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                    <img 
                      src={product.thumbnail_url} 
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-gray-400">{product.currency} {product.retail_price}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-white">Full Name *</Label>
                        <Input
                          id="name"
                          value={form.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-white">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={form.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address1" className="text-white">Address *</Label>
                      <Input
                        id="address1"
                        value={form.address1}
                        onChange={(e) => handleInputChange('address1', e.target.value)}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>

                    <div>
                      <Label htmlFor="address2" className="text-white">Address 2</Label>
                      <Input
                        id="address2"
                        value={form.address2}
                        onChange={(e) => handleInputChange('address2', e.target.value)}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city" className="text-white">City *</Label>
                        <Input
                          id="city"
                          value={form.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state" className="text-white">State *</Label>
                        <Input
                          id="state"
                          value={form.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="zip" className="text-white">ZIP *</Label>
                        <Input
                          id="zip"
                          value={form.zip}
                          onChange={(e) => handleInputChange('zip', e.target.value)}
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="country" className="text-white">Country *</Label>
                        <Input
                          id="country"
                          value={form.country}
                          onChange={(e) => handleInputChange('country', e.target.value)}
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-white">Phone</Label>
                        <Input
                          id="phone"
                          value={form.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => setStep(2)}
                    disabled={!form.name || !form.email || !form.address1 || !form.city || !form.state || !form.zip}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    Continue to Payment
                  </Button>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="text-center space-y-4">
                    <CreditCard className="w-16 h-16 text-orange-400 mx-auto" />
                    <h3 className="text-xl font-semibold">Payment Processing</h3>
                    <p className="text-gray-400">Creating your order and processing payment...</p>
                  </div>

                  <Button
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    {isProcessing ? 'Processing...' : 'Complete Order'}
                  </Button>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="text-center space-y-4">
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
                    <h3 className="text-xl font-semibold text-green-400">Order Confirmed!</h3>
                    <p className="text-gray-400">Your order has been placed successfully.</p>
                    {orderId && (
                      <p className="text-sm text-gray-500">Order ID: {orderId}</p>
                    )}
                  </div>

                  <Button
                    onClick={onClose}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  >
                    Close
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
