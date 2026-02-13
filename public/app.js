const api = {
  async products() {
    const r = await fetch("/api/products");
    return r.json();
  },
  async categories() {
    const r = await fetch("/api/categories");
    return r.json();
  },
  async addProduct(payload) {
    const r = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return r.json();
  },
  async getProduct(id) {
    const r = await fetch(`/api/products/${id}`);
    return r.json();
  },
  async updateProduct(id, payload) {
    const r = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return r.json();
  },
  async adjustStock(payload) {
    const r = await fetch("/api/stock-adjustments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return r.json();
  },
  async addVariant(product_id, payload) {
    const r = await fetch(`/api/products/${product_id}/variants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return r.json();
  },
  async productVendors(product_id) {
    const r = await fetch(`/api/products/${product_id}/vendors`);
    return r.json();
  },
  async addVendor(product_id, payload) {
    const r = await fetch(`/api/products/${product_id}/vendors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return r.json();
  },
  async bom(product_id) {
    const r = await fetch(`/api/products/${product_id}/bom`);
    return r.json();
  },
  async addBomItem(product_id, payload) {
    const r = await fetch(`/api/products/${product_id}/bom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return r.json();
  },
  async movements(product_id) {
    const url = product_id ? `/api/movements?product_id=${product_id}` : "/api/movements";
    const r = await fetch(url);
    return r.json();
  },
  async serials(product_id) {
    const r = await fetch(`/api/products/${product_id}/serials`);
    return r.json();
  },
  async addSerial(product_id, payload) {
    const r = await fetch(`/api/products/${product_id}/serials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return r.json();
  },
  async lots(product_id) {
    const r = await fetch(`/api/products/${product_id}/lots`);
    return r.json();
  },
  async addLot(product_id, payload) {
    const r = await fetch(`/api/products/${product_id}/lots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return r.json();
  }
};

function initTabs() {
  const tabs = document.querySelectorAll(".tab");
  const panels = document.querySelectorAll(".tab-panel");
  tabs.forEach(t => {
    t.addEventListener("click", () => {
      tabs.forEach(x => x.classList.remove("active"));
      panels.forEach(p => p.classList.remove("active"));
      t.classList.add("active");
      const id = t.dataset.tab;
      document.getElementById(id).classList.add("active");
    });
  });
}

function renderProducts(list) {
  const el = document.getElementById("products");
  const rows = list.map(p => `
    <tr>
      <td>${p.id}</td>
      <td>${p.sku}</td>
      <td>${p.name}</td>
      <td>${p.category || ""}</td>
      <td>${p.barcode || ""}</td>
      <td>${p.internal_code || ""}</td>
      <td>${p.unit_cost}</td>
      <td>${p.unit_price}</td>
      <td style="font-weight:${p.qty <= p.reorder_level ? '700' : '400'};color:${p.qty <= p.reorder_level ? '#b91c1c' : 'inherit'}">${p.qty}</td>
      <td>${p.reorder_level}</td>
    </tr>
  `).join("");
  el.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>ID</th><th>SKU</th><th>Name</th><th>Category</th><th>Barcode</th><th>Code</th>
          <th>Cost</th><th>Price</th><th>Qty</th><th>Reorder</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
  const totalOnHand = list.reduce((sum, p) => sum + Number(p.qty || 0), 0);
  const reserved = 0;
  const onOrder = 0;
  const available = totalOnHand - reserved;
  const elOnHand = document.getElementById("qtyOnHand");
  const elReserved = document.getElementById("qtyReserved");
  const elOnOrder = document.getElementById("qtyOnOrder");
  const elAvailable = document.getElementById("qtyAvailable");
  if (elOnHand) elOnHand.textContent = String(totalOnHand);
  if (elReserved) elReserved.textContent = String(reserved);
  if (elOnOrder) elOnOrder.textContent = String(onOrder);
  if (elAvailable) elAvailable.textContent = String(available);
}

function renderMovements(list) {
  const el = document.getElementById("movements");
  const rows = list.map(m => `
    <tr>
      <td>${m.id}</td>
      <td>${m.product_id}</td>
      <td>${m.delta}</td>
      <td>${m.location}</td>
      <td>${m.sublocation || ""}</td>
      <td>${m.reason || ""}</td>
      <td>${m.remarks || ""}</td>
      <td>${m.reference || ""}</td>
      <td>${m.before_qty ?? ""}</td>
      <td>${m.after_qty ?? ""}</td>
      <td>${m.user || ""}</td>
      <td>${m.created_at}</td>
    </tr>
  `).join("");
  el.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>ID</th><th>Product</th><th>Delta</th><th>Location</th><th>Sublocation</th>
          <th>Reason</th><th>Remarks</th><th>Reference</th><th>Qty Before</th><th>Qty After</th><th>User</th><th>At</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function renderCategories(list) {
  const el = document.getElementById("categoryList");
  if (!el) return;
  const items = list.map(c => `<span class="chip" data-cat="${c.name}"><span>${c.name}</span><span class="chip-count">${c.count ?? ""}</span></span>`).join(" ");
  el.innerHTML = items;
  el.querySelectorAll("[data-cat]").forEach(x => {
    x.addEventListener("click", async () => {
      const cat = x.dataset.cat;
      const products = await api.products();
      const filtered = products.filter(p => (p.categories_text || p.category || "").toLowerCase().includes(cat.toLowerCase()));
      renderProducts(filtered);
      renderItemList(filtered);
    });
  });
}

function renderItemList(list) {
  const el = document.getElementById("itemList");
  if (!el) return;
  const items = list.map(p => `<div data-id="${p.id}">${p.category || ""} — ${p.name}</div>`).join("");
  const counts = {};
  list.forEach(p => {
    const name = (p.category || "").split(",")[0].trim();
    if (!name) return;
    counts[name] = (counts[name] || 0) + 1;
  });
  el.innerHTML = items;
  el.querySelectorAll("[data-id]").forEach(d => {
    d.addEventListener("click", async () => {
      const pid = Number(d.dataset.id);
      const p = await api.getProduct(pid);
      const img = document.getElementById("productImage");
      if (img) img.src = p?.image_url || "";
      const vendors = await api.productVendors(pid);
      const bom = await api.bom(pid);
      renderVendorList(vendors);
      renderBomList(bom);
      renderStockLevels(pid);
      const serials = await api.serials(pid);
      renderSerialList(serials);
      const lots = await api.lots(pid);
      renderBatchList(lots);
    });
  });
}

function renderVendorList(rows) {
  const el = document.getElementById("vendorList");
  if (!el) return;
  const rowsHtml = rows.map(v => `
    <tr>
      <td>${v.vendor_name}</td>
      <td>${v.vendor_price ?? ""}</td>
      <td>${v.vendor_product_code || ""}</td>
    </tr>
  `).join("");
  el.innerHTML = `
    <table>
      <thead>
        <tr><th>Vendor</th><th>Vendor's Price</th><th>Vendor Product Code</th></tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>
  `;
}

function renderBomList(rows) {
  const el = document.getElementById("bomList");
  if (!el) return;
  const rowsHtml = rows.map(b => `
    <tr>
      <td>${b.component_item || ""}</td>
      <td>${b.description || ""}</td>
      <td>${b.qty ?? ""}</td>
      <td>${b.cost ?? ""}</td>
    </tr>
  `).join("");
  el.innerHTML = `
    <table>
      <thead>
        <tr><th>Component Item</th><th>Description</th><th>Quantity</th><th>Cost</th></tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>
  `;
}

async function renderStockLevels(product_id) {
  const el = document.getElementById("stockLevels");
  if (!el) return;
  const r = await fetch(`/api/products/${product_id}/stock-levels`);
  const rows = await r.json();
  const rowsHtml = rows.map(s => `
    <tr>
      <td>${s.location}</td>
      <td>${s.sublocation || ""}</td>
      <td>${s.qty}</td>
    </tr>
  `).join("");
  el.innerHTML = `
    <table>
      <thead><tr><th>Location</th><th>Sublocation</th><th>Qty</th></tr></thead>
      <tbody>${rowsHtml}</tbody>
    </table>
  `;
  const onHand = rows.reduce((sum, s) => sum + Number(s.qty || 0), 0);
  const reserved = 0;
  const onOrder = 0;
  const available = onHand - reserved;
  const elOnHand = document.getElementById("qtyOnHand");
  const elReserved = document.getElementById("qtyReserved");
  const elOnOrder = document.getElementById("qtyOnOrder");
  const elAvailable = document.getElementById("qtyAvailable");
  if (elOnHand) elOnHand.textContent = String(onHand);
  if (elReserved) elReserved.textContent = String(reserved);
  if (elOnOrder) elOnOrder.textContent = String(onOrder);
  if (elAvailable) elAvailable.textContent = String(available);
}

async function refresh() {
  const products = await api.products();
  renderProducts(products);
  const movements = await api.movements();
  renderMovements(movements);
  const cats = await api.categories();
  renderCategories(cats);
  renderItemList(products);
  renderDashboard({ products, movements, categories: cats });
}

document.getElementById("addProductForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target;
  const payload = {
    sku: f.sku.value,
    name: f.name.value,
    item_type: f.item_type.value,
    active: f.active.checked ? 1 : 0,
    tracking_method: f.tracking_method.value,
    categories: f.categories.value ? f.categories.value.split(",").map(s => s.trim()).filter(Boolean) : [],
    barcode: f.barcode.value,
    internal_code: f.internal_code.value,
    unit_cost: f.unit_cost.value,
    unit_price: f.unit_price.value,
    msrp: f.msrp.value,
    description: f.description.value,
    notes: f.notes.value,
    length: f.length.value,
    width: f.width.value,
    height: f.height.value,
    weight: f.weight.value,
    vendor_name: f.vendor_name.value,
    vendor_sku: f.vendor_sku.value,
    vendor_lead_time_days: f.vendor_lead_time_days.value,
    vendor_moq: f.vendor_moq.value,
    image_url: f.image_url.value,
    reorder_level: f.reorder_level.value
  };
  const res = await api.addProduct(payload);
  if (res?.id && payload.categories?.length) {
    try {
      await fetch(`/api/products/${res.id}/assign-categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ names: payload.categories })
      });
    } catch {}
  }
  f.reset();
  const img = document.getElementById("productImage");
  if (img) img.src = payload.image_url || "";
  await refresh();
});

