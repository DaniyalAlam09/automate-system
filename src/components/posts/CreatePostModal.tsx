'use client'

import { useState, useRef } from 'react'
import type { InstagramAccount, ScheduledPost, MediaType } from '@/types'

interface Props {
  igAccounts: InstagramAccount[]
  onClose: () => void
  onCreated: (post: ScheduledPost) => void
}

type Step = 'media' | 'details' | 'schedule'
const STEPS: Step[] = ['media', 'details', 'schedule']

export default function CreatePostModal({ igAccounts, onClose, onCreated }: Props) {
  const [step, setStep] = useState<Step>('media')
  const [mediaType, setMediaType] = useState<MediaType>('IMAGE')
  const [uploadedFiles, setUploadedFiles] = useState<{ url: string; name: string }[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [caption, setCaption] = useState('')
  const [hashtags, setHashtags] = useState('')
  const [igAccountId, setIgAccountId] = useState(igAccounts[0]?.id || '')
  const [scheduledAt, setScheduledAt] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiAlternatives, setAiAlternatives] = useState<string[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  async function uploadFiles(files: FileList) {
    setUploading(true); setError(null)
    for (const file of Array.from(files)) {
      const fd = new FormData(); fd.append('file', file)
      const res = await fetch('/api/media/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.error) { setError(data.error); break }
      setUploadedFiles(prev => [...prev, { url: data.data.public_url, name: file.name }])
      if (file.type.startsWith('video/')) setMediaType('REEL')
    }
    setUploading(false)
  }

  async function generateCaption() {
    if (!aiPrompt.trim()) return
    setAiLoading(true); setError(null)
    const res = await fetch('/api/ai/caption', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: aiPrompt, media_type: mediaType }),
    })
    const data = await res.json()
    if (data.error) setError(data.error)
    else { setCaption(data.data.caption); setHashtags(data.data.hashtags.join(', ')); setAiAlternatives(data.data.alternatives || []) }
    setAiLoading(false)
  }

  async function handleSubmit() {
    if (!igAccountId || !uploadedFiles.length || !scheduledAt) { setError('Please fill all required fields'); return }
    setSubmitting(true); setError(null)
    const res = await fetch('/api/posts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ig_account_id: igAccountId, media_type: mediaType,
        media_urls: uploadedFiles.map(f => f.url), caption,
        hashtags: hashtags.split(',').map(h => h.trim()).filter(Boolean),
        scheduled_at: new Date(scheduledAt).toISOString(),
      }),
    })
    const data = await res.json()
    if (data.error) { setError(data.error); setSubmitting(false) }
    else onCreated(data.data)
  }

  const minDatetime = new Date(Date.now() + 10 * 60 * 1000).toISOString().slice(0, 16)
  const stepIdx = STEPS.indexOf(step)

  return (
    <div style={{ position:'fixed', inset:0, background:'#020617b3', backdropFilter:'blur(8px)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        .modal-input { width:100%; background:#111a2c; border:0.5px solid #2a3d62; border-radius:10px; padding:11px 14px; font-size:13px; color:#ebf1ff; font-family:'DM Sans',sans-serif; outline:none; transition:border-color 0.2s, box-shadow 0.2s; box-sizing:border-box; resize:none; }
        .modal-input::placeholder { color:#6f82ab; }
        .modal-input:focus { border-color:#60a5fa; box-shadow:0 0 0 3px #60a5fa22; }
        .modal-btn-primary { width:100%; background:linear-gradient(135deg,#22d3ee,#3b82f6,#8b5cf6); border:none; border-radius:9px; padding:12px; font-size:13px; font-weight:500; color:#fff; font-family:'DM Sans',sans-serif; cursor:pointer; transition:opacity 0.2s, box-shadow 0.2s; }
        .modal-btn-primary:hover { opacity:0.88; }
        .modal-btn-primary:hover { box-shadow: 0 10px 22px rgba(59,130,246,0.3); }
        .modal-btn-primary:disabled { opacity:0.35; cursor:not-allowed; }
        .modal-btn-ghost { flex:1; background:transparent; border:0.5px solid #2a3d62; border-radius:9px; padding:11px; font-size:13px; color:#9db0d6; font-family:'DM Sans',sans-serif; cursor:pointer; transition:border-color 0.2s,color 0.2s; }
        .modal-btn-ghost:hover { border-color:#5c7ab8; color:#dbe8ff; }
        .type-btn { flex:1; padding:10px; border-radius:9px; font-size:13px; font-family:'DM Sans',sans-serif; cursor:pointer; transition:all 0.2s; border:0.5px solid #2a3d62; background:transparent; color:#9db0d6; }
        .type-btn.active { background:#3b82f629; border-color:#60a5fa70; color:#ebf1ff; }
        .type-btn:hover:not(.active) { border-color:#5c7ab8; color:#dbe8ff; }
        @keyframes modalIn { from{opacity:0;transform:scale(0.97) translateY(8px)} to{opacity:1;transform:none} }
        .modal-shell { background:#0d1322; border:0.5px solid #2a3d62; border-radius:16px; width:100%; max-width:540px; max-height:90vh; overflow-y:auto; animation:modalIn 0.25s ease; font-family:'DM Sans',sans-serif; }
        @media (max-width: 680px) {
          .modal-shell { max-width:100%; max-height:100vh; border-radius:12px; }
        }
      `}</style>

      <div className="modal-shell">

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 20px', borderBottom:'0.5px solid #1f2b45' }}>
          <div>
            <p style={{ fontSize:15, fontWeight:500, color:'#ebf1ff' }}>Schedule a post</p>
            <p style={{ fontSize:11, color:'#8fa3cc', marginTop:2, textTransform:'capitalize' }}>Step {stepIdx + 1} of 3 — {step}</p>
          </div>
          <button onClick={onClose} style={{ background:'transparent', border:'none', cursor:'pointer', color:'#8fa3cc', display:'flex', alignItems:'center', justifyContent:'center', padding:4, borderRadius:6, transition:'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#ebf1ff')}
            onMouseLeave={e => (e.currentTarget.style.color = '#8fa3cc')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Step progress bar */}
        <div style={{ height:2, background:'#1f2b45', position:'relative' }}>
          <div style={{ position:'absolute', top:0, left:0, height:'100%', background:'linear-gradient(90deg,#22d3ee,#8b5cf6)', width:`${((stepIdx + 1) / 3) * 100}%`, transition:'width 0.3s ease', borderRadius:1 }} />
        </div>

        <div style={{ padding:'20px' }}>

          {/* ── STEP 1: MEDIA ── */}
          {step === 'media' && (
            <div>
              {/* Media type */}
              <div style={{ display:'flex', gap:8, marginBottom:16 }}>
                {(['IMAGE', 'REEL'] as const).map(t => (
                  <button type="button" key={t} className={`type-btn ${mediaType === t ? 'active' : ''}`} onClick={() => setMediaType(t)}>
                    {t === 'IMAGE' ? '🖼  Image' : '🎬  Reel'}
                  </button>
                ))}
              </div>

              {/* Drop zone */}
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); e.dataTransfer.files && uploadFiles(e.dataTransfer.files) }}
                style={{ border:`1.5px dashed ${dragOver ? '#C13584' : '#2a2520'}`, borderRadius:12, padding:'36px 20px', textAlign:'center', cursor:'pointer', transition:'border-color 0.2s, background 0.2s', background: dragOver ? '#C1358408' : 'transparent', marginBottom:12 }}
              >
                <input ref={fileRef} type="file" style={{ display:'none' }} accept={mediaType === 'REEL' ? 'video/*' : 'image/*'} multiple={mediaType === 'IMAGE'} onChange={e => e.target.files && uploadFiles(e.target.files)} />
                {uploading ? (
                  <p style={{ fontSize:13, color:'#C13584' }}>Uploading...</p>
                ) : (
                  <>
                    <div style={{ width:40, height:40, background:'#141210', border:'0.5px solid #2a2520', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b6358" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                    </div>
                    <p style={{ fontSize:13, color:'#6b6358', marginBottom:4 }}>Drop files here or click to upload</p>
                    <p style={{ fontSize:11, color:'#3a3530' }}>{mediaType === 'REEL' ? 'MP4, MOV · up to 100MB' : 'JPG, PNG, WEBP · up to 100MB'}</p>
                  </>
                )}
              </div>

              {/* File list */}
              {uploadedFiles.map((f, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:8, background:'#141210', border:'0.5px solid #1D9E7530', borderRadius:8, padding:'8px 12px', marginBottom:6 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                  <span style={{ fontSize:12, color:'#d4cfc9', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.name}</span>
                  <button onClick={() => setUploadedFiles(p => p.filter((_, j) => j !== i))} style={{ background:'transparent', border:'none', cursor:'pointer', color:'#4a4540', fontSize:14, lineHeight:1 }}>✕</button>
                </div>
              ))}

              {error && <p style={{ fontSize:12, color:'#D85A30', marginTop:8 }}>{error}</p>}

              <button className="modal-btn-primary" style={{ marginTop:16 }} onClick={() => setStep('details')} disabled={uploadedFiles.length === 0}>
                Continue →
              </button>
            </div>
          )}

          {/* ── STEP 2: DETAILS ── */}
          {step === 'details' && (
            <div>
              {/* Account selector */}
              {igAccounts.length > 1 && (
                <div style={{ marginBottom:16 }}>
                  <label style={{ fontSize:11, color:'#6b6358', display:'block', marginBottom:6, letterSpacing:'0.3px' }}>Post to account</label>
                  <select className="modal-input" value={igAccountId} onChange={e => setIgAccountId(e.target.value)} style={{ appearance:'none', cursor:'pointer' }}>
                    {igAccounts.map(a => <option key={a.id} value={a.id}>@{a.username}</option>)}
                  </select>
                </div>
              )}

              {/* AI caption */}
              <div style={{ background:'#C1358408', border:'0.5px solid #C1358425', borderRadius:11, padding:14, marginBottom:16 }}>
                <p style={{ fontSize:11, color:'#C13584', fontWeight:500, letterSpacing:'0.5px', textTransform:'uppercase', marginBottom:10 }}>✦ AI Caption Generator</p>
                <div style={{ display:'flex', gap:8, marginBottom: aiAlternatives.length > 0 ? 10 : 0 }}>
                  <input
                    className="modal-input" style={{ flex:1 }}
                    value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
                    placeholder="Describe your post briefly..."
                    onKeyDown={e => e.key === 'Enter' && generateCaption()}
                  />
                  <button type="button" onClick={generateCaption} disabled={aiLoading || !aiPrompt.trim()}
                    style={{ background: aiLoading || !aiPrompt.trim() ? '#2a2520' : 'linear-gradient(135deg,#F56040,#C13584)', border:'none', borderRadius:9, padding:'0 14px', fontSize:12, fontWeight:500, color: aiLoading || !aiPrompt.trim() ? '#4a4540' : '#fff', fontFamily:"'DM Sans',sans-serif", cursor: aiLoading || !aiPrompt.trim() ? 'not-allowed' : 'pointer', whiteSpace:'nowrap', transition:'all 0.2s' }}>
                    {aiLoading ? '...' : 'Generate'}
                  </button>
                </div>
                {aiAlternatives.length > 0 && aiAlternatives.map((alt, i) => (
                  <button type="button" key={i} onClick={() => setCaption(alt)}
                    style={{ display:'block', width:'100%', textAlign:'left', background:'#0d0c0b', border:'0.5px solid #2a2520', borderRadius:7, padding:'7px 10px', fontSize:12, color:'#6b6358', fontFamily:"'DM Sans',sans-serif", cursor:'pointer', marginBottom:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', transition:'color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#f5f0eb')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#6b6358')}>
                    {alt}
                  </button>
                ))}
              </div>

              {/* Caption */}
              <div style={{ marginBottom:14 }}>
                <label style={{ fontSize:11, color:'#6b6358', display:'block', marginBottom:6 }}>Caption</label>
                <textarea className="modal-input" rows={4} value={caption} onChange={e => setCaption(e.target.value)} placeholder="Write your caption..." />
              </div>

              {/* Hashtags */}
              <div style={{ marginBottom:4 }}>
                <label style={{ fontSize:11, color:'#6b6358', display:'block', marginBottom:6 }}>Hashtags <span style={{ color:'#3a3530' }}>(comma separated)</span></label>
                <input className="modal-input" value={hashtags} onChange={e => setHashtags(e.target.value)} placeholder="travel, photography, lifestyle" />
              </div>

              {error && <p style={{ fontSize:12, color:'#D85A30', marginTop:8 }}>{error}</p>}

              <div style={{ display:'flex', gap:8, marginTop:20 }}>
                <button type="button" className="modal-btn-ghost" onClick={() => setStep('media')}>← Back</button>
                <button type="button" className="modal-btn-primary" style={{ flex:1 }} onClick={() => setStep('schedule')}>Continue →</button>
              </div>
            </div>
          )}

          {/* ── STEP 3: SCHEDULE ── */}
          {step === 'schedule' && (
            <div>
              <div style={{ marginBottom:20 }}>
                <label style={{ fontSize:11, color:'#6b6358', display:'block', marginBottom:6 }}>Date & time</label>
                <input className="modal-input" type="datetime-local" value={scheduledAt} min={minDatetime} onChange={e => setScheduledAt(e.target.value)} />
                <p style={{ fontSize:11, color:'#3a3530', marginTop:5 }}>Uses your local timezone</p>
              </div>

              {/* Summary card */}
              <div style={{ background:'#141210', border:'0.5px solid #1e1c1a', borderRadius:10, padding:14, marginBottom:4 }}>
                <p style={{ fontSize:11, color:'#4a4540', letterSpacing:'0.8px', textTransform:'uppercase', marginBottom:12 }}>Post summary</p>
                {[
                  ['Type', mediaType],
                  ['Files', uploadedFiles.length.toString()],
                  ['Caption', caption ? caption.slice(0, 40) + (caption.length > 40 ? '…' : '') : 'None'],
                  ['Hashtags', hashtags ? hashtags.split(',').filter(Boolean).length + ' tags' : 'None'],
                  ['Account', igAccounts.find(a => a.id === igAccountId)?.username ? '@' + igAccounts.find(a => a.id === igAccountId)!.username : '—'],
                ].map(([label, val]) => (
                  <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'0.5px solid #1a1815' }}>
                    <span style={{ fontSize:12, color:'#4a4540' }}>{label}</span>
                    <span style={{ fontSize:12, color:'#d4cfc9', maxWidth:200, textAlign:'right', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{val}</span>
                  </div>
                ))}
              </div>

              {error && <p style={{ fontSize:12, color:'#D85A30', marginTop:8 }}>{error}</p>}

              <div style={{ display:'flex', gap:8, marginTop:20 }}>
                <button type="button" className="modal-btn-ghost" onClick={() => setStep('details')}>← Back</button>
                <button className="modal-btn-primary" style={{ flex:1 }} onClick={handleSubmit} disabled={submitting || !scheduledAt}>
                  {submitting ? 'Scheduling...' : '🚀 Schedule post'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}