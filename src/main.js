document.addEventListener("DOMContentLoaded", function () {


    // cursor functionality
    const cursorDot = document.querySelector("[data-cursor-dot]");
    const cursorOutline = document.querySelector("[data-cursor-outline]");

    window.addEventListener("mousemove", (e) => {
        const posX = e.clientX;
        const posY = e.clientY;

        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;
        cursorOutline.style.left = `${posX}px`;
        cursorOutline.style.top = `${posY}px`;

        cursorOutline.animate({
            left: `${posX}px`,
            top: `${posY}px`,
        }, {
            duration: 500,
            fill: "forwards",
        });
    });


    const notesContainer = document.getElementById("notesContainer");
    const addNoteBtn = document.getElementById("addNoteBtn");
    const addNoteModal = document.getElementById("addNoteModal");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const noteForm = document.getElementById("noteForm");
    const searchInput = document.getElementById("searchInput");
    const filterSelect = document.getElementById("filterSelect");
    const emptyState = document.getElementById("emptyState");
    const confirmModal = document.getElementById("confirmModal");
    const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
    const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

    // fade-in AOS animations
    AOS.init({
        duration: 1200,   // animation duration
        once: true,      // animate only once
        easing: 'ease-out'
    });

    let notes = JSON.parse(localStorage.getItem("notes")) || [];
    let noteToDeleteId = null;

    renderNotes();
    AOS.refresh();
    updateEmptyState();

    addNoteBtn.addEventListener("click", openAddNoteModal);
    closeModalBtn.addEventListener("click", closeAddNoteModal);
    noteForm.addEventListener("submit", handleNoteSubmit);
    searchInput.addEventListener("input", filterNotes);
    filterSelect.addEventListener("change", filterNotes);
    cancelDeleteBtn.addEventListener("click", closeConfirmModal);
    confirmDeleteBtn.addEventListener("click", confirmDeleteNote);


    function renderNotes(notesToRender = notes) {
        notesContainer.innerHTML = "";

        notesToRender.forEach((note, index) => {
            const MAX_LENGTH = 150; // limit for truncation
            let rawContent = note.content;
            rawContent = rawContent.trimStart();

            const isLong = rawContent.length > MAX_LENGTH;
            const truncated = isLong ? rawContent.substring(0, MAX_LENGTH) + "..." : rawContent;


            const noteElement = document.createElement("div");
            noteElement.className = "note-card";
            noteElement.setAttribute("data-aos", "fade-up");
            noteElement.innerHTML = `
                <div class="note-content">
                    <div class="note-header">
                        <h3 class="note-title">${note.title}</h3>
                        <div class="note-actions">
                            <button class="delete-btn" data-id="${index}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    
                    <p class="note-text" data-full="${encodeURIComponent(note.content)}">
                        ${truncated}
                    </p>
                    
                    ${isLong ? `<button class="read-more-btn">Read more</button>` : ""}
                    
                    <div class="note-footer">
                        <span class="note-tag ${getTagClass(note.tag)}">
                            ${getTagIcon(note.tag)} ${getTagName(note.tag)}
                        </span>
                        <span class="note-date">${formatDate(note.date)}</span>
                    </div>
                </div>`;

            notesContainer.appendChild(noteElement);
        });

        // ✅ Delete button listeners
        document.querySelectorAll(".delete-btn").forEach((btn) => {
            btn.addEventListener("click", function () {
                noteToDeleteId = parseInt(this.getAttribute("data-id"));
                openConfirmModal();
            });
        });

        // ✅ Read More/Show Less listeners
        document.querySelectorAll(".read-more-btn").forEach((btn) => {
            btn.addEventListener("click", function () {
                const noteText = this.previousElementSibling;
                const fullText = decodeURIComponent(noteText.getAttribute("data-full"));

                if (this.textContent === "Read more") {
                    noteText.textContent = fullText;
                    this.textContent = "Show less";
                } else {
                    const shortText = fullText.trim().replace(/\s+/g, " ").substring(0, 150) + "...";
                    noteText.textContent = shortText;
                    this.textContent = "Read more";
                }
            });
        });
    }


    function getTagClass(tag) {
        const classes = {
            work: "tag-work",
            personal: "tag-personal",
            ideas: "tag-ideas",
            reminders: "tag-reminders",
        };
        return classes[tag] || "";
    }

    function getTagIcon(tag) {
        const icons = {
            work: '<i class="fas fa-briefcase"></i>',
            personal: '<i class="fas fa-user"></i>',
            ideas: '<i class="fas fa-lightbulb"></i>',
            reminders: '<i class="fas fa-bell"></i>',
        };
        return icons[tag] || "";
    }

    function getTagName(tag) {
        const names = {
            work: "Work",
            personal: "Personal",
            ideas: "Ideas",
            reminders: "Reminders",
        };
        return names[tag] || tag;
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    function openAddNoteModal() {
        addNoteModal.classList.add("active");
        document.body.style.overflow = "hidden";
    }

    function closeAddNoteModal() {
        addNoteModal.classList.remove("active");
        document.body.style.overflow = "auto";
        noteForm.reset();
    }

    function openConfirmModal() {
        confirmModal.classList.add("active");
        document.body.style.overflow = "hidden";
    }

    function closeConfirmModal() {
        confirmModal.classList.remove("active");
        document.body.style.overflow = "auto";
        noteToDeleteId = null;
    }

    function handleNoteSubmit(e) {
        e.preventDefault();

        const title = document.getElementById("noteTitle").value;
        const content = document.getElementById("noteContent").value;
        const tag = document.querySelector(
            'input[name="noteTag"]:checked'
        ).value;

        const newNote = {
            title,
            content,
            tag,
            date: new Date().toISOString(),
        };

        notes.unshift(newNote);
        saveNotes();
        renderNotes();
        AOS.refresh();
        closeAddNoteModal();
        updateEmptyState();
        filterNotes();
    }

    function confirmDeleteNote() {
        if (noteToDeleteId !== null) {
            notes.splice(noteToDeleteId, 1);
            saveNotes();
            renderNotes();
            AOS.refresh();
            updateEmptyState();
            filterNotes();
            closeConfirmModal();
        }
    }

    function saveNotes() {
        localStorage.setItem("notes", JSON.stringify(notes));
    }

    function filterNotes() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const filterValue = filterSelect.value;

        let filteredNotes = notes;

        if (searchTerm) {
            filteredNotes = filteredNotes.filter(
                (note) =>
                    note.title.toLowerCase().includes(searchTerm) ||
                    note.content.toLowerCase().includes(searchTerm)
            );
        }

        if (filterValue !== "all") {
            filteredNotes = filteredNotes.filter(
                (note) => note.tag === filterValue
            );
        }

        renderNotes(filteredNotes);
        AOS.refresh();
        updateEmptyState(filteredNotes);
    }

    function updateEmptyState(notesToCheck = notes) {
        if (notesToCheck.length === 0) {
            emptyState.style.display = "block";
        } else {
            emptyState.style.display = "none";
        }
    }

    // Theme Toggle (Between dark & light)
    const themeToggle = document.getElementById('themeToggle');

    // Store theme preference in localStorage when theme is toggled
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');

        // Store theme preference in localStorage
        localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');

        // Change icon dynamically
        const icon = themeToggle.querySelector('i');
        if (document.body.classList.contains('dark-mode')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    });

    // Retrieve stored theme preference when page loads
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        const icon = themeToggle.querySelector('i');
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        document.body.classList.remove('dark-mode');
        const icon = themeToggle.querySelector('i');
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
});

