import express from "express";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

const requiredColumns = {
  basketball: ["user_id", "points", "rebounds", "assists", "steals", "blocks", "turnovers"],
  volleyball: ["user_id", "kills", "blocks", "aces", "digs", "errors"],
  football: ["user_id", "goals", "assists", "tackles", "yellow_cards", "red_cards"]
};

const optionalColumns = {
  basketball: ["fg_percent", "three_percent", "ft_percent", "minutes_played"],
  volleyball: ["assists"],
  football: ["shots", "passes", "interceptions", "saves", "minutes_played"]
};

router.post("/", async (req, res) => {
  const { rows } = req.body;

  if (!rows || !Array.isArray(rows)) {
    return res.status(400).json({ 
      message: "Invalid request: 'rows' must be an array" 
    });
  }

  if (rows.length === 0) {
    return res.status(400).json({ 
      message: "No data provided" 
    });
  }

  try {
    const grouped = {
      basketball: [],
      volleyball: [],
      football: []
    };

    const errors = [];
    const processedRows = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 1;

      const cleanedRow = {};
      for (const [key, value] of Object.entries(row)) {
        cleanedRow[key.trim().toLowerCase()] = 
          typeof value === 'string' ? value.trim() : value;
      }

      // Check if sport column exists
      const sport = cleanedRow.sport?.toLowerCase();
      
      if (!sport) {
        errors.push({
          row: rowNum,
          error: "Missing 'sport' column",
          data: cleanedRow
        });
        continue;
      }

      // Check if sport is valid
      if (!requiredColumns[sport]) {
        errors.push({
          row: rowNum,
          sport,
          error: `Invalid sport. Must be one of: ${Object.keys(requiredColumns).join(", ")}`,
          data: cleanedRow
        });
        continue;
      }

      // Remove sport column from the data
      delete cleanedRow.sport;

      const validation = validateRow(cleanedRow, sport);
      if (!validation.ok) {
        errors.push({
          row: rowNum,
          sport,
          error: "Missing required columns",
          missing: validation.missing,
          data: cleanedRow
        });
        continue;
      }

      if (!cleanedRow.user_id || cleanedRow.user_id === '') {
        errors.push({
          row: rowNum,
          sport,
          error: "user_id is required and cannot be empty",
          data: cleanedRow
        });
        continue;
      }

      const converted = convertNumericFields(cleanedRow, sport);
      if (converted.errors.length > 0) {
        errors.push({
          row: rowNum,
          sport,
          error: "Invalid numeric values",
          invalidFields: converted.errors,
          data: cleanedRow
        });
        continue;
      }

      const allowedKeys = [
        "user_id", 
        ...requiredColumns[sport], 
        ...(optionalColumns[sport] || [])
      ];

      const finalRow = {};
      
      for (const key of allowedKeys) {
        if (converted.data[key] !== undefined) {
          finalRow[key] = converted.data[key];
        }
      }

      grouped[sport].push(finalRow);
      processedRows.push({ row: rowNum, sport, user_id: cleanedRow.user_id });
    }

    if (errors.length > 0) {
      return res.status(400).json({
        message: `Validation failed for ${errors.length} row(s)`,
        errors,
        processedCount: processedRows.length,
        totalCount: rows.length
      });
    }

    const allUserIds = [...new Set(processedRows.map(r => r.user_id))];
    const { data: existingUsers, error: userCheckError } = await supabase
      .from('users')
      .select('user_id')
      .in('user_id', allUserIds);

    if (userCheckError) {
      console.error("User check error:", userCheckError);
    } else {
      const existingUserIds = new Set(existingUsers?.map(u => u.user_id) || []);
      const nonExistentUsers = allUserIds.filter(id => !existingUserIds.has(id));
      
      if (nonExistentUsers.length > 0) {
        return res.status(400).json({
          message: "Some user IDs do not exist in the database",
          nonExistentUsers,
          hint: "Please ensure all user_ids are valid before uploading"
        });
      }
    }

    const results = {
      basketball: { success: 0, failed: 0 },
      volleyball: { success: 0, failed: 0 },
      football: { success: 0, failed: 0 }
    };

    for (const sport of Object.keys(grouped)) {
      if (grouped[sport].length === 0) continue;

      const table = `${sport}_stats`;

      const { data, error } = await supabase
        .from(table)
        .upsert(grouped[sport], { 
          onConflict: "user_id",
          ignoreDuplicates: false 
        })
        .select();

      if (error) {
        console.error(`Error inserting ${sport} stats:`, error);
        results[sport].failed = grouped[sport].length;
        
        return res.status(500).json({ 
          message: `Failed to upload ${sport} stats`,
          error: error.message,
          details: error.details,
          hint: error.hint,
          sport,
          affectedRows: grouped[sport].length
        });
      }

      results[sport].success = grouped[sport].length;
    }

    const totalSuccess = Object.values(results).reduce((sum, r) => sum + r.success, 0);
    const totalFailed = Object.values(results).reduce((sum, r) => sum + r.failed, 0);

    res.json({
      message: "Stats uploaded successfully",
      summary: {
        total: rows.length,
        success: totalSuccess,
        failed: totalFailed
      },
      breakdown: results,
      processedRows
    });

  } catch (err) {
    console.error("Upload stats error:", err);
    res.status(500).json({ 
      message: "Upload failed due to server error",
      error: err.message 
    });
  }
});

function validateRow(row, sport) {
  const required = requiredColumns[sport];
  const missing = [];

  for (let col of required) {
    if (!(col in row) || row[col] === null || row[col] === undefined || row[col] === '') {
      missing.push(col);
    }
  }

  if (missing.length > 0) {
    return { ok: false, missing };
  }

  return { ok: true };
}

function convertNumericFields(row, sport) {
  const converted = { ...row };
  const errors = [];
  
  const numericColumns = [...requiredColumns[sport], ...(optionalColumns[sport] || [])]
    .filter(col => col !== 'user_id'); 

  for (const col of numericColumns) {
    if (col in converted) {
      const value = converted[col];
      
      if (typeof value === 'number') {
        if (isNaN(value) || !isFinite(value)) {
          errors.push({ column: col, value, reason: "Invalid number" });
        }
        continue;
      }

      if (typeof value === 'string') {
        const trimmed = value.trim();
        
        if (trimmed === '' && optionalColumns[sport]?.includes(col)) {
          delete converted[col];
          continue;
        }

        const num = Number(trimmed);
        
        if (isNaN(num) || !isFinite(num)) {
          errors.push({ column: col, value, reason: "Cannot convert to number" });
        } else {
          converted[col] = num;
        }
      }
    }
  }

  return { data: converted, errors };
}

export default router;