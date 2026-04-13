'use client'
import { useState, useRef, useEffect } from 'react'
import styles from './page.module.css'
import machinesData from '../data/machines.json'

const OPERATIONS = ['Face Milling','Shoulder Milling','Slot Milling','Pocket Milling','High Feed Milling','Ball End Milling','Turning - Roughing','Turning - Finishing','Boring','Drilling','Tapping','Threading','Grooving / Parting','Reaming']
const MATERIALS = ['Aluminum (6061)','Aluminum (7075)','Aluminum Cast','Steel - Low Carbon (1018)','Steel - Medium Carbon (4140)','Steel - Stainless 304','Steel - Stainless 316','Steel - Hardened (>45 HRC)','Cast Iron - Gray','Cast Iron - Ductile','Titanium (Ti-6Al-4V)','Inconel 718','Hastelloy','Copper','Brass','Bronze','Carbon Fiber (CFRP)','Plastics / Nylon']
const HOLDERS = ['Not sure / Standard','ER Collet Chuck','Hydraulic Chuck','Shrink Fit','Milling Chuck (Weldon)','Face Mill Arbor','Capto C4','Capto C5','Capto C6','VDI 30','VDI 40','BMTB 40','BMTB 55','Capto Turning','Quick Change Turret']
const PRIORITIES = ['Longest Tool Life','Highest Metal Removal Rate','Best Surface Finish','Balanced Performance','Lowest Cost','Stability / Chatter Reduction']

type Machine = {
  id: string
  make: string
  model: string
  category: string
  control: string
  spindle_taper: string
  max_rpm: number
  spindle_hp: number
  travel_x_in?: number
  travel_y_in?: number
  travel_z_in?: number
  rapid_ipm?: number
  atc_capacity?: number
  chuck_size_in?: number
  max_turning_dia_in?: number
  max_turning_length_in?: number
  milling_rpm?: number
  search_terms: string[]
}

type Recommendation = {
  rank: number
  manufacturer: string
  productLine: string
  grade: string
  reason: string
  cuttingSpeed: string
  feedRate: string
  toolLife: string
  priceTier: string
  advantage: string
  limitation: string
  mscSearch: string
}

type Result = {
  recommendations: Recommendation[]
  summary: string
  warnings: string[]
}

const MACHINES = machinesData.machines as Machine[]

const TOOL_LIFE_COLOR: Record<string, string> = { Excellent: '#00e676', Good: '#f5c518', Fair: '#e53935' }
const PRICE_COLOR: Record<string, string> = { Budget: '#00e676', Mid: '#f5c518', Premium: '#e53935' }
const RANK_LABEL: Record<number, string> = { 1: 'BEST MATCH', 2: 'RUNNER UP', 3: 'ALTERNATIVE', 4: 'CONSIDER', 5: 'OPTION' }

function searchMachines(query: string): Machine[] {
  if (!query || query.length < 2) return []
  const q = query.toLowerCase()
  return MACHINES.filter(m => {
    const fullName = `${m.make} ${m.model}`.toLowerCase()
    if (fullName.includes(q)) return true
    if (m.model.toLowerCase().includes(q)) return true
    if (m.make.toLowerCase().includes(q)) return true
    return m.search_terms.some(t => t.toLowerCase().includes(q))
  }).slice(0, 6)
}

