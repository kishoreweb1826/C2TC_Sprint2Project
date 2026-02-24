# OrderFlow — Angular Frontend
### For: `com.tnsif.orderdetails` Spring Boot Backend

---

## 📁 Project Structure

```
orderflow-angular/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── navbar/              # Header with API status indicator
│   │   │   ├── order-list/          # Main CRUD table (GET all, DELETE)
│   │   │   ├── order-form/          # Create/Edit modal (POST, PUT)
│   │   │   ├── confirm-dialog/      # Delete confirmation modal
│   │   │   └── toast/               # Notification system
│   │   ├── models/
│   │   │   └── order-details.model.ts   # Matches Spring entity exactly
│   │   ├── services/
│   │   │   ├── order-details.service.ts # All HTTP calls to Spring Boot
│   │   │   └── toast.service.ts         # Toast notifications
│   │   ├── app.component.ts
│   │   ├── app.config.ts            # HttpClient, Router, Animations
│   │   └── app.routes.ts
│   ├── environments/
│   │   ├── environment.ts           # apiUrl: http://localhost:8080/api/orderdetails
│   │   └── environment.prod.ts
│   ├── styles.css                   # Global dark theme
│   ├── index.html
│   └── main.ts
├── angular.json
├── package.json
└── tsconfig.json
```

---

## 🚀 Setup & Run

### 1. Install dependencies
```bash
npm install
```

### 2. Start Angular dev server
```bash
ng serve
# Opens at http://localhost:4200
```

### 3. Make sure Spring Boot is running
```bash
# In your Spring Boot project:
./mvnw spring-boot:run
# Runs at http://localhost:8080
```

### 4. CORS — already handled!
Your `SpaController.java` serves the Angular build from the **same** Spring Boot server,
so no CORS issues in production. For development (`ng serve` on port 4200),
uncomment the `@CrossOrigin` annotation in `OrderDetailsController.java`:

```java
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"})
```

---

## 🔗 API Mapping

| Angular Action | HTTP Method | Spring Endpoint              |
|---------------|-------------|------------------------------|
| Load table    | GET         | `/api/orderdetails`          |
| Create order  | POST        | `/api/orderdetails`          |
| Edit order    | PUT         | `/api/orderdetails/{id}`     |
| Delete order  | DELETE      | `/api/orderdetails/{id}`     |

---

## 🏗️ Production Build (deploy into Spring Boot)

```bash
# Build Angular
ng build --configuration production

# Copy dist to Spring Boot static folder
cp -r dist/orderflow-angular/browser/* ../src/main/resources/static/

# Run Spring Boot — serves everything from localhost:8080
./mvnw spring-boot:run
```

Your `SpaController.java` already handles Angular routing (forwards all paths to `index.html`).

---

## ✨ Features

- ✅ **Full CRUD** — Create, Read, Update, Delete orders
- ✅ **Reactive Forms** with `FormBuilder` + validation
- ✅ **HttpClient** wired to exact Spring endpoints
- ✅ **Search** by customerId, shopId, paymentMode
- ✅ **Filter** by payment mode dropdown
- ✅ **Sortable columns** (click any header)
- ✅ **Pagination** (10 rows/page)
- ✅ **Stats bar** — total, revenue, avg, unique customers
- ✅ **Toast notifications** for all CRUD actions
- ✅ **Skeleton loading** while fetching
- ✅ **API status indicator** in navbar
- ✅ **Standalone components** (Angular 17)
- ✅ **Responsive** — works on mobile

---

## 🏷️ Entity Fields (OrderDetails)

```typescript
interface OrderDetails {
  id?:              number;   // Long — auto-generated
  dateOfPurchase:   string;   // LocalDateTime → "2025-06-15T10:30:00"
  total:            number;   // Double
  customerId:       number;   // Long (FK ref Customer)
  paymentMode:      string;   // "UPI" | "Card" | "Cash" | "NetBanking"
  shopId:           string;   // Shop String
}
```
