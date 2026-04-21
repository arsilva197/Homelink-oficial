// HomeLink — Data Access Layer
//
// Every exported function:
//   1. Tries Supabase when isSupabaseEnabled is true
//   2. Falls back to the static mock arrays when not configured
//
// The module re-exports MOCK_* constants so callers can initialise
// React state from them while the first async fetch completes.

import { supabase, isSupabaseEnabled } from './supabase'
import {
  PROPS        as MOCK_PROPS,
  INTERESTS    as MOCK_INTERESTS,
  CHAINS       as MOCK_CHAINS,
  OPPS         as MOCK_OPPS,
  USERS_DATA   as MOCK_USERS,
  BROKERS_DATA as MOCK_BROKERS,
  AGENCIES_DATA as MOCK_AGENCIES,
  COMM_HISTORY as MOCK_COMM_HISTORY,
  ALERTS       as MOCK_ALERTS,
} from '../data/mockData'

export { MOCK_PROPS, MOCK_INTERESTS, MOCK_CHAINS, MOCK_OPPS,
         MOCK_USERS, MOCK_BROKERS, MOCK_AGENCIES, MOCK_COMM_HISTORY, MOCK_ALERTS }

// ── Internal helpers ───────────────────────────────────────────

/** Merges commissions rows into their parent opportunity object */
function mergeCommissionsIntoOpps(opps, commissions) {
  return opps.map(opp => ({
    ...opp,
    split: opp.split || { broker:0, agency:0, platform:6 },
    commissions: commissions
      .filter(c => c.opp_id === opp.id)
      .map(c => ({
        ref:    c.id,
        seller: c.seller,
        pid:    c.pid,
        amount: c.amount,
        status: c.status,
        dd:     c.dd,
      })),
  }))
}

/** Throw with a descriptive prefix so errors are easy to spot */
function dbError(fn, err) {
  console.error(`[db.${fn}]`, err?.message || err)
}

// ═══════════════════════════════════════════════════════════════
//  PROPERTIES
// ═══════════════════════════════════════════════════════════════

/** Fetch all properties. Returns an array (never throws). */
export async function fetchProperties() {
  if (!isSupabaseEnabled) return MOCK_PROPS

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .order('reg', { ascending: false })

  if (error) { dbError('fetchProperties', error); return MOCK_PROPS }
  return data || []
}

/** Insert a new property. Returns the inserted row or null. */
export async function insertProperty(payload) {
  if (!isSupabaseEnabled) return null

  const row = {
    id:              `PROP-${Date.now()}`,
    name:            payload.name,
    en:              payload.en || payload.name,
    type:            payload.type,
    city:            payload.city,
    hood:            payload.hood || '',
    price:           Number(payload.price),
    size:            Number(payload.size) || 0,
    beds:            Number(payload.beds) || 0,
    baths:           Number(payload.baths) || 0,
    park:            Number(payload.park) || 0,
    status:          'pendente',
    chain:           null,
    owner:           payload.owner || 'usuario',
    fav:             false,
    reg:             new Date().toISOString().slice(0, 10),
    approval_status: 'pending',
    audit:           payload.audit || [],
    user_id:         payload.user_id || null,
  }

  const { data, error } = await supabase.from('properties').insert(row).select().single()
  if (error) { dbError('insertProperty', error); return null }
  return data
}

/** Update a property's status and append an audit entry. */
export async function updatePropertyStatus(id, action) {
  if (!isSupabaseEnabled) return true

  const now = new Date().toISOString().slice(0, 10)
  const statusMap   = { pause:'pausado', activate:'ativo', remove:'cancelado' }
  const eventMap    = { pause:'Status: Pausado', activate:'Status: Ativo', remove:'Status: Cancelado' }
  const newStatus   = statusMap[action]
  const auditEntry  = { date:now, event:eventMap[action], user:'Usuário', type:'status' }

  // Append audit entry using jsonb_insert / array_append
  const { error } = await supabase.rpc('append_property_audit', {
    prop_id: id,
    new_status: newStatus,
    audit_entry: auditEntry,
  })

  if (error) {
    // Fallback: plain update without audit append
    const { error: e2 } = await supabase.from('properties')
      .update({ status: newStatus }).eq('id', id)
    if (e2) { dbError('updatePropertyStatus', e2); return false }
  }
  return true
}

