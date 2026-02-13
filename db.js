import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import initSqlJs from "sql.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SQL = await initSqlJs({
  locateFile: (file) => path.join(__dirname, "node_modules/sql.js/dist", file)
});

const dbFile = path.join(__dirname, "data.sqlite");
let db;
if (fs.existsSync(dbFile)) {
  const buf = fs.readFileSync(dbFile);
  db = new SQL.Database(buf);
  try {
    db.run(`CREATE TABLE IF NOT EXISTS product_vendors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      vendor_name TEXT NOT NULL,
      vendor_price REAL,
      vendor_product_code TEXT
    );`);
    db.run(`CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      balance REAL DEFAULT 0,
      contact TEXT,
      phone TEXT,
      fax TEXT,
      email TEXT,
      website TEXT,
      currency TEXT DEFAULT 'Philippine Peso (Php)',
      discount REAL DEFAULT 0,
      payment_terms TEXT,
      taxing_scheme TEXT,
      tax_exempt_no TEXT,
      business_address TEXT,
      created_at TEXT,
      updated_at TEXT
    );`);
    db.run(`CREATE TABLE IF NOT EXISTS vendors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      contact TEXT,
      phone TEXT,
      fax TEXT,
      email TEXT,
      website TEXT,
      payment_terms TEXT,
      taxing_scheme TEXT,
      carrier TEXT,
      currency TEXT DEFAULT 'Philippine Peso (Php)',
      business_address TEXT,
      balance REAL DEFAULT 0,
      created_at TEXT,
      updated_at TEXT
    );`);
    db.run(`CREATE TABLE IF NOT EXISTS bom_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      component_item TEXT,
      description TEXT,
      qty REAL,
      cost REAL
    );`);
    db.run(`ALTER TABLE stock_levels ADD COLUMN sublocation TEXT DEFAULT ''`);
  } catch {}
  try {
    db.run(`ALTER TABLE stock_movements ADD COLUMN sublocation TEXT DEFAULT ''`);
    db.run(`ALTER TABLE stock_movements ADD COLUMN remarks TEXT`);
    db.run(`ALTER TABLE stock_movements ADD COLUMN before_qty INTEGER`);
    db.run(`ALTER TABLE stock_movements ADD COLUMN after_qty INTEGER`);
    db.run(`ALTER TABLE stock_movements ADD COLUMN user TEXT`);
  } catch {}
  try {
    db.run(`ALTER TABLE products ADD COLUMN tax_code TEXT`);
    db.run(`ALTER TABLE products ADD COLUMN costing_method TEXT`);
    db.run(`ALTER TABLE products ADD COLUMN standard_uom TEXT`);
    db.run(`ALTER TABLE products ADD COLUMN sales_uom TEXT`);
    db.run(`ALTER TABLE products ADD COLUMN purchasing_uom TEXT`);
    db.run(`ALTER TABLE products ADD COLUMN default_location TEXT DEFAULT 'Main'`);
    db.run(`ALTER TABLE products ADD COLUMN default_sublocation TEXT DEFAULT ''`);
    db.run(`ALTER TABLE products ADD COLUMN reorder_point INTEGER DEFAULT 0`);
    db.run(`ALTER TABLE products ADD COLUMN reorder_quantity INTEGER DEFAULT 0`);
    db.run(`ALTER TABLE products ADD COLUMN last_vendor TEXT`);
    db.run(`ALTER TABLE products ADD COLUMN description TEXT`);
    db.run(`ALTER TABLE products ADD COLUMN item_type TEXT DEFAULT 'Stock'`);
    db.run(`ALTER TABLE products ADD COLUMN notes TEXT`);
    db.run(`ALTER TABLE products ADD COLUMN serialized INTEGER DEFAULT 0`);
  } catch {}
  try { db.run(`ALTER TABLE products ADD COLUMN tracking_method TEXT DEFAULT 'none'`); } catch {}
  try {
    db.run(`
      CREATE TABLE IF NOT EXISTS serial_numbers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        serial TEXT NOT NULL,
        location TEXT NOT NULL DEFAULT 'Main',
        sublocation TEXT DEFAULT '',
        status TEXT NOT NULL DEFAULT 'in_stock',
        received_at TEXT,
        sold_at TEXT,
        notes TEXT,
        UNIQUE(product_id, serial)
      );
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS stock_movements_serials (
        movement_id INTEGER NOT NULL,
        serial_id INTEGER NOT NULL,
        PRIMARY KEY (movement_id, serial_id)
      );
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS product_lots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        batch_code TEXT DEFAULT '',
        batch_date TEXT,
        expiration_date TEXT,
        location TEXT NOT NULL DEFAULT 'Main',
        sublocation TEXT DEFAULT '',
        status TEXT NOT NULL DEFAULT 'in_stock',
        received_at TEXT,
        sold_out_at TEXT,
        notes TEXT,
        UNIQUE(product_id, batch_code, batch_date, expiration_date)
      );
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS stock_movements_lots (
        movement_id INTEGER NOT NULL,
        lot_id INTEGER NOT NULL,
        PRIMARY KEY (movement_id, lot_id)
      );
    `);
  } catch {}
  try { db.run(`ALTER TABLE products RENAME COLUMN upc TO barcode`); } catch {}
  try { db.run(`ALTER TABLE product_variants RENAME COLUMN upc TO barcode`); } catch {}
  try {
    db.run(`
      CREATE TABLE IF NOT EXISTS sales_orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_number TEXT UNIQUE,
        customer TEXT,
        status TEXT DEFAULT 'open',
        total_amount REAL DEFAULT 0,
        created_at TEXT
      );
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS sales_order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        qty INTEGER NOT NULL,
        unit_price REAL DEFAULT 0,
        line_total REAL DEFAULT 0
      );
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        ref TEXT,
        amount REAL NOT NULL,
        status TEXT DEFAULT 'due',
        created_at TEXT
      );
    CREATE TABLE IF NOT EXISTS purchase_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      po_number TEXT UNIQUE,
      vendor TEXT,
      status TEXT DEFAULT 'open',
      date TEXT,
      ship_to_address TEXT,
      sub_total REAL DEFAULT 0,
      freight REAL DEFAULT 0,
      total REAL DEFAULT 0,
      paid REAL DEFAULT 0,
      created_at TEXT
    );
    CREATE TABLE IF NOT EXISTS purchase_order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER,
      item TEXT,
      description TEXT,
      vendor_product_code TEXT,
      qty INTEGER NOT NULL,
      unit_price REAL DEFAULT 0,
      discount REAL DEFAULT 0,
      line_total REAL DEFAULT 0
    );
    `);
  } catch {}
} else {
  db = new SQL.Database();
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sku TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category TEXT,
      barcode TEXT,
      internal_code TEXT,
      unit_cost REAL DEFAULT 0,
      unit_price REAL DEFAULT 0,
      msrp REAL,
      length REAL,
      width REAL,
      height REAL,
      weight REAL,
      vendor_name TEXT,
      vendor_sku TEXT,
      vendor_lead_time_days INTEGER,
      vendor_moq INTEGER,
      image_url TEXT,
      description TEXT,
      item_type TEXT DEFAULT 'Stock',
      notes TEXT,
      serialized INTEGER DEFAULT 0,
      tracking_method TEXT DEFAULT 'none',
      tax_code TEXT,
      costing_method TEXT,
      standard_uom TEXT,
      sales_uom TEXT,
      purchasing_uom TEXT,
      default_location TEXT DEFAULT 'Main',
      default_sublocation TEXT DEFAULT '',
      reorder_point INTEGER DEFAULT 0,
      reorder_quantity INTEGER DEFAULT 0,
      last_vendor TEXT,
      reorder_level INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1,
      created_at TEXT,
      updated_at TEXT
    );
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    );
    CREATE TABLE IF NOT EXISTS product_categories (
      product_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      PRIMARY KEY (product_id, category_id)
    );
    CREATE TABLE IF NOT EXISTS product_variants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      sku TEXT UNIQUE,
      barcode TEXT,
      attributes TEXT,
      unit_price REAL,
      active INTEGER DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS stock_levels (
      product_id INTEGER NOT NULL,
      location TEXT NOT NULL DEFAULT 'Main',
      sublocation TEXT DEFAULT '',
      qty INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (product_id, location, sublocation)
    );
    CREATE TABLE IF NOT EXISTS stock_movements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      delta INTEGER NOT NULL,
      location TEXT NOT NULL DEFAULT 'Main',
      sublocation TEXT DEFAULT '',
      reason TEXT,
      reference TEXT,
      remarks TEXT,
      before_qty INTEGER,
      after_qty INTEGER,
      user TEXT,
      created_at TEXT
    );
    CREATE TABLE IF NOT EXISTS serial_numbers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      serial TEXT NOT NULL,
      location TEXT NOT NULL DEFAULT 'Main',
      sublocation TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'in_stock',
      received_at TEXT,
      sold_at TEXT,
      notes TEXT,
      UNIQUE(product_id, serial)
    );
    CREATE TABLE IF NOT EXISTS stock_movements_serials (
      movement_id INTEGER NOT NULL,
      serial_id INTEGER NOT NULL,
      PRIMARY KEY (movement_id, serial_id)
    );
    CREATE TABLE IF NOT EXISTS product_lots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      batch_code TEXT DEFAULT '',
      batch_date TEXT,
      expiration_date TEXT,
      location TEXT NOT NULL DEFAULT 'Main',
      sublocation TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'in_stock',
      received_at TEXT,
      sold_out_at TEXT,
      notes TEXT,
      UNIQUE(product_id, batch_code, batch_date, expiration_date)
    );
    CREATE TABLE IF NOT EXISTS stock_movements_lots (
      movement_id INTEGER NOT NULL,
      lot_id INTEGER NOT NULL,
      PRIMARY KEY (movement_id, lot_id)
    );
    CREATE TABLE IF NOT EXISTS product_vendors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      vendor_name TEXT NOT NULL,
      vendor_price REAL,
      vendor_product_code TEXT
    );
    CREATE TABLE IF NOT EXISTS bom_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      component_item TEXT,
      description TEXT,
      qty REAL,
      cost REAL
    );
    CREATE TABLE IF NOT EXISTS sales_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE,
      customer TEXT,
      status TEXT DEFAULT 'open',
      total_amount REAL DEFAULT 0,
      created_at TEXT
    );
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      balance REAL DEFAULT 0,
      contact TEXT,
      phone TEXT,
      fax TEXT,
      email TEXT,
      website TEXT,
      currency TEXT DEFAULT 'Philippine Peso (Php)',
      discount REAL DEFAULT 0,
      payment_terms TEXT,
      taxing_scheme TEXT,
      tax_exempt_no TEXT,
      business_address TEXT,
      created_at TEXT,
      updated_at TEXT
    );
    CREATE TABLE IF NOT EXISTS sales_order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      qty INTEGER NOT NULL,
      unit_price REAL DEFAULT 0,
      line_total REAL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      ref TEXT,
      amount REAL NOT NULL,
      status TEXT DEFAULT 'due',
      created_at TEXT
    );
    CREATE TABLE IF NOT EXISTS purchase_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      po_number TEXT UNIQUE,
      vendor TEXT,
      status TEXT DEFAULT 'open',
      date TEXT,
      ship_to_address TEXT,
      sub_total REAL DEFAULT 0,
      freight REAL DEFAULT 0,
      total REAL DEFAULT 0,
      paid REAL DEFAULT 0,
      created_at TEXT
    );
    CREATE TABLE IF NOT EXISTS purchase_order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER,
      item TEXT,
      description TEXT,
      vendor_product_code TEXT,
      qty INTEGER NOT NULL,
      unit_price REAL DEFAULT 0,
      discount REAL DEFAULT 0,
      line_total REAL DEFAULT 0
    );
  `);
  persist();
}

function persist() {
  const data = db.export();
  fs.writeFileSync(dbFile, Buffer.from(data));
}

function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

function run(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  stmt.step();
  stmt.free();
  persist();
}

export function listProducts() {
  return queryAll(`
    SELECT p.*,
           IFNULL(s.qty, 0) AS qty,
           IFNULL(gc.categories_text, '') AS categories_text
    FROM products p
    LEFT JOIN stock_levels s ON s.product_id = p.id AND s.location = 'Main' AND IFNULL(s.sublocation,'') = ''
    LEFT JOIN (
      SELECT pc.product_id AS pid, GROUP_CONCAT(c.name, ', ') AS categories_text
      FROM product_categories pc
      JOIN categories c ON c.id = pc.category_id
      GROUP BY pc.product_id
    ) AS gc ON gc.pid = p.id
    ORDER BY p.name ASC
  `);
}

export function createProduct(payload) {
  const now = new Date().toISOString();
  const product = {
    sku: String(payload.sku || "").trim(),
    name: String(payload.name || "").trim(),
    category: payload.category || "",
    barcode: payload.barcode || "",
    internal_code: payload.internal_code || "",
    unit_cost: Number(payload.unit_cost || 0),
    unit_price: Number(payload.unit_price || 0),
    msrp: Number(payload.msrp || 0),
    length: Number(payload.length || 0),
    width: Number(payload.width || 0),
    height: Number(payload.height || 0),
    weight: Number(payload.weight || 0),
    vendor_name: payload.vendor_name || "",
    vendor_sku: payload.vendor_sku || "",
    vendor_lead_time_days: Number(payload.vendor_lead_time_days || 0),
    vendor_moq: Number(payload.vendor_moq || 0),
    image_url: payload.image_url || "",
    description: payload.description || "",
    item_type: payload.item_type || "Stock",
    notes: payload.notes || "",
    serialized: payload.serialized ? 1 : 0,
    tracking_method: String(payload.tracking_method || (payload.serialized ? "serial" : "none")),
    tax_code: payload.tax_code || "",
    costing_method: payload.costing_method || "",
    standard_uom: payload.standard_uom || "",
    sales_uom: payload.sales_uom || "",
    purchasing_uom: payload.purchasing_uom || "",
    default_location: payload.default_location || "Main",
    default_sublocation: payload.default_sublocation || "",
    reorder_point: Number(payload.reorder_point || 0),
    reorder_quantity: Number(payload.reorder_quantity || 0),
    last_vendor: payload.last_vendor || "",
    reorder_level: Number(payload.reorder_level || 0),
    active: payload.active === 0 ? 0 : 1,
    created_at: now,
    updated_at: now
  };
  run(
    `INSERT INTO products (sku, name, category, barcode, internal_code, unit_cost, unit_price, msrp, length, width, height, weight, vendor_name, vendor_sku, vendor_lead_time_days, vendor_moq, image_url, description, item_type, notes, serialized, tracking_method, tax_code, costing_method, standard_uom, sales_uom, purchasing_uom, default_location, default_sublocation, reorder_point, reorder_quantity, last_vendor, reorder_level, active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      product.sku,
      product.name,
      product.category,
      product.barcode,
      product.internal_code,
      product.unit_cost,
      product.unit_price,
      product.msrp,
      product.length,
      product.width,
      product.height,
      product.weight,
      product.vendor_name,
      product.vendor_sku,
      product.vendor_lead_time_days,
      product.vendor_moq,
      product.image_url,
      product.description,
      product.item_type,
      product.notes,
      product.serialized,
      product.tracking_method,
      product.tax_code,
      product.costing_method,
      product.standard_uom,
      product.sales_uom,
      product.purchasing_uom,
      product.default_location,
      product.default_sublocation,
      product.reorder_point,
      product.reorder_quantity,
      product.last_vendor,
      product.reorder_level,
      product.active,
      product.created_at,
      product.updated_at
    ]
  );
  const row = queryAll(`SELECT id FROM products WHERE sku = ?`, [product.sku])[0];
  if (Array.isArray(payload.categories)) {
    assignProductCategories(row.id, payload.categories);
  }
  run(`INSERT OR IGNORE INTO stock_levels (product_id, location, qty) VALUES (?, 'Main', 0)`, [row.id]);
  return queryAll(`SELECT * FROM products WHERE id = ?`, [row.id])[0];
}

