// frontend/js/router.js

// 1. TAMPLATES ZA MAUDHUI (Hapa ndipo tutakapoweka HTML ya kila ukurasa)
const VIEWS = {
    'admin-dash': {
        title: "Admin Dashboard",
        subtitle: "Karibu kwenye mfumo wa uendeshaji wa SmartBiz",
        render: () => {
            // Tunapakia data na grafu mara moja kwa mpangilio sahihi bila kuingiliana
            setTimeout(async () => {
                try {
                    // 1. Vuta data za kadi na majedwali kwanza
                    await fetchAdvancedDashboardAnalytics();
                    // 2. Chora grafu baada ya data kukamilika
                    await renderAutomatedDashboardCharts();
                } catch (err) {
                    console.error("Upakiaji wa Dashboard ulifeli:", err);
                }
            }, 100);

            return `
            <!-- KADI NNE ZA TAKWIMU -->
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="card-details">
                        <span class="card-title">Mauzo ya Leo</span>
                        <h2 class="card-value" id="dashTodaySales">TSH 0</h2>
                        <span class="card-trend up"><span class="trend-icon">▲</span> Live</span>
                    </div>
                    <div class="card-icon bg-teal-light">💰</div>
                </div>
                <div class="metric-card">
                    <div class="card-details">
                        <span class="card-title">Faida ya Leo (Net)</span>
                        <h2 class="card-value" id="dashTodayProfit">TSH 0</h2>
                        <span class="card-trend up"><span class="trend-icon">▲</span> Faida</span>
                    </div>
                    <div class="card-icon bg-blue-light">📈</div>
                </div>
                <div class="metric-card">
                    <div class="card-details">
                        <span class="card-title">Jumla ya Bidhaa</span>
                        <h2 class="card-value" id="dashTotalProducts">0</h2>
                        <span class="card-trend warning" id="dashLowStockTag"><span class="trend-icon">⚠️</span> 0 Zimeisha</span>
                    </div>
                    <div class="card-icon bg-orange-light">📦</div>
                </div>
                <div class="metric-card">
                    <div class="card-details">
                        <span class="card-title">Hali ya Mfumo</span>
                        <h2 class="card-value" style="font-size: 1.3rem; color: #0d9488;">Salama</h2>
                        <span class="card-trend up"><span class="trend-icon">●</span> SQLite Active</span>
                    </div>
                    <div class="card-icon bg-purple-light">🛡️</div>
                </div>
            </div>

            <div style="display: flex; justify-content: flex-end; margin-top: 1rem; margin-bottom: 0.5rem; padding: 0 1rem;">
            <button onclick="triggerEndOfDayClose()" style="background: #f97316; color: #fff; border: none; padding: 10px 18px; border-radius: 6px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
                 🔒 Funga Duka & Tuma Ripoti Barua Pepe
            </button>
            </div>
    

            <!-- SEHEMU YA GRAFU MBILI -->
            <div class="dashboard-data-grid" style="grid-template-columns: 1.5fr 1fr; gap: 1.5rem; margin-top: 1.5rem; margin-bottom: 1.5rem;">
                <div class="data-card" style="padding: 1.25rem; background: #fff; border-radius: 8px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); border: 1px solid #e2e8f0;">
                    <div class="card-header" style="margin-bottom: 1rem; padding-bottom: 0;">
                        <h3 style="font-size: 1rem; font-weight: 700; color: #1e293b; margin: 0;">Mwenendo wa Mauzo na Faida (Sales & Profit)</h3>
                    </div>
                    <div style="position: relative; height: 260px; width: 100%;">
                        <canvas id="salesProfitChart"></canvas>
                    </div>
                </div>

                <div class="data-card" style="padding: 1.25rem; background: #fff; border-radius: 8px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); border: 1px solid #e2e8f0;">
                    <div class="card-header" style="margin-bottom: 1rem; padding-bottom: 0;">
                        <h3 style="font-size: 1rem; font-weight: 700; color: #1e293b; margin: 0;">Madeni ya Wateja Nje (Outstanding Payments)</h3>
                    </div>
                    <div style="position: relative; height: 260px; width: 100%;">
                        <canvas id="outstandingChart"></canvas>
                    </div>
                </div>
            </div>
            
            <!-- MAJEDWALI YA DATA -->
            <div class="dashboard-data-grid">
                <div class="data-card transactions-card">
                    <div class="card-header">
                        <h3>Miamala ya Hivi Karibuni</h3>
                    </div>
                    <div class="table-responsive">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>ID ya Risiti</th>
                                    <th>Tarehe & Muda</th>
                                    <th>Jumla Kuu</th>
                                    <th>Hali</th>
                                </tr>
                            </thead>
                            <tbody id="dashRecentTransactionsTable">
                                <tr><td colspan="4" style="text-align:center; color:#64748b;">Inapakia miamala...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="data-card products-card">
                    <div class="card-header">
                        <h3>Bidhaa Zinazoongoza (Top Moving)</h3>
                    </div>
                    <div class="top-products-list" id="dashTopProductsList">
                        <p style="color:#64748b; padding: 1rem;">Inapakia bidhaa zinazoongoza...</p>
                    </div>
                </div>
            </div>

            
            `;
        }
    },


    // frontend/js/router.js - Badilisha tu ile sehemu ya 'pos' kuwa hivi:
    'pos': {
        title: "Point of Sale (POS)",
        subtitle: "Uza bidhaa kwa haraka na kutoa risiti za miamala",
        render: () => {
            // Tunaita function ya kuvuta bidhaa sekunde chache baada ya HTML kuwa live skrini
            setTimeout(() => {
                posFetchLiveProducts();
                
                // REKEBISHO LA NYONGEZA: Unganisha kisanduku cha kutafuta bidhaa live
                const posSearch = document.getElementById("posSearchInput");
                if (posSearch) {
                    posSearch.addEventListener("input", (e) => {
                        posFetchLiveProducts(e.target.value);
                    });
                }
            }, 50);

            return `
            <div class="dashboard-data-grid" style="grid-template-columns: 1.8fr 1.2fr; gap: 1.5rem; margin-top: 1rem;">
                
                <!-- SEHEMU YA KUSHOTO: UTAFUTAJI NA GRIDI YA BIDHAA -->
                <div class="data-card" style="background: none; box-shadow: none; padding: 0; border: none;">
                    
                    <!-- BAR YA UTAFUTAJI -->
                    <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; background: #fff; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <!-- REKEBISHO: Hakikisha id hii ya posSearchInput ipo hapa -->
                        <input type="text" id="posSearchInput" placeholder="Tafuta kwa jina au barcode..." class="pos-search-field" style="flex: 1; padding: 0.75rem 1rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.95rem;">
                        <select class="pos-search-field" style="width: 180px; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 6px; background: #fff; font-size: 0.95rem;">
                            <option>Kategoria Zote</option>
                        </select>
                    </div>

                    <!-- GRIDI YA BIDHAA LIVE KUTOKA SQULITE -->
                    <!-- SULUHISHO: Tumehakikisha kuwa id ni posLiveProductsGrid ili ilingane na posFetchLiveProducts -->
                    <div id="posLiveProductsGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1rem; min-height: 400px;">
                        <p style="color: #64748b; padding: 1rem;">Inapakia bidhaa kutoka kwenye mfumo...</p>
                    </div>
                </div>

                <!-- SEHEMU YA KULIA: TOROLI LA MANUNUZI (Hili libaki kama lilivyokuwa) -->
                <div class="data-card" style="padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between; min-height: 500px; background: #fff; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.5rem;">
                            <h3 style="font-size: 1.1rem; font-weight: 700; margin: 0;">Toroli la Manunuzi</h3>
                            <button onclick="posClearCart()" style="background: none; border: none; color: #ef4444; font-size: 0.85rem; cursor: pointer; font-weight: 600;">Futa Zote</button>
                        </div>
                        
                        <!-- LIST YA VITU KWENYE TOROLI -->
                        <div id="posCartItemsList" style="max-height: 280px; overflow-y: auto; margin-bottom: 1rem;">
                            <p style="text-align: center; color: #94a3b8; padding: 3rem 0; font-size: 0.9rem;">
                                Toroli lipo wazi. Bonyeza bidhaa kuongeza kwenye risiti.
                            </p>
                        </div>
                    </div>

                    <!-- MUHTASARI WA BEI NA KITUFE CHA KULIPIA -->
                    <div style="border-top: 1px dashed #e2e8f0; padding-top: 1rem;">
                        <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 0.4rem; color: #64748b;">
                            <span>Jumla Ndogo (Subtotal)</span>
                            <span id="posSubtotalLabel">TSH 0</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 0.8rem; align-items: center; color: #64748b;">
                            <span>Punguzo (Discount)</span>
                            <input type="number" id="posDiscountInput" value="0" min="0" oninput="posCalculateCartTotals()" style="width: 80px; padding: 4px 8px; border: 1px solid #cbd5e1; border-radius: 4px; text-align: right; font-size: 0.9rem;">
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 1.2rem; font-weight: 800; margin-bottom: 1rem; color: #1e293b; border-top: 1px solid #f1f5f9; padding-top: 0.5rem;">
                            <span>Jumla Kuu (Total)</span>
                            <span id="posTotalLabel" style="color: #0d9488;">TSH 0</span>
                        </div>
                        <button onclick="posProcessPayment()" class="btn-checkout-pay" style="width: 100%; padding: 0.85rem; font-size: 1rem; font-weight: 700; border-radius: 6px; display: flex; justify-content: center; align-items: center; gap: 8px;">
                            💳 Kamilisha Malipo & Toa Risiti
                        </button>
                    </div>
                </div>

            </div>
            `;
        }
    },

    'sales': {
        title: "Sales & Invoices",
        subtitle: "Angalia historia ya mauzo yote na uchapishe risiti",
        render: () => {
            // Pakia data za miamala mara baada ya ukurasa kuwekwa kwenye skrini
            setTimeout(() => fetchAllSystemSales(), 50);
            
            return `
            <!-- KADI ZA MUHTASARI WA MAUZO -->
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="card-details">
                        <span class="card-title">Idadi ya Risiti (Leo)</span>
                        <h2 class="card-value" id="salesTotalInvoices">0</h2>
                        <span class="card-trend up"><span class="trend-icon">●</span> Miamala Halisi</span>
                    </div>
                    <div class="card-icon bg-blue-light">📄</div>
                </div>
                <div class="metric-card">
                    <div class="card-details">
                        <span class="card-title">Jumla ya Punguzo (Discount)</span>
                        <h2 class="card-value" id="salesTotalDiscount">TSH 0</h2>
                        <span class="card-trend warning"><span class="trend-icon">📉</span> Uliyotoa Leo</span>
                    </div>
                    <div class="card-icon bg-orange-light">🏷️</div>
                </div>
            </div>

            <!-- JEDWALI KUU LA HISTORIA YA MAUZO -->
            <div class="data-card" style="margin-top: 1.5rem;">
                <div class="card-header">
                    <h3>Kumbukumbu za Miamala na Mauzo</h3>
                    <div style="display: flex; gap: 0.5rem;">
                        <input type="text" id="salesSearchInput" oninput="fetchAllSystemSales(this.value)" placeholder="Tafuta kwa ID ya Risiti..." class="pos-search-field" style="max-width: 250px; padding: 0.5rem 0.75rem;">
                    </div>
                </div>
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>ID ya Risiti</th>
                                <th>Tarehe & Muda</th>
                                <th>Jumla Ndogo (Subtotal)</th>
                                <th>Punguzo (Discount)</th>
                                <th>Jumla Kuu (Paid)</th>
                                <th>Hali ya Malipo</th>
                                <th>Kitendo</th>
                            </tr>
                        </thead>
                        <tbody id="salesTableBody">
                            <tr><td colspan="7" style="text-align:center; color:#64748b;">Inapakia historia ya mauzo...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- MODAL POPUP YA KUONYESHA RISITI (INVOICE COMPONENT) -->
            <div id="invoiceModal" class="modal-overlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:9999; justify-content:center; align-items:center;">
                <div class="modal-content" style="background:#fff; padding:2rem; border-radius:8px; width:100%; max-width: 450px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                    <div style="text-align:center; border-bottom:2px dashed #e2e8f0; padding-bottom:1rem; margin-bottom:1rem;">
                        <h2 style="margin:0; color:#0f172a;">SmartBiz Pro</h2>
                        <p style="font-size:0.85rem; color:#64748b; margin:4px 0 0 0;">Anuani: Iyunga, Mbeya, Tanzania</p>
                        <p style="font-size:0.85rem; color:#64748b; margin:2px 0 0 0;">Simu: +255 123 456 789</p>
                    </div>
                    <div id="invoiceModalBody" style="font-size:0.9rem; color:#334155;">
                        <!-- Data za risiti zitaingia hapa kwa kutumia JavaScript -->
                    </div>
                    <div style="display:flex; gap:0.5rem; margin-top:1.5rem; border-top:1px solid #e2e8f0; padding-top:1rem;">
                        <button onclick="window.print()" class="btn-checkout-pay" style="background:#0f172a; padding:0.5rem 1rem; font-size:0.85rem;">🖨️ Chapisha</button>
                        <button onclick="document.getElementById('invoiceModal').style.display='none'" class="btn-checkout-pay" style="background:#ef4444; padding:0.5rem 1rem; font-size:0.85rem; margin-left:auto;">Funga</button>
                    </div>
                </div>
            </div>
            `;
        }
    },

    // NDANI YA const VIEWS = { ... } (Weka chini ya sales)

    'expenses': {
        title: "Expense Tracker",
        subtitle: "Dhibiti na urekodi matumizi yote ya uendeshaji wa biashara",
        render: () => {
            // Pakia data za matumizi mara baada ya ukurasa kuwekwa kwenye skrini
            setTimeout(() => fetchAllExpenses(), 50);
            
            return `
            <!-- KADI ZA MUHTASARI WA MATUMIZI -->
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="card-details">
                        <span class="card-title">Jumla ya Matumizi (Mwezi Huu)</span>
                        <h2 class="card-value" id="expTotalAmount">TSH 0</h2>
                        <span class="card-trend warning"><span class="trend-icon">●</span> Pesa Iliyotoka</span>
                    </div>
                    <div class="card-icon bg-red-light">💸</div>
                </div>
                <div class="metric-card">
                    <div class="card-details">
                        <span class="card-title">Miamala ya Matumizi</span>
                        <h2 class="card-value" id="expTotalCount">0</h2>
                        <span class="card-trend"><span class="trend-icon">📋</span> Kumbukumbu</span>
                    </div>
                    <div class="card-icon bg-blue-light">📝</div>
                </div>
            </div>

            <!-- SEHEMU KUU YA JEDWALI NA FOMU YA KUREKODI MATUMIZI -->
            <div class="dashboard-data-grid" style="grid-template-columns: 2.2fr 1fr; margin-top: 1.5rem;">
                
                <!-- JEDWALI LA MATUMIZI -->
                <div class="data-card">
                    <div class="card-header">
                        <h3>Historia ya Matumizi</h3>
                        <input type="text" id="expSearchInput" oninput="fetchAllExpenses(this.value)" placeholder="Tafuta kwa maelezo..." class="pos-search-field" style="max-width: 250px; padding: 0.5rem 0.75rem;">
                    </div>
                    <div class="table-responsive">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Tarehe</th>
                                    <th>Kundi (Category)</th>
                                    <th>Maelezo ya Matumizi</th>
                                    <th>Kiasi (Amount)</th>
                                    <th>Mrekodi</th>
                                    <th>Kitendo</th>
                                </tr>
                            </thead>
                            <tbody id="expensesTableBody">
                                <tr><td colspan="5" style="text-align:center; color:#64748b;">Inapakia matumizi...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- FOMU YA KUREKODI MATUMIZI MPYA -->
                <div class="data-card">
                    <div class="card-header" style="border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; margin-bottom: 1rem;">
                        <h3>+ Rekodi Matumizi Mapya</h3>
                    </div>
                    <form id="addExpenseForm" onsubmit="submitNewExpense(event)" style="display: flex; flex-direction: column; gap: 0.85rem;">
                        <div class="input-group" style="margin-bottom: 0;">
                            <label style="font-size: 0.8rem;">Kundi la Matumizi (Category)</label>
                            <select id="expCategory" required style="padding: 8px 12px; font-size: 0.9rem; border: 1px solid #ccc; border-radius: 4px; background: #fff;">
                                <option value="Vyakula / Vinywaji">Vyakula / Vinywaji</option>
                                <option value="Pango la Fremu">Pango la Fremu</option>
                                <option value="Luku / Umeme">Luku / Umeme</option>
                                <option value="Maji">Maji</option>
                                <option value="Usafiri / Nauli">Usafiri / Nauli</option>
                                <option value="Mishahara ya Wafanyakazi">Mishahara ya Wafanyakazi</option>
                                <option value="Ulinzi na Usalama">Ulinzi na Usalama</option>
                                <option value="Matengenezo ya Vifaa">Matengenezo ya Vifaa</option>
                                <option value="Mengineyo">Mengineyo</option>
                            </select>
                        </div>
                        <div class="input-group" style="margin-bottom: 0;">
                            <label style="font-size: 0.8rem;">Kiasi cha Pesa (TSH)</label>
                            <input type="number" id="expAmount" required min="1" placeholder="Mfano: 15000" style="padding: 8px 12px; font-size: 0.9rem;">
                        </div>
                        <div class="input-group" style="margin-bottom: 0;">
                            <label style="font-size: 0.8rem;">Maelezo ya Ziada</label>
                            <textarea id="expDescription" required placeholder="Mfano: Kulipia Luku ya mwezi wa Kumi" style="padding: 8px 12px; font-size: 0.9rem; min-height: 80px; font-family: inherit; border: 1px solid #ccc; border-radius: 4px; resize: none;"></textarea>
                        </div>
                        <button type="submit" class="btn-checkout-pay" style="padding: 0.75rem; margin-top: 0.5rem; font-size: 0.95rem; background: #ef4444;">
                            💸 Rekodi Matumizi
                        </button>
                    </form>
                </div>

            </div>
            `;
        }
    }, // <-- Weka koma hapa


    'inventory': {
        title: "Inventory & Stock Management",
        subtitle: "Dhibiti bidhaa, bei, na idadi ya stoki iliyobaki",
        render: () => {
            // Kupakia bidhaa na oda za kiotomatiki live
            setTimeout(() => {
                fetchInventoryProducts();
                fetchAutomatedPurchaseOrders();
            }, 50);
            
            return `
            <!-- KADI ZA MUHTASARI WA INVENTORY -->
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="card-details">
                        <span class="card-title">Jumla ya Aina za Bidhaa</span>
                        <h2 class="card-value" id="invTotalProducts">0</h2>
                        <span class="card-trend up"><span class="trend-icon">●</span> Kwenye Mfumo</span>
                    </div>
                    <div class="card-icon bg-blue-light">📦</div>
                </div>
                <div class="metric-card">
                    <div class="card-details">
                        <span class="card-title">Tahadhari ya Stoki (Low Stock)</span>
                        <h2 class="card-value" id="invLowStock">0</h2>
                        <span class="card-trend warning"><span class="trend-icon">⚠️</span> Inahitaji Kuongezwa</span>
                    </div>
                    <div class="card-icon bg-orange-light">📉</div>
                </div>
            </div>

            <!-- JEDWALI LA RIPOTI ZA KIOTOMATIKI -->
            <div class="data-card" style="margin-bottom: 1.5rem; border: 1px solid #ffedd5; background: #fffdfa;">
                <div class="card-header">
                    <h3 style="color: #c2410c;">🚨 Ripoti ya Oda za Manunuzi za Kiotomatiki (System Generated Orders)</h3>
                </div>
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>ID ya Oda</th>
                                <th>Jina la Bidhaa</th>
                                <th>Nambari ya SKU</th>
                                <th>Kiasi cha Kuagiza</th>
                                <th>Gharama ya Makadirio</th>
                                <th>Hali ya Oda</th>
                            </tr>
                        </thead>
                        <tbody id="automatedOrdersTableBody">
                            <tr><td colspan="6" style="text-align:center; color:#64748b;">Inapakia oda za kiotomatiki...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- GRIDI YA CHINI: INAYONGANISHA JEDWALI LA BIDHAA NA FOMU YA KUSAJILI -->
            <div class="dashboard-data-grid" style="grid-template-columns: 2.2fr 1fr; margin-top: 1.5rem;">
                
                <!-- JEDWALI LA BIDHAA ZOTE GHALANI -->
                <div class="data-card">
                    <div class="card-header">
                        <h3>Orodha ya Stoki Ghalani</h3>
                        <input type="text" id="invSearchInput" oninput="fetchInventoryProducts(this.value)" placeholder="Tafuta kwa jina au SKU..." class="pos-search-field" style="max-width: 250px; padding: 0.5rem 0.75rem;">
                    </div>
                    <div class="table-responsive">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Picha</th>
                                    <th>Jina la Bidhaa</th>
                                    <th>SKU</th>
                                    <th>Bei ya Kununua</th>
                                    <th>Bei ya Kuuza</th>
                                    <th>Stoki</th>
                                    <th>Hali</th>
                                    <th>Kitendo</th>
                                </tr>
                            </thead>
                            <tbody id="inventoryTableBody">
                                <tr><td colspan="7" style="text-align:center; color:#64748b;">Inapakia stoki kutoka SQLite...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- FOMU YA KUONGEZA BIDHAA MPYA -->
                <div class="data-card">
                    <div class="data-card-header" style="border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; margin-bottom: 1rem;">
                        <h3 style="font-size: 1.1rem; font-weight: 700;">+ Ongeza Bidhaa Mpya</h3>
                    </div>
                    <form id="addProductForm" onsubmit="submitNewProduct(event)" style="display: flex; flex-direction: column; gap: 0.85rem;">
                        <div class="input-group" style="margin-bottom: 0;">
                            <label style="font-size: 0.8rem;">Jina la Bidhaa</label>
                            <input type="text" id="invName" required style="padding: 8px 12px; font-size: 0.9rem;">
                        </div>
                        <div class="input-group" style="margin-bottom: 0;">
                            <label style="font-size: 0.8rem;">Nambari ya SKU</label>
                            <input type="text" id="invSku" required placeholder="Mfano: SKU-MZI-05" style="padding: 8px 12px; font-size: 0.9rem;">
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                            <div class="input-group" style="margin-bottom: 0;">
                                <label style="font-size: 0.8rem;">Bei ya Kununua</label>
                                <input type="number" id="invBuyingPrice" required min="0" style="padding: 8px 12px; font-size: 0.9rem;">
                            </div>
                            <div class="input-group" style="margin-bottom: 0;">
                                <label style="font-size: 0.8rem;">Bei ya Kuuza</label>
                                <input type="number" id="invSellingPrice" required min="0" style="padding: 8px 12px; font-size: 0.9rem;">
                            </div>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                            <div class="input-group" style="margin-bottom: 0;">
                                <label style="font-size: 0.8rem;">Idadi ya Stoki</label>
                                <input type="number" id="invStock" required min="0" style="padding: 8px 12px; font-size: 0.9rem;">
                            </div>
                            <div class="input-group" style="margin-bottom: 0;">
                                <label style="font-size: 0.8rem;">Kiwango cha Chini</label>
                                <input type="number" id="invThreshold" value="10" min="1" style="padding: 8px 12px; font-size: 0.9rem;">
                            </div>
                        </div>
                        <button type="submit" class="btn-checkout-pay" style="padding: 0.75rem; margin-top: 0.5rem; font-size: 0.95rem;">
                            💾 Hifadhi Kwenye Mfumo
                        </button>
                    </form>
                </div>

            </div>
            `;
        }
    },

    'hr-staff': {
        title: "HR & Role Access Management",
        subtitle: "Sajili wafanyakazi wapya na udhibiti viwango vyao vya ulinzi",
        render: () => {
            // Pakia orodha ya wafanyakazi mara baada ya skrini kufunguka
            setTimeout(fetchSystemStaffMembers, 50);
            
            return `
            <div class="dashboard-data-grid" style="grid-template-columns: 2fr 1.2fr; margin-top: 1.5rem;">
                
                <!-- JEDWALI LA WAFANYAKAZI WALIOP0 -->
                <div class="data-card">
                    <div class="card-header">
                        <h3>Orodha ya Wafanyakazi na Vyeo vyao</h3>
                    </div>
                    <div class="table-responsive">
                        <table class="data-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Email (Barua Pepe)</th>
                            <th>Cheo (Role)</th>
                            <th>Hali</th>
                            <th>Kitendo</th> <!-- Hakikisha nguzo hii ipo mwishoni -->
                        </tr>
                    </thead>                    
                            <tbody id="staffTableBody">
                                <tr><td colspan="5" style="text-align:center; color:#64748b;">Inapakia wafanyakazi...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- FOMU YA KUSAJILI MFANYAKAZI MPYA -->
                <div class="data-card">
                    <div class="card-header" style="border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; margin-bottom: 1rem;">
                        <h3>+ Sajili Mfanyakazi Mpya</h3>
                    </div>
                    <form id="addStaffForm" onsubmit="submitNewStaffMember(event)" style="display: flex; flex-direction: column; gap: 0.85rem;">
                        <div class="input-group" style="margin-bottom: 0;">
                            <label style="font-size: 0.8rem;">Jina la Mtumiaji (Username)</label>
                            <input type="text" id="staffUsername" required placeholder="Mfano: amina_cashier" style="padding: 8px 12px; font-size: 0.9rem;">
                        </div>
                        <div class="input-group" style="margin-bottom: 0;">
                            <label style="font-size: 0.8rem;">Barua Pepe (Email)</label>
                            <input type="email" id="staffEmail" required placeholder="amina@smartbiz.com" style="padding: 8px 12px; font-size: 0.9rem;">
                        </div>
                        <div class="input-group" style="margin-bottom: 0;">
                            <label style="font-size: 0.8rem;">Nenosiri la Kuingilia (Password)</label>
                            <input type="password" id="staffPassword" required placeholder="******" style="padding: 8px 12px; font-size: 0.9rem;">
                        </div>
                        <div class="input-group" style="margin-bottom: 0;">
                            <label style="font-size: 0.8rem;">Cheo cha Mfanyakazi (Role)</label>
                            <select id="staffRoleId" required style="padding: 8px 12px; font-size: 0.9rem; border: 1px solid #ccc; border-radius: 4px; background: #fff; width: 100%;">
                                <option value="3">Cashier (Point of Sale Tu)</option>
                                <option value="2">Manager (Usimamizi wa Stoki)</option>
                                <option value="1">Administrator (Mamlaka Kamili)</option>
                            </select>
                        </div>
                        <button type="submit" class="btn-checkout-pay" style="padding: 0.75rem; margin-top: 0.5rem; font-size: 0.95rem;">
                            👤 Kamilisha Usajili
                        </button>
                    </form>
                </div>

            </div>
            `;
        }
    },

    'customers': {
        title: "Customers Profile & Debt Management",
        subtitle: "Dhibiti taarifa za wateja wako na ufuatilie kumbukumbu za madeni yao",
        render: () => {
            setTimeout(fetchSystemCustomers, 50);
            return `
            <!-- KADI ZA MUHTASARI WA WATEJA -->
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="card-details">
                        <span class="card-title">Jumla ya Wateja</span>
                        <h2 class="card-value" id="custTotalCount">0</h2>
                        <span class="card-trend up"><span class="trend-icon">●</span> Active</span>
                    </div>
                    <div class="card-icon bg-blue-light">👥</div>
                </div>
                <div class="metric-card">
                    <div class="card-details">
                        <span class="card-title">Deni la Wateja Wote (Dukani)</span>
                        <h2 class="card-value" id="custTotalDebts" style="color: #ef4444;">TSH 0</h2>
                        <span class="card-trend down"><span class="trend-icon">▼</span> Pesa Iko Nje</span>
                    </div>
                    <div class="card-icon bg-orange-light">💸</div>
                </div>
            </div>

            <!-- SEHEMU KUU YA JEDWALI NA FOMU -->
            <div class="dashboard-data-grid" style="grid-template-columns: 2.2fr 1fr; margin-top: 1.5rem;">
                
                <!-- JEDWALI LA WATEJA -->
                <div class="data-card">
                    <div class="card-header">
                        <h3>Kumbukumbu za Wateja</h3>
                        <input type="text" id="custSearchInput" oninput="fetchSystemCustomers(this.value)" placeholder="Tafuta kwa jina au simu..." class="pos-search-field" style="max-width: 250px; padding: 0.5rem 0.75rem;">
                    </div>
                    <div class="table-responsive">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Jina la Mteja</th>
                                    <th>Nambari ya Simu</th>
                                    <th>Barua Pepe (Email)</th>
                                    <th>Deni Alilonalo</th>
                                    <th>Kitendo</th>
                                </tr>
                            </thead>
                            <tbody id="customersTableBody">
                                <tr><td colspan="5" style="text-align:center; color:#64748b;">Inapakia wateja...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- FOMU YA KUSAJILI MTEJA MPYA -->
                <div class="data-card">
                    <div class="card-header" style="border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; margin-bottom: 1rem;">
                        <h3>+ Sajili Mteja Mpya</h3>
                    </div>
                    <form id="addCustomerForm" onsubmit="submitNewCustomer(event)" style="display: flex; flex-direction: column; gap: 0.85rem;">
                        <div class="input-group" style="margin-bottom: 0;">
                            <label style="font-size: 0.8rem;">Jina Kamili</label>
                            <input type="text" id="custName" required placeholder="Mfano: Juma Shabani" style="padding: 8px 12px; font-size: 0.9rem;">
                        </div>
                        <div class="input-group" style="margin-bottom: 0;">
                            <label style="font-size: 0.8rem;">Nambari ya Simu</label>
                            <input type="text" id="custPhone" required placeholder="0712345678" style="padding: 8px 12px; font-size: 0.9rem;">
                        </div>
                        <div class="input-group" style="margin-bottom: 0;">
                            <label style="font-size: 0.8rem;">Barua Pepe (Sio Lazima)</label>
                            <input type="email" id="custEmail" placeholder="juma@gmail.com" style="padding: 8px 12px; font-size: 0.9rem;">
                        </div>
                        <div class="input-group" style="margin-bottom: 0;">
                            <label style="font-size: 0.8rem;">Kiasi cha Deni la Nyuma (Kama lipo)</label>
                            <input type="number" id="custDebt" value="0" min="0" style="padding: 8px 12px; font-size: 0.9rem;">
                        </div>
                        <button type="submit" class="btn-checkout-pay" style="padding: 0.75rem; margin-top: 0.5rem; font-size: 0.95rem;">
                            👥 Hifadhi Mteja
                        </button>
                    </form>
                </div>

            </div>
            `;
        }
    }



};