/** Approve a pending property (admin). */
export async function approveProperty(id) {
  if (!isSupabaseEnabled) return true

  const now = new Date().toISOString().slice(0, 10)
  const { error } = await supabase.from('properties').update({
    status:          'ativo',
    approval_status: 'approved',
  }).eq('id', id)

  if (error) { dbError('approveProperty', error); return false }
  return true
}

/** Reject a pending property (admin). */
export async function rejectProperty(id) {
  if (!isSupabaseEnabled) return true

  const { error } = await supabase.from('properties').update({
    status:          'cancelado',
    approval_status: 'rejected',
  }).eq('id', id)

  if (error) { dbError('rejectProperty', error); return false }
  return true
}

// ═══════════════════════════════════════════════════════════════
//  INTERESTS
// ═══════════════════════════════════════════════════════════════

export async function fetchInterests() {
  if (!isSupabaseEnabled) return MOCK_INTERESTS

  const { data, error } = await supabase
    .from('interests')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) { dbError('fetchInterests', error); return MOCK_INTERESTS }
  return data || []
}

export async function insertInterest(payload) {
  if (!isSupabaseEnabled) return null

  const row = {
    id:              `INT-${Date.now()}`,
    owner:           payload.owner || 'usuario',
    title:           payload.title,
    en:              payload.en || payload.title,
    type:            payload.type,
    city:            payload.city,
    hood:            payload.hood || '',
    min_p:           Number(payload.min_p) || 0,
    max_p:           Number(payload.max_p) || 0,
    min_size:        Number(payload.min_size) || 0,
    min_beds:        Number(payload.min_beds) || 0,
    notes:           payload.notes || '',
    status:          'ATIVO',
    sourcing_status: 'PENDENTE',
    user_id:         payload.user_id || null,
  }

  const { data, error } = await supabase.from('interests').insert(row).select().single()
  if (error) { dbError('insertInterest', error); return null }
  return data
}

export async function updateInterest(id, payload) {
  if (!isSupabaseEnabled) return true

  const { error } = await supabase.from('interests').update({
    title:    payload.title,
    type:     payload.type,
    city:     payload.city,
    hood:     payload.hood,
    min_p:    Number(payload.min_p),
    max_p:    Number(payload.max_p),
    min_size: Number(payload.min_size),
    min_beds: Number(payload.min_beds),
    notes:    payload.notes,
  }).eq('id', id)

  if (error) { dbError('updateInterest', error); return false }
  return true
}

/** Change interest workflow status (ATIVO / PAUSADO / CANCELADO) */
export async function updateInterestStatus(id, status) {
  if (!isSupabaseEnabled) return true

  const { error } = await supabase.from('interests').update({ status }).eq('id', id)
  if (error) { dbError('updateInterestStatus', error); return false }
  return true
}

/** Change sourcing status for admin (PENDENTE / BUSCANDO / RESOLVIDO / DISPENSADO) */
export async function updateSourcingStatus(id, sourcingStatus) {
  if (!isSupabaseEnabled) return true

  const { error } = await supabase.from('interests')
    .update({ sourcing_status: sourcingStatus }).eq('id', id)
  if (error) { dbError('updateSourcingStatus', error); return false }
  return true
}

// ═══════════════════════════════════════════════════════════════
//  CHAINS
// ═══════════════════════════════════════════════════════════════

export async function fetchChains() {
  if (!isSupabaseEnabled) return MOCK_CHAINS

  const { data, error } = await supabase.from('chains').select('*')
  if (error) { dbError('fetchChains', error); return MOCK_CHAINS }
  return data || []
}

// ═══════════════════════════════════════════════════════════════
//  OPPORTUNITIES  (joined with commissions)
// ═══════════════════════════════════════════════════════════════