export function updateProduct(id, payload) {
  const existing = queryAll(`SELECT * FROM products WHERE id = ?`, [id])[0];
  if (!existing) throw new Error("Product not found");
  const now = new Date().toISOString();
  const product = {
    sku: String(payload.sku ?? existing.sku).trim(),
    name: String(payload.name ?? existing.name).trim(),
    category: payload.category ?? existing.category,
    barcode: payload.barcode ?? existing.barcode,
    internal_code: payload.internal_code ?? existing.internal_code,
    unit_cost: Number(payload.unit_cost ?? existing.unit_cost),
    unit_price: Number(payload.unit_price ?? existing.unit_price),
    msrp: Number(payload.msrp ?? existing.msrp ?? 0),
    length: Number(payload.length ?? existing.length ?? 0),
    width: Number(payload.width ?? existing.width ?? 0),
    height: Number(payload.height ?? existing.height ?? 0),
    weight: Number(payload.weight ?? existing.weight ?? 0),
    vendor_name: payload.vendor_name ?? existing.vendor_name,
    vendor_sku: payload.vendor_sku ?? existing.vendor_sku,
    vendor_lead_time_days: Number(payload.vendor_lead_time_days ?? existing.vendor_lead_time_days ?? 0),
    vendor_moq: Number(payload.vendor_moq ?? existing.vendor_moq ?? 0),
    image_url: payload.image_url ?? existing.image_url,
    description: payload.description ?? existing.description,
    item_type: payload.item_type ?? existing.item_type,
    notes: payload.notes ?? existing.notes,
    serialized: payload.serialized ?? existing.serialized,
    tracking_method: String(payload.tracking_method ?? existing.tracking_method ?? "none"),
    tax_code: payload.tax_code ?? existing.tax_code,
    costing_method: payload.costing_method ?? existing.costing_method,
    standard_uom: payload.standard_uom ?? existing.standard_uom,
    sales_uom: payload.sales_uom ?? existing.sales_uom,
    purchasing_uom: payload.purchasing_uom ?? existing.purchasing_uom,
    default_location: payload.default_location ?? existing.default_location,
    default_sublocation: payload.default_sublocation ?? existing.default_sublocation,
    reorder_point: Number(payload.reorder_point ?? existing.reorder_point ?? 0),
    reorder_quantity: Number(payload.reorder_quantity ?? existing.reorder_quantity ?? 0),
    last_vendor: payload.last_vendor ?? existing.last_vendor,
    reorder_level: Number(payload.reorder_level ?? existing.reorder_level),
    active: payload.active ?? existing.active,
    updated_at: now
  };
  run(
    `UPDATE products
     SET sku = ?, name = ?, category = ?, barcode = ?, internal_code = ?, unit_cost = ?, unit_price = ?, msrp = ?, length = ?, width = ?, height = ?, weight = ?, vendor_name = ?, vendor_sku = ?, vendor_lead_time_days = ?, vendor_moq = ?, image_url = ?, description = ?, item_type = ?, notes = ?, serialized = ?, tracking_method = ?, tax_code = ?, costing_method = ?, standard_uom = ?, sales_uom = ?, purchasing_uom = ?, default_location = ?, default_sublocation = ?, reorder_point = ?, reorder_quantity = ?, last_vendor = ?, reorder_level = ?, active = ?, updated_at = ?
     WHERE id = ?`,
    [
      product.sku,
      product.name,
      product.category,
      product.barcode,
      product.internal_code,
      product.unit_cost,
      product.unit_price,
      product.msrp,
      product.length,
      product.width,
      product.height,
      product.weight,
      product.vendor_name,
      product.vendor_sku,
      product.vendor_lead_time_days,
      product.vendor_moq,
      product.image_url,
      product.description,
      product.item_type,
      product.notes,
      product.serialized,
      product.tracking_method,
      product.tax_code,
      product.costing_method,
      product.standard_uom,
      product.sales_uom,
      product.purchasing_uom,
      product.default_location,
      product.default_sublocation,
      product.reorder_point,
      product.reorder_quantity,
      product.last_vendor,
      product.reorder_level,
      product.active,
      product.updated_at,
      id
    ]
  );
  if (Array.isArray(payload.categories)) {
    assignProductCategories(id, payload.categories);
  }
  return queryAll(`SELECT * FROM products WHERE id = ?`, [id])[0];
}

