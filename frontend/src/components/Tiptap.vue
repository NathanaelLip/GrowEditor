<template>
    <div v-if="editor" class="container">
        <div class="control-group">
            <div class="button-group">
                <button @click="editor.chain().focus().toggleBold().run()"
                    :disabled="!editor.can().chain().focus().toggleBold().run()"
                    :class="{ 'is-active': editor.isActive('bold') }">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        class="lucide lucide-bold-icon lucide-bold">
                        <path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8" />
                    </svg>
                </button>
                <button @click="editor.chain().focus().toggleItalic().run()"
                    :disabled="!editor.can().chain().focus().toggleItalic().run()"
                    :class="{ 'is-active': editor.isActive('italic') }"><svg xmlns="http://www.w3.org/2000/svg"
                        width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-italic-icon lucide-italic">
                        <line x1="19" x2="10" y1="4" y2="4" />
                        <line x1="14" x2="5" y1="20" y2="20" />
                        <line x1="15" x2="9" y1="4" y2="20" />
                    </svg></button>
                <button @click="editor.chain().focus().toggleStrike().run()"
                    :disabled="!editor.can().chain().focus().toggleStrike().run()"
                    :class="{ 'is-active': editor.isActive('strike') }"><svg xmlns="http://www.w3.org/2000/svg"
                        width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round"
                        class="lucide lucide-strikethrough-icon lucide-strikethrough">
                        <path d="M16 4H9a3 3 0 0 0-2.83 4" />
                        <path d="M14 12a4 4 0 0 1 0 8H6" />
                        <line x1="4" x2="20" y1="12" y2="12" />
                    </svg></button>
                <button @click="editor.chain().focus().toggleCode().run()"
                    :disabled="!editor.can().chain().focus().toggleCode().run()"
                    :class="{ 'is-active': editor.isActive('code') }"><svg xmlns="http://www.w3.org/2000/svg" width="24"
                        height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-code-icon lucide-code">
                        <path d="m16 18 6-6-6-6" />
                        <path d="m8 6-6 6 6 6" />
                    </svg></button>
                <button @click="setLink" :class="{ 'is-active': editor.isActive('link') }"><svg
                        xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        class="lucide lucide-link-icon lucide-link">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg></button>
                <button @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
                    :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"><svg
                        xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        class="lucide lucide-heading1-icon lucide-heading-1">
                        <path d="M4 12h8" />
                        <path d="M4 18V6" />
                        <path d="M12 18V6" />
                        <path d="m17 12 3-2v8" />
                    </svg></button>
                <button @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
                    :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        class="lucide lucide-heading2-icon lucide-heading-2">
                        <path d="M4 12h8" />
                        <path d="M4 18V6" />
                        <path d="M12 18V6" />
                        <path d="M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1" />
                    </svg>
                </button>
                <button @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
                    :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        class="lucide lucide-heading3-icon lucide-heading-3">
                        <path d="M4 12h8" />
                        <path d="M4 18V6" />
                        <path d="M12 18V6" />
                        <path d="M17.5 10.5c1.7-1 3.5 0 3.5 1.5a2 2 0 0 1-2 2" />
                        <path d="M17 17.5c2 1.5 4 .3 4-1.5a2 2 0 0 0-2-2" />
                    </svg>
                </button>
                <button @click="editor.chain().focus().toggleHeading({ level: 4 }).run()"
                    :class="{ 'is-active': editor.isActive('heading', { level: 4 }) }">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        class="lucide lucide-heading4-icon lucide-heading-4">
                        <path d="M12 18V6" />
                        <path d="M17 10v3a1 1 0 0 0 1 1h3" />
                        <path d="M21 10v8" />
                        <path d="M4 12h8" />
                        <path d="M4 18V6" />
                    </svg>
                </button>
                <button @click="editor.chain().focus().toggleHeading({ level: 5 }).run()"
                    :class="{ 'is-active': editor.isActive('heading', { level: 5 }) }">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        class="lucide lucide-heading5-icon lucide-heading-5">
                        <path d="M4 12h8" />
                        <path d="M4 18V6" />
                        <path d="M12 18V6" />
                        <path d="M17 13v-3h4" />
                        <path d="M17 17.7c.4.2.8.3 1.3.3 1.5 0 2.7-1.1 2.7-2.5S19.8 13 18.3 13H17" />
                    </svg>
                </button>
                <button @click="editor.chain().focus().toggleHeading({ level: 6 }).run()"
                    :class="{ 'is-active': editor.isActive('heading', { level: 6 }) }">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        class="lucide lucide-heading6-icon lucide-heading-6">
                        <path d="M4 12h8" />
                        <path d="M4 18V6" />
                        <path d="M12 18V6" />
                        <circle cx="19" cy="16" r="2" />
                        <path d="M20 10c-2 2-3 3.5-3 6" />
                    </svg>
                </button>
                <button @click="editor.chain().focus().toggleBulletList().run()"
                    :class="{ 'is-active': editor.isActive('bulletList') }">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        class="lucide lucide-list-icon lucide-list">
                        <path d="M3 5h.01" />
                        <path d="M3 12h.01" />
                        <path d="M3 19h.01" />
                        <path d="M8 5h13" />
                        <path d="M8 12h13" />
                        <path d="M8 19h13" />
                    </svg>
                </button>
                <button @click="editor.chain().focus().toggleOrderedList().run()"
                    :class="{ 'is-active': editor.isActive('orderedList') }"><svg xmlns="http://www.w3.org/2000/svg"
                        width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round"
                        class="lucide lucide-list-ordered-icon lucide-list-ordered">
                        <path d="M11 5h10" />
                        <path d="M11 12h10" />
                        <path d="M11 19h10" />
                        <path d="M4 4h1v5" />
                        <path d="M4 9h2" />
                        <path d="M6.5 20H3.4c0-1 2.6-1.925 2.6-3.5a1.5 1.5 0 0 0-2.6-1.02" />
                    </svg></button>
                <button @click="editor.chain().focus().undo().run()"
                    :disabled="!editor.can().chain().focus().undo().run()"><svg xmlns="http://www.w3.org/2000/svg"
                        width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-undo-icon lucide-undo">
                        <path d="M3 7v6h6" />
                        <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
                    </svg></button>
                <button @click="editor.chain().focus().redo().run()"
                    :disabled="!editor.can().chain().focus().redo().run()"><svg xmlns="http://www.w3.org/2000/svg"
                        width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-redo-icon lucide-redo">
                        <path d="M21 7v6h-6" />
                        <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
                    </svg></button>
            </div>
        </div>
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
    // 1. Define Props to accept the 'section' object
    props: {
        section: {
            type: Object,
            required: true,
        },
    },
    // 2. Define emitted events
    emits: ['content-update'],

    data() {
        return {
            editor: null,
        }
    },

    mounted() {
        // Determine initial content. Use existing JSON content if available, otherwise use HTML template.
        const initialContent = this.section.content ? this.section.content : `
            <h3>
                PASTEHERE
            </h3>
            <p>
                PASTEHERE
            </p>
        `;

        this.editor = new Editor({
            extensions: [
                Color.configure({ types: [TextStyle.name, ListItem.name] }),
                TextStyle.configure({ types: [ListItem.name] }),
                StarterKit,
                Link.configure({
                    openOnClick: false,
                    defaultProtocol: 'https',
                }),
            ],
            // Use the determined initial content
            content: initialContent,

            // 3. Add the onUpdate hook to emit JSON content to the parent
            onUpdate: ({ editor }) => {
                const jsonContent = editor.getJSON();
                this.$emit('content-update', jsonContent);
            },
        })
    },

    methods: {
        // NOTE: We replace the use of window.prompt with a custom modal in a real app
        setLink() {
            const previousUrl = this.editor.getAttributes('link').href

            // WARNING: Using window.prompt/alert is blocked in this environment.
            // Replace this with a custom modal component for production use.
            const url = window.prompt('URL', previousUrl)

            // cancelled
            if (url === null) {
                return
            }

            // empty
            if (url === '') {
                this.editor.chain().focus().extendMarkRange('link').unsetLink().run()
                return
            }

            // update link
            this.editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
        },
    },


    beforeUnmount() {
        if (this.editor) {
            this.editor.destroy()
        }
    },
}
</script>

<style lang="scss">
@import url(./tiptap/scss/tiptap.scss);
</style>