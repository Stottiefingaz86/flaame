import { NextRequest, NextResponse } from 'next/server'

const PRINTFUL_API_KEY = 'qdC2k3rAOPixj8u0nBu3TSPCNnEjjQ130aJonUeQ'
const PRINTFUL_BASE_URL = 'https://api.printful.com'

export interface CreateOrderRequest {
  recipient: {
    name: string
    address1: string
    address2?: string
    city: string
    state_code: string
    country_code: string
    zip: string
    phone?: string
    email: string
  }
  items: Array<{
    variant_id: number
    quantity: number
    retail_price?: string
  }>
  retail_costs?: {
    currency: string
    subtotal: string
    tax: string
    shipping: string
    total: string
  }
  shipping: string
  external_id?: string
  label?: string
  packing_slip?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateOrderRequest = await request.json()
    
    console.log('Creating Printful order:', body)
    
    // First, get the store ID
    const storesResponse = await fetch(`${PRINTFUL_BASE_URL}/stores`, {
      headers: {
        'Authorization': `Bearer ${PRINTFUL_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (!storesResponse.ok) {
      console.error('Stores API error:', storesResponse.status, storesResponse.statusText)
      return NextResponse.json(
        { error: 'Failed to fetch stores' },
        { status: storesResponse.status }
      )
    }

    const storesData = await storesResponse.json()
    
    if (!storesData.result || !Array.isArray(storesData.result) || storesData.result.length === 0) {
      return NextResponse.json(
        { error: 'No stores found' },
        { status: 404 }
      )
    }

    const storeId = storesData.result[0].id
    console.log('Using store ID:', storeId)

    // Create the order in Printful
    const orderResponse = await fetch(`${PRINTFUL_BASE_URL}/stores/${storeId}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PRINTFUL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text()
      console.error('Order creation error:', orderResponse.status, errorText)
      return NextResponse.json(
        { error: `Failed to create order: ${errorText}` },
        { status: orderResponse.status }
      )
    }

    const orderData = await orderResponse.json()
    console.log('Order created successfully:', orderData)

    return NextResponse.json({
      success: true,
      order: orderData.result,
      order_id: orderData.result.id
    })
  } catch (error) {
    console.error('Error creating Printful order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get order status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // First, get the store ID
    const storesResponse = await fetch(`${PRINTFUL_BASE_URL}/stores`, {
      headers: {
        'Authorization': `Bearer ${PRINTFUL_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (!storesResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch stores' },
        { status: storesResponse.status }
      )
    }

    const storesData = await storesResponse.json()
    const storeId = storesData.result[0].id

    // Get order details
    const orderResponse = await fetch(`${PRINTFUL_BASE_URL}/stores/${storeId}/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${PRINTFUL_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (!orderResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch order' },
        { status: orderResponse.status }
      )
    }

    const orderData = await orderResponse.json()
    return NextResponse.json({ order: orderData.result })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
