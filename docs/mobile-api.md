# POS Mobile API Documentation

**Base URL**: `http://<HOST>:8000/api/mobile/v1`  
**Format**: All requests and responses use `application/json`  
**Auth**: Bearer Token (Laravel Sanctum)

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Dashboard](#2-dashboard)
3. [Categories](#3-categories)
4. [Products](#4-products)
5. [Product Variants](#5-product-variants)
6. [Suppliers](#6-suppliers)
7. [Purchases (Stock In)](#7-purchases-stock-in)
8. [Error Responses](#8-error-responses)
9. [Android Integration Guide](#9-android-integration-guide)

---

## 1. Authentication

### 1.1 Login

**Endpoint**: `POST /login`  
**Auth required**: No

**Request Body**:
```json
{
  "email": "admin@example.com",
  "password": "password",
  "device_name": "Samsung Galaxy A52"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `email` | string | ✅ | User email |
| `password` | string | ✅ | User password |
| `device_name` | string | ❌ | Device identifier (default: User-Agent). Used to name the token. |

**Success Response** `200 OK`:
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "token": "1|abc123xyz...",
    "token_type": "Bearer",
    "user": {
      "id": 1,
      "name": "Admin",
      "email": "admin@example.com",
      "created_at": "2026-01-01T00:00:00.000000Z"
    }
  }
}
```

> ⚠️ **Save the `token` value** in secure storage. Send it on every subsequent request as:  
> `Authorization: Bearer 1|abc123xyz...`

---

### 1.2 Logout

**Endpoint**: `POST /logout`  
**Auth required**: Yes

**Request**: No body needed.

**Success Response** `200 OK`:
```json
{
  "success": true,
  "message": "Logged out successfully."
}
```

---

### 1.3 Get Current User (Me)

**Endpoint**: `GET /me`  
**Auth required**: Yes

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Admin",
    "email": "admin@example.com",
    "created_at": "2026-01-01T00:00:00.000000Z"
  }
}
```

---

## 2. Dashboard

### 2.1 Summary Statistics

**Endpoint**: `GET /dashboard`  
**Auth required**: Yes

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "total_products": 120,
    "low_stock_count": 8,
    "out_of_stock_count": 3,
    "today_purchases": 2,
    "today_purchase_value": 1500000.00,
    "month_purchase_value": 25000000.00
  }
}
```

| Field | Type | Description |
|---|---|---|
| `total_products` | int | Total products in database |
| `low_stock_count` | int | Products/variants with stock ≤ 5 (but > 0) |
| `out_of_stock_count` | int | Products with zero stock |
| `today_purchases` | int | Number of purchases made today |
| `today_purchase_value` | float | Total value of received purchases today |
| `month_purchase_value` | float | Total value of received purchases this month |

---

## 3. Categories

### 3.1 List Categories

**Endpoint**: `GET /categories`  
**Auth required**: Yes

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Electronics", "type": "product" },
    { "id": 2, "name": "Food & Beverage", "type": "product" }
  ]
}
```

---

## 4. Products

### 4.1 List Products

**Endpoint**: `GET /products`  
**Auth required**: Yes

**Query Parameters**:

| Param | Type | Description |
|---|---|---|
| `search` | string | Search by name, SKU, or barcode |
| `category_id` | int | Filter by category |
| `has_variants` | bool | `1` = variants only, `0` = simple only |
| `per_page` | int | Items per page (default: 15) |
| `page` | int | Page number (default: 1) |

**Request Example**:
```
GET /api/mobile/v1/products?search=baju&category_id=2&per_page=10
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Kaos Polos",
      "sku": "PROD-ABC123",
      "barcode": "1234567890",
      "cost_price": 30000.0,
      "price": 50000.0,
      "stock": 0,
      "total_stock": 45,
      "unit": "pcs",
      "has_variants": true,
      "min_price": 45000.0,
      "max_price": 65000.0,
      "thumbnail_url": "http://127.0.0.1:8000/storage/...",
      "medium_url": "http://127.0.0.1:8000/storage/...",
      "primary_image_url": "http://127.0.0.1:8000/storage/...",
      "category": { "id": 1, "name": "Clothing", "type": "product" },
      "variants_count": 3,
      "created_at": "2026-01-01T00:00:00.000000Z",
      "updated_at": "2026-01-01T00:00:00.000000Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 15,
    "total": 73
  }
}
```

---

### 4.2 Get Product Detail

**Endpoint**: `GET /products/{id}`  
**Auth required**: Yes

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Kaos Polos",
    "sku": "PROD-ABC123",
    "barcode": "1234567890",
    "has_variants": true,
    "category": { "id": 1, "name": "Clothing", "type": "product" },
    "variants": [
      {
        "id": 10,
        "product_id": 1,
        "sku": "VAR-XYZ",
        "barcode": "9876543210",
        "price": 50000.0,
        "cost_price": 30000.0,
        "stock": 15,
        "unit": "pcs",
        "combination": { "Warna": "Merah", "Ukuran": "M" },
        "formatted_combination": "Merah / M",
        "is_active": true,
        "thumbnail_url": null,
        "created_at": "2026-01-01T00:00:00.000000Z"
      }
    ],
    "variant_groups": [
      {
        "id": 1,
        "name": "Warna",
        "options": [
          { "id": 1, "value": "Merah" },
          { "id": 2, "value": "Biru" }
        ]
      },
      {
        "id": 2,
        "name": "Ukuran",
        "options": [
          { "id": 3, "value": "M" },
          { "id": 4, "value": "L" }
        ]
      }
    ]
  }
}
```

---

### 4.3 Find Product by Barcode

**Endpoint**: `GET /products/barcode/{code}`  
**Auth required**: Yes

Searches both **product barcode** and **variant barcode**.

**Request Example**:
```
GET /api/mobile/v1/products/barcode/9876543210
```

**Success Response – Product barcode** `200 OK`:
```json
{
  "success": true,
  "type": "product",
  "data": { ... }
}
```

**Success Response – Variant barcode** `200 OK`:
```json
{
  "success": true,
  "type": "variant",
  "variant_id": 10,
  "data": { ... }
}
```

> Use `type` field to know whether the barcode matched a product or a variant.  
> Use `variant_id` to pre-select the matched variant in your UI.

**Not Found** `404`:
```json
{
  "success": false,
  "message": "Product or variant with that barcode was not found."
}
```

---

### 4.4 Create Product

**Endpoint**: `POST /products`  
**Auth required**: Yes  
**Content-Type**: `multipart/form-data` (if uploading image), otherwise `application/json`

**Request Body**:

| Field | Type | Required | Description |
|---|---|---|---|
| `category_id` | int | ✅ | Must exist in categories table |
| `name` | string | ✅ | Max 255 chars |
| `sku` | string | ❌ | Auto-generated if empty |
| `barcode` | string | ❌ | Product barcode |
| `unit` | string | ✅ | e.g. `pcs`, `kg`, `box` |
| `has_variants` | bool | ❌ | Default `false` |
| `cost_price` | float | ✅* | *Required if `has_variants=false` |
| `price` | float | ✅* | *Required if `has_variants=false` |
| `stock` | int | ✅* | *Required if `has_variants=false` |
| `image` | file | ❌ | JPEG/PNG/WEBP, max 2MB |

**Example (Simple Product)**:
```json
{
  "category_id": 1,
  "name": "Buku Tulis",
  "sku": "BUKU-001",
  "barcode": "1234567890123",
  "unit": "pcs",
  "has_variants": false,
  "cost_price": 3000,
  "price": 5000,
  "stock": 100
}
```

**Success Response** `201 Created`:
```json
{
  "success": true,
  "message": "Product created successfully.",
  "data": { ... }
}
```

---

### 4.5 Update Product

**Endpoint**: `PUT /products/{id}`  
**Auth required**: Yes  
**Content-Type**: `multipart/form-data` or `application/json`

Same body fields as Create. For `multipart/form-data`, add `_method=PUT`.

**Success Response** `200 OK`:
```json
{
  "success": true,
  "message": "Product updated successfully.",
  "data": { ... }
}
```

---

### 4.6 Delete Product

**Endpoint**: `DELETE /products/{id}`  
**Auth required**: Yes

**Success Response** `200 OK`:
```json
{
  "success": true,
  "message": "Product deleted successfully."
}
```

---

## 5. Product Variants

### 5.1 List Variants

**Endpoint**: `GET /products/{product_id}/variants`  
**Auth required**: Yes

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": [
    {
      "id": 10,
      "product_id": 1,
      "sku": "VAR-XYZ",
      "barcode": "9876543210",
      "price": 50000.0,
      "cost_price": 30000.0,
      "stock": 15,
      "unit": "pcs",
      "combination": { "Warna": "Merah", "Ukuran": "M" },
      "formatted_combination": "Merah / M",
      "is_active": true,
      "display_order": 0,
      "thumbnail_url": null,
      "medium_url": null,
      "original_url": null,
      "created_at": "2026-01-01T00:00:00.000000Z",
      "updated_at": "2026-01-01T00:00:00.000000Z"
    }
  ]
}
```

---

### 5.2 Create Variant

**Endpoint**: `POST /products/{product_id}/variants`  
**Auth required**: Yes

**Request Body**:

| Field | Type | Required | Description |
|---|---|---|---|
| `price` | float | ✅ | Selling price |
| `cost_price` | float | ✅ | Cost/purchase price |
| `stock` | int | ✅ | Initial stock |
| `sku` | string | ❌ | Auto-generated if empty |
| `barcode` | string | ❌ | Variant barcode |
| `unit` | string | ❌ | Defaults to parent product's unit |
| `combination` | object | ❌ | e.g. `{"Warna":"Merah","Ukuran":"M"}` |
| `is_active` | bool | ❌ | Default `true` |

**Example**:
```json
{
  "price": 50000,
  "cost_price": 30000,
  "stock": 20,
  "barcode": "9876543210",
  "combination": { "Warna": "Merah", "Ukuran": "M" }
}
```

**Success Response** `201 Created`:
```json
{
  "success": true,
  "message": "Variant created successfully.",
  "data": { ... }
}
```

---

### 5.3 Update Variant

**Endpoint**: `PUT /products/{product_id}/variants/{variant_id}`  
**Auth required**: Yes

**Request Body**:

| Field | Type | Required |
|---|---|---|
| `price` | float | ✅ |
| `cost_price` | float | ✅ |
| `stock` | int | ✅ |
| `sku` | string | ❌ |
| `barcode` | string | ❌ |
| `unit` | string | ❌ |
| `is_active` | bool | ❌ |

**Success Response** `200 OK`:
```json
{
  "success": true,
  "message": "Variant updated successfully.",
  "data": { ... }
}
```

---

### 5.4 Delete Variant

**Endpoint**: `DELETE /products/{product_id}/variants/{variant_id}`  
**Auth required**: Yes

**Success Response** `200 OK`:
```json
{
  "success": true,
  "message": "Variant deleted successfully."
}
```

---

## 6. Suppliers

### 6.1 List Suppliers

**Endpoint**: `GET /suppliers`  
**Auth required**: Yes

**Query Parameters**:

| Param | Type | Description |
|---|---|---|
| `search` | string | Search by name, contact_person, or phone |
| `per_page` | int | Default: 50 |

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "CV Maju Jaya",
      "contact_person": "Budi",
      "phone": "081234567890",
      "email": "budi@majujaya.com",
      "address": "Jl. Contoh No. 1",
      "created_at": "2026-01-01T00:00:00.000000Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 1,
    "total": 5
  }
}
```

