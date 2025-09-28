import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CIPHERS, cipherService } from '../services/cipherService'
import { useAuth } from '../context/AuthContext'

const CipherPage = () => {
  const { type } = useParams()
  const { user } = useAuth()
  const cipher = CIPHERS[type]
  
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [key, setKey] = useState('')
  const [mode, setMode] = useState('encode')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!cipher) {
      setError('Cipher not found')
    }
  }, [type, cipher])

  const handleProcess = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to process')
      return
    }

    if (cipher.requiresKey && !key.trim()) {
      setError(`Please enter a ${cipher.keyLabel.toLowerCase()}`)
      return
    }

    setLoading(true)
    setError('')

    try {
      let processedKey = key
      if (cipher.keyType === 'number') {
        processedKey = parseInt(key)
        if (isNaN(processedKey)) {
          throw new Error('Key must be a valid number')
        }
      }

      const result = mode === 'encode' 
        ? await cipherService.encodeText(type, inputText, cipher.requiresKey ? processedKey : null)
        : await cipherService.decodeText(type, inputText, cipher.requiresKey ? processedKey : null)
      
      setOutputText(result.result)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Processing failed')
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setInputText('')
    setOutputText('')
    setKey('')
    setError('')
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(outputText)
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  const handleSwap = () => {
    setInputText(outputText)
    setOutputText('')
    setMode(mode === 'encode' ? 'decode' : 'encode')
  }

  if (!cipher) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="card">
          <div className="card-content">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Cipher Not Found</h1>
            <p className="text-gray-600 mb-6">The requested cipher type does not exist.</p>
            <Link to="/" className="btn btn-primary">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <span>→</span>
          <span>{cipher.name}</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{cipher.name}</h1>
        <p className="text-gray-600">{cipher.description}</p>
        
        {/* Example */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border">
          <div className="text-sm text-blue-800 font-medium mb-1">Example:</div>
          <div className="font-mono text-sm text-blue-700">{cipher.example}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title text-xl">Input</h2>
          </div>
          <div className="card-content space-y-4">
            {/* Mode Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Operation Mode
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setMode('encode')}
                  className={`btn ${mode === 'encode' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  Encode
                </button>
                <button
                  onClick={() => setMode('decode')}
                  className={`btn ${mode === 'decode' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  Decode
                </button>
              </div>
            </div>

            {/* Key Input */}
            {cipher.requiresKey && (
              <div>
                <label htmlFor="key" className="block text-sm font-medium text-gray-700 mb-1">
                  {cipher.keyLabel}
                </label>
                <input
                  type={cipher.keyType === 'number' ? 'number' : 'text'}
                  id="key"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="input w-full"
                  placeholder={cipher.keyPlaceholder}
                />
              </div>
            )}

            {/* Text Input */}
            <div>
              <label htmlFor="inputText" className="block text-sm font-medium text-gray-700 mb-1">
                Text to {mode}
              </label>
              <textarea
                id="inputText"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="input w-full min-h-[120px] resize-y"
                placeholder={`Enter text to ${mode}...`}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={handleProcess}
                disabled={loading}
                className="btn btn-primary flex-1"
              >
                {loading ? 'Processing...' : `${mode.charAt(0).toUpperCase() + mode.slice(1)} Text`}
              </button>
              <button
                onClick={handleClear}
                className="btn btn-secondary"
              >
                Clear
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Output Section */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title text-xl">Output</h2>
          </div>
          <div className="card-content space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {mode === 'encode' ? 'Encoded' : 'Decoded'} text
              </label>
              <div className="cipher-output">
                {outputText || 'Output will appear here after processing...'}
              </div>
            </div>

            {/* Output Actions */}
            {outputText && (
              <div className="flex space-x-2">
                <button
                  onClick={handleCopy}
                  className="btn btn-secondary"
                >
                  Copy to Clipboard
                </button>
                <button
                  onClick={handleSwap}
                  className="btn btn-secondary"
                >
                  Use as Input
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Authentication Notice */}
      {!user && (
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm text-yellow-800">
                <Link to="/register" className="font-medium hover:underline">Create an account</Link> or{' '}
                <Link to="/login" className="font-medium hover:underline">login</Link> to save your cipher history and access additional features.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CipherPage
