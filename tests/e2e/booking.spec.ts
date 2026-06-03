import { test, expect } from "@playwright/test"
import { prisma } from "../../lib/db"

test.beforeEach(async () => {
  await prisma.slotHold.deleteMany()
  await prisma.appointment.deleteMany()
})

test.afterAll(async () => {
  await prisma.$disconnect()
})

test("completes booking flow to payment", async ({ page }) => {
  test.setTimeout(60000)

  // Block Stripe script load
  await page.route("**/js.stripe.com/**", (route) => route.abort())

  // Inject Stripe mock before page loads
  await page.addInitScript(() => {
    const StripeMock = () => ({
      elements: () => ({
        create: () => ({
          mount: (selector: unknown) => {
            const container =
              typeof selector === "string"
                ? document.querySelector(selector)
                : (selector as Element | null)
            if (container) {
              container.innerHTML = `
                <div class="mock-stripe-element space-y-2">
                  <p class="text-xs text-muted-foreground font-mono">MOCK STRIPE PAYMENT ELEMENT</p>
                  <input name="cardnumber" placeholder="Card number" class="w-full p-2 border rounded-sm text-sm" value="4242 4242 4242 4242" />
                  <input name="exp-date" placeholder="MM/YY" class="w-1/2 p-2 border rounded-sm text-sm" value="12/28" />
                  <input name="cvc" placeholder="CVC" class="w-1/2 p-2 border rounded-sm text-sm" value="123" />
                  <input name="postal" placeholder="Postal code" class="w-full p-2 border rounded-sm text-sm" value="E2 8RU" />
                </div>
              `
            }
          },
          on: (event: string, callback: (...args: unknown[]) => void) => {
            if (event === "ready") {
              setTimeout(callback, 0)
            }
            if (event === "change") {
              setTimeout(
                () => callback({ complete: true, empty: false, value: {} }),
                0
              )
            }
          },
          destroy: () => {},
          unmount: () => {},
          update: () => {},
        }),
        submit: async () => ({ error: null }),
      }),
      createToken: async () => ({ token: { id: "tok_mock" } }),
      createSource: async () => ({ source: { id: "src_mock" } }),
      createPaymentMethod: async () => ({ paymentMethod: { id: "pm_mock" } }),
      confirmCardPayment: async () => ({
        paymentIntent: { status: "succeeded" },
      }),
      confirmPayment: async ({
        confirmParams,
      }: {
        confirmParams: { return_url: string }
      }) => {
        const url = new URL(confirmParams.return_url)
        url.searchParams.set("payment_intent", "pi_mock_123")
        url.searchParams.set(
          "payment_intent_client_secret",
          "pi_mock_123_secret_123"
        )
        window.history.pushState(null, "", url.pathname + url.search)
        window.dispatchEvent(new PopStateEvent("popstate"))
        return { error: null }
      },
    })
    const StripeMockTyped = StripeMock as unknown as { version: string }
    StripeMockTyped.version = "dahlia"
    const win = window as unknown as { Stripe: unknown }
    win.Stripe = StripeMockTyped
  })

  await page.goto("/")

  await expect(page.locator("h1")).toContainText("The geometry")

  await page.click("button:has-text('Classic Set')")

  const continueButton = page.locator("button:has-text('Continue')")
  await expect(continueButton).toBeVisible()
  await page.waitForTimeout(500)
  await continueButton.click()

  await expect(page).toHaveURL("/classic")

  await expect(page.locator("h1")).toContainText("Pick a date")

  await page.waitForResponse((response) =>
    response.url().includes("/api/availability/dates")
  )

  page.on("console", (msg) => console.log("PAGE LOG:", msg.text()))
  page.on("pageerror", (err) =>
    console.log("PAGE ERROR:", err.message, err.stack)
  )
  page.on("requestfailed", (req) =>
    console.log("PAGE REQ FAILED:", req.url(), req.failure()?.errorText)
  )
  page.on("response", async (res) => {
    if (res.url().includes("/api/")) {
      console.log(`API RESPONSE: ${res.url()} -> ${res.status()}`)
      if (res.status() >= 400) {
        try {
          console.log(`API ERROR BODY:`, await res.text())
        } catch {
          // Ignore
        }
      }
    }
  })

  const firstAvailableDate = page
    .locator("button[data-day]:not([disabled])")
    .first()
  await firstAvailableDate.click()

  const firstTimeSlot = page
    .locator('h2:has-text("Available times") ~ div button')
    .first()
  await expect(firstTimeSlot).toBeVisible({ timeout: 10000 })
  await page.waitForTimeout(500)

  const holdPromise = page.waitForResponse(
    (resp) => resp.url().includes("/api/slots/hold"),
    { timeout: 10000 }
  )
  await firstTimeSlot.click()
  await holdPromise

  await expect(page.locator("h1")).toContainText("Your details")

  await page.fill("#name", "Test Client")
  await page.fill("#email", "test@example.com")
  await page.fill("#phone", "07123456789")
  await page.click("button:has-text('Review policy')")

  await expect(page.locator("h1")).toContainText("Studio policy")

  await page.click("label[for='agree']")
  await page.click("button:has-text('Proceed to payment')")

  await expect(page.locator("h1")).toContainText("Secure your slot")

  const cardNumberInput = page.locator("input[name='cardnumber']")
  await cardNumberInput.fill("4242 4242 4242 4242")
  await page.locator("input[name='exp-date']").fill("12/28")
  await page.locator("input[name='cvc']").fill("123")
  await page.locator("input[name='postal']").fill("E2 8RU")

  // Click Pay Deposit
  await page.click("button:has-text('Pay')")

  // Verify Booking Confirmation Page
  await expect(page.locator("h1")).toContainText("booked", { timeout: 20000 })
})