export default function Home() {
  const [form, setForm] = useState({
    operation: '', material: '', hardness: '', machine: '', rpm: '', sfm: '',
    doc: '', woc: '', holder: '', priority: 'Balanced Performance', notes: ''
  })
  const [machineQuery, setMachineQuery] = useState('')
  const [machineResults, setMachineResults] = useState<Machine[]>([])
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<number | null>(0)
  const machineRef = useRef<HTMLDivElement>(null)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (machineRef.current && !machineRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const onMachineInput = (val: string) => {
    setMachineQuery(val)
    setSelectedMachine(null)
    set('machine', val)
    const results = searchMachines(val)
    setMachineResults(results)
    setShowDropdown(results.length > 0)
  }

  const selectMachine = (m: Machine) => {
    setSelectedMachine(m)
    setMachineQuery(`${m.make} ${m.model}`)
    set('machine', `${m.make} ${m.model} (${m.category}, ${m.spindle_taper}, ${m.max_rpm} RPM, ${m.spindle_hp}HP)`)
    set('rpm', String(m.max_rpm))
    const holderMap: Record<string, string> = {
      'CAT40': 'ER Collet Chuck', 'CAT50': 'Face Mill Arbor',
      'BT40': 'ER Collet Chuck', 'BT50': 'Face Mill Arbor',
      'BT30': 'ER Collet Chuck', 'HSK-A63': 'Hydraulic Chuck',
      'HSK-E50': 'Shrink Fit',
    }
    if (holderMap[m.spindle_taper]) set('holder', holderMap[m.spindle_taper])
    setShowDropdown(false)
    setMachineResults([])
  }

  const clearMachine = () => {
    setSelectedMachine(null)
    setMachineQuery('')
    set('machine', '')
    set('rpm', '')
    set('holder', '')
  }

  const submit = async () => {
    if (!form.operation || !form.material || !form.machine) {
      setError('Please fill in Operation, Material and Machine at minimum.')
      return
    }
    setError('')
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
      setExpanded(0)
    } catch (e) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const mscUrl = (search: string) => `https://www.mscdirect.com/search/?searchterm=${encodeURIComponent(search)}`

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>
            <span className={styles.logoG28}>G28</span>
            <span className={styles.logoWorks}>WORKS</span>
            <span className={styles.logoDot}></span>
          </div>
          <div className={styles.headerTag}>CNC TOOLING ADVISOR</div>
        </div>
        <div className={styles.headerRule}></div>
      </header>

      <main className={styles.main}>
        <div className={styles.hero}>
          <div className={styles.heroEyebrow}>AI-POWERED TOOLING INTELLIGENCE</div>
          <h1 className={styles.heroTitle}>
            FIND THE RIGHT<br/>
            <span className={styles.heroAccent}>CUTTING TOOL</span><br/>
            INSTANTLY
          </h1>
          <p className={styles.heroSub}>Tell us your machine, material and operation. Get ranked recommendations from Sandvik, Kennametal, Iscar, Walter, Seco and more.</p>
        </div>

        <div className={styles.layout}>
          <div className={styles.formPanel}>

            <div className={styles.formSection}>
              <div className={styles.sectionLabel}>
                <span className={styles.sectionNum}>01</span>
                <span>OPERATION & MATERIAL</span>
              </div>
              <div className={styles.fieldGrid}>
                <div className={styles.field}>
                  <label className={styles.label}>Operation <span className={styles.req}>*</span></label>
                  <select className={styles.select} value={form.operation} onChange={e => set('operation', e.target.value)}>
                    <option value="">Select operation...</option>
                    {OPERATIONS.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Material <span className={styles.req}>*</span></label>
                  <select className={styles.select} value={form.material} onChange={e => set('material', e.target.value)}>
                    <option value="">Select material...</option>
                    {MATERIALS.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Hardness (optional)</label>
                  <input className={styles.input} placeholder="e.g. 42 HRC or 280 HB" value={form.hardness} onChange={e => set('hardness', e.target.value)} />
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <div className={styles.sectionLabel}>
                <span className={styles.sectionNum}>02</span>
                <span>MACHINE & SPEEDS</span>
              </div>
              <div className={styles.fieldGrid}>

                <div className={`${styles.field} ${styles.fieldFull}`} ref={machineRef}>
                  <label className={styles.label}>Machine Model <span className={styles.req}>*</span></label>
                  <div className={styles.machineSearch}>
                    <input
                      className={`${styles.input} ${selectedMachine ? styles.inputMatched : ''}`}
                      placeholder="Type model — e.g. VF-2SS, NLX 2500, DMU 50, Puma 2600..."
                      value={machineQuery}
                      onChange={e => onMachineInput(e.target.value)}
                      onFocus={() => machineResults.length > 0 && setShowDropdown(true)}
                    />
                    {selectedMachine && (
                      <button className={styles.clearBtn} onClick={clearMachine}>✕</button>
                    )}
                    {showDropdown && machineResults.length > 0 && (
                      <div className={styles.machineDropdown}>
                        {machineResults.map(m => (
                          <div key={m.id} className={styles.machineOption} onClick={() => selectMachine(m)}>
                            <div className={styles.machineOptionMain}>
                              <span className={styles.machineOptionMake}>{m.make}</span>
                              <span className={styles.machineOptionModel}>{m.model}</span>
                              <span className={styles.machineOptionCat}>{m.category}</span>
                            </div>
                            <div className={styles.machineOptionSpecs}>
                              {m.spindle_taper} · {m.max_rpm.toLocaleString()} RPM · {m.spindle_hp}HP · {m.control}
                            </div>
                          </div>
                        ))}
                        <div className={styles.machineDropdownFooter}>
                          Not listed? Just keep typing your machine details
                        </div>
                      </div>
                    )}
                  </div>
                  {selectedMachine && (
                    <div className={styles.machineChip}>
                      <span className={styles.chipIcon}>✓</span>
                      <span>{selectedMachine.make} {selectedMachine.model}</span>
                      <span className={styles.chipSep}>·</span>
                      <span>{selectedMachine.spindle_taper}</span>
                      <span className={styles.chipSep}>·</span>
                      <span>{selectedMachine.max_rpm.toLocaleString()} RPM</span>
                      <span className={styles.chipSep}>·</span>
                      <span>{selectedMachine.spindle_hp}HP</span>
                      <span className={styles.chipSep}>·</span>
                      <span>{selectedMachine.control}</span>
                    </div>
                  )}
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Max Spindle RPM</label>
                  <input className={styles.input} placeholder="Auto-filled from machine" value={form.rpm} onChange={e => set('rpm', e.target.value)} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Max SFM / Cutting Speed</label>
                  <input className={styles.input} placeholder="e.g. 600 SFM or 180 m/min" value={form.sfm} onChange={e => set('sfm', e.target.value)} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Depth of Cut</label>
                  <input className={styles.input} placeholder='e.g. 0.100" or 2.5mm' value={form.doc} onChange={e => set('doc', e.target.value)} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Width of Cut / Stepover</label>
                  <input className={styles.input} placeholder='e.g. 0.500" or 12mm' value={form.woc} onChange={e => set('woc', e.target.value)} />
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <div className={styles.sectionLabel}>
                <span className={styles.sectionNum}>03</span>
                <span>TOOLING & PRIORITY</span>
              </div>
              <div className={styles.fieldGrid}>
                <div className={styles.field}>
                  <label className={styles.label}>Tool Holder / Interface</label>
                  <select className={styles.select} value={form.holder} onChange={e => set('holder', e.target.value)}>
                    <option value="">Select holder...</option>
                    {HOLDERS.map(h => <option key={h}>{h}</option>)}
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Priority</label>
                  <select className={styles.select} value={form.priority} onChange={e => set('priority', e.target.value)}>
                    {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label className={styles.label}>Additional Notes</label>
                  <textarea className={styles.textarea} placeholder="Specific challenges, batch size, coolant, existing tooling..." value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} />
                </div>
              </div>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <button className={styles.submitBtn} onClick={submit} disabled={loading}>
              {loading ? (
                <span className={styles.loadingInner}>
                  <span className={styles.spinner}></span>
                  ANALYZING...
                </span>
              ) : '⚡ GET TOOLING RECOMMENDATIONS'}
            </button>
          </div>

          {result && (
            <div className={styles.resultsPanel}>
              <div className={styles.resultsHeader}>
                <div className={styles.resultsTitle}>RECOMMENDATIONS</div>
                <div className={styles.resultsSummary}>{result.summary}</div>
                <div className={styles.mdAttribution}>
                  <span className={styles.mdAttrLabel}>GRADE DATA</span>
                  <a href="https://www.machiningdoctor.com/charts/carbide-grades-chart/" target="_blank" rel="noopener noreferrer" className={styles.mdAttrLink}>
                    <span className={styles.mdAttrLogo}>⚕</span>
                    <span>MachiningDoctor.com</span>
                  </a>
                </div>
              </div>

              {result.warnings?.length > 0 && (
                <div className={styles.warnings}>
                  {result.warnings.map((w, i) => <div key={i} className={styles.warning}>⚠ {w}</div>)}
                </div>
              )}

              <div className={styles.recList}>
                {result.recommendations.map((rec, i) => (
                  <div key={i} className={`${styles.recCard} ${i === 0 ? styles.recCardTop : ''}`}>
                    <div className={styles.recHeader} onClick={() => setExpanded(expanded === i ? null : i)}>
                      <div className={styles.recLeft}>
                        <div className={styles.recRank} style={{ color: i === 0 ? 'var(--g28-yellow)' : 'var(--g28-muted)' }}>#{rec.rank}</div>
                        <div>
                          <div className={styles.recLabel} style={{ color: i === 0 ? 'var(--g28-yellow)' : 'var(--g28-muted)' }}>{RANK_LABEL[rec.rank]}</div>
                          <div className={styles.recMfr}>{rec.manufacturer}</div>
                          <div className={styles.recProduct}>{rec.productLine} — <span className={styles.recGrade}>{rec.grade}</span></div>
                        </div>
                      </div>
                      <div className={styles.recMeta}>
                        <span className={styles.badge} style={{ color: TOOL_LIFE_COLOR[rec.toolLife] || 'var(--g28-text)', borderColor: TOOL_LIFE_COLOR[rec.toolLife] || 'var(--g28-border)' }}>{rec.toolLife} Life</span>
                        <span className={styles.badge} style={{ color: PRICE_COLOR[rec.priceTier] || 'var(--g28-text)', borderColor: PRICE_COLOR[rec.priceTier] || 'var(--g28-border)' }}>{rec.priceTier}</span>
                        <span className={styles.chevron}>{expanded === i ? '▲' : '▼'}</span>
                      </div>
                    </div>
                    {expanded === i && (
                      <div className={styles.recBody}>
                        <p className={styles.recReason}>{rec.reason}</p>
                        <div className={styles.recDataGrid}>
                          <div className={styles.recDataItem}><span className={styles.recDataLabel}>Cutting Speed</span><span className={styles.recDataValue}>{rec.cuttingSpeed}</span></div>
                          <div className={styles.recDataItem}><span className={styles.recDataLabel}>Feed Rate</span><span className={styles.recDataValue}>{rec.feedRate}</span></div>
                          <div className={styles.recDataItem}><span className={styles.recDataLabel}>Advantage</span><span className={styles.recDataValue}>{rec.advantage}</span></div>
                          <div className={styles.recDataItem}><span className={styles.recDataLabel}>Limitation</span><span className={styles.recDataValue}>{rec.limitation}</span></div>
                        </div>
                        <div className={styles.recActions}>
                          <a href={mscUrl(rec.mscSearch)} target="_blank" rel="noopener noreferrer" className={styles.mscBtn}>🛒 Find on MSC Industrial →</a>
                          <a href={`https://www.machiningdoctor.com/grades/gradeinfo/?grade=${encodeURIComponent(rec.grade)}`} target="_blank" rel="noopener noreferrer" className={styles.mdBtn}>⚕ Grade Data on MachiningDoctor →</a>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className={styles.disclaimer}>
                Recommendations are AI-generated. Grade data referenced from <a href="https://www.machiningdoctor.com" target="_blank" rel="noopener noreferrer" style={{color:'var(--g28-yellow)'}}>MachiningDoctor.com</a>. Always verify with manufacturer data sheets before production use.
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span className={styles.footerLogo}>G28 WORKS</span>
          <span className={styles.footerText}>CNC Tooling Intelligence</span>
          <span className={styles.footerText}>g28works.com</span>
        </div>
      </footer>
    </div>
  )
}
