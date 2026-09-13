import { createHmac } from 'node:crypto'
import { expect, test, type BrowserContext, type Page } from '@playwright/test'

const authCode = process.env.E2E_AUTH_CODE ?? '424242'
const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
const email = `browser-${runId}@example.com`
const productName = `Café E2E ${runId}`
const listName = `Lista E2E ${runId}`
const publicSlug = `e2e-${runId}`.replace(/[^a-z0-9-]/g, '')

async function navigate(page: Page, path: string) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await page.goto(path)
      return
    } catch (error) {
      if (!String(error).includes('ERR_ABORTED') || attempt === 2) throw error
    }
  }
}

async function fillCheckoutField(page: Page, label: string, value: string) {
  const deadline = Date.now() + 15_000
  while (Date.now() < deadline) {
    for (const frame of page.frames()) {
      const input = frame.getByRole('textbox', { name: label, exact: true })
      if ((await input.count()) > 0) {
        await input.fill(value)
        return
      }
    }
    await page.waitForTimeout(250)
  }
  throw new Error(`Lemon Squeezy field not found: ${label}`)
}

async function signIn(page: Page) {
  // The container port opens just before Vite finishes its first dependency
  // optimization. Reload a blank bootstrap page instead of racing that work.
  for (let attempt = 0; attempt < 6; attempt += 1) {
    await navigate(page, '/login')
    if (await page.locator('#email').isVisible()) break
    await page.waitForTimeout(1_000)
  }
  await expect(page.locator('#email')).toBeVisible()
  await page.waitForTimeout(3_000)
  if (!(await page.locator('#email').isVisible())) {
    await navigate(page, '/login')
    await expect(page.locator('#email')).toBeVisible()
  }
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await page.locator('#email').fill(email)
    await page.getByRole('button', { name: 'Enviar código' }).click()
    await page
      .locator('#code')
      .waitFor({ state: 'visible', timeout: 5_000 })
      .catch(() => {})
    if (await page.locator('#code').isVisible()) break
    await navigate(page, '/login')
    await expect(page.locator('#email')).toBeVisible()
  }
  await expect(page.locator('#code')).toBeVisible()
  await page.locator('#code').fill(authCode)
  await page.getByRole('button', { name: 'Verificar código' }).click()
}

async function choosePlan(page: Page) {
  await expect(page).toHaveURL(/\/plans/)
  const plusCard = page.getByText('Plus', { exact: true }).locator('..').locator('..')
  await plusCard.getByRole('button', { name: 'Empezar prueba' }).click()

  await expect(page).toHaveURL(/\/admin/)
}

async function verifyLemonCheckout(page: Page) {
  await expect(page).toHaveURL(/\/plans/)
  const tenantId = await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem('auth_state') || '{}')
    return state.tenant?.id as string | undefined
  })
  expect(tenantId).toBeTruthy()
  const plusCard = page.getByText('Plus', { exact: true }).locator('..').locator('..')
  await plusCard.getByRole('button', { name: 'Empezar prueba' }).click()
  await expect(page).toHaveURL(/lemonsqueezy\.com|\/checkout\//, { timeout: 30_000 })
  await expect(page.getByText(/modo de prueba/i)).toBeVisible()
  await expect(page.getByText('Plus', { exact: true })).toBeVisible()
  await fillCheckoutField(page, 'Número de tarjeta', '4242424242424242')
  await fillCheckoutField(page, 'Fecha de caducidad', '1230')
  await fillCheckoutField(page, 'Código de seguridad', '123')
  await page.getByRole('textbox', { name: 'Nombre del titular de la tarjeta' }).fill('Browser Test')
  await page
    .getByRole('combobox', { name: 'Dirección de facturación' })
    .selectOption({ label: 'Uruguay' })
  await page.getByRole('textbox', { name: 'Código postal' }).fill('11100')
  await expect(
    page.getByRole('button', { name: 'Inicia el período de prueba' })
  ).toBeEnabled()
  return tenantId!
}

async function simulateLemonWebhook(tenantId: string) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET
  const variantId = process.env.LEMONSQUEEZY_VARIANT_PLUS
  if (!secret || !variantId) throw new Error('Lemon Squeezy E2E secrets are missing')
  const body = JSON.stringify({
    meta: {
      event_name: 'subscription_created',
      test_mode: true,
      custom_data: { tenant_id: tenantId, plan: 'plus' },
    },
    data: {
      type: 'subscriptions',
      id: `e2e-subscription-${runId}`,
      attributes: {
        store_id: Number(process.env.LEMONSQUEEZY_STORE_ID),
        customer_id: 424242,
        order_id: 424242,
        order_item_id: 424242,
        product_id: 424242,
        variant_id: Number(variantId),
        status: 'on_trial',
        trial_ends_at: '2030-01-15T00:00:00Z',
        renews_at: '2030-01-15T00:00:00Z',
        ends_at: null,
        card_brand: 'visa',
        card_last_four: '4242',
        urls: {},
      },
    },
  })
  const signature = createHmac('sha256', secret).update(body).digest('hex')
  const apiPort = process.env.E2E_API_PORT ?? '43118'
  const response = await fetch(
    `http://localhost:${apiPort}/api/v1/billing/lemon-squeezy/webhook`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-signature': signature },
      body,
    }
  )
  expect(response.status).toBe(200)
  expect(await response.json()).toEqual({ ok: true })
}

