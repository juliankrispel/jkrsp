#!/usr/bin/env python3
"""
Generate a clean Lexical Rails Architecture diagram
"""

import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, Rectangle
import numpy as np

# Set up the figure with better proportions
fig, ax = plt.subplots(1, 1, figsize=(16, 8))
ax.set_xlim(0, 16)
ax.set_ylim(0, 8)
ax.axis('off')

# Clean color palette
colors = {
    'frontend': '#E3F2FD',  # Light blue
    'rails': '#FFF3E0',     # Light orange  
    'backend': '#E8F5E8',   # Light green
    'arrow': '#2E7D32',     # Dark green
    'text': '#212121',      # Dark gray
    'border': '#424242'     # Medium gray
}

# Define the three main components with better spacing
components = [
    {
        'name': 'Frontend\nLexical Editor',
        'x': 1, 'y': 4, 'width': 4, 'height': 3,
        'color': colors['frontend'],
        'details': [
            'React Components',
            'Auto-save Plugin',
            'Real-time Sync',
            'User Interactions'
        ]
    },
    {
        'name': 'Rails App\n(API Layer)',
        'x': 6, 'y': 4, 'width': 4, 'height': 3,
        'color': colors['rails'],
        'details': [
            'Content Controller',
            'API Endpoints',
            'Authentication',
            'Job Queuing'
        ]
    },
    {
        'name': 'Backend\nProcessing',
        'x': 11, 'y': 4, 'width': 4, 'height': 3,
        'color': colors['backend'],
        'details': [
            'Sidekiq Workers',
            'LexicalContentService',
            'Node.js Scripts',
            'Database Storage'
        ]
    }
]

# Draw the main components
for comp in components:
    # Main component box
    main_box = FancyBboxPatch(
        (comp['x'], comp['y']), comp['width'], comp['height'],
        boxstyle="round,pad=0.15",
        facecolor=comp['color'],
        edgecolor=colors['border'],
        linewidth=2
    )
    ax.add_patch(main_box)
    
    # Component title
    ax.text(
        comp['x'] + comp['width']/2, 
        comp['y'] + comp['height'] - 0.4,
        comp['name'],
        ha='center', va='center',
        fontsize=12, fontweight='bold',
        color=colors['text']
    )
    
    # Component details
    for i, detail in enumerate(comp['details']):
        ax.text(
            comp['x'] + comp['width']/2,
            comp['y'] + comp['height'] - 0.8 - i*0.3,
            f"• {detail}",
            ha='center', va='center',
            fontsize=9,
            color=colors['text']
        )

# Define clean arrows with better positioning
arrows = [
    {
        'start': (5, 5.5), 'end': (6, 5.5),
        'label': 'lexical_data (JSON)',
        'label_pos': (5.5, 6.2)
    },
    {
        'start': (10, 5.5), 'end': (11, 5.5),
        'label': 'enqueue jobs',
        'label_pos': (10.5, 6.2)
    },
    {
        'start': (11, 4.5), 'end': (10, 4.5),
        'label': 'store results',
        'label_pos': (10.5, 3.8)
    },
    {
        'start': (6, 4.5), 'end': (5, 4.5),
        'label': 'update UI',
        'label_pos': (5.5, 3.8)
    }
]

# Draw arrows
for arrow in arrows:
    # Arrow line
    ax.annotate('', 
                xy=arrow['end'], 
                xytext=arrow['start'],
                arrowprops=dict(
                    arrowstyle='->',
                    color=colors['arrow'],
                    lw=2.5,
                    shrinkA=5,
                    shrinkB=5
                ))
    
    # Arrow label
    ax.text(arrow['label_pos'][0], arrow['label_pos'][1],
            arrow['label'],
            ha='center', va='center',
            fontsize=10, fontweight='bold',
            color=colors['arrow'],
            bbox=dict(
                boxstyle="round,pad=0.3",
                facecolor='white',
                edgecolor=colors['arrow'],
                alpha=0.9
            ))

# Add a clean title
ax.text(8, 7.5, 'Lexical Rails Architecture', 
        ha='center', va='center',
        fontsize=18, fontweight='bold',
        color=colors['text'])

# Add subtitle
ax.text(8, 7, 'Rich Text Content Processing with Rails Workers', 
        ha='center', va='center',
        fontsize=12, style='italic',
        color=colors['text'])

# Add data flow indicator
ax.text(8, 0.5, 'Data flows asynchronously through workers for optimal performance', 
        ha='center', va='center',
        fontsize=10,
        color=colors['text'],
        style='italic')

# Clean up and save
plt.tight_layout()
plt.savefig('lexical-rails-architecture.png', 
            dpi=300, bbox_inches='tight', 
            facecolor='white', edgecolor='none',
            pad_inches=0.2)
plt.savefig('lexical-rails-architecture.webp', 
            dpi=300, bbox_inches='tight',
            facecolor='white', edgecolor='none',
            pad_inches=0.2)

print("Clean diagram generated successfully!")
print("Files created:")
print("- lexical-rails-architecture.png")
print("- lexical-rails-architecture.webp")
