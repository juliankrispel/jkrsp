#!/usr/bin/env python3
"""
Generate a Lexical Rails Architecture diagram
Run this script to create the lexical-rails-architecture.png image
"""

import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, ConnectionPatch
import numpy as np

# Set up the figure
fig, ax = plt.subplots(1, 1, figsize=(14, 10))
ax.set_xlim(0, 10)
ax.set_ylim(0, 12)
ax.axis('off')

# Colors
frontend_color = '#E3F2FD'  # Light blue
rails_color = '#FFF3E0'     # Light orange
backend_color = '#E8F5E8'   # Light green
arrow_color = '#666666'

# Define boxes
boxes = [
    # Frontend
    {'xy': (0.5, 8), 'width': 2.5, 'height': 3, 'color': frontend_color, 'label': 'Frontend\nLexical Editor'},
    # Rails
    {'xy': (4, 8), 'width': 2.5, 'height': 3, 'color': rails_color, 'label': 'Rails App\n(API Layer)'},
    # Backend
    {'xy': (7.5, 8), 'width': 2, 'height': 3, 'color': backend_color, 'label': 'Backend\nProcessing'},
]

# Draw boxes
for box in boxes:
    fancy_box = FancyBboxPatch(
        box['xy'], box['width'], box['height'],
        boxstyle="round,pad=0.1",
        facecolor=box['color'],
        edgecolor='black',
        linewidth=1.5
    )
    ax.add_patch(fancy_box)
    
    # Add labels
    ax.text(
        box['xy'][0] + box['width']/2, 
        box['xy'][1] + box['height']/2,
        box['label'],
        ha='center', va='center',
        fontsize=10, fontweight='bold',
        bbox=dict(boxstyle="round,pad=0.3", facecolor='white', alpha=0.8)
    )

# Draw arrows with labels
arrows = [
    # Frontend to Rails
    {'start': (3, 9.5), 'end': (4, 9.5), 'label': '1. lexical_data (JSON)', 'offset': 0.3},
    # Rails to Backend
    {'start': (6.5, 9.5), 'end': (7.5, 9.5), 'label': '2. Enqueue jobs', 'offset': 0.3},
    # Backend to Rails
    {'start': (7.5, 8.5), 'end': (6.5, 8.5), 'label': '3. Store results', 'offset': -0.3},
    # Rails to Frontend
    {'start': (4, 8.5), 'end': (3, 8.5), 'label': '4. Update UI', 'offset': -0.3},
]

for arrow in arrows:
    # Draw arrow
    ax.annotate('', xy=arrow['end'], xytext=arrow['start'],
                arrowprops=dict(arrowstyle='->', color=arrow_color, lw=2))
    
    # Add label
    mid_x = (arrow['start'][0] + arrow['end'][0]) / 2
    mid_y = (arrow['start'][1] + arrow['end'][1]) / 2 + arrow['offset']
    ax.text(mid_x, mid_y, arrow['label'], ha='center', va='center',
            fontsize=9, bbox=dict(boxstyle="round,pad=0.2", facecolor='white', alpha=0.9))

# Add component details
details_y = 5.5
detail_boxes = [
    {'xy': (0.5, details_y), 'width': 2.5, 'height': 4, 'color': frontend_color, 'label': 'Frontend Components'},
    {'xy': (4, details_y), 'width': 2.5, 'height': 4, 'color': rails_color, 'label': 'Rails Components'},
    {'xy': (7.5, details_y), 'width': 2, 'height': 4, 'color': backend_color, 'label': 'Backend Components'},
]

for box in detail_boxes:
    fancy_box = FancyBboxPatch(
        box['xy'], box['width'], box['height'],
        boxstyle="round,pad=0.1",
        facecolor=box['color'],
        edgecolor='black',
        linewidth=1.5
    )
    ax.add_patch(fancy_box)
    
    # Add title
    ax.text(
        box['xy'][0] + box['width']/2, 
        box['xy'][1] + box['height'] - 0.3,
        box['label'],
        ha='center', va='center',
        fontsize=9, fontweight='bold'
    )

# Add component lists
frontend_components = [
    "• React Components",
    "• Auto-save Plugin", 
    "• Real-time Sync",
    "• User Interactions"
]

rails_components = [
    "• Content Controller",
    "• API Endpoints",
    "• Authentication",
    "• Job Queuing"
]

backend_components = [
    "• Sidekiq Workers",
    "• LexicalContentService",
    "• Node.js Scripts",
    "• Database Storage"
]

component_lists = [
    {'x': 1.75, 'y': details_y + 2.5, 'components': frontend_components},
    {'x': 5.25, 'y': details_y + 2.5, 'components': rails_components},
    {'x': 8.5, 'y': details_y + 2.5, 'components': backend_components},
]

for comp_list in component_lists:
    for i, component in enumerate(comp_list['components']):
        ax.text(comp_list['x'], comp_list['y'] - i*0.4, component,
                ha='center', va='center', fontsize=8)

# Add title
ax.text(5, 11.5, 'Lexical Rails Architecture', ha='center', va='center',
        fontsize=16, fontweight='bold')

# Add subtitle
ax.text(5, 11, 'Rich Text Content Processing with Rails Workers', ha='center', va='center',
        fontsize=12, style='italic')

# Save the diagram
plt.tight_layout()
plt.savefig('lexical-rails-architecture.png', dpi=300, bbox_inches='tight', 
            facecolor='white', edgecolor='none')
plt.savefig('lexical-rails-architecture.webp', dpi=300, bbox_inches='tight',
            facecolor='white', edgecolor='none')

print("Diagram generated successfully!")
print("Files created:")
print("- lexical-rails-architecture.png")
print("- lexical-rails-architecture.webp")