// === Gemini Modal Elements ===
const openGeminiModalBtn = document.getElementById('openGeminiModal');
const geminiModal = document.getElementById('geminiModal');
const closeGeminiModalBtn = document.getElementById('closeGeminiModalBtn');
const cancelGeminiBtn = document.getElementById('cancelGeminiBtn');
const applyGeminiBtn = document.getElementById('applyGeminiBtn');
const geminiApiKeyInput = document.getElementById('geminiApiKeyInput');

// ✅ Basic Gemini API Key Validator
function isValidGeminiKey(key) {
    if (!key || key.length < 20 || key.length > 100) return false;
    if (!key.startsWith('AIza')) return false;
    return /^[A-Za-z0-9_\-]+$/.test(key);
}

// ✅ Prefill modal state based on saved key
function prepareGeminiModal() {
    const savedKey = localStorage.getItem('geminiApiKey');

    if (savedKey) {
        geminiApiKeyInput.value = savedKey;
        applyGeminiBtn.textContent = 'Reformat';
        applyGeminiBtn.style.backgroundColor = '#4f46e5'; // blue
        applyGeminiBtn.dataset.mode = 'reformat';
    } else {
        geminiApiKeyInput.value = '';
        applyGeminiBtn.textContent = 'Apply';
        applyGeminiBtn.style.backgroundColor = ''; // default red
        applyGeminiBtn.dataset.mode = 'apply';
    }
}

// Open Modal
openGeminiModalBtn.addEventListener('click', () => {
    geminiModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    prepareGeminiModal(); // always refresh modal state
});

// Close Modal Helper
function closeGeminiModal() {
    geminiModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}
closeGeminiModalBtn.addEventListener('click', closeGeminiModal);
cancelGeminiBtn.addEventListener('click', closeGeminiModal);

