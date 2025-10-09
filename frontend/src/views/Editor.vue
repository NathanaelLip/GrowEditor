<template>
  <div class="editor-container">
    <header class="editor-header print-hide">
      <h1>GrowEditor</h1>
      <div class="toolbar">
        <button @click="addCustom" class="btn btn-primary">Custom</button>
        <button @click="addActivity" class="btn btn-activity">Activity</button>
        <button @click="addScripture" class="btn btn-scripture">Scripture</button>
        <button @click="addObject" class="btn btn-object">Object Lesson</button>
        <button @click="addVideo" class="btn btn-video">Video</button>
        <button @click="addBigidea" class="btn btn-bigidea">Big Idea</button>
        <button @click="addReflection" class="btn btn-reflection">Reflection</button>
        <button @click="addResponse" class="btn btn-response">Response</button>
        <button @click="addMemory" class="btn btn-memory">Memory Verse</button>
        <button @click="addPrayer" class="btn btn-prayer">Prayer</button>
        <button @click="addDiscussion" class="btn btn-discussion">Discussion</button>
        <button @click="addPoll" class="btn btn-poll">Poll</button>
        <button @click="addQuestion" class="btn btn-question">Question</button>
        <button @click="printDocument" class="btn btn-secondary">Print / Save as PDF</button>
        <!-- Load and Save Buttons -->
        <button @click="fetchDocuments" class="btn btn-load">Load Document</button>
        <button @click="saveDocument" class="btn btn-save">Save Document</button>
        <!-- NEW RESET BUTTON -->
        <button @click="resetDocument" class="btn btn-secondary btn-reset">Reset</button>
      </div>
    </header>

    <main id="editor-content">
      <div>
        <!-- Binding header content to the new reactive refs defined in script setup -->
        <Title :section="title" @content-update="updateSectionContent('title', $event)" />
        <div class="header-section">
          <BigIdea :section="bigidea" @content-update="updateSectionContent('bigidea', $event)" />
          <Bible :section="bible" @content-update="updateSectionContent('bible', $event)" />
        </div>
        <About style="justify-items:center; margin-top: 0.5rem; margin-bottom: 2rem;" :section="about"
          @content-update="updateSectionContent('about', $event)" />
      </div>

      <div v-for="(section, index) in sections" :key="section.id" class="section">
        <!-- Color sidebar -->
        <div class="section-sidebar">
          <label class="color-bar" :style="{ backgroundColor: section.color }"
            :for="'color-picker-' + section.id"></label>
          <input type="color" v-model="section.color" :id="'color-picker-' + section.id" class="color-input-hidden"
            title="Change section color" hidden>
        </div>

        <!-- Content Area: Tiptap component. We pass the full 'section' object as a prop
             and listen for the 'content-update' event to capture the Tiptap JSON. -->
        <Tiptap :section="section" @content-update="updateSectionContent(section.id, $event)" />

        <!-- Section controls -->
        <div class="section-controls print-hide">
          <!-- NEW: Move Up Button -->
          <button @click="moveSectionUp(index)" :disabled="index === 0" class="btn-icon" title="Move section up">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              class="lucide lucide-chevron-up">
              <path d="m18 15-6-6-6 6" />
            </svg>
          </button>
          <!-- NEW: Move Down Button -->
          <button @click="moveSectionDown(index)" :disabled="index === sections.length - 1" class="btn-icon"
            title="Move section down">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              class="lucide lucide-chevron-down">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          <button @click="removeSection(section.id)" class="btn-icon" title="Remove section">
            &times;
          </button>
        </div>
      </div>
    </main>

    <!-- Load Document Modal -->
    <div v-if="documentListVisible" class="document-list-modal-overlay">
      <div class="document-list-modal">
        <h2>Load Saved Document</h2>
        <p v-if="isLoading">Loading documents...</p>
        <p v-else-if="!savedDocuments || savedDocuments.length === 0">No documents saved yet.</p>

        <ul v-else class="document-list">
          <li v-for="doc in savedDocuments" :key="doc.id" @click="loadDocument(doc.id)" class="document-item">
            <div class="doc-info">
              <span class="doc-title">{{ doc.titleText }}</span>
              <span class="doc-date">{{ new Date(doc.created_at).toLocaleDateString() }}</span>
            </div>
            <button class="btn-load-item">Load</button>
            <button @click.stop="deleteDocument(doc.id, doc.titleText)" class="btn-icon btn-delete-item"
              title="Delete Document">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                class="lucide lucide-trash-icon lucide-trash">
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                <path d="M3 6h18" />
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </li>
        </ul>

        <button @click="closeLoadModal" class="btn btn-secondary mt-4">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import Title from '../components/tiptap/Title.vue';
