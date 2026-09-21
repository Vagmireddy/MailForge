import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CalendarClock, LogOut, Mail, Plus, Upload, X } from 'lucide-react';
import './index.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';
type Email = { id: string; recipient: string; subject: string; scheduledAt: string; sentAt?: string; status: string; previewUrl?: string };

async function api(path: string, options?: RequestInit) {
  const response = await fetch(API + path, { ...options, credentials: 'include', headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) } });
  if (!response.ok) throw new Error((await response.json()).error || 'Request failed');
  return response.json();
}

function Login() {
  return <div className="mf-landing">
    <div className="mf-landing-bg" />
    <div className="mf-landing-shade" />
    <div className="mf-landing-inner">
      <nav className="mf-nav">
        <img src="/Mail forge logo.png" alt="Mailforge" className="mf-logo" />
        <div className="mf-nav-links"><a href="#mf-features">Features</a><a href="#mf-workflow">How it works</a><a href={API + '/auth/google'} className="mf-nav-button">Sign in</a></div>
      </nav>
      <main className="mf-hero">
        <div className="mf-kicker"><span />The smarter way to reach people</div>
        <h1>Turn thoughtful ideas into <em>meaningful replies.</em></h1>
        <p>Mailforge helps you plan, personalize, and schedule outreach that feels human - so every message has a better chance to make an impact.</p>
        <div className="mf-actions"><a href={API + '/auth/google'} className="mf-primary">Continue with Google <b>-&gt;</b></a><a href="#mf-features" className="mf-secondary">Explore Mailforge</a></div>
        <div id="mf-features" className="mf-cards">
          <article><strong>01</strong><b>Build your audience</b><span>Bring your best leads together.</span></article>
          <article><strong>02</strong><b>Schedule with confidence</b><span>Send at the right moment.</span></article>
          <article><strong>03</strong><b>Learn and improve</b><span>See what moves the needle.</span></article>
        </div>
        <section id="mf-workflow" className="mf-workflow">
          <p className="mf-section-label">HOW IT WORKS</p><h2>From first idea to real conversation.</h2>
          <div className="mf-steps"><div><span>01</span><b>Compose</b><p>Write one thoughtful message and choose who you want to reach.</p></div><div><span>02</span><b>Schedule</b><p>Set your start time, pacing, and hourly limit. Mailforge handles the queue.</p></div><div><span>03</span><b>Measure</b><p>Follow scheduled and sent activity so every campaign stays visible.</p></div></div>
        </section>
      </main>
      <footer><span>Copyright 2026 Mailforge</span><span>Built for better conversations.</span></footer>
    </div>
  </div>;
}

