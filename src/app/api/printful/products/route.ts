import { NextRequest, NextResponse } from 'next/server'

const PRINTFUL_API_KEY = 'qdC2k3rAOPixj8u0nBu3TSPCNnEjjQ130aJonUeQ'
const PRINTFUL_BASE_URL = 'https://api.printful.com'

export async function GET(request: NextRequest) {
  try {
    console.log('Printful API route called')
    
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
    console.log('Stores response:', storesData)

    if (!storesData.result || !Array.isArray(storesData.result) || storesData.result.length === 0) {
      return NextResponse.json(
        { error: 'No stores found' },
        { status: 404 }
      )
    }

    const storeId = storesData.result[0].id
    console.log('Using store ID:', storeId)

    // Now get products from that store
    const productsResponse = await fetch(`${PRINTFUL_BASE_URL}/stores/${storeId}/products`, {
      headers: {
        'Authorization': `Bearer ${PRINTFUL_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (!productsResponse.ok) {
      console.error('Products API error:', productsResponse.status, productsResponse.statusText)
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: productsResponse.status }
      )
    }

    const productsData = await productsResponse.json()
    console.log('Products response:', productsData)

    if (!productsData.result || !Array.isArray(productsData.result)) {
      return NextResponse.json({ products: [] })
    }

    // Transform the data to match our interface
    const products = productsData.result.map((product: any) => ({
      id: product.id,
      name: product.name,
      thumbnail_url: product.thumbnail_url || product.image_url || '',
      retail_price: product.retail_price || '0',
      currency: product.currency || 'USD',
      variants: product.variants || []
    }))

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error in Printful API route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