import BigIdea from '../components/tiptap/BigIdea.vue';
import Bible from '../components/tiptap/Bible.vue';
import About from '../components/tiptap/About.vue';
import Tiptap from '../components/Tiptap.vue';

// A unique ID generator for new sections
const uid = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

// Function to generate an empty Tiptap document content object
const createEmptyContent = () => ({ type: 'doc', content: [] });

/**
 * Generates Tiptap JSON content with initial text.
 * @param {string} text - The placeholder text to include.
 * @param {string} [type='paragraph'] - The Tiptap node type (e.g., 'paragraph', 'heading').
 * @param {object} [attrs={}] - Node attributes (e.g., { level: 1 } for heading).
 * @returns {object} The Tiptap JSON structure.
 */
const createTiptapContent = (text, type = 'paragraph', attrs = {}) => ({
  type: 'doc',
  content: [
    {
      type: type,
      attrs: attrs,
      content: [
        {
          type: 'text',
          text: text
        }
      ]
    }
  ]
});

// Reactive state for our main sections. Includes the 'content' field for Tiptap JSON.
const sections = ref([]);

// --- Reactive State for Header Sections ---
// Define header section objects to hold Tiptap JSON content
// Note: We initialize to empty content here, as loadDraftFromLocalStorage will populate if a draft exists.
const title = ref({ id: 'title', content: createEmptyContent() });
const bigidea = ref({ id: 'bigidea', content: createEmptyContent() });
const bible = ref({ id: 'bible', content: createEmptyContent() });
const about = ref({ id: 'about', content: createEmptyContent() });

// Map for easy lookup in updateSectionContent
const headerSections = {
  title: title,
  bigidea: bigidea,
  bible: bible,
  about: about,
};
// --- End Header State ---

// --- Local Storage State and Setup ---
const LOCAL_STORAGE_KEY = 'growEditorDraft';
// This ref is used purely to trigger the 'watch' deep change detector
const editorDraft = ref(null); 

/**
 * Saves the entire editor state (sections and headers) to localStorage.
 */
const saveDraftToLocalStorage = () => {
  const draftPayload = {
    title: title.value.content,
    bigidea: bigidea.value.content,
    bible: bible.value.content,
    about: about.value.content,
    sections: sections.value,
  };
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(draftPayload));
    // console.log('Draft auto-saved to localStorage.'); // Uncomment for debug
  } catch (e) {
    console.error('Could not save draft to localStorage. Storage might be full or blocked.', e);
  }
};

/**
 * Loads the editor state from localStorage on component mount.
 */
const loadDraftFromLocalStorage = () => {
  try {
    const draftString = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (draftString) {
      const draftPayload = JSON.parse(draftString);
      
      // Load header content back into the reactive refs
      title.value.content = draftPayload.title || createEmptyContent();
      bigidea.value.content = draftPayload.bigidea || createEmptyContent();
      bible.value.content = draftPayload.bible || createEmptyContent();
      about.value.content = draftPayload.about || createEmptyContent();

      // Load main sections content
      sections.value = draftPayload.sections || [];

      console.info('Draft loaded from localStorage.');
      // Initialize the watch ref with the loaded content
      editorDraft.value = draftPayload; 
    }
  } catch (e) {
    console.error('Could not load draft from localStorage. Data might be corrupted.', e);
    // Clear potentially corrupted data
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
};

/**
 * Clears the local storage draft. Called after successful server saves or loads.
 */
const clearDraft = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    console.info('Local draft cleared.');
};

// Watcher to auto-save the draft whenever sections or header contents change
watch(editorDraft, () => {
  saveDraftToLocalStorage();
}, { deep: true });

// Lifecycle hook to load the draft when the component mounts
onMounted(() => {
  loadDraftFromLocalStorage();
});

// --- Document Reset Logic (FIXED) ---
/**
 * Resets all editor content to a blank state and clears the local draft.
 */
const resetDocument = () => {
  // Reset header sections with default text
  // The Title uses createEmptyContent() and relies on the component's placeholder for text,
  // which solves the spacing issue.
  title.value.content = createEmptyContent(); 
  bigidea.value.content = createTiptapContent("BIG IDEA", 'heading', { level: 2 });
  bible.value.content = createTiptapContent("BIBLE", 'heading', { level: 2 });
  about.value.content = createTiptapContent("ABOUT THE WEEK", 'heading', { level: 2 });

  // Reset main sections (keep them empty)
  sections.value = [];

  // Clear the local storage draft
  clearDraft();
  
  // Update the draft ref to ensure all dependent components (Tiptap) react to the new state
  editorDraft.value = { 
      title: title.value.content, 
      bigidea: bigidea.value.content, 
      bible: bible.value.content, 
      about: about.value.content, 
      sections: []
  };
  console.info('Editor content has been reset with starter text.');
};


