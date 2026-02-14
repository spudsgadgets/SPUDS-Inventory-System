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
  },
  async vendors() {
    const r = await fetch("/api/vendors");
    return r.json();
  },
  async getVendor(id) {
    const r = await fetch(`/api/vendors/${id}`);
    return r.json();
  },
  async createVendor(payload) {
    const r = await fetch("/api/vendors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return r.json();
  },
  async updateVendor(id, payload) {
    const r = await fetch(`/api/vendors/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return r.json();
  },
  async purchaseOrders() {
    const r = await fetch("/api/purchase-orders");
    return r.json();
  },
  async createPurchaseOrder(payload) {
    const r = await fetch("/api/purchase-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return r.json();
  },
  async salesOrders() {
    const r = await fetch("/api/sales-orders");
    return r.json();
  },
  async createSalesOrder(payload) {
    const r = await fetch("/api/sales-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return r.json();
  },
  async customers() {
    const r = await fetch("/api/customers");
    return r.json();
  },
  async payments() {
    const r = await fetch("/api/payments");
    return r.json();
  },
  async createPayment(payload) {
    const r = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return r.json();
  },
  async createCustomer(payload) {
    const r = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return r.json();
  },
  async updateCustomer(id, payload) {
    const r = await fetch(`/api/customers/${id}`, {
      method: "PUT",
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
      const panel = document.getElementById(id);
      if (panel) panel.classList.add("active");
    });
  });
}

async function initCustomerPage() {
  const listEl = document.getElementById("custList");
  if (!listEl) return;
  function fmt(n){ return "Php" + Number(n||0).toLocaleString(undefined,{ minimumFractionDigits:2, maximumFractionDigits:2 }); }
  async function refreshList() {
    const qn = (document.getElementById("custSearchName")?.value || "").toLowerCase();
    const rows = await api.customers();
    const filtered = rows.filter(r => (!qn || String(r.name||"").toLowerCase().includes(qn)));
    listEl.innerHTML = filtered.map(r => `<div class="po-order-item" data-id="${r.id}">${r.name}</div>`).join("");
    listEl.querySelectorAll(".po-order-item").forEach(x => {
      x.addEventListener("click", async () => {
        const id = Number(x.dataset.id);
        const cust = (await api.customers()).find(o=>o.id===id);
        if (!cust) return;
        const set = (id,val)=>{ const el=document.getElementById(id); if(el) el.value = val; };
        set("custName", cust.name || "");
        set("custBalance", fmt(Number(cust.balance||0)));
        set("custBusinessAddress", cust.business_address || "");
        set("custContact", cust.contact || "");
        set("custPhone", cust.phone || "");
        set("custFax", cust.fax || "");
        set("custEmail", cust.email || "");
        set("custWebsite", cust.website || "");
        const cur = document.getElementById("custCurrency"); if (cur) cur.value = cust.currency || "Philippine Peso (Php)";
        set("custDiscount", Number(cust.discount||0));
        set("custPaymentTerms", cust.payment_terms || "");
        const tax = document.getElementById("custTaxingScheme"); if (tax) tax.value = cust.taxing_scheme || "No Tax";
        set("custTaxExemptNo", cust.tax_exempt_no || "");
        const orders = await api.salesOrders();
        const mine = orders.filter(o=>String(o.customer||"").toLowerCase()===String(cust.name||"").toLowerCase());
        const body = document.getElementById("custOrdersBody");
        if (body) {
          body.innerHTML = mine.map(o=>`<tr><td>${o.order_number}</td><td>${o.created_at || ""}</td><td>${o.status || ""}</td><td>${fmt(o.total_amount || 0)}</td></tr>`).join("");
        }
        const total = mine.reduce((s,o)=>s+Number(o.total_amount||0),0);
        const pays = await api.payments();
        const paid = pays.filter(p=>String(p.type||"")==="customer" && String(p.ref||"").toLowerCase()===String(cust.name||"").toLowerCase())
                         .reduce((s,p)=>s+Number(p.amount||0),0);
        const bal = Math.max(0, total - paid);
        const f2 = (n)=>"Php"+Number(n||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
        const elTotal = document.getElementById("custTotalSales");
        const elPaid = document.getElementById("custPaidSum");
        const elBal = document.getElementById("custBalanceSum");
        if (elTotal) elTotal.textContent = f2(total);
        if (elPaid) elPaid.textContent = f2(paid);
        if (elBal) elBal.textContent = f2(bal);
        const pBody = document.getElementById("custPaymentsBody");
        if (pBody) pBody.innerHTML = pays.filter(p=>String(p.type||"")==="customer" && String(p.ref||"").toLowerCase()===String(cust.name||"").toLowerCase())
                                         .map(p=>`<tr><td>${p.created_at || ""}</td><td>${p.status || ""}</td><td>${f2(p.amount || 0)}</td></tr>`).join("");
      });
    });
  }
  const refreshBtn = document.getElementById("custRefreshBtn");
  if (refreshBtn) refreshBtn.addEventListener("click", refreshList);
  let draftPayments = [];
  function renderDraftPayments() {
    const body = document.getElementById("custNewPaymentsBody");
    if (!body) return;
    body.innerHTML = draftPayments.map(p=>`<tr><td>${p.status}</td><td>${p.amount}</td></tr>`).join("");
  }
  const addLineBtn = document.getElementById("custAddPaymentLineBtn");
  if (addLineBtn) addLineBtn.addEventListener("click", () => {
    const rawAmount = document.getElementById("custPaymentAmount")?.value || "";
    const amount = Number(String(rawAmount).replace(/[^\d.]/g,"")) || 0;
    const status = document.getElementById("custPaymentStatus")?.value || "paid";
    if (amount <= 0) return;
    draftPayments.push({ amount, status });
    renderDraftPayments();
    const amtEl = document.getElementById("custPaymentAmount"); if (amtEl) amtEl.value = "";
  });
  const saveLinesBtn = document.getElementById("custSavePaymentsBtn");
  if (saveLinesBtn) saveLinesBtn.addEventListener("click", async () => {
    const name = document.getElementById("custName")?.value || "";
    if (!name || draftPayments.length === 0) return;
    for (const p of draftPayments) {
      await api.createPayment({ type: "customer", ref: name, amount: Number(p.amount||0), status: p.status || "paid" });
    }
    draftPayments = [];
    renderDraftPayments();
    const orders = await api.salesOrders();
    const mine = orders.filter(o=>String(o.customer||"").toLowerCase()===String(name||"").toLowerCase());
    const total = mine.reduce((s,o)=>s+Number(o.total_amount||0),0);
    const pays = await api.payments();
    const paid = pays.filter(p=>String(p.type||"")==="customer" && String(p.ref||"").toLowerCase()===String(name||"").toLowerCase())
                     .reduce((s,p)=>s+Number(p.amount||0),0);
    const bal = Math.max(0, total - paid);
    const f2 = (n)=>"Php"+Number(n||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
    const elTotal = document.getElementById("custTotalSales");
    const elPaid = document.getElementById("custPaidSum");
    const elBal = document.getElementById("custBalanceSum");
    if (elTotal) elTotal.textContent = f2(total);
    if (elPaid) elPaid.textContent = f2(paid);
    if (elBal) elBal.textContent = f2(bal);
    const body = document.getElementById("custPaymentsBody");
    if (body) body.innerHTML = pays.filter(p=>String(p.type||"")==="customer" && String(p.ref||"").toLowerCase()===String(name||"").toLowerCase())
                                   .map(p=>`<tr><td>${p.created_at || ""}</td><td>${p.status || ""}</td><td>${f2(p.amount || 0)}</td></tr>`).join("");
  });
  const saveBtn = document.getElementById("custSaveBtn");
  if (saveBtn) {
    saveBtn.addEventListener("click", async () => {
      const payload = {
        name: document.getElementById("custName")?.value || "",
        balance: Number((document.getElementById("custBalance")?.value || "").replace(/[^\d.]/g,"")) || 0,
        business_address: document.getElementById("custBusinessAddress")?.value || "",
        contact: document.getElementById("custContact")?.value || "",
        phone: document.getElementById("custPhone")?.value || "",
        fax: document.getElementById("custFax")?.value || "",
        email: document.getElementById("custEmail")?.value || "",
        website: document.getElementById("custWebsite")?.value || "",
        currency: document.getElementById("custCurrency")?.value || "Philippine Peso (Php)",
        discount: Number(document.getElementById("custDiscount")?.value || 0),
        payment_terms: document.getElementById("custPaymentTerms")?.value || "",
        taxing_scheme: document.getElementById("custTaxingScheme")?.value || "No Tax",
        tax_exempt_no: document.getElementById("custTaxExemptNo")?.value || ""
      };
      const customers = await api.customers();
      const existing = customers.find(c=>String(c.name||"").toLowerCase()===String(payload.name||"").toLowerCase());
      if (existing) {
        await api.updateCustomer(existing.id, payload);
      } else {
        await api.createCustomer(payload);
      }
      await refreshList();
    });
  }
  const newBtn = document.getElementById("custNewBtn");
  if (newBtn) {
    newBtn.addEventListener("click", () => {
      ["custName","custBusinessAddress","custContact","custPhone","custFax","custEmail","custWebsite","custDiscount","custPaymentTerms","custTaxExemptNo","custRemarks"].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=""; });
      const b = document.getElementById("custBalance"); if (b) b.value = "Php0.00";
      const cur = document.getElementById("custCurrency"); if (cur) cur.value = "Philippine Peso (Php)";
      const tax = document.getElementById("custTaxingScheme"); if (tax) tax.value = "No Tax";
      const body = document.getElementById("custOrdersBody"); if (body) body.innerHTML = "";
    });
  }
  await refreshList();
}
function renderProducts(list) {
  const el = document.getElementById("products");
  if (!el) return;
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
  if (!el) return;
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
  const orders = await (await fetch("/api/sales-orders")).json();
  const orderItems = await (await fetch("/api/sales-order-items")).json();
  const payments = await (await fetch("/api/payments")).json();
  dashData = { products, movements, orders, orderItems, payments };
  renderDashboard(dashData);
}

const addProductForm = document.getElementById("addProductForm");
if (addProductForm) {
  addProductForm.addEventListener("submit", async (e) => {
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
}

const adjustStockForm = document.getElementById("adjustStockForm");
if (adjustStockForm) {
  adjustStockForm.addEventListener("submit", async (e) => {
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
}

const addVariantForm = document.getElementById("addVariantForm");
if (addVariantForm) {
  addVariantForm.addEventListener("submit", async (e) => {
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
}

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

let dashData = null;
function renderDashboard({ products, movements, orders, orderItems, payments }) {
  drawTimelineFromOrders(orderItems, payments);
  renderOutstandingTilesFromData({ products, orders });
  renderTopSalesOrdersFromOrders(orders);
}

function drawTimelineFromOrders(orderItems, payments) {
  const canvas = document.getElementById("timelineCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const now = new Date();
  const dateRange = (document.getElementById("dashDateRange")?.value || "Last 90 Days");
  const groupBy = (document.getElementById("dashGroupBy")?.value || "Months");
  const selected = (document.getElementById("dashLines")?.value || "All");
  const months = [];
  if (groupBy === "Months") {
    let count = 3;
    if (dateRange === "Last 30 Days") count = 2;
    if (dateRange === "Last 90 Days") count = 3;
    if (dateRange === "Year to Date") count = now.getMonth() + 1;
    for (let i=count-1;i>=0;i--) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - i);
      months.push({ key: `${d.getFullYear()}-${d.getMonth()+1}`, label: d.toLocaleString(undefined, { month: 'short' }) });
    }
  } else {
    let count = 12;
    if (dateRange === "Last 30 Days") count = 4;
    if (dateRange === "Last 90 Days") count = 12;
    if (dateRange === "Year to Date") count = Math.max(4, Math.ceil((now.getDate() + (now.getMonth()*30)) / 7));
    for (let i=count-1;i>=0;i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - (i*7));
      months.push({ key: `${d.getFullYear()}-${d.getMonth()+1}`, label: d.toLocaleDateString(undefined,{ month:'short', day:'numeric'}) });
    }
  }
  const salesByMonth = {};
  const cogsByMonth = {};
  orderItems.forEach(it => {
    const order = months.find(m => {
      const d = new Date(it.order_created_at || new Date());
      const key = `${d.getFullYear()}-${d.getMonth()+1}`;
      return key === m.key;
    });
    if (!order) return;
    salesByMonth[order.key] = (salesByMonth[order.key] || 0) + Number(it.line_total || 0);
    const cost = Number(it.qty || 0) * Number(it.unit_cost || 0);
    cogsByMonth[order.key] = (cogsByMonth[order.key] || 0) + cost;
  });
  const dueCustomer = payments.filter(p=>p.type==='customer' && p.status==='due').reduce((s,p)=>s+Number(p.amount||0),0);
  const dueVendor = payments.filter(p=>p.type==='vendor' && p.status==='due').reduce((s,p)=>s+Number(p.amount||0),0);
  const values = months.map(m => ({
    sales: salesByMonth[m.key] || 0,
    cogs: cogsByMonth[m.key] || 0,
    profit: (salesByMonth[m.key] || 0) - (cogsByMonth[m.key] || 0)
  }));
  const totalSales = values.reduce((sum,v)=>sum+v.sales,0);
  const totalCogs = values.reduce((sum,v)=>sum+v.cogs,0);
  const totalProfit = values.reduce((sum,v)=>sum+v.profit,0);
  const legend = document.getElementById("dashLegend");
  function fmt(n){ return "Php" + Number(n||0).toLocaleString(undefined,{ minimumFractionDigits:2, maximumFractionDigits:2 }); }
  if (legend) {
    const lgSales = legend.querySelector(".legend-green");
    const lgCogs = legend.querySelector(".legend-yellow");
    const lgProfit = legend.querySelector(".legend-blue");
    const lgVend = legend.querySelector(".legend-orange");
    const lgCust = legend.querySelector(".legend-lime");
    if (lgSales) lgSales.textContent = `Sales Completed, Total: ${fmt(totalSales)}`;
    if (lgCogs) lgCogs.textContent = `Cost of Goods Sold, Total: ${fmt(totalCogs)}`;
    if (lgProfit) lgProfit.textContent = `Sales Profit, Total: ${fmt(totalProfit)}`;
    if (lgVend) lgVend.textContent = `Vendor Payments Due, Total: ${fmt(dueVendor)}`;
    if (lgCust) lgCust.textContent = `Customer Payments Due, Total: ${fmt(dueCustomer)}`;
  }
  const maxAbs = Math.max(100, ...values.map(v => Math.max(v.sales, v.cogs, Math.abs(v.profit), dueCustomer, dueVendor)));
  const originY = canvas.height - 30;
  const leftPad = 40;
  ctx.strokeStyle = "#cbd5e1";
  ctx.beginPath();
  ctx.moveTo(leftPad, 10);
  ctx.lineTo(leftPad, originY);
  ctx.lineTo(canvas.width - 10, originY);
  ctx.stroke();
  const barWidth = 16;
  const groupWidth = 100;
  const gap = 60;
  months.forEach((m, i) => {
    const x0 = leftPad + 40 + i * (groupWidth + gap);
    const s = values[i].sales;
    const c = values[i].cogs;
    const p = values[i].profit;
    const heights = {
      sales: Math.round(Math.abs(s) / maxAbs * (originY - 40)),
      cogs: Math.round(Math.abs(c) / maxAbs * (originY - 40)),
      profit: Math.round(Math.abs(p) / maxAbs * (originY - 40))
    };
    if (selected === "All" || selected === "Sales Completed") {
      ctx.fillStyle = "#22c55e";
      ctx.fillRect(x0, originY - heights.sales, barWidth, heights.sales);
    }
    if (selected === "All" || selected === "Cost of Goods Sold") {
      ctx.fillStyle = "#f59e0b";
      ctx.fillRect(x0 + barWidth + 6, originY - heights.cogs, barWidth, heights.cogs);
    }
    if (selected === "All" || selected === "Sales Profit") {
      ctx.fillStyle = "#38bdf8";
      if (p >= 0) {
        ctx.fillRect(x0 + 2*barWidth + 12, originY - heights.profit, barWidth, heights.profit);
      } else {
        ctx.fillRect(x0 + 2*barWidth + 12, originY, barWidth, -heights.profit);
      }
    }
    ctx.fillStyle = "#475569";
    ctx.fillText(m.label, x0 + 4, originY + 14);
  });
  if (selected === "All" || selected === "Customer Payments Due") {
    ctx.fillStyle = "#84cc16";
    const hCust = Math.round(Math.abs(dueCustomer) / maxAbs * (originY - 40));
    ctx.fillRect(canvas.width - 160, originY - hCust, barWidth, hCust);
  }
  if (selected === "All" || selected === "Vendor Payments Due") {
    ctx.fillStyle = "#fb923c";
    const hVend = Math.round(Math.abs(dueVendor) / maxAbs * (originY - 40));
    ctx.fillRect(canvas.width - 130, originY - hVend, barWidth, hVend);
  }
}

function renderOutstandingTilesFromData({ products, orders }) {
  const el = document.getElementById("outstandingTiles");
  if (!el) return;
  const reorderCount = products.filter(p => Number(p.qty||0) <= Number(p.reorder_level||0)).length;
  const salesOpen = orders.filter(o=>o.status==='open').length;
  const tiles = [
    { n: salesOpen, label: "SALES ORDERS", cls: "tile-green", top: "sales" },
    { n: 0, label: "PURCHASE ORDERS", cls: "tile-yellow", top: "purchase" },
    { n: reorderCount, label: "PRODUCTS TO REORDER", cls: "tile-blue", top: "inventory" },
    { n: 0, label: "WORK ORDERS", cls: "tile-blue", top: "inventory" },
    { n: 0, label: "COUNT SHEETS", cls: "tile-blue", top: "inventory" }
  ];
  el.innerHTML = tiles.map(t => `
    <div class="tile ${t.cls}" data-top="${t.top}">
      <div class="tile-number">${t.n}</div>
      <div class="tile-label">${t.label}</div>
    </div>
  `).join("");
  el.querySelectorAll(".tile").forEach(t => {
    t.addEventListener("click", () => {
      const top = t.dataset.top;
      const title = t.querySelector(".tile-label")?.textContent || top;
      if (top && window.openDynamicTab) window.openDynamicTab(top, title);
    });
  });
}

function renderTopSalesOrdersFromOrders(orders) {
  const el = document.getElementById("topSalesOrders");
  if (!el) return;
  const completed = orders.filter(o=>o.status==='completed');
  const rows = completed.map(o => ({ name: o.order_number, amount: Number(o.total_amount || 0) }))
    .sort((a,b)=>b.amount-a.amount).slice(0,5);
  const max = Math.max(1, ...rows.map(r=>r.amount));
  el.innerHTML = rows.map((r,i)=>`
    <div class="order-item">
      <div>${i+1}. ${r.name}</div>
      <div class="order-amount">Php${r.amount.toLocaleString(undefined,{ minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
      <div class="order-bar" style="width:${Math.round((r.amount/max)*100)}%;"></div>
    </div>
  `).join("");
}

document.addEventListener("click", (e) => {
  const t = e.target;
  if (t.classList.contains("shortcut") && t.dataset.tabTarget) {
    const target = t.dataset.tabTarget;
    if (target === "dashboard" && window.setActiveTop) window.setActiveTop("dashboard");
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
  const step = t.closest && t.closest(".flow-step");
  if (step && step.dataset.top) {
    if (window.openDynamicTab) {
      window.openDynamicTab(step.dataset.top, step.querySelector(".flow-title")?.textContent || step.dataset.top);
    }
  }
});

// Topbar tabs: toggle homepage vs app content
(() => {
  const topTabs = document.querySelectorAll(".top-tab");
  const homePane = document.getElementById("homePane");
  const appPane = document.getElementById("appPane");
  const vendorPane = document.getElementById("vendorPane");
  const poPane = document.getElementById("poPane");
  const inventoryPane = document.getElementById("inventoryPane");
  const salesPane = document.getElementById("salesPane");
  const customerPane = document.getElementById("customerPane");
  function setActiveTop(name) {
    topTabs.forEach(x => x.classList.toggle("active", x.dataset.top === name));
    if (name === "home") {
      if (homePane) homePane.style.display = "block";
      if (appPane) appPane.style.display = "none";
      if (vendorPane) vendorPane.style.display = "none";
      if (poPane) poPane.style.display = "none";
      if (inventoryPane) inventoryPane.style.display = "none";
      if (salesPane) salesPane.style.display = "none";
      if (customerPane) customerPane.style.display = "none";
    } else if (name === "vendor") {
      if (homePane) homePane.style.display = "none";
      if (appPane) appPane.style.display = "none";
      if (vendorPane) vendorPane.style.display = "grid";
      initVendorPage();
      if (poPane) poPane.style.display = "none";
      if (inventoryPane) inventoryPane.style.display = "none";
      if (salesPane) salesPane.style.display = "none";
      if (customerPane) customerPane.style.display = "none";
    } else if (name === "customer") {
      if (homePane) homePane.style.display = "none";
      if (appPane) appPane.style.display = "none";
      if (vendorPane) vendorPane.style.display = "none";
      if (poPane) poPane.style.display = "none";
      if (inventoryPane) inventoryPane.style.display = "none";
      if (salesPane) salesPane.style.display = "none";
      if (customerPane) customerPane.style.display = "grid";
      initCustomerPage();
    } else if (name === "purchase") {
      if (homePane) homePane.style.display = "none";
      if (appPane) appPane.style.display = "none";
      if (vendorPane) vendorPane.style.display = "none";
      if (poPane) poPane.style.display = "grid";
      initPurchaseOrderPage();
      if (inventoryPane) inventoryPane.style.display = "none";
      if (salesPane) salesPane.style.display = "none";
      if (customerPane) customerPane.style.display = "none";
    } else if (name === "inventory") {
      if (homePane) homePane.style.display = "none";
      if (appPane) appPane.style.display = "none";
      if (vendorPane) vendorPane.style.display = "none";
      if (poPane) poPane.style.display = "none";
      if (inventoryPane) inventoryPane.style.display = "grid";
      initInventoryPage();
      if (salesPane) salesPane.style.display = "none";
      if (customerPane) customerPane.style.display = "none";
    } else if (name === "sales") {
      if (homePane) homePane.style.display = "none";
      if (appPane) appPane.style.display = "none";
      if (vendorPane) vendorPane.style.display = "none";
      if (poPane) poPane.style.display = "none";
      if (inventoryPane) inventoryPane.style.display = "none";
      if (salesPane) salesPane.style.display = "grid";
      initOrderSlipPage();
      if (customerPane) customerPane.style.display = "none";
    } else {
      if (homePane) homePane.style.display = "none";
      if (appPane) appPane.style.display = "grid";
      if (vendorPane) vendorPane.style.display = "none";
      if (poPane) poPane.style.display = "none";
      if (inventoryPane) inventoryPane.style.display = "none";
      if (salesPane) salesPane.style.display = "none";
      if (customerPane) customerPane.style.display = "none";
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
  function openDynamicTab(name, title) {
    const container = document.getElementById("dynTabs");
    if (!container) return;
    const tab = document.createElement("div");
    tab.className = "dyn-tab active";
    tab.dataset.base = name;
    tab.dataset.page = `${name}-${Date.now()}`;
    tab.innerHTML = `<span>${title}</span><span class="dyn-close">×</span>`;
    container.querySelectorAll(".dyn-tab").forEach(x => x.classList.remove("active"));
    container.appendChild(tab);
    setActiveTop(name);
    tab.addEventListener("click", (ev) => {
      if (ev.target.classList.contains("dyn-close")) {
        const wasActive = tab.classList.contains("active");
        tab.remove();
        if (wasActive) setActiveTop("dashboard");
      } else {
        container.querySelectorAll(".dyn-tab").forEach(x => x.classList.remove("active"));
        tab.classList.add("active");
        setActiveTop(tab.dataset.base);
      }
    });
  }
  const addBtn = document.getElementById("addTabBtn");
  if (addBtn) addBtn.addEventListener("click", () => setActiveTop("home"));
  const linesSel = document.getElementById("dashLines");
  const dateSel = document.getElementById("dashDateRange");
  const groupSel = document.getElementById("dashGroupBy");
  function reRender() { if (dashData) renderDashboard(dashData); }
  if (linesSel) linesSel.addEventListener("change", reRender);
  if (dateSel) dateSel.addEventListener("change", reRender);
  if (groupSel) groupSel.addEventListener("change", reRender);
  setActiveTop("home");
  window.setActiveTop = setActiveTop;
  window.openDynamicTab = openDynamicTab;
})();

async function initVendorPage() {
  const namesEl = document.getElementById("vendorNames");
  if (!namesEl) return;
  let selectedId = null;
  function setField(id, val) { const el = document.getElementById(id); if (el) el.value = val; }
  function renderVendorList(list) {
    namesEl.innerHTML = list.map(v => {
      const display = v.name ?? v.vendor_name ?? "";
      const vid = v.id ?? "";
      return `<div class="vendor-item" data-id="${vid}">${display}</div>`;
    }).join("");
    namesEl.querySelectorAll(".vendor-item").forEach(x => {
      x.addEventListener("click", async () => {
        const idStr = x.dataset.id || "";
        const id = idStr ? Number(idStr) : 0;
        selectedId = id || null;
        if (id) {
          const v = await api.getVendor(id);
          setField("vendorBasicName", v?.name || "");
          setField("vendorContactName", v?.contact || "");
          setField("vendorContactPhone", v?.phone || "");
          setField("vendorContactFax", v?.fax || "");
          setField("vendorContactEmail", v?.email || "");
          setField("vendorContactWebsite", v?.website || "");
          setField("vendorPayTerms", v?.payment_terms || "");
          setField("vendorTaxScheme", v?.taxing_scheme || "");
          setField("vendorCarrier", v?.carrier || "");
          const cEl = document.getElementById("vendorCurrency");
          if (cEl) cEl.value = v?.currency || "Philippine Peso (Php)";
          const addrEl = document.getElementById("vendorBusinessAddress");
          if (addrEl) addrEl.value = v?.business_address || "";
          const balEl = document.getElementById("vendorBasicBalance");
          if (balEl) balEl.value = "Php" + Number(v?.balance||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
        } else {
          const name = x.textContent || "";
          setField("vendorBasicName", name);
        }
      });
    });
  }
  const all = await api.vendors();
  renderVendorList(all);
  const btn = document.getElementById("vendorRefreshBtn");
  if (btn) {
    btn.addEventListener("click", async () => {
      const qName = (document.getElementById("vendorSearchName")?.value || "").toLowerCase();
      const qContact = (document.getElementById("vendorSearchContact")?.value || "").toLowerCase();
      const qPhone = (document.getElementById("vendorSearchPhone")?.value || "").toLowerCase();
      const data = await api.vendors();
      const filtered = data.filter(v =>
        (!qName || String(v.name||"").toLowerCase().includes(qName)) &&
        (!qContact || String(v.contact||"").toLowerCase().includes(qContact)) &&
        (!qPhone || String(v.phone||"").toLowerCase().includes(qPhone))
      );
      renderVendorList(filtered);
    });
  }
  const saveBtn = document.getElementById("vendorSaveBtn");
  if (saveBtn) {
    saveBtn.addEventListener("click", async () => {
      const payload = {
        name: document.getElementById("vendorBasicName")?.value || "",
        contact: document.getElementById("vendorContactName")?.value || "",
        phone: document.getElementById("vendorContactPhone")?.value || "",
        fax: document.getElementById("vendorContactFax")?.value || "",
        email: document.getElementById("vendorContactEmail")?.value || "",
        website: document.getElementById("vendorContactWebsite")?.value || "",
        payment_terms: document.getElementById("vendorPayTerms")?.value || "",
        taxing_scheme: document.getElementById("vendorTaxScheme")?.value || "",
        carrier: document.getElementById("vendorCarrier")?.value || "",
        currency: document.getElementById("vendorCurrency")?.value || "Philippine Peso (Php)",
        business_address: document.getElementById("vendorBusinessAddress")?.value || ""
      };
      let v;
      if (selectedId) {
        v = await api.updateVendor(selectedId, payload);
      } else {
        v = await api.createVendor(payload);
        selectedId = v?.id || null;
      }
      const data = await api.vendors();
      renderVendorList(data);
    });
  }
  const newBtn = document.getElementById("vendorNewBtn");
  if (newBtn) {
    newBtn.addEventListener("click", () => {
      selectedId = null;
      ["vendorBasicName","vendorContactName","vendorContactPhone","vendorContactFax","vendorContactEmail","vendorContactWebsite","vendorPayTerms","vendorTaxScheme","vendorCarrier","vendorBusinessAddress"].forEach(id => setField(id, ""));
      const cEl = document.getElementById("vendorCurrency");
      if (cEl) cEl.value = "Philippine Peso (Php)";
    });
  }
  const useBtn = document.getElementById("vendorUseInPOBtn");
  if (useBtn) {
    useBtn.addEventListener("click", () => {
      const vendor = (document.getElementById("vendorBasicName")?.value || "");
      const contact = (document.getElementById("vendorContactName")?.value || "");
      const phone = (document.getElementById("vendorContactPhone")?.value || "");
      const addr = (document.getElementById("vendorBusinessAddress")?.value || "");
      const terms = (document.getElementById("vendorPayTerms")?.value || "");
      const taxScheme = (document.getElementById("vendorTaxScheme")?.value || "");
      const currency = (document.getElementById("vendorCurrency")?.value || "");
      const tab = document.querySelector('.top-tab[data-top="purchase"]');
      if (tab) tab.click();
      setTimeout(() => {
        const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
        set("poVendor", vendor);
        set("poContact", contact);
        set("poPhone", phone);
        const addrEl = document.getElementById("poVendorAddress");
        if (addrEl) addrEl.value = addr;
        set("poTerms", terms);
        const taxEl = document.getElementById("poTaxScheme");
        if (taxEl) taxEl.value = taxScheme;
        const cEl2 = document.getElementById("poCurrency");
        if (cEl2) cEl2.value = currency;
      }, 50);
    });
  }
}

async function initPurchaseOrderPage() {
  const listEl = document.getElementById("poOrderList");
  if (!listEl) return;
  function fmt(n){ return "Php" + Number(n||0).toLocaleString(undefined,{ minimumFractionDigits:2, maximumFractionDigits:2 }); }
  async function refreshList() {
    const qs = (document.getElementById("poSearchOrder")?.value || "").toLowerCase();
    const qv = (document.getElementById("poSearchVendor")?.value || "").toLowerCase();
    const status = (document.getElementById("poSearchStatus")?.value || "");
    const rows = await api.purchaseOrders();
    const filtered = rows.filter(r =>
      (!qs || String(r.po_number||"").toLowerCase().includes(qs)) &&
      (!qv || String(r.vendor||"").toLowerCase().includes(qv)) &&
      (!status || String(r.status||"") === status)
    );
    listEl.innerHTML = filtered.map(r => `<div class="po-order-item" data-id="${r.id}">${r.po_number}</div>`).join("");
    listEl.querySelectorAll(".po-order-item").forEach(x => {
      x.addEventListener("click", async () => {
        const id = Number(x.dataset.id);
        const ord = (await api.purchaseOrders()).find(o=>o.id===id);
        if (!ord) return;
        const items = await (await fetch(`/api/purchase-orders/${id}/items`)).json();
        document.getElementById("poNumber").textContent = ord.po_number || "";
        const sub = items.reduce((s,it)=>s+Number(it.line_total||0),0);
        const freight = Number(ord.freight||0);
        const total = sub + freight;
        const paid = Number(ord.paid||0);
        const bal = Math.max(0, total - paid);
        document.getElementById("poSubTotal").textContent = fmt(sub);
        document.getElementById("poTotal").textContent = fmt(total);
        document.getElementById("poBalance").textContent = fmt(bal);
        const body = document.getElementById("poItemsBody");
        if (body) {
          body.innerHTML = items.map(it=>`
            <tr>
              <td>${it.item||""}</td>
              <td>${it.description||""}</td>
              <td>${it.vendor_product_code||""}</td>
              <td>${it.qty||0}</td>
              <td>${it.unit_price||0}</td>
              <td>${it.discount||0}</td>
              <td>${it.line_total||0}</td>
            </tr>
          `).join("");
        }
      });
    });
  }
  const refreshBtn = document.getElementById("poRefreshBtn");
  if (refreshBtn) refreshBtn.addEventListener("click", refreshList);
  const addItemBtn = document.getElementById("poAddItemBtn");
  let draftItems = [];
  function renderDraftBody() {
    const body = document.getElementById("poItemsBody");
    const sub = draftItems.reduce((s,it)=>s+it.line_total,0);
    if (body) {
      body.innerHTML = draftItems.map(it=>`
        <tr>
          <td>${it.item}</td>
          <td>${it.description}</td>
          <td>${it.vendor_product_code}</td>
          <td>${it.qty}</td>
          <td>${it.unit_price}</td>
          <td>${it.discount}</td>
          <td>${it.line_total}</td>
        </tr>
      `).join("");
    }
    const freight = Number(document.getElementById("poFreight")?.value||0);
    const total = sub + freight;
    const paid = Number(document.getElementById("poPaid")?.value||0);
    const bal = Math.max(0, total - paid);
    const fmt2 = (n)=>"Php"+Number(n||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
    const elSub = document.getElementById("poSubTotal");
    const elTotal = document.getElementById("poTotal");
    const elBal = document.getElementById("poBalance");
    if (elSub) elSub.textContent = fmt2(sub);
    if (elTotal) elTotal.textContent = fmt2(total);
    if (elBal) elBal.textContent = fmt2(bal);
  }
  if (addItemBtn) {
    addItemBtn.addEventListener("click", () => {
      const item = document.getElementById("poItemName")?.value || "";
      const description = document.getElementById("poItemDesc")?.value || "";
      const vendor_product_code = document.getElementById("poItemCode")?.value || "";
      const qty = Number(document.getElementById("poItemQty")?.value || 0);
      const unit_price = Number(document.getElementById("poItemPrice")?.value || 0);
      const discount = Number(document.getElementById("poItemDiscount")?.value || 0);
      const line_total = Math.max(0, qty * unit_price - discount);
      draftItems.push({ item, description, vendor_product_code, qty, unit_price, discount, line_total });
      renderDraftBody();
    });
  }
  const saveBtn = document.getElementById("poSaveBtn");
  if (saveBtn) {
    saveBtn.addEventListener("click", async () => {
      const payload = {
        vendor: document.getElementById("poVendor")?.value || "",
        status: document.getElementById("poStatus")?.value || "Open",
        date: document.getElementById("poDate")?.value || new Date().toISOString().slice(0,10),
        ship_to_address: document.getElementById("poShipTo")?.value || "",
        freight: Number(document.getElementById("poFreight")?.value || 0),
        items: draftItems
      };
      const res = await api.createPurchaseOrder(payload);
      document.getElementById("poNumber").textContent = res?.po_number || "";
      draftItems = [];
      renderDraftBody();
      await refreshList();
    });
  }
  await refreshList();
}

async function initOrderSlipPage() {
  const listEl = document.getElementById("soOrderList");
  if (!listEl) return;
  function fmt(n){ return "Php" + Number(n||0).toLocaleString(undefined,{ minimumFractionDigits:2, maximumFractionDigits:2 }); }
  const custEl = document.getElementById("soCustomer");
  async function soAutofillFromCustomer() {
    const name = custEl?.value || "";
    if (!name) return;
    const rows = await api.customers();
    const c = rows.find(r => String(r.name||"").toLowerCase() === String(name||"").toLowerCase());
    if (!c) return;
    const set = (id,val)=>{ const el=document.getElementById(id); if(el) el.value = val; };
    set("soContact", c.contact || "");
    set("soPhone", c.phone || "");
    const addrEl = document.getElementById("soAddress"); if (addrEl) addrEl.value = c.business_address || "";
  }
  if (custEl) {
    custEl.addEventListener("change", () => { soAutofillFromCustomer(); });
    custEl.addEventListener("blur", () => { soAutofillFromCustomer(); });
  }
  async function refreshList() {
    const qs = (document.getElementById("soSearchOrder")?.value || "").toLowerCase();
    const qc = (document.getElementById("soSearchCustomer")?.value || "").toLowerCase();
    const statusLabel = (document.getElementById("soSearchStatus")?.value || "");
    const status = statusLabel === "Open" ? "open" : statusLabel === "In Progress" ? "in_progress" : statusLabel === "Completed" ? "completed" : "";
    const rows = await api.salesOrders();
    const filtered = rows.filter(r =>
      (!qs || String(r.order_number||"").toLowerCase().includes(qs)) &&
      (!qc || String(r.customer||"").toLowerCase().includes(qc)) &&
      (!status || String(r.status||"") === status)
    );
    listEl.innerHTML = filtered.map(r => `<div class="po-order-item" data-id="${r.id}">${r.order_number}</div>`).join("");
    listEl.querySelectorAll(".po-order-item").forEach(x => {
      x.addEventListener("click", async () => {
        const id = Number(x.dataset.id);
        const ord = (await api.salesOrders()).find(o=>o.id===id);
        if (!ord) return;
        document.getElementById("soNumber").textContent = ord.order_number || "";
        const cEl = document.getElementById("soCustomer"); if (cEl) cEl.value = ord.customer || "";
        const rows = await api.customers();
        const c = rows.find(r=>String(r.name||"").toLowerCase()===String(ord.customer||"").toLowerCase());
        if (c) {
          const set = (id,val)=>{ const el=document.getElementById(id); if(el) el.value = val; };
          set("soContact", c.contact || "");
          set("soPhone", c.phone || "");
          const addrEl = document.getElementById("soAddress"); if (addrEl) addrEl.value = c.business_address || "";
        }
        const items = (await (await fetch(`/api/sales-order-items`)).json()).filter(it=>Number(it.order_id||0)===id);
        const sub = items.reduce((s,it)=>s+Number(it.line_total||0),0);
        const total = sub;
        const paid = 0;
        const bal = Math.max(0, total - paid);
        const body = document.getElementById("soItemsBody");
        if (body) {
          body.innerHTML = items.map(it=>`
            <tr>
              <td>${it.product_id || ""}</td>
              <td></td>
              <td>${it.qty||0}</td>
              <td>${it.unit_price||0}</td>
              <td>0</td>
              <td>${it.line_total||0}</td>
            </tr>
          `).join("");
        }
        document.getElementById("soSubTotal").textContent = fmt(sub);
        document.getElementById("soTotal").textContent = fmt(total);
        document.getElementById("soBalance").textContent = fmt(bal);
      });
    });
  }
  const refreshBtn = document.getElementById("soRefreshBtn");
  if (refreshBtn) refreshBtn.addEventListener("click", refreshList);
  const addItemBtn = document.getElementById("soAddItemBtn");
  let draftItems = [];
  function renderDraftBody() {
    const body = document.getElementById("soItemsBody");
    const sub = draftItems.reduce((s,it)=>s+it.line_total,0);
    if (body) {
      body.innerHTML = draftItems.map(it=>`
        <tr>
          <td>${it.item}</td>
          <td>${it.description}</td>
          <td>${it.qty}</td>
          <td>${it.unit_price}</td>
          <td>${it.discount}</td>
          <td>${it.line_total}</td>
        </tr>
      `).join("");
    }
    const total = sub;
    const paid = Number(document.getElementById("soPaid")?.value.replace(/[^\d.]/g,"")||0);
    const bal = Math.max(0, total - paid);
    const fmt2 = (n)=>"Php"+Number(n||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
    const elSub = document.getElementById("soSubTotal");
    const elTotal = document.getElementById("soTotal");
    const elBal = document.getElementById("soBalance");
    if (elSub) elSub.textContent = fmt2(sub);
    if (elTotal) elTotal.textContent = fmt2(total);
    if (elBal) elBal.textContent = fmt2(bal);
  }
  if (addItemBtn) {
    addItemBtn.addEventListener("click", () => {
      const item = document.getElementById("soItemName")?.value || "";
      const description = document.getElementById("soItemDesc")?.value || "";
      const qty = Number(document.getElementById("soItemQty")?.value || 0);
      const unit_price = Number(document.getElementById("soItemPrice")?.value || 0);
      const discount = Number(document.getElementById("soItemDiscount")?.value || 0);
      const line_total = Math.max(0, qty * unit_price - discount);
      draftItems.push({ item, description, qty, unit_price, discount, line_total });
      renderDraftBody();
    });
  }
  const saveBtn = document.getElementById("soSaveBtn");
  if (saveBtn) {
    saveBtn.addEventListener("click", async () => {
      const products = await api.products();
      const items = draftItems.map(it => {
        const p = products.find(x=>String(x.name||"").toLowerCase()===String(it.item||"").toLowerCase());
        const product_id = p ? Number(p.id) : 0;
        return { product_id, qty: it.qty, unit_price: it.unit_price };
      });
      const payload = {
        customer: document.getElementById("soCustomer")?.value || "",
        status: ((document.getElementById("soStatus")?.value || "Open") === "Open" ? "open" : (document.getElementById("soStatus")?.value || "") === "In Progress" ? "in_progress" : "completed"),
        items
      };
      const res = await api.createSalesOrder(payload);
      document.getElementById("soNumber").textContent = res?.order_number || "";
      draftItems = [];
      renderDraftBody();
      await refreshList();
    });
  }
  await refreshList();
}
async function initInventoryPage() {
  const sideEl = document.getElementById("invSideList");
  if (!sideEl) return;
  const catSel = document.getElementById("invSearchCategory");
  const tabs = Array.from(document.querySelectorAll(".inv-tab"));
  const panels = Array.from(document.querySelectorAll(".inv-panels .inv-panel"));
  const invForm = document.querySelector(".inv-form");
  const invSummary = document.querySelector(".inv-summary");
  const leftProduct = document.getElementById("invLeftProduct");
  const leftExtra = document.getElementById("invLeftExtra");
  const leftVendors = document.getElementById("invLeftVendors");
  const leftMovement = document.getElementById("invLeftMovement");
  const leftOrders = document.getElementById("invLeftOrders");
  let invSelectedProduct = null;
  let invProdData = [];
  let invProdPage = 1;
  let invProdPageSize = 25;
  let invProdSort = "name_asc";
  let invVendorData = [];
  let invVendorPage = 1;
  let invVendorPageSize = 25;
  let invVendorSort = "name_asc";
  let invMoveData = [];
  let invMovePage = 1;
  let invMovePageSize = 25;
  let invMoveSort = "date_desc";
  let invOrderData = [];
  let invOrderPage = 1;
  let invOrderPageSize = 25;
  let invOrderSort = "date_desc";
  function setActive(idx) {
    tabs.forEach((t,i)=>t.classList.toggle("active", i===idx));
    panels.forEach((p,i)=>p.classList.toggle("active", i===idx));
    if (invForm) invForm.style.display = idx === 0 ? "grid" : "none";
    if (invSummary) invSummary.style.display = idx === 0 ? "grid" : "none";
    if (leftProduct) leftProduct.style.display = idx === 0 ? "block" : "none";
    if (leftExtra) leftExtra.style.display = idx === 1 ? "block" : "none";
    if (leftVendors) leftVendors.style.display = idx === 2 ? "block" : "none";
    if (leftMovement) leftMovement.style.display = idx === 3 ? "block" : "none";
    if (leftOrders) leftOrders.style.display = idx === 4 ? "block" : "none";
    updateLeftLists();
  }
  tabs.forEach((t,i)=>t.addEventListener("click", ()=>setActive(i)));
  // Reference photos removed
  async function loadCategories() {
    const cats = await api.categories();
    if (catSel) catSel.innerHTML = `<option value="">All</option>` + cats.map(c=>`<option>${c.name}</option>`).join("");
  }
  function sideRow(c, name) {
    return `<div class="inv-side-row" data-name="${name}" data-category="${c}"><div>${c || ""}</div><div>${name || ""}</div></div>`;
  }
  function renderSide(products) {
    invProdData = products.slice();
    applyProdListRender();
    sideEl.querySelectorAll(".inv-side-row").forEach(x => {
      x.addEventListener("click", async () => {
        const name = x.dataset.name || "";
        const product = (await api.products()).find(p=>p.name===name);
        if (!product) return;
        invSelectedProduct = product;
        document.getElementById("prodNameCode")?.setAttribute("value", product.name || "");
        const nameEl = document.getElementById("prodNameCode"); if (nameEl) nameEl.value = product.name || "";
        const catEl = document.getElementById("prodCategory"); if (catEl) catEl.value = product.category || "";
        const typeEl = document.getElementById("prodType"); if (typeEl) typeEl.value = product.item_type || "Stock";
        const descEl = document.getElementById("prodDescription"); if (descEl) descEl.value = product.description || "";
        const taxEl = document.getElementById("prodTaxCode"); if (taxEl) taxEl.value = product.tax_code || "";
        const costEl = document.getElementById("prodCostingMethod"); if (costEl) costEl.value = product.costing_method || "Moving Average";
        await renderStockLevels(product.id);
        const vendorRows = await (await fetch(`/api/products/${product.id}/vendors`)).json();
        renderVendorList(vendorRows);
        renderLeftVendorList(vendorRows);
        const moves = await api.movements(product.id);
        const mvEl = document.getElementById("movements");
        if (mvEl) {
          const rows = moves.map(m=>`<tr><td>${m.id}</td><td>${m.delta}</td><td>${m.location}</td><td>${m.created_at}</td></tr>`).join("");
          mvEl.innerHTML = `<table><thead><tr><th>ID</th><th>Delta</th><th>Location</th><th>At</th></tr></thead><tbody>${rows}</tbody></table>`;
        }
        renderLeftMovementList(moves);
        const orderRows = await (await fetch(`/api/sales-order-items`)).json();
        const filteredOrders = orderRows.filter(r=>Number(r.product_id||0)===Number(product.id||0));
        const ohEl = document.getElementById("orderHistory");
        if (ohEl) {
          const rows = filteredOrders.map(o=>`<tr>
            <td>Sales</td>
            <td>${o.order_id}</td>
            <td>${product.last_vendor || ""}</td>
            <td>${o.order_created_at || ""}</td>
            <td>${o.order_status || ""}</td>
            <td>${(o.qty||0)*(o.unit_price||0)}</td>
            <td>${o.qty||0}</td>
            <td>${o.unit_price||0}</td>
            <td>${o.line_total||0}</td>
          </tr>`).join("");
          ohEl.innerHTML = `<table>
            <thead><tr>
              <th>Type</th><th>Order #</th><th>Customer/Vendor Name</th><th>Order Date</th>
              <th>Order Status</th><th>Order Total</th><th>Quantity</th><th>Unit Price</th><th>Sub-Total</th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table>`;
        }
        renderLeftOrderList(filteredOrders);
        const bomEl = document.getElementById("bomTable");
        if (bomEl) {
          const r = await fetch(`/api/products/${product.id}/bom`);
          const bomItems = await r.json();
          const rows = bomItems.map(b=>`<tr><td>${b.component_item||""}</td><td>${b.description||""}</td><td>${b.qty||0}</td><td>${b.cost||0}</td></tr>`).join("");
          bomEl.innerHTML = `<table><thead><tr><th>Component Item</th><th>Description</th><th>Qty</th><th>Cost</th></tr></thead><tbody>${rows}</tbody></table>`;
          const extraEl = document.getElementById("invExtraList");
          if (extraEl) {
            extraEl.innerHTML = rows ? `<table><thead><tr><th>Component</th><th>Description</th><th>Qty</th><th>Cost</th></tr></thead><tbody>${rows}</tbody></table>` : "";
          }
        }
        document.getElementById("prodBarcode")?.setAttribute("value", product.barcode || "");
        const set = (id,val)=>{ const el=document.getElementById(id); if(el) el.value = val; };
        set("prodBarcode", product.barcode || "");
        set("prodReorderPoint", product.reorder_point || 0);
        set("prodReorderQty", product.reorder_quantity || 0);
        set("prodDefaultLocation", product.default_location || "Main");
        set("prodDefaultSublocation", product.default_sublocation || "");
        set("prodLastVendor", product.last_vendor || "");
        set("prodStandardUom", product.standard_uom || "");
        set("prodSalesUom", product.sales_uom || "");
        set("prodPurchasingUom", product.purchasing_uom || "");
        set("prodLength", product.length || 0);
        set("prodWidth", product.width || 0);
        set("prodHeight", product.height || 0);
        set("prodWeight", product.weight || 0);
        set("prodRemarks", product.notes || "");
      });
    });
  }
  function renderLeftVendorList(rows) {
    const el = document.getElementById("invLeftVendorList");
    if (!el) return;
    invVendorData = rows.slice();
    applyVendorListRender();
  }
  function renderLeftMovementList(rows) {
    const el = document.getElementById("invLeftMovementList");
    if (!el) return;
    invMoveData = rows.slice();
    applyMovementListRender();
  }
  function renderLeftOrderList(rows) {
    const el = document.getElementById("invLeftOrderList");
    if (!el) return;
    invOrderData = rows.slice();
    applyOrderListRender();
  }
  async function updateLeftLists() {
    if (!invSelectedProduct) return;
    const vendorRows = await (await fetch(`/api/products/${invSelectedProduct.id}/vendors`)).json();
    renderLeftVendorList(vendorRows);
    const moves = await api.movements(invSelectedProduct.id);
    renderLeftMovementList(moves);
    const orderRows = await (await fetch(`/api/sales-order-items`)).json();
    const filteredOrders = orderRows.filter(r=>Number(r.product_id||0)===Number(invSelectedProduct.id||0));
    renderLeftOrderList(filteredOrders);
  }
  const lvBtn = document.getElementById("invLeftVendorRefreshBtn");
  if (lvBtn) lvBtn.addEventListener("click", updateLeftLists);
  const lmBtn = document.getElementById("invLeftMovementRefreshBtn");
  if (lmBtn) lmBtn.addEventListener("click", updateLeftLists);
  const loBtn = document.getElementById("invLeftOrderRefreshBtn");
  if (loBtn) loBtn.addEventListener("click", updateLeftLists);
  const vendorSortSel = document.getElementById("invVendorSort");
  if (vendorSortSel) vendorSortSel.addEventListener("change", () => { invVendorSort = vendorSortSel.value; invVendorPage = 1; applyVendorListRender(); });
  const vendorSizeSel = document.getElementById("invVendorPageSize");
  if (vendorSizeSel) vendorSizeSel.addEventListener("change", () => { invVendorPageSize = Number(vendorSizeSel.value||25); invVendorPage = 1; applyVendorListRender(); });
  const vendorPrev = document.getElementById("invVendorPrev");
  if (vendorPrev) vendorPrev.addEventListener("click", () => { invVendorPage = Math.max(1, invVendorPage-1); applyVendorListRender(); });
  const vendorNext = document.getElementById("invVendorNext");
  if (vendorNext) vendorNext.addEventListener("click", () => { invVendorPage = invVendorPage+1; applyVendorListRender(); });
  const moveSortSel = document.getElementById("invMovementSort");
  if (moveSortSel) moveSortSel.addEventListener("change", () => { invMoveSort = moveSortSel.value; invMovePage = 1; applyMovementListRender(); });
  const moveSizeSel = document.getElementById("invMovementPageSize");
  if (moveSizeSel) moveSizeSel.addEventListener("change", () => { invMovePageSize = Number(moveSizeSel.value||25); invMovePage = 1; applyMovementListRender(); });
  const movePrev = document.getElementById("invMovementPrev");
  if (movePrev) movePrev.addEventListener("click", () => { invMovePage = Math.max(1, invMovePage-1); applyMovementListRender(); });
  const moveNext = document.getElementById("invMovementNext");
  if (moveNext) moveNext.addEventListener("click", () => { invMovePage = invMovePage+1; applyMovementListRender(); });
  const orderSortSel = document.getElementById("invOrderSort");
  if (orderSortSel) orderSortSel.addEventListener("change", () => { invOrderSort = orderSortSel.value; invOrderPage = 1; applyOrderListRender(); });
  const orderSizeSel = document.getElementById("invOrderPageSize");
  if (orderSizeSel) orderSizeSel.addEventListener("change", () => { invOrderPageSize = Number(orderSizeSel.value||25); invOrderPage = 1; applyOrderListRender(); });
  const orderPrev = document.getElementById("invOrderPrev");
  if (orderPrev) orderPrev.addEventListener("click", () => { invOrderPage = Math.max(1, invOrderPage-1); applyOrderListRender(); });
  const orderNext = document.getElementById("invOrderNext");
  if (orderNext) orderNext.addEventListener("click", () => { invOrderPage = invOrderPage+1; applyOrderListRender(); });
  function applyProdListRender() {
    const sorted = invProdData.slice().sort((a,b)=>{
      const an = String(a.name||"").toLowerCase(), bn = String(b.name||"").toLowerCase();
      const ac = String(a.category||"").toLowerCase(), bc = String(b.category||"").toLowerCase();
      if (invProdSort === "name_asc") return an.localeCompare(bn);
      if (invProdSort === "name_desc") return bn.localeCompare(an);
      if (invProdSort === "category_asc") return ac.localeCompare(bc);
      if (invProdSort === "category_desc") return bc.localeCompare(ac);
      return an.localeCompare(bn);
    });
    const totalPages = Math.max(1, Math.ceil(sorted.length / invProdPageSize));
    invProdPage = Math.min(invProdPage, totalPages);
    const start = (invProdPage-1)*invProdPageSize;
    const pageRows = sorted.slice(start, start+invProdPageSize);
    sideEl.innerHTML = pageRows.map(p => sideRow(p.category || "", p.name || "")).join("");
    const info = document.getElementById("invProdPageInfo");
    if (info) info.textContent = `${invProdPage} / ${totalPages}`;
  }
  function applyVendorListRender() {
    const el = document.getElementById("invLeftVendorList");
    if (!el) return;
    const sorted = invVendorData.slice().sort((a,b)=>{
      const an = String(a.vendor_name||"").toLowerCase(), bn = String(b.vendor_name||"").toLowerCase();
      const ap = Number(a.vendor_price||0), bp = Number(b.vendor_price||0);
      if (invVendorSort === "name_asc") return an.localeCompare(bn);
      if (invVendorSort === "name_desc") return bn.localeCompare(an);
      if (invVendorSort === "price_asc") return ap - bp;
      if (invVendorSort === "price_desc") return bp - ap;
      return an.localeCompare(bn);
    });
    const totalPages = Math.max(1, Math.ceil(sorted.length / invVendorPageSize));
    invVendorPage = Math.min(invVendorPage, totalPages);
    const start = (invVendorPage-1)*invVendorPageSize;
    const pageRows = sorted.slice(start, start+invVendorPageSize);
    const html = pageRows.map(v=>`<div class="inv-side-row small">${v.vendor_name} — ${v.vendor_price ?? ""} — ${v.vendor_product_code || ""}</div>`).join("");
    el.innerHTML = html;
    const info = document.getElementById("invVendorPageInfo");
    if (info) info.textContent = `${invVendorPage} / ${totalPages}`;
  }
  function applyMovementListRender() {
    const el = document.getElementById("invLeftMovementList");
    if (!el) return;
    const sorted = invMoveData.slice().sort((a,b)=>{
      const ad = String(a.created_at||""), bd = String(b.created_at||"");
      const at = Number(a.delta||0), bt = Number(b.delta||0);
      if (invMoveSort === "date_desc") return bd.localeCompare(ad);
      if (invMoveSort === "date_asc") return ad.localeCompare(bd);
      if (invMoveSort === "delta_desc") return bt - at;
      if (invMoveSort === "delta_asc") return at - bt;
      return bd.localeCompare(ad);
    });
    const totalPages = Math.max(1, Math.ceil(sorted.length / invMovePageSize));
    invMovePage = Math.min(invMovePage, totalPages);
    const start = (invMovePage-1)*invMovePageSize;
    const pageRows = sorted.slice(start, start+invMovePageSize);
    const html = pageRows.map(m=>`<div class="inv-side-row small">${m.created_at || ""} • ${m.location || ""} • ${m.delta || 0}</div>`).join("");
    el.innerHTML = html;
    const info = document.getElementById("invMovementPageInfo");
    if (info) info.textContent = `${invMovePage} / ${totalPages}`;
  }
  function applyOrderListRender() {
    const el = document.getElementById("invLeftOrderList");
    if (!el) return;
    const sorted = invOrderData.slice().sort((a,b)=>{
      const ad = String(a.order_created_at||""), bd = String(b.order_created_at||"");
      const at = Number(a.line_total||0), bt = Number(b.line_total||0);
      if (invOrderSort === "date_desc") return bd.localeCompare(ad);
      if (invOrderSort === "date_asc") return ad.localeCompare(bd);
      if (invOrderSort === "total_desc") return bt - at;
      if (invOrderSort === "total_asc") return at - bt;
      return bd.localeCompare(ad);
    });
    const totalPages = Math.max(1, Math.ceil(sorted.length / invOrderPageSize));
    invOrderPage = Math.min(invOrderPage, totalPages);
    const start = (invOrderPage-1)*invOrderPageSize;
    const pageRows = sorted.slice(start, start+invOrderPageSize);
    const html = pageRows.map(o=>`<div class="inv-side-row small">${o.order_id} • ${o.order_created_at || ""} • ${o.qty || 0} • ${o.line_total || 0}</div>`).join("");
    el.innerHTML = html;
    const info = document.getElementById("invOrderPageInfo");
    if (info) info.textContent = `${invOrderPage} / ${totalPages}`;
  }
  async function refreshSide() {
    const qName = (document.getElementById("invSearchNameCode")?.value || "").toLowerCase();
    const qDesc = (document.getElementById("invSearchDescription")?.value || "").toLowerCase();
    const qCat = (catSel?.value || "").toLowerCase();
    const products = await api.products();
    const filtered = products.filter(p =>
      (!qName || String(p.name||"").toLowerCase().includes(qName) || String(p.sku||"").toLowerCase().includes(qName)) &&
      (!qDesc || String(p.description||"").toLowerCase().includes(qDesc)) &&
      (!qCat || String(p.category||"").toLowerCase() === qCat)
    );
    renderSide(filtered);
  }
  const refreshBtn = document.getElementById("invRefreshBtn");
  if (refreshBtn) refreshBtn.addEventListener("click", refreshSide);
  const prodSortSel = document.getElementById("invProdSort");
  if (prodSortSel) prodSortSel.addEventListener("change", () => { invProdSort = prodSortSel.value; invProdPage = 1; applyProdListRender(); });
  const prodSizeSel = document.getElementById("invProdPageSize");
  if (prodSizeSel) prodSizeSel.addEventListener("change", () => { invProdPageSize = Number(prodSizeSel.value||25); invProdPage = 1; applyProdListRender(); });
  const prodPrev = document.getElementById("invProdPrev");
  if (prodPrev) prodPrev.addEventListener("click", () => { invProdPage = Math.max(1, invProdPage-1); applyProdListRender(); });
  const prodNext = document.getElementById("invProdNext");
  if (prodNext) prodNext.addEventListener("click", () => { invProdPage = invProdPage+1; applyProdListRender(); });
  const saveBtn = document.getElementById("invSaveBtn");
  if (saveBtn) {
    saveBtn.addEventListener("click", async () => {
      const payload = {
        name: document.getElementById("prodNameCode")?.value || "",
        category: document.getElementById("prodCategory")?.value || "",
        item_type: document.getElementById("prodType")?.value || "Stock",
        description: document.getElementById("prodDescription")?.value || "",
        tax_code: document.getElementById("prodTaxCode")?.value || "",
        costing_method: document.getElementById("prodCostingMethod")?.value || "Moving Average"
      };
      const products = await api.products();
      const existing = products.find(p=>p.name === payload.name);
      if (existing) {
        await api.updateProduct(existing.id, payload);
      } else {
        await api.addProduct({ ...payload, sku: payload.name.toUpperCase().replace(/\s+/g,"-") });
      }
      await refreshSide();
    });
  }
  const newBtn = document.getElementById("invNewBtn");
  if (newBtn) {
    newBtn.addEventListener("click", () => {
      ["prodNameCode","prodCategory","prodDescription"].forEach(id=>{ const el = document.getElementById(id); if (el) el.value = ""; });
      const typeEl = document.getElementById("prodType"); if (typeEl) typeEl.value = "Stock";
      const taxEl = document.getElementById("prodTaxCode"); if (taxEl) taxEl.value = "Taxable";
      const costEl = document.getElementById("prodCostingMethod"); if (costEl) costEl.value = "Moving Average";
      const mvEl = document.getElementById("movements"); if (mvEl) mvEl.innerHTML = "";
      const slEl = document.getElementById("stockLevels"); if (slEl) slEl.innerHTML = "";
    });
  }
  await loadCategories();
  await refreshSide();
  renderProducts(await api.products());
  setActive(0);
}