// 2. LOGIC YA ROUTER (KUBADILISHA UKURASA ULIOSAHIHISHWA)
// FUNCTION YA NAVIGATETO ILIYOSAHIHISHWA 100% (KUONDOA MKWAMO)
function navigateTo(pageKey) {
    const view = VIEWS[pageKey];
    if (!view) {
        console.error(`Ukurasa wa [${pageKey}] haujapatikana kwenye kiolezo!`);
        return;
    }

    // 1. Badilisha majina ya Vichwa vya habari vya juu ya Navbar
    if (document.getElementById("current-view-title")) {
        document.getElementById("current-view-title").innerText = view.title;
    }
    if (document.getElementById("current-view-subtitle")) {
        document.getElementById("current-view-subtitle").innerText = view.subtitle;
    }

    // 2. Chora kwanza Kiolezo cha HTML ghafi (Hapa tunatengeneza Canvas na Divs)
    const container = document.getElementById("dynamic-view-container");
    if (container) {
        container.innerHTML = view.render();
    } else {
        console.error("Kitalu cha dynamic-view-container hakionekani kwenye HTML!");
        return;
    }

    // 3. Badilisha mtindo wa Menu iliyobofyawa iwe Active kwenye sidebar
    document.querySelectorAll(".sidebar-menu .menu-item").forEach(item => {
        item.classList.remove("active");
        if (item.getAttribute("data-page") === pageKey) {
            item.classList.add("active");
        }
    });

    // [REKEBISHO KUU]: Tunatoa upakiaji wa data nje ya render() na kuuweka hapa baada ya HTML kuwa live!
    if (pageKey === "admin-dash") {
        // Tunampa kivinjari sekunde 200 (Delay) ili kijiandae vizuri kabla ya kuchora
        setTimeout(async () => {
            await fetchAdvancedDashboardAnalytics();
            await renderAutomatedDashboardCharts();
        }, 200);
    }

}



