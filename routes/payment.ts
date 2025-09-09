import { Hono } from "hono";

export function usePayment(app: Hono) {
  app.get("/payment/:orderNumber", async (c) => {
    const paymentPage = await Deno.readTextFile(
      "./static/payment.html",
    );
    return c.html(paymentPage);
  });
}
