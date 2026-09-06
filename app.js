const MENU = [
  ["dashboard", "🏠", "Dashboard"],
  ["kasir", "🛒", "Kasir"],
  ["barang", "📦", "Data Barang"],
  ["masuk", "📥", "Barang Masuk"],
  ["keluar", "📤", "Barang Keluar"],
  ["opname", "📋", "Stock Opname"],
  ["laba", "💰", "Laba / Rugi"],
  ["laporan", "📊", "Laporan"],
  ["pengaturan", "⚙️", "Pengaturan"],
];
const DEFAULT_PRODUCTS = [
  { code: "BRG-0001", name: "Ayam", brand: "Lokal", unit: "Kg", stock: 1, buy: 28000, sell: 32000 },
  { code: "BRG-0002", name: "Gula Pasir", brand: "Gulaku", unit: "Kg", stock: 45, buy: 16000, sell: 19000 },
  { code: "BRG-0003", name: "Beras Premium", brand: "Mawar", unit: "Kg", stock: 200, buy: 14500, sell: 17500 },
  { code: "BRG-0004", name: "Air Mineral", brand: "Mineralle", unit: "Dus", stock: 57, buy: 42000, sell: 50000 },
  { code: "BRG-0005", name: "Minyak Goreng 1L", brand: "Sunco", unit: "Pcs", stock: 200, buy: 17000, sell: 20500 },
  { code: "BRG-0006", name: "Tepung Terigu", brand: "Segitiga", unit: "Kg", stock: 88, buy: 12500, sell: 15500 },
  { code: "BRG-0007", name: "Kacang Kedelai", brand: "Lokal", unit: "Kg", stock: 165, buy: 14000, sell: 18000 },
];