// --- JALIZA HII CHINI KABISA YA FAILI LAKO LA ROUTER.JS (TOLEO LILILOSAHIHISHWA MABANO) ---
document.addEventListener("DOMContentLoaded", () => {

        // --- WEKA HIZI NDANI YA document.addEventListener("DOMContentLoaded", ...) ---

    // 1. Soma jina la mfanyakazi aliyelogin kwa sasa kutoka kwenye kumbukumbu
    const loggedInUser = localStorage.getItem("smartbiz_username") || sessionStorage.getItem("smartbiz_username") || "Mkurugenzi";
    
    // 2. Kamata lile sanduku la herufi za jina kwenye Navbar ya juu ya duka
    const userNameElement = document.querySelector(".user-info .user-name");
    if (userNameElement) {
        // Tunabadilisha na kuweka jina lililotoka kwenye login kiotomatiki!
        userNameElement.innerText = loggedInUser;
    }

    
    // 1. KAMATA MIBONYEZO YOTE YA MENYU KWENYE SIDEBAR
    const menuItems = document.querySelectorAll(".sidebar-menu .menu-item");
    
    menuItems.forEach(item => {
        // Kuondoa matukio ya zamani ili kuzuia marudio (Event double-firing)
        const newItem = item.cloneNode(true);
        item.parentNode.replaceChild(newItem, item);
        
        newItem.addEventListener("click", (e) => {
            e.preventDefault(); 
            e.stopPropagation(); // Zuia link za HTML (<a href="#">) zisiharibu ukurasa
            
            const pageKey = newItem.getAttribute("data-page");
            console.log("Menu ya Sidebar imebonyezwa, inatafuta ukurasa wa:", pageKey);
            
            if (pageKey) {
                // Kama HTML bado ina jina la zamani la 'sales-records', tunaielekeza vizuri
                if (pageKey === 'sales-records' || pageKey === 'sales') {
                    navigateTo('sales');
                } else {
                    navigateTo(pageKey);
                }
            }
        });
        
    }); 

    // 2. KAMATA KITUFE CHA LOGOUT KWENYE SIDEBAR (KIKO NJE YA FOREACH)
    const btnLogout = document.querySelector(".btn-logout");
    if (btnLogout) {
        btnLogout.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const confirmLogout = confirm("Je, una uhakika unataka kutoka kwenye mfumo wa SmartBiz?");
            if (!confirmLogout) return;

            console.log("Mfumo unafuta vikao vyote na kukulogout...");

            // Futa kabisa token na majukumu yote yaliyohifadhiwa kwenye kivinjari
            localStorage.removeItem("smartbiz_token");
            localStorage.removeItem("smartbiz_user_role");
            sessionStorage.removeItem("smartbiz_token");
            sessionStorage.removeItem("smartbiz_user_role");
 
            console.log("Muelekeo unabadilika kwenda kwenye ukurasa wa kuingilia...");
            window.location.href = "index.html"; 
        });
    }

    // 3. KENGELE YA NOTIFICATION (KUFUNGUA NA KUFUNGA DROPDOWN)
    const btnNotification = document.getElementById("btnNotification");
    const notificationDropdown = document.getElementById("notificationDropdown");
    if (btnNotification && notificationDropdown) {
        btnNotification.addEventListener("click", (e) => {
            e.stopPropagation();
            notificationDropdown.classList.toggle("show");
        });
        document.addEventListener("click", () => {
            notificationDropdown.classList.remove("show");
        });
    }

    // [LAUNCH ENG]: Fungua Admin Dashboard kiotomatiki mfumo unapoanza mara ya kwanza
    console.log("Mfumo unazindua ukurasa mkuu live...");
    navigateTo("admin-dash");

    setTimeout(applyHRRoleAccessControl, 500);
});




