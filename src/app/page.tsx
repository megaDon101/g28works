'use client'
import { useState } from 'react'
import styles from './page.module.css'

const OPERATIONS = ['Face Milling','Shoulder Milling','Slot Milling','Pocket Milling','High Feed Milling','Ball End Milling','Turning - Roughing','Turning - Finishing','Boring','Drilling','Tapping','Threading','Grooving / Parting','Reaming']
const MATERIALS = ['Aluminum (6061)','Aluminum (7075)','Aluminum Cast','Steel - Low Carbon (1018)','Steel - Medium Carbon (4140)','Steel - Stainless 304','Steel - Stainless 316','Steel - Hardened (>45 HRC)','Cast Iron - Gray','Cast Iron - Ductile','Titanium (Ti-6Al-4V)','Inconel 718','Hastelloy','Copper','Brass','Bronze','Carbon Fiber (CFRP)','Plastics / Nylon']
const MACHINES = ['VMC - 40 Taper (CAT40/BT40)','VMC - 50 Taper (CAT50/BT50)','VMC - HSK-A63','HMC - 40 Taper','HMC - 50 Taper','CNC Lathe - Turret','CNC Lathe - Live Tooling','Multi-Axis Turn-Mill','5-Axis Machining Center','Swiss-Type Lathe','Boring Mill','Manual Mill','Manual Lathe']
const HOLDERS = ['Not sure / Standard','ER Collet Chuck','Hydraulic Chuck','Shrink Fit','Milling Chuck (Weldon)','Face Mill Arbor','Capto C4','Capto C5','Capto C6','VDI 30','VDI 40','BMTB 40','BMTB 55','Capto Turning','Quick Change Turret']
const PRIORITIES = ['Longest Tool Life','Highest Metal Removal Rate','Best Surface Finish','Balanced Performance','Lowest Cost','Stability / Chatter Reduction']

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

const TOOL_LIFE_COLOR: Record<string, string> = { Excellent: '#00e676', Good: '#f5c518', Fair: '#e53935' }
const PRICE_COLOR: Record<string, string> = { Budget: '#00e676', Mid: '#f5c518', Premium: '#e53935' }
const RANK_LABEL: Record<number, string> = { 1: 'BEST MATCH', 2: 'RUNNER UP', 3: 'ALTERNATIVE', 4: 'CONSIDER', 5: 'OPTION' }

export default function Home() {
  const [form, setForm] = useState({
    operation: '', material: '', hardness: '', machine: '', rpm: '', sfm: '',
    doc: '', woc: '', holder: '', priority: 'Balanced Performance', notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<number | null>(0)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    if (!form.operation || !form.material || !form.machine) {
      setError('Please fill in Operation, Material and Machine at minimum.')
      return
    }
    setError('')
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/recommend', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
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
      {/* Header */}
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
        {/* Hero */}
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
          {/* Form */}
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
                <div className={styles.field}>
                  <label className={styles.label}>Machine Type <span className={styles.req}>*</span></label>
                  <select className={styles.select} value={form.machine} onChange={e => set('machine', e.target.value)}>
                    <option value="">Select machine...</option>
                    {MACHINES.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Max Spindle RPM</label>
                  <input className={styles.input} placeholder="e.g. 8000" value={form.rpm} onChange={e => set('rpm', e.target.value)} />
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
                  <textarea className={styles.textarea} placeholder="Any other details — ISO/EDP number of existing holder, specific challenges, batch size, coolant availability..." value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} />
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
              ) : (
                '⚡ GET TOOLING RECOMMENDATIONS'
              )}
            </button>
          </div>

          {/* Results */}
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
                  {result.warnings.map((w, i) => (
                    <div key={i} className={styles.warning}>⚠ {w}</div>
                  ))}
                </div>
              )}

              <div className={styles.recList}>
                {result.recommendations.map((rec, i) => (
                  <div key={i} className={`${styles.recCard} ${i === 0 ? styles.recCardTop : ''}`}>
                    <div className={styles.recHeader} onClick={() => setExpanded(expanded === i ? null : i)}>
                      <div className={styles.recLeft}>
                        <div className={styles.recRank} style={{ color: i === 0 ? 'var(--g28-yellow)' : 'var(--g28-muted)' }}>
                          #{rec.rank}
                        </div>
                        <div>
                          <div className={styles.recLabel} style={{ color: i === 0 ? 'var(--g28-yellow)' : 'var(--g28-muted)' }}>
                            {RANK_LABEL[rec.rank]}
                          </div>
                          <div className={styles.recMfr}>{rec.manufacturer}</div>
                          <div className={styles.recProduct}>{rec.productLine} — <span className={styles.recGrade}>{rec.grade}</span></div>
                        </div>
                      </div>
                      <div className={styles.recMeta}>
                        <span className={styles.badge} style={{ color: TOOL_LIFE_COLOR[rec.toolLife] || 'var(--g28-text)', borderColor: TOOL_LIFE_COLOR[rec.toolLife] || 'var(--g28-border)' }}>
                          {rec.toolLife} Life
                        </span>
                        <span className={styles.badge} style={{ color: PRICE_COLOR[rec.priceTier] || 'var(--g28-text)', borderColor: PRICE_COLOR[rec.priceTier] || 'var(--g28-border)' }}>
                          {rec.priceTier}
                        </span>
                        <span className={styles.chevron}>{expanded === i ? '▲' : '▼'}</span>
                      </div>
                    </div>

                    {expanded === i && (
                      <div className={styles.recBody}>
                        <p className={styles.recReason}>{rec.reason}</p>
                        <div className={styles.recDataGrid}>
                          <div className={styles.recDataItem}>
                            <span className={styles.recDataLabel}>Cutting Speed</span>
                            <span className={styles.recDataValue}>{rec.cuttingSpeed}</span>
                          </div>
                          <div className={styles.recDataItem}>
                            <span className={styles.recDataLabel}>Feed Rate</span>
                            <span className={styles.recDataValue}>{rec.feedRate}</span>
                          </div>
                          <div className={styles.recDataItem}>
                            <span className={styles.recDataLabel}>Advantage</span>
                            <span className={styles.recDataValue}>{rec.advantage}</span>
                          </div>
                          <div className={styles.recDataItem}>
                            <span className={styles.recDataLabel}>Limitation</span>
                            <span className={styles.recDataValue}>{rec.limitation}</span>
                          </div>
                        </div>
                        <div className={styles.recActions}>
                          <a href={mscUrl(rec.mscSearch)} target="_blank" rel="noopener noreferrer" className={styles.mscBtn}>
                            🛒 Find on MSC Industrial →
                          </a>
                          <a href={`https://www.machiningdoctor.com/grades/gradeinfo/?grade=${encodeURIComponent(rec.grade)}`} target="_blank" rel="noopener noreferrer" className={styles.mdBtn}>
                            ⚕ Grade Data on MachiningDoctor →
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className={styles.disclaimer}>
                Recommendations are AI-generated based on general machining knowledge. Grade data referenced from <a href="https://www.machiningdoctor.com" target="_blank" rel="noopener noreferrer" style={{color:'var(--g28-yellow)'}}>MachiningDoctor.com</a>. Always verify speeds, feeds and tooling specifications with manufacturer data sheets before production use. G28 Works is not liable for tooling decisions made based on these suggestions.
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
