'use client'
import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

interface CopyToClipboardButtonProps {
  textToCopy: string
}

export function CopyToClipboardButton({ textToCopy }: CopyToClipboardButtonProps) {
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus-ring"
      aria-label="Copy to clipboard"
    >
      {isCopied ? (
        <Check className="w-5 h-5 text-green-500" />
      ) : (
        <Copy className="w-5 h-5 text-gray-500 dark:text-gray-400" />
      )}
    </button>
  )
}