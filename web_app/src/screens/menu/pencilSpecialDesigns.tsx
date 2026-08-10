import { CartControl, type DesignProps, type Section } from './designs'
import type { PencilConfig } from './pencilDesigns'

const SERIF = '"Playfair Display", Georgia, serif'
const MONO = '"IBM Plex Mono", "Courier New", monospace'
const SANS = 'Inter, system-ui, sans-serif'

const price = (value: string | number) => {
  const amount = typeof value === 'number' ? value : Number.parseFloat(value)
  return Number.isNaN(amount) ? '$—' : `$${amount.toFixed(2).replace(/\.00$/, '')}`
}

function Heading({ config, eyebrow, title, body, align = 'left', large = false }: { config: PencilConfig; eyebrow?: string; title: string; body?: string; align?: 'left' | 'center'; large?: boolean }) {
  return <div className={`flex min-w-0 max-w-full flex-col gap-2 ${align === 'center' ? 'items-center text-center' : 'items-start text-left'}`}>
    {eyebrow && <span className="text-[9px] uppercase tracking-[2px]" style={{ color: config.muted, fontFamily: MONO }}>{eyebrow}</span>}
    <h1 className={`${large ? 'text-[40px] sm:text-[68px]' : 'text-[40px] sm:text-[60px]'} max-w-full break-words text-balance leading-[0.94]`} style={{ color: config.ink, fontFamily: SERIF, fontWeight: 400 }}>{title}</h1>
    {body && <p className={`${large ? 'text-[12px] sm:text-[14px]' : 'text-[11px]'} max-w-[44ch] break-words leading-relaxed`} style={{ color: config.muted, fontFamily: SANS }}>{body}</p>}
  </div>
}

function Footer({ config }: { config: PencilConfig }) {
  return <footer className="flex flex-col gap-2 border-t pt-5 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: `${config.accent}66` }}><span className="text-[10px] uppercase tracking-[1.5px] sm:text-[11px]" style={{ color: config.muted, fontFamily: MONO }}>{config.footerLeft}</span><span className="text-[10px] uppercase tracking-[1.5px] sm:text-right sm:text-[11px]" style={{ color: config.accent, fontFamily: MONO }}>{config.footerRight}</span></footer>
}

function Shell({ config, children }: { config: PencilConfig; children: React.ReactNode }) {
  return <div className="min-h-[100svh] w-full min-w-0 overflow-x-clip px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10" style={{ background: config.background, color: config.ink, fontFamily: SANS }}><div className="mx-auto flex min-w-0 w-full max-w-[920px] flex-col">{children}</div></div>
}

function Image({ config, className = '' }: { config: PencilConfig; className?: string }) {
  if (!config.image) return null
  return <div className={`w-full min-w-0 overflow-hidden bg-cover bg-center ${className}`} style={{ backgroundImage: `url("${config.image}")` }} />
}

function ItemAction({ props, item, config, ink = config.ink }: { props: DesignProps; item: Section['items'][number]; config: PencilConfig; ink?: string }) {
  if (props.isService) return null
  return <CartControl qty={props.cart[item.id] ?? 0} id={item.id} addToCart={props.addToCart} decFromCart={props.decFromCart} accent={config.accent} ink={ink} />
}