export function getProduct(id) {
  return queryAll(`SELECT * FROM products WHERE id = ?`, [id])[0];
}

export function listStockLevelsByProduct(product_id) {
  return queryAll(`SELECT location, sublocation, qty FROM stock_levels WHERE product_id = ? ORDER BY location ASC, sublocation ASC`, [product_id]);
}

export function deleteProduct(id) {
  run(`DELETE FROM products WHERE id = ?`, [id]);
  run(`DELETE FROM stock_levels WHERE product_id = ?`, [id]);
  run(`DELETE FROM stock_movements WHERE product_id = ?`, [id]);
  return { ok: true };
}

export function getStockLevel(product_id, location = "Main", sublocation = "") {
  const row = queryAll(
    `SELECT qty FROM stock_levels WHERE product_id = ? AND location = ? AND sublocation = ?`,
    [product_id, location, sublocation]
  )[0];
  return { qty: row ? row.qty : 0, location, sublocation };
}

export function adjustStock({ product_id, delta, location = "Main", sublocation = "", reason = "", remarks = "", reference = "", serials = [], lot = null }) {
  const current = getStockLevel(product_id, location, sublocation).qty;
  const next = current + Number(delta);
  if (!Number.isFinite(next)) throw new Error("Invalid delta");
  const prod = getProduct(product_id);
  const method = String(prod?.tracking_method || (Number(prod?.serialized || 0) === 1 ? "serial" : "none"));
  const serializedFlag = method === "serial";
  const count = Array.isArray(serials) ? serials.filter(Boolean).length : 0;
  if (serializedFlag && Math.abs(Number(delta)) !== count) throw new Error("Serialized item requires serials equal to delta");
  run(
    `INSERT INTO stock_movements (product_id, delta, location, sublocation, reason, remarks, reference, before_qty, after_qty, user, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [product_id, Number(delta), location, sublocation, reason, remarks, reference, current, next, "system", new Date().toISOString()]
  );
  const movement = queryAll(`SELECT * FROM stock_movements ORDER BY id DESC LIMIT 1`, [])[0];
  if (serializedFlag && count) {
    if (Number(delta) > 0) {
      serials.forEach(s => run(
        `INSERT OR IGNORE INTO serial_numbers (product_id, serial, location, sublocation, status, received_at)
         VALUES (?, ?, ?, ?, 'in_stock', ?)`,
        [product_id, String(s), location, sublocation, new Date().toISOString()]
      ));
    } else {
      serials.forEach(s => {
        const row = queryAll(`SELECT id FROM serial_numbers WHERE product_id = ? AND serial = ?`, [product_id, String(s)])[0];
        if (!row) throw new Error("Serial not found");
        run(
          `UPDATE serial_numbers SET status = 'removed', sold_at = ? WHERE id = ?`,
          [new Date().toISOString(), row.id]
        );
        run(
          `INSERT OR IGNORE INTO stock_movements_serials (movement_id, serial_id) VALUES (?, ?)`,
          [movement.id, row.id]
        );
      });
    }
  } else if (method === "batch" && lot && (lot.batch_date || lot.expiration_date || lot.batch_code)) {
    run(
      `INSERT OR IGNORE INTO product_lots (product_id, batch_code, batch_date, expiration_date, location, sublocation, status, received_at)
       VALUES (?, ?, ?, ?, ?, ?, 'in_stock', ?)`,
      [product_id, String(lot.batch_code || ""), String(lot.batch_date || ""), String(lot.expiration_date || ""), location, sublocation, new Date().toISOString()]
    );
    const lotRow = queryAll(
      `SELECT id FROM product_lots WHERE product_id = ? AND batch_code = ? AND IFNULL(batch_date,'') = ? AND IFNULL(expiration_date,'') = ?`,
      [product_id, String(lot.batch_code || ""), String(lot.batch_date || ""), String(lot.expiration_date || "")]
    )[0];
    if (lotRow) {
      if (Number(delta) < 0) {
        run(`UPDATE product_lots SET status = 'removed', sold_out_at = ? WHERE id = ?`, [new Date().toISOString(), lotRow.id]);
      }
      run(`INSERT OR IGNORE INTO stock_movements_lots (movement_id, lot_id) VALUES (?, ?)`, [movement.id, lotRow.id]);
    }
  }
  run(
    `INSERT INTO stock_levels (product_id, location, sublocation, qty) VALUES (?, ?, ?, ?)
     ON CONFLICT(product_id, location, sublocation) DO UPDATE SET qty = excluded.qty`,
    [product_id, location, sublocation, next]
  );
  return { product_id, location, sublocation, qty: next };
}

export function listMovements(filter = {}) {
  const product_id = filter.product_id ?? null;
  if (product_id === null) {
    return queryAll(`SELECT * FROM stock_movements ORDER BY created_at DESC LIMIT 200`, []);
  }
  return queryAll(
    `SELECT * FROM stock_movements WHERE product_id = ? ORDER BY created_at DESC LIMIT 200`,
    [product_id]
  );
}

export function listProductVendors(product_id) {
  return queryAll(`SELECT * FROM product_vendors WHERE product_id = ? ORDER BY vendor_name ASC`, [product_id]);
}

export function listAllVendors() {
  return queryAll(
    `SELECT vendor_name AS name, COUNT(*) AS product_count
     FROM product_vendors
     WHERE LENGTH(IFNULL(vendor_name,'')) > 0
     GROUP BY vendor_name
     ORDER BY vendor_name ASC`,
    []
  );
}

export function upsertProductVendor(product_id, payload = {}) {
  run(
    `INSERT INTO product_vendors (product_id, vendor_name, vendor_price, vendor_product_code)
     VALUES (?, ?, ?, ?)`,
    [product_id, String(payload.vendor_name || ""), Number(payload.vendor_price || 0), String(payload.vendor_product_code || "")]
  );
  return listProductVendors(product_id);
}

export function deleteProductVendor(id) {
  run(`DELETE FROM product_vendors WHERE id = ?`, [id]);
  return { ok: true };
}

export function listBom(product_id) {
  return queryAll(`SELECT * FROM bom_items WHERE product_id = ? ORDER BY id ASC`, [product_id]);
}

export function upsertBomItem(product_id, payload = {}) {
  run(
    `INSERT INTO bom_items (product_id, component_item, description, qty, cost)
     VALUES (?, ?, ?, ?, ?)`,
    [product_id, String(payload.component_item || ""), String(payload.description || ""), Number(payload.qty || 0), Number(payload.cost || 0)]
  );
  return listBom(product_id);
}

export function deleteBomItem(id) {
  run(`DELETE FROM bom_items WHERE id = ?`, [id]);
  return { ok: true };
}

export function listCategories() {
  return queryAll(
    `SELECT c.id, c.name, COUNT(pc.product_id) AS count
     FROM categories c
     LEFT JOIN product_categories pc ON pc.category_id = c.id
     GROUP BY c.id, c.name
     ORDER BY c.name ASC`,
    []
  );
}

export function createCategory(name) {
  run(`INSERT OR IGNORE INTO categories (name) VALUES (?)`, [String(name || "").trim()]);
  return queryAll(`SELECT * FROM categories WHERE name = ?`, [String(name || "").trim()])[0];
}

export function assignProductCategories(product_id, categoryNames = []) {
  const names = categoryNames.map(n => String(n || "").trim()).filter(n => n.length);
  names.forEach(n => createCategory(n));
  const ids = names.map(n => queryAll(`SELECT id FROM categories WHERE name = ?`, [n])[0]?.id).filter(Boolean);
  run(`DELETE FROM product_categories WHERE product_id = ?`, [product_id]);
  ids.forEach(cid => run(`INSERT OR IGNORE INTO product_categories (product_id, category_id) VALUES (?, ?)`, [product_id, cid]));
  return { product_id, categories: names };
}

export function listVariants(product_id) {
  return queryAll(`SELECT * FROM product_variants WHERE product_id = ? ORDER BY id ASC`, [product_id]);
}

export function createVariant(product_id, payload = {}) {
  const v = {
    sku: payload.sku || "",
    barcode: payload.barcode || "",
    attributes: JSON.stringify(payload.attributes || {}),
    unit_price: Number(payload.unit_price || 0),
    active: payload.active === 0 ? 0 : 1
  };
  run(
    `INSERT INTO product_variants (product_id, sku, barcode, attributes, unit_price, active)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [product_id, v.sku, v.barcode, v.attributes, v.unit_price, v.active]
  );
  return queryAll(`SELECT * FROM product_variants WHERE product_id = ? AND sku = ?`, [product_id, v.sku])[0];
}

