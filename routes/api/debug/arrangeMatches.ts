import { Hono } from "hono";
import { arrangeMatches } from "../../../utils.ts";

export function useApiDebugArrangeMatches(app: Hono) {
  app.get("/api/debug/arrangeMatches", (c) => {
    try {
      arrangeMatches();
      return c.json({ message: "比赛安排已触发。" });
    } catch (error) {
      console.error("安排比赛时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