// --- Load/View State ---
const documentListVisible = ref(false);
const savedDocuments = ref([]);
const isLoading = ref(false);

// --- Content Update and Save Logic ---

/**
 * Updates the 'content' property of a specific section (main or header).
 * @param {string} id - The ID of the section to update (UID for main, string key for header).
 * @param {object} newContent - The Tiptap JSON object.
 */
const updateSectionContent = (id, newContent) => {
  // 1. Check if it's a main section (in sections.value array)
  let targetSection = sections.value.find(s => s.id === id);

  // 2. Check if it's a header section (in headerSections map)
  if (!targetSection && headerSections[id]) {
    targetSection = headerSections[id].value;
  }

  if (targetSection) {
    targetSection.content = newContent; // Store the Tiptap JSON
    
    // Trigger the watch function by creating a new object reference 
    editorDraft.value = { 
        title: title.value.content, 
        bigidea: bigidea.value.content, 
        bible: bible.value.content, 
        about: about.value.content, 
        // We use .map to create shallow copies of sections to ensure deep watch picks up array changes
        sections: sections.value.map(s => ({ ...s }))
    };
  } else {
    // This case should ideally not happen if all components emit content with a valid ID/key
    console.warn(`Could not find section with ID: ${id} to update content.`);
  }
};

/**
 * Extracts the plain text from the first H1 tag found in the Tiptap JSON content.
 * @param {object} tiptapJson - The Tiptap JSON object (from title.value.content).
 * @returns {string} The extracted title text, or a default string.
 */
const extractTitleText = (tiptapJson) => {
  if (!tiptapJson || !tiptapJson.content) {
    return 'Untitled Document';
  }

  // Iterate over content nodes to find the first H1 node
  for (const node of tiptapJson.content) {
    if (node.type === 'heading' && node.attrs && node.attrs.level === 1 && node.content) {
      // Concatenate text from all parts within the H1
      const title = node.content.map(part => part.text).join(' ');
      console.log(title.trim());
      return title.trim() || 'Untitled Document';
    }
  }

  // Fallback: If no H1 is found, concatenate all text from the first paragraph/node
  const firstTextNode = tiptapJson.content.find(node => node.content);
  if (firstTextNode) {
    console.log(firstTextNode.content.map(part => part.text).join(' ').trim());
    return firstTextNode.content.map(part => part.text).join(' ').trim() || 'Untitled Document';
  }

  return 'Untitled Document';
};

/**
 * Constructs the document payload and sends it to the Fastify backend for saving.
 */
const saveDocument = async () => {
  const titleJson = title.value.content;
  // CRITICAL FIX: Extract the actual text from the Tiptap JSON for the filename/display title
  const titleText = extractTitleText(titleJson);

  const documentPayload = {
    // We save the full Tiptap JSON content for the title
    title: title.value.content,
    titleText: titleText,
    header: {
      bigIdea: bigidea.value.content,
      bible: bible.value.content,
      about: about.value.content,
    },
    // Map the reactive sections state, ensuring 'content' holds the Tiptap JSON
    sections: sections.value.map(section => ({
      id: section.id,
      color: section.color,
      content: section.content || createEmptyContent(), // Use stored content or an empty doc
    })),
  };

  try {
    const response = await fetch('/api/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(documentPayload),
    });

    if (response.ok) {
      const result = await response.json();
      console.info(`Document successfully saved with ID: ${result.documentId}`);
      // Clear the draft after successful server save
      clearDraft();
    } else {
      console.error('Failed to save document:', response.status, response.statusText);
      const errorData = await response.json();
      console.error('Server Error Details:', errorData);
    }
  } catch (error) {
    console.error('Network or parsing error during save:', error);
  }
};

// --- Load Document Logic ---

/**
 * Fetches the list of saved documents from the backend and displays the modal.
 */
