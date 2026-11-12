<!DOCTYPE html>
<html lang="my">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
  <title>စာကြည့်တိုက် — My Bookshelf</title>

  <!-- PWA Manifest & Mobile App Meta Tags -->
  <link rel="manifest" href="./manifest.json" />
  <meta name="theme-color" content="#FAF7F2" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content="စာကြည့်တိုက်" />

  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Padauk:wght@400;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400;1,600&display=swap');

    :root {
      --bg-cream: #FAF7F2;
      --bg-card: #F3EFE6;
      --bg-alcove: #DFD8CC;
      --border-warm: #E5DEC9;
      --text-espresso: #2B2118;
      --text-muted: #7A6B58;
      --accent-brown: #5C4430;
    }

    body.dark-cozy {
      --bg-cream: #181512;
      --bg-card: #24201C;
      --bg-alcove: #120F0D;
      --border-warm: #332C25;
      --text-espresso: #F5EFE6;
      --text-muted: #A39686;
      --accent-brown: #D4A373;
    }

    body {
      font-family: 'Padauk', sans-serif;
      background-color: var(--bg-cream);
      color: var(--text-espresso);
      line-height: 1.75;
      -webkit-tap-highlight-color: transparent;
      overscroll-behavior-y: contain;
      transition: background-color 0.3s ease, color 0.3s ease;
    }

    .font-serif-editorial {
      font-family: 'Playfair Display', 'Padauk', Georgia, serif;
    }

    .cozy-card {
      background-color: var(--bg-card);
      border: 1px solid var(--border-warm);
    }

    .cozy-outline-card {
      background-color: rgba(255, 255, 255, 0.55);
      border: 1px solid var(--border-warm);
    }
    body.dark-cozy .cozy-outline-card {
      background-color: rgba(36, 32, 28, 0.75);
    }

    /* Tactile One-Touch Button Feedback */
    .tactile-btn {
      transition: transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.15s ease;
    }
    .tactile-btn:active {
      transform: scale(0.93);
    }

    /* Recessed Alcove Bookshelf Container (Video Style) */
    .alcove-container {
      background-color: var(--bg-alcove);
      border-radius: 26px;
      box-shadow:
        inset 0 6px 16px rgba(43, 33, 24, 0.12),
        inset 0 -4px 10px rgba(43, 33, 24, 0.08);
      border: 1px solid var(--border-warm);
    }

    /* Category Pill inside Alcove Shelf */
    .shelf-label-pill {
      background: rgba(250, 247, 242, 0.72);
      backdrop-filter: blur(6px);
      border: 1px solid rgba(154, 123, 86, 0.22);
      color: var(--text-espresso);
    }
    body.dark-cozy .shelf-label-pill {
      background: rgba(36, 32, 28, 0.85);
      border-color: rgba(212, 163, 115, 0.25);
    }

    /* Wooden Ledge Plank */
    .wooden-ledge {
      height: 14px;
      background: linear-gradient(180deg, #C2A687 0%, #A38462 55%, #876A4A 100%);
      border-radius: 4px;
      box-shadow:
        0 8px 14px rgba(43, 33, 24, 0.26),
        0 2px 4px rgba(43, 33, 24, 0.18),
        inset 0 1px 1px rgba(255, 255, 255, 0.45);
    }

    /* 3D Cover on Shelf */
    .shelf-book-cover {
      position: relative;
      aspect-ratio: 2 / 3;
      border-radius: 3px 5px 5px 3px;
      box-shadow:
        -3px 4px 10px rgba(0, 0, 0, 0.32),
        2px 0 0 #F5EFE6,
        3px 0 0 #D6CFC2;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
      background: #3A2E25;
    }
    .shelf-book-cover:hover {
      transform: translateY(-6px) scale(1.03);
    }
    .shelf-book-cover::after {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0.25) 0%,
        rgba(0, 0, 0, 0.35) 3.5%,
        rgba(255, 255, 255, 0.2) 6%,
        transparent 15%
      );
      pointer-events: none;
    }

    /* Realistic Vertical Book Spine (Video Spines Mode) */
    .book-spine-item {
      position: relative;
      border-radius: 3px 3px 1px 1px;
      box-shadow:
        -2px 2px 6px rgba(0, 0, 0, 0.28),
        inset 3px 0 5px rgba(255, 255, 255, 0.22),
        inset -3px 0 6px rgba(0, 0, 0, 0.32);
      cursor: pointer;
      transition: transform 0.22s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding: 6px 2px;
      overflow: hidden;
      user-select: none;
    }
    .book-spine-item:hover {
      transform: translateY(-7px);
      z-index: 10;
    }
    .spine-vertical-text {
      writing-mode: vertical-rl;
      text-orientation: mixed;
      transform: rotate(180deg);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-height: 78%;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.03em;
      line-height: 1;
    }

    /* Flickering Candle Animation */
    @keyframes candleFlicker {
      0%, 100% { transform: scale(1) rotate(-1deg); opacity: 0.95; }
      50% { transform: scale(1.08) rotate(2deg); opacity: 1; }
    }
    .candle-flame {
      animation: candleFlicker 2.2s infinite ease-in-out;
      transform-origin: bottom center;
    }

    /* Page Flip Visual Animation */
    @keyframes flipNextAnim {
      0% { transform: perspective(1200px) rotateY(0deg); opacity: 1; }
      40% { transform: perspective(1200px) rotateY(-9deg) scale(0.98); opacity: 0.82; }
      100% { transform: perspective(1200px) rotateY(0deg); opacity: 1; }
    }
    @keyframes flipPrevAnim {
      0% { transform: perspective(1200px) rotateY(0deg); opacity: 1; }
      40% { transform: perspective(1200px) rotateY(9deg) scale(0.98); opacity: 0.82; }
      100% { transform: perspective(1200px) rotateY(0deg); opacity: 1; }
    }
    .page-flip-next { animation: flipNextAnim 0.24s ease-out; }
    .page-flip-prev { animation: flipPrevAnim 0.24s ease-out; }

    /* PDF Viewer Strict Aspect Ratio */
    #pdfViewerCanvas {
      display: block;
      margin: 0 auto;
      flex-shrink: 0;
      border-radius: 4px;
    }
    .pdf-theme-sepia canvas { filter: sepia(0.32) contrast(0.96) brightness(0.98); }
    .pdf-theme-dark canvas { filter: invert(0.9) hue-rotate(180deg) contrast(0.92); }

    /* Hide Scrollbar for Clean Pills */
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  </style>
</head>
<body class="min-h-screen flex flex-col pb-20">

  <!-- Screen Brightness / Eye-Care Overlay -->
  <div id="brightnessOverlay" class="fixed inset-0 pointer-events-none z-[95] bg-black transition-opacity duration-200" style="opacity: 0;"></div>

  <!-- ================= FLOATING TOP-RIGHT EYE / THEME TOGGLE (VIDEO STYLE) ================= -->
  <div class="fixed top-4 right-4 z-30 flex items-center gap-2">
    <button
      type="button"
      onclick="installPwaApp()"
      id="installAppBtn"
      class="tactile-btn px-3 py-2 rounded-full bg-[#5C4430] text-[#FAF7F2] text-xs font-bold shadow-md flex items-center gap-1"
      title="ဖုန်းထဲသို့ App သွင်းရန်"
    >
      <span>📲</span>
      <span class="hidden sm:inline">Install</span>
    </button>
    <button
      type="button"
      onclick="toggleCozyDarkMode()"
      id="eyeThemeBtn"
      class="tactile-btn w-10 h-10 rounded-full bg-[#5C4430] text-[#FAF7F2] shadow-lg flex items-center justify-center text-base border border-amber-200/20"
      title="အလင်း/အမှောင် ပြောင်းရန်"
    >
      👁️
    </button>
  </div>

  <!-- ===================================================================== -->
  <!-- TAB 1: HOME VIEW (GREETING + STREAK + CURRENTLY READING + ALL BOOKS)  -->
  <!-- ===================================================================== -->
  <main id="tabHomeView" class="max-w-2xl w-full mx-auto px-4 pt-6 space-y-5 flex-1">
    <!-- Greeting Header -->
    <div class="flex items-start justify-between pr-14">
      <div>
        <h1 class="text-2xl sm:text-3xl font-serif-editorial font-bold tracking-tight">
          <span id="greetingTitle">Good Evening,</span>
          <span class="italic font-normal text-[#8C6D4F]">Reader</span>
        </h1>
        <p id="greetingDate" class="text-xs text-[#7A6B58] mt-0.5">Loading date...</p>
      </div>
    </div>

    <!-- Momentum Banner Card -->
    <div class="cozy-card rounded-2xl p-3.5 flex items-center gap-3.5 shadow-sm">
      <div class="w-11 h-11 rounded-xl bg-white/70 border border-[#E5DEC9] flex items-center justify-center text-2xl shrink-0">
        🦢
      </div>
      <div class="flex-1 min-w-0">
        <h2 class="font-bold text-sm leading-snug">Momentum</h2>
        <p id="momentumSubText" class="text-xs text-[#7A6B58] truncate">နေ့စဉ် ပုံမှန်စာဖတ်ခြင်းဖြင့် အလေ့အကျင့်ကောင်း တည်ဆောက်ပါ</p>
      </div>
    </div>

    <!-- Day Streak Card (Mon - Sun) -->
    <div class="cozy-outline-card rounded-3xl p-5 space-y-4 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="text-2xl">🔥</span>
          <div>
            <div class="flex items-baseline gap-2">
              <span id="streakCountNum" class="text-2xl font-serif-editorial font-bold">1</span>
              <span class="text-xs font-bold uppercase tracking-wider text-[#5C4430]">DAY STREAK</span>
            </div>
            <p id="personalBestText" class="text-[11px] text-[#7A6B58]">Personal best: 1 day</p>
          </div>
        </div>
        <button
          type="button"
          onclick="quickToggleSound()"
          class="tactile-btn px-3 py-1.5 rounded-full cozy-card text-xs font-bold flex items-center gap-1"
        >
          <span id="homeSoundIcon">🔊</span>
          <span>အသံ</span>
        </button>
      </div>

      <!-- Weekdays Row -->
      <div id="weekStreakGrid" class="grid grid-cols-7 gap-1.5 text-center pt-1"></div>

      <!-- Mark Today Action Buttons -->
      <div class="grid grid-cols-2 gap-3 pt-1">
        <button
          type="button"
          id="markTodayBtn"
          onclick="markReadToday()"
          class="tactile-btn py-2.5 px-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5"
        >
          <span>✓</span>
          <span id="markTodayText">Marked today</span>
        </button>
        <button
          type="button"
          onclick="switchBottomTab('bookshelf')"
          class="tactile-btn py-2.5 px-3 rounded-xl cozy-card text-xs font-bold flex items-center justify-center gap-1.5 text-[#5C4430]"
        >
          <span>📚</span>
          <span>My Bookshelf သို့</span>
        </button>
      </div>
    </div>

    <!-- Currently Reading Card (Video Style) -->
    <div id="currentlyReadingCard" class="cozy-outline-card rounded-3xl p-5 space-y-4 shadow-sm hidden">
      <div class="flex items-center justify-between">
        <span class="px-3 py-1 rounded-lg cozy-card text-[10px] font-bold uppercase tracking-wider text-[#5C4430]">
          CURRENTLY READING
        </span>
        <button
          type="button"
          id="continueReadMainBtn"
          class="tactile-btn px-3.5 py-1 rounded-full bg-[#5C4430] text-[#FAF7F2] text-xs font-bold shadow"
        >
          📖 ဆက်ဖတ်မည် →
        </button>
      </div>

      <div class="flex gap-4 items-start">
        <div id="currentBookCoverBox" class="w-24 sm:w-28 shrink-0 shelf-book-cover"></div>

        <div class="flex-1 min-w-0 space-y-2">
          <div class="flex flex-wrap gap-1.5">
            <span id="currentBookGenrePill" class="px-2.5 py-0.5 rounded-full cozy-card text-[10px] font-bold text-[#5C4430]">အထွေထွေ</span>
            <span class="px-2.5 py-0.5 rounded-full cozy-card text-[10px] font-bold text-[#7A6B58]">📄 PDF Ebook</span>
          </div>

          <h3 id="currentBookTitle" class="font-serif-editorial font-bold text-lg leading-snug truncate"></h3>
          <p id="currentBookAuthor" class="text-xs text-[#7A6B58] truncate"></p>

          <!-- Progress Bar & Page Stepper -->
          <div class="space-y-1.5 pt-1">
            <div class="flex items-center justify-between text-[11px] font-bold">
              <span id="currentBookPct" class="text-[#5C4430]">0%</span>
              <div class="flex items-center gap-1 bg-[#EAE3D5] text-[#2B2118] px-2 py-0.5 rounded-lg border border-[#D8CEBE]">
                <span class="text-[10px] text-[#7A6B58]">p.</span>
                <button type="button" onclick="stepCurrentBookPage(-1)" class="px-1.5 font-bold hover:text-amber-700">−</button>
                <span id="currentBookPageNum" class="font-mono text-xs px-1">1</span>
                <button type="button" onclick="stepCurrentBookPage(1)" class="px-1.5 font-bold hover:text-amber-700">+</button>
                <span id="currentBookTotalPages" class="text-[10px] text-[#7A6B58]">/ 1</span>
              </div>
            </div>
            <div class="w-full h-2 rounded-full bg-[#E5DEC9] overflow-hidden">
              <div id="currentBookProgressBar" class="h-full bg-[#5C4430] rounded-full transition-all" style="width: 0%"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="border-t border-[#E5DEC9] pt-3">
        <p class="text-[10px] font-bold uppercase tracking-wider text-[#7A6B58] mb-1">ABOUT BOOK</p>
        <p id="currentBookDesc" class="text-xs text-[#5C4938] line-clamp-2"></p>
      </div>
    </div>

    <!-- Search, Filter & All Books Catalog Section -->
    <div class="space-y-3 pt-2">
      <div class="flex items-center justify-between">
        <h2 class="font-serif-editorial font-bold text-lg">All Books Catalog</h2>
        <span id="totalBooksBadge" class="text-xs font-bold text-[#7A6B58]">0 books</span>
      </div>

      <!-- Search & Sort Bar -->
      <div class="flex flex-col sm:flex-row gap-2">
        <div class="relative flex-1">
          <input
            id="searchInput"
            type="text"
            placeholder="စာအုပ်အမည် သို့မဟုတ် စာရေးဆရာ ရှာဖွေရန်..."
            oninput="debounceLoadBooks()"
            class="w-full pl-9 pr-4 py-2.5 rounded-2xl cozy-outline-card text-xs sm:text-sm focus:outline-none focus:border-[#5C4430]"
          />
          <span class="absolute left-3.5 top-3 text-xs opacity-60">🔍</span>
        </div>
        <select
          id="sortSelect"
          onchange="triggerHaptic(10); loadBooks();"
          class="px-3.5 py-2.5 rounded-2xl cozy-outline-card text-xs font-bold focus:outline-none"
        >
          <option value="newest">↕ Recently added (အသစ်ဆုံး)</option>
          <option value="popular">🔥 လူဖတ်အများဆုံး</option>
          <option value="pages_asc">📄 စာမျက်နှာ (နည်း → များ)</option>
          <option value="pages_desc">📘 စာမျက်နှာ (များ → နည်း)</option>
          <option value="title_asc">🔤 အမည်အလိုက် (က-အ)</option>
        </select>
      </div>

      <!-- Category Filter Pills -->
      <div id="categoryPills" class="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1"></div>

      <!-- 3-Column Editorial Book Cards Grid (Video 00:04 Style) -->
      <div id="homeBooksGrid" class="grid grid-cols-2 sm:grid-cols-3 gap-3.5 pt-1"></div>
    </div>
  </main>

  <!-- ===================================================================== -->
  <!-- TAB 2: MY BOOKSHELF VIEW (COVERS / SPINES + ALCOVE + CUTE PROPS)      -->
  <!-- ===================================================================== -->
  <section id="tabBookshelfView" class="max-w-2xl w-full mx-auto px-4 pt-6 space-y-5 flex-1 hidden">
    <div class="pr-14">
      <h1 class="text-2xl sm:text-3xl font-serif-editorial font-bold">My Bookshelf</h1>
      <p class="text-xs text-[#7A6B58]">Your personal reading collection</p>
    </div>

    <!-- Covers / Spines Mode Switcher + S / M / L Spine Size Controls -->
    <div class="flex flex-wrap items-center justify-between gap-2">
      <div class="inline-flex p-1 rounded-2xl cozy-card gap-1">
        <button
          type="button"
          id="btnModeCovers"
          onclick="setShelfDisplayMode('covers')"
          class="tactile-btn px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white text-[#2B2118] shadow-sm flex items-center gap-1.5"
        >
          <span>⊞</span>
          <span>Covers</span>
        </button>
        <button
          type="button"
          id="btnModeSpines"
          onclick="setShelfDisplayMode('spines')"
          class="tactile-btn px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#7A6B58] flex items-center gap-1.5"
        >
          <span>☰</span>
          <span>Spines</span>
        </button>
      </div>

      <!-- Spine Height Size Selector (Only visible in Spines mode like Video 00:22) -->
      <div id="spineSizeControlBox" class="hidden items-center gap-1.5 cozy-card px-2.5 py-1 rounded-2xl text-xs">
        <span class="text-[11px] font-bold text-[#7A6B58] pr-1">↕ Size:</span>
        <button type="button" onclick="setSpineSizePreset('S')" id="spineSizeS" class="tactile-btn w-7 h-7 rounded-lg font-bold">S</button>
        <button type="button" onclick="setSpineSizePreset('M')" id="spineSizeM" class="tactile-btn w-7 h-7 rounded-lg font-bold bg-[#5C4430] text-white">M</button>
        <button type="button" onclick="setSpineSizePreset('L')" id="spineSizeL" class="tactile-btn w-7 h-7 rounded-lg font-bold">L</button>
      </div>
    </div>

    <!-- Bento Stats Box (Exact Video 00:06 Layout) -->
    <div class="cozy-outline-card rounded-3xl overflow-hidden shadow-sm">
      <div class="grid grid-cols-4 divide-x divide-[#E5DEC9] border-b border-[#E5DEC9] text-center py-3">
        <div class="px-1">
          <p id="statTotalBooks" class="font-serif-editorial font-bold text-base sm:text-lg">0</p>
          <p class="text-[9px] font-bold uppercase tracking-wider text-[#7A6B58]">BOOKS TOTAL</p>
        </div>
        <div class="px-1">
          <div class="flex items-center justify-center gap-1">
            <span id="statReadBooks" class="font-serif-editorial font-bold text-base sm:text-lg">0</span>
            <span id="statReadPct" class="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold">0%</span>
          </div>
          <p class="text-[9px] font-bold uppercase tracking-wider text-[#7A6B58]">READ</p>
        </div>
        <div class="px-1">
          <p id="statReadingNow" class="font-serif-editorial font-bold text-base sm:text-lg">0</p>
          <p class="text-[9px] font-bold uppercase tracking-wider text-[#7A6B58]">READING NOW</p>
        </div>
        <div class="px-1">
          <p id="statFavorites" class="font-serif-editorial font-bold text-base sm:text-lg">0</p>
          <p class="text-[9px] font-bold uppercase tracking-wider text-[#7A6B58]">FAVORITES</p>
        </div>
      </div>
      <div class="grid grid-cols-2 divide-x divide-[#E5DEC9] text-center py-2.5">
        <div>
          <p id="statTotalReadsCount" class="font-serif-editorial font-bold text-base text-[#8C6D4F]">0</p>
          <p class="text-[9px] font-bold uppercase tracking-wider text-[#7A6B58]">TOTAL READS</p>
        </div>
        <div>
          <p id="statTotalGenres" class="font-serif-editorial font-bold text-base">0</p>
          <p id="statFavGenreName" class="text-[9px] font-bold uppercase tracking-wider text-[#7A6B58] truncate px-2">GENRES</p>
        </div>
      </div>
    </div>

    <!-- Recessed Alcove Categorized Shelves -->
    <div id="alcoveShelvesWrapper" class="alcove-container p-3.5 sm:p-5 space-y-6"></div>
  </section>

  <!-- ===================================================================== -->
  <!-- TAB 3: FAVORITES VIEW (SAVED / HEARTED BOOKS)                         -->
  <!-- ===================================================================== -->
  <section id="tabFavoritesView" class="max-w-2xl w-full mx-auto px-4 pt-6 space-y-5 flex-1 hidden">
    <div class="pr-14">
      <h1 class="text-2xl sm:text-3xl font-serif-editorial font-bold">Favorites</h1>
      <p class="text-xs text-[#7A6B58]">သင် အသည်းပုံနှိပ်၍ သိမ်းဆည်းထားသော စာအုပ်များ</p>
    </div>
    <div id="favoritesGrid" class="grid grid-cols-2 sm:grid-cols-3 gap-4"></div>
  </section>

  <!-- ===================================================================== -->
  <!-- TAB 4: READING STREAK & STATS VIEW                                    -->
  <!-- ===================================================================== -->
  <section id="tabStreakView" class="max-w-2xl w-full mx-auto px-4 pt-6 space-y-5 flex-1 hidden">
    <div class="pr-14">
      <h1 class="text-2xl sm:text-3xl font-serif-editorial font-bold">Reading Activity</h1>
      <p class="text-xs text-[#7A6B58]">သင်၏ စာဖတ်မှတ်တမ်းနှင့် ဖတ်လက်စ စာအုပ်များ</p>
    </div>
    <div id="readingHistoryList" class="space-y-3"></div>
  </section>

  <!-- ================= BENTO BOOK DETAIL SHEET MODAL (z-40, Video 00:14 / 00:48 Style) ================= -->
  <div id="bookDetailModal" style="display: none;" class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm items-end sm:items-center justify-center p-0 sm:p-4">
    <div class="bg-[#FAF7F2] text-[#2B2118] border border-[#E5DEC9] rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-5">
      <!-- Top Right Close Button -->
      <button
        type="button"
        onclick="closeBookDetail()"
        class="tactile-btn absolute top-4 right-4 w-8 h-8 rounded-full bg-[#EAE3D5] hover:bg-[#DFD6C5] text-[#2B2118] flex items-center justify-center text-sm font-bold"
      >
        ✕
      </button>

      <!-- Centered Standing Book Cover -->
      <div class="flex justify-center pt-2">
        <div id="detailCoverBox" class="w-36 sm:w-40 shelf-book-cover shadow-xl"></div>
      </div>

      <!-- Title, Author & Status Tags -->
      <div class="space-y-2">
        <div class="flex items-start justify-between gap-2">
          <div>
            <h2 id="detailTitle" class="text-xl font-serif-editorial font-bold leading-snug"></h2>
            <p id="detailAuthor" class="text-xs text-[#7A6B58] font-bold mt-0.5"></p>
          </div>
          <button
            type="button"
            id="detailFavBtn"
            onclick="toggleFavoriteCurrentBook()"
            class="tactile-btn px-3 py-1.5 rounded-full cozy-card text-xs font-bold flex items-center gap-1 shrink-0"
          >
            <span id="detailFavIcon">🤍</span>
            <span>Save</span>
          </button>
        </div>

        <div class="flex flex-wrap gap-1.5 pt-1">
          <span id="detailStatusBadge" class="px-2.5 py-0.5 rounded-lg bg-[#EAE3D5] text-[#5C4430] text-[11px] font-bold">Unread</span>
          <span class="px-2.5 py-0.5 rounded-lg bg-[#EAE3D5] text-[#5C4430] text-[11px] font-bold">PDF Ebook</span>
          <span class="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-bold">Recommended</span>
        </div>
      </div>

      <!-- Primary Read CTA Button -->
      <button
        type="button"
        id="detailReadBtn"
        class="tactile-btn w-full py-3.5 rounded-2xl bg-[#5C4430] hover:bg-[#4A3525] text-[#FAF7F2] font-bold text-sm shadow-lg transition"
      >
        📖 စတင်ဖတ်ရှုမည်
      </button>

      <!-- 2-Column Bento Metadata Boxes (Video 00:14 Style) -->
      <div class="grid grid-cols-2 gap-2.5 text-xs">
        <div class="cozy-card p-3 rounded-2xl">
          <p class="text-[10px] font-bold uppercase tracking-wider text-[#7A6B58]">GENRE</p>
          <p id="detailCategory" class="font-bold mt-0.5 truncate">အထွေထွေ</p>
        </div>
        <div class="cozy-card p-3 rounded-2xl">
          <p class="text-[10px] font-bold uppercase tracking-wider text-[#7A6B58]">PAGES</p>
          <p id="detailPages" class="font-bold mt-0.5">0</p>
        </div>
        <div class="cozy-card p-3 rounded-2xl">
          <p class="text-[10px] font-bold uppercase tracking-wider text-[#7A6B58]">READ COUNT</p>
          <p id="detailReads" class="font-bold mt-0.5">0 ကြိမ်</p>
        </div>
        <div class="cozy-card p-3 rounded-2xl">
          <p class="text-[10px] font-bold uppercase tracking-wider text-[#7A6B58]">PROGRESS</p>
          <p id="detailProgressText" class="font-bold mt-0.5">0%</p>
        </div>
      </div>

      <!-- Summary Box -->
      <div class="space-y-1 pt-1">
        <p class="text-[10px] font-bold uppercase tracking-wider text-[#7A6B58]">SUMMARY / စာအုပ်အညွှန်း</p>
        <p id="detailDesc" class="text-xs text-[#5C4938] leading-relaxed"></p>
      </div>
    </div>
  </div>

  <!-- ================= FULLSCREEN PDF READER MODAL (z-50) ================= -->
  <div id="pdfReaderModal" style="display: none;" class="fixed inset-0 z-50 bg-[#FBF8F3] flex-col">
    <!-- Top Reader Controls -->
    <div class="px-3 sm:px-4 py-2 bg-[#2B2118] text-[#FAF7F2] flex flex-wrap items-center justify-between gap-2 text-xs border-b border-white/10 shrink-0">
      <div class="flex items-center gap-2 truncate max-w-[46%] sm:max-w-md">
        <button type="button" onclick="closePdfReader()" class="tactile-btn px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 font-bold shrink-0">
          ← စင်သို့
        </button>
        <span id="readerBookTitle" class="font-bold truncate text-amber-100"></span>
      </div>

      <div class="flex items-center gap-1.5">
        <!-- Split 2-Page Spread Mode Toggle -->
        <button
          type="button"
          onclick="toggleSplitSpreadMode()"
          id="splitModeBtn"
          class="tactile-btn px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 font-bold text-[11px] flex items-center gap-1"
          title="၂ မျက်နှာတွဲ စာအုပ်များကို တစ်ခြမ်းချင်း ခွဲဖတ်ရန်"
        >
          <span>📖</span>
          <span id="splitModeLabel">စာရွက်အပြည့်</span>
        </button>

        <!-- Zoom Controls -->
        <div class="flex items-center bg-white/10 rounded-xl p-0.5">
          <button type="button" onclick="changeZoom(-0.25)" class="tactile-btn px-2.5 py-1 hover:bg-white/10 rounded-lg font-bold text-sm">−</button>
          <button type="button" onclick="resetZoom()" id="zoomLabel" class="px-1.5 text-[11px] font-mono text-amber-300" title="100% ပြန်ထားရန်">100%</button>
          <button type="button" onclick="changeZoom(0.25)" class="tactile-btn px-2.5 py-1 hover:bg-white/10 rounded-lg font-bold text-sm">+</button>
        </div>

        <!-- Open Settings Inside Reader -->
        <button
          type="button"
          onclick="openSettingsModal()"
          class="tactile-btn px-2.5 py-1.5 rounded-xl bg-amber-500/25 text-amber-200 border border-amber-400/30 font-bold"
          title="Reader Settings"
        >
          ⚙️
        </button>
      </div>
    </div>

    <!-- PDF Canvas Area -->
    <div id="pdfCanvasWrapper" class="relative flex-1 overflow-auto p-2 sm:p-5 pdf-theme-sepia select-none">
      <div id="leftEdgeZone" onclick="handleEdgeTap(-1)" class="fixed left-0 top-14 bottom-20 w-10 sm:w-16 z-20 cursor-pointer" title="ရှေ့စာမျက်နှာ"></div>

      <div class="min-h-full flex items-center justify-center">
        <canvas id="pdfViewerCanvas" class="shadow-2xl transition-transform"></canvas>
      </div>

      <div id="rightEdgeZone" onclick="handleEdgeTap(1)" class="fixed right-0 top-14 bottom-20 w-10 sm:w-16 z-20 cursor-pointer" title="နောက်စာမျက်နှာ"></div>
    </div>

    <!-- Bottom Page Controls + Quick Page Slider -->
    <div class="px-4 py-2.5 bg-[#2B2118] text-[#FAF7F2] flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs border-t border-white/10 shrink-0">
      <div class="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-center">
        <button type="button" onclick="changePdfPage(-1)" class="tactile-btn px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 font-bold">
          ◀ ရှေ့သို့
        </button>
        <span id="pdfPageIndicator" class="font-mono text-amber-200 text-center">Page 1 / 1</span>
        <button type="button" onclick="changePdfPage(1)" class="tactile-btn px-4 py-1.5 rounded-xl bg-[#C2A687] text-[#2B2118] font-bold">
          နောက်သို့ ▶
        </button>
      </div>

      <div class="flex items-center gap-2 w-full sm:w-64">
        <span class="text-[10px] text-stone-300 shrink-0">စာမျက်နှာရွေးရန်</span>
        <input
          id="pageJumpSlider"
          type="range"
          min="1"
          max="1"
          value="1"
          onchange="jumpToPdfPage(this.value)"
          class="w-full accent-[#C2A687] cursor-pointer"
        />
      </div>
    </div>
  </div>

  <!-- ================= USER SETTINGS MODAL / DRAWER (z-[90] - Always on top) ================= -->
  <div id="settingsModal" style="display: none;" class="fixed inset-0 z-[90] bg-black/70 backdrop-blur-md items-center justify-center p-4">
    <div class="bg-[#FAF7F2] text-[#2B2118] border border-[#E5DEC9] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between border-b border-[#E5DEC9] pb-3">
        <div class="flex items-center gap-2.5">
          <span class="text-xl">⚙️</span>
          <div>
            <h3 class="font-serif-editorial font-bold text-base">Reader Settings</h3>
            <p class="text-[11px] text-[#7A6B58]">အသံ၊ တုန်ခါမှုနှင့် စာဖတ်စနစ် စိတ်ကြိုက်ပြင်ဆင်ရန်</p>
          </div>
        </div>
        <button type="button" onclick="closeSettingsModal()" class="tactile-btn w-8 h-8 rounded-full bg-[#EAE3D5] flex items-center justify-center text-sm font-bold">
          ✕
        </button>
      </div>

      <!-- 1. Sound & Haptics Section -->
      <div class="space-y-3 cozy-card p-4 rounded-2xl">
        <p class="text-xs font-bold text-[#5C4430] uppercase tracking-wider">🔊 အသံနှင့် ထိတွေ့တုန်ခါမှု (Sound & Touch)</p>

        <div class="flex items-center justify-between pt-1">
          <div>
            <p class="text-xs font-bold">စာရွက်လှန်သံ (Page Flip Sound)</p>
            <p class="text-[11px] text-[#7A6B58]">စာမျက်နှာလှန်ချိန် စာရွက်သံဖွင့်ထားမည်</p>
          </div>
          <button type="button" id="toggleFlipSoundBtn" onclick="toggleSetting('flipSound')" class="tactile-btn w-12 h-6 rounded-full p-0.5 transition-colors bg-[#5C4430] flex items-center">
            <div id="toggleFlipSoundDot" class="w-5 h-5 rounded-full bg-white shadow transform translate-x-6 transition-transform"></div>
          </button>
        </div>

        <div class="space-y-1 pt-1">
          <div class="flex justify-between text-[11px] text-[#7A6B58]">
            <span>စာရွက်လှန်သံ အတိုး/အကျယ်</span>
            <button type="button" onclick="playPageFlipSound()" class="text-[#5C4430] underline font-bold">▶ အသံစမ်းသပ်ရန်</button>
          </div>
          <input
            id="volumeSlider"
            type="range"
            min="10"
            max="100"
            value="75"
            oninput="updateVolumeSetting(this.value)"
            class="w-full accent-[#5C4430] cursor-pointer"
          />
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-[#E5DEC9]">
          <div>
            <p class="text-xs font-bold">ခလုတ်နှိပ်သံအသေး (Touch Click Sound)</p>
            <p class="text-[11px] text-[#7A6B58]">ခလုတ်နှိပ်တိုင်း နူးညံ့သော Click အသံပေးမည်</p>
          </div>
          <button type="button" id="toggleClickSoundBtn" onclick="toggleSetting('clickSound')" class="tactile-btn w-12 h-6 rounded-full p-0.5 transition-colors bg-[#5C4430] flex items-center">
            <div id="toggleClickSoundDot" class="w-5 h-5 rounded-full bg-white shadow transform translate-x-6 transition-transform"></div>
          </button>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-[#E5DEC9]">
          <div>
            <p class="text-xs font-bold">ထိတွေ့တုန်ခါမှု (One-Touch Vibrate)</p>
            <p class="text-[11px] text-[#7A6B58]">ခလုတ်နှင့် စာမျက်နှာထိချိန် တုန်ခါမှုပေးမည်</p>
          </div>
          <button type="button" id="toggleHapticBtn" onclick="toggleSetting('haptic')" class="tactile-btn w-12 h-6 rounded-full p-0.5 transition-colors bg-[#5C4430] flex items-center">
            <div id="toggleHapticDot" class="w-5 h-5 rounded-full bg-white shadow transform translate-x-6 transition-transform"></div>
          </button>
        </div>
      </div>

      <!-- 2. Reading Comfort & Controls Section -->
      <div class="space-y-3 cozy-card p-4 rounded-2xl">
        <p class="text-xs font-bold text-[#5C4430] uppercase tracking-wider">📖 စာဖတ်ခြင်းနှင့် မျက်စိကာကွယ်ရေး</p>

        <div class="space-y-1">
          <div class="flex justify-between text-xs">
            <span class="font-bold">🔆 မျက်နှာပြင် အလင်းအမှောင် (Brightness)</span>
            <span id="brightnessValText" class="font-mono font-bold text-[#5C4430]">100%</span>
          </div>
          <input
            id="brightnessSlider"
            type="range"
            min="35"
            max="100"
            value="100"
            oninput="updateBrightnessSetting(this.value)"
            class="w-full accent-[#5C4430] cursor-pointer"
          />
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-[#E5DEC9]">
          <div>
            <p class="text-xs font-bold">ဘေးဘက်ထိ၍ စာမျက်နှာလှန်ခြင်း (Edge Tap)</p>
            <p class="text-[11px] text-[#7A6B58]">စာရွက်၏ ဘယ်/ညာ အစွန်ကို တို့၍ စာလှန်မည်</p>
          </div>
          <button type="button" id="toggleEdgeTapBtn" onclick="toggleSetting('edgeTap')" class="tactile-btn w-12 h-6 rounded-full p-0.5 transition-colors bg-[#5C4430] flex items-center">
            <div id="toggleEdgeTapDot" class="w-5 h-5 rounded-full bg-white shadow transform translate-x-6 transition-transform"></div>
          </button>
        </div>

        <div class="pt-2 border-t border-[#E5DEC9] space-y-1.5">
          <p class="text-xs font-bold">စာဖတ်သည့် စာရွက်အရောင် (Paper Mode)</p>
          <div class="grid grid-cols-3 gap-2 text-xs">
            <button type="button" onclick="setDefaultPaperTheme('sepia')" id="btnPaperSepia" class="tactile-btn py-2 rounded-xl font-bold bg-[#FBF8F3] text-amber-950 border-2 border-[#5C4430]">
              📜 Sepia
            </button>
            <button type="button" onclick="setDefaultPaperTheme('day')" id="btnPaperDay" class="tactile-btn py-2 rounded-xl font-bold bg-white text-slate-900 border border-stone-300">
              ☀️ Day
            </button>
            <button type="button" onclick="setDefaultPaperTheme('dark')" id="btnPaperDark" class="tactile-btn py-2 rounded-xl font-bold bg-stone-800 text-stone-200">
              🌙 Night
            </button>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between pt-1">
        <button type="button" onclick="clearReadingHistory()" class="tactile-btn text-xs text-red-600 font-bold">
          🗑️ ဖတ်လက်စ မှတ်တမ်းများ ရှင်းမည်
        </button>
        <button type="button" onclick="closeSettingsModal()" class="tactile-btn px-5 py-2 rounded-xl bg-[#5C4430] text-white font-bold text-xs">
          ပြီးပြီ
        </button>
      </div>
    </div>
  </div>

  <!-- ================= EXIT APP CONFIRMATION MODAL (z-[92]) ================= -->
  <div id="exitConfirmModal" style="display: none;" class="fixed inset-0 z-[92] bg-black/70 backdrop-blur-sm items-center justify-center p-4">
    <div class="bg-[#FAF7F2] text-[#2B2118] border border-[#E5DEC9] rounded-3xl max-w-xs w-full p-6 shadow-2xl text-center space-y-4">
      <div class="w-12 h-12 rounded-2xl bg-[#EAE3D5] text-[#5C4430] flex items-center justify-center text-2xl mx-auto">
        🚪
      </div>
      <div class="space-y-1">
        <h3 class="font-serif-editorial font-bold text-base">App မှ ထွက်မည်လား?</h3>
        <p class="text-xs text-[#7A6B58]">စာကြည့်တိုက် App မှ ထွက်ခွာရန် သေချာပါသလား?</p>
      </div>
      <div class="grid grid-cols-2 gap-3 pt-2 text-xs">
        <button
          type="button"
          onclick="cancelExitApp()"
          class="tactile-btn py-2.5 rounded-xl bg-[#EAE3D5] text-[#2B2118] font-bold"
        >
          မထွက်သေးပါ
        </button>
        <button
          type="button"
          onclick="confirmExitApp()"
          class="tactile-btn py-2.5 rounded-xl bg-red-600 text-white font-bold shadow-lg"
        >
          ထွက်မည်
        </button>
      </div>
    </div>
  </div>

  <!-- ================= BOTTOM NAVIGATION BAR (VIDEO STYLE) ================= -->
  <nav class="fixed bottom-0 inset-x-0 z-30 bg-[#FAF7F2]/95 backdrop-blur-md border-t border-[#E5DEC9]">
    <div class="max-w-md mx-auto grid grid-cols-5 text-center">
      <button type="button" onclick="switchBottomTab('home')" id="navBtnHome" class="tactile-btn py-3 flex flex-col items-center justify-center relative text-[#5C4430]">
        <span id="navIndicatorHome" class="absolute top-0 inset-x-4 h-0.5 bg-[#5C4430] rounded-full"></span>
        <span class="text-lg">⊞</span>
        <span class="text-[10px] font-bold mt-0.5">Home</span>
      </button>

      <button type="button" onclick="switchBottomTab('bookshelf')" id="navBtnBookshelf" class="tactile-btn py-3 flex flex-col items-center justify-center relative text-[#7A6B58]">
        <span id="navIndicatorBookshelf" class=" absolute top-0 inset-x-4 h-0.5 bg-[#5C4430] rounded-full hidden"></span>
        <span class="text-lg">📚</span>
        <span class="text-[10px] font-bold mt-0.5">Bookshelf</span>
      </button>

      <button type="button" onclick="switchBottomTab('favorites')" id="navBtnFavorites" class="tactile-btn py-3 flex flex-col items-center justify-center relative text-[#7A6B58]">
        <span id="navIndicatorFavorites" class="absolute top-0 inset-x-4 h-0.5 bg-[#5C4430] rounded-full hidden"></span>
        <span class="text-lg">🤍</span>
        <span class="text-[10px] font-bold mt-0.5">Favorites</span>
      </button>

      <button type="button" onclick="switchBottomTab('streak')" id="navBtnStreak" class="tactile-btn py-3 flex flex-col items-center justify-center relative text-[#7A6B58]">
        <span id="navIndicatorStreak" class="absolute top-0 inset-x-4 h-0.5 bg-[#5C4430] rounded-full hidden"></span>
        <span class="text-lg">🔥</span>
        <span class="text-[10px] font-bold mt-0.5">Streak</span>
      </button>

      <button type="button" onclick="openSettingsModal()" class="tactile-btn py-3 flex flex-col items-center justify-center relative text-[#7A6B58]">
        <span class="text-lg">•••</span>
        <span class="text-[10px] font-bold mt-0.5">Settings</span>
      </button>
    </div>
  </nav>

  <!-- ================= APPLICATION JAVASCRIPT ================= -->
  <script>
    if (window.pdfjsLib) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    const DEFAULT_SUPABASE_URL = 'https://ksgxlvrojzawvkkvsbyi.supabase.co';
    const DEFAULT_SUPABASE_KEY = 'sb_publishable_BcZTWsRcRYEJ_dtSAg1VnA_VWNE9FSg';

    let supabaseClient = null;
    let selectedCategoryId = null;
    let categoriesList = [];
    let currentBooksList = [];
    let searchTimeout = null;

    // UI State
    let activeBottomTab = 'home'; // 'home' | 'bookshelf' | 'favorites' | 'streak'
    let shelfDisplayMode = localStorage.getItem('SHELF_DISPLAY_MODE') || 'covers'; // 'covers' | 'spines'
    let spineSizePreset = localStorage.getItem('SPINE_SIZE_PRESET') || 'M'; // 'S' | 'M' | 'L'
    let currentDetailBookId = null;

    // PDF Reader State
    let currentPdfDoc = null;
    let currentPageNum = 1;
    let zoomPercent = 100;
    let splitSpreadMode = false;
    let currentSpreadHalf = 'left';
    let currentReadingBookId = null;

    // User Settings
    const userSettings = {
      flipSound: JSON.parse(localStorage.getItem('SET_FLIP_SOUND') ?? 'true'),
      clickSound: JSON.parse(localStorage.getItem('SET_CLICK_SOUND') ?? 'true'),
      haptic: JSON.parse(localStorage.getItem('SET_HAPTIC') ?? 'true'),
      edgeTap: JSON.parse(localStorage.getItem('SET_EDGE_TAP') ?? 'true'),
      volume: parseInt(localStorage.getItem('SET_VOLUME') || '75', 10),
      brightness: parseInt(localStorage.getItem('SET_BRIGHTNESS') || '100', 10),
      darkCozy: JSON.parse(localStorage.getItem('SET_DARK_COZY') ?? 'false'),
      paperTheme: localStorage.getItem('PAPER_THEME') || 'sepia'
    };

    // Spine Palette Colors for Realistic Spines Mode
    const SPINE_PALETTES = [
      { bg: '#2C3E35', text: '#F4EBD9', accent: '#C8A97E' },
      { bg: '#4A2525', text: '#F9E5D8', accent: '#E2B07E' },
      { bg: '#1F2A38', text: '#E8EEF5', accent: '#94B0DA' },
      { bg: '#D8CFC2', text: '#2B2118', accent: '#7A6B58' },
      { bg: '#3B2F2F', text: '#F3E5AB', accent: '#C5A059' },
      { bg: '#2D4059', text: '#FAF7F2', accent: '#EA5455' },
      { bg: '#5C4430', text: '#FAF7F2', accent: '#E5DEC9' },
      { bg: '#3D4035', text: '#F2EFE9', accent: '#B5C29E' }
    ];

    // ================= CUTE DECORATIVE SHELF PROPS (VIDEO STYLE) =================
    function getShelfPropHtml(index) {
      const props = [
        // 1. Flickering Cozy Candle
        `<div class="flex flex-col items-center justify-end px-2 select-none" title="Cozy Candle">
          <div class="w-2.5 h-3.5 rounded-full bg-gradient-to-t from-amber-500 via-yellow-300 to-white candle-flame shadow-[0_0_10px_#fbbf24]"></div>
          <div class="w-4 h-7 bg-[#FAF7F2] border border-[#D8CEBE] rounded-t-sm shadow-inner"></div>
        </div>`,
        // 2. Cute Potted Plant
        `<div class="flex flex-col items-center justify-end px-2 select-none" title="Plant">
          <span class="text-xl leading-none -mb-1">🪴</span>
        </div>`,
        // 3. Framed Mini Art
        `<div class="flex flex-col items-center justify-end px-2 select-none" title="Mini Frame">
          <div class="w-7 h-9 rounded-sm border-2 border-[#8C6D4F] bg-gradient-to-b from-[#EAE3D5] to-[#C2A687] shadow-md flex items-center justify-center text-[9px]">✨</div>
        </div>`,
        // 4. Warm Espresso Cup
        `<div class="flex flex-col items-center justify-end px-2 select-none" title="Coffee">
          <span class="text-lg leading-none">☕</span>
        </div>`,
        // 5. Glowing Orb Lamp
        `<div class="flex flex-col items-center justify-end px-2 select-none" title="Mood Lamp">
          <div class="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-100 to-white shadow-[0_0_14px_rgba(255,255,255,0.9)]"></div>
          <div class="w-4 h-1 bg-[#8C6D4F] rounded-full"></div>
        </div>`
      ];
      return props[index % props.length];
    }

    // ================= STEP-BY-STEP BACK NAVIGATION & EXIT CONFIRM =================
    let allowExitNow = false;

    function initBackNavigationGuard() {
      history.replaceState({ view: 'root' }, '');
      history.pushState({ view: 'guard' }, '');

      window.addEventListener('popstate', () => {
        if (allowExitNow) return;

        if (isModalVisible('exitConfirmModal')) {
          document.getElementById('exitConfirmModal').style.display = 'none';
          history.pushState({ view: 'guard' }, '');
          return;
        }

        if (isModalVisible('settingsModal')) {
          document.getElementById('settingsModal').style.display = 'none';
          history.pushState({ view: 'guard' }, '');
          return;
        }

        if (isModalVisible('pdfReaderModal')) {
          document.getElementById('pdfReaderModal').style.display = 'none';
          refreshAllViews();
          history.pushState({ view: 'guard' }, '');
          return;
        }

        if (isModalVisible('bookDetailModal')) {
          document.getElementById('bookDetailModal').style.display = 'none';
          history.pushState({ view: 'guard' }, '');
          return;
        }

        if (activeBottomTab !== 'home') {
          switchBottomTab('home', false);
          history.pushState({ view: 'guard' }, '');
          return;
        }

        triggerHaptic(18);
        document.getElementById('exitConfirmModal').style.display = 'flex';
        history.pushState({ view: 'exit_prompt' }, '');
      });
    }

    function isModalVisible(id) {
      const el = document.getElementById(id);
      return el && el.style.display !== 'none' && el.style.display !== '';
    }

    function cancelExitApp() {
      document.getElementById('exitConfirmModal').style.display = 'none';
    }

    function confirmExitApp() {
      allowExitNow = true;
      document.getElementById('exitConfirmModal').style.display = 'none';
      window.close();
      history.go(-2);
    }

    // ================= WEB AUDIO API SYNTHESIZER =================
    let audioCtx = null;

    function getAudioContext() {
      if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) audioCtx = new AudioContextClass();
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      return audioCtx;
    }

    function playPageFlipSound() {
      if (!userSettings.flipSound) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const duration = 0.22;
        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
          const progress = i / bufferSize;
          const env = Math.sin(progress * Math.PI) * Math.pow(1 - progress, 1.4);
          data[i] = (Math.random() * 2 - 1) * env;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(900, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(2600, ctx.currentTime + 0.11);
        filter.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + duration);
        filter.Q.value = 1.6;

        const gainNode = ctx.createGain();
        const vol = (userSettings.volume / 100) * 0.45;
        gainNode.gain.setValueAtTime(0.01, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.04);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
        noise.start();
      } catch (e) {}
    }

    function playTouchClickSound() {
      if (!userSettings.clickSound) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(160, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.025);

        const vol = (userSettings.volume / 100) * 0.12;
        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.025);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.026);
      } catch (e) {}
    }

    function triggerHaptic(ms = 14) {
      if (userSettings.haptic && navigator.vibrate) {
        try { navigator.vibrate(ms); } catch (e) {}
      }
    }

    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.tactile-btn');
      if (btn) {
        triggerHaptic(12);
        playTouchClickSound();
      }
    });

    // ================= INITIALIZATION =================
    window.addEventListener('DOMContentLoaded', async () => {
      initBackNavigationGuard();
      initGreetingAndStreak();
      applyAllSettingsToUI();
      setShelfDisplayMode(shelfDisplayMode, false);
      setSpineSizePreset(spineSizePreset, false);

      const url = localStorage.getItem('SB_URL') || DEFAULT_SUPABASE_URL;
      const key = DEFAULT_SUPABASE_KEY || localStorage.getItem('SB_KEY');
      await startReaderApp(url, key);
    });

    // ================= GREETING & DAILY STREAK SYSTEM =================
    function initGreetingAndStreak() {
      const now = new Date();
      const hr = now.getHours();
      let greet = 'Good Evening,';
      if (hr < 12) greet = 'Good Morning,';
      else if (hr < 17) greet = 'Good Afternoon,';
      document.getElementById('greetingTitle').textContent = greet;

      const dateStr = now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });
      document.getElementById('greetingDate').textContent = dateStr;

      renderStreakCalendar();
    }

    function getTodayIso() {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    function getMarkedDaysList() {
      try {
        return JSON.parse(localStorage.getItem('STREAK_DAYS') || '[]');
      } catch (e) {
        return [];
      }
    }

    function markReadToday(silent = false) {
      const today = getTodayIso();
      const list = getMarkedDaysList();
      if (!list.includes(today)) {
        list.push(today);
        localStorage.setItem('STREAK_DAYS', JSON.stringify(list));
      }
      if (!silent) triggerHaptic(18);
      renderStreakCalendar();
    }

    function renderStreakCalendar() {
      const list = getMarkedDaysList();
      const today = getTodayIso();
      if (list.length === 0) {
        list.push(today);
        localStorage.setItem('STREAK_DAYS', JSON.stringify(list));
      }

      const streakCount = Math.max(list.length, 1);
      const best = Math.max(parseInt(localStorage.getItem('STREAK_BEST') || '1', 10), streakCount);
      localStorage.setItem('STREAK_BEST', best);

      document.getElementById('streakCountNum').textContent = streakCount;
      document.getElementById('personalBestText').textContent = `Personal best: ${best} days`;

      const daysNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
      const now = new Date();
      const currentDayIdx = (now.getDay() + 6) % 7; // Monday = 0

      const grid = document.getElementById('weekStreakGrid');
      grid.innerHTML = daysNames.map((label, idx) => {
        const isToday = idx === currentDayIdx;
        const isPastOrToday = idx <= currentDayIdx;
        const circleStyle = isToday
          ? 'bg-[#5C4430] text-white ring-4 ring-[#C2A687]/40 font-bold'
          : isPastOrToday
          ? 'bg-[#8C6D4F] text-white'
          : 'bg-[#EAE3D5] text-[#A39686]';
        const icon = isPastOrToday ? '✓' : '·';
        return `
          <div class="flex flex-col items-center gap-1.5">
            <div class="w-9 h-9 rounded-full flex items-center justify-center text-xs shadow-sm ${circleStyle}">
              ${icon}
            </div>
            <span class="text-[10px] font-bold ${isToday ? 'text-[#5C4430]' : 'text-[#7A6B58]'}">${label}</span>
          </div>
        `;
      }).join('');
    }

    // ================= BOTTOM TABS SWITCHER =================
    function switchBottomTab(tab, pushHist = true) {
      activeBottomTab = tab;
      if (pushHist) history.pushState({ tab }, '');

      const views = {
        home: document.getElementById('tabHomeView'),
        bookshelf: document.getElementById('tabBookshelfView'),
        favorites: document.getElementById('tabFavoritesView'),
        streak: document.getElementById('tabStreakView')
      };

      Object.keys(views).forEach((k) => {
        views[k].classList.toggle('hidden', k !== tab);
        const btn = document.getElementById('navBtn' + k.charAt(0).toUpperCase() + k.slice(1));
        const ind = document.getElementById('navIndicator' + k.charAt(0).toUpperCase() + k.slice(1));
        if (btn && ind) {
          btn.className = `tactile-btn py-3 flex flex-col items-center justify-center relative ${
            k === tab ? 'text-[#5C4430]' : 'text-[#7A6B58]'
          }`;
          ind.classList.toggle('hidden', k !== tab);
        }
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
      refreshAllViews();
    }

    // ================= FAVORITES HELPER =================
    function getFavoritesIds() {
      try {
        return JSON.parse(localStorage.getItem('FAV_BOOKS') || '[]');
      } catch (e) {
        return [];
      }
    }

    function isBookFavorited(bookId) {
      return getFavoritesIds().includes(bookId);
    }

    function toggleFavoriteBookById(bookId, e) {
      if (e) e.stopPropagation();
      triggerHaptic(16);
      const favs = getFavoritesIds();
      const idx = favs.indexOf(bookId);
      if (idx >= 0) favs.splice(idx, 1);
      else favs.push(bookId);
      localStorage.setItem('FAV_BOOKS', JSON.stringify(favs));
      refreshAllViews();
    }

    function toggleFavoriteCurrentBook() {
      if (!currentDetailBookId) return;
      toggleFavoriteBookById(currentDetailBookId);
      updateDetailFavButtonUI(currentDetailBookId);
    }

    function updateDetailFavButtonUI(bookId) {
      const fav = isBookFavorited(bookId);
      document.getElementById('detailFavIcon').textContent = fav ? '❤️' : '🤍';
    }

    // ================= SETTINGS CONTROLS =================
    function toggleCozyDarkMode() {
      userSettings.darkCozy = !userSettings.darkCozy;
      localStorage.setItem('SET_DARK_COZY', JSON.stringify(userSettings.darkCozy));
      applyAllSettingsToUI();
    }

    function applyAllSettingsToUI() {
      document.body.classList.toggle('dark-cozy', userSettings.darkCozy);
      setDefaultPaperTheme(userSettings.paperTheme, false);
      updateBrightnessSetting(userSettings.brightness, false);
      document.getElementById('volumeSlider').value = userSettings.volume;
      document.getElementById('brightnessSlider').value = userSettings.brightness;

      updateToggleUI('toggleFlipSoundBtn', 'toggleFlipSoundDot', userSettings.flipSound);
      updateToggleUI('toggleClickSoundBtn', 'toggleClickSoundDot', userSettings.clickSound);
      updateToggleUI('toggleHapticBtn', 'toggleHapticDot', userSettings.haptic);
      updateToggleUI('toggleEdgeTapBtn', 'toggleEdgeTapDot', userSettings.edgeTap);

      const soundIcon = userSettings.flipSound ? '🔊' : '🔇';
      const homeSound = document.getElementById('homeSoundIcon');
      if (homeSound) homeSound.textContent = soundIcon;
    }

    function updateToggleUI(btnId, dotId, isOn) {
      const btn = document.getElementById(btnId);
      const dot = document.getElementById(dotId);
      if (!btn || !dot) return;
      btn.className = `tactile-btn w-12 h-6 rounded-full p-0.5 transition-colors flex items-center ${
        isOn ? 'bg-[#5C4430]' : 'bg-stone-400'
      }`;
      dot.className = `w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
        isOn ? 'translate-x-6' : 'translate-x-0'
      }`;
    }

    function toggleSetting(key) {
      userSettings[key] = !userSettings[key];
      const storageMap = {
        flipSound: 'SET_FLIP_SOUND',
        clickSound: 'SET_CLICK_SOUND',
        haptic: 'SET_HAPTIC',
        edgeTap: 'SET_EDGE_TAP'
      };
      localStorage.setItem(storageMap[key], JSON.stringify(userSettings[key]));
      applyAllSettingsToUI();
      if (key === 'flipSound' && userSettings.flipSound) playPageFlipSound();
    }

    function quickToggleSound() {
      toggleSetting('flipSound');
    }

    function updateVolumeSetting(val) {
      userSettings.volume = parseInt(val, 10);
      localStorage.setItem('SET_VOLUME', userSettings.volume);
    }

    function updateBrightnessSetting(val, save = true) {
      userSettings.brightness = parseInt(val, 10);
      if (save) localStorage.setItem('SET_BRIGHTNESS', userSettings.brightness);
      document.getElementById('brightnessValText').textContent = `${userSettings.brightness}%`;
      const darkness = (100 - userSettings.brightness) / 100;
      document.getElementById('brightnessOverlay').style.opacity = darkness.toFixed(2);
    }

    function setDefaultPaperTheme(mode, save = true) {
      userSettings.paperTheme = mode;
      if (save) localStorage.setItem('PAPER_THEME', mode);
      setReaderTheme(mode);

      ['Sepia', 'Day', 'Dark'].forEach((name) => {
        const btn = document.getElementById('btnPaper' + name);
        if (!btn) return;
        const active = name.toLowerCase() === mode;
        btn.style.outline = active ? '2px solid #5C4430' : 'none';
      });
    }

    function clearReadingHistory() {
      if (!confirm('ဖတ်လက်စ စာမျက်နှာမှတ်တမ်းများ အားလုံးကို ရှင်းလင်းမှာ သေချာပါသလား?')) return;
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith('BOOK_PAGE_') || k === 'LAST_READ_BOOK') {
          localStorage.removeItem(k);
        }
      });
      refreshAllViews();
      closeSettingsModal();
    }

    function openSettingsModal() {
      history.pushState({ modal: 'settings' }, '');
      document.getElementById('settingsModal').style.display = 'flex';
    }

    function closeSettingsModal() {
      document.getElementById('settingsModal').style.display = 'none';
    }

    // ================= SUPABASE & BOOKS LOADING =================
    async function startReaderApp(url, key) {
      supabaseClient = window.supabase.createClient(url.trim(), key.trim());
      const { data } = await supabaseClient.from('categories').select('*').order('name');
      categoriesList = data || [];
      renderCategoryPills();
      await loadBooks();
    }

    function renderCategoryPills() {
      const box = document.getElementById('categoryPills');
      box.innerHTML = `
        <button type="button" onclick="selectCategory(null)" class="tactile-btn px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition ${
          selectedCategoryId === null
            ? 'bg-[#5C4430] text-[#FAF7F2] shadow-sm'
            : 'cozy-card text-[#7A6B58]'
        }">အားလုံး</button>
      `;
      categoriesList.forEach((c) => {
        const active = selectedCategoryId === c.id;
        box.innerHTML += `
          <button type="button" onclick="selectCategory('${c.id}')" class="tactile-btn px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition ${
            active ? 'bg-[#5C4430] text-[#FAF7F2] shadow-sm' : 'cozy-card text-[#7A6B58]'
          }">${c.name}</button>
        `;
      });
    }

    function selectCategory(id) {
      selectedCategoryId = id;
      renderCategoryPills();
      loadBooks();
    }

    function debounceLoadBooks() {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => loadBooks(), 280);
    }

    async function loadBooks() {
      if (!supabaseClient) return;
      const sortBy = document.getElementById('sortSelect').value;
      const search = document.getElementById('searchInput').value.trim();

      let query = supabaseClient
        .from('books')
        .select('*, categories(name)')
        .eq('status', 'published');

      if (selectedCategoryId) query = query.eq('category_id', selectedCategoryId);
      if (search !== '') query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%`);

      if (sortBy === 'newest') query = query.order('created_at', { ascending: false });
      if (sortBy === 'popular') query = query.order('read_count', { ascending: false });
      if (sortBy === 'pages_asc') query = query.order('page_count', { ascending: true });
      if (sortBy === 'pages_desc') query = query.order('page_count', { ascending: false });
      if (sortBy === 'title_asc') query = query.order('title', { ascending: true });

      const { data: books } = await query;
      currentBooksList = books || [];
      document.getElementById('totalBooksBadge').textContent = `စာအုပ်ပေါင်း (${currentBooksList.length}) အုပ်`;

      refreshAllViews();
    }

    function refreshAllViews() {
      renderCurrentlyReadingCard();
      renderHomeBooksGrid(currentBooksList);
      renderBookshelfStatsAndAlcoves(currentBooksList);
      renderFavoritesTab(currentBooksList);
      renderStreakActivityTab(currentBooksList);
    }

    // ================= 1. CURRENTLY READING CARD & STEPPER =================
    function renderCurrentlyReadingCard() {
      const card = document.getElementById('currentlyReadingCard');
      const lastRaw = localStorage.getItem('LAST_READ_BOOK');
      let targetBook = null;

      if (lastRaw) {
        try {
          const parsed = JSON.parse(lastRaw);
          targetBook = currentBooksList.find((b) => b.id === parsed.id) || parsed;
        } catch (e) {}
      }
      if (!targetBook && currentBooksList.length > 0) {
        targetBook = currentBooksList[0];
      }

      if (!targetBook) {
        card.classList.add('hidden');
        return;
      }

      card.classList.remove('hidden');
      const totalPages = targetBook.page_count || targetBook.totalPages || 1;
      const savedPage = parseInt(localStorage.getItem('BOOK_PAGE_' + targetBook.id) || '1', 10);
      const pct = Math.min(Math.round((savedPage / totalPages) * 100), 100);

      document.getElementById('currentBookGenrePill').textContent = targetBook.categories?.name || 'အထွေထွေ';
      document.getElementById('currentBookTitle').textContent = targetBook.title;
      document.getElementById('currentBookAuthor').textContent = targetBook.author || '';
      document.getElementById('currentBookPct').textContent = `${pct}%`;
      document.getElementById('currentBookPageNum').textContent = savedPage;
      document.getElementById('currentBookTotalPages').textContent = `/ ${totalPages}`;
      document.getElementById('currentBookProgressBar').style.width = `${pct}%`;
      document.getElementById('currentBookDesc').textContent =
        targetBook.description || 'စာအုပ်မျက်နှာဖုံး သို့မဟုတ် ဆက်ဖတ်မည် ခလုတ်ကို နှိပ်၍ ဖတ်ရှုနိုင်ပါသည်။';

      const coverUrl = targetBook.cover_url;
      const coverBox = document.getElementById('currentBookCoverBox');
      coverBox.onclick = () => onBookTap(targetBook.id);
      coverBox.innerHTML = coverUrl
        ? `<img src="${coverUrl}" alt="${targetBook.title}" class="w-full h-full object-cover" />`
        : `<div class="w-full h-full p-2 flex items-center justify-center text-center text-[10px] text-amber-100 font-bold">${targetBook.title}</div>`;

      document.getElementById('continueReadMainBtn').onclick = () =>
        openPdfReader(targetBook.id, targetBook.title, targetBook.pdf_url || targetBook.pdfUrl, totalPages);
    }

    function stepCurrentBookPage(delta) {
      const lastRaw = localStorage.getItem('LAST_READ_BOOK');
      let book = currentBooksList[0];
      if (lastRaw) {
        try {
          const p = JSON.parse(lastRaw);
          book = currentBooksList.find((b) => b.id === p.id) || p;
        } catch (e) {}
      }
      if (!book) return;
      const total = book.page_count || book.totalPages || 1;
      const cur = parseInt(localStorage.getItem('BOOK_PAGE_' + book.id) || '1', 10);
      const next = Math.min(Math.max(cur + delta, 1), total);
      localStorage.setItem('BOOK_PAGE_' + book.id, next);
      triggerHaptic(10);
      renderCurrentlyReadingCard();
    }

    // ================= 2. HOME ALL BOOKS EDITORIAL CARDS (VIDEO 00:04) =================
    function renderHomeBooksGrid(books) {
      const grid = document.getElementById('homeBooksGrid');
      if (!books || books.length === 0) {
        grid.innerHTML = `<div class="col-span-full py-12 text-center text-xs text-[#7A6B58]">ရှာဖွေထားသော စာအုပ် မတွေ့ရှိသေးပါ။</div>`;
        return;
      }

      grid.innerHTML = books.map((b) => {
        const savedPage = parseInt(localStorage.getItem('BOOK_PAGE_' + b.id) || '0', 10);
        const total = b.page_count || 1;
        const isFinished = savedPage >= total && total > 0;
        const statusLabel = isFinished ? 'FINISHED' : savedPage > 0 ? `READING · ${Math.round((savedPage / total) * 100)}%` : 'WANT TO READ';
        const fav = isBookFavorited(b.id);

        return `
          <div onclick="onBookTap('${b.id}')" class="cozy-outline-card rounded-2xl p-2.5 flex flex-col justify-between cursor-pointer hover:shadow-md transition group">
            <div>
              <div class="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-[#7A6B58] mb-2 px-0.5">
                <span class="truncate">${statusLabel}</span>
                <button type="button" onclick="toggleFavoriteBookById('${b.id}', event)" class="text-xs">${fav ? '❤️' : '🤍'}</button>
              </div>
              <div class="shelf-book-cover w-full mb-2.5">
                ${
                  b.cover_url
                    ? `<img src="${b.cover_url}" alt="${b.title}" class="w-full h-full object-cover" loading="lazy" />`
                    : `<div class="w-full h-full p-3 flex flex-col justify-between text-amber-100">
                        <span class="text-[9px] opacity-75">${b.author}</span>
                        <span class="font-bold text-xs">${b.title}</span>
                        <span class="text-[9px] opacity-60">${b.page_count} p</span>
                      </div>`
                }
              </div>
            </div>
            <div class="px-0.5">
              <h3 class="font-serif-editorial font-bold text-xs sm:text-sm line-clamp-1">${b.title}</h3>
              <p class="text-[11px] text-[#7A6B58] line-clamp-1">${b.author}</p>
            </div>
          </div>
        `;
      }).join('');
    }

    // ================= 3. MY BOOKSHELF (COVERS vs SPINES + BENTO STATS) =================
    function setShelfDisplayMode(mode, save = true) {
      shelfDisplayMode = mode;
      if (save) localStorage.setItem('SHELF_DISPLAY_MODE', mode);

      const btnCovers = document.getElementById('btnModeCovers');
      const btnSpines = document.getElementById('btnModeSpines');
      const sizeBox = document.getElementById('spineSizeControlBox');

      if (mode === 'covers') {
        btnCovers.className = 'tactile-btn px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white text-[#2B2118] shadow-sm flex items-center gap-1.5';
        btnSpines.className = 'tactile-btn px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#7A6B58] flex items-center gap-1.5';
        sizeBox.classList.add('hidden');
        sizeBox.classList.remove(' inline-flex');
      } else {
        btnSpines.className = 'tactile-btn px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white text-[#2B2118] shadow-sm flex items-center gap-1.5';
        btnCovers.className = 'tactile-btn px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#7A6B58] flex items-center gap-1.5';
        sizeBox.classList.remove('hidden');
        sizeBox.classList.add('inline-flex');
      }

      renderBookshelfStatsAndAlcoves(currentBooksList);
    }

    function setSpineSizePreset(size, save = true) {
      spineSizePreset = size;
      if (save) localStorage.setItem('SPINE_SIZE_PRESET', size);

      ['S', 'M', 'L'].forEach((s) => {
        const btn = document.getElementById('spineSize' + s);
        if (!btn) return;
        btn.className = s === size
          ? 'tactile-btn w-7 h-7 rounded-lg font-bold bg-[#5C4430] text-white shadow'
          : 'tactile-btn w-7 h-7 rounded-lg font-bold text-[#7A6B58]';
      });

      renderBookshelfStatsAndAlcoves(currentBooksList);
    }

    function renderBookshelfStatsAndAlcoves(books) {
      const total = books.length;
      let readCount = 0;
      let readingNowCount = 0;
      let totalReadsSum = 0;

      books.forEach((b) => {
        totalReadsSum += b.read_count || 0;
        const saved = parseInt(localStorage.getItem('BOOK_PAGE_' + b.id) || '0', 10);
        if (saved > 0) {
          readingNowCount++;
          if (saved >= (b.page_count || 1)) readCount++;
        }
      });

      const readPct = total > 0 ? Math.round((readCount / total) * 100) : 0;
      const favCount = getFavoritesIds().length;

      document.getElementById('statTotalBooks').textContent = total;
      document.getElementById('statReadBooks').textContent = readingNowCount;
      document.getElementById('statReadPct').textContent = `${readPct}%`;
      document.getElementById('statReadingNow').textContent = readingNowCount;
      document.getElementById('statFavorites').textContent = favCount;
      document.getElementById('statTotalReadsCount').textContent = totalReadsSum;
      document.getElementById('statTotalGenres').textContent = Math.max(categoriesList.length, 1);

      // Group books by Category for Categorized Alcove Shelves
      const grouped = {};
      books.forEach((b) => {
        const gName = b.categories?.name || 'အထွေထွေ';
        if (!grouped[gName]) grouped[gName] = [];
        grouped[gName].push(b);
      });

      const groupKeys = Object.keys(grouped);
      if (groupKeys.length === 0) {
        grouped['စာအုပ်စင်'] = [];
        groupKeys.push('စာအုပ်စင်');
      }

      const wrapper = document.getElementById('alcoveShelvesWrapper');
      wrapper.innerHTML = groupKeys.map((gName, shelfIdx) => {
        const shelfBooks = grouped[gName];
        return `
          <div class="space-y-3">
            <!-- Shelf Header Pill (GENRE · Name + Count Badge) -->
            <div class="shelf-label-pill rounded-full px-4 py-1.5 flex items-center justify-between text-[11px] shadow-xs">
              <span class="font-bold uppercase tracking-wider text-[#7A6B58]">GENRE</span>
              <span class="font-bold text-[#2B2118]">· ${gName}</span>
              <span class="px-2 py-0.2 rounded-full bg-[#EAE3D5] text-[#5C4430] font-bold">${shelfBooks.length}</span>
            </div>

            <!-- Shelf Books + Cute Decorative Prop Sitting on Wooden Ledge -->
            <div class="pt-3">
              ${
                shelfDisplayMode === 'covers'
                  ? renderCoversShelfRow(shelfBooks, shelfIdx)
                  : renderSpinesShelfRow(shelfBooks, shelfIdx)
              }
              <div class="wooden-ledge w-full"></div>
            </div>
          </div>
        `;
      }).join('');
    }

    function renderCoversShelfRow(shelfBooks, shelfIdx) {
      return `
        <div class="px-3 flex items-end gap-3.5 sm:gap-5 overflow-x-auto no-scrollbar min-h-[125px] sm:min-h-[145px]">
          ${shelfBooks.map((b) => {
            const savedPage = localStorage.getItem('BOOK_PAGE_' + b.id);
            const pct = savedPage ? Math.min(Math.round((savedPage / (b.page_count || 1)) * 100), 100) : 0;
            return `
              <div onclick="onBookTap('${b.id}')" class="w-20 sm:w-24 shrink-0 shelf-book-cover">
                ${
                  b.cover_url
                    ? `<img src="${b.cover_url}" alt="${b.title}" class="w-full h-full object-cover" loading="lazy" />`
                    : `<div class="w-full h-full p-2 flex flex-col justify-between text-amber-100 text-[9px] font-bold">${b.title}</div>`
                }
                ${
                  savedPage
                    ? `<div class="absolute bottom-0 inset-x-0 bg-black/70 px-1 py-0.5">
                        <div class="w-full bg-white/30 h-1 rounded-full overflow-hidden">
                          <div class="bg-amber-400 h-full" style="width:${pct}%"></div>
                        </div>
                      </div>`
                    : ''
                }
              </div>
            `;
          }).join('')}
          ${getShelfPropHtml(shelfIdx)}
        </div>
      `;
    }

    function renderSpinesShelfRow(shelfBooks, shelfIdx) {
      const baseHeight = spineSizePreset === 'S' ? 112 : spineSizePreset === 'L' ? 152 : 132;
      return `
        <div class="px-3 flex items-end gap-1 overflow-x-auto no-scrollbar min-h-[135px] sm:min-h-[160px]">
          ${shelfBooks.map((b, idx) => {
            const pal = SPINE_PALETTES[(idx + shelfIdx) % SPINE_PALETTES.length];
            const pages = b.page_count || 120;
            const widthPx = Math.min(Math.max(Math.round(22 + (pages / 40) * 3), 24), 40);
            const heightVariance = ((idx * 7) % 18) - 6;
            const heightPx = baseHeight + heightVariance;

            return `
              <div
                onclick="onBookTap('${b.id}')"
                class="book-spine-item shrink-0"
                style="width: ${widthPx}px; height: ${heightPx}px; background-color: ${pal.bg}; color: ${pal.text};"
                title="${b.title} (${b.author})"
              >
                <div class="w-full h-0.5 opacity-40" style="background:${pal.accent}"></div>
                <span class="spine-vertical-text">${b.title}</span>
                <div class="w-full h-1 opacity-40" style="background:${pal.accent}"></div>
              </div>
            `;
          }).join('')}
          ${getShelfPropHtml(shelfIdx)}
        </div>
      `;
    }

    // ================= 4. FAVORITES & STREAK ACTIVITY TABS =================
    function renderFavoritesTab(books) {
      const favIds = getFavoritesIds();
      const favBooks = books.filter((b) => favIds.includes(b.id));
      const box = document.getElementById('favoritesGrid');

      if (favBooks.length === 0) {
        box.innerHTML = `<div class="col-span-full cozy-outline-card rounded-3xl p-10 text-center text-xs text-[#7A6B58]">သိမ်းဆည်းထားသော စာအုပ် မရှိသေးပါ။ စာအုပ်ပေါ်ရှိ 🤍 အသည်းပုံကို နှိပ်၍ သိမ်းဆည်းနိုင်ပါသည်။</div>`;
        return;
      }

      box.innerHTML = favBooks.map((b) => `
        <div onclick="onBookTap('${b.id}')" class="cozy-outline-card rounded-2xl p-3 flex flex-col justify-between cursor-pointer">
          <div class="shelf-book-cover w-full mb-2.5">
            ${b.cover_url ? `<img src="${b.cover_url}" class="w-full h-full object-cover" />` : ''}
          </div>
          <h3 class="font-serif-editorial font-bold text-xs line-clamp-1">${b.title}</h3>
          <p class="text-[11px] text-[#7A6B58] line-clamp-1">${b.author}</p>
        </div>
      `).join('');
    }

    function renderStreakActivityTab(books) {
      const box = document.getElementById('readingHistoryList');
      const startedBooks = books.filter((b) => localStorage.getItem('BOOK_PAGE_' + b.id));

      if (startedBooks.length === 0) {
        box.innerHTML = `<div class="cozy-outline-card rounded-3xl p-10 text-center text-xs text-[#7A6B58]">လက်ရှိ ဖတ်လက်စ စာအုပ်မှတ်တမ်း မရှိသေးပါ။</div>`;
        return;
      }

      box.innerHTML = startedBooks.map((b) => {
        const page = parseInt(localStorage.getItem('BOOK_PAGE_' + b.id) || '1', 10);
        const total = b.page_count || 1;
        const pct = Math.min(Math.round((page / total) * 100), 100);
        return `
          <div onclick="onBookTap('${b.id}')" class="cozy-outline-card rounded-2xl p-4 flex items-center gap-4 cursor-pointer">
            <div class="w-14 shelf-book-cover shrink-0">
              ${b.cover_url ? `<img src="${b.cover_url}" class="w-full h-full object-cover" />` : ''}
            </div>
            <div class="flex-1 min-w-0 space-y-1.5">
              <h4 class="font-bold text-sm truncate">${b.title}</h4>
              <p class="text-xs text-[#7A6B58]">စာမျက်နှာ ${page} / ${total} (${pct}%)</p>
              <div class="w-full h-1.5 rounded-full bg-[#E5DEC9] overflow-hidden">
                <div class="h-full bg-[#5C4430]" style="width:${pct}%"></div>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    // ================= BENTO BOOK DETAIL MODAL =================
    function onBookTap(bookId) {
      triggerHaptic(16);
      playTouchClickSound();
      openBookDetail(bookId);
    }

    function openBookDetail(bookId) {
      const book = currentBooksList.find((x) => x.id === bookId);
      if (!book) return;
      currentDetailBookId = book.id;

      const savedPage = parseInt(localStorage.getItem('BOOK_PAGE_' + book.id) || '0', 10);
      const total = book.page_count || 1;
      const pct = savedPage ? Math.min(Math.round((savedPage / total) * 100), 100) : 0;

      document.getElementById('detailCategory').textContent = book.categories?.name || 'အထွေထွေ';
      document.getElementById('detailTitle').textContent = book.title;
      document.getElementById('detailAuthor').textContent = book.author;
      document.getElementById('detailPages').textContent = `${book.page_count} မျက်နှာ`;
      document.getElementById('detailReads').textContent = `${book.read_count || 0} ကြိမ်`;
      document.getElementById('detailProgressText').textContent = savedPage ? `${pct}% (p. ${savedPage})` : '0%';
      document.getElementById('detailStatusBadge').textContent = savedPage >= total ? 'Finished' : savedPage > 0 ? 'Reading' : 'Unread';
      document.getElementById('detailDesc').textContent = book.description || 'ဤစာအုပ်အတွက် အညွှန်းဖော်ပြချက် မပါရှိသေးပါ။';

      updateDetailFavButtonUI(book.id);

      const coverBox = document.getElementById('detailCoverBox');
      coverBox.innerHTML = book.cover_url
        ? `<img src="${book.cover_url}" class="w-full h-full object-cover" />`
        : `<div class="w-full h-full flex items-center justify-center p-4 text-xs text-center text-amber-100">${book.title}</div>`;

      const readBtn = document.getElementById('detailReadBtn');
      readBtn.textContent = savedPage
        ? `📖 စာမျက်နှာ (${savedPage}) မှ ဆက်လက်ဖတ်ရှုမည်`
        : '📖 စတင်ဖတ်ရှုမည်';
      readBtn.onclick = () => {
        openPdfReader(book.id, book.title, book.pdf_url, book.page_count);
      };

      history.pushState({ modal: 'detail' }, '');
      document.getElementById('bookDetailModal').style.display = 'flex';
    }

    function closeBookDetail() {
      document.getElementById('bookDetailModal').style.display = 'none';
    }

    // ================= PDF READER (TRUE ASPECT RATIO + 2-PAGE SPLIT + WORKING ZOOM) =================
    window.addEventListener('resize', () => {
      if (isModalVisible('pdfReaderModal') && currentPdfDoc) {
        renderPdfPage(currentPageNum, 0);
      }
    });

    async function openPdfReader(bookId, title, pdfUrl, totalPages = 1) {
      currentReadingBookId = bookId;
      zoomPercent = 100;
      currentSpreadHalf = 'left';

      markReadToday(true);
      document.getElementById('readerBookTitle').textContent = title;
      history.pushState({ modal: 'reader' }, '');
      document.getElementById('pdfReaderModal').style.display = 'flex';
      setReaderTheme(userSettings.paperTheme);

      localStorage.setItem('LAST_READ_BOOK', JSON.stringify({ id: bookId, title, pdfUrl, totalPages }));
      if (supabaseClient) {
        supabaseClient.rpc('increment_read_count', { book_uuid: bookId });
      }

      currentPdfDoc = await pdfjsLib.getDocument(pdfUrl).promise;
      document.getElementById('pageJumpSlider').max = currentPdfDoc.numPages;

      const firstPage = await currentPdfDoc.getPage(1);
      const vp1 = firstPage.getViewport({ scale: 1 });
      if (vp1.width > vp1.height * 1.15 && window.innerWidth < 768) {
        splitSpreadMode = JSON.parse(localStorage.getItem('SPLIT_MODE_' + bookId) ?? 'true');
      } else {
        splitSpreadMode = JSON.parse(localStorage.getItem('SPLIT_MODE_' + bookId) ?? 'false');
      }
      updateSplitModeUI();

      const savedPage = parseInt(localStorage.getItem('BOOK_PAGE_' + bookId) || '1', 10);
      currentPageNum = savedPage <= currentPdfDoc.numPages ? savedPage : 1;

      playPageFlipSound();
      await renderPdfPage(currentPageNum, 0);
    }

    function toggleSplitSpreadMode() {
      if (!currentPdfDoc) return;
      splitSpreadMode = !splitSpreadMode;
      currentSpreadHalf = 'left';
      if (currentReadingBookId) {
        localStorage.setItem('SPLIT_MODE_' + currentReadingBookId, JSON.stringify(splitSpreadMode));
      }
      updateSplitModeUI();
      renderPdfPage(currentPageNum, 0);
    }

    function updateSplitModeUI() {
      const btn = document.getElementById('splitModeBtn');
      const label = document.getElementById('splitModeLabel');
      if (splitSpreadMode) {
        btn.className = 'tactile-btn px-2.5 py-1.5 rounded-xl bg-[#C2A687] text-[#2B2118] font-bold text-[11px] flex items-center gap-1 shadow';
        label.textContent = '၁ ခြမ်းချင်း';
      } else {
        btn.className = 'tactile-btn px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] flex items-center gap-1';
        label.textContent = 'စာရွက်အပြည့်';
      }
    }

    async function renderPdfPage(num, flipDir = 0) {
      if (!currentPdfDoc) return;
      const page = await currentPdfDoc.getPage(num);
      const wrapper = document.getElementById('pdfCanvasWrapper');
      const canvas = document.getElementById('pdfViewerCanvas');
      const ctx = canvas.getContext('2d');

      if (flipDir !== 0) {
        canvas.classList.remove('page-flip-next', 'page-flip-prev');
        void canvas.offsetWidth;
        canvas.classList.add(flipDir > 0 ? 'page-flip-next' : 'page-flip-prev');
      }

      const baseVp = page.getViewport({ scale: 1.0 });
      const availableWidth = Math.max(wrapper.clientWidth - 20, 260);
      const availableHeight = Math.max(wrapper.clientHeight - 20, 320);

      const srcWidth = splitSpreadMode ? baseVp.width / 2 : baseVp.width;
      const srcHeight = baseVp.height;
      const pageAspectRatio = srcHeight / srcWidth;

      let fitWidth = availableWidth;
      let fitHeight = fitWidth * pageAspectRatio;

      if (fitHeight > availableHeight && !splitSpreadMode && baseVp.width < baseVp.height) {
        fitHeight = availableHeight;
        fitWidth = fitHeight / pageAspectRatio;
      }

      const scaleMultiplier = zoomPercent / 100;
      const displayWidth = Math.round(fitWidth * scaleMultiplier);
      const displayHeight = Math.round(fitHeight * scaleMultiplier);

      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;

      const edgeDisplay = zoomPercent > 105 ? 'none' : 'block';
      document.getElementById('leftEdgeZone').style.display = edgeDisplay;
      document.getElementById('rightEdgeZone').style.display = edgeDisplay;

      const dpr = Math.min(window.devicePixelRatio || 1.5, 2.5);
      const renderScale = (displayWidth / srcWidth) * dpr;
      const renderVp = page.getViewport({ scale: renderScale });

      canvas.width = Math.round(srcWidth * renderScale);
      canvas.height = Math.round(srcHeight * renderScale);

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (splitSpreadMode && currentSpreadHalf === 'right') {
        ctx.translate(-Math.round((baseVp.width / 2) * renderScale), 0);
      }

      await page.render({ canvasContext: ctx, viewport: renderVp }).promise;
      ctx.restore();

      const halfLabel = splitSpreadMode ? (currentSpreadHalf === 'left' ? ' (ဘယ်)' : ' (ညာ)') : '';
      document.getElementById('pdfPageIndicator').textContent = `Page ${num}${halfLabel} / ${currentPdfDoc.numPages}`;
      document.getElementById('pageJumpSlider').value = num;
      document.getElementById('zoomLabel').textContent = `${zoomPercent}%`;
      localStorage.setItem('BOOK_PAGE_' + currentReadingBookId, num);
    }

    function changeZoom(deltaPct) {
      if (!currentPdfDoc) return;
      const nextZoom = Math.min(Math.max(zoomPercent + Math.round(deltaPct * 100), 60), 300);
      if (nextZoom !== zoomPercent) {
        zoomPercent = nextZoom;
        renderPdfPage(currentPageNum, 0);
      }
    }

    function resetZoom() {
      if (!currentPdfDoc) return;
      zoomPercent = 100;
      renderPdfPage(currentPageNum, 0);
    }

    function changePdfPage(delta) {
      if (!currentPdfDoc) return;

      if (splitSpreadMode) {
        if (delta > 0) {
          if (currentSpreadHalf === 'left') {
            currentSpreadHalf = 'right';
            triggerHaptic(16);
            playPageFlipSound();
            renderPdfPage(currentPageNum, 1);
            document.getElementById('pdfCanvasWrapper').scrollTop = 0;
            return;
          } else if (currentPageNum < currentPdfDoc.numPages) {
            currentPageNum++;
            currentSpreadHalf = 'left';
            triggerHaptic(18);
            playPageFlipSound();
            renderPdfPage(currentPageNum, 1);
            document.getElementById('pdfCanvasWrapper').scrollTop = 0;
            return;
          }
        } else if (delta < 0) {
          if (currentSpreadHalf === 'right') {
            currentSpreadHalf = 'left';
            triggerHaptic(16);
            playPageFlipSound();
            renderPdfPage(currentPageNum, -1);
            document.getElementById('pdfCanvasWrapper').scrollTop = 0;
            return;
          } else if (currentPageNum > 1) {
            currentPageNum--;
            currentSpreadHalf = 'right';
            triggerHaptic(18);
            playPageFlipSound();
            renderPdfPage(currentPageNum, -1);
            document.getElementById('pdfCanvasWrapper').scrollTop = 0;
            return;
          }
        }
        return;
      }

      const next = currentPageNum + delta;
      if (next >= 1 && next <= currentPdfDoc.numPages) {
        currentPageNum = next;
        triggerHaptic(18);
        playPageFlipSound();
        renderPdfPage(currentPageNum, delta);
        document.getElementById('pdfCanvasWrapper').scrollTop = 0;
      }
    }

    function jumpToPdfPage(pageVal) {
      if (!currentPdfDoc) return;
      const target = parseInt(pageVal, 10);
      if (target >= 1 && target <= currentPdfDoc.numPages && target !== currentPageNum) {
        const dir = target > currentPageNum ? 1 : -1;
        currentPageNum = target;
        currentSpreadHalf = 'left';
        triggerHaptic(18);
        playPageFlipSound();
        renderPdfPage(currentPageNum, dir);
        document.getElementById('pdfCanvasWrapper').scrollTop = 0;
      }
    }

    function handleEdgeTap(delta) {
      if (!userSettings.edgeTap || zoomPercent > 105) return;
      changePdfPage(delta);
    }

    function setReaderTheme(mode) {
      const wrapper = document.getElementById('pdfCanvasWrapper');
      if (!wrapper) return;
      wrapper.className = 'relative flex-1 overflow-auto p-2 sm:p-5 select-none ';
      if (mode === 'sepia') wrapper.classList.add('bg-[#FBF8F3]', 'pdf-theme-sepia');
      else if (mode === 'dark') wrapper.classList.add('bg-[#121212]', 'pdf-theme-dark');
      else wrapper.classList.add('bg-stone-200');
    }

    function closePdfReader() {
      triggerHaptic(12);
      document.getElementById('pdfReaderModal').style.display = 'none';
      refreshAllViews();
    }

    // ================= PWA SERVICE WORKER & INSTALL PROMPT =================
    let deferredInstallPrompt = null;

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch((err) => console.log('SW Error:', err));
      });
    }

    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      const btn = document.getElementById('installAppBtn');
      if (btn) btn.style.display = 'none';
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredInstallPrompt = e;
    });

    async function installPwaApp() {
      triggerHaptic(15);
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        const { outcome } = await deferredInstallPrompt.userChoice;
        if (outcome === 'accepted') {
          document.getElementById('installAppBtn').style.display = 'none';
        }
        deferredInstallPrompt = null;
      } else {
        alert(
          '📱 ဖုန်းထဲသို့ App သွင်းရန် -\n\n' +
          '• Android (Chrome): ညာဘက်အပေါ်ထောင့်ရှိ အစက် (၃) စက် (⋮) ကိုနှိပ်ပြီး "Install app" သို့မဟုတ် "Add to Home screen" ကို နှိပ်ပါ။\n\n' +
          '• iPhone (Safari): အောက်ခြေရှိ Share ခလုတ် (⬆️) ကိုနှိပ်ပြီး "Add to Home Screen" ကို ရွေးပါ။'
        );
      }
    }
  </script>
</body>
</html>
