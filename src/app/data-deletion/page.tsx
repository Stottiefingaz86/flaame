export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Data Deletion Instructions</h1>
          <p className="text-gray-400 text-lg">
            How to request deletion of your personal data from Flaame
          </p>
        </div>

        <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-lg p-8">
          <div className="prose prose-invert max-w-none">
            <h2 className="text-2xl font-semibold text-white mb-6">Request Data Deletion</h2>
            
            <div className="text-white space-y-4">
              <p>To request deletion of your personal data from Flaame, please follow these steps:</p>
              
              <ol className="list-decimal list-inside space-y-3 ml-4">
                <li>Send an email to <strong>flaameco@gmail.com</strong> with the subject line "Data Deletion Request"</li>
                <li>Include the following information in your email:
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>Your username</li>
                    <li>Email address associated with your account</li>
                    <li>Specify which data you want deleted (account, battles, messages, etc.)</li>
                  </ul>
                </li>
                <li>We will process your request within 30 days of receipt</li>
                <li>You will receive a confirmation email once the deletion is complete</li>
              </ol>

              <div className="mt-8 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">Important Note</h3>
                <p className="text-yellow-200">
                  Some data may be retained for legal or business purposes as required by law. 
                  This includes transaction records, security logs, and other data necessary for 
                  legal compliance and fraud prevention.
                </p>
              </div>

              <div className="mt-8 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Contact Information</h3>
                <p className="text-blue-200">
                  For any questions about data deletion or privacy concerns, please contact us at:
                  <br />
                  <strong>Email:</strong> flaameco@gmail.com
                  <br />
                  <strong>Subject:</strong> Data Deletion Request
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
