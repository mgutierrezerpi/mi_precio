import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import api from '../../services/api'
import { CrmLayout } from './crm/CrmLayout'
import { DESIGN_TOKENS } from '../../design-system/tokens'
import type { FeatureFlag } from '../../types'

type PortalSection =
  | 'overview'
  | 'foundations'
  | 'components'
  | 'patterns'
  | 'conventions'
  | 'flags'

const sections: { id: PortalSection; label: string; description: string }[] = [
  { id: 'overview', label: 'Overview', description: 'How to use this guide' },
  {
    id: 'foundations',
    label: 'Foundations',
    description: 'Tokens and layout rules',
  },
  {
    id: 'components',
    label: 'Components',
    description: 'Reusable UI building blocks',
  },
  {
    id: 'patterns',
    label: 'Page patterns',
    description: 'Structure for new screens',
  },
  {
    id: 'conventions',
    label: 'Feature checklist',
    description: 'Behavior every feature needs',
  },
  {
    id: 'flags',
    label: 'Feature flags',
    description: 'Roll out capabilities by business',
  },
]

function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="mb-6 max-w-3xl">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--dash-link)]">
        {eyebrow}
      </p>
      <h1 className="text-2xl font-extrabold tracking-tight text-[var(--dash-text)] sm:text-3xl">
        {title}
      </h1>
      <p className="mt-2 text-sm leading-6 text-[var(--dash-text2)]">
        {children}
      </p>
    </div>
  )
}

function Panel({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={`rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 shadow-sm ${className}`}
    >
      {children}
    </section>
  )
}

function TokenTable({
  title,
  rows,
}: {
  title: string
  rows: readonly { name: string; value: string; utility?: string }[]
}) {
  return (
    <Panel>
      <h2 className="mb-4 text-sm font-extrabold text-[var(--dash-text)]">
        {title}
      </h2>
      <div className="divide-y divide-[var(--dash-border)]">
        {rows.map((row) => (
          <div
            key={row.name}
            className="grid gap-1 py-3 text-sm sm:grid-cols-[1fr_auto_1.2fr] sm:items-center sm:gap-4"
          >
            <span className="font-semibold text-[var(--dash-text)]">
              {row.name}
            </span>
            <code className="w-fit rounded bg-[var(--dash-soft)] px-2 py-1 text-xs text-[var(--dash-link)]">
              {row.value}
            </code>
            {row.utility && (
              <span className="text-xs text-[var(--dash-muted)]">
                {row.utility}
              </span>
            )}
          </div>
        ))}
      </div>
    </Panel>
  )
}

function ComponentExamples() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel>
        <h2 className="mb-4 text-sm font-extrabold">Actions and controls</h2>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="btn btn-sm rounded-lg bg-[var(--dash-text)] px-4 py-2 text-sm font-bold text-[var(--dash-surface)]"
          >
            Primary action
          </button>
          <button
            type="button"
            className="btn btn-sm rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] px-4 py-2 text-sm font-bold text-[var(--dash-text)]"
          >
            Secondary
          </button>
          <button
            type="button"
            className="btn btn-sm rounded-full bg-[var(--dash-soft)] px-3 py-2 text-xs font-bold text-[var(--dash-link)]"
          >
            Filter · 3
          </button>
        </div>
        <label
          className="mt-5 block text-xs font-bold text-[var(--dash-text2)]"
          htmlFor="portal-input"
        >
          Field label
        </label>
        <input
          id="portal-input"
          className="mt-2 h-10 w-full rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 text-sm text-[var(--dash-text)] outline-none ring-[var(--dash-link)] focus:ring-2"
          defaultValue="A clear, comfortable input"
        />
      </Panel>
      <Panel>
        <h2 className="mb-4 text-sm font-extrabold">Feedback and status</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3 rounded-lg bg-[var(--dash-soft)] p-3">
            <span className="text-base">✓</span>
            <span className="font-semibold">Saved successfully</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-[var(--dash-border)] p-3">
            <span className="font-semibold">Published</span>
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
              Live
            </span>
          </div>
          <div className="rounded-lg border border-dashed border-[var(--dash-border)] p-5 text-center">
            <p className="font-bold">Nothing here yet</p>
            <p className="mt-1 text-xs text-[var(--dash-muted)]">
              Explain what the user can do next.
            </p>
          </div>
        </div>
      </Panel>
      <Panel className="lg:col-span-2">
        <h2 className="mb-4 text-sm font-extrabold">Card anatomy</h2>
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--dash-muted)]">
              Optional eyebrow
            </p>
            <h3 className="mt-1 text-lg font-extrabold">
              Give the object a clear name
            </h3>
            <p className="mt-1 max-w-xl text-sm text-[var(--dash-text2)]">
              Use one primary action, keep supporting information quiet, and
              make the entire interactive target obvious.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-sm rounded-lg border border-[var(--dash-border)] px-4 py-2 text-sm font-bold"
          >
            Open details
          </button>
        </div>
      </Panel>
    </div>
  )
}

