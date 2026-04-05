# Product & Variant API Reference (Mobile v1)

This document provides a deep dive into the product management endpoints for the mobile client.

## 1. Product Lifecycle

### 1.1 List & Search
- `GET /products`: Main list with pagination. Supports `search`, `category_id`, and `has_variants`.
- `GET /products/low-stock`: Returns items requiring attention.

### 1.2 Creation & Detail
- `POST /products`: Create new base product.
- `GET /products/{id}`: Detailed view including variants and groups.
- `PUT /products/{id}`: Basic info update.
- `DELETE /products/{id}`: Cascades to variants.

### 1.3 Barcode Handling
- `GET /products/barcode/{code}`: Quick lookup for scanners. Returns `type` ("product" or "variant").

---

## 2. Variant Management (The "Web Parity" Flow)

For products where `has_variants = true`, follow this operational sequence:

1.  **Define Groups**: `POST /products/{id}/variant-groups` (e.g., "Size", "Color").
2.  **Add Options**: `POST /products/{id}/variant-groups/{gid}/options` (e.g., "Red", "Blue").
3.  **Generate**: `POST /products/{id}/generate-variants`. This creates the `ProductVariant` records automatically.
4.  **Refine**: `PUT /products/{id}/variants/{vid}` to set specific price/stock/barcode for that combination.

### Variant Endpoints:
- `GET /products/{id}/variants`: List generated combinations.
- `POST /products/{id}/variants/{id}/image`: Set specific image for a variant.

---

## 3. Media & Assets
- **Gallery**: `POST /products/{id}/images` (Multi-upload).
- **Variant Image**: One image per variant combination.
- **URLs**: Always use `thumbnail_url` for lists and `original_url` for zoom views.