document.getElementById("adjustStockForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target;
  const payload = {
    product_id: Number(f.product_id.value),
    delta: Number(f.delta.value),
    location: f.location.value,
    sublocation: f.sublocation.value,
    reason: f.reason.value,
    remarks: f.remarks.value,
    reference: f.reference.value,
    serials: f.serials.value ? f.serials.value.split(",").map(s => s.trim()).filter(Boolean) : []
    , lot: (f.batch_code.value || f.batch_date.value || f.expiration_date.value) ? {
      batch_code: f.batch_code.value,
      batch_date: f.batch_date.value,
      expiration_date: f.expiration_date.value
    } : null
  };
  const res = await api.adjustStock(payload);
  f.reset();
  await refresh();
});

document.getElementById("addVariantForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target;
  const product_id = Number(f.product_id.value);
  let attributes = {};
  try { attributes = f.attributes.value ? JSON.parse(f.attributes.value) : {}; } catch {}
  await api.addVariant(product_id, {
    sku: f.sku.value,
    barcode: f.barcode.value,
    attributes,
    unit_price: f.unit_price.value
  });
  f.reset();
  await refresh();
});

const vendorForm = document.getElementById("addVendorForm");
if (vendorForm) {
  vendorForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target;
    const product_id = Number(f.product_id.value);
    await api.addVendor(product_id, {
      vendor_name: f.vendor_name.value,
      vendor_price: f.vendor_price.value,
      vendor_product_code: f.vendor_product_code.value
    });
    f.reset();
    const rows = await api.productVendors(product_id);
    renderVendorList(rows);
  });
}

