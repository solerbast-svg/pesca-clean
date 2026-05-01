'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '../../../components/Layout'
import { supabase } from '../../../lib/supabase'
import { getCatches, getClients, createSale, createClient } from '../../../lib/crud'

export default function NewSalePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [catches, setCatches] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [filteredClients, setFilteredClients] = useState<any[]>([])
  const [showClientList, setShowClientList] = useState(false)
  const [clientSearch, setClientSearch] = useState('')
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [showNewClient, setShowNewClient] = useState(false)
  const [newClientName, setNewClientName] = useState('')
  const [newClientType, setNewClientType] = useState('')
  const [newClientPhone, setNewClientPhone] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [form, setForm] = useState({
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
      setUserId(user.id)
      const [c, cl] = await Promise.all([
        getCatches(user.id),
        getClients(user.id),
      ])
      setCatches(c.filter((c: any) => c.status !== 'expired'))
      setClients(cl)
    }
    load()
  }, [])

  const handleClientSearch = (value: string) => {
    setClientSearch(value)
    setSelectedClient(null)
    if (value.length < 2) { setFilteredClients([]); setShowClientList(false); return }
    const filtered = clients.filter((c: any) => c.name.toLowerCase().includes(value.toLowerCase()))
    setFilteredClients(filtered)
    setShowClientList(true)
  }

  const selectClient = (client: any) => {
    setSelectedClient(client)
    setClientSearch(client.name)
    setShowClientList(false)
  }

  const handleAddClient = async () => {
    if (!userId || !newClientName) return
    const newClient = await createClient(userId, {
      name: newClientName, type: newClientType || null,
      phone: newClientPhone || null, contact_name: null,
      email: null, notes: null, preferred_species: null
    })
    setClients([...clients, newClient])
    selectClient(newClient)
    setShowNewClient(false)
    setNewClientName('')
    setNewClientType('')
    setNewClientPhone('')
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    if (!selectedClient) { alert('Veuillez sélectionner un client'); return }
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non connecté')
      await createSale(user.id, {
        client_id: selectedClient.id,
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-gray-700">Client *</label>
              <button type="button" onClick={() => setShowNewClient(!showNewClient)}
                className="text-xs text-[#00b4d8] font-semibold">
                {showNewClient ? '— Annuler' : '+ Nouveau client'}
              </button>
            </div>
            {showNewClient ? (
              <div className="bg-[#f0f7ff] rounded-xl p-4 space-y-3">
                <input type="text" value={newClientName} onChange={e => setNewClientName(e.target.value)}
                  placeholder="Nom du client *" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00b4d8]" />
                <select value={newClientType} onChange={e => setNewClientType(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#00b4d8]">
                  <option value="">Type</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="hotel">Hôtel</option>
                  <option value="particulier">Particulier</option>
                  <option value="autre">Autre</option>
                </select>
                <input type="tel" value={newClientPhone} onChange={e => setNewClientPhone(e.target.value)}
                  placeholder="Téléphone" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00b4d8]" />
                <button type="button" onClick={handleAddClient}
                  className="w-full bg-[#0f2942] text-white py-3 rounded-xl text-sm font-bold">
                  Créer et sélectionner
                </button>
              </div>
            ) : (
              <div className="relative">
                <input type="text" value={clientSearch}
                  onChange={e => handleClientSearch(e.target.value)}
                  onBlur={() => setTimeout(() => setShowClientList(false), 200)}
                  placeholder="Tapez 2 lettres pour chercher..."
                  className={`w-full border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00b4d8] ${selectedClient ? 'border-[#00b4d8] bg-[#f0fcff]' : 'border-gray-200'}`}
                />
                {selectedClient && (
                  <span className="absolute right-3 top-3 text-[#00b4d8] text-lg">✓</span>
                )}
                {showClientList && filteredClients.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto">
                    {filteredClients.map((c: any) => (
                      <button key={c.id} type="button" onClick={() => selectClient(c)}
                        className="w-full text-left px-4 py-3 hover:bg-[#f0f7ff] flex items-center gap-3 border-b border-gray-50 last:border-0">
                        <span>{c.type === 'restaurant' ? '🍽️' : c.type === 'hotel' ? '🏨' : '👤'}</span>
                        <p className="font-medium text-[#0f2942] text-sm">{c.name}</p>
                      </button>
                    ))}
                  </div>
                )}
                {showClientList && filteredClients.length === 0 && clientSearch.length >= 2 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 px-4 py-3 text-sm text-gray-400">
                    Aucun client trouvé — utilisez "+ Nouveau client"
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Prise concernée</label>
            <select value={form.catch_id} onChange={e => {
              const selected = catches.find((c: any) => c.id === e.target.value)
              setForm(f => ({...f, catch_id: e.target.value, price_per_kg: selected?.price_per_kg?.toString() || f.price_per_kg}))
            }} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00b4d8] bg-white">
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
              {loading ? 'Enregistrement...' : 'Valider la vente'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}