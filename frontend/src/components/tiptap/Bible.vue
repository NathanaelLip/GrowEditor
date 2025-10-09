<template>
    <div v-if="editor" class="container bible">
        <editor-content :editor="editor" />
    </div>
</template>

<script>
import { ListItem } from '@tiptap/extension-list'
import { Color, TextStyle } from '@tiptap/extension-text-style'
import StarterKit from '@tiptap/starter-kit'
import { Editor, EditorContent } from '@tiptap/vue-3'
import Link from '@tiptap/extension-link'

export default {
    components: {
        EditorContent,
    },
    props: {
        section: {
            type: Object,
            required: true,
        },
    },
    // Emits the full Tiptap JSON object for saving
    emits: ['content-update'],

    data() {
        return {
            editor: null,
        }
    },
    
    mounted() {
        // Use existing JSON content (if loaded from file) or a default HTML structure.
        const initialContent = this.section.content.content && this.section.content.content.length > 0
            ? this.section.content // This is the JSON object passed from the parent on load
            : `
            <h2 class="grow-bible">
                BIBLE
            </h2>
            <p class="grow-subtitle">
                PASTEHERE 
            </p>
        `;

        this.editor = new Editor({
            extensions: [
                Color.configure({ types: [TextStyle.name, ListItem.name] }),
                TextStyle.configure({ types: [ListItem.name] }),
                StarterKit.configure({
                    heading: { levels: [1, 2, 3, 4, 5, 6] },
                }),
                Link.configure({
                    openOnClick: false,
                    defaultProtocol: 'https',
                }),
            ],
            content: initialContent,
            
            // 1. LISTEN: Emit the content for saving whenever it changes
            onUpdate: ({ editor }) => {
                this.$emit('content-update', editor.getJSON());
            },
        });
    },

    // 2. WATCH: Listen for prop changes (when the parent loads a file)
    watch: {
        'section.content': {
            handler(newContent) {
                if (this.editor && newContent) {
                    // CRITICAL: Use setContent to load the new JSON content into the editor
                    this.editor.commands.setContent(newContent, false, { preserveCursor: true });
                }
            },
            deep: true, // Watch for nested changes in the JSON object
        },
    },

    beforeUnmount() {
        this.editor.destroy()
    },
}
</script>

<style lang="scss">
@import url(tiptap.scss);

.bible {
    background: var(--light-gray);
    padding: 1.5rem 0.5rem;
    text-align: center;
    margin-left: 0.25rem;
    print-color-adjust: exact;
}
</style>