function Compose({ close, done }: { close: () => void; done: () => void }) {
  const [form, setForm] = useState({ subject: '', body: '', startTime: '', delayMs: '2000', hourlyLimit: '200', sender: '' });
  const [recipientText, setRecipientText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const change = (event: any) => setForm({ ...form, [event.target.name]: event.target.value });
  const file = (event: any) => { const selected = event.target.files?.[0]; if (!selected) return; const reader = new FileReader(); reader.onload = () => setRecipientText(String(reader.result)); reader.readAsText(selected); };
  const recipients = recipientText.split(/[\s,;]+/).map(x => x.trim()).filter(x => /^\S+@\S+\.\S+$/.test(x));
  const submit = async (event: any) => { event.preventDefault(); if (!recipients.length) { setError('Enter at least one valid recipient email or upload a file.'); return; } setSaving(true); try { await api('/api/emails/schedule', { method: 'POST', body: JSON.stringify({ ...form, recipients, delayMs: Number(form.delayMs), hourlyLimit: Number(form.hourlyLimit) }) }); done(); close(); } catch (e: any) { setError(e.message); } finally { setSaving(false); } };
  return <div className="fixed inset-0 bg-slate-900/40 grid place-items-center p-4"><form onSubmit={submit} className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-7"><div className="flex justify-between"><h2 className="text-xl font-bold">Compose new email</h2><button type="button" onClick={close}><X /></button></div>{error && <div className="mt-4 bg-red-50 text-red-700 p-3 rounded">{error}</div>}<label className="block mt-5 text-sm font-medium">Subject<input required name="subject" value={form.subject} onChange={change} className="field" /></label><label className="block mt-4 text-sm font-medium">Body<textarea required name="body" value={form.body} onChange={change} rows={4} className="field" /></label><label className="block mt-4 text-sm font-medium">Recipients<textarea value={recipientText} onChange={event => { setRecipientText(event.target.value); setError(''); }} placeholder="you@example.com, another@example.com" rows={2} className="field" /><span className="text-xs text-slate-400">Paste emails separated by commas, spaces, or new lines.</span></label><label className="mt-4 border-2 border-dashed rounded-xl p-5 flex items-center gap-3 cursor-pointer text-slate-500"><Upload /><span>{recipients.length ? recipients.length + ' email address(es) detected' : 'Or upload CSV/text leads'}</span><input type="file" accept=".csv,.txt" onChange={file} className="hidden" /></label><div className="grid grid-cols-2 gap-4 mt-4"><label className="text-sm font-medium">Start time<input required type="datetime-local" name="startTime" value={form.startTime} onChange={change} className="field" /></label><label className="text-sm font-medium">Delay (ms)<input type="number" min="0" name="delayMs" value={form.delayMs} onChange={change} className="field" /></label><label className="text-sm font-medium">Hourly limit<input type="number" min="1" name="hourlyLimit" value={form.hourlyLimit} onChange={change} className="field" /></label><label className="text-sm font-medium">Sender<input name="sender" placeholder="you@ethereal.email" value={form.sender} onChange={change} className="field" /></label></div><button disabled={saving} className="w-full mt-6 bg-indigo-600 text-white rounded-xl py-3">{saving ? 'Scheduling...' : 'Schedule emails'}</button></form></div>;
}

function App() {
  const [user, setUser] = useState<any>(null); const [tab, setTab] = useState<'scheduled' | 'sent'>('scheduled'); const [emails, setEmails] = useState<Email[]>([]); const [compose, setCompose] = useState(false); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const load = () => { setLoading(true); api('/api/emails?status=' + tab).then(setEmails).catch(e => setError(e.message)).finally(() => setLoading(false)); };
  useEffect(() => { api('/api/me').then(setUser).catch(() => setUser(false)); }, []); useEffect(() => { if (user) load(); }, [user, tab]);
  if (user === false) return <Login />; if (!user) return <div className="min-h-screen grid place-items-center text-slate-500">Loading...</div>;
  return <div className="min-h-screen"><header className="h-20 bg-white border-b flex items-center justify-between px-8"><div className="flex items-center gap-3"><div className="bg-indigo-600 p-2 rounded-xl text-white"><Mail size={20} /></div><span className="font-bold text-xl">Mailforge</span></div><div className="flex items-center gap-4"><img className="w-9 h-9 rounded-full" src={user.avatar} /><div className="text-right"><div className="font-medium">{user.name}</div><div className="text-xs text-slate-500">{user.email}</div></div><button onClick={() => api('/auth/logout', { method: 'POST' }).then(() => setUser(false))}><LogOut size={18} /></button></div></header><main className="max-w-6xl mx-auto p-8"><div className="flex justify-between items-end mb-8"><div><p className="text-indigo-600 font-semibold text-sm">EMAIL OUTREACH</p><h1 className="text-3xl font-bold mt-2">Your email activity</h1></div><button onClick={() => setCompose(true)} className="bg-indigo-600 text-white rounded-xl px-4 py-3 flex gap-2 items-center shadow"><Plus size={18} />Compose New Email</button></div><div className="bg-white rounded-2xl border shadow-sm"><div className="border-b px-6 flex gap-8"><button className={"py-4 border-b-2 " + (tab === 'scheduled' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500')} onClick={() => setTab('scheduled')}>Scheduled Emails</button><button className={"py-4 border-b-2 " + (tab === 'sent' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500')} onClick={() => setTab('sent')}>Sent Emails</button></div>{error && <div className="m-6 p-3 bg-red-50 text-red-700 rounded-lg">{error}</div>}{loading ? <div className="p-12 text-center text-slate-400">Loading emails...</div> : emails.length === 0 ? <div className="p-16 text-center"><CalendarClock className="mx-auto text-slate-300" size={42} /><p className="mt-3 font-medium">No {tab} emails yet</p><p className="text-slate-400 text-sm">Compose a campaign to get started.</p></div> : <table className="w-full text-left"><thead className="text-xs uppercase text-slate-400"><tr><th className="p-5">Email</th><th>Subject</th><th>{tab === 'sent' ? 'Sent time' : 'Scheduled time'}</th><th>Status</th></tr></thead><tbody>{emails.map(email => <tr className="border-t" key={email.id}><td className="p-5 font-medium">{email.recipient}</td><td>{email.subject}</td><td>{new Date(email.sentAt || email.scheduledAt).toLocaleString()}</td><td>{email.previewUrl ? <a className="text-indigo-600 underline" href={email.previewUrl} target="_blank">Preview</a> : email.status}</td></tr>)}</tbody></table>}</div></main>{compose && <Compose close={() => setCompose(false)} done={load} />}</div>;
}

createRoot(document.getElementById('root')!).render(<App />);