export function deleteVariant(id) {
  run(`DELETE FROM product_variants WHERE id = ?`, [id]);
  return { ok: true };
}

export function listSerials(product_id) {
  return queryAll(`SELECT * FROM serial_numbers WHERE product_id = ? ORDER BY status ASC, serial ASC`, [product_id]);
}

export function addSerial(product_id, payload = {}) {
  run(
    `INSERT OR IGNORE INTO serial_numbers (product_id, serial, location, sublocation, status, received_at, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      product_id,
      String(payload.serial || ""),
      String(payload.location || "Main"),
      String(payload.sublocation || ""),
      String(payload.status || "in_stock"),
      payload.status === "in_stock" ? new Date().toISOString() : null,
      String(payload.notes || "")
    ]
  );
  return listSerials(product_id);
}
export function listLots(product_id) {
  return queryAll(`SELECT * FROM product_lots WHERE product_id = ? ORDER BY status ASC, batch_date ASC`, [product_id]);
}
export function addLot(product_id, payload = {}) {
  run(
    `INSERT OR IGNORE INTO product_lots (product_id, batch_code, batch_date, expiration_date, location, sublocation, status, received_at, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      product_id,
      String(payload.batch_code || ""),
      String(payload.batch_date || ""),
      String(payload.expiration_date || ""),
      String(payload.location || "Main"),
      String(payload.sublocation || ""),
      String(payload.status || "in_stock"),
      payload.status === "in_stock" ? new Date().toISOString() : null,
      String(payload.notes || "")
    ]
  );
  return listLots(product_id);
}

