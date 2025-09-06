'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Mail, 
  MessageCircle, 
  ExternalLink
} from 'lucide-react'

export default function ContactPage() {
  const handleEmailClick = () => {
    const subject = encodeURIComponent('Contact from Flaame Website')
    const body = encodeURIComponent(`Hi Flaame Team,

I'm reaching out from your website contact page.

[Please write your message here]

Best regards,
[Your name]`)
    
    window.open(`mailto:flaameco@gmail.com?subject=${subject}&body=${body}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">Contact Us</h1>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Have a question, suggestion, or need support? We'd love to hear from you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Direct Email Contact */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-black/20 backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Send us an Email
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="p-6 rounded-full bg-gradient-to-r from-orange-500 to-red-500 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <Mail className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Get in Touch</h3>
                  <p className="text-gray-400 mb-6">
                    Click the button below to open your email client and send us a message directly.
                  </p>
                  
                  <Button
                    onClick={handleEmailClick}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3 text-lg"
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    Send Email
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                  <h4 className="text-orange-300 font-semibold mb-2">Why use email?</h4>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• Direct delivery to our inbox</li>
                    <li>• No form submission issues</li>
                    <li>• You get a copy of your message</li>
                    <li>• Faster response time</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <Card className="bg-black/20 backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Email Support</p>
                    <a 
                      href="mailto:flaameco@gmail.com" 
                      className="text-orange-400 hover:text-orange-300 transition-colors"
                    >
                      flaameco@gmail.com
                    </a>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <h3 className="text-white font-semibold mb-3">Response Time</h3>
                  <p className="text-gray-400 text-sm">
                    We typically respond to all inquiries within 24-48 hours. 
                    For urgent issues, please include "URGENT" in your subject line.
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <h3 className="text-white font-semibold mb-3">What We Can Help With</h3>
                  <ul className="text-gray-400 text-sm space-y-2">
                    <li>• Account and profile issues</li>
                    <li>• Battle creation and participation</li>
                    <li>• Technical problems</li>
                    <li>• Feature requests</li>
                    <li>• Community guidelines</li>
                    <li>• Partnership opportunities</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/20 backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Before You Contact Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm mb-4">
                  Check our Help Center first - you might find the answer you're looking for!
                </p>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/help'}
                  className="w-full border-white/20 text-white hover:bg-white/10"
                >
                  Visit Help Center
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