const bomForm = document.getElementById("addBomForm");
if (bomForm) {
  bomForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target;
    const product_id = Number(f.product_id.value);
    await api.addBomItem(product_id, {
      component_item: f.component_item.value,
      description: f.description.value,
      qty: f.qty.value,
      cost: f.cost.value
    });
    f.reset();
    const rows = await api.bom(product_id);
    renderBomList(rows);
  });
}

const searchForm = document.getElementById("searchForm");
if (searchForm) {
  searchForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target;
    const products = await api.products();
    const q = f.q.value.toLowerCase();
    const d = f.description.value.toLowerCase();
    const cat = f.category.value.toLowerCase();
    const filtered = products.filter(p => {
      const name = (p.name || "").toLowerCase();
      const sku = (p.sku || "").toLowerCase();
      const desc = (p.description || "").toLowerCase();
      const cats = (p.categories_text || p.category || "").toLowerCase();
      return (!q || name.includes(q) || sku.includes(q)) &&
             (!d || desc.includes(d)) &&
             (!cat || cats.includes(cat));
    });
    renderProducts(filtered);
    renderItemList(filtered);
  });
}

const storageInfoForm = document.getElementById("storageInfoForm");
if (storageInfoForm) {
  storageInfoForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target;
    const id = Number(f.product_id.value);
    await api.updateProduct(id, {
      default_location: f.default_location.value,
      default_sublocation: f.default_sublocation.value,
      reorder_point: f.reorder_point.value,
      reorder_quantity: f.reorder_quantity.value,
      last_vendor: f.last_vendor.value,
      standard_uom: f.standard_uom.value,
      sales_uom: f.sales_uom.value,
      purchasing_uom: f.purchasing_uom.value,
      length: f.length.value,
      width: f.width.value,
      height: f.height.value,
      weight: f.weight.value,
      tax_code: f.tax_code.value,
      costing_method: f.costing_method.value
    });
    f.reset();
    await refresh();
  });
}