function Rows({ sections, config, props, dark = false, compact = false, large = false }: { sections: Section[]; config: PencilConfig; props: DesignProps; dark?: boolean; compact?: boolean; large?: boolean }) {
  const sectionGap = large ? 'gap-4' : 'gap-3.5'
  const itemGap = large ? 'gap-3' : 'gap-2.5'
  const nameSize = large ? 'text-[18px] leading-[1.05] sm:text-[21px]' : 'text-[18px] leading-[1.05] sm:text-[20px]'
  const descriptionSize = large ? 'text-[10px] leading-tight sm:text-[11px]' : 'text-[10px] leading-tight sm:text-[11px]'
  const priceSize = large ? 'text-[11px] sm:text-[12px]' : 'text-[11px] sm:text-[12px]'
  const labelSize = large ? 'text-[10px] sm:text-[11px]' : 'text-[10px] sm:text-[11px]'
  return <div className={`grid min-w-0 grid-cols-1 ${large ? 'gap-8' : compact ? 'gap-6' : 'gap-7'} md:grid-cols-2 md:gap-x-10`}>
    {sections.slice(0, 6).map((section) => <section key={section.key} className={`flex min-w-0 flex-col ${sectionGap}`}><h2 className={`${labelSize} uppercase tracking-[1.8px]`} style={{ color: config.accent, fontFamily: MONO }}>{section.name}</h2><div className={`flex min-w-0 flex-col ${itemGap}`}>{section.items.slice(0, 6).map((item) => <div key={item.id} className="flex min-w-0 items-start justify-between gap-3 border-b pb-2" style={{ borderColor: `${config.accent}33` }}><div className="min-w-0 flex-1"><p className={`break-words ${nameSize}`} style={{ color: dark ? '#FFFFFF' : config.ink, fontFamily: SERIF }}>{item.name}</p>{item.description && <p className={`break-words ${descriptionSize}`} style={{ color: dark ? '#C9C9C9' : config.muted, fontFamily: SANS }}>{item.description}</p>}</div><div className="flex shrink-0 items-start gap-2"><span className={`${priceSize}`} style={{ color: dark ? '#FFFFFF' : config.ink, fontFamily: MONO }}>{price(item.price)}</span>{!props.isService && <CartControl qty={props.cart[item.id] ?? 0} id={item.id} addToCart={props.addToCart} decFromCart={props.decFromCart} accent={config.accent} ink={dark ? '#FFFFFF' : config.ink} />}</div></div>)}</div></section>)}
  </div>
}

function Alternating({ props, config, shelf = false }: { props: DesignProps; config: PencilConfig; shelf?: boolean }) {
  const hero = props.content?.hero
  const title = hero?.title || props.listName || props.tenant.name
  const items = props.sections.slice(0, 4).flatMap((section) => section.items.slice(0, 2))
  return <Shell config={config}><Heading config={config} eyebrow={hero?.eyebrow} title={title} body={hero?.body} /><div className="mt-8 flex min-w-0 flex-col gap-7">{items.map((item, index) => <div key={item.id} className="grid min-w-0 grid-cols-1 items-center gap-6 md:grid-cols-2"><Image config={config} className={`h-[150px] md:h-[190px] ${index % 2 ? 'md:order-2' : ''}`} /><div className={`min-w-0 ${index % 2 ? 'md:order-1' : ''} ${shelf ? 'border-l pl-5' : ''}`} style={{ borderColor: `${config.accent}66` }}><span className="text-[10px] uppercase tracking-[1.8px] sm:text-[11px]" style={{ color: config.accent, fontFamily: MONO }}>{props.sections[index % Math.max(props.sections.length, 1)]?.name || 'Collection'}</span><h2 className="mt-2 break-words text-[24px] leading-none sm:text-[30px]" style={{ color: config.ink, fontFamily: SERIF, fontWeight: 400 }}>{item.name}</h2><p className="mt-2 max-w-[34ch] break-words text-[12px] leading-relaxed sm:text-[13px]" style={{ color: config.muted, fontFamily: SANS }}>{item.description || 'Selected with care for the everyday.'}</p><div className="mt-2 flex items-start gap-2"><p className="text-[12px] sm:text-[13px]" style={{ color: config.ink, fontFamily: MONO }}>{price(item.price)}</p><ItemAction props={props} item={item} config={config} /></div></div></div>)}</div><div className="mt-8"><Footer config={config} /></div></Shell>
}

function CasaRitual({ props, config }: { props: DesignProps; config: PencilConfig }) {
  const hero = props.content?.hero
  return <Shell config={config}><div className="grid min-w-0 grid-cols-1 overflow-hidden md:grid-cols-2" style={{ background: config.darkPanel }}><div className="flex min-w-0 flex-col justify-end gap-3 p-6 sm:p-8"><Heading config={{ ...config, ink: '#FFFFFF', muted: '#C7C7C7' }} eyebrow={hero?.eyebrow} title={hero?.title || 'El baño, como un ritual.'} body={hero?.body} /></div><Image config={config} className="min-h-[230px]" /></div><div className="mt-6 flex min-w-0 flex-wrap items-center justify-between gap-2 border-y py-3 text-[8px] uppercase tracking-[1.5px]" style={{ borderColor: config.accent, color: config.ink, fontFamily: MONO }}><span>Selección esencial</span><span>Casa Férrea · 01</span></div><div className="mt-6"><Rows sections={props.sections} config={config} props={props} compact /></div><div className="mt-8"><Footer config={config} /></div></Shell>
}

