import { useAppSelector, useAppDispatch } from '../store/hooks'
import { selectDensity, setDensity } from '../store/slices/uiSlice'

/** Admin layout density: 'full' (original spacious design) vs 'compact'. Persisted. */
export function useDensity() {
  const dispatch = useAppDispatch()
  const density = useAppSelector(selectDensity)
  const compact = density === 'compact'
  const toggleDensity = () => dispatch(setDensity(compact ? 'full' : 'compact'))
  return { density, compact, toggleDensity }
}