function renderSerialList(rows) {
  const el = document.getElementById("serialList");
  if (!el) return;
  const rowsHtml = rows.map(s => `
    <tr>
      <td>${s.serial}</td>
      <td>${s.location}</td>
      <td>${s.sublocation || ""}</td>
      <td>${s.status}</td>
      <td>${s.received_at || ""}</td>
      <td>${s.sold_at || ""}</td>
    </tr>
  `).join("");
  el.innerHTML = `
    <table>
      <thead><tr><th>Serial</th><th>Location</th><th>Sublocation</th><th>Status</th><th>Received</th><th>Sold</th></tr></thead>
      <tbody>${rowsHtml}</tbody>
    </table>
  `;
}

function renderBatchList(rows) {
  const el = document.getElementById("batchList");
  if (!el) return;
  const rowsHtml = rows.map(b => `
    <tr>
      <td>${b.batch_code || ""}</td>
      <td>${b.batch_date || ""}</td>
      <td>${b.expiration_date || ""}</td>
      <td>${b.location}</td>
      <td>${b.sublocation || ""}</td>
      <td>${b.status}</td>
      <td>${b.received_at || ""}</td>
      <td>${b.sold_out_at || ""}</td>
    </tr>
  `).join("");
  el.innerHTML = `
    <table>
      <thead><tr><th>Batch Code</th><th>Batch Date</th><th>Expiration</th><th>Location</th><th>Sublocation</th><th>Status</th><th>Received</th><th>Sold Out</th></tr></thead>
      <tbody>${rowsHtml}</tbody>
    </table>
  `;
}

const serialForm = document.getElementById("addSerialForm");
if (serialForm) {
  serialForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target;
    const product_id = Number(f.product_id.value);
    await api.addSerial(product_id, {
      serial: f.serial.value,
      location: f.location.value,
      sublocation: f.sublocation.value,
      status: f.status.value
    });
    f.reset();
    const rows = await api.serials(product_id);
    renderSerialList(rows);
  });
}

const batchForm = document.getElementById("addBatchForm");
if (batchForm) {
  batchForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target;
    const product_id = Number(f.product_id.value);
    await api.addLot(product_id, {
      batch_code: f.batch_code.value,
      batch_date: f.batch_date.value,
      expiration_date: f.expiration_date.value,
      location: f.location.value,
      sublocation: f.sublocation.value,
      status: f.status.value
    });
    f.reset();
    const rows = await api.lots(product_id);
    renderBatchList(rows);
  });
}

initTabs();
refresh();

