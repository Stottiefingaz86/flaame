// Test script to check avatar API functionality
const testAvatarUrl = 'https://www.flaame.co/api/avatars/avatars%2Ffa8230b7-5b2a-4bf0-a117-69b9d07bbe2a-1757174813597.png'

console.log('Testing avatar URL:', testAvatarUrl)

fetch(testAvatarUrl)
  .then(response => {
    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))
    
    if (response.ok) {
      console.log('✅ Avatar API is working correctly')
    } else {
      console.log('❌ Avatar API returned error:', response.status, response.statusText)
    }
  })
  .catch(error => {
    console.error('❌ Error testing avatar API:', error)
  })