---

### 6.2 Get Supplier Detail

**Endpoint**: `GET /suppliers/{id}`  
**Auth required**: Yes

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": { ... }
}
```

---

### 6.3 Create Supplier

**Endpoint**: `POST /suppliers`  
**Auth required**: Yes

**Request Body**:

| Field | Type | Required |
|---|---|---|
| `name` | string | ✅ |
| `contact_person` | string | ❌ |
| `phone` | string | ❌ |
| `email` | string | ❌ |
| `address` | string | ❌ |

**Success Response** `201 Created`:
```json
{
  "success": true,
  "message": "Supplier created successfully.",
  "data": { ... }
}
```

---

## 7. Purchases (Stock In)

### 7.1 List Purchases

**Endpoint**: `GET /purchases`  
**Auth required**: Yes

**Query Parameters**:

| Param | Type | Description |
|---|---|---|
| `search` | string | Filter by invoice number |
| `status` | string | `pending` \| `received` \| `canceled` |
| `per_page` | int | Default: 15 |

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "invoice_number": "INV-2026-001",
      "purchase_date": "2026-04-05",
      "total_amount": 500000.0,
      "status": "received",
      "notes": null,
      "supplier": {
        "id": 1,
        "name": "CV Maju Jaya",
        "contact_person": "Budi",
        "phone": "081234567890",
        "email": null,
        "address": null,
        "created_at": "2026-01-01T00:00:00.000000Z"
      },
      "creator": { "id": 1, "name": "Admin" },
      "created_at": "2026-04-05T11:00:00.000000Z",
      "updated_at": "2026-04-05T11:00:00.000000Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 3,
    "per_page": 15,
    "total": 32
  }
}
```

