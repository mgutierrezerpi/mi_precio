import { ShieldCheck, XIcon } from './AuthCardIcons'

export function AuthHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <img
        src="/miprecio-logo-pencil.webp"
        alt="Mi Precio"
        className="h-10 w-auto"
      />
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar"
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F5F3FF] text-[#475569] transition-colors hover:bg-[#EDE9FE]"
      >
        <XIcon />
      </button>
    </div>
  )
}

export function AuthIntro({
  codeSent,
  pendingEmail,
}: {
  codeSent: boolean
  pendingEmail: string | null
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <h1 className="text-[26px] font-extrabold leading-tight tracking-tight text-[#0F172A]">
        {codeSent ? 'Revisá tu email' : 'Bienvenido de vuelta'}
      </h1>
      <p className="text-sm leading-relaxed text-[#64748B]">
        {codeSent ? (
          <>
            Ingresá el código que enviamos a{' '}
            <span className="font-semibold text-[#334155]">{pendingEmail}</span>
            .
          </>
        ) : (
          'Iniciá sesión para gestionar tu catálogo.'
        )}
      </p>
    </div>
  )
}

export function SecurityNote() {
  return (
    <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-[#94A3B8]">
      <ShieldCheck className="text-[#10B981]" /> Tus datos están protegidos con
      cifrado SSL
    </div>
  )
}
