'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '../../../components/Layout'
import { supabase } from '../../../lib/supabase'
import { getCatches, getClients, createSale } from '../../../lib/crud'

export default function NewSalePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [catches, setCatches] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [form, setForm] = useState({
    client_id: '',
    catch_id: '',
    quantity_kg: '',
    price_per_kg: '',
    sale_date: new Date().toISOString().slice(0, 10),
    notes: '',
  })

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const [c, cl] = await Promise.all([
        getCatches(user.id),
        getClients(user.id),
      ])
      setCatches(c.filter((c: any) => c.status !== 'expired'))
      setClients(cl)
    }
    load()
  }, [])

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non connecté')
      await createSale(user.id, {
        client_id: form.client_id || null,
        catch_id: form.catch_id || null,
        quantity_kg: parseFloat(form.quantity_kg),
        price_per_kg: parseFloat(form.price_per_kg),
        total_amount: parseFloat(form.quantity_kg) * parseFloat(form.price_per_kg),
        sale_date: form.sale_date,
        notes: form.notes || null,
      })
      router.push('/sales')
    } finally {
      setLoading(false)
    }
  }

  const total = form.quantity_kg && form.price_per_kg
    ? (parseFloat(form.quantity_kg) * parseFloat(form.price_per_kg)).toFixed(2)
    : '0.00'

  return (
    <Layout title="Nouvelle vente">
      <div className="bg-white rounded-3xl border border-gray-100 p-5">
        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Client *</label>
            <select value={form.client_id} onChange={e => setForm(f => ({...f, client_id: e.target.value}))} required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00b4d8] bg-white">
              <option value="">Sélectionner un client</option>
              {clients.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Prise concernée</label>
            <select value={form.catch_id} onChange={e => {
              const selected = catches.find((c: any) => c.id === e.target.value)
              setForm(f => ({...f, catch_id: e.target.value, price_per_kg: selected?.price_per_kg?.toString() || f.price_per_kg}))
            }}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00b4d8] bg-white">
              <option value="">Sélectionner une prise</option>
              {catches.map((c: any) => (
                <option key={c.id} value={c.id}>{c.species} — {c.weight_kg} kg — {new Date(c.catch_date).toLocaleDateString('fr-FR')}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Quantité (kg) *</label>
              <input type="number" step="0.1" min="0" required value={form.quantity_kg}
                onChange={e => setForm(f => ({...f, quantity_kg: e.target.value}))}
                placeholder="Ex: 5.5"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00b4d8]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Prix/kg (€) *</label>
              <input type="number" step="0.01" min="0" required value={form.price_per_kg}
                onChange={e => setForm(f => ({...f, price_per_kg: e.target.value}))}
                placeholder="Ex: 8.50"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00b4d8]" />
            </div>
          </div>

          {form.quantity_kg && form.price_per_kg && (
            <div className="bg-[#e0f7fa] rounded-xl px-4 py-3 flex items-center justify-between">
              <p className="text-sm font-medium text-[#006d77]">Total</p>
              <p className="text-xl font-bold text-[#006d77]">{total} €</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Date *</label>
            <input type="date" value={form.sale_date} required
              onChange={e => setForm(f => ({...f, sale_date: e.target.value}))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00b4d8]" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))}
              rows={3} placeholder="Observations..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00b4d8] resize-none" />
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