export async function fetchOpportunities() {
  if (!isSupabaseEnabled) return MOCK_OPPS

  const [{ data: opps, error: oppsErr }, { data: comms, error: commsErr }] =
    await Promise.all([
      supabase.from('opportunities').select('*').order('created_at', { ascending: false }),
      supabase.from('commissions').select('*'),
    ])

  if (oppsErr)  { dbError('fetchOpportunities/opps',  oppsErr);  return MOCK_OPPS }
  if (commsErr) { dbError('fetchOpportunities/comms', commsErr); return MOCK_OPPS }

  return mergeCommissionsIntoOpps(opps || [], comms || [])
}

/** Advance or retreat pipeline step */
export async function updateOpportunityPipeline(id, si, status) {
  if (!isSupabaseEnabled) return true

  const { error } = await supabase.from('opportunities').update({ si, status }).eq('id', id)
  if (error) { dbError('updateOpportunityPipeline', error); return false }
  return true
}

/** Assign broker and/or agency to an opportunity */
export async function updateOpportunityAssignment(id, broker, agency) {
  if (!isSupabaseEnabled) return true

  const { error } = await supabase.from('opportunities').update({
    broker:    broker?.name    || null,
    broker_id: broker?.id      || null,
    agency:    agency?.name    || null,
    agency_id: agency?.id      || null,
  }).eq('id', id)

  if (error) { dbError('updateOpportunityAssignment', error); return false }
  return true
}

/** Update commission percentage split */
export async function updateOpportunitySplit(id, split) {
  if (!isSupabaseEnabled) return true

  const { error } = await supabase.from('opportunities').update({ split }).eq('id', id)
  if (error) { dbError('updateOpportunitySplit', error); return false }
  return true
}

// ═══════════════════════════════════════════════════════════════
//  COMMISSIONS
// ═══════════════════════════════════════════════════════════════

/** Update a single commission's payment status */
export async function updateCommissionStatus(ref, status) {
  if (!isSupabaseEnabled) return true

  const { error } = await supabase.from('commissions').update({ status }).eq('id', ref)
  if (error) { dbError('updateCommissionStatus', error); return false }
  return true
}

// ═══════════════════════════════════════════════════════════════
//  BOOTSTRAP  — load everything in one round trip
// ═══════════════════════════════════════════════════════════════

/**
 * Load all app data.
 * Returns { props, interests, chains, opps } — each is an array.
 * Falls back to mock arrays on any failure.
 */
export async function bootstrapData() {
  if (!isSupabaseEnabled) {
    return {
      props:     MOCK_PROPS,
      interests: MOCK_INTERESTS,
      chains:    MOCK_CHAINS,
      opps:      MOCK_OPPS,
    }
  }

  const [
    { data: propsData,  error: propsErr  },
    { data: intsData,   error: intsErr   },
    { data: chainsData, error: chainsErr },
    { data: oppsData,   error: oppsErr   },
    { data: commsData,  error: commsErr  },
  ] = await Promise.all([
    supabase.from('properties').select('*').order('reg',        { ascending: false }),
    supabase.from('interests').select('*').order('created_at',  { ascending: false }),
    supabase.from('chains').select('*'),
    supabase.from('opportunities').select('*').order('created_at', { ascending: false }),
    supabase.from('commissions').select('*'),
  ])

  if (propsErr)  console.warn('[db.bootstrap] properties error:', propsErr.message)
  if (intsErr)   console.warn('[db.bootstrap] interests error:',  intsErr.message)
  if (chainsErr) console.warn('[db.bootstrap] chains error:',     chainsErr.message)
  if (oppsErr)   console.warn('[db.bootstrap] opportunities error:', oppsErr.message)

  const mergedOpps = mergeCommissionsIntoOpps(
    oppsData  || MOCK_OPPS,
    commsData || []
  )

  return {
    props:     propsData  || MOCK_PROPS,
    interests: intsData   || MOCK_INTERESTS,
    chains:    chainsData || MOCK_CHAINS,
    opps:      mergedOpps,
  }
}
