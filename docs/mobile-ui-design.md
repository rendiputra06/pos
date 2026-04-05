# Mobile UI/UX Design Specification: Product Management

To ensure a seamless transition from the web system, the mobile app should follow these design principles and screen flows.

## 1. Product List Screen
- **Visuals**: Use a clean list/grid with high-quality thumbnails.
- **Indicators**: 
  - **Low Stock Label**: Red "Low Stock" pill if stock <= threshold.
  - **Variant Badge**: Overlay indicating "Varian: 3" or similar.
- **Actions**: Floating Action Button (FAB) for "Add New Product" and a persistent Search Bar at the top with a Barcode Scanner icon.

## 2. Product Detail & Edit Screen
- **Header**: Large image carousel for the product gallery.
- **Toggle**: A clear "Memiliki Varian?" (Has Variants?) switch.
- **Conditional Layout**:
  - `Offline/Simple`: Show Price, Cost, and Stock fields directly.
  - `Variant`: Show a summary of total stock/price range and a button "Kelola Varian" (Manage Variants).

## 3. Variant Management Screen (Web Parity)
This screen is critical for administrative speed.
- **Top Section**: List of active groups (e.g., "Warna: Merah, Biru").
- **Add Group Button**: Trigger a modal to select type (Warna, Ukuran, Material).
- **Generate Button**: A prominent, secondary color button labeled "Generate Semua Kombinasi".
  - *Interaction*: Show a confirmation dialog ("Ini akan membuat 6 varian baru. Lanjutkan?").
- **Combination List**: 
  - Each item shows "Merah / M" -> Price / Stock.
  - Tapping an item opens a quick edit sheet for Barcode and Stock adjustment.

## 4. Scan & Action (Quick Look)
- **Workflow**: Scanner opens -> Code found -> Match found?
  - `Match (Simple)`: Open Product Detail.
  - `Match (Variant)`: Open Product Detail and automatically scroll to/highlight that specific variant.
  - `No Match`: Ask "Produk tidak ditemukan. Tambah baru?".

## 5. Aesthetics & Tech
- **Typography**: Use *Inter* or *Outfit* for modern readability.
- **Feedback**: Use subtle Haptic Feedback (vibrations) on successful barcode scans.
- **States**: Implement Skeleton Loaders for the product grid to feel premium.
