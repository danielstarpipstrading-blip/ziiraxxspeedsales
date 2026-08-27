import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const app = express();
const PORT = process.env.PORT || 10000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.use(express.json());
app.use(express.static(__dirname));

function clean(value, max = 500) {
  return String(value ?? "").trim().slice(0, max);
}

// Submit 7-day trial
app.post("/api/trial", async (req, res) => {
  try {
    const data = req.body || {};

    const required = [
      "fullName",
      "businessName",
      "businessSells",
      "whatsapp",
      "product",
      "traffic",
      "goal"
    ];

    const missing = required.find((field) => !clean(data[field]));

    if (missing) {
      return res.status(400).json({
        ok: false,
        error: `Please provide ${missing}.`
      });
    }

    const lead = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      full_name: clean(data.fullName, 120),
      business_name: clean(data.businessName, 160),
      business_sells: clean(data.businessSells),
      whatsapp: clean(data.whatsapp, 80),
      website: clean(data.website, 300),
      social: clean(data.social, 300),
      product: clean(data.product),
      traffic: clean(data.traffic, 100),
      goal: clean(data.goal, 160),
      source: "Sales System 7-Day Free Trial"
    };

    const { error } = await supabase
      .from("trials")
      .insert(lead);

    if (error) {
      console.error("Supabase error:", error);

      return res.status(500).json({
        ok: false,
        error: "We could not save your trial request."
      });
    }

    res.status(201).json({
      ok: true,
      saved: true,
      message: "Your 7-day free trial request has been received."
    });

  } catch (error) {
    console.error("TRIAL_ERROR:", error);

    res.status(500).json({
      ok: false,
      error: "Something went wrong."
    });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Ziiraxx server running on port ${PORT}`);
});