function CasaBath({ props, config }: { props: DesignProps; config: PencilConfig }) {
  const hero = props.content?.hero
  return <Shell config={config}><Image config={config} className="-mx-4 -mt-6 h-[220px] sm:-mx-8 sm:-mt-8 sm:h-[250px] lg:-mx-12 lg:-mt-10" /><div className="mt-6"><Heading config={config} eyebrow={hero?.eyebrow} title={hero?.title || 'BAÑO EQUIPAR'} body={hero?.body} large /></div><div className="mt-8"><Rows sections={props.sections} config={config} props={props} compact /></div><div className="mt-8"><Footer config={config} /></div></Shell>
}

function CasaSignature({ props, config }: { props: DesignProps; config: PencilConfig }) {
  const hero = props.content?.hero
  return <Shell config={config}><div className="grid min-w-0 grid-cols-2 gap-3"><Image config={{ ...config, image: '/pencil/templates/UED6s.png' }} className="h-[110px] sm:h-[130px]" /><Image config={{ ...config, image: '/pencil/templates/iQ1h5.png' }} className="h-[110px] sm:h-[130px]" /></div><div className="py-6 text-center"><Heading config={config} eyebrow={hero?.eyebrow} title={hero?.title || 'Casa Férrea'} body={hero?.body} align="center" /></div><div className="grid min-w-0 grid-cols-1 gap-3 border-y py-7 md:grid-cols-3">{props.sections.slice(0, 3).map((section) => <div key={section.key} className="min-w-0 text-center"><h2 className="break-words text-[11px] uppercase sm:text-[12px]" style={{ color: config.ink, fontFamily: MONO }}>{section.name}</h2><p className="mt-2 break-words text-[12px] sm:text-[13px]" style={{ color: config.muted, fontFamily: SANS }}>{section.items[0]?.description || 'A considered detail for the room.'}</p><div className="mt-3 flex items-center justify-center gap-2"><span className="border px-2 py-1 text-[10px] sm:text-[11px]" style={{ borderColor: config.accent, fontFamily: MONO }}>{price(section.items[0]?.price || 0)}</span>{section.items[0] && <ItemAction props={props} item={section.items[0]} config={config} />}</div></div>)}</div><div className="mt-8"><Footer config={config} /></div></Shell>
}

function CasaServices({ props, config }: { props: DesignProps; config: PencilConfig }) {
  const hero = props.content?.hero
  return <div className="min-h-[100svh] w-full min-w-0 overflow-x-clip px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10" style={{ background: config.background, color: config.ink, fontFamily: SANS }}><div className="mx-auto grid min-w-0 w-full max-w-[920px] grid-cols-[38px_minmax(0,1fr)] gap-4 sm:grid-cols-[70px_minmax(0,1fr)] sm:gap-8"><div className="flex items-start justify-center"><span className="text-[36px] font-bold leading-none sm:text-[52px]" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontFamily: SANS }}>SERVICIOS</span></div><div className="min-w-0"><div className="flex flex-wrap justify-between gap-2 border-b pb-4 text-[10px] uppercase tracking-[1.5px] sm:text-[11px]" style={{ borderColor: '#FFFFFF66', fontFamily: MONO }}><span className="break-words">{hero?.eyebrow || 'Casa Férrea'}</span><span>{props.monthYear}</span></div><div className="mt-7"><Rows sections={props.sections} config={config} props={props} dark compact /></div><div className="mt-8 border-t pt-6 text-[10px] uppercase tracking-[1.5px] sm:text-[11px]" style={{ borderColor: '#FFFFFF66', color: config.muted, fontFamily: MONO }}>{hero?.body || 'Un servicio pensado para acompañar cada proyecto.'}</div></div></div></div>
}

