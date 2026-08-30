import { useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { createDesignPreviewProps } from '../../components/appearance/ListAppearanceFields'
import { PencilList, type PencilVariant } from '../menu/pencil'

const variants: Record<string, PencilVariant> = {
  'wild-stem-verano': 'pencil-flower-summer',
  obsidian: 'pencil-obsidian-quarterly',
}

/** A real public-list template in its own narrow viewport for landing previews. */
export function TemplatePreviewScreen() {
  const { variant = 'wild-stem-verano' } = useParams<{ variant?: string }>()
  const template = variants[variant] ?? variants['wild-stem-verano']
  const baseProps = createDesignPreviewProps(
    template === 'pencil-obsidian-quarterly' ? '#D5B8FF' : '#A855F7'
  )
  const props =
    template === 'pencil-obsidian-quarterly'
      ? spanishObsidianPreview(baseProps)
      : {
          ...baseProps,
          content: {
            schemaVersion: 1 as const,
            blocks: [],
            hero: {
              eyebrow: 'WILD STEM · VERANO',
              title: 'Flores para la mesa de verano.',
              body: 'Ramos frescos y colores cálidos para cada rincón.',
            },
          },
        }

  useEffect(() => {
    document.documentElement.classList.add('template-preview-document')
    return () => document.documentElement.classList.remove('template-preview-document')
  }, [])

  return <div className="template-preview"><PencilList variant={template} {...props} /></div>
}

function spanishObsidianPreview(props: ReturnType<typeof createDesignPreviewProps>) {
  const items = [
    { ...props.allItems[0], id: 'lavado-premium', name: 'Lavado premium', price: '1200', description: 'Limpieza exterior e interior con terminación detallada.' },
    { ...props.allItems[0], id: 'pulido-proteccion', name: 'Pulido y protección', price: '1850', description: 'Brillo profundo y protección para la pintura.' },
    { ...props.allItems[0], id: 'interior-completo', name: 'Interior completo', price: '980', description: 'Tapizados, paneles y detalles renovados.' },
  ]

  return {
    ...props,
    tenant: { ...props.tenant, name: 'Obsidiana Detailing', description: 'Cuidado premium para tu vehículo.' },
    listName: 'Servicios de detailing',
    sections: [{ ...props.sections[0], name: 'Servicios', items, min: 980, max: 1850 }],
    base: items,
    allItems: items,
    content: {
      schemaVersion: 1 as const,
      blocks: [],
      hero: {
        eyebrow: 'OBSEDIANA · DETAILING',
        title: 'Cuidamos cada detalle.',
        body: 'Servicios premium para que tu auto se vea impecable todos los días.',
      },
    },
  }
}