---

### 7.2 Get Purchase Detail

**Endpoint**: `GET /purchases/{id}`  
**Auth required**: Yes

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "invoice_number": "INV-2026-001",
    "purchase_date": "2026-04-05",
    "total_amount": 500000.0,
    "status": "received",
    "notes": "Barang diterima lengkap",
    "supplier": { ... },
    "creator": { "id": 1, "name": "Admin" },
    "details": [
      {
        "id": 1,
        "product_id": 5,
        "product": { "id": 5, "name": "Buku Tulis", "sku": "BUKU-001", "unit": "pcs" },
        "variant_id": null,
        "variant": null,
        "qty": 50.0,
        "cost_price": 3000.0,
        "subtotal": 150000.0
      },
      {
        "id": 2,
        "product_id": 1,
        "product": { "id": 1, "name": "Kaos Polos", "sku": "PROD-ABC123", "unit": "pcs" },
        "variant_id": 10,
        "variant": {
          "id": 10,
          "sku": "VAR-XYZ",
          "combination": { "Warna": "Merah", "Ukuran": "M" },
          "formatted_combination": "Merah / M"
        },
        "qty": 10.0,
        "cost_price": 30000.0,
        "subtotal": 300000.0
      }
    ],
    "created_at": "2026-04-05T11:00:00.000000Z",
    "updated_at": "2026-04-05T11:00:00.000000Z"
  }
}
```

---

### 7.3 Create Purchase (Stock In)

**Endpoint**: `POST /purchases`  
**Auth required**: Yes

**Request Body**:

| Field | Type | Required | Description |
|---|---|---|---|
| `supplier_id` | int | ✅ | Must exist |
| `invoice_number` | string | ✅ | Must be unique |
| `purchase_date` | date | ✅ | Format: `YYYY-MM-DD` |
| `status` | string | ✅ | `pending` or `received` |
| `notes` | string | ❌ | Optional notes |
| `items` | array | ✅ | Min 1 item |
| `items[].product_id` | int | ✅ | Must exist |
| `items[].variant_id` | int | ❌ | If product has variants, specify variant |
| `items[].qty` | number | ✅ | Min 0.01 |
| `items[].cost_price` | number | ✅ | Min 0 |

> ℹ️ If `status = "received"`, stock is **immediately updated** for the relevant product or variant.  
> If `status = "pending"`, stock is updated only when the status is changed to `received` via the [Update Status](#74-update-purchase-status) endpoint.

**Example Request**:
```json
{
  "supplier_id": 1,
  "invoice_number": "INV-2026-004",
  "purchase_date": "2026-04-05",
  "status": "received",
  "notes": "Kiriman bulan April",
  "items": [
    {
      "product_id": 5,
      "variant_id": null,
      "qty": 50,
      "cost_price": 3000
    },
    {
      "product_id": 1,
      "variant_id": 10,
      "qty": 10,
      "cost_price": 30000
    }
  ]
}
```

**Success Response** `201 Created`:
```json
{
  "success": true,
  "message": "Purchase created successfully.",
  "data": { ... }
}
```

---

### 7.4 Update Purchase Status

**Endpoint**: `PATCH /purchases/{id}/status`  
**Auth required**: Yes

> Only `pending` purchases can be updated.

**Request Body**:
```json
{
  "status": "received"
}
```

| Field | Type | Allowed Values |
|---|---|---|
| `status` | string | `received` \| `canceled` |

**Success Response** `200 OK`:
```json
{
  "success": true,
  "message": "Purchase status updated.",
  "data": { ... }
}
```

**Error Response** `422`:
```json
{
  "success": false,
  "message": "Only pending purchases can be updated."
}
```

---

## 8. Error Responses

### Standard Error Format

All errors return JSON. The HTTP status code indicates the error type.

| Status | Situation |
|---|---|
| `401` | Missing or invalid Bearer token |
| `403` | Authenticated but forbidden |
| `404` | Resource not found |
| `422` | Validation error |
| `500` | Server error |

**Validation Error** `422`:
```json
{
  "message": "The email field is required.",
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password field is required."]
  }
}
```

**Not Found** `404`:
```json
{
  "message": "No query results for model [App\\Models\\Product] 999"
}
```

**Unauthenticated** `401`:
```json
{
  "message": "Unauthenticated."
}
```

---

## 9. Android Integration Guide

### Step 1 – Start Laravel Server

```bash
cd /path/to/pos
php artisan serve --host=0.0.0.0 --port=8000
```

For Android **emulator**: use `http://10.0.2.2:8000`  
For Android **physical device** (same WiFi): use laptop's local IP, e.g. `http://192.168.1.5:8000`