async function completeApplicationJourney(page: Page, context: BrowserContext) {
  const skipTour = page.getByRole('button', { name: 'Saltar' })
  await skipTour.waitFor({ state: 'visible', timeout: 5_000 }).catch(() => {})
  if (await skipTour.isVisible()) await skipTour.click()

  await navigate(page, '/admin/items')
  await page.getByRole('button', { name: 'Nuevo producto' }).click()
  const productDialog = page.getByRole('heading', { name: 'Nuevo producto' }).locator('..').locator('..')
  await productDialog.getByLabel('Nombre').fill(productName)
  await productDialog.getByLabel('Precio').fill('245')
  await productDialog.getByLabel('Categoría').fill('Cafetería')
  await productDialog.getByRole('button', { name: 'Crear producto' }).click()
  await expect(page.getByText(productName, { exact: true })).toBeVisible()

  await navigate(page, '/admin/lists')
  await page.getByRole('button', { name: 'Nueva lista' }).click()
  await page.getByLabel('Nombre').fill(listName)
  await page.getByRole('button', { name: 'Siguiente' }).click()
  await page.getByRole('button', { name: new RegExp(productName) }).click()
  await page.getByRole('button', { name: 'Crear lista' }).click()
  await expect(page.getByText(listName, { exact: true })).toBeVisible()

  await navigate(page, '/admin/links')
  await expect(page.getByRole('heading', { name: 'Tu página de links' })).toBeVisible()
  await page.getByLabel('Nombre público').fill('Negocio E2E')
  await page.getByLabel('Link público').fill(publicSlug)
  const profile = page
    .getByRole('heading', { name: 'Perfil del negocio' })
    .locator('..')
    .locator('..')
  await profile
    .getByLabel('Descripción')
    .fill('Contenido verificado por el navegador')
  const published = page.getByLabel('Página publicada')
  if (!(await published.isChecked())) await published.check()
  await page.getByRole('button', { name: 'Agregar link' }).click()
  const newLink = page
    .locator('article')
    .filter({ has: page.getByLabel('URL') })
    .last()
  await newLink.getByLabel('Título').fill('Sitio de ejemplo')
  await newLink.getByLabel('URL').fill('https://example.com/e2e')
  await page.getByRole('button', { name: 'Guardar ahora' }).click()
  await expect(page.getByRole('button', { name: 'Guardar ahora' })).toBeHidden()

  const publicPage = await context.newPage()
  await navigate(publicPage, `/l/${publicSlug}`)
  await expect(publicPage.getByText('Negocio E2E', { exact: true })).toBeVisible()
  await expect(publicPage.getByRole('link', { name: /Sitio de ejemplo/ })).toHaveAttribute('href', 'https://example.com/e2e')
  await publicPage.close()

  await page.locator('button[aria-haspopup="menu"]').last().click()
  await page.getByRole('menuitem', { name: 'Cerrar sesión' }).click()
  await expect(page).toHaveURL(/\/$/)

  await signIn(page)
  await expect(page).toHaveURL(/\/admin/)
  await navigate(page, '/admin/lists')
  await expect(page.getByText(listName, { exact: true })).toBeVisible()
  await navigate(page, '/admin/items')
  await expect(page.getByText(productName, { exact: true })).toBeVisible()
  await navigate(page, '/admin/links')
  await expect(page.getByLabel('Link público')).toHaveValue(publicSlug)
  await expect(
    page.getByText('Sitio de ejemplo', { exact: true }).first()
  ).toBeVisible()
}

test('signup through persisted public content and sign back in', async ({ page, context }) => {
  test.skip(process.env.E2E_LEMONSQUEEZY === 'true', 'Run the provider journey in Lemon Squeezy mode')
  await signIn(page)
  await choosePlan(page)
  await completeApplicationJourney(page, context)
})

test('continues the full journey after a signed Lemon Squeezy test webhook', async ({ page, context }) => {
  test.skip(process.env.E2E_LEMONSQUEEZY !== 'true', 'Requires Lemon Squeezy test credentials')
  await signIn(page)
  const tenantId = await verifyLemonCheckout(page)
  await simulateLemonWebhook(tenantId)
  await navigate(page, '/plans?checkout_plan=plus')
  await expect(page).toHaveURL(/\/admin/, { timeout: 30_000 })
  await completeApplicationJourney(page, context)
})