const get = (k, d) => JSON.parse(localStorage.getItem("mb3_" + k) || "null") ?? d;
const PROFILE_DEFAULT = { storeName: "Manajemen Barang", address: "Indonesia", phone: "", email: "", logo: "" };
const ADMIN_PROFILE_DEFAULT = { name: "Administrator", callName: "", birthplace: "", birthdate: "", gender: "", phone: "", email: "admin@demo.local", address: "", education: "", skills: "", photo: "" };
const USERS_DEFAULT = [
  { id: "admin", name: "Administrator", email: "admin@demo.local", password: "admin123", role: "admin", active: true },
  { id: "kasir-demo", name: "Kasir Demo", email: "user@demo.local", password: "kasir123", role: "kasir", active: true },
];
const S = {
  user: null,
  page: "dashboard",
  products: get("products", DEFAULT_PRODUCTS),
  incoming: get("incoming", []),
  outgoing: get("outgoing", []),
  opname: get("opname", []),
  cart: [],
  report: "stok",
  search: "",
  pageNo: 1,
  profile: get("profile", PROFILE_DEFAULT),
  adminProfile: get("adminProfile", ADMIN_PROFILE_DEFAULT),
  users: get("users", USERS_DEFAULT),
};
const $ = (id) => document.getElementById(id);
const rupiah = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(n) || 0);
const pad = (n) => String(n).padStart(2, "0");
const localDate = (d) => {
  d = d || new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const fmtDate = (v) => {
  if (!v) return "-";
  const s = String(v),
    m = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/);
  if (!m) return esc(s);
  const d = new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0));
  const date = d.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
  return m[4] ? `${date} ${m[4]}:${m[5]}` : date;
};
const dateKey = (v) => String(v || "").slice(0, 10);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
function save() {
  for (const k of ["products", "incoming", "outgoing", "opname", "profile", "adminProfile", "users"]) localStorage.setItem("mb3_" + k, JSON.stringify(S[k]));
}
function toast(t) {
  $("toast").textContent = t;
  $("toast").classList.add("show");
  setTimeout(() => $("toast").classList.remove("show"), 2200);
}
function stat(icon, title, value, sub) {
  return `<div class="card stat"><div><p>${title}</p><h3>${value}</h3><span class="muted">${sub}</span></div><div class="ico">${icon}</div></div>`;
}
function totalStock() {
  return S.products.reduce((a, p) => a + Number(p.stock), 0);
}
function low() {
  return S.products.filter((p) => Number(p.stock) <= 5);
}
function currentUser() {
  return S.user;
}
function init() {
  $("today").textContent = new Intl.DateTimeFormat("id-ID", { dateStyle: "full" }).format(new Date());
  document.querySelectorAll(".role-tab").forEach(
    (b) =>
      (b.onclick = () => {
        document.querySelectorAll(".role-tab").forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
      }),
  );
  $("loginForm").onsubmit = (e) => {
    e.preventDefault();
    const email = $("email").value.trim().toLowerCase(),
      pass = $("password").value;
    const u = S.users.find((x) => x.email.toLowerCase() === email && x.password === pass && x.active !== false);
    if (!u) return toast("Email atau password salah / akun nonaktif");
    S.user = { id: u.id, name: u.name, email: u.email, role: u.role };
    sessionStorage.setItem("mb3_user", JSON.stringify(S.user));
    show();
  };
  $("logoutBtn").onclick = () => {
    sessionStorage.removeItem("mb3_user");
    location.reload();
  };
  $("notifyBtn").onclick = () => toast(low().length ? `Ada ${low().length} barang dengan stok menipis` : "Tidak ada notifikasi baru");
  const u = sessionStorage.getItem("mb3_user");
  if (u) {
    S.user = JSON.parse(u);
    show();
  }
}
function show() {
  $("loginView").classList.add("hidden");
  $("appView").classList.remove("hidden");
  $("currentName").textContent = S.user.name;
  $("currentRole").textContent = S.user.role === "admin" ? "Admin" : "Kasir";
  const profiles = JSON.parse(localStorage.getItem("mb_v31_profiles") || "{}");
  const photo = S.user.role === "admin" ? S.adminProfile?.photo || "" : profiles[S.user.id]?.photo || "";
  $("avatar").innerHTML = photo ? `<img src="${esc(photo)}" alt="Foto profil">` : (S.user.name || "U").slice(0, 1).toUpperCase();
  nav();
  render();
}
function nav() {
  $("nav").innerHTML = MENU.map((m) => {
    if (S.user.role === "kasir" && ["laba", "laporan"].includes(m[0])) return "";
    return `<button class="nav-item ${S.page === m[0] ? "active" : ""}" data-p="${m[0]}"><b>${m[1]}</b><span>${m[2]}</span></button>`;
  }).join("");
  document.querySelectorAll("[data-p]").forEach(
    (b) =>
      (b.onclick = () => {
        S.page = b.dataset.p;
        S.search = "";
        S.pageNo = 1;
        nav();
        render();
      }),
  );
}
function render() {
  const title = Object.fromEntries(MENU.map((x) => [x[0], x[2]]))[S.page];
  $("pageTitle").textContent = title;
  const fn = { dashboard, kasir, barang, masuk: () => movement(true), keluar: () => movement(false), opname, laba, laporan, pengaturan }[S.page];
  $("content").innerHTML = fn();
  bind();
}
function weekInfo() {
  const now = new Date(),
    day = now.getDay() || 7,
    monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { key: localDate(d), label: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"][i], date: d };
  });
}
function weeklySales() {
  const days = weekInfo();
  return days.map((d) => ({
    ...d,
    total: S.outgoing.filter((x) => dateKey(x.dateISO || x.date) === d.key).reduce((a, x) => a + Number(x.total || 0), 0),
    qty: S.outgoing.filter((x) => dateKey(x.dateISO || x.date) === d.key).reduce((a, x) => a + Number(x.qty || 0), 0),
  }));
}
function dashboard() {
  const sales = weeklySales(),
    max = Math.max(...sales.map((x) => x.total), 1);
  const bars = sales
    .map(
      (x) =>
        `<div class="bar-wrap" title="${esc(x.label)} • ${esc(fmtDate(x.key))} • ${rupiah(x.total)}"><div class="bar" style="height:${Math.max(x.total ? Math.round((x.total / max) * 100) : 3, 3)}%"></div><small>${x.total ? rupiah(x.total).replace("Rp", "Rp ") : "Rp 0"}</small></div>`,
    )
    .join("");
  return `<div class="cards">${stat("📦", "Jenis Barang", S.products.length, "Produk terdaftar")}${stat("📊", "Total Stok", totalStock(), "Unit tersedia")}${stat("⚠️", "Stok Menipis", low().length, low().length ? "Perlu restock" : "Stok aman")}${stat("💵", "Omzet", rupiah(S.outgoing.reduce((a, x) => a + x.total, 0)), "Total transaksi")}</div>
 <div class="grid2"><div class="card"><div class="card-head"><div><h3>Aktivitas Penjualan</h3></div><button class="link" data-pagego="laporan">Lihat laporan →</button></div>
 <div class="chart weekly-chart">${bars}</div><div class="chart-labels">${sales.map((x) => `<span>${x.label}</span>`).join("")}</div>
 <div class="weekly-summary">${sales.map((x) => `<div><b>${rupiah(x.total)}</b><small>${x.qty} item</small></div>`).join("")}</div></div>
 <div class="card"><div class="card-head"><h3>Stok Menipis</h3><button class="link" data-pagego="barang">Kelola →</button></div>
 ${
   low().length
     ? low()
         .map(
           (p) =>
             `<div style="display:flex;justify-content:space-between;padding:11px 0;border-bottom:1px solid var(--line)"><span><b>${esc(p.name)}</b><small style="display:block;color:var(--muted)">${esc(p.code)}</small></span><span class="badge low">${p.stock} ${esc(p.unit)}</span></div>`,
         )
         .join("")
     : "<div class='empty'>stok aman</div>"
 }</div></div>`;
}
function productForm(p = {}) {
  return `<div class="form-grid"><label>Kode<input id="fcode" value="${esc(p.code || "")}" required></label><label>Nama<input id="fname" value="${esc(p.name || "")}" required></label><label>Merek<input id="fbrand" value="${esc(p.brand || "")}"></label><label>Satuan<input id="funit" value="${esc(p.unit || "Pcs")}"></label><label>Stok<input id="fstock" type="number" min="0" value="${p.stock ?? 0}"></label><label>Harga Beli<input id="fbuy" type="number" min="0" value="${p.buy ?? 0}"></label><label class="wide">Harga Jual<input id="fsell" type="number" min="0" value="${p.sell ?? 0}"></label></div>`;
}
function form(m) {
  return {
    code: m.querySelector("#fcode").value.trim(),
    name: m.querySelector("#fname").value.trim(),
    brand: m.querySelector("#fbrand").value.trim(),
    unit: m.querySelector("#funit").value.trim(),
    stock: +m.querySelector("#fstock").value,
    buy: +m.querySelector("#fbuy").value,
    sell: +m.querySelector("#fsell").value,
  };
}
function modal(title, body, cb) {
  const m = document.createElement("div");
  m.className = "modal";
  m.innerHTML = `<div class="modal-box"><div class="modal-head"><h3>${title}</h3><button class="x">×</button></div>${body}<div class="actions"><button class="secondary cancel">Batal</button><button class="primary submit">Simpan</button></div></div>`;
  document.body.appendChild(m);
  m.querySelectorAll(".x,.cancel").forEach((b) => (b.onclick = () => m.remove()));
  m.querySelector(".submit").onclick = () => cb(m);
  return m;
}
function filteredProducts() {
  const q = S.search.toLowerCase();
  return S.products.filter((p) => Object.values(p).join(" ").toLowerCase().includes(q));
}
function barang() {
  const list = filteredProducts(),
    start = (S.pageNo - 1) * 8,
    rows = list.slice(start, start + 8);
  return `<div class="card"><div class="toolbar"><div class="toolbar-left"><input id="search" placeholder="Cari kode, nama, merek..." value="${esc(S.search)}"></div><div class="toolbar-right">${S.user.role === "admin" ? '<button class="primary" data-addproduct>＋ Tambah Barang</button>' : ""}<button class="secondary" data-export>Export CSV</button></div></div>
 <div class="summary-row"><div class="summary-pill">Total produk: <b>${S.products.length}</b></div><div class="summary-pill">Total stok: <b>${totalStock()}</b></div><div class="summary-pill">Stok menipis: <b>${low().length}</b></div></div><br>
 <div class="table-wrap"><table class="table"><thead><tr><th>Kode</th><th>Nama</th><th>Merek</th><th>Satuan</th><th>Stok</th><th>Harga Jual</th><th>Aksi</th></tr></thead><tbody>
 ${rows.map((p) => `<tr><td><b>${esc(p.code)}</b></td><td>${esc(p.name)}</td><td>${esc(p.brand)}</td><td>${esc(p.unit)}</td><td><span class="badge ${p.stock <= 5 ? "low" : "ok"}">${p.stock}</span></td><td>${rupiah(p.sell)}</td><td><button class="secondary" data-edit="${S.products.indexOf(p)}">Edit</button> ${S.user.role === "admin" ? `<button class="secondary danger" data-del="${S.products.indexOf(p)}">Hapus</button>` : ""}</td></tr>`).join("") || `<tr><td colspan="7" class="empty">Data tidak ditemukan</td></tr>`}
 </tbody></table></div>${pagination(list.length)}</div>`;
}
function pagination(n) {
  const pages = Math.max(1, Math.ceil(n / 8));
  return `<div class="pagination">${Array.from({ length: pages }, (_, i) => `<button class="page-btn ${S.pageNo === i + 1 ? "active" : ""}" data-page="${i + 1}">${i + 1}</button>`).join("")}</div>`;
}
function kasir() {
  return `<div class="grid2"><div class="card"><div class="card-head"><h3>Daftar Barang</h3><input id="kasirSearch" placeholder="Cari barang..." style="max-width:210px;margin:0"></div>
 <div id="kasirProducts">${S.products.map((p, i) => `<div class="summary-pill" style="display:flex;justify-content:space-between;align-items:center;margin:7px 0"><span><b>${esc(p.name)}</b><small style="display:block;color:var(--muted)">Stok ${p.stock} · ${rupiah(p.sell)}</small></span><button class="primary" data-cart="${i}" ${p.stock < 1 ? "disabled" : ""}>＋</button></div>`).join("")}</div></div>
 <div class="card"><div class="card-head"><h3>Keranjang</h3><span class="badge pink">${S.cart.reduce((a, x) => a + x.qty, 0)} item</span></div>
 ${
   S.cart.length
     ? S.cart
         .map(
           (x, i) =>
             `<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--line)"><span><b>${esc(x.name)}</b><small style="display:block;color:var(--muted)">${x.qty} × ${rupiah(x.sell)}</small></span><span><button class="secondary" data-minus="${i}">−</button> <button class="secondary" data-plus="${i}">＋</button></span></div>`,
         )
         .join("") +
       `<div style="margin-top:16px"><label>Tanggal & waktu transaksi<input id="saleDate" type="datetime-local" value="${localDate()}T${pad(new Date().getHours())}:${pad(new Date().getMinutes())}" ></label></div>
 <div style="display:flex;justify-content:space-between;margin-top:10px;font-size:18px"><b>Total</b><b>${rupiah(S.cart.reduce((a, x) => a + x.qty * x.sell, 0))}</b></div>
 <button class="primary full" data-checkout>Bayar & Cetak Struk</button>`
     : "<div class='empty'>Keranjang kosong</div>"
 }</div></div>`;
}
function movement(isIn) {
  const data = isIn ? S.incoming : S.outgoing;
  return `<div class="card"><div class="toolbar"><div><b>${isIn ? "Barang Masuk" : "Barang Keluar"}</b><div class="muted">Setiap transaksi langsung mengubah stok.</div></div><button class="primary" data-move="${isIn ? "in" : "out"}">＋ Catat ${isIn ? "Barang Masuk" : "Barang Keluar"}</button></div>
 <table class="table"><thead><tr><th>Tanggal</th><th>Barang</th><th>Qty</th><th>${isIn ? "Supplier" : "Total"}</th><th>Keterangan</th></tr></thead><tbody>
 ${data.map((x) => `<tr><td>${esc(x.date)}</td><td>${esc(x.name)}</td><td>${x.qty}</td><td>${isIn ? esc(x.supplier || "-") : rupiah(x.total)}</td><td>${esc(x.note || "-")}</td></tr>`).join("") || `<tr><td colspan="5" class="empty">Belum ada transaksi.</td></tr>`}</tbody></table></div>`;
}
function opname() {
  return `<div class="card"><div class="toolbar"><button class="primary" data-saveop>Simpan Opname</button></div>
  <label style="max-width:300px">Tanggal & waktu opname<input id="opDate" type="datetime-local" value="${localDate()}T${pad(new Date().getHours())}:${pad(new Date().getMinutes())}" ></label>
 <table class="table"><thead><tr><th>Barang</th><th>Sistem</th><th>Fisik</th><th>Selisih</th><th>Catatan</th></tr></thead><tbody> </label>
 ${S.products.map((p, i) => `<tr><td>${esc(p.name)}</td><td>${p.stock}</td><td><input class="op" data-i="${i}" type="number" min="0" value="${p.stock}" style="width:100px;margin:0"></td><td id="dif${i}">0</td><td><input class="opnote" data-i="${i}" placeholder="Opsional" style="margin:0"></td></tr>`).join("")}</tbody></table></div>
 <div class="card" style="margin-top:15px"><h3>Riwayat Opname</h3><table class="table"><thead><tr><th>Tanggal</th><th>Barang</th><th>Selisih</th><th>Catatan</th></tr></thead><tbody>
 ${S.opname.map((x) => `<tr><td>${esc(x.date)}</td><td>${esc(x.name)}</td><td>${x.diff > 0 ? "+" : ""}${x.diff}</td><td>${esc(x.note || "-")}</td></tr>`).join("") || "<tr><td colspan=4 class=empty>Belum ada riwayat</td></tr>"}</tbody></table></div>`;
}
function laba() {
  const rev = S.outgoing.reduce((a, x) => a + Number(x.total || 0), 0),
    cost = S.outgoing.reduce((a, x) => a + Number(x.cost || 0), 0),
    profit = rev - cost;
  return `<div class="cards">${stat("💵", "Penjualan", rupiah(rev), "Total omzet")}${stat("🧾", "Modal", rupiah(cost), "Harga pokok")}${stat("📈", "Laba Bersih", rupiah(profit), profit >= 0 ? "Positif" : "Negatif")}${stat("📊", "Margin", rev ? ((profit / rev) * 100).toFixed(1) + "%" : "0%", "Margin laba")}</div>
 <div class="card" style="margin-top:15px"><div class="card-head"><h3>Detail transaksi</h3><button class="secondary" data-exportprofit>Export CSV</button></div><table class="table"><thead><tr><th>Tanggal</th><th>Barang</th><th>Qty</th><th>Penjualan</th><th>Modal</th><th>Laba</th></tr></thead><tbody>
 ${S.outgoing.map((x) => `<tr><td>${esc(x.date)}</td><td>${esc(x.name)}</td><td>${x.qty}</td><td>${rupiah(x.total)}</td><td>${rupiah(x.cost)}</td><td><b>${rupiah(x.total - x.cost)}</b></td></tr>`).join("") || "<tr><td colspan=6 class=empty>Belum ada transaksi penjualan</td></tr>"}</tbody></table></div>`;
}
function laporan() {
  const cards = [
    ["stok", "📦", "Laporan Stok", "Stok saat ini dan nilai persediaan."],
    ["masuk", "📥", "Laporan Barang Masuk", "Penerimaan barang dan supplier."],
    ["keluar", "📤", "Laporan Barang Keluar", "Penjualan/pengeluaran barang."],
    ["profit", "💰", "Laporan Laba Rugi", "Omzet, modal, laba, margin."],
    ["opname", "📋", "Laporan Stock Opname", "Riwayat pemeriksaan stok."],
    ["export", "🧾", "Export Semua Data", "Unduh CSV data sistem."],
  ];
  return `<div class="report-grid">${cards.map((x) => `<div class="card report-card" data-report="${x[0]}"><div style="font-size:28px">${x[1]}</div><h3>${x[2]}</h3><p>${x[3]}</p><button class="secondary">Buka Laporan →</button></div>`).join("")}</div><div style="margin-top:15px">${reportDetail()}</div>`;
}
function reportDetail() {
  if (S.report === "export")
    return `<div class="card"><h3>Export Data</h3><button class="primary" data-export>Data Barang</button> <button class="secondary" data-exportin>Barang Masuk</button> <button class="secondary" data-exportout>Barang Keluar</button>`;
  if (S.report === "profit") return `<div class="card"><h3>Laporan Laba / Rugi</h3>${laba()}</div>`;
  let rows = [],
    head = "";
  if (S.report === "stok") {
    head = "<th>Kode</th><th>Nama</th><th>Stok</th><th>Nilai Persediaan</th>";
    rows = S.products.map((p) => `<tr><td>${esc(p.code)}</td><td>${esc(p.name)}</td><td>${p.stock}</td><td>${rupiah(p.stock * p.buy)}</td></tr>`);
  }
  if (S.report === "masuk") {
    head = "<th>Tanggal</th><th>Barang</th><th>Qty</th><th>Supplier</th>";
    rows = S.incoming.map((x) => `<tr><td>${esc(x.date)}</td><td>${esc(x.name)}</td><td>${x.qty}</td><td>${esc(x.supplier || "-")}</td></tr>`);
  }
  if (S.report === "keluar") {
    head = "<th>Tanggal</th><th>Barang</th><th>Qty</th><th>Total</th>";
    rows = S.outgoing.map((x) => `<tr><td>${esc(x.date)}</td><td>${esc(x.name)}</td><td>${x.qty}</td><td>${rupiah(x.total)}</td></tr>`);
  }
  if (S.report === "opname") {
    head = "<th>Tanggal</th><th>Barang</th><th>Sistem</th><th>Fisik</th><th>Selisih</th>";
    rows = S.opname.map((x) => `<tr><td>${esc(x.date)}</td><td>${esc(x.name)}</td><td>${x.system}</td><td>${x.physical}</td><td>${x.diff}</td></tr>`);
  }
  return `<div class="card"><div class="card-head"><h3>${{ stok: "Laporan Stok", masuk: "Laporan Barang Masuk", keluar: "Laporan Barang Keluar", opname: "Laporan Stock Opname" }[S.report]}</h3><button class="secondary" data-exportreport>Export CSV</button></div><table class="table"><thead><tr>${head}</tr></thead><tbody>${rows.join("") || "<tr><td colspan=6 class=empty>Belum ada data</td></tr>"}</tbody></table></div>`;
}
function bioForm(prefix, data, opts = {}) {
  const readOnly = opts.readOnly ? " readonly" : "";
  const title = opts.title || "Biodata";
  const emailLabel = opts.emailLabel || "Email";
  return `<div class="profile-shell">
   <div class="profile-banner"><div class="profile-avatar photo-3x4">${
     data.photo
       ? `<img src="${esc(data.photo)}" alt="Foto profil 3x4">`
       : esc(
           (data.callName || data.name || "U")
             .split(/\s+/)
             .map((x) => x[0])
             .slice(0, 2)
             .join("")
             .toUpperCase(),
         )
   }</div><div><h3>${esc(title)}</h3><p class="muted">Lengkapi data diri anda.</p></div></div>
   <div class="form-grid">
    <label>Nama lengkap<input id="${prefix}-name" value="${esc(data.name || "")}"${readOnly}></label>
    <label>Nama panggilan<input id="${prefix}-call" value="${esc(data.callName || "")}"${readOnly}></label>
    <label>Tempat lahir<input id="${prefix}-birthplace" value="${esc(data.birthplace || "")}"${readOnly}></label>
    <label>Tanggal lahir<input id="${prefix}-birthdate" type="date" value="${esc(data.birthdate || "")}"${readOnly}></label>
    <label>Jenis kelamin<select id="${prefix}-gender"${opts.readOnly ? " disabled" : ""}><option value="">Pilih</option><option value="Laki-laki" ${data.gender === "Laki-laki" ? "selected" : ""}>Laki-laki</option><option value="Perempuan" ${data.gender === "Perempuan" ? "selected" : ""}>Perempuan</option></select></label>
    <label>No. telepon<input id="${prefix}-phone" value="${esc(data.phone || "")}"${readOnly}></label>
    <label>${emailLabel}<input id="${prefix}-email" type="email" value="${esc(data.email || "")}"${readOnly}></label>
    <label>Alamat<input id="${prefix}-address" value="${esc(data.address || "")}"${readOnly}></label>
    <label>Pendidikan<input id="${prefix}-education" value="${esc(data.education || "")}"${readOnly}></label>
    <label>Keahlian<input id="${prefix}-skills" value="${esc(data.skills || "")}"${readOnly}></label>
    <label class="wide">Foto profil
      ${opts.readOnly ? `<div class="photo-readonly">${data.photo ? `<img src="${esc(data.photo)}" alt="Foto profil kasir 3x4"><span>Foto profil 3x4</span>` : `<span>Belum ada foto profil</span>`}</div>` : `<input id="${prefix}-photo-file" type="file" accept="image/*"><small class="muted">Pilih foto dari perangkat. Foto akan disimpan sebagai foto profil 3x4.</small>`}
    </label>
   </div>
 </div>`;
}
function readBio(prefix, base = {}) {
  return {
    ...base,
    name: $(prefix + "-name")?.value.trim() || "",
    callName: $(prefix + "-call")?.value.trim() || "",
    birthplace: $(prefix + "-birthplace")?.value.trim() || "",
    birthdate: $(prefix + "-birthdate")?.value || "",
    gender: $(prefix + "-gender")?.value || "",
    phone: $(prefix + "-phone")?.value.trim() || "",
    email: $(prefix + "-email")?.value.trim() || "",
    address: $(prefix + "-address")?.value.trim() || "",
    education: $(prefix + "-education")?.value.trim() || "",
    skills: $(prefix + "-skills")?.value.trim() || "",
    photo: base.photo || "",
    updatedAt: new Date().toISOString(),
  };
}
function pengaturan() {
  if (S.user.role === "admin") {
    const a = { ...ADMIN_PROFILE_DEFAULT, ...S.adminProfile };
    return `<div class="settings-section"><div class="section-heading"><div><h2>👨‍💼 Data Diri Admin</h2><p class="muted">Profil pribadi administrator.</p></div><span class="profile-tag">ADMIN</span></div>
   <div class="card profile-card">${bioForm("adminbio", a, { title: "Biodata Administrator", emailLabel: "Email" })}<div class="actions profile-actions"><button class="primary" data-save-adminbio>💾 Simpan Data Diri</button></div></div>
  </div>
  <div class="card settings-card"><div class="card-head"><div><h3>👥 Rekrut & Kelola Kasir</h3><div class="muted"> Password kasir baru: <b>kasir123</b>.</div></div></div>
   <div class="form-grid"><label>Nama Lengkap<input id="cashierName" placeholder="Nama kasir"></label><label>Email Pribadi<input id="cashierEmail" type="email" placeholder="nama@email.com"></label><label style="align-self:end"><button class="primary" data-addcashier>＋ Rekrut Kasir</button></label></div>
   <div class="table-wrap"><table class="table"><thead><tr><th>Nama</th><th>Email</th><th>Role</th><th>Status</th><th>Aksi</th></tr></thead><tbody>
   ${
     S.users
       .filter((u) => u.role === "kasir")
       .map((u) => {
         const pr = JSON.parse(localStorage.getItem("mb_v31_profiles") || "{}")[u.id] || {};
         return `<tr><td><b>${esc(pr.name || u.name)}</b>${pr.callName ? `<small style="display:block;color:var(--muted)">${esc(pr.callName)}</small>` : ""}</td><td>${esc(u.email)}</td><td>Kasir</td><td><span class="badge ${u.active ? "ok" : "low"}">${u.active ? "Aktif" : "Nonaktif"}</span></td><td><button class="secondary" data-viewbio="${esc(u.id)}">👁️ Lihat Biodata</button> <button class="secondary" data-toggleuser="${esc(u.id)}">${u.active ? "Nonaktifkan" : "Aktifkan"}</button> <button class="secondary danger" data-deleteuser="${esc(u.id)}">Hapus</button></td></tr>`;
       })
       .join("") || "<tr><td colspan=5 class=empty>Belum ada kasir.</td></tr>"
   }
   </tbody></table></div>
  </div>`;
  }
  const u = S.user;
  const profiles = JSON.parse(localStorage.getItem("mb_v31_profiles") || "{}");
  const d = { name: u.name, email: u.email, ...(profiles[u.id] || {}) };
  return `<div class="settings-section"><div class="section-heading"><div><h2>👤 Data Diri Saya</h2></div><span class="profile-tag">KASIR</span></div>
   <div class="card profile-card">${bioForm("mybio", d, { title: "Biodata Kasir", emailLabel: "Email kontak" })}<div class="info-note">🔒 Email login akun tetap <b>${esc(u.email)}</b>. Jika Anda mengisi Email kontak, data tersebut hanya untuk biodata.</div><div class="actions profile-actions"><button class="primary" data-save-mybio>💾 Simpan Biodata Saya</button></div></div>
  </div>`;
}
function viewCashierBio(id) {
  if (S.user?.role !== "admin") return;
  const u = S.users.find((x) => x.id === id);
  if (!u) return;
  const profiles = JSON.parse(localStorage.getItem("mb_v31_profiles") || "{}");
  const d = { name: u.name, email: u.email, ...(profiles[id] || {}) };
  const m = modal("Biodata Kasir", `<div class="profile-view-wrap">${bioForm("viewbio", d, { title: "Biodata " + (d.name || u.name), emailLabel: "Email", readOnly: true })}</div>`, () => {});
  const submit = m.querySelector(".submit");
  if (submit) submit.style.display = "none";
  const cancel = m.querySelector(".cancel");
  if (cancel) cancel.textContent = "Tutup";
}
function saveAdminBio() {
  const base = { ...S.adminProfile },
    file = $("adminbio-photo-file")?.files?.[0];
  const done = () => {
    S.adminProfile = readBio("adminbio", base);
    const au = S.users.find((x) => x.id === "admin");
    if (au && S.adminProfile.name) {
      au.name = S.adminProfile.name;
      S.user.name = S.adminProfile.name;
      sessionStorage.setItem("mb3_user", JSON.stringify(S.user));
    }
    save();
    show();
    toast("Data diri admin tersimpan");
  };
  if (file) {
    if (!file.type.startsWith("image/")) return toast("File harus berupa gambar");
    if (file.size > 3 * 1024 * 1024) return toast("Ukuran foto 3x4 (3Mb)");
    const r = new FileReader();
    r.onload = () => {
      base.photo = r.result;
      done();
    };
    r.readAsDataURL(file);
  } else done();
}
function saveMyBio() {
  const key = "mb_v31_profiles",
    all = JSON.parse(localStorage.getItem(key) || "{}"),
    base = { ...all[S.user.id], name: $("mybio-name").value.trim() || S.user.name, email: $("mybio-email").value.trim() || S.user.email };
  const file = $("mybio-photo-file")?.files?.[0];
  const done = () => {
    all[S.user.id] = readBio("mybio", base);
    localStorage.setItem(key, JSON.stringify(all));
    show();
    toast("Biodata berhasil disimpan");
  };
  if (file) {
    if (!file.type.startsWith("image/")) return toast("File harus berupa gambar");
    if (file.size > 3 * 1024 * 1024) return toast("Ukuran foto 3x4 (3MB)");
    const r = new FileReader();
    r.onload = () => {
      base.photo = r.result;
      done();
    };
    r.readAsDataURL(file);
  } else done();
}
function bind() {
  document.querySelectorAll("[data-pagego]").forEach(
    (b) =>
      (b.onclick = () => {
        S.page = b.dataset.pagego;
        nav();
        render();
      }),
  );
  const search = $("search");
  if (search)
    search.oninput = (e) => {
      S.search = e.target.value;
      S.pageNo = 1;
      render();
    };
  document.querySelectorAll("[data-page]").forEach(
    (b) =>
      (b.onclick = () => {
        S.pageNo = +b.dataset.page;
        render();
      }),
  );
  document.querySelectorAll("[data-edit]").forEach((b) => (b.onclick = () => edit(+b.dataset.edit)));
  document.querySelectorAll("[data-del]").forEach(
    (b) =>
      (b.onclick = () => {
        if (confirm("Hapus barang ini?")) {
          S.products.splice(+b.dataset.del, 1);
          save();
          render();
          toast("Barang dihapus");
        }
      }),
  );
  const ap = document.querySelector("[data-addproduct]");
  if (ap)
    ap.onclick = () =>
      modal("Tambah Barang", productForm(), (m) => {
        const p = form(m);
        if (!p.code || !p.name) return toast("Kode dan nama wajib diisi");
        if (S.products.some((x) => x.code === p.code)) return toast("Kode barang sudah ada");
        S.products.push(p);
        save();
        m.remove();
        render();
        toast("Barang berhasil ditambahkan");
      });
  const ex = document.querySelector("[data-export]");
  if (ex) ex.onclick = () => download([["Kode", "Nama", "Merek", "Satuan", "Stok", "Harga Beli", "Harga Jual"], ...S.products.map((p) => [p.code, p.name, p.brand, p.unit, p.stock, p.buy, p.sell])], "data-barang.csv");
  document.querySelectorAll("[data-cart]").forEach((b) => (b.onclick = () => addCart(+b.dataset.cart)));
  document.querySelectorAll("[data-plus]").forEach((b) => (b.onclick = () => qtyCart(+b.dataset.plus, 1)));
  document.querySelectorAll("[data-minus]").forEach((b) => (b.onclick = () => qtyCart(+b.dataset.minus, -1)));
  const co = document.querySelector("[data-checkout]");
  if (co) co.onclick = checkout;
  const ks = $("kasirSearch");
  if (ks)
    ks.oninput = (e) => {
      const q = e.target.value.toLowerCase();
      document.querySelectorAll("#kasirProducts .summary-pill").forEach((x) => (x.style.display = x.textContent.toLowerCase().includes(q) ? "flex" : "none"));
    };
  const mv = document.querySelector("[data-move]");
  if (mv) mv.onclick = () => movementModal(mv.dataset.move === "in");
  document.querySelectorAll(".op").forEach(
    (x) =>
      (x.oninput = () => {
        const i = +x.dataset.i;
        $("dif" + i).textContent = +x.value - S.products[i].stock;
      }),
  );
  const sop = document.querySelector("[data-saveop]");
  if (sop) sop.onclick = saveOpname;
  document.querySelectorAll("[data-report]").forEach(
    (x) =>
      (x.onclick = () => {
        S.report = x.dataset.report;
        render();
      }),
  );
  const er = document.querySelector("[data-exportreport]");
  if (er) er.onclick = () => exportReport();
  const ei = document.querySelector("[data-exportin]");
  if (ei) ei.onclick = () => download([["Tanggal", "Barang", "Qty", "Supplier"], ...S.incoming.map((x) => [x.date, x.name, x.qty, x.supplier])], "barang-masuk.csv");
  const eo = document.querySelector("[data-exportout]");
  if (eo) eo.onclick = () => download([["Tanggal", "Barang", "Qty", "Total", "Modal"], ...S.outgoing.map((x) => [x.date, x.name, x.qty, x.total, x.cost])], "barang-keluar.csv");
  const ep = document.querySelector("[data-exportprofit]");
  if (ep) ep.onclick = () => download([["Tanggal", "Barang", "Qty", "Penjualan", "Modal", "Laba"], ...S.outgoing.map((x) => [x.date, x.name, x.qty, x.total, x.cost, x.total - x.cost])], "laba-rugi.csv");
  const sab = document.querySelector("[data-save-adminbio]");
  if (sab) sab.onclick = () => saveAdminBio();
  const smb = document.querySelector("[data-save-mybio]");
  if (smb) smb.onclick = () => saveMyBio();
  document.querySelectorAll("[data-viewbio]").forEach((b) => (b.onclick = () => viewCashierBio(b.dataset.viewbio)));
  const ac = document.querySelector("[data-addcashier]");
  if (ac) ac.onclick = addCashier;
  document.querySelectorAll("[data-toggleuser]").forEach(
    (b) =>
      (b.onclick = () => {
        const u = S.users.find((x) => x.id === b.dataset.toggleuser);
        if (u) {
          u.active = !u.active;
          save();
          render();
          toast("Status kasir diperbarui");
        }
      }),
  );
  document.querySelectorAll("[data-deleteuser]").forEach(
    (b) =>
      (b.onclick = () => {
        if (confirm("Hapus akun kasir ini?")) {
          S.users = S.users.filter((x) => x.id !== b.dataset.deleteuser);
          save();
          render();
          toast("Akun kasir dihapus");
        }
      }),
  );
}
function edit(i) {
  const m = modal("Edit Barang", productForm(S.products[i]), (m) => {
    const p = form(m);
    if (!p.code || !p.name) return toast("Kode dan nama wajib diisi");
    S.products[i] = p;
    save();
    m.remove();
    render();
    toast("Barang diperbarui");
  });
}
function addCart(i) {
  const p = S.products[i],
    x = S.cart.find((x) => x.code === p.code);
  if ((x?.qty || 0) >= p.stock) return toast("Jumlah melebihi stok");
  x ? x.qty++ : S.cart.push({ ...p, qty: 1 });
  render();
}
function qtyCart(i, d) {
  const x = S.cart[i],
    p = S.products.find((p) => p.code === x.code);
  if (d > 0 && x.qty >= p.stock) return toast("Stok tidak cukup");
  x.qty += d;
  if (x.qty <= 0) S.cart.splice(i, 1);
  render();
}
function checkout() {
  if (!S.cart.length) return toast("Keranjang masih kosong");
  const date = $("saleDate")?.value || localDate();
  if (!date) return toast("Tanggal transaksi wajib diisi");
  for (const x of S.cart) {
    const p = S.products.find((p) => p.code === x.code);
    if (!p || x.qty > p.stock) return toast("Stok tidak cukup untuk " + x.name);
  }
  const no = "TRX-" + Date.now().toString().slice(-8),
    cashier = S.user.name;
  const items = S.cart.map((x) => ({ code: x.code, name: x.name, qty: x.qty, price: x.sell, buy: x.buy }));
  items.forEach((x) => {
    const p = S.products.find((p) => p.code === x.code);
    p.stock -= x.qty;
    S.outgoing.unshift({ date: fmtDate(date), dateISO: date, name: p.name, qty: x.qty, total: x.qty * p.sell, cost: x.qty * p.buy, note: "Penjualan kasir", transactionNo: no, cashier });
  });
  const receiptData = { no, date, cashier, items, total: items.reduce((a, x) => a + x.qty * x.price, 0) };
  S.cart = [];
  save();
  render();
  toast("Transaksi berhasil disimpan");
  showReceipt(receiptData);
}
function movementModal(isIn) {
  const body = `<div class="form-grid"><label>Tanggal & waktu<input id="mvdate" type="datetime-local" value="${localDate()}T${pad(new Date().getHours())}:${pad(new Date().getMinutes())}" ></label><label>Barang<select id="mvproduct">${S.products.map((p, i) => `<option value="${i}">${esc(p.name)} — stok ${p.stock}</option>`).join("")}</select></label><label>Qty<input id="mvqty" type="number" min="1" value="1"></label>${isIn ? '<label>Supplier<input id="mvsupplier"></label>' : ""}<label class="wide">Keterangan<input id="mvnote"></label></div>`;
  modal(isIn ? "Catat Barang Masuk" : "Catat Barang Keluar", body, (m) => {
    const date = $("mvdate").value || localDate(),
      p = S.products[+$("mvproduct").value],
      q = +$("mvqty").value;
    if (q < 1) return toast("Qty harus lebih dari 0");
    if (!isIn && q > p.stock) return toast("Stok tidak cukup");
    if (isIn) {
      p.stock += q;
      S.incoming.unshift({ date: fmtDate(date), dateISO: date, name: p.name, qty: q, supplier: $("mvsupplier").value, note: $("mvnote").value });
    } else {
      p.stock -= q;
      S.outgoing.unshift({ date: fmtDate(date), dateISO: date, name: p.name, qty: q, total: q * p.sell, cost: q * p.buy, note: $("mvnote").value, transactionNo: "OUT-" + Date.now().toString().slice(-8), cashier: S.user.name });
    }
    save();
    m.remove();
    render();
    toast("Transaksi tersimpan");
  });
}
function saveOpname() {
  const date = $("opDate")?.value || localDate();
  document.querySelectorAll(".op").forEach((x) => {
    const i = +x.dataset.i,
      physical = +x.value,
      system = S.products[i].stock;
    if (physical !== system) {
      S.opname.unshift({ date: fmtDate(date), dateISO: date, name: S.products[i].name, system, physical, diff: physical - system, note: document.querySelector(`.opnote[data-i="${i}"]`).value });
      S.products[i].stock = physical;
    }
  });
  save();
  render();
  toast("Stock opname tersimpan");
}
function addCashier() {
  const name = $("cashierName").value.trim(),
    email = $("cashierEmail").value.trim().toLowerCase();
  if (!name || !email) return toast("Nama dan email wajib diisi");
  if (S.users.some((u) => u.email.toLowerCase() === email)) return toast("Email sudah terdaftar");
  S.users.push({ id: "kasir-" + Date.now(), name, email, password: "kasir123", role: "kasir", active: true });
  save();
  render();
  toast("Kasir berhasil direkrut. Password: kasir123");
}
function showReceipt(r) {
  const div = document.createElement("div");
  div.className = "modal receipt-modal";
  div.innerHTML = `<div class="modal-box receipt-box"><div class="modal-head"><h3>🧾 Struk Pembelian</h3><button class="x">×</button></div><div id="receiptPrint">${receiptHTML(r)}</div><div class="actions"><button class="secondary cancel">Tutup</button><button class="primary" id="printReceipt">🖨️ Cetak Struk</button></div></div>`;
  document.body.appendChild(div);
  div.querySelector(".x").onclick = () => div.remove();
  div.querySelector(".cancel").onclick = () => div.remove();
  div.querySelector("#printReceipt").onclick = () => printReceipt(r);
}
function receiptHTML(r) {
  const p = { storeName: "Manajemen Barang", address: "" };
  return `<div class="receipt"><h2>${esc(p.storeName)}</h2><div class="receipt-center">${esc(p.address)}</div><div class="receipt-center receipt-title">STRUK PEMBELANJAAN</div>
 <div class="receipt-meta">No. Transaksi: <b>${esc(r.no)}</b><br>Tanggal: ${esc(fmtDate(r.date))}<br>Kasir: ${esc(r.cashier)}</div>
 ${r.items.map((x) => `<div class="receipt-item"><b>${esc(x.name)}</b><div class="receipt-row"><span>${x.qty} × ${rupiah(x.price)}</span><span>${rupiah(x.qty * x.price)}</span></div></div>`).join("")}
 <div class="receipt-row receipt-total"><b>TOTAL</b><b>${rupiah(r.total)}</b></div><div class="receipt-center receipt-thanks">Terima kasih telah berbelanja.</div></div>`;
}
function printReceipt(r) {
  const w = window.open("", "_blank", "width=420,height=700");
  if (!w) return toast("Popup diblokir. Izinkan popup untuk mencetak struk.");
  w.document.write(
    `<html><head><title>Struk ${esc(r.no)}</title><style>body{font-family:Arial;margin:20px}.receipt-logo{max-width:65px;max-height:65px;display:block;margin:auto}.receipt h2{text-align:center;margin:5px}.receipt-center{text-align:center;font-size:11px}.receipt-title{font-weight:bold;margin:8px}.receipt-meta{border-top:1px dashed #888;border-bottom:1px dashed #888;padding:8px 0;font-size:12px}.receipt-item{font-size:12px;margin:8px 0}.receipt-row{display:flex;justify-content:space-between}.receipt-total{border-top:1px dashed #888;padding-top:8px;margin-top:10px}.receipt-thanks{margin-top:15px}</style></head><body>${receiptHTML(r)}</body></html>`,
  );
  w.document.close();
  setTimeout(() => {
    w.focus();
    w.print();
  }, 250);
}
function exportReport() {
  if (S.report === "stok") download([["Kode", "Nama", "Stok", "Nilai"], ...S.products.map((p) => [p.code, p.name, p.stock, p.stock * p.buy])], "laporan-stok.csv");
  else if (S.report === "masuk") download([["Tanggal", "Barang", "Qty", "Supplier"], ...S.incoming.map((x) => [x.date, x.name, x.qty, x.supplier])], "laporan-masuk.csv");
  else if (S.report === "keluar") download([["Tanggal", "Barang", "Qty", "Total"], ...S.outgoing.map((x) => [x.date, x.name, x.qty, x.total])], "laporan-keluar.csv");
  else if (S.report === "opname") download([["Tanggal", "Barang", "Sistem", "Fisik", "Selisih"], ...S.opname.map((x) => [x.date, x.name, x.system, x.physical, x.diff])], "laporan-opname.csv");
}
function download(rows, name) {
  const csv = rows.map((r) => r.map((v) => `"${String(v ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  a.download = name;
  a.click();
  toast("File " + name + " dibuat");
}
init();