---

### Step 2 – Add Internet Permission

In `AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
```

For non-HTTPS (HTTP) requests on Android 9+, add in `AndroidManifest.xml` inside `<application>`:
```xml
<application
    android:usesCleartextTraffic="true"
    ...>
```

Or create `res/xml/network_security_config.xml`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">192.168.1.5</domain>
        <domain includeSubdomains="true">10.0.2.2</domain>
    </domain-config>
</network-security-config>
```

And reference it:
```xml
<application android:networkSecurityConfig="@xml/network_security_config">
```

---

### Step 3 – HTTP Headers for Every Request

```
Authorization: Bearer <token>
Accept: application/json
Content-Type: application/json
```

---

### Step 4 – Upload Image (Multipart)

When creating/updating a product with an image, use `multipart/form-data`. For `PUT` requests, add `_method=PUT` as a form field (Laravel method spoofing).

**Retrofit Example (Kotlin)**:
```kotlin
val body = MultipartBody.Builder()
    .setType(MultipartBody.FORM)
    .addFormDataPart("_method", "PUT")          // for update
    .addFormDataPart("name", "Kaos Polos")
    .addFormDataPart("category_id", "1")
    .addFormDataPart("unit", "pcs")
    .addFormDataPart("price", "50000")
    .addFormDataPart("cost_price", "30000")
    .addFormDataPart("stock", "100")
    .addFormDataPart("image",
        "photo.jpg",
        file.asRequestBody("image/jpeg".toMediaType())
    )
    .build()
