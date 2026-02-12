import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProduct,
  getStockLevel,
  adjustStock,
  listMovements,
  listCategories,
  createCategory,
  assignProductCategories,
  listVariants,
  createVariant,
  deleteVariant
} from "./db.js";
import { listSerials, addSerial } from "./db.js";
import { listLots, addLot } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/products", (req, res) => {
  res.json(listProducts());
});

app.get("/api/products/:id", (req, res) => {
  const id = Number(req.params.id);
  res.json(getProduct(id));
});
app.post("/api/products", (req, res) => {
  try {
    const p = createProduct(req.body || {});
    res.status(201).json(p);
  } catch (e) {
    res.status(400).json({ error: e.message || String(e) });
  }
});

app.put("/api/products/:id", (req, res) => {
  try {
    const p = updateProduct(Number(req.params.id), req.body || {});
    res.json(p);
  } catch (e) {
    res.status(404).json({ error: e.message || String(e) });
  }
});

app.delete("/api/products/:id", (req, res) => {
  try {
    deleteProduct(Number(req.params.id));
    res.json({ ok: true });
  } catch (e) {
    res.status(404).json({ error: e.message || String(e) });
  }
});

app.get("/api/stock/:productId", (req, res) => {
  const productId = Number(req.params.productId);
  const location = String(req.query.location || "Main");
  const sublocation = String(req.query.sublocation || "");
  res.json(getStockLevel(productId, location, sublocation));
});

app.post("/api/stock-adjustments", (req, res) => {
  try {
    const payload = {
      product_id: Number(req.body.product_id),
      delta: Number(req.body.delta),
      location: String(req.body.location || "Main"),
      sublocation: String(req.body.sublocation || ""),
      reason: String(req.body.reason || ""),
      remarks: String(req.body.remarks || ""),
      reference: String(req.body.reference || ""),
      serials: Array.isArray(req.body.serials)
        ? req.body.serials.map(s => String(s)).filter(Boolean)
        : String(req.body.serials || "")
            .split(",")
            .map(s => s.trim())
            .filter(Boolean)
      lot: req.body.lot
        ? {
            batch_code: String(req.body.lot.batch_code || ""),
            batch_date: String(req.body.lot.batch_date || ""),
            expiration_date: String(req.body.lot.expiration_date || "")
          }
        : null
    };
    const result = adjustStock(payload);
    res.status(201).json(result);
  } catch (e) {
    res.status(400).json({ error: e.message || String(e) });
  }
});

app.get("/api/movements", (req, res) => {
  const product_id = req.query.product_id ? Number(req.query.product_id) : null;
  res.json(listMovements({ product_id }));
});

app.get("/api/categories", (req, res) => {
  res.json(listCategories());
});

app.post("/api/categories", (req, res) => {
  try {
    const c = createCategory(req.body?.name || "");
    res.status(201).json(c);
  } catch (e) {
    res.status(400).json({ error: e.message || String(e) });
  }
});

app.post("/api/products/:id/assign-categories", (req, res) => {
  try {
    const id = Number(req.params.id);
    const names = Array.isArray(req.body?.names) ? req.body.names : [];
    const result = assignProductCategories(id, names);
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: e.message || String(e) });
  }
});

app.get("/api/products/:id/variants", (req, res) => {
  const id = Number(req.params.id);
  res.json(listVariants(id));
});

app.post("/api/products/:id/variants", (req, res) => {
  try {
    const id = Number(req.params.id);
    const v = createVariant(id, req.body || {});
    res.status(201).json(v);
  } catch (e) {
    res.status(400).json({ error: e.message || String(e) });
  }
});

app.delete("/api/variants/:variantId", (req, res) => {
  try {
    const vid = Number(req.params.variantId);
    const result = deleteVariant(vid);
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: e.message || String(e) });
  }
});

app.get("/api/products/:id/serials", (req, res) => {
  const id = Number(req.params.id);
  res.json(listSerials(id));
});

app.post("/api/products/:id/serials", (req, res) => {
  try {
    const id = Number(req.params.id);
    const rows = addSerial(id, req.body || {});
    res.status(201).json(rows);
  } catch (e) {
    res.status(400).json({ error: e.message || String(e) });
  }
});

app.get("/api/products/:id/lots", (req, res) => {
  const id = Number(req.params.id);
  res.json(listLots(id));
});

app.post("/api/products/:id/lots", (req, res) => {
  try {
    const id = Number(req.params.id);
    const rows = addLot(id, req.body || {});
    res.status(201).json(rows);
  } catch (e) {
    res.status(400).json({ error: e.message || String(e) });
  }
});

import {
  listProductVendors,
  upsertProductVendor,
  deleteProductVendor,
  listBom,
  upsertBomItem,
  deleteBomItem
} from "./db.js";

import { listStockLevelsByProduct } from "./db.js";

app.get("/api/products/:id/stock-levels", (req, res) => {
  const id = Number(req.params.id);
  res.json(listStockLevelsByProduct(id));
});
app.get("/api/products/:id/vendors", (req, res) => {
  const id = Number(req.params.id);
  res.json(listProductVendors(id));
});

app.post("/api/products/:id/vendors", (req, res) => {
  try {
    const id = Number(req.params.id);
    const v = upsertProductVendor(id, req.body || {});
    res.status(201).json(v);
  } catch (e) {
    res.status(400).json({ error: e.message || String(e) });
  }
});

app.delete("/api/vendors/:vendorId", (req, res) => {
  try {
    const vid = Number(req.params.vendorId);
    const result = deleteProductVendor(vid);
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: e.message || String(e) });
  }
});

app.get("/api/products/:id/bom", (req, res) => {
  const id = Number(req.params.id);
  res.json(listBom(id));
});

app.post("/api/products/:id/bom", (req, res) => {
  try {
    const id = Number(req.params.id);
    const rows = upsertBomItem(id, req.body || {});
    res.status(201).json(rows);
  } catch (e) {
    res.status(400).json({ error: e.message || String(e) });
  }
});

app.delete("/api/bom/:itemId", (req, res) => {
  try {
    const iid = Number(req.params.itemId);
    const result = deleteBomItem(iid);
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: e.message || String(e) });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