const fetchDocuments = async () => {
  documentListVisible.value = true;
  isLoading.value = true;
  savedDocuments.value = []; // Clear previous list

  try {
    const response = await fetch('/api/documents');
    if (response.ok) {
      // Assuming the backend returns documents with a 'title' field for display
      savedDocuments.value = await response.json();
      console.log(savedDocuments.value);
    } else {
      console.error('Failed to fetch document list:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Network error fetching document list:', error);
  } finally {
    isLoading.value = false;
  }
};

const deleteDocument = async (id, title) => {
  // IMPORTANT: Do NOT use the browser's native `confirm()` in an app running in an iframe.
  // Instead, you'd use a custom modal for confirmation. Since a custom modal UI is not 
  // currently available in this single-file component, we'll log a warning.
  console.warn("Custom confirmation needed. Proceeding with deletion for demonstration.");
  
  try {
    // Send DELETE request to the backend
    const response = await fetch(`/api/documents/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete document on the server.');
    }

    // Refresh the document list after successful deletion
    await fetchDocuments();
  } catch (error) {
    console.error('Error deleting document:', error);
    // In a real app, you would show a user-friendly error message here
  }
};

/**
 * Fetches the full content of a selected document and loads it into the editor.
 * @param {number} id - The ID of the document to load.
 */
const loadDocument = async (id) => {
  isLoading.value = true;
  try {
    const response = await fetch(`/api/documents/${id}`);
    if (response.ok) {
      const documentData = await response.json();

      // Load header content back into the reactive refs
      title.value.content = documentData.title || createEmptyContent();
      bigidea.value.content = documentData.header.bigIdea || createEmptyContent();
      bible.value.content = documentData.header.bible || createEmptyContent();
      about.value.content = documentData.header.about || createEmptyContent();

      // Load main sections content
      sections.value = documentData.sections.map(section => ({
        ...section,
        // Re-generate ID for loaded sections to ensure key uniqueness if they are edited and saved again
        id: uid(),
      }));

      console.info(`Document ID ${id} loaded successfully.`);
      closeLoadModal(); // Close modal after successful load
      
      // Clear the draft after successfully loading a server document
      clearDraft();
    } else {
      console.error('Failed to load document content:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Network error loading document:', error);
  } finally {
    isLoading.value = false;
  }
};

/**
 * Closes the document list modal.
 */
const closeLoadModal = () => {
  documentListVisible.value = false;
};

// --- Section Reordering Logic ---

/**
 * Moves a section up one position in the array.
 * @param {number} index - The current index of the section.
 */
const moveSectionUp = (index) => {
  if (index > 0) {
    // Standard array swap for reactivity
    const section = sections.value[index];
    sections.value[index] = sections.value[index - 1];
    sections.value[index - 1] = section;
    // Force Vue to recognize the change by creating a new array reference
    sections.value = [...sections.value];
    // Trigger auto-save
    editorDraft.value = { sections: sections.value.map(s => ({ ...s })) };
  }
};

/**
 * Moves a section down one position in the array.
 * @param {number} index - The current index of the section.
 */
const moveSectionDown = (index) => {
  if (index < sections.value.length - 1) {
    // Standard array swap for reactivity
    const section = sections.value[index];
    sections.value[index] = sections.value[index + 1];
    sections.value[index + 1] = section;
    // Force Vue to recognize the change by creating a new array reference
    sections.value = [...sections.value];
    // Trigger auto-save
    editorDraft.value = { sections: sections.value.map(s => ({ ...s })) };
  }
};


// --- Section Management Actions ---

// Method to add a new section
const addSection = (defaultColor) => {
  sections.value.push({
    id: uid(),
    color: defaultColor,
    // FIX: Use createTiptapContent with a starter paragraph for new sections
    content: createTiptapContent("PASTEHERE", 'heading', { level: 3 }), 
  });
  // Trigger auto-save
  editorDraft.value = { sections: sections.value.map(s => ({ ...s })) };
};

const addCustom = () => { addSection('#22a173'); };
const addActivity = () => { addSection('#4fc0a2'); };
const addScripture = () => { addSection('#c52026'); };
const addObject = () => { addSection('#52b849'); };
const addVideo = () => { addSection('#e2de1b'); };
const addBigidea = () => { addSection('#4643ba'); };
const addReflection = () => { addSection('#b764a9'); };
const addResponse = () => { addSection('#5c479c'); };
const addMemory = () => { addSection('#c52026'); };
const addPrayer = () => { addSection('#ec497f'); };
const addDiscussion = () => { addSection('#a2dae1'); };
const addPoll = () => { addSection('#d84826'); };
const addQuestion = () => { addSection('#3290ce'); };


// Method to remove a section by its ID
const removeSection = (idToRemove) => {
  sections.value = sections.value.filter(section => section.id !== idToRemove);
  // Trigger auto-save
  editorDraft.value = { sections: sections.value.map(s => ({ ...s })) };
};

// Triggers the browser's print dialog
const printDocument = () => {
  window.print();
};
</script>

<style scoped>
@import url(editor.css);

/* Optional simple styling for the new button if editor.css doesn't cover it */
.btn-reset {
  background-color: #f44336; /* Red color for caution */
  color: white;
}

.btn-reset:hover {
  background-color: #d32f2f;
}
</style>