function AutoDetail({ props, config }: { props: DesignProps; config: PencilConfig }) {
  const hero = props.content?.hero
  return <Shell config={config}><div className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]"><div className="min-w-0"><Heading config={config} eyebrow={hero?.eyebrow || 'OBSIDIAN AUTO DETAIL'} title={hero?.title || 'CAR DETAILING'} body={hero?.body || 'Price list'} /><div className="mt-8"><Rows sections={props.sections} config={config} props={props} dark compact /></div></div><Image config={config} className="min-h-[360px] md:min-h-[420px]" /></div><div className="mt-8"><Footer config={config} /></div></Shell>
}

function BlushBloom({ props, config }: { props: DesignProps; config: PencilConfig }) {
  const hero = props.content?.hero
  return <div className="min-h-[100svh] w-full min-w-0 overflow-x-clip px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10" style={{ background: config.background, color: config.ink }}><div className="mx-auto w-full min-w-0 max-w-[430px] border-[6px] px-4 py-6 shadow-[10px_0_0_#F24AA6] sm:border-8 sm:px-10 sm:py-7 sm:shadow-[14px_0_0_#F24AA6]" style={{ background: config.darkPanel, borderColor: '#0A0A0B' }}><Heading config={config} eyebrow={hero?.eyebrow} title={hero?.title || 'Price List'} body={hero?.body} align="center" /><div className="mt-8"><Rows sections={props.sections} config={config} props={props} dark compact /></div><div className="mt-8 border-t pt-6 text-center text-[10px] uppercase tracking-[1.4px] sm:text-[11px]" style={{ borderColor: `${config.accent}66`, color: config.muted, fontFamily: MONO }}>{props.monthYear} · {props.tenant.name}</div></div></div>
}

