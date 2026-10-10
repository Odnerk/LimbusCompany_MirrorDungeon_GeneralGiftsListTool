/* =============================================================
   app.js – Limbus Gift Tracker – Draggable Checklist Notes
   ============================================================= */

(() => {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  /* ---------- state ---------- */
  let notes = JSON.parse(localStorage.getItem("keep_notes_v2") || "[]");
  let editingNoteId = null;
  let inputColor = "default";

  /* ---------- drag state ---------- */
  let dragState = null;

  /* ---------- DOM refs ---------- */
  const body = document.body;
  const notesGrid = $("#notesGrid");
  const emptyState = $("#emptyState");
  const noteInputArea = $("#noteInputArea");
  const noteInputCollapsed = $("#noteInputCollapsed");
  const noteInputExpanded = $("#noteInputExpanded");
  const noteTitle = $("#noteTitle");
  const noteBody = $("#noteBody");
  const noteCloseBtn = $("#noteCloseBtn");
  const inputColorPicker = $("#inputColorPicker");
  const modalOverlay = $("#modalOverlay");
  const modalNote = $("#modalNote");
  const modalTitle = $("#modalTitle");
  const modalBody = $("#modalBody");
  const modalChecklist = $("#modalChecklist");
  const modalMeta = $("#modalMeta");
  const modalCloseBtn = $("#modalCloseBtn");
  const modalColorPicker = $("#modalColorPicker");
  const dropIndicator = $("#dropIndicator");
  const resetBtn = $("#resetBtn");
  const textSizeSlider = $("#textSizeSlider");

  /* =========================================================
     GIFT DATA
     ========================================================= */
  const GIFT_CATEGORIES = [
    {
      title: "Blunt Gifts",
      color: "default",
      items: [
        "IV - Crushed Memory", "IV - The Book of Vengeance",
        "III - Clasped Sculpture", "III - Dimensional Perception Modifier",
        "II - Pocket Flashcards", "II - Lowest Star", "II - Temporal Bridle",
        "II - Today's Expression", "II - Compression Bandage",
        "I - Burial Curse", "I - Dimensional Recycle Bin", "I - Meat Tenderizer"
      ]
    },
    {
      title: "Charge Gifts",
      color: "#8F00FF",
      items: [
        "IV - Charge-Type Gloves", "IV - Fragment of Friction",
        "III - Imitative Generator", "III - Material Interference Force Field", "III - Lightning Rod",
        "II - Miniature Telepole", "II - Portable Battery Socket", "II - T-1B Octagonal Bolt",
        "II - Employee Card", "II - Patrolling Flashlight", "II - Nightvision Goggles",
        "I - Uncapped Defibrilator", "I - UPS System", "I - Wrist Guards", "I - Curriculum Vitae"
      ]
    },
    {
      title: "Tremor Gifts",
      color: "#FFBF00",
      items: [
        "IV - Downpour", "IV - Fragment of Inertia",
        "III - Bell of Truth", "III - Clockwork Spring", "III - Melted Eyeball",
        "III - Bio-venom Vial",
        "II - Interlocked Cogs", "II - Wobbling Keg", "II - Mirror Tactile Synaesthesia",
        "II - Sour Liquor Aroma", "II - Oscillating Bracelet", "II - Blood, Sweat, and Tears",
        "II - Reverberation",
        "I - Nixie Divergence", "I - Gemstone Oscillator", "I - Venomous Skin", "I - Green Spirit"
      ]
    },
    {
      title: "Poise Gifts",
      color: "#4169E1",
      items: [
        "IV - Clear Mirror, Calm Water", "IV - Fragment of Conceit",
        "III - Finifugality", "III - Endorphin Kit", "III - Four-Leaf Clover",
        "II - Angel's Cut", "II - Cigarette Holder", "II - Recollection of a Certain Day",
        "II - Stone Tomb", "II - Old Wooden Doll", "II - Nebulizer",
        "I - Pendant of Nostalgia", "I - Ornamental Horseshoe",
        "I - Emerald Elytra", "I - Devil's Share"
      ]
    },
    {
      title: "Burn Gifts",
      color: "#DC143C",
      items: [
        "IV - Glimpse of Flames", "IV - Fragment of Hellfire",
        "III - Charred Disk", "III - Ardent Flower", "III - Dust to Dust",
        "II - Decamillennial Stewpot", "II - Decamillennial Hearthflame",
        "II - Pinpoint Logic Circuit", "II - Hellterfly's Dream",
        "II - Pain of Stifled Rage", "II - Fiery Down",
        "I - Ashes to Ashes", "I - Melted Paraffin", "I - Polarization", "I - Burning Intellect"
      ]
    },
    {
      title: "Bleed Gifts",
      color: "#FF8C00",
      items: [
        "IV - Red-Stained Gossypium", "IV - Fragment of Allurement",
        "III - Sanguine Fragrance Descends", "III - Rusted Cutting Knife",
        "III - Ruptured Blood Sac", "III - Smokes and Wires", "III - Respite",
        "II - Awe", "II - Millarca", "II - Wound Clerid",
        "II - White Gossypium", "II - WB Flask", "II - Little and To-Be-Naughty Plushie",
        "I - Grimy Iron Stake", "I - Layered Bandages", "I - Rusted Muzzle",
        "I - Tangled Bundle", "I - Arrested Hymn"
      ]
    },
    {
      title: "Sinking Gifts",
      color: "#007FFF",
      items: [
        "IV - Artistic Sense", "IV - Fragment of Decay",
        "III - Distant Star", "III - Blue Starshard", "III - Midwinter Nightmare",
        "III - Broken Compass",
        "II - Faded Overcoat", "II - Grandeur", "II - Tangled Bones",
        "II - Skeletal Crumbs", "II - Red Order", "II - Melted Spring",
        "I - Cantabile", "I - Eldtree Snare", "I - Headless Portrait",
        "I - Rags", "I - Thorny Path"
      ]
    },
    {
      title: "Rupture Gifts",
      color: "#009E60",
      items: [
        "IV - Thrill", "IV - Fragment of Desire",
        "III - Standard-Duty Battery", "III - Thunderbranch", "III - DeathSeeker",
        "II - Shards of Apocalypse", "II - Smoking Gunpowder", "II - Thorny Rope Cuffs",
        "II - Ragged Umbrella", "II - Barbed Lasso", "II - Fluorescent Lamp",
        "I - Broken Revolver", "I - Talisman Bundle", "I - Crown of Roses", "I - Bone Stake"
      ]
    },
    {
      title: "Slash Gifts",
      color: "default",
      items: [
        "IV - Sundered Memory", "IV - Broken GreatSword",
        "III - Cloudpattern Gourd Bottle", "III - Moment of Sentencing",
        "II - Short Cane Sword", "II - Resolution", "II - Dreaming Electric Sheep",
        "II - Tailor's Scissors",
        "I - Deceptive Accord", "I - Overused Whetstone", "I - Scalpel"
      ]
    },
    {
      title: "Pierce Gifts",
      color: "default",
      items: [
        "IV - Punctured Memory", "IV - Dueling Manual Book 3",
        "III - Keenbranch", "III - Torn Hems",
        "II - Gathering Skulls", "II - Plume of Proof",
        "II - Once, A Blessing", "II - Torn Bandolier",
        "I - Carpenter's Nail", "I - High-tensility Shoes", "I - Sticky Muck"
      ]
    }
  ];

  /* =========================================================
     INIT
     ========================================================= */
  function init() {
    if (notes.length === 0) {
      seedNotes();
      saveNotes();
    } else {
      // Migrate colors for existing notes
      notes.forEach(note => {
        const cat = GIFT_CATEGORIES.find(c => c.title === note.title);
        if (cat) {
          note.color = cat.color;
        }
      });
      saveNotes();
    }
    
    if (textSizeSlider) {
      const savedScale = localStorage.getItem("limbus_text_scale") || "1";
      textSizeSlider.value = savedScale;
      document.documentElement.style.setProperty("--text-scale", savedScale);
      
      textSizeSlider.addEventListener("input", e => {
        document.documentElement.style.setProperty("--text-scale", e.target.value);
        localStorage.setItem("limbus_text_scale", e.target.value);
      });
    }

    renderNotes();
    bindEvents();
  }

  function seedNotes() {
    notes = GIFT_CATEGORIES.map((cat, i) => ({
      id: uid(),
      title: cat.title,
      text: "",
      color: cat.color,
      checks: cat.items.map(item => ({ id: uid(), text: item, done: false })),
      createdAt: Date.now() - i * 1000,
      editedAt: Date.now() - i * 1000
    }));
  }

  /* =========================================================
     PERSIST
     ========================================================= */
  function saveNotes() {
    localStorage.setItem("keep_notes_v2", JSON.stringify(notes));
  }

  /* =========================================================
     COLOR HELPERS
     ========================================================= */
  function shadeColor(hex, percent) {
    hex = hex.replace("#", "");
    const num = parseInt(hex, 16);
    let r = Math.min(255, Math.max(0, (num >> 16) + percent));
    let g = Math.min(255, Math.max(0, ((num >> 8) & 0xFF) + percent));
    let b = Math.min(255, Math.max(0, (num & 0xFF) + percent));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  function applyNoteColor(el, color) {
    el.style.background = "";
    el.style.borderColor = "";
    el.style.borderTop = "";
    
    if (color && color !== "default") {
      el.style.borderTop = `3px solid ${color}`;
    }
  }

  /* =========================================================
     RENDER NOTES
     ========================================================= */
  function renderNotes() {
    // FLIP - First
    const oldRects = new Map();
    Array.from(notesGrid.children).forEach(card => {
      if (card.dataset.noteId) {
        oldRects.set(card.dataset.noteId, card.getBoundingClientRect());
      }
    });

    // Render new state
    notesGrid.innerHTML = "";
    notes.forEach(n => notesGrid.appendChild(createNoteCard(n)));
    emptyState.classList.toggle("hidden", notes.length > 0);

    // FLIP - Last, Invert, Play
    Array.from(notesGrid.children).forEach(card => {
      const id = card.dataset.noteId;
      if (!id) return;
      const oldRect = oldRects.get(id);
      if (oldRect) {
        const newRect = card.getBoundingClientRect();
        const dx = oldRect.left - newRect.left;
        const dy = oldRect.top - newRect.top;
        
        if (dx !== 0 || dy !== 0) {
          card.style.transform = `translate(${dx}px, ${dy}px)`;
          card.style.transition = "none";
          
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              card.style.transform = "";
              card.style.transition = "transform 0.65s cubic-bezier(0.2, 0.8, 0.2, 1)";
            });
          });
        }
      }
    });
  }

  function createNoteCard(note) {
    const card = document.createElement("div");
    card.className = "note-card";
    card.dataset.noteId = note.id;
    applyNoteColor(card, note.color);

    // --- Title ---
    if (note.title) {
      const t = document.createElement("div");
      t.className = "note-card__title";
      t.textContent = note.title;
      card.appendChild(t);
    }

    // --- Checklist preview (show all items, up to 8 before collapsing) ---
    if (note.checks && note.checks.length) {
      const MAX_VISIBLE = 8;
      const doneCount = note.checks.filter(c => c.done).length;
      const total = note.checks.length;

      // Sort: unchecked first, checked last
      const unchecked = note.checks.filter(c => !c.done);
      const checked   = note.checks.filter(c => c.done);
      const sorted    = [...unchecked, ...checked];
      const visible   = sorted.slice(0, MAX_VISIBLE);
      const remaining = sorted.length - MAX_VISIBLE;

      // How many unchecked fit in the visible window
      const visibleUncheckedCount = visible.filter(c => !c.done).length;
      const visibleCheckedCount   = visible.filter(c => c.done).length;

      const listEl = document.createElement("div");
      listEl.className = "note-card__checks";

      visible.forEach((item, idx) => {
        // Insert divider before first checked item
        if (item.done && (idx === 0 || !visible[idx - 1].done)) {
          const div = document.createElement("div");
          div.className = "note-card__checks-divider";
          div.textContent = `${checked.length} obtained`;
          listEl.appendChild(div);
        }

        const row = document.createElement("div");
        row.className = `note-card__check-row${item.done ? " done" : ""}`;

        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.className = "note-card__checkbox";
        cb.checked = item.done;
        cb.dataset.itemId = item.id;
        cb.addEventListener("change", e => {
          e.stopPropagation();
          toggleCheckItem(note.id, item.id);
        });

        const label = document.createElement("span");
        label.className = "note-card__check-label";
        label.textContent = item.text;

        row.appendChild(cb);
        row.appendChild(label);
        listEl.appendChild(row);
      });

      if (remaining > 0) {
        const more = document.createElement("div");
        more.className = "note-card__more";
        more.textContent = `+ ${remaining} more items`;
        listEl.appendChild(more);
      }

      // Progress bar
      const prog = document.createElement("div");
      prog.className = "note-card__progress";
      const fill = document.createElement("div");
      fill.className = "note-card__progress-fill";
      fill.style.width = total > 0 ? `${Math.round((doneCount / total) * 100)}%` : "0%";
      prog.appendChild(fill);

      const progLabel = document.createElement("div");
      progLabel.className = "note-card__progress-label";
      progLabel.textContent = `${doneCount} / ${total}`;

      card.appendChild(listEl);
      card.appendChild(prog);
      card.appendChild(progLabel);
    }

    // --- Actions (hover) ---
    const actions = document.createElement("div");
    actions.className = "note-card__actions";
    actions.appendChild(makeBtn("palette", "Background options", e => {
      e.stopPropagation();
      openCardColorPicker(card, note.id);
    }));
    actions.appendChild(makeBtn("delete", "Delete note", e => {
      e.stopPropagation();
      deleteNote(note.id);
    }));
    card.appendChild(actions);

    return card;
  }

  function makeBtn(icon, title, handler) {
    const btn = document.createElement("button");
    btn.className = "icon-btn small";
    btn.title = title;
    btn.innerHTML = `<span class="material-icons-outlined">${icon}</span>`;
    btn.addEventListener("click", handler);
    return btn;
  }

  /* =========================================================
     TOGGLE CHECK ITEM
     ========================================================= */
  function toggleCheckItem(noteId, itemId) {
    const note = notes.find(n => n.id === noteId);
    if (!note || !note.checks) return;
    const item = note.checks.find(c => c.id === itemId);
    if (!item) return;
    item.done = !item.done;
    note.editedAt = Date.now();
    saveNotes();
    renderNotes();
    // re-render modal if open
    if (editingNoteId === noteId) {
      renderModalChecklist(note);
    }
  }

  /* =========================================================
     NOTE INPUT (plain text notes)
     ========================================================= */
  noteInputCollapsed.addEventListener("click", expandInput);
  noteCloseBtn.addEventListener("click", closeInput);

  function expandInput() {
    noteInputCollapsed.classList.add("hidden");
    noteInputExpanded.classList.remove("hidden");
    inputColor = "default";
    noteInputExpanded.style.background = "";
    noteInputExpanded.style.borderColor = "";
    noteBody.focus();
  }

  function closeInput() {
    const title = noteTitle.value.trim();
    const text = noteBody.innerText.trim();
    if (title || text) {
      notes.unshift({
        id: uid(), title, text,
        color: inputColor,
        checks: [],
        createdAt: Date.now(), editedAt: Date.now()
      });
      saveNotes();
      renderNotes();
    }
    noteTitle.value = "";
    noteBody.innerHTML = "";
    inputColor = "default";
    noteInputExpanded.style.background = "";
    noteInputExpanded.style.borderColor = "";
    noteInputExpanded.classList.add("hidden");
    inputColorPicker.classList.add("hidden");
    noteInputCollapsed.classList.remove("hidden");
  }

  document.addEventListener("click", e => {
    if (!noteInputExpanded.classList.contains("hidden") && !noteInputArea.contains(e.target)) {
      closeInput();
    }
  });

  $("[data-action='palette']", noteInputExpanded).addEventListener("click", e => {
    e.stopPropagation();
    inputColorPicker.classList.toggle("hidden");
  });
  $$(".color-dot", inputColorPicker).forEach(dot => {
    dot.addEventListener("click", e => {
      e.stopPropagation();
      inputColor = dot.dataset.color;
      applyNoteColor(noteInputExpanded, inputColor);
      $$(".color-dot", inputColorPicker).forEach(d => d.classList.remove("selected"));
      dot.classList.add("selected");
      inputColorPicker.classList.add("hidden");
    });
  });

  /* =========================================================
     CARD COLOR PICKER
     ========================================================= */
  function openCardColorPicker(card, noteId) {
    const existing = card.querySelector(".card-color-picker");
    if (existing) { existing.remove(); return; }

    const picker = document.createElement("div");
    picker.className = "color-picker card-color-picker";
    picker.style.cssText = "position:absolute;bottom:40px;left:4px;right:4px;z-index:5;";
    picker.innerHTML = `<div class="color-picker__row">
      <button class="color-dot" data-color="default" title="Default" style="background:transparent;border:2px solid var(--text-secondary)"><span class="material-icons-outlined" style="font-size:18px">format_color_reset</span></button>
      <button class="color-dot" data-color="#DC143C" title="Crimson (Burn)" style="background:#DC143C"></button>
      <button class="color-dot" data-color="#FF8C00" title="Orange (Bleed)" style="background:#FF8C00"></button>
      <button class="color-dot" data-color="#FFBF00" title="Amber (Tremor)" style="background:#FFBF00"></button>
      <button class="color-dot" data-color="#009E60" title="Shamrock (Rupture)" style="background:#009E60"></button>
      <button class="color-dot" data-color="#007FFF" title="Azure (Sinking)" style="background:#007FFF"></button>
      <button class="color-dot" data-color="#4169E1" title="Royal Blue (Poise)" style="background:#4169E1"></button>
      <button class="color-dot" data-color="#8F00FF" title="Violet (Charge)" style="background:#8F00FF"></button>
    </div>`;
    card.appendChild(picker);

    $$(".color-dot", picker).forEach(dot => {
      dot.addEventListener("click", e => {
        e.stopPropagation();
        const note = notes.find(n => n.id === noteId);
        if (!note) return;
        note.color = dot.dataset.color;
        note.editedAt = Date.now();
        saveNotes();
        renderNotes();
      });
    });

    const handler = e => {
      if (!picker.contains(e.target)) {
        picker.remove();
        document.removeEventListener("click", handler, true);
      }
    };
    setTimeout(() => document.addEventListener("click", handler, true), 0);
  }

  /* =========================================================
     DELETE NOTE
     ========================================================= */
  function deleteNote(id) {
    notes = notes.filter(n => n.id !== id);
    saveNotes();
    renderNotes();
  }

  /* =========================================================
     MODAL (full checklist editor)
     ========================================================= */
  function openModal(id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    editingNoteId = id;
    modalTitle.value = note.title || "";
    modalBody.innerText = note.text || "";
    modalBody.classList.toggle("hidden", !!(note.checks && note.checks.length));
    applyNoteColor(modalNote, note.color);
    const date = new Date(note.editedAt);
    modalMeta.textContent = `Edited ${formatRelativeTime(date)}`;
    renderModalChecklist(note);
    modalOverlay.classList.remove("hidden");
    modalTitle.focus();
  }

  function renderModalChecklist(note) {
    modalChecklist.innerHTML = "";
    if (!note.checks || note.checks.length === 0) {
      modalChecklist.classList.add("hidden");
      return;
    }
    modalChecklist.classList.remove("hidden");

    const unchecked = note.checks.filter(c => !c.done);
    const checked   = note.checks.filter(c => c.done);

    // Render unchecked items
    unchecked.forEach(item => modalChecklist.appendChild(makeModalRow(item, note)));

    // Divider — only show if there are both checked and unchecked
    if (checked.length > 0 && unchecked.length >= 0) {
      const divider = document.createElement("div");
      divider.className = "modal-checks-divider";
      divider.textContent = `${checked.length} obtained`;
      modalChecklist.appendChild(divider);
    }

    // Render checked items below the divider
    checked.forEach(item => modalChecklist.appendChild(makeModalRow(item, note)));

    // "Add item" row
    const addRow = document.createElement("div");
    addRow.className = "modal-check-add-row";
    addRow.innerHTML = `
      <span class="material-icons-outlined modal-add-icon">add</span>
      <input type="text" class="modal-check-add-input" placeholder="List item" />
    `;
    const addInput = addRow.querySelector(".modal-check-add-input");
    addInput.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        const text = addInput.value.trim();
        if (text) {
          note.checks.push({ id: uid(), text, done: false });
          note.editedAt = Date.now();
          saveNotes();
          renderNotes();
          renderModalChecklist(note);
          const newAddInput = modalChecklist.querySelector(".modal-check-add-input");
          if (newAddInput) newAddInput.focus();
        }
      }
    });
    modalChecklist.appendChild(addRow);

    // Stats
    const total = note.checks.length;
    if (total > 0) {
      const stats = document.createElement("div");
      stats.className = "modal-check-stats";
      stats.textContent = `${checked.length} of ${total} obtained`;
      modalChecklist.appendChild(stats);
    }
  }

  function makeModalRow(item, note) {
    const row = document.createElement("div");
    row.className = `modal-check-row${item.done ? " done" : ""}`;
    row.dataset.itemId = item.id;

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.className = "modal-checkbox";
    cb.checked = item.done;
    cb.addEventListener("change", () => {
      toggleCheckItem(note.id, item.id);
    });

    const label = document.createElement("div");
    label.className = "modal-check-label";
    label.contentEditable = "true";
    label.textContent = item.text;
    label.addEventListener("blur", () => {
      const newText = label.textContent.trim();
      if (newText) {
        item.text = newText;
        note.editedAt = Date.now();
        saveNotes();
        renderNotes();
      }
    });
    label.addEventListener("keydown", e => {
      if (e.key === "Enter") { e.preventDefault(); label.blur(); }
    });

    const delBtn = document.createElement("button");
    delBtn.className = "icon-btn small modal-check-delete";
    delBtn.title = "Remove item";
    delBtn.innerHTML = `<span class="material-icons-outlined">close</span>`;
    delBtn.addEventListener("click", () => {
      note.checks = note.checks.filter(c => c.id !== item.id);
      note.editedAt = Date.now();
      saveNotes();
      renderNotes();
      renderModalChecklist(note);
    });

    row.appendChild(cb);
    row.appendChild(label);
    row.appendChild(delBtn);
    return row;
  }

  function closeModal() {
    if (editingNoteId) {
      const note = notes.find(n => n.id === editingNoteId);
      if (note) {
        const newTitle = modalTitle.value.trim();
        const newText = note.checks && note.checks.length ? "" : modalBody.innerText.trim();
        if (!newTitle && !newText && (!note.checks || !note.checks.length)) {
          notes = notes.filter(n => n.id !== editingNoteId);
        } else {
          note.title = newTitle;
          if (!note.checks || !note.checks.length) note.text = newText;
          note.editedAt = Date.now();
        }
        saveNotes();
        renderNotes();
      }
    }
    editingNoteId = null;
    modalOverlay.classList.add("hidden");
    modalColorPicker.classList.add("hidden");
    modalChecklist.innerHTML = "";
    modalNote.style.background = "";
    modalNote.style.borderColor = "";
  }

  modalCloseBtn.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", e => {
    if (e.target === modalOverlay) closeModal();
  });

  /* Modal color picker */
  $$("[data-modal-action='palette']").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      modalColorPicker.classList.toggle("hidden");
    });
  });
  $$(".color-dot", modalColorPicker).forEach(dot => {
    dot.addEventListener("click", e => {
      e.stopPropagation();
      if (!editingNoteId) return;
      const note = notes.find(n => n.id === editingNoteId);
      if (!note) return;
      note.color = dot.dataset.color;
      note.editedAt = Date.now();
      applyNoteColor(modalNote, note.color);
      $$(".color-dot", modalColorPicker).forEach(d => d.classList.remove("selected"));
      dot.classList.add("selected");
      saveNotes();
      renderNotes();
      modalColorPicker.classList.add("hidden");
    });
  });

  /* Modal delete */
  $$("[data-modal-action='delete']").forEach(btn => {
    btn.addEventListener("click", () => {
      if (!editingNoteId) return;
      deleteNote(editingNoteId);
      editingNoteId = null;
      modalOverlay.classList.add("hidden");
      modalColorPicker.classList.add("hidden");
      modalNote.style.background = "";
    });
  });

  /* =========================================================
     DRAG & DROP
     ========================================================= */
  const DRAG_THRESHOLD = 6;
  notesGrid.addEventListener("pointerdown", onPointerDown);
  document.addEventListener("pointermove", onPointerMove);
  document.addEventListener("pointerup", onPointerUp);

  function onPointerDown(e) {
    if (e.button !== 0) return;
    if (e.target.closest(".icon-btn") || e.target.closest(".color-picker") ||
        e.target.closest(".card-color-picker") || e.target.closest("input[type=checkbox]")) return;

    const card = e.target.closest(".note-card");
    if (!card) return;
    const rect = card.getBoundingClientRect();
    dragState = {
      noteId: card.dataset.noteId,
      sourceCard: card,
      startX: e.clientX, startY: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      ghost: null, dragging: false,
      cardWidth: rect.width, cardHeight: rect.height
    };
  }

  function onPointerMove(e) {
    if (!dragState) return;
    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;
    if (!dragState.dragging) {
      if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;
      startDrag(e);
    }
    dragState.ghost.style.left = (e.clientX - dragState.offsetX) + "px";
    dragState.ghost.style.top  = (e.clientY - dragState.offsetY) + "px";
    updateDropIndicator(e);
  }

  function onPointerUp(e) {
    if (!dragState) return;
    if (dragState.dragging) {
      finishDrag();
    } else {
      openModal(dragState.noteId);
    }
    dragState = null;
  }

  function startDrag(e) {
    dragState.dragging = true;
    body.classList.add("is-dragging");
    dragState.sourceCard.classList.add("is-dragging");

    const ghost = dragState.sourceCard.cloneNode(true);
    ghost.className = "note-card note-card-ghost";
    ghost.style.width = dragState.cardWidth + "px";
    ghost.style.background = dragState.sourceCard.style.background || "var(--surface)";
    ghost.style.borderColor = dragState.sourceCard.style.borderColor || "";
    ghost.style.left = (e.clientX - dragState.offsetX) + "px";
    ghost.style.top  = (e.clientY - dragState.offsetY) + "px";
    document.body.appendChild(ghost);
    dragState.ghost = ghost;
    dropIndicator.classList.remove("hidden");
  }

  function updateDropIndicator(e) {
    const cards = $$(".note-card:not(.is-dragging):not(.note-card-ghost)", notesGrid);
    if (cards.length === 0) {
      dropIndicator.classList.add("hidden");
      dragState.dropIndex = 0;
      return;
    }
    let closest = null, closestDist = Infinity, insertBefore = true;
    for (const card of cards) {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
      if (dist < closestDist) {
        closestDist = dist;
        closest = card;
        insertBefore = e.clientX < cx;
      }
    }
    if (!closest) return;
    const rect = closest.getBoundingClientRect();
    dropIndicator.classList.remove("hidden");
    dropIndicator.style.height = rect.height + "px";
    dropIndicator.style.top  = (rect.top + window.scrollY) + "px";
    dropIndicator.style.left = insertBefore
      ? (rect.left - 9) + "px"
      : (rect.right + 6) + "px";
    const closestIdx = notes.findIndex(n => n.id === closest.dataset.noteId);
    dragState.dropIndex = insertBefore ? closestIdx : closestIdx + 1;
  }

  function finishDrag() {
    if (dragState.ghost) dragState.ghost.remove();
    dropIndicator.classList.add("hidden");
    dragState.sourceCard.classList.remove("is-dragging");
    body.classList.remove("is-dragging");

    if (dragState.dropIndex !== undefined) {
      const fromIdx = notes.findIndex(n => n.id === dragState.noteId);
      if (fromIdx !== -1 && fromIdx !== dragState.dropIndex) {
        const [moved] = notes.splice(fromIdx, 1);
        const toIdx = dragState.dropIndex > fromIdx ? dragState.dropIndex - 1 : dragState.dropIndex;
        notes.splice(toIdx, 0, moved);
        saveNotes();
        renderNotes();
      }
    }
  }

  /* =========================================================
     KEYBOARD
     ========================================================= */
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      if (!modalOverlay.classList.contains("hidden")) closeModal();
      else if (!noteInputExpanded.classList.contains("hidden")) closeInput();
    }
  });

  /* =========================================================
     TOUCH DRAG SUPPORT
     ========================================================= */
  function bindEvents() {
    document.addEventListener("touchmove", e => {
      if (dragState && dragState.dragging) e.preventDefault();
    }, { passive: false });
  }

  /* =========================================================
     RESET
     ========================================================= */
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to uncheck all gifts?")) {
        notes.forEach(note => {
          if (note.checks) {
            note.checks.forEach(check => check.done = false);
          }
        });
        saveNotes();
        renderNotes();
      }
    });
  }

  /* =========================================================
     UTILS
     ========================================================= */
  function formatRelativeTime(date) {
    const diff = Date.now() - date.getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  /* =========================================================
     BOOT
     ========================================================= */
  init();
})();
