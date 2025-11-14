// src/extensions/TldrawExtension.js

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import TldrawBlock from '../components/TldrawBlock';

export const TldrawExtension = Node.create({
  // Defines the schema for the node
  name: 'tldraw',
  group: 'block',
  atom: true, // Treated as a single unit (no internal editable content)

  // Sets the default attributes for the node
  addAttributes() {
    return {
      // Unique ID for tldraw instance separation
      id: {
        default: null,
        parseHTML: element => element.getAttribute('data-id'),
        renderHTML: attributes => ({ 'data-id': attributes.id }),
      },
      // Width of the rendered block
      width: {
        default: 500,
        parseHTML: element => parseInt(element.getAttribute('data-width'), 10) || 500,
        renderHTML: attributes => ({ 'data-width': attributes.width }),
      },
      // Height of the rendered block
      height: {
        default: 300,
        parseHTML: element => parseInt(element.getAttribute('data-height'), 10) || 300,
        renderHTML: attributes => ({ 'data-height': attributes.height }),
      },
      // The actual tldraw JSON state, stringified
      data: {
        default: '{}', // Default empty state
        parseHTML: element => element.getAttribute('data-state'),
        renderHTML: attributes => ({ 'data-state': attributes.data }),
      },
    };
  },
  
  // How to render the node in the editor using React
  addNodeViews() {
    return {
      // Renders the component we created in the previous step
      tldraw: ReactNodeViewRenderer(TldrawBlock),
    };
  },

  // Defines how the node should be rendered to HTML (for saving to file)
  renderHTML({ HTMLAttributes }) {
    // Saves the node as a custom div with attributes for later parsing
    return ['div', mergeAttributes(HTMLAttributes, { 
      'data-type': 'tldraw', 
      'class': 'tldraw-embed' 
    })];
  },

  // Defines how to parse the HTML back into a Tiptap node (for loading from file)
  parseHTML() {
    return [
      {
        tag: 'div[data-type="tldraw"]',
      },
    ];
  },
  
  // Custom command to insert the node via the MenuBar button
  addCommands() {
    return {
      insertTldraw: () => ({ commands }) => {
        // Create a unique ID for the new block
        const newId = `tldraw-${Date.now()}`;
        return commands.insertContent({
          type: this.name,
          attrs: { id: newId },
        });
      },
    };
  },
});