import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../services/api'
import type { PlanId, PlanInfo } from '../../types'
import { logout } from './authThunks'

export interface PlanState {
  tenantId: string | null
  /** `tenant.plan` this answer was asked for: when it changes, the answer is old. */
  storedPlan: PlanId | null
  info: PlanInfo | null
  status: 'idle' | 'loading' | 'loaded' | 'failed'
  requestId: string | null
}

const initialState: PlanState = {
  tenantId: null,
  storedPlan: null,
  info: null,
  status: 'idle',
  requestId: null,
}

interface FetchPlanArgs {
  tenantId: string
  storedPlan?: PlanId
  force?: boolean
}

/** The sidebar, the header and the screen all ask at once: one request serves them. */
export const fetchPlanInfo = createAsyncThunk(
  'plan/fetch',
  async ({ tenantId }: FetchPlanArgs) => {
    const res = await api.getPlan(tenantId)
    if (!res.data) throw new Error(res.error || 'plan_unavailable')
    return res.data
  },
  {
    condition: ({ tenantId, storedPlan, force }, { getState }) => {
      if (force) return true
      const { plan } = getState() as { plan: PlanState }
      const sameRequest =
        plan.tenantId === tenantId && plan.storedPlan === (storedPlan ?? null)
      return !sameRequest || plan.status === 'idle' || plan.status === 'failed'
    },
  }
)

const planSlice = createSlice({
  name: 'plan',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlanInfo.pending, (state, action) => {
        const { tenantId, storedPlan } = action.meta.arg
        if (state.tenantId !== tenantId) state.info = null
        state.tenantId = tenantId
        if (storedPlan !== undefined) state.storedPlan = storedPlan
        state.requestId = action.meta.requestId
        state.status = 'loading'
      })
      .addCase(fetchPlanInfo.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return
        state.info = action.payload
        state.status = 'loaded'
      })
      .addCase(fetchPlanInfo.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return
        state.status = 'failed'
      })
      .addCase(logout.fulfilled, () => initialState)
  },
})

export default planSlice.reducer
