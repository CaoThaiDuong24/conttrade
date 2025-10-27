'use client'

import { useEffect, useState } from 'react'

export default function TestRBACPage() {
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const testAPI = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      console.log('🔑 Token found:', !!token)
      console.log('🔑 Token preview:', token?.substring(0, 30))
      
      if (!token) {
        setError('No token found in localStorage')
        return
      }
      
      const url = 'http://localhost:3006/api/v1/admin/rbac/roles'
      console.log('📡 Fetching:', url)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('📡 Response:', response.status, response.statusText)
      
      const data = await response.json()
      console.log('📋 Data:', data)
      
      setResult(data)
      
      if (!data.success) {
        setError(data.message || 'API returned success: false')
      }
    } catch (err: any) {
      console.error('❌ Error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    testAPI()
  }, [])

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">🧪 Test RBAC API</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-semibold mb-2">Status:</h2>
        {loading && <p>⏳ Loading...</p>}
        {error && <p className="text-red-600">❌ Error: {error}</p>}
        {result && <p className="text-green-600">✅ Success</p>}
      </div>

      <button 
        onClick={testAPI}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Retry
      </button>

      {result && (
        <div className="bg-white p-4 rounded border">
          <h2 className="font-semibold mb-2">Result:</h2>
          <pre className="text-xs overflow-auto max-h-96">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-4 bg-yellow-50 p-4 rounded border border-yellow-200">
        <h3 className="font-semibold mb-2">🔍 Debug Info:</h3>
        <p>• Token in localStorage: {!!(localStorage.getItem('token') || localStorage.getItem('accessToken')) ? 'Yes ✅' : 'No ❌'}</p>
        <p>• Backend URL: http://localhost:3006/api/v1/admin/rbac/roles</p>
        <p>• Check browser console (F12) for detailed logs</p>
      </div>
    </div>
  )
}