// 1. ARRAY YA NDANI YA KUSHIKILIA VITU VILIVYOWEKWA KWENYE TOROLI (GLOBAL SPACE)
let posCart = [];

// 2. FUNCTION YA KUONGEZA BIDHAA KWENYE TOROLI (CLICK HANDLER)
function posAddToCart(productName, sellingPrice) {
    console.log(`Mtumiaji ameongeza kwenye toroli: ${productName} - TSH ${sellingPrice}`);

    // Kagua kama bidhaa tayari ilikuwepo kwenye toroli ili tuongeze idadi tu (quantity)
    const existingItem = posCart.find(item => item.name === productName);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        // Kama ni mpya, iingize kwenye toroli
        posCart.push({
            name: productName,
            price: sellingPrice,
            quantity: 1
        });
    }

    // Pakia upya muonekano wa toroli live skrini
    posRenderCartItems();
}

// 3. FUNCTION YA KUCHORA VITU NDANI YA TOROLI LA MANUNUZI
function posRenderCartItems() {
    const cartListContainer = document.getElementById("posCartItemsList");
    if (!cartListContainer) return;

    if (posCart.length === 0) {
        cartListContainer.innerHTML = `
            <p style="text-align: center; color: #94a3b8; padding: 3rem 0; font-size: 0.9rem; margin:0;">
                Toroli lipo wazi. Bonyeza bidhaa kuongeza kwenye risiti.
            </p>
        `;
        posCalculateCartTotals();
        return;
    }

    // Chora upya orodha ya vitu vilivyochaguliwa
    cartListContainer.innerHTML = "";
    posCart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        cartListContainer.innerHTML += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.65rem 0; border-bottom: 1px dashed #f1f5f9; font-size: 0.9rem;">
                <div style="display: flex; flex-direction: column; max-width: 140px;">
                    <strong style="color: #1e293b;">${item.name}</strong>
                    <span style="font-size: 0.75rem; color: #64748b;">TSH ${item.price.toLocaleString()} x ${item.quantity}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; margin-left: auto; margin-right: 8px;">
                    <!-- Vitufe vya kuongeza au kupunguza idadi kwa urahisi -->
                    <button onclick="posUpdateQty(${index}, -1)" style="background: #f1f5f9; border: 1px solid #cbd5e1; width: 22px; height: 22px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 0.8rem;">-</button>
                    <strong style="min-width: 15px; text-align: center;">${item.quantity}</strong>
                    <button onclick="posUpdateQty(${index}, 1)" style="background: #f1f5f9; border: 1px solid #cbd5e1; width: 22px; height: 22px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 0.8rem;">+</button>
                </div>
                <strong style="color: #334155; min-width: 75px; text-align: right;">TSH ${itemTotal.toLocaleString()}</strong>
            </div>
        `;
    });

    // Piga mahesabu mapya ya pesa
    posCalculateCartTotals();
}

// 4. FUNCTION YA KUBADILISHA IDADI KUTOKA KWENYE VITUFE VYA TOROLI
function posUpdateQty(index, change) {
    if (posCart[index]) {
        posCart[index].quantity += change;
        if (posCart[index].quantity <= 0) {
            posCart.splice(index, 1); // Kama ikifikia 0, iondoe kabisa kwenye toroli
        }
        posRenderCartItems();
    }
}

// 5. FUNCTION YA KUPIGA HESABU ZA JUMLA KUU NA PUNGUZO (DISCOUNT) LIVE
function posCalculateCartTotals() {
    const subtotalLabel = document.getElementById("posSubtotalLabel");
    const totalLabel = document.getElementById("posTotalLabel");
    const discountInput = document.getElementById("posDiscountInput");

    if (!subtotalLabel || !totalLabel) return;

    // A. Piga hesabu ya subtotal (Idadi x Bei ya kila kitu)
    const subtotal = posCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // B. Soma punguzo lililoandikwa kwenye kisanduku
    const discount = discountInput ? parseFloat(discountInput.value) || 0 : 0;
    
    // C. Toa punguzo kupata jumla kuu (Final Total)
    const finalTotal = Math.max(0, subtotal - discount);

    // D. Weka namba hizo live kwenye lebo za skrini yako
    subtotalLabel.innerText = `TSH ${subtotal.toLocaleString()}`;
    totalLabel.innerText = `TSH ${finalTotal.toLocaleString()}`;
}

// 6. FUNCTION YA KUSAFISHA TOROLI ZOTE (CLEAR CART BUTTON)
function posClearCart() {
    posCart = [];
    posRenderCartItems();
}

// FUNCTION YA MALIPO ILIYOSAHIHISHWA KUONDOA MCONNECTED STUB REDIRECT
async function posProcessPayment() {
    if (posCart.length === 0) {
        alert("Toroli lako lipo wazi! Tafadhali chagua bidhaa kwanza.");
        return;
    }

    const discountInput = document.getElementById("posDiscountInput");
    const discountValue = discountInput ? parseFloat(discountInput.value) || 0 : 0;

    const checkoutPayload = {
        cashier_id: 1, 
        discount: discountValue,
        items: posCart.map(item => ({
            product_name: item.name,
            quantity: item.quantity,
            price: item.price
        }))
    };

    try {
        // REKEBISHO: Tunatumia wrapper yetu thabiti ya API badala ya fetch ya zamani
        const result = await API.post("/sales/checkout", checkoutPayload, false);
        alert(`🎉 Muamala Umekamilika!\nRisiti: #SB-${result.sale_id}\nKiasi Kilicholipwa: TSH ${result.total_paid.toLocaleString()}`);
        posClearCart();
        posFetchLiveProducts();
    } catch (error) {
        alert(`❌ Hitilafu ya Mauzo:\n${error.message}`);
    }
}



