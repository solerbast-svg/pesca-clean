'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Layout from '../../components/Layout'
import { supabase } from '../../lib/supabase'
import { getSales, deleteSale } from '../../lib/crud'
import { Plus, Trash2, ShoppingCart } from 'lucide-react'

export default function SalesPage() {
  const router = useRouter()
  const [sales, setSales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const data = await getSales(user.id)
      setSales(data)
      setLoading(false)
    }
    load()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette vente ?')) return
    await deleteSale(id)
    setSales(sales.filter((s: any) => s.id !== id))
  }

  const total = sales.reduce((sum: number, s: any) => sum + (s.total_amount || 0), 0)

  return (
    <Layout title="Ventes">
      <Link href="/sales/new"
        className="flex items-center justify-center gap-2 bg-[#0f2942] text-white rounded-2xl py-4 px-6 text-base font-bold mb-4 hover:bg-[#1a3d5c] transition">
        <Plus size={22} />Nouvelle vente
      </Link>

      {sales.length > 0 && (
        <div className="bg-[#00b4d8] rounded-2xl p-4 mb-5 text-white flex items-center justify-between">
          <p className="font-medium">Total ventes</p>
          <p className="text-2xl font-bold">{total.toFixed(2)} €</p>
        </div>
      )}

      {loading ? (
        <div className="text-center text-gray-400 py-12">Chargement...</div>
      ) : sales.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingCart size={48} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">Aucune vente</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sales.map((s: any) => (
            <div key={s.id} className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-bold text-[#0f2942]">{s.client?.name || 'Client inconnu'}</p>
                  <p className="text-sm text-gray-400">{s.catch?.species || ''} · {s.quantity_kg} kg · {s.price_per_kg}€/kg</p>
                  <p className="text-xs text-gray-300 mt-1">{new Date(s.sale_date).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="text-right flex items-start gap-3">
                  <p className="text-lg font-bold text-[#00b4d8]">{s.total_amount.toFixed(2)} €</p>
                  <button onClick={() => handleDelete(s.id)} className="text-gray-300 hover:text-red-400 transition">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              {s.notes && <p className="text-xs text-gray-400 mt-2 border-t border-gray-50 pt-2">{s.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}