function Nova({ props, config }: { props: DesignProps; config: PencilConfig }) {
  const hero = props.content?.hero
  return <div className="min-h-[100svh] w-full min-w-0 overflow-x-clip px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10" style={{ background: 'radial-gradient(circle at 20% 10%, #4BCEED33, transparent 35%), radial-gradient(circle at 80% 90%, #F3B8FF66, transparent 42%), #5B4BCA', color: '#FFFFFF' }}><div className="mx-auto w-full min-w-0 max-w-[560px]"><Heading config={config} eyebrow={hero?.eyebrow || 'SERVICES & PACKAGES'} title={hero?.title || 'PRICE LIST'} body={hero?.body} align="center" /><div className="mt-7 flex min-w-0 flex-col gap-4">{props.sections.slice(0, 4).map((section, index) => <div key={section.key} className="w-full min-w-0 rounded-2xl border p-4 sm:p-5" style={{ borderColor: '#FFFFFF99', background: index % 2 ? '#D67BE533' : '#FFFFFF1A' }}><div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-3"><h2 className="min-w-0 break-words text-[18px] uppercase tracking-[1px] sm:text-[20px]" style={{ fontFamily: SANS }}>{section.name}</h2><div className="flex items-start gap-2"><span className="shrink-0 text-[14px] sm:text-[15px]" style={{ fontFamily: MONO }}>{price(section.items[0]?.price || 0)}</span>{section.items[0] && <ItemAction props={props} item={section.items[0]} config={config} ink="#FFFFFF" />}</div></div><p className="mt-2 break-words text-[12px] leading-relaxed sm:text-[13px]" style={{ color: '#F4E7FF', fontFamily: SANS }}>{section.items.slice(0, 3).map((item) => item.name).join(' · ')}</p><div className="mt-3 text-right text-[16px]" style={{ color: '#FFFFFF', fontFamily: MONO }}>»</div></div>)}</div><p className="mt-7 text-center text-[10px] uppercase tracking-[2px] sm:text-[11px]" style={{ color: '#F4E7FF', fontFamily: MONO }}>{props.tenant.name} · {props.monthYear}</p></div></div>
}

function Beardy({ props, config }: { props: DesignProps; config: PencilConfig }) {
  const hero = props.content?.hero
  return <div className="min-h-[100svh] w-full min-w-0 overflow-x-clip bg-cover bg-center px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10" style={{ backgroundImage: `url("${config.image}")` }}><div className="mx-auto grid w-full min-w-0 max-w-[1180px] grid-cols-1 gap-5 md:grid-cols-2 md:gap-8"><div className="flex min-w-0 min-h-[680px] flex-col justify-between p-8 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.45)] sm:min-h-[760px] sm:p-10 md:min-h-[780px] md:p-14" style={{ background: '#050505', color: '#FFFFFF' }}><div><Heading config={{ ...config, ink: '#FFFFFF', muted: '#BDBDBD' }} eyebrow={hero?.eyebrow} title="BEARDY" body={hero?.body} align="center" large /><p className="mt-5 text-center text-[10px] uppercase tracking-[3px] sm:text-[11px]" style={{ color: '#BDBDBD', fontFamily: MONO }}>Beauty studio</p></div><div className="mx-auto max-w-[24ch] text-center"><p className="text-[14px] italic leading-relaxed sm:text-[16px]" style={{ color: '#D6D1CA', fontFamily: SERIF }}>Cut, colour and craft for the considered everyday.</p><p className="mt-8 text-[10px] uppercase tracking-[2px] sm:text-[11px]" style={{ color: '#FFFFFF', fontFamily: MONO }}>Cut · Colour · Craft</p></div></div><div className="flex min-w-0 min-h-[680px] flex-col p-8 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.3)] sm:min-h-[760px] sm:p-10 md:min-h-[780px] md:p-14" style={{ background: '#FFFFFF', color: config.ink }}><Heading config={{ ...config, ink: '#171313', muted: '#6C655D' }} eyebrow="BEARDY BEAUTY STUDIO" title={hero?.title || 'SERVICES LIST'} body={hero?.body} align="center" large /><div className="mt-10 flex-1"><Rows sections={props.sections} config={{ ...config, ink: '#171313' }} props={props} compact large /></div><Footer config={{ ...config, footerLeft: 'BEARDY BEAUTY STUDIO', footerRight: props.monthYear }} /></div></div></div>
}

function CalmSpa({ props, config }: { props: DesignProps; config: PencilConfig }) {
  const hero = props.content?.hero
  return <div className="flex min-h-[100svh] w-full min-w-0 items-center justify-center overflow-x-clip px-4 py-6 sm:px-8 sm:py-8" style={{ background: config.background }}><div className="flex min-h-[620px] w-full min-w-0 max-w-[650px] flex-col justify-between rounded-[48%] px-6 py-10 sm:min-h-[700px] sm:px-12" style={{ background: config.darkPanel, color: config.ink }}><Heading config={config} eyebrow={hero?.eyebrow || 'THE CALM SPA'} title={hero?.title || 'PRICE LIST'} body={hero?.body} /><Rows sections={props.sections} config={config} props={props} dark compact /><p className="text-center text-[8px] uppercase tracking-[1.5px]" style={{ color: config.muted, fontFamily: MONO }}>{props.monthYear} · {props.tenant.name}</p></div></div>
}

function UnionBarber({ props, config }: { props: DesignProps; config: PencilConfig }) {
  const hero = props.content?.hero
  return <div className="min-h-[100svh] w-full min-w-0 overflow-x-clip px-4 py-6 sm:px-8 sm:py-8" style={{ background: config.background }}><div className="mx-auto w-full min-w-0 max-w-[650px] overflow-hidden" style={{ color: config.ink }}><div className="p-6 sm:p-7" style={{ background: 'linear-gradient(175deg,#283B97 0 75%,#D9232E 75%)', color: '#FFFFFF' }}><Heading config={{ ...config, ink: '#FFFFFF', muted: '#FFFFFF' }} eyebrow={hero?.eyebrow} title={hero?.title || "UNION'S Barber Shop"} body={hero?.body} /></div><div className="mx-auto -mt-2 w-full min-w-0 max-w-[560px] bg-white p-6 shadow-lg sm:p-7"><Rows sections={props.sections} config={config} props={props} compact /></div><div className="mt-8 p-5 text-center text-[10px] uppercase tracking-[1.5px] sm:text-[11px]" style={{ background: config.accent, color: '#FFFFFF', fontFamily: MONO }}>{props.tenant.name} · {props.monthYear}</div></div></div>
}

function StudioMono({ props, config }: { props: DesignProps; config: PencilConfig }) {
  const hero = props.content?.hero
  return <Shell config={config}><Heading config={config} eyebrow={hero?.eyebrow} title={hero?.title || 'PRICE LIST'} body={hero?.body} align="center" /><div className="mt-8 flex flex-col gap-7">{props.sections.slice(0, 4).map((section) => <section key={section.key}><div className="flex items-center gap-3"><div className="h-px flex-1" style={{ background: config.accent }} /><h2 className="rounded-full px-5 py-2 text-[11px] uppercase tracking-[1px] sm:text-[12px]" style={{ background: config.darkPanel, color: '#FFFFFF', fontFamily: MONO }}>{section.name}</h2><div className="h-px flex-1" style={{ background: config.accent }} /></div><div className="mx-auto mt-5 max-w-[380px]"><Rows sections={[section]} config={config} props={props} compact /></div></section>)}</div></Shell>
}

function BeautyIssue({ props, config }: { props: DesignProps; config: PencilConfig }) {
  const hero = props.content?.hero
  return <div className="min-h-[100svh] w-full min-w-0 overflow-x-clip px-4 py-6 sm:px-8 sm:py-8" style={{ background: config.background }}><div className="mx-auto grid min-h-[640px] w-full min-w-0 max-w-[800px] grid-cols-1 md:min-h-[760px] md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]"><div className="flex min-w-0 flex-col justify-between p-6 sm:p-7" style={{ background: config.darkPanel, color: '#FFFFFF' }}><Heading config={{ ...config, ink: '#FFFFFF', muted: '#BDB6B0' }} eyebrow={hero?.eyebrow} title={hero?.title || 'The Beauty Issue'} body={hero?.body} /><span className="text-[10px] uppercase tracking-[1.5px] sm:text-[11px]" style={{ color: '#BDB6B0', fontFamily: MONO }}>{props.monthYear}</span></div><div className="min-w-0 p-6"><Rows sections={props.sections} config={config} props={props} compact /></div><Image config={config} className="min-h-[260px] md:min-h-0" /></div></div>
}

function ObsidianQuarterly({ props, config }: { props: DesignProps; config: PencilConfig }) {
  const hero = props.content?.hero
  return <div className="min-h-[100svh] w-full min-w-0 overflow-x-clip px-4 py-6 sm:px-8 sm:py-8" style={{ background: config.background, color: config.ink }}><div className="mx-auto grid w-full min-w-0 max-w-[900px] grid-cols-1 md:grid-cols-2"><div className="min-w-0 p-6 sm:p-10"><Heading config={config} eyebrow={hero?.eyebrow || 'OBSIDIAN QUARTERLY · DETAILING'} title={hero?.title || 'Care for the drive.'} body={hero?.body} /><div className="mt-8"><Rows sections={props.sections} config={config} props={props} dark compact /></div></div><Image config={config} className="min-h-[360px] md:min-h-[430px]" /></div><div className="mx-auto mt-8 w-full min-w-0 max-w-[900px]"><Footer config={config} /></div></div>
}

export function SpecialPencilList({ props, config }: { props: DesignProps; config: PencilConfig }) {
  switch (config.layout) {
    case 'alternating': return <Alternating props={props} config={config} />
    case 'hardware-shelf': return <Alternating props={props} config={config} shelf />
    case 'casa-ritual': return <CasaRitual props={props} config={config} />
    case 'casa-bath': return <CasaBath props={props} config={config} />
    case 'casa-signature': return <CasaSignature props={props} config={config} />
    case 'casa-services': return <CasaServices props={props} config={config} />
    case 'auto-detail': return <AutoDetail props={props} config={config} />
    case 'blush-bloom': return <BlushBloom props={props} config={config} />
    case 'nova': return <Nova props={props} config={config} />
    case 'beardy': return <Beardy props={props} config={config} />
    case 'calm-spa': return <CalmSpa props={props} config={config} />
    case 'union-barber': return <UnionBarber props={props} config={config} />
    case 'studio-mono': return <StudioMono props={props} config={config} />
    case 'beauty-issue': return <BeautyIssue props={props} config={config} />
    case 'obsidian-quarterly': return <ObsidianQuarterly props={props} config={config} />
    default: return null
  }
}