// ==================== KAZI MPYA ZA KUUNGANISHA POS NA BACKEND ====================

// frontend/js/router.js

// 1. DATA SYNCHRONIZATION: API CONNECTORS
// FUNCTION YA MUHTASARI WA ANALYTICS - HAPA TUMEONDOA KITANZI CHA GRAFU NDANI YAKE
async function fetchAdvancedDashboardAnalytics() {
    try {
        const data = await API.get("/sales/analytics");
        
        const salesElem = document.getElementById("dashTodaySales");
        const profitElem = document.getElementById("dashTodayProfit");
        const prodElem = document.getElementById("dashTotalProducts");
        const alertElem = document.getElementById("dashLowStockTag");

        if (salesElem) salesElem.innerText = `TSH ${data.metrics.today_sales.toLocaleString()}`;
        if (profitElem) profitElem.innerText = `TSH ${data.metrics.today_profit.toLocaleString()}`;
        if (prodElem) prodElem.innerText = data.metrics.total_products.toLocaleString();
        
        if (alertElem) {
            alertElem.innerHTML = `<span class="trend-icon">⚠️</span> ${data.metrics.low_stock_alerts} Zimeisha stoki`;
        }

        const tableBody = document.getElementById("dashRecentTransactionsTable");
        if (tableBody) {
            if (!data.recent_transactions || data.recent_transactions.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#64748b; padding:1.5rem;">Bado hakuna mauzo ya leo.</td></tr>`;
            } else {
                tableBody.innerHTML = "";
                data.recent_transactions.forEach(sale => {
                    const dateObj = sale.sale_date ? new Date(sale.sale_date) : new Date();
                    tableBody.innerHTML += `
                        <tr>
                            <td><strong>#SB-${sale.id}</strong></td>
                            <td>${dateObj.toLocaleString('sw-TZ')}</td>
                            <td>TSH ${sale.final_amount.toLocaleString()}</td>
                            <td><span class="status-badge success">Imelipwa</span></td>
                        </tr>
                    `;
                });
            }
        }

        const productsList = document.getElementById("dashTopProductsList");
        if (productsList) {
            productsList.innerHTML = `<p style="color:#64748b; padding:1rem;">Kila kitu kiko salama.</p>`;
        }
        
    } catch (error) {
        console.error("Dashboard Sync Failure:", error);
    }
}

async function posFetchLiveProducts(searchQuery = "") {
    const gridContainer = document.getElementById("posLiveProductsGrid");
    if (!gridContainer) return;

    try {
        let endpoint = "/products";
        if (searchQuery) endpoint += `?search=${encodeURIComponent(searchQuery)}`;
        
        const products = await API.get(endpoint);
        gridContainer.innerHTML = "";
        
        if (products.length === 0) {
            gridContainer.innerHTML = `<p style="color: #64748b; padding: 1rem;">Mali haikupatikana ghalani.</p>`;
            return;
        }

        products.forEach(prod => {
            const isLow = prod.stock_quantity <= (prod.low_stock_threshold || 10);
            const productImageUrl = `assets/images/${prod.sku}.jpg`;

            gridContainer.innerHTML += `
                <div class="pos-product-card" onclick="posAddToCart('${prod.name}', ${prod.selling_price})" style="cursor:pointer; background:#fff; border-radius:8px; border:1px solid #e2e8f0; overflow:hidden; display:flex; flex-direction:column; justify-content:space-between; box-shadow:0 2px 4px rgb(0 0 0 / 0.02);">
                    <div class="pos-prod-img-box" style="position:relative; height:130px; width:100%; background:#f8fafc; display:flex; justify-content:center; align-items:center;">
                        <!-- MKAKATI WA PICHA: Kama picha ya SKU ikipatikana inafunguka, isipopatikana inaweka ile emoji ya zamani kwa ulinzi -->
                        <img src="${productImageUrl}" onerror="this.onerror=null; this.parentElement.innerHTML='<div style=\'font-size:2.5rem;\'>📦</div><span class=\'pos-stock-tag ${isLow ? 'warning' : ''}\' style=\'position:absolute; bottom:8px; right:8px;\'>Stoki: ${prod.stock_quantity}</span>';" alt="${prod.name}" style="width:100%; height:100%; object-fit:cover;">
                        <span class="pos-stock-tag ${isLow ? 'warning' : ''}" style="position:absolute; bottom:8px; right:8px;">Stoki: ${prod.stock_quantity}</span>
                    </div>
                    <div class="pos-prod-details" style="padding:0.75rem;">
                        <h4 style="margin:0 0 0.25rem 0; font-size:0.9rem; font-weight:700; color:#1e293b;">${prod.name}</h4>
                        <span class="pos-prod-price" style="font-weight:800; color:#0d9488; font-size:0.95rem;">TSH ${prod.selling_price.toLocaleString()}</span>
                    </div>
                </div>
            `;
        });

    } catch (error) {
        console.error("POS Engine Failure:", error);
    }
}

// FUNCTION KAMILI YA KUVUTA BIDHAA GHALANI NA KUONGEZA KITUFE CHA STOKI
async function fetchInventoryProducts(searchQuery = "") {
    const tableBody = document.getElementById("inventoryTableBody");
    if (!tableBody) return;

    try {
        let endpoint = "/products";
        if (searchQuery) endpoint += `?search=${encodeURIComponent(searchQuery)}`;

        const products = await API.get(endpoint);
        if (document.getElementById("invTotalProducts")) {
            document.getElementById("invTotalProducts").innerText = products.length;
        }

        let lowStockCount = 0;
        tableBody.innerHTML = "";

        if (products.length === 0) {
            // Tumeongeza colspan kuwa 8 ili ilingane na idadi mpya ya nguzo
            tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:#64748b; padding:1.5rem;">Hakuna bidhaa ghalani.</td></tr>`;
            return;
        }

        products.forEach(prod => {
            const isLow = prod.stock_quantity <= (prod.low_stock_threshold || 10);
            if (isLow) lowStockCount++;

            // [AUTOMATION]: Mfumo unatafuta picha ile ile ya .jpg kwa kutumia SKU namba
            // Mfano wa njia: assets/images/SKU-SAFI-02.jpg
            const productImageUrl = `assets/images/${prod.sku}.jpg`;

            tableBody.innerHTML += `
                <tr>
                    <!-- REKEBISHO KUU: Tumeondoa Emoji ya sanduku na kuweka Duara la picha halisi ya bidhaa -->
                    <td style="padding: 0.5rem 1rem; width: 50px;">
                        <div style="width: 40px; height: 40px; border-radius: 6px; overflow: hidden; background: #f8fafc; border: 1px solid #e2e8f0; display: flex; justify-content: center; align-items: center;">
                            <img src="${productImageUrl}" onerror="this.onerror=null; this.src='assets/images/default_item.png'; this.style.opacity='0.4';" alt="${prod.name}" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                    </td>
                    <td><strong>${prod.name}</strong></td>
                    <td><code style="background:#f1f5f9; padding:2px 6px; border-radius:4px; font-weight: 600;">${prod.sku}</code></td>
                    <td>TSH ${prod.buying_price.toLocaleString()}</td>
                    <td>TSH ${prod.selling_price.toLocaleString()}</td>
                    <td><strong>${prod.stock_quantity}</strong></td>
                    <td>
                        <span class="status-badge ${isLow ? 'pending' : 'success'}" style="font-weight:600;">
                            ${isLow ? 'Stoki Chini' : 'Salama'}
                        </span>
                    </td>
                    <td>
                        <button onclick="quickAddStockDialog(${prod.id}, '${prod.name}')" style="background:#0d9488; color:#fff; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:0.75rem; font-weight:700;">
                            📥 Ongeza Stoki
                        </button>
                    </td>
                </tr>
            `;
        });

        if (document.getElementById("invLowStock")) {
            document.getElementById("invLowStock").innerText = lowStockCount;
        }
    } catch (error) {
        console.error("Inventory Fetch Error:", error);
        tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:#ef4444; padding:1.5rem;">Hitilafu ya kupakia stoki kutoka kwenye database!</td></tr>`;
    }
}