function renderDashboard({ products, movements, categories }) {
  const onHand = products.reduce((sum, p) => sum + Number(p.qty || 0), 0);
  const reserved = 0;
  const onOrder = 0;
  const available = onHand - reserved;
  const elOnHand = document.getElementById("dashOnHand");
  const elReserved = document.getElementById("dashReserved");
  const elOnOrder = document.getElementById("dashOnOrder");
  const elAvailable = document.getElementById("dashAvailable");
  if (elOnHand) elOnHand.textContent = String(onHand);
  if (elReserved) elReserved.textContent = String(reserved);
  if (elOnOrder) elOnOrder.textContent = String(onOrder);
  if (elAvailable) elAvailable.textContent = String(available);
  const catCounts = {};
  products.forEach(p => {
    const names = (p.categories_text || p.category || "").split(",").map(s => s.trim()).filter(Boolean);
    names.forEach(n => { catCounts[n] = (catCounts[n] || 0) + 1; });
  });
  const topCats = Object.entries(catCounts).sort((a,b)=>b[1]-a[1]).slice(0,6);
  const elTop = document.getElementById("dashTopCategories");
  if (elTop) {
    elTop.innerHTML = `
      <table>
        <thead><tr><th>Category</th><th>Items</th></tr></thead>
        <tbody>${topCats.map(([n,c])=>`<tr><td>${n}</td><td>${c}</td></tr>`).join("")}</tbody>
      </table>
    `;
  }
  const low = products.filter(p => Number(p.qty||0) <= Number(p.reorder_level||0)).sort((a,b)=>Number(a.qty||0)-Number(b.qty||0)).slice(0,8);
  const elLow = document.getElementById("dashLowStock");
  if (elLow) {
    elLow.innerHTML = `
      <table>
        <thead><tr><th>SKU</th><th>Name</th><th>Qty</th><th>Reorder</th></tr></thead>
        <tbody>${low.map(p=>`<tr><td>${p.sku}</td><td>${p.name}</td><td>${p.qty}</td><td>${p.reorder_level||""}</td></tr>`).join("")}</tbody>
      </table>
    `;
  }
  const recent = movements.slice(0,10);
  const elMov = document.getElementById("dashMovements");
  if (elMov) {
    elMov.innerHTML = `
      <table>
        <thead><tr><th>Product</th><th>Δ Qty</th><th>Location</th><th>At</th></tr></thead>
        <tbody>${recent.map(m=>`<tr><td>${m.product_id}</td><td>${m.delta}</td><td>${m.location}</td><td>${m.created_at}</td></tr>`).join("")}</tbody>
      </table>
    `;
  }
}

document.addEventListener("click", (e) => {
  const t = e.target;
  if (t.classList.contains("shortcut") && t.dataset.tabTarget) {
    const target = t.dataset.tabTarget;
    const tabs = document.querySelectorAll(".tab");
    const panels = document.querySelectorAll(".tab-panel");
    tabs.forEach(x => x.classList.remove("active"));
    panels.forEach(p => p.classList.remove("active"));
    const tabEl = Array.from(tabs).find(x => x.dataset.tab === target);
    if (tabEl) tabEl.classList.add("active");
    const panelEl = document.getElementById(target);
    if (panelEl) panelEl.classList.add("active");
  }
  if (t.classList.contains("shortcut") && t.dataset.action) {
    const action = t.dataset.action;
    if (action === "import") alert("Import coming soon");
    if (action === "export") alert("Export coming soon");
  }
  if (t.classList.contains("flow-link") && t.dataset.action) {
    const a = t.dataset.action;
    if (a === "new-order") alert("New Purchase Order coming soon");
    if (a === "order-list") alert("Purchase Orders list coming soon");
  }
});

// Topbar tabs: toggle homepage vs app content
(() => {
  const topTabs = document.querySelectorAll(".top-tab");
  const homePane = document.getElementById("homePane");
  const appPane = document.getElementById("appPane");
  function setActiveTop(name) {
    topTabs.forEach(x => x.classList.toggle("active", x.dataset.top === name));
    if (name === "home") {
      if (homePane) homePane.style.display = "block";
      if (appPane) appPane.style.display = "none";
    } else {
      if (homePane) homePane.style.display = "none";
      if (appPane) appPane.style.display = "grid";
      const tabEl = Array.from(document.querySelectorAll(".tab")).find(x => x.dataset.tab === "dashboard");
      const panelEl = document.getElementById("dashboard");
      const panels = document.querySelectorAll(".tab-panel");
      const tabs = document.querySelectorAll(".tab");
      if (tabEl && panelEl) {
        tabs.forEach(x => x.classList.remove("active"));
        panels.forEach(p => p.classList.remove("active"));
        tabEl.classList.add("active");
        panelEl.classList.add("active");
      }
    }
  }
  topTabs.forEach(t => {
    t.addEventListener("click", () => setActiveTop(t.dataset.top));
  });
  setActiveTop("home");
})();