function PagePattern() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
      <Panel>
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-[var(--dash-muted)]">
          Recommended shell
        </p>
        <div className="overflow-hidden rounded-lg border border-[var(--dash-border)]">
          <div className="flex items-center justify-between border-b border-[var(--dash-border)] bg-[var(--dash-soft)] px-4 py-3">
            <span className="text-sm font-extrabold">Page title</span>
            <span className="rounded-lg bg-[var(--dash-text)] px-3 py-1.5 text-xs font-bold text-white">
              Primary action
            </span>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-3">
            <div className="h-24 rounded-lg bg-[var(--dash-soft)]" />
            <div className="h-24 rounded-lg bg-[var(--dash-soft)]" />
            <div className="h-24 rounded-lg bg-[var(--dash-soft)]" />
          </div>
          <div className="mx-4 mb-4 h-28 rounded-lg border border-dashed border-[var(--dash-border)]" />
        </div>
      </Panel>
      <Panel>
        <h2 className="mb-4 text-sm font-extrabold">Page anatomy</h2>
        <ol className="space-y-4 text-sm">
          {[
            'Context: title, description, breadcrumbs when needed',
            'Actions: one obvious primary action near the title',
            'Content: predictable grid with a useful empty state',
            'Feedback: loading, error, and saved states at the point of change',
          ].map((item, index) => (
            <li key={item} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--dash-soft)] text-xs font-extrabold text-[var(--dash-link)]">
                {index + 1}
              </span>
              <span className="pt-0.5 text-[var(--dash-text2)]">{item}</span>
            </li>
          ))}
        </ol>
      </Panel>
    </div>
  )
}

function Conventions() {
  const rules = [
    [
      'Permissions',
      'Enforce access in the API; hide navigation only as a convenience.',
    ],
    [
      'Loading',
      'Reserve the layout and use a skeleton or clear progress state.',
    ],
    [
      'Empty',
      'Explain why the state is empty and provide the next useful action.',
    ],
    [
      'Errors',
      'Keep the user’s input, explain the problem, and offer recovery.',
    ],
    [
      'Responsive',
      'Design for a narrow viewport first; test touch targets and overflow.',
    ],
    [
      'Accessibility',
      'Use semantic headings, labels, focus states, and keyboard paths.',
    ],
    [
      'Localization',
      'Use translation keys for user-facing copy; avoid layout assumptions.',
    ],
    [
      'Data',
      'Display exactly what the API stores and handle nulls explicitly.',
    ],
  ]
  return (
    <Panel>
      <div className="divide-y divide-[var(--dash-border)]">
        {rules.map(([name, rule]) => (
          <div
            key={name}
            className="grid gap-1 py-4 sm:grid-cols-[150px_1fr] sm:gap-6"
          >
            <span className="text-sm font-extrabold text-[var(--dash-text)]">
              {name}
            </span>
            <span className="text-sm leading-6 text-[var(--dash-text2)]">
              {rule}
            </span>
          </div>
        ))}
      </div>
    </Panel>
  )
}

function FeatureFlags({
  flags,
  saving,
  onToggle,
}: {
  flags: FeatureFlag[]
  saving: string | null
  onToggle: (key: string, tenantId: string, enabled: boolean) => void
}) {
  if (!flags.length) {
    return (
      <Panel>
        <p className="text-sm text-[var(--dash-muted)]">
          No feature flags configured yet.
        </p>
      </Panel>
    )
  }
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {flags.map((flag) => (
        <Panel key={flag.key}>
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-[var(--dash-link)]">
                {flag.key}
              </p>
              <p className="mt-1 text-sm text-[var(--dash-text2)]">
                {flag.description || 'No description'}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-[var(--dash-soft)] px-2.5 py-1 text-[11px] font-bold text-[var(--dash-muted)]">
              default {flag.defaultEnabled ? 'on' : 'off'}
            </span>
          </div>
          <div className="divide-y divide-[var(--dash-border)] border-y border-[var(--dash-border)]">
            {flag.tenants.map((tenant) => {
              const saveKey = `${flag.key}:${tenant.id}`
              return (
                <label
                  key={tenant.id}
                  className="flex cursor-pointer items-center justify-between gap-3 py-3 text-sm"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-[var(--dash-text)]">
                      {tenant.name}
                    </span>
                    <span className="block truncate text-xs text-[var(--dash-muted)]">
                      {tenant.subdomain}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    {saving === saveKey && (
                      <span className="text-xs text-[var(--dash-muted)]">
                        Saving…
                      </span>
                    )}
                    <input
                      type="checkbox"
                      checked={tenant.enabled}
                      disabled={saving !== null}
                      onChange={(event) =>
                        onToggle(flag.key, tenant.id, event.target.checked)
                      }
                      className="h-4 w-4 cursor-pointer rounded border-[var(--dash-border)] text-[var(--dash-link)] focus:ring-[var(--dash-link)]"
                    />
                  </span>
                </label>
              )
            })}
          </div>
        </Panel>
      ))}
    </div>
  )
}

