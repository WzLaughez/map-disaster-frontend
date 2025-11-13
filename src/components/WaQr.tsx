import { useEffect, useMemo, useState } from 'react'

export default function WaQr() {
  const [qr, setQr] = useState<string | null>(null)
  const [connected, setConnected] = useState<boolean>(false)
  const apiBase = useMemo(() => {
    // Customize API base via VITE_API_URL if needed
    const fromEnv = (import.meta as any)?.env?.VITE_API_URL as string | undefined
    return fromEnv || 'http://localhost:3000'
  }, [])

  useEffect(() => {
    const es = new EventSource(`${apiBase}/api/wa/qr/stream`)
    es.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data || '{}') as { qr?: string }
        const next = typeof data.qr === 'string' ? data.qr : null
        setQr(next && next.length > 0 ? next : null)
        // If qr is empty/null after connection open, likely already connected
        setConnected(!next)
      } catch {
        // ignore parse errors
      }
    }
    es.onerror = () => {
      // Keep the UI informative if stream errors out
      setConnected(false)
    }
    return () => es.close()
  }, [apiBase])

  const imgSrc = qr
    ? `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(qr)}`
    : null

  return (
    <div className="w-full max-w-sm mx-auto p-4 bg-white border rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-2">WhatsApp Login</h2>
      {!qr && !connected && (
        <p className="text-sm text-gray-500 mb-4">
          Menunggu QR dari server...
        </p>
      )}
      {qr && (
        <div className="flex flex-col items-center">
          {imgSrc ? (
            <img
              src={imgSrc}
              alt="WA Login QR"
              className="w-64 h-64 border rounded"
            />
          ) : null}
          <p className="text-sm text-gray-600 mt-3 text-center">
            Buka WhatsApp &gt; Linked devices &gt; Link a device, lalu scan QR ini.
          </p>
        </div>
      )}
      {!qr && connected && (
        <div className="text-green-700 bg-green-50 border border-green-200 p-3 rounded">
          <p className="text-sm">
            Perangkat sudah terhubung ke WhatsApp. QR tidak diperlukan saat ini.
          </p>
        </div>
      )}
    </div>
  )
}


