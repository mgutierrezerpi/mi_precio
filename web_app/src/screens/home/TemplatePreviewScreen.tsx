import { useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { createDesignPreviewProps } from '../../components/appearance/ListAppearanceFields'
import { localeForHostname } from '../../lib/domainLocale'
import { PencilList } from '../menu/pencil'
import type { PencilVariant } from '../menu/pencil/variants'

const variants: Record<string, PencilVariant> = {
  'wild-stem-verano': 'pencil-flower-summer',
  obsidian: 'pencil-obsidian-quarterly',
}

/** A real public-list template in its own narrow viewport for landing previews. */
export function TemplatePreviewScreen() {
  const { variant = 'wild-stem-verano' } = useParams<{ variant?: string }>()
  const template = variants[variant] ?? variants['wild-stem-verano']
  const english = localeForHostname() === 'en'
  const baseProps = createDesignPreviewProps(
    template === 'pencil-obsidian-quarterly' ? '#D5B8FF' : '#A855F7',
    english ? 'en' : 'es'
  )
  const props =
    template === 'pencil-obsidian-quarterly'
      ? obsidianPreview(baseProps, english)
      : {
          ...baseProps,
          content: {
            schemaVersion: 1 as const,
            blocks: [],
            hero: {
              eyebrow: english ? 'WILD STEM · SUMMER' : 'WILD STEM · VERANO',
              title: english
                ? 'Flowers for your summer table.'
                : 'Flores para la mesa de verano.',
              body: english
                ? 'Fresh bouquets and warm colors for every corner.'
                : 'Ramos frescos y colores cálidos para cada rincón.',
            },
          },
        }

  useEffect(() => {
    document.documentElement.classList.add('template-preview-document')
    return () =>
      document.documentElement.classList.remove('template-preview-document')
  }, [])

  return (
    <div className="template-preview">
      <PencilList variant={template} {...props} />
    </div>
  )
}

function obsidianPreview(
  props: ReturnType<typeof createDesignPreviewProps>,
  english: boolean
) {
  const items = [
    {
      ...props.allItems[0],
      id: 'premium-wash',
      name: english ? 'Premium wash' : 'Lavado premium',
      price: '1200',
      description: english
        ? 'Exterior and interior cleaning with a detailed finish.'
        : 'Limpieza exterior e interior con terminación detallada.',
    },
    {
      ...props.allItems[0],
      id: 'polish-protection',
      name: english ? 'Polish and protection' : 'Pulido y protección',
      price: '1850',
      description: english
        ? 'Deep shine and paint protection.'
        : 'Brillo profundo y protección para la pintura.',
    },
    {
      ...props.allItems[0],
      id: 'full-interior',
      name: english ? 'Full interior' : 'Interior completo',
      price: '980',
      description: english
        ? 'Renewed upholstery, panels, and details.'
        : 'Tapizados, paneles y detalles renovados.',
    },
  ]

  return {
    ...props,
    tenant: {
      ...props.tenant,
      name: english ? 'Obsidian Detailing' : 'Obsidiana Detailing',
      description: english
        ? 'Premium care for your vehicle.'
        : 'Cuidado premium para tu vehículo.',
    },
    listName: english ? 'Detailing services' : 'Servicios de detailing',
    sections: [
      {
        ...props.sections[0],
        name: english ? 'Services' : 'Servicios',
        items,
        min: 980,
        max: 1850,
      },
    ],
    base: items,
    allItems: items,
    content: {
      schemaVersion: 1 as const,
      blocks: [],
      hero: {
        eyebrow: english ? 'OBSIDIAN · DETAILING' : 'OBSEDIANA · DETAILING',
        title: english ? 'We care for every detail.' : 'Cuidamos cada detalle.',
        body: english
          ? 'Premium services to keep your car looking immaculate every day.'
          : 'Servicios premium para que tu auto se vea impecable todos los días.',
      },
    },
  }
}