export function DeveloperPortalScreen() {
  const [section, setSection] = useState<PortalSection>('overview')
  const [access, setAccess] = useState<'loading' | 'allowed' | 'denied'>(
    'loading'
  )
  const [flags, setFlags] = useState<FeatureFlag[]>([])
  const [savingFlag, setSavingFlag] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    api.getDeveloperAccess().then((response) => {
      if (mounted)
        setAccess(
          response.error || !response.data?.enabled ? 'denied' : 'allowed'
        )
    })
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (access !== 'allowed' || section !== 'flags') return
    api.getDeveloperFeatureFlags().then((response) => {
      if (response.data) setFlags(response.data)
    })
  }, [access, section])

  const toggleFlag = (key: string, tenantId: string, enabled: boolean) => {
    const saveKey = `${key}:${tenantId}`
    setSavingFlag(saveKey)
    setFlags((current) =>
      current.map((flag) =>
        flag.key !== key
          ? flag
          : {
              ...flag,
              tenants: flag.tenants.map((tenant) =>
                tenant.id === tenantId ? { ...tenant, enabled } : tenant
              ),
            }
      )
    )
    api
      .setDeveloperFeatureFlag(key, tenantId, enabled)
      .then((response) => {
        if (response.error) {
          setFlags((current) =>
            current.map((flag) =>
              flag.key !== key
                ? flag
                : {
                    ...flag,
                    tenants: flag.tenants.map((tenant) =>
                      tenant.id === tenantId
                        ? { ...tenant, enabled: !enabled }
                        : tenant
                    ),
                  }
            )
          )
        }
      })
      .finally(() => setSavingFlag(null))
  }

  if (access === 'denied') return <Navigate to="/admin" replace />
  if (access === 'loading')
    return (
      <div className="dash flex min-h-screen items-center justify-center bg-[var(--dash-bg)] text-sm text-[var(--dash-muted)]">
        Checking developer access…
      </div>
    )

  return (
    <CrmLayout
      active="Developer"
      title="Developer portal"
      subtitle="A shared reference for building MiPrecio screens"
      hideContext
    >
      <main className="mx-auto max-w-[1200px] p-4 sm:p-6 lg:p-8">
        <div className="mb-8 flex flex-col gap-5 border-b border-[var(--dash-border)] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Internal · super admins"
            title="Build with confidence"
          >
            The source of truth for spacing, components, page structure, and
            feature behavior. If a new screen is not represented here, add the
            pattern before shipping it.
          </SectionHeading>
          <span className="w-fit rounded-full bg-[var(--dash-soft)] px-3 py-1.5 text-xs font-bold text-[var(--dash-link)]">
            Design system · v1
          </span>
        </div>

        <nav
          aria-label="Developer portal sections"
          className="mb-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-5"
        >
          {sections.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSection(item.id)}
              className={`rounded-xl border p-3 text-left transition ${section === item.id ? 'border-[var(--dash-link)] bg-[var(--dash-soft)]' : 'border-[var(--dash-border)] bg-[var(--dash-surface)] hover:border-[var(--dash-link)]'}`}
            >
              <span className="block text-sm font-extrabold text-[var(--dash-text)]">
                {item.label}
              </span>
              <span className="mt-1 block text-xs text-[var(--dash-muted)]">
                {item.description}
              </span>
            </button>
          ))}
        </nav>

        {section === 'overview' && (
          <div className="grid gap-4 lg:grid-cols-3">
            <Panel>
              <p className="text-2xl">01</p>
              <h2 className="mt-3 text-base font-extrabold">
                Start with the pattern
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--dash-text2)]">
                Use the page anatomy before inventing a layout. Consistency
                makes the product easier to learn.
              </p>
            </Panel>
            <Panel>
              <p className="text-2xl">02</p>
              <h2 className="mt-3 text-base font-extrabold">
                Compose shared pieces
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--dash-text2)]">
                Reuse CRM primitives and tokens. A new component should solve a
                repeated problem.
              </p>
            </Panel>
            <Panel>
              <p className="text-2xl">03</p>
              <h2 className="mt-3 text-base font-extrabold">
                Ship the full state set
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--dash-text2)]">
                Loading, empty, error, success, permissions, mobile, and
                keyboard states are part of the feature.
              </p>
            </Panel>
          </div>
        )}
        {section === 'foundations' && (
          <div className="grid gap-4 lg:grid-cols-2">
            <TokenTable title="Spacing scale" rows={DESIGN_TOKENS.spacing} />
            <TokenTable title="Typography" rows={DESIGN_TOKENS.type} />
            <TokenTable title="Radii" rows={DESIGN_TOKENS.radii} />
            <TokenTable title="Containers" rows={DESIGN_TOKENS.containers} />
          </div>
        )}
        {section === 'components' && <ComponentExamples />}
        {section === 'patterns' && <PagePattern />}
        {section === 'conventions' && <Conventions />}
        {section === 'flags' && (
          <FeatureFlags
            flags={flags}
            saving={savingFlag}
            onToggle={toggleFlag}
          />
        )}
      </main>
    </CrmLayout>
  )
}