```

---

### Step 5 – Barcode Scanning Flow

Recommended library: [ZXing Android Embedded](https://github.com/journeyapps/zxing-android-embedded) or [ML Kit Barcode Scanning](https://developers.google.com/ml-kit/vision/barcode-scanning/android)

**Flow**:
1. User taps **Scan Barcode** button
2. Open camera scanner
3. On barcode detected → call `GET /products/barcode/{code}`
4. If `success: true` and `type: "product"` → show product detail
5. If `success: true` and `type: "variant"` → show product detail with that variant pre-selected
6. If `success: false` (404) → show "Product not found, add new?" prompt

---

### Step 6 – Token Storage

Store the token in **EncryptedSharedPreferences** (Android Keystore-backed):
```kotlin
val masterKey = MasterKey.Builder(context)
    .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
    .build()

val prefs = EncryptedSharedPreferences.create(
    context,
    "secure_prefs",
    masterKey,
    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
)

prefs.edit().putString("auth_token", token).apply()
```

---

### Step 7 – Recommended Architecture (Android)

```
app/
├── data/
│   ├── remote/
│   │   ├── ApiService.kt          # Retrofit interface
│   │   ├── ApiClient.kt           # OkHttp + Retrofit setup
│   │   └── dto/                   # Response data classes
│   ├── local/
│   │   └── TokenManager.kt        # EncryptedSharedPreferences
│   └── repository/
│       ├── AuthRepository.kt
│       ├── ProductRepository.kt
│       ├── PurchaseRepository.kt
│       └── ...
├── domain/
│   ├── model/                     # Business entities
│   └── usecase/                   # Use cases
├── presentation/
│   ├── auth/
│   │   ├── LoginActivity.kt
│   │   └── LoginViewModel.kt
│   ├── product/
│   │   ├── ProductListFragment.kt
│   │   ├── ProductDetailFragment.kt
│   │   ├── ProductFormFragment.kt
│   │   └── ProductViewModel.kt
│   ├── purchase/
│   │   ├── PurchaseListFragment.kt
│   │   ├── PurchaseCreateFragment.kt
│   │   └── PurchaseViewModel.kt
│   └── profile/
│       └── ProfileFragment.kt
└── MainActivity.kt               # NavController host
```

---

### Complete curl Examples

```bash
BASE="http://127.0.0.1:8000/api/mobile/v1"

