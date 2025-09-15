import { Hono } from "hono";
import {
  addTable,
  getTableByNameAndCampusId,
} from "../../../../data/tableDao.ts"; // Import getTableByNameAndCampusId
import { getClaim } from "../../../../auth/claim.ts";
import { getAdminById } from "../../../../data/adminDao.ts"; // Import getAdminById
import { addSystemLog } from "../../../../data/systemLogDao.ts";
import { SystemLogType } from "../../../../models/systemLog.ts";

export function useApiAdminTableAdd(app: Hono) {
  app.post("/api/admin/table/add", async (c) => {
    const { name, campusId: inputCampusId } = await c.req.json();
    const claim = await getClaim(c);

    let actualCampusId = inputCampusId;

    if (claim.type === "admin") {
      const admin = getAdminById(claim.id); // Get admin details
      if (!admin) {
        return c.json({ message: "Admin not found." }, 404);
      }
      // Admin can only add tables to their own campus
      if (inputCampusId && inputCampusId !== admin.campus) { // Use admin.campus
        return c.json({
          message: "Admins can only add tables to their own campus.",
        }, 403);
      }
      actualCampusId = admin.campus; // Use admin.campus
    } else if (claim.type !== "root") {
      // Only root and admin can add tables
      return c.json({ message: "Unauthorized" }, 403);
    }

    if (!name || !actualCampusId) {
      return c.json({ message: "Table name and campus ID are required." }, 400);
    }

    // Check if table with same name already exists in the same campus
    const existingTable = getTableByNameAndCampusId(name, actualCampusId);
    if (existingTable) {
      return c.json({
        message: "Table with this name already exists in this campus.",
      }, 409); // 409 Conflict
    }

    try {
      const id = addTable({ name, campusId: actualCampusId });
      addSystemLog({
        campusId: actualCampusId,
        type: SystemLogType.TableAdd,
        text:
          `Admin ${claim.id} added table '${name}' to campus ID ${actualCampusId}.`,
        relatedId: id, // No specific related ID
      });
      return c.json({ message: "Table added successfully!" });
    } catch (error) {
      console.error("Error adding table:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
