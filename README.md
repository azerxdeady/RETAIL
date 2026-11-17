# ✨ Karthik Jewellers & Viswanandini - Enterprise Fine Jewellery & Luxury Retail Ecosystem

An enterprise-grade, multi-brand fine jewellery retail e-commerce platform and executive operations control center built specifically for the prestigious Indian gold, diamond, gemstone, and bridal trousseau markets.

Now available with **Java 21 LTS & Spring Boot 3 Enterprise Backend** alongside the high-speed Node.js runtime!

---

## 🏛️ Ecosystem Portals & Architecture

Both backends serve all 5 interconnected portals with real-time Server-Sent Events (SSE) synchronization:

| Component | Spring Boot (Port 8080) | Node.js (Port 5000) | Description |
| :--- | :--- | :--- | :--- |
| **Master Ecosystem Hub** | [`http://localhost:8080/dashboard`](http://localhost:8080/dashboard) | [`http://localhost:5000/dashboard`](http://localhost:5000/dashboard) | **Centralized command cockpit:** Split-screen multi-portal preview, multi-brand telemetry, cross-store announcement broadcasting, and financial audit. |
| **Karthik Flagship Storefront** | [`http://localhost:8080`](http://localhost:8080) | [`http://localhost:5000`](http://localhost:5000) | Luxury shopping portal with live bullion pricing, transparent price breakups, virtual try-on, size guides, Swarna Nidhi chit scheme, and checkout. |
| **Viswanandini Bridal House** | [`http://localhost:8080/viswanandini`](http://localhost:8080/viswanandini) | [`http://localhost:5000/viswanandini`](http://localhost:5000/viswanandini) | High-luxury royal bridal atelier specializing in Bikaner uncut Polki, Kundan Jadau, and antique temple heirlooms (authenticated under Karthik Jewellers BIS License). |
| **Admin Operations & Customizer** | [`http://localhost:8080/admin`](http://localhost:8080/admin) | [`http://localhost:5000/admin`](http://localhost:5000/admin) | Shopify-style visual theme customizer, real-time bullion rate controller, inventory catalog CRUD, Swarna Nidhi passbooks, VIP appointments, and discount coupons. |
| **BIS GST Tax Invoice System** | [`http://localhost:8080/invoice`](http://localhost:8080/invoice) | [`http://localhost:5000/invoice`](http://localhost:5000/invoice) | Print-ready, legally compliant GST Tax Invoice with BIS 916 Hallmark details, HUID tracking, itemized making charges, and amount in words. |

---

## ☕ Enterprise Java 21 & Spring Boot 3 Stack

The Java implementation is located in `src/main/java/com/karthikjewellers/retail` and uses:
- **Java 21 LTS (Temurin 21.0.13+9)**
- **Spring Boot 3.3.5 & Spring Framework 6.1.14**
- **Maven 3.9.9 & Maven Wrapper (`mvnw.cmd`)**
- **Jackson 2.17** with JSR-310 datetime serialization
- **Real-time SSE (`SseEmitter`)** with thread-safe client registries
- **Shared Data Layer (`data/db.json`)**: Any update in Spring Boot instantly persists to `data/db.json` and syncs live to all browser clients.

### Java Package Structure

```
src/main/java/com/karthikjewellers/retail/
├── RetailApplication.java                 # Spring Boot application bootstrap
├── config/
│   └── WebConfig.java                     # Static asset mappings & SPA page routers
├── controller/
│   ├── HubMetricsController.java          # Master Hub metrics, announcements, admin stats, audit
│   ├── OrderOperationsController.java     # Orders, Swarna Nidhi, coupons, customers, store settings
│   ├── StorefrontApiController.java       # Products, categories, brands, bullion rates, HUID, appointments
│   ├── SyncStreamController.java          # SSE stream (/api/sync/stream), versioning & sync broadcast
│   └── ThemeApiController.java            # Real-time Shopify-style theme engine & instant presets
├── model/
│   ├── Appointment.java                   # Showroom & VIP video consultation model
│   ├── BullionRates.java                  # 24K, 22K, 18K gold and silver rates
│   ├── Category.java                      # Jewelry categories
│   ├── Coupon.java                        # Privilege discount coupons
│   ├── Order.java & OrderItem.java        # Order models with GST, weights & HUIDs
│   ├── PriceCalculation.java              # Itemized price breakdown model
│   ├── Product.java                       # Product catalog entity
│   └── Scheme.java                        # Swarna Nidhi (11+1) monthly gold chit fund
└── service/
    ├── DatabaseService.java               # Atomic JSON persistence service
    ├── PriceCalculatorService.java        # Mathematical bullion & GST calculator
    └── SyncBroadcastService.java          # Reactive SSE event broadcaster
```

---

## 🚀 1-Click Free Cloud Deployment

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/azerxdeady/RETAIL)

Click the badge above to automatically deploy this entire ecosystem on **Render.com** (100% Free tier, free SSL, zero maintenance).

---

## 🚀 How to Run Locally

### Option 1: Run Enterprise Java Spring Boot (Port 8080)
Double-click `run-java.bat` or run:
```powershell
.\run-java.ps1
```
Or with Maven:
```powershell
$env:JAVA_HOME = "C:\Users\Star-PC\jdk-21"
$env:Path = "C:\Users\Star-PC\jdk-21\bin;C:\Users\Star-PC\maven-3.9\bin;$env:Path"
mvn spring-boot:run
```
To build a standalone executable JAR:
```powershell
mvn clean package -DskipTests
java -jar target/retail-ecosystem-1.0.0.jar
```

### Option 2: Run Node.js Server (Port 5000)
```powershell
node server.js
```

---

## 👑 Executive Admin Operations Center

- **URL (Java):** [`http://localhost:8080/admin`](http://localhost:8080/admin)
- **URL (Node):** [`http://localhost:5000/admin`](http://localhost:5000/admin)
- **Email:** `admin@karthikjewellers.com`
- **Password:** `admin123`

### Operational Modules:
1. **Shopify-Style Visual Theme Customizer**: Real-time styling, header announcements, typography, preset themes (Royal Velvet, Akshaya Gold, Nizam Heritage, Minimal Elegance), with instant hot-reloading across all open tabs via SSE.
2. **Live Bullion Rates**: Real-time rate controller with 1-click catalog re-pricing.
3. **Masterpieces & Inventory**: Add, edit, and delete jewellery with live retail price estimation, gross/net weights, and BIS HUID assignment.
4. **Orders & Dispatch**: Multi-step fulfillment pipeline, armoured courier tracking, and printable GST Tax Invoices.
5. **Swarna Nidhi Accounts**: Customer chit scheme records, installment payments, and accrued gold gram calculation.
6. **VIP Appointments**: Showroom visits and 1-on-1 virtual try-on appointments.
7. **Privilege Coupons**: Promotion code engine with validation rules.

---

## 🐶 Datadog Agent Observability

The application is instrumented with Datadog Agent Observability (`ddtrace.llmobs`) for tracing and monitoring AI customer assistants, tools, and multi-step agentic workflows:

- **Site:** `us5.datadoghq.com`
- **Application Name (ML App):** `karthik`
- **Agent Service File:** [`karthik_agent.py`](karthik_agent.py)
- **Dashboard:** [https://us5.datadoghq.com/llm/agents](https://us5.datadoghq.com/llm/agents)

### Traced Agentic Capabilities:
- **`@LLMObs.agent`**: End-to-end customer consultation sessions, session tracking, and intent reasoning.
- **`@LLMObs.tool`**:
  - `tool_get_bullion_rates`: Real-time exchange rate telemetry from the active backend.
  - `tool_search_catalog`: Semantic jewellery catalog search.
  - `tool_verify_huid`: BIS Hallmark Unique Identification verification.
  - `tool_swarna_nidhi_chit`: 11+1 gold chit fund maturity calculator.

### Run Agent Observability:
```powershell
.\run-agent.ps1              # Run sample test scenarios
.\run-agent.ps1 --interactive # Interactive chat terminal
```
Or double-click `run-agent.bat`.

---

## 📄 License & Compliance

- **BIS Hallmarking License:** `BIS-HM/L-600017-0982`
- **GSTIN:** `33AAACK4928J1Z5`
- **Assaying Standard:** IS 1417:2019 / IS 2112:2014
