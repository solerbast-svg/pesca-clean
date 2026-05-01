import { supabase } from './supabase'

export async function getProfile(userId: string) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
  if (error) throw error
  return data
}

export async function updateProfile(userId: string, updates: any) {
  const { data, error } = await supabase.from('profiles').update(updates).eq('id', userId).select().single()
  if (error) throw error
  return data
}

export async function getCatches(userId: string) {
  const { data, error } = await supabase.from('catches').select('*').eq('user_id', userId).order('catch_date', { ascending: false })
  if (error) throw error
  return data || []
}

export async function createCatch(userId: string, catchData: any) {
  const { data, error } = await supabase.from('catches').insert({ ...catchData, user_id: userId }).select().single()
  if (error) throw error
  return data
}

export async function deleteCatch(id: string) {
  const { error } = await supabase.from('catches').delete().eq('id', id)
  if (error) throw error
}

export async function getClients(userId: string) {
  const { data, error } = await supabase.from('clients').select('*').eq('user_id', userId).order('name')
  if (error) throw error
  return data || []
}

export async function createClient(userId: string, clientData: any) {
  const { data, error } = await supabase.from('clients').insert({ ...clientData, user_id: userId }).select().single()
  if (error) throw error
  return data
}

export async function deleteClient(id: string) {
  const { error } = await supabase.from('clients').delete().eq('id', id)
  if (error) throw error
}

export async function getSales(userId: string) {
  const { data, error } = await supabase.from('sales').select('*, client:clients(*), catch:catches(*)').eq('user_id', userId).order('sale_date', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getGpsPoints(userId: string) {
  const { data, error } = await supabase.from('gps_points').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function createGpsPoint(userId: string, pointData: any) {
  const { data, error } = await supabase.from('gps_points').insert({ ...pointData, user_id: userId }).select().single()
  if (error) throw error
  return data
}

export async function deleteGpsPoint(id: string) {
  const { error } = await supabase.from('gps_points').delete().eq('id', id)
  if (error) throw error
}

export async function getDashboardStats(userId: string) {
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)
  const [catchesRes, salesRes, clientsRes] = await Promise.all([
    supabase.from('catches').select('*').eq('user_id', userId).gte('catch_date', monthStart),
    supabase.from('sales').select('*').eq('user_id', userId).gte('sale_date', monthStart),
    supabase.from('clients').select('id').eq('user_id', userId),
  ])
  const catches = catchesRes.data || []
  const sales = salesRes.data || []
  const clients = clientsRes.data || []
  return {
    totalWeightMonth: catches.reduce((sum: number, c: any) => sum + (c.weight_kg || 0), 0),
    totalRevenueMonth: sales.reduce((sum: number, s: any) => sum + (s.total_amount || 0), 0),
    availableCatches: catches.filter((c: any) => c.status === 'available').length,
    totalClients: clients.length,
    recentCatches: catches.slice(0, 5),
  }
}