export function createSalesOrder(payload = {}) {
  const now = new Date().toISOString();
  const order_number = String(payload.order_number || `SO-${Date.now()}`);
  const customer = String(payload.customer || "Customer");
  const status = String(payload.status || "completed");
  run(
    `INSERT INTO sales_orders (order_number, customer, status, total_amount, created_at)
     VALUES (?, ?, ?, 0, ?)`,
    [order_number, customer, status, now]
  );
  const order = queryAll(`SELECT * FROM sales_orders WHERE order_number = ?`, [order_number])[0];
  const items = Array.isArray(payload.items) ? payload.items : [];
  let total = 0;
  items.forEach(it => {
    const qty = Number(it.qty || 0);
    const unit_price = Number(it.unit_price || 0);
    const line_total = qty * unit_price;
    total += line_total;
    run(
      `INSERT INTO sales_order_items (order_id, product_id, qty, unit_price, line_total)
       VALUES (?, ?, ?, ?, ?)`,
      [order.id, Number(it.product_id || 0), qty, unit_price, line_total]
    );
  });
  run(`UPDATE sales_orders SET total_amount = ? WHERE id = ?`, [total, order.id]);
  return queryAll(`SELECT * FROM sales_orders WHERE id = ?`, [order.id])[0];
}

export function listSalesOrders() {
  return queryAll(`SELECT * FROM sales_orders ORDER BY created_at DESC`, []);
}

