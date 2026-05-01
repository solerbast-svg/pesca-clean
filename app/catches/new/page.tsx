'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '../../../components/Layout'
import { supabase } from '../../../lib/supabase'
import { createCatch } from '../../../lib/crud'

const SPECIES = ['Thon', 'Espadon', 'Marlin', 'Dorade', 'Bar', 'Rouget', 'Langouste', 'Homard', 'Crevette', 'Poulpe', 'Calmar', 'Autre']

export default function NewCatchPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ species: '', weight_kg: '', price_per_kg: '', status: 'available', catch_date: new Date().toISOString().slice(0, 10), notes: '' })

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non connecté')
      await createCatch(user.id, { species: form.species, weight_kg: parseFloat(form.weight_kg), price_per_kg: form.price_per_kg ? parseFloat(form.price_per_kg) : null, quantity_available: null, status: form.status, catch_date: form.catch_date, gps_lat: null, gps_lng: null, notes: form.notes || null, photo_url: null })
      router.push('/catches')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout title="Nouvelle prise">
      <div className="bg-white rounded-3xl border border-gray-100 p-5">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Espèce *</label>
            <select value={form.species} onChange={e => setForm(f => ({...f, species: e.target.value}))} required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00b4d8] bg-white">
              <option value="">Sélectionner</option>
              {SPECIES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Poids (kg) *</label>
              <input type="number" value={form.weight_kg} onChange={e => setForm(f => ({...f, weight_kg: e.target.value}))} step="0.1" min="0" required placeholder="12.5" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00b4d8]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Prix/kg (€)</label>
              <input type="number" value={form.price_per_kg} onChange={e => setForm(f => ({...f, price_per_kg: e.target.value}))} step="0.01" min="0" placeholder="8.50" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00b4d8]" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Date *</label>
            <input type="date" value={form.catch_date} onChange={e => setForm(f => ({...f, catch_date: e.target.value}))} required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00b4d8]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} rows={3} placeholder="Observations..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00b4d8] resize-none" />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => router.back()} className="flex-1 border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium text-sm hover:bg-gray-50 transition">Annuler</button>
            <button type="submit" disabled={loading} className="flex-1 bg-[#0f2942] text-white px-6 py-3 rounded-xl font-medium text-sm hover:bg-[#1a3d5c] transition disabled:opacity-50">{loading ? 'Enregistrement...' : 'Enregistrer'}</button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
