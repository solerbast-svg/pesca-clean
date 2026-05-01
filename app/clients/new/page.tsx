'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '../../../components/Layout'
import { supabase } from '../../../lib/supabase'
import { createClient } from '../../../lib/crud'

export default function NewClientPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [form, setForm] = useState({
    name: '', type: '', contact_name: '', phone: '', email: '', notes: '', preferred_species: ''
  })

  const searchSuggestions = async (query: string) => {
    if (query.length < 2) { setSuggestions([]); setShowSuggestions(false); return }
    const { data } = await supabase
      .from('suggestions')
      .select('*')
      .ilike('name', `%${query}%`)
      .limit(8)
    setSuggestions(data || [])
    setShowSuggestions(true)
  }

  const selectSuggestion = (s: any) => {
    setForm(f => ({ ...f, name: s.name, type: s.type || '' }))
    setShowSuggestions(false)
    setSuggestions([])
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non connecté')
      await createClient(user.id, {
        name: form.name, type: form.type || null,
        contact_name: form.contact_name || null, phone: form.phone || null,
        email: form.email || null, notes: form.notes || null,
        preferred_species: form.preferred_species || null
      })
      router.push('/clients')
    } finally { setLoading(false) }
  }

  return (
    <Layout title="Nouveau client">
      <div className="bg-white rounded-3xl border border-gray-100 p-5">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom *</label>
            <input
              type="text" value={form.name} required
              onChange={e => { setForm(f => ({...f, name: e.target.value})); searchSuggestions(e.target.value) }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Tapez 2 lettres pour chercher..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00b4d8]"
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-60 overflow-y-auto">
                {suggestions.map(s => (
                  <button key={s.id} type="button" onClick={() => selectSuggestion(s)}
                    className="w-full text-left px-4 py-3 hover:bg-[#f0f7ff] flex items-center gap-3 border-b border-gray-50 last:border-0">
                    <span className="text-lg">{s.type === 'restaurant' ? '🍽️' : s.type === 'hotel' ? '🏨' : '📋'}</span>
                    <div>
                      <p className="font-medium text-[#0f2942] text-sm">{s.name}</p>
                      <p className="text-xs text-gray-400">{s.city}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
            <select value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00b4d8] bg-white">
              <option value="">Sélectionner</option>
              <option value="restaurant">Restaurant</option>
              <option value="hotel">Hôtel</option>
              <option value="particulier">Particulier</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact</label>
              <input type="text" value={form.contact_name} onChange={e => setForm(f => ({...f, contact_name: e.target.value}))}
                placeholder="Jean Martin" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00b4d8]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
              <input type="tel" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))}
                placeholder="0692 000 000" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00b4d8]" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
              placeholder="contact@restaurant.re" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00b4d8]" />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => router.back()}
              className="flex-1 border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium text-sm hover:bg-gray-50 transition">Annuler</button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-[#0f2942] text-white px-6 py-3 rounded-xl font-medium text-sm hover:bg-[#1a3d5c] transition disabled:opacity-50">
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}