export function listSalesOrderItems() {
  return queryAll(`SELECT i.*, p.unit_cost, o.created_at AS order_created_at, o.status AS order_status
                   FROM sales_order_items i
                   JOIN products p ON p.id = i.product_id
                   JOIN sales_orders o ON o.id = i.order_id
                   ORDER BY i.id DESC`, []);
}

export function createPayment(payload = {}) {
  run(
    `INSERT INTO payments (type, ref, amount, status, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [String(payload.type || "customer"), String(payload.ref || ""), Number(payload.amount || 0), String(payload.status || "due"), new Date().toISOString()]
  );
  return queryAll(`SELECT * FROM payments ORDER BY id DESC LIMIT 1`, [])[0];
}

export function listPayments() {
  return queryAll(`SELECT * FROM payments ORDER BY created_at DESC`, []);
}

export function createPurchaseOrder(payload = {}) {
  const now = new Date().toISOString();
  const po_number = String(payload.po_number || `PO-${Date.now()}`);
  const vendor = String(payload.vendor || "");
  const status = String(payload.status || "open");
  const date = String(payload.date || new Date().toISOString());
  const ship_to_address = String(payload.ship_to_address || "");
  run(
    `INSERT INTO purchase_orders (po_number, vendor, status, date, ship_to_address, sub_total, freight, total, paid, created_at)
     VALUES (?, ?, ?, ?, ?, 0, 0, 0, 0, ?)`,
    [po_number, vendor, status, date, ship_to_address, now]
  );
  const order = queryAll(`SELECT * FROM purchase_orders WHERE po_number = ?`, [po_number])[0];
  const items = Array.isArray(payload.items) ? payload.items : [];
  let sub = 0;
  items.forEach(it => {
    const qty = Number(it.qty || 0);
    const unit_price = Number(it.unit_price || 0);
    const discount = Number(it.discount || 0);
    const line_total = Math.max(0, qty * unit_price - discount);
    sub += line_total;
    run(
      `INSERT INTO purchase_order_items (order_id, product_id, item, description, vendor_product_code, qty, unit_price, discount, line_total)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [order.id, Number(it.product_id || 0) || null, String(it.item || ""), String(it.description || ""), String(it.vendor_product_code || ""), qty, unit_price, discount, line_total]
    );
  });
  const freight = Number(payload.freight || 0);
  const total = sub + freight;
  run(`UPDATE purchase_orders SET sub_total = ?, freight = ?, total = ? WHERE id = ?`, [sub, freight, total, order.id]);
  return queryAll(`SELECT * FROM purchase_orders WHERE id = ?`, [order.id])[0];
}

