import { Hono } from "hono";
import { arrangeMatches } from "../../../utils.ts";

export function useApiDebugArrangeMatches(app: Hono) {
  app.get("/api/debug/arrangeMatches", (c) => {
    try {
      arrangeMatches();
      return c.json({ message: "Match arrangement triggered." });
    } catch (error) {
      console.error("Error arranging matches:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
