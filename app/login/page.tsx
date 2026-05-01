'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { Anchor } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSignup, setIsSignup] = useState(false)

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setError('Vérifiez votre email pour confirmer votre compte.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f7ff] flex flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center mb-10">
        <div className="bg-[#0f2942] rounded-2xl p-5 mb-4"><Anchor size={40} className="text-[#00b4d8]" /></div>
        <h1 className="text-4xl font-bold text-[#0f2942]">PESCA</h1>
        <p className="text-[#00b4d8] font-medium mt-1">Gestion de pêche professionnelle</p>
      </div>
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 w-full max-w-sm">
        <h2 className="text-xl font-bold text-[#0f2942] mb-6 text-center">{isSignup ? 'Créer un compte' : 'Connexion'}</h2>
        {error && <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-2xl text-sm mb-5 text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="votre@email.com" className="w-full border-2 border-gray-200 rounded-2xl px-5 py-4 text-base focus:outline-none focus:border-[#00b4d8]" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Mot de passe</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" className="w-full border-2 border-gray-200 rounded-2xl px-5 py-4 text-base focus:outline-none focus:border-[#00b4d8]" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-[#0f2942] text-white py-4 rounded-2xl text-lg font-bold hover:bg-[#1a3d5c] transition disabled:opacity-50">
            {loading ? '...' : isSignup ? 'Créer mon compte' : 'Se connecter'}
          </button>
        </form>
        <button onClick={() => setIsSignup(!isSignup)} className="w-full text-center text-sm text-gray-500 mt-5 hover:text-[#00b4d8]">
          {isSignup ? 'Déjà un compte ? Se connecter' : "Pas de compte ? S'inscrire"}
        </button>
      </div>
    </div>
  )
}