export function listPurchaseOrders() {
  return queryAll(`SELECT * FROM purchase_orders ORDER BY created_at DESC`, []);
}

export function listPurchaseOrderItems(order_id) {
  return queryAll(`SELECT * FROM purchase_order_items WHERE order_id = ? ORDER BY id ASC`, [order_id]);
}

export function listVendors() {
  return queryAll(`SELECT * FROM vendors ORDER BY name ASC`, []);
}
export function getVendor(id) {
export function listCustomers() {
  return queryAll(`SELECT * FROM customers ORDER BY name ASC`, []);
}

export function getCustomer(id) {
  return queryAll(`SELECT * FROM customers WHERE id = ?`, [id])[0];
}

export function createCustomer(payload = {}) {
  const now = new Date().toISOString();
  const row = {
    name: String(payload.name || "").trim(),
    balance: Number(payload.balance || 0),
    contact: String(payload.contact || ""),
    phone: String(payload.phone || ""),
    fax: String(payload.fax || ""),
    email: String(payload.email || ""),
    website: String(payload.website || ""),
    currency: String(payload.currency || "Philippine Peso (Php)"),
    discount: Number(payload.discount || 0),
    payment_terms: String(payload.payment_terms || ""),
    taxing_scheme: String(payload.taxing_scheme || ""),
    tax_exempt_no: String(payload.tax_exempt_no || ""),
    business_address: String(payload.business_address || ""),
    created_at: now,
    updated_at: now
  };
  run(
    `INSERT INTO customers (name, balance, contact, phone, fax, email, website, currency, discount, payment_terms, taxing_scheme, tax_exempt_no, business_address, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      row.name, row.balance, row.contact, row.phone, row.fax, row.email, row.website, row.currency,
      row.discount, row.payment_terms, row.taxing_scheme, row.tax_exempt_no, row.business_address,
      row.created_at, row.updated_at
    ]
  );
  return queryAll(`SELECT * FROM customers WHERE name = ?`, [row.name])[0];
}

export function updateCustomer(id, payload = {}) {
  const existing = queryAll(`SELECT * FROM customers WHERE id = ?`, [id])[0];
  if (!existing) throw new Error("Customer not found");
  const now = new Date().toISOString();
  const row = {
    name: String(payload.name ?? existing.name).trim(),
    balance: Number(payload.balance ?? existing.balance || 0),
    contact: String(payload.contact ?? existing.contact || ""),
    phone: String(payload.phone ?? existing.phone || ""),
    fax: String(payload.fax ?? existing.fax || ""),
    email: String(payload.email ?? existing.email || ""),
    website: String(payload.website ?? existing.website || ""),
    currency: String(payload.currency ?? existing.currency || "Philippine Peso (Php)"),
    discount: Number(payload.discount ?? existing.discount || 0),
    payment_terms: String(payload.payment_terms ?? existing.payment_terms || ""),
    taxing_scheme: String(payload.taxing_scheme ?? existing.taxing_scheme || ""),
    tax_exempt_no: String(payload.tax_exempt_no ?? existing.tax_exempt_no || ""),
    business_address: String(payload.business_address ?? existing.business_address || ""),
    updated_at: now
  };
  run(
    `UPDATE customers
     SET name = ?, balance = ?, contact = ?, phone = ?, fax = ?, email = ?, website = ?, currency = ?, discount = ?, payment_terms = ?, taxing_scheme = ?, tax_exempt_no = ?, business_address = ?, updated_at = ?
     WHERE id = ?`,
    [
      row.name, row.balance, row.contact, row.phone, row.fax, row.email, row.website, row.currency,
      row.discount, row.payment_terms, row.taxing_scheme, row.tax_exempt_no, row.business_address,
      row.updated_at, id
    ]
  );
  return queryAll(`SELECT * FROM customers WHERE id = ?`, [id])[0];
}
export function getVendor(id) {
  return queryAll(`SELECT * FROM vendors WHERE id = ?`, [id])[0];
}
export function createVendor(payload = {}) {
  const now = new Date().toISOString();
  const v = {
    name: String(payload.name || "").trim(),
    contact: payload.contact || "",
    phone: payload.phone || "",
    fax: payload.fax || "",
    email: payload.email || "",
    website: payload.website || "",
    payment_terms: payload.payment_terms || "",
    taxing_scheme: payload.taxing_scheme || "",
    carrier: payload.carrier || "",
    currency: payload.currency || "Philippine Peso (Php)",
    business_address: payload.business_address || "",
    balance: Number(payload.balance || 0),
    created_at: now,
    updated_at: now
  };
  run(
    `INSERT INTO vendors (name, contact, phone, fax, email, website, payment_terms, taxing_scheme, carrier, currency, business_address, balance, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [v.name, v.contact, v.phone, v.fax, v.email, v.website, v.payment_terms, v.taxing_scheme, v.carrier, v.currency, v.business_address, v.balance, v.created_at, v.updated_at]
  );
  return queryAll(`SELECT * FROM vendors WHERE name = ?`, [v.name])[0];
}
export function updateVendor(id, payload = {}) {
  const existing = getVendor(id);
  if (!existing) throw new Error("Vendor not found");
  const now = new Date().toISOString();
  const v = {
    name: String((payload.name !== undefined && payload.name !== null) ? payload.name : existing.name).trim(),
    contact: (payload.contact !== undefined && payload.contact !== null) ? payload.contact : existing.contact,
    phone: (payload.phone !== undefined && payload.phone !== null) ? payload.phone : existing.phone,
    fax: (payload.fax !== undefined && payload.fax !== null) ? payload.fax : existing.fax,
    email: (payload.email !== undefined && payload.email !== null) ? payload.email : existing.email,
    website: (payload.website !== undefined && payload.website !== null) ? payload.website : existing.website,
    payment_terms: (payload.payment_terms !== undefined && payload.payment_terms !== null) ? payload.payment_terms : existing.payment_terms,
    taxing_scheme: (payload.taxing_scheme !== undefined && payload.taxing_scheme !== null) ? payload.taxing_scheme : existing.taxing_scheme,
    carrier: (payload.carrier !== undefined && payload.carrier !== null) ? payload.carrier : existing.carrier,
    currency: (payload.currency !== undefined && payload.currency !== null) ? payload.currency : existing.currency,
    business_address: (payload.business_address !== undefined && payload.business_address !== null) ? payload.business_address : existing.business_address,
    balance: Number((payload.balance !== undefined && payload.balance !== null) ? payload.balance : (existing.balance || 0)),
    updated_at: now
  };
  run(
    `UPDATE vendors
     SET name = ?, contact = ?, phone = ?, fax = ?, email = ?, website = ?, payment_terms = ?, taxing_scheme = ?, carrier = ?, currency = ?, business_address = ?, balance = ?, updated_at = ?
     WHERE id = ?`,
    [v.name, v.contact, v.phone, v.fax, v.email, v.website, v.payment_terms, v.taxing_scheme, v.carrier, v.currency, v.business_address, v.balance, v.updated_at, id]
  );
  return getVendor(id);
}
