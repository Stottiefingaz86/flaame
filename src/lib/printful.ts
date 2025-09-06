const PRINTFUL_API_KEY = 'qdC2k3rAOPixj8u0nBu3TSPCNnEjjQ130aJonUeQ'
const PRINTFUL_BASE_URL = 'https://api.printful.com'

export interface PrintfulProduct {
  id: number
  name: string
  thumbnail_url: string
  retail_price: string
  currency: string
  variants: PrintfulVariant[]
}

export interface PrintfulVariant {
  id: number
  name: string
  retail_price: string
  color?: string
  size?: string
}

export class PrintfulService {
  private static async makeRequest(endpoint: string) {
    try {
      console.log(`Making request to: ${PRINTFUL_BASE_URL}${endpoint}`)
      
      const response = await fetch(`${PRINTFUL_BASE_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${PRINTFUL_API_KEY}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)

      if (!response.ok) {
        console.error('Printful API error:', response.status, response.statusText)
        const errorText = await response.text()
        console.error('Error response:', errorText)
        throw new Error(`Printful API error: ${response.status} - ${errorText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching from Printful:', error)
      throw error
    }
  }

  // First, get your store ID
  static async getStoreId(): Promise<number | null> {
    try {
      const response = await this.makeRequest('/stores')
      console.log('Stores response:', response)
      
      if (response.result && Array.isArray(response.result) && response.result.length > 0) {
        return response.result[0].id
      }
      
      return null
    } catch (error) {
      console.error('Error fetching store ID:', error)
      return null
    }
  }

  // Get all products from your store
  static async getProducts(): Promise<PrintfulProduct[]> {
    try {
      // First get the store ID
      const storeId = await this.getStoreId()
      if (!storeId) {
        console.error('No store ID found')
        return []
      }

      console.log('Using store ID:', storeId)
      
      // Then get products from that store
      const response = await this.makeRequest(`/stores/${storeId}/products`)
      console.log('Products response:', response)
      
      if (response.result && Array.isArray(response.result)) {
        return response.result.map((product: any) => ({
          id: product.id,
          name: product.name,
          thumbnail_url: product.thumbnail_url || product.image_url || '',
          retail_price: product.retail_price || '0',
          currency: product.currency || 'USD',
          variants: product.variants || []
        }))
      }
      
      return []
    } catch (error) {
      console.error('Error fetching products:', error)
      return []
    }
  }

  // Get a specific product by ID
  static async getProduct(productId: number): Promise<PrintfulProduct | null> {
    try {
      const storeId = await this.getStoreId()
      if (!storeId) {
        return null
      }

      const response = await this.makeRequest(`/stores/${storeId}/products/${productId}`)
      
      if (response.result) {
        const product = response.result
        return {
          id: product.id,
          name: product.name,
          thumbnail_url: product.thumbnail_url || product.image_url || '',
          retail_price: product.retail_price || '0',
          currency: product.currency || 'USD',
          variants: product.variants || []
        }
      }
      
      return null
    } catch (error) {
      console.error('Error fetching product:', error)
      return null
    }
  }

  // Get product variants
  static async getProductVariants(productId: number): Promise<PrintfulVariant[]> {
    try {
      const response = await this.makeRequest(`/store/products/${productId}`)
      
      if (response.result && response.result.variants) {
        return response.result.variants.map((variant: any) => ({
          id: variant.id,
          name: variant.name,
          retail_price: variant.retail_price,
          color: variant.color,
          size: variant.size
        }))
      }
      
      return []
    } catch (error) {
      console.error('Error fetching product variants:', error)
      return []
    }
  }
}
