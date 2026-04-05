# LUXORA AI — Proje Dokümantasyonu

> **Oluşturulma:** 5 Nisan 2026
> **Repo:** [github.com/aemregul/luxora-ai](https://github.com/aemregul/luxora-ai)
> **Sunum Tarihi:** 8 Nisan 2026 (Salı)

Bu dosyayı okuyan her AI oturumu projeyi sıfırdan anlayabilir.

---

## 🎯 Projenin Özü (En Önemli Kısım)

**Tek cümle:** SketchUp'ı kullanan mimar = LUXORA'yı kullanan normal insan.

- **SketchUp** → profesyonel yazılım, mimar/iç mimar gerektirir
- **LUXORA** → aynı çıktıyı yapay zeka ile doğal dilde üretir, sıfır teknik bilgi gerekir

**Hedef müşteri:** İnşaat şirketleri (başlangıçta spesifik bir firmaya, sonra SaaS olarak sektöre)

**Asıl değer:** "Lamel panel 15cm su yeşili rengi TV ünitesinin yanına koy" → sistem koyar, 3D'de gösterir, içinde gezilir

---

## 🚨 KRİTİK ÇALIŞMA KURALLARI

1. **main'e direkt push YASAK** — her değişiklik branch'ta, test edilip merge edilir
2. **Bir şeyi düzeltirken başka şeyleri bozma** — etki analizi önce yapılır
3. **Sessizce değişiklik yapma** — ne yapacağını, hangi dosyayı değiştireceğini önceden söyle
4. **Sadece istenen şeye odaklan** — ekstra "iyileştirme" ekleme
5. **Öncelik: stabilite** — yeni özellik eklemeden önce mevcut sistem çalışıyor olmalı

---

## 🏗️ Teknik Mimari Kararları

### Stack (kesinleşti)
| Katman | Teknoloji | Neden |
|--------|-----------|-------|
| Backend | FastAPI + SQLAlchemy + Alembic | PepperRoot'tan kopyalandı |
| Frontend | Next.js + TypeScript | PepperRoot'tan |
| 3D Engine | react-three-fiber + drei | plan3D.in ile aynı (Three.js wrapper) |
| AI | Claude API | Spatial reasoning için ideal |
| Render | FLUX Inpaint via fal.ai | Fotorealistik 2D çıktı |
| DB | PostgreSQL | PepperRoot'tan |
| Auth | Google OAuth 2.0 + JWT | PepperRoot'tan |

### PepperRoot'tan Ne Kopyalanacak (5 dosya)
```
backend/app/core/config.py      → LUXORA ayarlarına uyarla
backend/app/core/database.py    → birebir aynı
backend/app/core/auth.py        → birebir aynı
backend/app/api/routes/auth.py  → Google OAuth (birebir)
backend/requirements.txt        → gereksiz paketleri çıkar
```
**Geri kalan her şey sıfırdan yazılır.** PepperRoot'un %75'i LUXORA için gereksiz.

### Klasör Yapısı (Hedef)
```
luxora-ai/
├── backend/
│   ├── app/
│   │   ├── core/               ← config, database, auth (PepperRoot'tan)
│   │   ├── models/
│   │   │   └── models.py       ← Room, Furniture, WallPanel, Project, User
│   │   ├── api/routes/
│   │   │   ├── auth.py         ← Google OAuth (PepperRoot'tan)
│   │   │   ├── rooms.py        ← 3D sahne CRUD
│   │   │   ├── furniture.py    ← Mobilya kataloğu
│   │   │   ├── chat.py         ← AI komut endpoint'i
│   │   │   └── projects.py     ← Proje yönetimi
│   │   ├── services/
│   │   │   ├── agent/
│   │   │   │   ├── orchestrator.py  ← Claude API + sahne JSON yönetimi
│   │   │   │   └── tools.py         ← 3D araçlar (add_furniture, add_wall_panel...)
│   │   │   ├── scene_service.py     ← Sahne JSON işlemleri
│   │   │   └── render_service.py    ← FLUX render (Faz 2)
│   │   └── main.py
│   ├── alembic/
│   └── requirements.txt
└── frontend/
    └── src/
        ├── app/               ← Next.js pages
        ├── components/
        │   ├── RoomEditor/    ← Ana 3D editör (react-three-fiber)
        │   ├── ChatPanel/     ← AI komut paneli
        │   ├── Sidebar/       ← Proje listesi, mobilya kataloğu
        │   └── FloorPlan/     ← 2D kat planı görünümü
        └── lib/
            └── api.ts
```

---

## 🖥️ Ürün Özellikleri (Kesinleşmiş)

### İki Görünüm Modu
1. **Editör Modu:** Sol taraf 2D kat planı, sağ taraf 3D görünüm (plan3D.in benzeri)
2. **Walkthrough Modu:** First-person gezinme (PointerLockControls) — "odanın içine gir"

### AI Komut Motoru
- Claude API, Türkçe doğal dil komutları alır
- Sahne JSON'unu bağlam olarak görür → spatial reasoning yapar
- "TV ünitesinin yanı" → TV ünitesinin koordinat + genişliğini hesaplar → tam koordinat
- Komut → Scene JSON güncelleme → Three.js anında render

### Scene Graph (Veri Modeli)
```json
{
  "room": { "width": 450, "length": 320, "height": 270 },
  "objects": [
    { "id": "tv-unite-001", "type": "furniture", "model": "tv_unit_180.glb",
      "position": { "x": 135, "y": 0, "z": 0 },
      "dimensions": { "w": 180, "d": 45, "h": 55 } },
    { "id": "lamel-001", "type": "wall_panel", "subtype": "lamel",
      "wall": "north", "start_x": 315,
      "dimensions": { "width": 120, "height": 270, "slat_width": 15 },
      "color": "#7BC8A4", "material": "oak" }
  ]
}
```
**Tüm ölçüler cm cinsindendir.** 1 three.js birimi = 1 cm.

### Parametrik Duvar Panelleri
- Lamel panel (ahşap çıtalı): slat genişliği, aralık, renk, malzeme parametrik
- Sistem: duvar alanına kaç adet slat sığar otomatik hesaplar
- Kullanıcı: "15cm genişlik, 2cm aralık, meşe rengi" → sistem üretir

### Tıklayıp Değiştir
- Three.js raycasting → tıklanan nesne ID yakalanır
- Sağ panel: mobilya kataloğu açılır
- Kullanıcı alternatif seçer → sahne anında güncellenir
- Veya AI'ya söylenir: "bunu Minotti koltukla değiştir"

### Mobilya Kataloğu
- GLTF/GLB formatında, **gerçek üretici ölçüleri** ile
- Başlangıç: inşaat firmasının kendi mobilya kataloğu sisteme yüklenir
- Sonra: IKEA Open Data, Sketchfab lisanslı modeller

### Fotorealistik Render (Faz 2)
- Three.js screenshot → FLUX + ControlNet → fotorealistik 2D görsel
- Müşteriye "bu oda böyle görünecek" sunumu

---

## 🤖 AI Araçlar Listesi (tools.py'de tanımlanacak)

| Araç | Ne Yapar |
|------|----------|
| `create_room(width, length, height)` | Yeni 3D oda oluşturur |
| `add_furniture(catalog_id, position, rotation)` | Katalogdan mobilya yerleştirir |
| `remove_furniture(instance_id)` | Mobilyayı kaldırır |
| `move_furniture(instance_id, new_position)` | Mobilyayı taşır |
| `rotate_furniture(instance_id, angle)` | Mobilyayı döndürür |
| `add_wall_panel(wall, type, config)` | Duvar kaplaması ekler |
| `remove_wall_panel(wall)` | Duvar kaplamasını kaldırır |
| `change_floor_material(material, color)` | Zemin malzemesi değiştirir |
| `change_wall_color(wall, color)` | Duvar rengi değiştirir |
| `search_furniture(query, category)` | Katalogda arama yapar |
| `get_room_summary()` | Mevcut sahne durumunu döner |

---

## 📋 Gelişim Roadmap

### Faz 1 — MVP (Şu An)
- [ ] Repo kurulumu (5 dosya PepperRoot'tan kopyala)
- [ ] DB modelleri: Room, Furniture, WallPanel, Project, User
- [ ] Backend API: rooms, furniture catalog, chat
- [ ] Frontend: Next.js + react-three-fiber kurulumu
- [ ] 3D Room Editor: boş oda render (ölçülü)
- [ ] Parametrik lamel panel oluşturma
- [ ] AI komut → Scene JSON güncelleme (Claude API)
- [ ] Mobilya kataloğu (5 demo GLB model)
- [ ] First-person walkthrough

### Faz 2 — Polishing
- [ ] Tıklayıp değiştir (raycasting)
- [ ] Fotorealistik render (FLUX + ControlNet)
- [ ] PDF/görsel export
- [ ] Revizyon geçmişi
- [ ] Müşteri paylaşım linki (read-only view)

### Faz 3 — Ölçekleme
- [ ] SaaS model (şirket başına lisans)
- [ ] Katalog yönetim paneli (firmalar kendi modellerini yükler)
- [ ] Orta Doğu lansmanı (Arapça destek)
- [ ] GaussianGPT benzeri AI sahne üretimi (araştırma aşamasında)

---

## 🎨 Sunum (Pitch Deck)

**Dosya:** `/Users/emre/Desktop/luxora/interior_ai_pitch.html`
**Sunum tarihi:** 8 Nisan 2026 (Salı)

### Sunum Durumu
- [x] Marka adı: INTERIOR AI → LUXORA düzeltildi
- [ ] Slide 5: Animasyonlu oda demo (boş → dolu, m² göstergeli) — YAPILACAK
- [ ] Slide 4 pipeline: 3D editör akışına güncelle — YAPILACAK
- [ ] Slide 8 timeline: MVP maddelerini güncelle — YAPILACAK

### Sunumun Ana Mesajı
"SketchUp için mimar lazım, LUXORA için sadece siz yetersiniz."

---

## 🏢 İş Bağlamı

- **İlk müşteri:** Spesifik bir inşaat firması (isim paylaşılmadı)
- **İlk kullanım:** Daire/villa iç mekan tasarımını müşteriye sunmak — daire henüz yapılmamışken müşteri içinde "geziyor", mobilya seçiyor
- **Genişleme:** Başarılı olursa diğer inşaat firmalarına SaaS olarak satış
- **Coğrafya:** Türkiye önce, sonra Orta Doğu (Suudi Arabistan, UAE — AutoCAD uzmanı bulmak zor)
- **Rakipler:** Coohom (API yok), plan3D.in (küçük proje), SketchUp (profesyonel ama karmaşık)
- **Rekabet avantajı:** Türkçe AI, kendi mobilya kataloğu entegrasyonu, mimar gerekmemesi

---

## 🔧 Çalıştırma Komutları

```bash
# Backend
cd /Users/emre/luxora-ai/backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend
cd /Users/emre/luxora-ai/frontend
npm run dev
```

### URL'ler
| Ortam | Frontend | Backend |
|-------|----------|---------|
| Lokal | http://localhost:3000 | http://localhost:8000 |

---

## 📊 Referanslar

- **plan3D.in** — Three.js + react-three-fiber ile yapılmış, 2D plan + 3D görünüm, en yakın teknik referans
- **Coohom** — Doğrudan rakip, matür platform ama Türkçe/bölgesel değil
- **PlayCanvas SuperSplat** — Gaussian Splatting walkthrough (Faz 3 için referans)
- **SpatialLM** — Fotoğraftan 3D nesne tanıma (Faz 2 için)
- **GaussianGPT** — Autoregressive 3D sahne üretimi (araştırma, Faz 3)
- **PepperRoot AI Agency** — Bu projenin çıktığı kaynak repo, altyapı buradan

---

## 💡 Önemli Teknik Notlar

1. **Ölçü birimi:** Her yerde cm. Three.js'te 1 birim = 1 cm. Oda 450 × 320 × 270 birim.
2. **Mobilya modelleri:** GLTF/GLB formatı, üretici ölçüleri metadata olarak gömülü
3. **Lamel panel:** BoxGeometry'den parametrik üretim, her slat ayrı mesh
4. **Spatial reasoning:** Claude API'ye Scene JSON verilir, "yanına" gibi ifadeler koordinata çevrilir
5. **react-three-fiber:** Three.js'in React wrapper'ı, plan3D.in de bunu kullanıyor (#r3f hashtag)
6. **PepperRoot kopyalanmaz:** Sadece 5 core dosya alınır, geri kalan LUXORA için sıfırdan