// Main Click Logic (Apply / Reformat)
applyGeminiBtn.addEventListener('click', () => {
    const key = geminiApiKeyInput.value.trim();
    const titleEl = geminiModal.querySelector('.modal-title');
    const savedKey = localStorage.getItem('geminiApiKey');

    // Reformat mode: user didn’t edit key
    if (applyGeminiBtn.dataset.mode === 'reformat' && key === savedKey) {
        console.log('Reformatting with existing key...');
        closeGeminiModal();
        return;
    }

    // Invalid key → show Retry + shake
    if (!isValidGeminiKey(key)) {
        titleEl.textContent = 'Retry';
        titleEl.classList.add('error');
        const modalBox = geminiModal.querySelector('.modal');
        modalBox.classList.add('shake');

        setTimeout(() => {
            modalBox.classList.remove('shake');
            titleEl.textContent = 'Add Gemini API Key';
            titleEl.classList.remove('error');
        }, 1000);
        return;
    }

    // Valid new key → save
    localStorage.setItem('geminiApiKey', key);

    // Show saved feedback
    applyGeminiBtn.innerHTML = '<i class="fa-solid fa-check"></i> Saved';
    applyGeminiBtn.classList.add('saved-btn');

    // After 1.5s, change to Reformat & close modal
    setTimeout(() => {
        applyGeminiBtn.textContent = 'Reformat';
        applyGeminiBtn.style.backgroundColor = '#4f46e5'; // blue
        applyGeminiBtn.dataset.mode = 'reformat';
        closeGeminiModal();
    }, 1500);
});

// === Gemini API logic ===
async function callGeminiForFix(text) {
    const apiKey = localStorage.getItem('geminiApiKey');
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    // Prompt instructing Gemini to ONLY fix grammar
    const body = {
        contents: [
            {
                parts: [
                    {
                        text: `Strictly fix the grammar, punctuation, and spelling of the following text without changing its meaning or style:\n\n"${text}". If it is correct then send in the exact same text with no changes.`
                    }
                ]
            }
        ],
        generationConfig: {
            temperature: 0.2 // keep it deterministic
        }
    };

    const res = await fetch(`${url}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    if (!res.ok) {
        console.error("Gemini API error:", res.statusText);
        return null;
    }

    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

const contentLabel = document.querySelector('label[for="noteContent"]'); // Content label
const contentBox = document.getElementById('noteContent');

document.querySelector('.reformat-btn').addEventListener('click', () => {
    openGeminiModal(); // open modal
});

applyGeminiBtn.addEventListener('click', async () => {
    const key = geminiApiKeyInput.value.trim();
    const titleEl = geminiModal.querySelector('.modal-title');
    const savedKey = localStorage.getItem('geminiApiKey');
    const text = contentBox.value.trim();

    // Case 1: Reformat mode & user DIDN’T edit key → run Gemini
    if (applyGeminiBtn.dataset.mode === 'reformat' && key === savedKey) {

        // ❌ No text → show red "Enter Text"
        if (!text) {
            contentLabel.textContent = "Enter Text";
            contentLabel.style.color = "#f87171";
            setTimeout(() => {
                contentLabel.textContent = "Content";
                contentLabel.style.color = "";
            }, 1500);
            return;
        }

        // Close modal first
        closeGeminiModal();

        // Show loading in textarea
        contentBox.disabled = true;
        contentBox.value = "⏳ Fixing grammar…";

        // Call Gemini
        const fixedText = await callGeminiForFix(text);

        // Fake delay for visible loading
        setTimeout(() => {
            if (fixedText) {
                contentBox.value = fixedText.replace(/^"|"$/g, '');
            } else {
                contentBox.value = text; // fallback
                alert("Gemini API error. Please try again.");
            }
            contentBox.disabled = false;
        }, 2000);

        return;
    }

    // Case 2: User entered/edited key → validate it first
    if (!isValidGeminiKey(key)) {
        // Shake modal + retry title
        titleEl.textContent = 'Retry';
        titleEl.classList.add('error');
        const modalBox = geminiModal.querySelector('.modal');
        modalBox.classList.add('shake');

        setTimeout(() => {
            modalBox.classList.remove('shake');
            titleEl.textContent = 'Add Gemini API Key';
            titleEl.classList.remove('error');
        }, 1000);
        return;
    }

    // Case 3: New valid key → Save it
    localStorage.setItem('geminiApiKey', key);

    // Show saved feedback
    applyGeminiBtn.innerHTML = '<i class="fa-solid fa-check"></i> Saved';
    applyGeminiBtn.classList.add('saved-btn');

    // After 1.5s, change to Reformat mode
    setTimeout(() => {
        applyGeminiBtn.textContent = 'Reformat';
        applyGeminiBtn.style.backgroundColor = '#4f46e5';
        applyGeminiBtn.dataset.mode = 'reformat';
        // Keep modal open so user can now press Reformat
    }, 1500);
});




