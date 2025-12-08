import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CIPHERS, cipherService } from '../services/cipherService'
import { useAuth } from '../context/AuthContext'
import { FaCopy, FaExchangeAlt } from 'react-icons/fa'

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

  // Refs for syncing height
  const inputRef = useRef(null)
  const outputRef = useRef(null)

  // Sync output height with input height whenever input changes
  useEffect(() => {
    if (inputRef.current && outputRef.current) {
      outputRef.current.style.height = `${inputRef.current.scrollHeight}px`
    }
  }, [inputText])

  useEffect(() => {
    if (!cipher) setError('Cipher not found')
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
        if (isNaN(processedKey)) throw new Error('Key must be a valid number')
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
      <div className="transform scale-90 origin-top-left w-full h-full overflow-hidden min-h-screen">
        <div className="max-w-2xl mx-auto text-center">
          <div className="card w-full">
            <div className="card-content">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Cipher Not Found</h1>
              <p className="text-gray-600 mb-6">The requested cipher type does not exist.</p>
              <Link to="/" className="btn btn-primary">Back to Home</Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="transform scale-90 origin-top-left w-full h-full overflow-hidden min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <span>→</span>
            <span>{cipher.name}</span>
          </div>
          <h1 className="text-lg font-bold text-white mb-2 bg-blue-600 rounded-full px-6 py-1 inline-block">{cipher.name}</h1>
          <p className="text-gray-600 text-xs">{cipher.description}</p>

          {/* Example */}
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border">
            <div className="text-xs text-blue-800 font-medium mb-1">Example:</div>
            <div className="font-mono text-xs text-blue-700">{cipher.example}</div>
          </div>
        </div>

        {/* Combined Input & Output Section */}
        <div className="card w-full lg:w-full mx-auto">
          <div className="card-content flex flex-col lg:flex-row gap-6">
            {/* Input Section */}
            <div className="flex-1 space-y-5">
              {/* Mode Selection */}
              <div className="mt-5 flex space-x-10">
                <button
                  onClick={() => setMode('encode')}
                  className={`text-blue-600 hover:underline focus:outline-none whitespace-nowrap overflow-hidden ${mode === 'encode' ? 'font-bold' : 'font-normal'}`}
                  style={{ fontSize: `clamp(0.8rem, ${12 / Math.max(cipher.name.length, 1)}rem, 0.875rem)` }}
                >
                  Text to {cipher.name} Code
                </button>

                <button
                  onClick={() => setMode('decode')}
                  className={`text-blue-600 hover:underline focus:outline-none whitespace-nowrap overflow-hidden ${mode === 'decode' ? 'font-bold' : 'font-normal'}`}
                  style={{ fontSize: `clamp(0.8rem, ${12 / Math.max(cipher.name.length, 1)}rem, 0.875rem)` }}
                >
                  {cipher.name} Code to Text
                </button>
              </div>

              {/* Key Input */}
              {cipher.requiresKey && (
                <div className="mb-3">
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
                <textarea
                  ref={inputRef}
                  id="inputText"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className={`input w-full ${cipher.requiresKey ? 'min-h-[200px]' : 'min-h-[250px]'} resize-none`}
                  placeholder={`Enter text to ${mode}...`}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={handleProcess}
                  disabled={loading}
                  className="text-white mb-2 bg-blue-600 rounded-full px-6 py-1 inline-block"
                >
                  {loading ? 'Processing...' : 'Convert'}
                </button>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
            </div>

            {/* Output Section */}
            <div className="flex-1 space-y-4 mt-14">
              <div
                ref={outputRef}
                className="cipher-output w-full min-h-[263px] border rounded bg-white p-2"
              >
                {outputText || 'Output will appear here after processing...'}
              </div>

              {outputText && (
                <div className="flex space-x-2 mt-2">
                  <button onClick={handleCopy} className="btn btn-secondary flex items-center justify-center">
                    <FaCopy size={18} className="text-blue-600" />
                  </button>

                  <button onClick={handleSwap} className="btn btn-secondary flex items-center justify-center">
                    <FaExchangeAlt size={18} className="text-blue-600" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CipherPage