# Login
TOKEN=$(curl -s -X POST "$BASE/login" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"admin@example.com","password":"password","device_name":"curl-test"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['token'])")

echo "Token: $TOKEN"

# Get Me
curl -s "$BASE/me" -H "Authorization: Bearer $TOKEN" -H "Accept: application/json" | python3 -m json.tool

# Dashboard
curl -s "$BASE/dashboard" -H "Authorization: Bearer $TOKEN" -H "Accept: application/json" | python3 -m json.tool

# Products (page 1)
curl -s "$BASE/products?per_page=5" -H "Authorization: Bearer $TOKEN" -H "Accept: application/json" | python3 -m json.tool

# Find by barcode
curl -s "$BASE/products/barcode/1234567890" -H "Authorization: Bearer $TOKEN" -H "Accept: application/json" | python3 -m json.tool

# Categories
curl -s "$BASE/categories" -H "Authorization: Bearer $TOKEN" -H "Accept: application/json" | python3 -m json.tool

# Suppliers
curl -s "$BASE/suppliers" -H "Authorization: Bearer $TOKEN" -H "Accept: application/json" | python3 -m json.tool

# Create Purchase
curl -s -X POST "$BASE/purchases" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "supplier_id": 1,
    "invoice_number": "INV-TEST-001",
    "purchase_date": "2026-04-05",
    "status": "received",
    "items": [
      { "product_id": 1, "variant_id": null, "qty": 10, "cost_price": 5000 }
    ]
  }' | python3 -m json.tool

# Logout
curl -s -X POST "$BASE/logout" -H "Authorization: Bearer $TOKEN" -H "Accept: application/json" | python3 -m json.tool
```