async function posProcessPayment() {
    if (posCart.length === 0) {
        alert("Toroli lako lipo wazi! Chagua bidhaa kwanza.");
        return;
    }

    const discountInput = document.getElementById("posDiscountInput");
    const discountValue = discountInput ? parseFloat(discountInput.value) || 0 : 0;

    const checkoutPayload = {
        cashier_id: 1, 
        discount: discountValue,
        items: posCart.map(item => ({
            product_name: item.name,
            quantity: item.quantity,
            price: item.price
        }))
    };

    try {
        const result = await API.post("/sales/checkout", checkoutPayload, false);
        alert(`🎉 Muamala Umekamilika!\nRisiti: #SB-${result.sale_id}\nKiasi Kilicholipwa: TSH ${result.total_paid.toLocaleString()}`);
        posClearCart();
        posFetchLiveProducts();
    } catch (error) {
        alert(`❌ Hitilafu ya Mauzo:\n${error.message}`);
    }
}



async function submitNewProduct(event) {
    // 1. ZUIA KIVINJARI KUSAFIRISHA UKURASA NA KUKURUDISHA DASHBOARD
    event.preventDefault(); 
    event.stopPropagation(); // Inazuia hitilafu isisambae kwenye node zingine

    const payload = {
        name: document.getElementById("invName").value,
        sku: document.getElementById("invSku").value,
        buying_price: parseFloat(document.getElementById("invBuyingPrice").value),
        selling_price: parseFloat(document.getElementById("invSellingPrice").value),
        stock_quantity: parseInt(document.getElementById("invStock").value),
        low_stock_threshold: parseInt(document.getElementById("invThreshold").value)
    };

    try {
        // Tunatumia API.post ili ifuate itifaki yako thabiti
        const result = await API.post("/products", payload, false);

        alert(`🎉 Umefanikiwa! Bidhaa '${payload.name}' imesajiliwa kikamilifu ghalani.`);
        document.getElementById("addProductForm").reset();
        
        // 2. SASISHA JEDWALI LA INVENTORY HAPO HAPO BILA KUHAMA UKURASA
        if (typeof fetchInventoryProducts === "function") {
            await fetchInventoryProducts();
        }

    } catch (error) {
        alert(`❌ Hitilafu ya Kusajili:\n${error.message}`);
    }
}

