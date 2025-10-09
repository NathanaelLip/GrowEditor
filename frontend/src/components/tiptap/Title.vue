<template>
    <div v-if="editor" class="container grow-title">
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
            : `<p>TITLE</p>`;

        this.editor = new Editor({
            extensions: [
                StarterKit.configure({
                    heading: { levels: [1, 2, 3, 4, 5, 6] },
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

// .grow-title {
//     background-image: url(https://uc4cc5ad2d7e1356ba57ad70072f.previews.dropboxusercontent.com/p/thumb/ACw_2ojdqJ2EW7P696E1hVQ2pg4vnc_pwMg67FD7BS5OdOlIXmNRWPn9dG6inLFNVlrlJzu8lma8UKA8iC-Kp3eP8l2jg6AzjXzHmkn1ZFNLCzxP_CUnVUiuJ01NZ4X7-Evlz4Vq2UnnuT0jmOWRfeW3llmtEs22k2SyS9QPpCpZQ_QzYzQhRUeCs1XQg7tQoLbKUXTTi10T6YcWhuhKkhjuEOhbFXJE0dhZSvY59W6XLsLJW8mk6LjZNJ5Je3DboKW6XR2vhSesfEZ8XRN4rlXbqnfwHKWT1SZmVommyXBCEqC49Nt7t7YaqivhWk-SHVZYCE04XdyvZxwigXIMGuL9OOZUjxKohFPhzP97xmo8OQ/p.png);
//     background-position-y: bottom;
//     background-size: cover;
//     print-color-adjust: exact;
// }

// .grow-title .tiptap {
//     height: 162px;
//     text-align: end;
//     align-content: center;
// }

.grow-title .tiptap p {
    // color: var(--white);
    font-size: 20px;
    font-weight: 700;
    font-style: italic;
    padding-bottom: 2rem;
    // width: 90%;
}
</style>