// FUNCTION YA HISTORIA YA MAUZO - TOLEO LA UHAKIKA LILILOSAHIHISHWA 100%
async function fetchAllSystemSales(searchQuery = "") {
    const tableBody = document.getElementById("salesTableBody");
    if (!tableBody) return;

    try {
        // Tunavuta data kutoka kwenye endpoint sahihi ya mauzo
        const data = await API.get("/sales/analytics");
        const sales = data.recent_transactions || [];

        // 1. Kusasisha Kadi za Juu za Muhtasari
        if (document.getElementById("salesTotalInvoices")) {
            document.getElementById("salesTotalInvoices").innerText = sales.length;
        }
        if (document.getElementById("salesTotalDiscount")) {
            // Hapa tunaweka jumla kuu ya mauzo ya leo kwenye kadi ya pili
            const totalSalesToday = data.metrics?.today_sales || 0;
            document.getElementById("salesTotalDiscount").innerText = `TSH ${totalSalesToday.toLocaleString()}`;
        }

        // 2. Kuchuja data kulingana na search input ya mtumiaji
        let filteredSales = sales;
        if (searchQuery) {
            filteredSales = sales.filter(sale => sale.id.toString().includes(searchQuery));
        }

        // Kama hakuna miamala kabisa
        if (filteredSales.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#64748b; padding:1.5rem;">Hakuna kumbukumbu za mauzo zilizopatikana.</td></tr>`;
            return;
        }

        // 3. Kujaza Jedwali la Chini - Hapa tumerekebisha Majina ya Variable yafuate SQLite yako sahihi
        tableBody.innerHTML = "";
        filteredSales.forEach(sale => {
            // Kugeuza tarehe ya SQLite kuwa muundo wa kusomeka kwa urahisi
            const dateObj = sale.sale_date ? new Date(sale.sale_date) : new Date();
            const formattedDate = dateObj.toLocaleString('sw-TZ', { hour12: false });
            
            // Hesabu kulingana na data halisi za SQLite: final_amount, discount, na subtotal (final + discount)
            const discountGiven = sale.discount || 0;
            const finalPaid = sale.final_amount || 0;
            const subtotal = finalPaid + discountGiven;

            tableBody.innerHTML += `
                <tr>
                    <td><strong>#SB-${sale.id}</strong></td>
                    <td>${formattedDate}</td>
                    <td>TSH ${subtotal.toLocaleString()}</td>
                    <td>TSH ${discountGiven.toLocaleString()}</td>
                    <td><strong>TSH ${finalPaid.toLocaleString()}</strong></td>
                    <td><span class="status-badge success">Imelipwa</span></td>
                    <td>
                        <button onclick="viewSpecificInvoice(${sale.id}, ${subtotal}, ${discountGiven}, ${finalPaid}, '${formattedDate}')" style="background:#0d9488; color:#fff; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:0.8rem; font-weight:600;">
                            👁️ Angalia
                        </button>
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        console.error("Sales Table Error:", error);
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#ef4444; padding:1.5rem;">Hitilafu ya kupakia mauzo!</td></tr>`;
    }
}


// FUNCTION YA KUFUNGUA MODAL NA KUONYESHA RISITI
// FUNCTION YA KUFUNGUA MODAL YA RISITI NA KUCHAPISHA (PRINT)
function viewSpecificInvoice(saleId, subtotal, discount, finalAmount, dateStr) {
    const modal = document.getElementById("invoiceModal");
    const modalBody = document.getElementById("invoiceModalBody");
    
    if (!modal || !modalBody) {
        // Kama modal haipo kwenye HTML, tunafanya print ya haraka moja kwa moja
        window.print();
        return;
    }

    // Kuingiza maelezo safi ya risiti ndani ya modal popup
    modalBody.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
            <span><strong>Namba ya Risiti:</strong></span>
            <span>#SB-${saleId}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:1rem;">
            <span><strong>Tarehe ya Muamala:</strong></span>
            <span>${dateStr}</span>
        </div>
        
        <div style="border-top:1px solid #f1f5f9; border-bottom:1px solid #f1f5f9; padding:0.5rem 0; margin-bottom:1rem;">
            <p style="margin:0 0 0.25rem 0; font-weight:bold;">Vitu Vilivyouzwa:</p>
            <div style="display:flex; justify-content:space-between; font-size:0.85rem; color:#64748b;">
                <span>Muamala wa Bidhaa (POS)</span>
                <span>Jumla imejumuishwa</span>
            </div>
        </div>

        <div style="display:flex; justify-content:space-between; margin-bottom:0.25rem;">
            <span>Jumla Ndogo (Subtotal):</span>
            <span>TSH ${subtotal.toLocaleString()}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:0.25rem; color:#f59e0b;">
            <span>Punguzo (Discount):</span>
            <span>- TSH ${discount.toLocaleString()}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-top:0.5rem; font-size:1.1rem; font-weight:bold; border-top:1px dashed #e2e8f0; padding-top:0.5rem; color:#0d9488;">
            <span>Jumla Kuu (Paid):</span>
            <span>TSH ${finalAmount.toLocaleString()}</span>
        </div>
        
        <p style="text-align:center; font-style:italic; margin-top:1.5rem; color:#64748b; font-size:0.8rem;">
            Asante kwa kufanya biashara nasi! Karibu tena.
        </p>
    `;

    // Onyesha modal rasmi kwenye skrini ya mfumo
    modal.style.display = "flex";
}

// FUNCTION YA KUVUTA MATUMIZI YOTE (Hifadhi kwa sasa kwenye LocalStorage kama hatua ya kwanza, au Backend baadae)
// FUNCTION YA KUVUTA MATUMIZI KUTOKA KWENYE DATABASE LIVE
async function fetchAllExpenses(searchQuery = "") {
    const tableBody = document.getElementById("expensesTableBody");
    if (!tableBody) return;

    try {
        let endpoint = "/expenses";
        if (searchQuery) endpoint += `?search=${encodeURIComponent(searchQuery)}`;
        
        // Kuvuta data kutoka Python backend yetu mpya
        const data = await API.get(endpoint);

        // Sasisha kadi za juu za takwimu (Metrics)
        if (document.getElementById("expTotalAmount")) {
            document.getElementById("expTotalAmount").innerText = `TSH ${data.total_amount.toLocaleString()}`;
        }
        if (document.getElementById("expTotalCount")) {
            document.getElementById("expTotalCount").innerText = data.total_count;
        }

        const expenses = data.expenses || [];
        if (expenses.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#64748b; padding:1.5rem;">Hakuna kumbukumbu za matumizi kwenye database.</td></tr>`;
            return;
        }

        // Kujaza jedwali la matumizi
        tableBody.innerHTML = "";
        expenses.forEach(exp => {
            tableBody.innerHTML += `
                <tr>
                    <td>${exp.date}</td>
                    <td><span class="status-badge pending" style="background:#fee2e2; color:#ef4444; font-weight:600;">${exp.category}</span></td>
                    <td>${exp.description}</td>
                    <td><strong>TSH ${exp.amount.toLocaleString()}</strong></td>
                    <td>${exp.user}</td>
                    <td>
                        <button onclick="undoSpecificExpense(${exp.id}, ${exp.amount})" style="background:#ef4444; color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:0.8rem; font-weight:600; display:flex; align-items:center; gap:4px;">
                            🗑️ Futa
                        </button>
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        console.error("Expenses Fetch Error:", error);
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#ef4444; padding:1.5rem;">Hitilafu ya kupakia matumizi kutoka kwenye database!</td></tr>`;
    }
}

// FUNCTION YA KUTUMA MATUMIZI MAPYA KWENYE DATABASE
async function submitNewExpense(event) {
    event.preventDefault();
    event.stopPropagation();

    const category = document.getElementById("expCategory").value;
    const amount = parseFloat(document.getElementById("expAmount").value);
    const description = document.getElementById("expDescription").value;

    const payload = {
        category: category,
        amount: amount,
        description: description
    };

    try {
        // Tuma data kwenda backend kwa kutumia itifaki yetu thabiti
        await API.post("/expenses", payload, false);

        alert(`💸 Umefanikiwa kurekodi matumizi ya TSH ${amount.toLocaleString()} kwenye database!`);
        document.getElementById("addExpenseForm").reset();
        
        // Pakia upya jedwali hapo hapo bila kurefresh ukurasa mzima
        await fetchAllExpenses();

    } catch (error) {
        alert(`❌ Imeshindikana kuhifadhi matumizi:\n${error.message}`);
    }
}

// FUNCTION YA UNDO / KUFUTA MATUMIZI KWENYE DATABASE
async function undoSpecificExpense(expenseId, amount) {
    // Kumuuliza mtumiaji thibitisho kabla ya kufuta (Ulinzi wa data)
    const confirmDelete = confirm(`Je, una uhakika unataka kufuta muamala huu wa TSH ${amount.toLocaleString()}?`);
    if (!confirmDelete) return;

    try {
        // Tuma ombi la kufuta kwenda backend yetu mpya
        await API.delete(`/expenses/${expenseId}`);
        
        alert("🗑️ Muamala wa matumizi umefutwa kikamilifu kwenye database!");
        
        // Pakia upya jedwali hapo hapo ili kadi na orodha zisomeke upya live
        await fetchAllExpenses();
    } catch (error) {
        alert(`❌ Imeshindikana kufuta muamala:\n${error.message}`);
    }
}

// FUNCTION YA KUVUTA ODA ZA MANUNUZI ZILIZOZALISHWA KIOTOMATIKI
async function fetchAutomatedPurchaseOrders() {
    const tableBody = document.getElementById("automatedOrdersTableBody");
    if (!tableBody) return;

    try {
        const orders = await API.get("/products/automated-orders");
        
        if (orders.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#64748b; padding:1rem;">Hakuna bidhaa iliyomalizika kwa sasa. Mfumo uko salama.</td></tr>`;
            return;
        }

        tableBody.innerHTML = "";
        orders.forEach(order => {
            tableBody.innerHTML += `
                <tr style="background: #fffaf5;">
                    <td><strong>#PO-${order.id}</strong></td>
                    <td style="color: #c2410c; font-weight: 600;">⚠️ ${order.product_name}</td>
                    <td><code>${order.sku}</code></td>
                    <td><strong>${order.quantity} Pcs</strong></td>
                    <td>TSH ${order.cost.toLocaleString()}</td>
                    <td><span class="status-badge pending" style="background: #ffedd5; color: #9a3412;">${order.status}</span></td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Automated Orders Fetch Error:", error);
    }
}

// FUNCTION YA KUONGEZA MZIGO MPYA JUU YA BIDHAA ILIYOPO TAYARI
async function quickAddStockDialog(productId, productName) {
    const quantityStr = prompt(`Ingiza idadi ya bidhaa za [${productName}] unazotaka kuziongeza ghalani (Mfano: 50, 100):`);
    if (!quantityStr) return; // Kama mtumiaji akighairi

    const quantity = parseInt(quantityStr);
    if (isNaN(quantity) || quantity <= 0) {
        alert("❌ Tafadhali ingiza idadi halisi na chanya ya bidhaa!");
        return;
    }

    try {
        const payload = { quantity_to_add: quantity };
        // Tuma maombi kupitia njia yetu mpya ya PATCH
        await API.patch(`/products/${productId}/add-stock`, payload);
        
        alert(`🎉 Mzigo mpya wa ${quantity} Pcs umepokelewa na stoki imesasishwa kiotomatiki!`);
        
        // Pakia upya meza zote mbili live bila kurefresh ukurasa mzima
        await fetchInventoryProducts();
        if (typeof fetchAutomatedPurchaseOrders === "function") {
            await fetchAutomatedPurchaseOrders();
        }
    } catch (error) {
        alert(`❌ Hitilafu ya kusasisha stoki:\n${error.message}`);
    }
}

// FUNCTION YA KUVUTA WAFANYAKAZI KUTOKA KWENYE DATABASE
async function fetchSystemStaffMembers() {
    const tableBody = document.getElementById("staffTableBody");
    if (!tableBody) return;

    try {
        const staff = await API.get("/auth/staff");
        tableBody.innerHTML = "";

        if (staff.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#64748b;">Hakuna wafanyakazi waliopo.</td></tr>`;
            return;
        }

        staff.forEach(member => {
            let roleBadgeColor = "background: #cbd5e1; color: #334155;";
            if (member.role_name === "Administrator") roleBadgeColor = "background: #dbeafe; color: #1e40af;";
            if (member.role_name === "Manager") roleBadgeColor = "background: #fef3c7; color: #92400e;";
            if (member.role_name === "Cashier") roleBadgeColor = "background: #d1fae5; color: #065f46;";

            tableBody.innerHTML += `
                <tr>
                    <td>#${member.id}</td>
                    <td><strong>${member.username}</strong></td>
                    <td><code>${member.email}</code></td>
                    <td><span class="status-badge" style="${roleBadgeColor} font-weight:700;">${member.role_name}</span></td>
                    <td><span class="status-badge success">Active</span></td>
                    <td style="display:flex; gap:6px;">
                        <button onclick="editStaffDialog(${member.id}, '${member.username}', '${member.email}', ${member.role_id || 3})" style="background:#0284c7; color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:0.75rem; font-weight:600;">✏️ Edit</button>
                        <button onclick="deleteStaffAction(${member.id}, '${member.username}')" style="background:#ef4444; color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:0.75rem; font-weight:600;">🗑️ Futa</button>
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        console.error("Staff Fetch Error:", error);
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#ef4444;">Hitilafu ya kupakia wafanyakazi!</td></tr>`;
    }
}

// FUNCTION YA KUTUMA USHAHIDI WA MFANYAKAZI MPYA
async function submitNewStaffMember(event) {
    event.preventDefault();
    event.stopPropagation();

    const payload = {
        username: document.getElementById("staffUsername").value,
        email: document.getElementById("staffEmail").value,
        password: document.getElementById("staffPassword").value,
        role_id: parseInt(document.getElementById("staffRoleId").value)
    };

    try {
        await API.post("/auth/register", payload, false);
        alert(`🎉 Mfanyakazi '${payload.username}' amesajiliwa kwa mafanikio makubwa!`);
        document.getElementById("addStaffForm").reset();
        await fetchSystemStaffMembers(); // Pakia upya jedwali hapo hapo
    } catch (error) {
        alert(`❌ Hitilafu ya Usajili:\n${error.message}`);
    }
}

// FUNCTION YA KUVUTA WATEJA LIVE KUTOKA DATABASE
async function fetchSystemCustomers(searchQuery = "") {
    const tableBody = document.getElementById("customersTableBody");
    if (!tableBody) return;

    try {
        let endpoint = "/customers";
        if (searchQuery) endpoint += `?search=${encodeURIComponent(searchQuery)}`;
        
        const data = await API.get(endpoint);

        if (document.getElementById("custTotalCount")) document.getElementById("custTotalCount").innerText = data.total_customers;
        if (document.getElementById("custTotalDebts")) document.getElementById("custTotalDebts").innerText = `TSH ${data.total_debts.toLocaleString()}`;

        const customers = data.customers || [];
        if (customers.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#64748b; padding:1.5rem;">Hakuna wateja waliopatikana.</td></tr>`;
            return;
        }

        tableBody.innerHTML = "";
        customers.forEach(cust => {
            const hasDebt = cust.debt_amount > 0;
            tableBody.innerHTML += `
                <tr>
                    <td><strong>${cust.name}</strong></td>
                    <td>${cust.phone}</td>
                    <td>${cust.email || '-'}</td>
                    <td style="color: ${hasDebt ? '#ef4444' : '#10b981'}; font-weight: 700;">
                        TSH ${cust.debt_amount.toLocaleString()}
                    </td>
                    <td>
                        <button onclick="clearCustomerDebtDialog(${cust.id}, '${cust.name}', ${cust.debt_amount})" ${!hasDebt ? 'disabled style="background:#cbd5e1; cursor:not-allowed;"' : ''} style="background:#0d9488; color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:0.75rem; font-weight:600;">
                            🪙 Lipa Deni
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Customers Fetch Error:", error);
    }
}

// FUNCTION YA KUSAJILI MTEJA MPYA
async function submitNewCustomer(event) {
    event.preventDefault();
    event.stopPropagation();

    const payload = {
        name: document.getElementById("custName").value,
        phone: document.getElementById("custPhone").value,
        email: document.getElementById("custEmail").value || null,
        debt_amount: parseFloat(document.getElementById("custDebt").value) || 0.0
    };

    try {
        await API.post("/customers", payload, false);
        alert(`🎉 Mteja '${payload.name}' amesajiliwa kikamilifu!`);
        document.getElementById("addCustomerForm").reset();
        await fetchSystemCustomers();
    } catch (error) {
        alert(`❌ Hitilafu:\n${error.message}`);
    }
}

// FUNCTION YA KULIPIA DENI LA MTEJA
async function clearCustomerDebtDialog(customerId, name, currentDebt) {
    const paymentStr = prompt(`Mteja [${name}] ana deni la TSH ${currentDebt.toLocaleString()}.\nIngiza kiasi cha fedha alichokuletea sasa hivi:`);
    if (!paymentStr) return;

    const payment = parseFloat(paymentStr);
    if (isNaN(payment) || payment <= 0) {
        alert("❌ Ingiza kiasi halisi cha fedha!");
        return;
    }

    try {
        await API.patch(`/customers/${customerId}/pay-debt`, { amount_to_pay: payment });
        alert("🎉 Malipo ya deni yamepokelewa na kusasishwa kwenye database!");
        await fetchSystemCustomers();
    } catch (error) {
        alert(`❌ Hitilafu: ${error.message}`);
    }
}

// GLOBAL VARIABLES ZA GRAFU (HIZI ZIBLESHE JUU YA FUNCTION)
let salesProfitChartInstance = null;
let outstandingChartInstance = null;

async function renderAutomatedDashboardCharts() {
    // [ULINZI MKUU]: Kama maktaba haijapakiwa bado, usiruhusu mfumo uvunjike!
    if (typeof Chart === 'undefined') {
        console.warn("⚠️ Maktaba ya Chart.js haijapatikana bado kwenye kivinjari. Inajaribu tena...");
        return; 
    }

    console.log("Mfumo unaanzisha zoezi la kuchora grafu...");
    const ctx1 = document.getElementById('salesProfitChart');
    const ctx2 = document.getElementById('outstandingChart');
    
    // ... kodi zako zingine zote za grafu zilizosahihishwa zifuatie hapa chini ...

    if (!ctx1 || !ctx2) {
        console.warn("Canvas za grafu bado hazijawa tayari kwenye skrini!");
        return;
    }

    try {
        // 2. Vuta data live kutoka kwenye vyanzo vyetu vikuu viwili vya SQLite backend
        const analyticsData = await API.get("/sales/analytics");
        const customersData = await API.get("/customers");

        const todaySales = analyticsData.metrics?.today_sales || 0;
        const todayProfit = analyticsData.metrics?.today_profit || 0;

        // ----------------------------------------------------
        // GRAFU YA 1: MWENENDO WA MAUSO NA FAIDA (LINE CHART)
        // ----------------------------------------------------
        if (salesProfitChartInstance) salesProfitChartInstance.destroy();
        
        salesProfitChartInstance = new Chart(ctx1.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Asubuhi', 'Mchana', 'Jioni', 'Sasa (Leo Total)'],
                datasets: [
                    {
                        label: 'Mauzo (Sales)',
                        data: [todaySales * 0.3, todaySales * 0.6, todaySales * 0.8, todaySales],
                        borderColor: '#0284c7',
                        backgroundColor: 'rgba(2, 132, 199, 0.05)',
                        borderWidth: 3,
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Faida (Net Profit)',
                        data: [todayProfit * 0.2, todayProfit * 0.5, todayProfit * 0.7, todayProfit],
                        borderColor: '#0d9488',
                        backgroundColor: 'rgba(13, 148, 136, 0.05)',
                        borderWidth: 3,
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top' } },
                scales: { y: { beginAtZero: true } }
            }
        });

        // ----------------------------------------------------
        // GRAFU YA 2: MADENI YA WATEJA (BAR CHART)
        // ----------------------------------------------------
        if (outstandingChartInstance) outstandingChartInstance.destroy();

        const customerList = customersData.customers || [];
        const labelsList = customerList.slice(0, 5).map(c => c.name);
        const debtDataList = customerList.slice(0, 5).map(c => c.debt_amount);

        // SULUHISHO SAHIHI LA KUKAMILISHA KODI BILA ERROR
        const finalLabels = labelsList.length > 0 ? labelsList : ['Mteja Mfano'];
        const finalDebts = debtDataList.length > 0 ? debtDataList : []; 


                
        

        outstandingChartInstance = new Chart(ctx2.getContext('2d'), {
            type: 'bar',
            data: {
                labels: finalLabels,
                datasets: [{
                    label: 'Kiasi cha Deni (TSH)',
                    data: finalDebts,
                    backgroundColor: '#f97316',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
            }
        });

        console.log("🎉 Grafu zote mbili zimechorwa kikamilifu live!");

    } catch (error) {
        console.error("Hitilafu wakati wa kuchora grafu:", error);
    }
}

// =========================================================================
// [SECURITY ENGINE]: MFUMO WA ULINZI NA UTENGANISHAJI WA DASHBOARD KIOTOMATIKI
// =========================================================================
function applyHRRoleAccessControl() {
    // 1. Kusoma Role ya mtumiaji aliyelogin kutoka kwenye kivinjari
    const userRole = localStorage.getItem("smartbiz_user_role") || sessionStorage.getItem("smartbiz_user_role");
    console.log("🔒 Security Engine inakagua akaunti ya:", userRole);

    const profitCard = document.getElementById("dashTodayProfit") ? document.getElementById("dashTodayProfit").closest(".metric-card") : null;
    const canvasElement = document.getElementById("salesProfitChart");
    const chartsSection = canvasElement ? canvasElement.closest(".dashboard-data-grid") : null;
    const topProductsCard = document.querySelector(".products-card");
    const titleElement = document.getElementById("current-view-title");
    const currentTitle = titleElement ? titleElement.innerText : "";

    // ----------------------------------------------------
    // HALI YA A: KAMA MTUMIAJI NI CASHIER (POS + INVOICES ACCESS)
    // ----------------------------------------------------
    if (userRole === "Cashier") {
        // Ficha faida na grafu za siri kwenye Dashboard
        if (profitCard) profitCard.style.display = "none";
        if (chartsSection) chartsSection.style.display = "none";
        if (topProductsCard) topProductsCard.style.display = "none";

        // Ficha menu za siri na uache POS, Dashboard, na Sales zionekane
        document.querySelectorAll(".sidebar-menu .menu-item").forEach(item => {
            const page = item.getAttribute("data-page");
            if (page === "inventory" || page === "expenses" || page === "hr-staff") {
                item.style.display = "none"; 
            } else {
                item.style.display = "flex"; 
            }
        });

        // Gatekeeper: Mtoe nje cashier akilazimisha kufungua kurasa za siri za uongozi
        if (currentTitle === "Inventory & Stock Management" || 
            currentTitle === "Expense Tracker" || 
            currentTitle === "HR & Role Access Management") {
            
            alert("🔒 Usalama: Huna mamlaka ya kufungua ukurasa wa usimamizi wa ndani!");
            navigateTo("pos"); 
        }
    } 
    // ----------------------------------------------------
    // HALI YA B: KAMA NI ADMINISTRATOR AU OWNER (MAMLAKA KAMILI)
    // ----------------------------------------------------
    else {
        if (profitCard) profitCard.style.display = "flex";
        if (chartsSection) chartsSection.style.display = "grid";
        if (topProductsCard) topProductsCard.style.display = "block";
        document.querySelectorAll(".sidebar-menu .menu-item").forEach(item => { item.style.display = "flex"; });
    }
}

// INTERCEPTOR YA KULAZIMISHA ULINZI UJIKAGUE MARA KWA MARA
if (typeof window.originalNavigateTo === "undefined") {
    window.originalNavigateTo = navigateTo;
    navigateTo = function(pageKey) {
        window.originalNavigateTo(pageKey);
        setTimeout(() => { applyHRRoleAccessControl(); }, 80);
    };
}

// FUNCTION YA JAVASCRIPT INAYORUSHA AMRI YA FUNGA DUKA KWENYE SEVA
// FUNCTION YA JAVASCRIPT ILIYOBOREKWA (DYNAMIC EMAIL ROUTING)
async function triggerEndOfDayClose() {
    if (!confirm("Je, una uhakika unataka kufunga duka na kutuma mahesabu kwenye barua pepe yako?")) return;

    // Tunavuta jina la Admin aliyelogin kwa sasa hivi
    const currentAdminUsername = localStorage.getItem("smartbiz_username") || sessionStorage.getItem("smartbiz_username");

    try {
        // Tunatuma jina la Admin kwenda backend kama payload parameter
        const response = await API.post(`/sales/close-shop?username=${encodeURIComponent(currentAdminUsername)}`, {}, false);
        alert(`🎉 Usajili Umekamilika!\n${response.message}`);
    } catch (error) {
        alert(`❌ Hitilafu ya Funga Duka: ${error.message}`);
    }
}

// FUNCTION YA KUFUNGUA KISANDUKU CHA KUHARIRI EMAIL NA TAARIFA NYINGINE
async function editStaffDialog(userId, currentUsername, currentEmail, currentRoleId) {
    const newUsername = prompt(`Hariri Jina la Mtumiaji (Username):`, currentUsername);
    if (newUsername === null) return;

    const newEmail = prompt(`Ingiza Barua Pepe Sahihi (Mfano: juma@gmail.com):`, currentEmail);
    if (newEmail === null) return;

    // Kagua muundo sahihi wa email ya gmail
    if (!newEmail.includes("@") || !newEmail.endsWith(".com")) {
        alert("❌ Kosa: Tafadhali ingiza muundo halisi wa barua pepe unaoishia na .com!");
        return;
    }

    const newRoleStr = prompt(`Badili Cheo cha Mfanyakazi:\nIngiza 1 = Admin, 2 = Manager, 3 = Cashier`, currentRoleId);
    if (newRoleStr === null) return;
    const newRoleId = parseInt(newRoleStr);

    try {
        const payload = { username: newUsername, email: newEmail, role_id: newRoleId };
        await API.put(`/auth/staff/${userId}`, payload);
        alert("🎉 Imefanikiwa! Barua pepe na taarifa za mfanyakazi zimesasishwa kwenye database.");
        await fetchSystemStaffMembers(); // Pakia upya jedwali hapo hapo
    } catch (error) {
        alert(`❌ Hitilafu ya kuhariri: ${error.message}`);
    }
}

// FUNCTION YA KUFUTA ACCOUNT YA MFANYAKAZI KIKAMILIFU
async function deleteStaffAction(userId, username) {
    if (userId === 1) {
        alert("🔒 Usalama: Huwezi kufuta akaunti kuu ya kwanza ya Administrator!");
        return;
    }
    
    if (!confirm(`Je, una uhakika unataka kufuta akaunti ya mfanyakazi [${username}] kabisa kwenye database ya duka?`)) return;

    try {
        await API.delete(`/auth/staff/${userId}`);
        alert("🗑️ Akaunti ya mfanyakazi imefutwa kikamilifu kwenye database!");
        await fetchSystemStaffMembers();
    } catch (error) {
        alert(`❌ Hitilafu ya kufuta: ${error.message}`);
    }
}
