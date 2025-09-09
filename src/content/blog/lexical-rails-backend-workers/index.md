---
title: "Using Lexical in Rails with Workers for Backend Content Manipulation"
pubDate: "2025-09-09T12:09:33.000Z"
description: "Learn how to integrate Lexical editor with Rails backend workers to manipulate rich text content server-side, enabling powerful content processing workflows."
draft: false
---

Rich text editors like Lexical are typically frontend-only tools, but what if you need to manipulate that content on your Rails backend? Whether you're building content processing pipelines, implementing auto-save functionality, or creating content analysis tools, server-side Lexical manipulation opens up powerful possibilities.

In this article, I'll show you how to integrate Lexical with Rails workers to process, transform, and analyze rich text content on your backend.

## Why Backend Lexical Processing?

Before diving into the implementation, let's understand why you might want to process Lexical content on your Rails backend:

Here's how Lexical content flows from the frontend editor through Rails workers for backend processing:

```
┌─────────────────────────────────────────────────────────────────┐
│                    LEXICAL RAILS ARCHITECTURE                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Rails App     │    │   Backend       │
│   Lexical       │    │   (API Layer)   │    │   Processing    │
│   Editor        │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ 1. User edits         │                       │
         │    content            │                       │
         │                       │                       │
         │ 2. lexical_data       │                       │
         │    (JSON)             │                       │
         ├──────────────────────►│                       │
         │                       │                       │
         │                       │ 3. Enqueue jobs       │
         │                       ├──────────────────────►│
         │                       │                       │
         │                       │                       │ 4. Process
         │                       │                       │    content
         │                       │                       │
         │                       │                       │ 5. Store
         │                       │                       │    results
         │                       │◄──────────────────────┤
         │                       │                       │
         │ 6. Update UI          │                       │
         │◄──────────────────────┤                       │
         │                       │                       │

┌─────────────────────────────────────────────────────────────────┐
│                        COMPONENT DETAILS                        │
└─────────────────────────────────────────────────────────────────┘

Frontend Lexical Editor:
├── React Components
├── Auto-save Plugin
├── Real-time Sync
└── User Interactions

Rails Application:
├── Content Controller
├── API Endpoints
├── Authentication
├── Validation
└── Job Queuing

Backend Processing:
├── Sidekiq Workers
├── LexicalContentService
├── Node.js Scripts
├── Database Storage
├── Cache Layer
└── Error Handling
```

This architecture separates concerns effectively: the frontend handles editing, Rails manages the application logic, and workers handle heavy content processing asynchronously.

### Content Analysis and Intelligence

One of the most powerful use cases is extracting meaningful insights from your content. Imagine automatically analyzing every article, blog post, or document to understand its structure, complexity, and engagement potential.

**Real-world scenarios:**
- **Editorial workflows**: Automatically calculate reading time, extract key topics, and suggest improvements
- **Content scoring**: Rate content quality based on readability, SEO factors, and engagement metrics
- **Analytics dashboards**: Track content performance across your entire platform
- **AI-powered insights**: Generate summaries, extract entities, and identify content gaps

### Auto-save and Version Control

Building a robust auto-save system that doesn't interfere with the user experience is crucial for any content platform. With Lexical backend processing, you can create sophisticated versioning systems.

**What this enables:**
- **Seamless collaboration**: Multiple users can work on content without losing changes
- **Draft management**: Intelligent saving that preserves work without overwhelming the server
- **Content recovery**: Restore previous versions when needed
- **Audit trails**: Track who made what changes and when

### Content Transformation and Templating

Sometimes you need to transform content between different formats or apply consistent styling across your platform. Backend processing makes this possible without impacting the editing experience.

**Common transformations:**
- **Format conversion**: Convert between HTML, Markdown, and other formats
- **Template application**: Apply consistent styling and structure to content
- **Content sanitization**: Remove dangerous HTML and ensure security
- **Bulk formatting**: Apply changes across hundreds of documents at once

### Search and Discovery

Making your content discoverable is essential for user engagement. Backend processing allows you to build sophisticated search capabilities.

**Search features you can build:**
- **Full-text search**: Extract and index all text content for fast searching
- **Metadata extraction**: Index topics, tags, and other structured data
- **Content recommendations**: Suggest related content based on analysis
- **Search optimization**: Improve search results with content intelligence

### Content Validation and Quality Control

Ensuring content meets your standards is crucial for maintaining quality. Backend processing lets you implement comprehensive validation.

**Validation scenarios:**
- **Business rules**: Ensure content follows your editorial guidelines
- **Accessibility checks**: Verify alt text, heading structure, and other accessibility requirements
- **SEO validation**: Check for proper meta descriptions, keyword density, and structure
- **Content moderation**: Automatically flag inappropriate or low-quality content

### Bulk Operations and Automation

When you have thousands of documents, manual processing becomes impossible. Backend workers enable powerful automation.

**Automation opportunities:**
- **Migration tools**: Convert content from legacy systems to new formats
- **Batch processing**: Apply changes across entire content libraries
- **Scheduled tasks**: Run maintenance and optimization jobs during off-peak hours
- **Integration workflows**: Sync content with external systems and APIs

## Setting Up Lexical in Rails

Now that we understand the use cases, let's dive into the implementation. The key challenge is that Lexical is designed to run in the browser, but we need it to work on our Rails backend. We'll solve this by creating a bridge between Ruby and Node.js.

The approach involves three main components:
1. **Node.js scripts** that handle the actual Lexical processing
2. **Ruby service classes** that orchestrate the processing
3. **Rails workers** that handle the asynchronous operations

Let's start by setting up the dependencies and creating the foundation for our Lexical backend processing.

### 1. Install Lexical Dependencies

First, we need to install the Lexical packages in our Rails application. Add these to your `package.json`:

```json
{
  "dependencies": {
    "lexical": "^0.12.0",
    "@lexical/rich-text": "^0.12.0",
    "@lexical/plain-text": "^0.12.0",
    "@lexical/html": "^0.12.0",
    "@lexical/mark": "^0.12.0",
    "@lexical/list": "^0.12.0",
    "@lexical/code": "^0.12.0"
  }
}
```

### 2. Create a Lexical Service Class

The heart of our backend Lexical processing is a Ruby service class that acts as a bridge between Rails and Node.js. This service will handle all the communication with our Node.js scripts and provide a clean Ruby interface for the rest of our application.

Think of this service as a translator that converts between Ruby objects and Lexical's JSON format, while also providing convenient methods for common operations like extracting metadata or converting between formats.

```ruby
# app/services/lexical_content_service.rb
class LexicalContentService
  def initialize(content_json)
    @content_json = content_json
  end

  def self.from_html(html_content)
    # Convert HTML to Lexical JSON format
    new(convert_html_to_lexical(html_content))
  end

  def self.from_plain_text(text_content)
    # Convert plain text to Lexical JSON format
    new(convert_text_to_lexical(text_content))
  end

  def to_html
    # Convert Lexical JSON to HTML
    convert_lexical_to_html(@content_json)
  end

  def to_plain_text
    # Extract plain text from Lexical JSON
    extract_plain_text(@content_json)
  end

  def extract_metadata
    # Extract metadata like word count, reading time, etc.
    {
      word_count: count_words,
      reading_time: calculate_reading_time,
      has_images: has_images?,
      has_links: has_links?,
      structure: analyze_structure
    }
  end

  def transform_content(&block)
    # Apply transformations to the content
    transformed_json = apply_transformations(@content_json, &block)
    self.class.new(transformed_json)
  end

  def validate_content
    # Validate content against business rules
    validation_errors = []
    
    # Example validations
    validation_errors << "Content too short" if word_count < 10
    validation_errors << "Missing title" unless has_title?
    validation_errors << "Invalid links detected" if has_invalid_links?
    
    validation_errors
  end

  private

  def count_words
    # Implementation to count words in Lexical JSON
    # This would traverse the JSON structure and count text nodes
  end

  def calculate_reading_time
    # Calculate estimated reading time based on word count
    (word_count / 200.0).ceil # Assuming 200 words per minute
  end

  def has_images?
    # Check if content contains image nodes
  end

  def has_links?
    # Check if content contains link nodes
  end

  def analyze_structure
    # Analyze the document structure (headings, paragraphs, lists, etc.)
  end

  def has_title?
    # Check if content has a title/heading
  end

  def has_invalid_links?
    # Validate all links in the content
  end

  # Node.js integration methods
  def self.convert_html_to_lexical(html)
    # Use Node.js to convert HTML to Lexical JSON
    execute_node_script('html-to-lexical.js', html)
  end

  def self.convert_text_to_lexical(text)
    # Use Node.js to convert plain text to Lexical JSON
    execute_node_script('text-to-lexical.js', text)
  end

  def convert_lexical_to_html(lexical_json)
    # Use Node.js to convert Lexical JSON to HTML
    self.class.execute_node_script('lexical-to-html.js', lexical_json)
  end

  def extract_plain_text(lexical_json)
    # Use Node.js to extract plain text from Lexical JSON
    self.class.execute_node_script('extract-text.js', lexical_json)
  end

  def self.execute_node_script(script_name, input_data)
    # Execute Node.js scripts for Lexical operations
    script_path = Rails.root.join('lib', 'lexical_scripts', script_name)
    
    result = `node #{script_path} '#{input_data.to_json}'`
    JSON.parse(result)
  rescue => e
    Rails.logger.error "Lexical script execution failed: #{e.message}"
    raise LexicalProcessingError, "Failed to process content: #{e.message}"
  end
end

class LexicalProcessingError < StandardError; end
```

### 3. Create Node.js Scripts for Lexical Operations

Now we need to create the Node.js scripts that do the heavy lifting. These scripts run in a headless environment (without a browser) and process Lexical content using the same libraries that power the frontend editor.

The key insight here is that we can create a "headless" Lexical editor that processes content without needing a DOM. This allows us to run all the same operations that happen in the browser, but on our server.

Let's create scripts for the most common operations:

```javascript
// lib/lexical_scripts/html-to-lexical.js
const { $getRoot, $getSelection } = require('lexical');
const { $generateHtmlFromNodes } = require('@lexical/html');
const { $generateNodesFromDOM } = require('@lexical/html');
const { $createParagraphNode, $createTextNode } = require('lexical');
const { createEditor } = require('lexical');

const inputData = JSON.parse(process.argv[2]);
const htmlContent = inputData;

// Create a headless editor for processing
const editor = createEditor({
  nodes: [
    // Add your custom nodes here
  ],
  onError: (error) => {
    console.error('Lexical error:', error);
  }
});

editor.update(() => {
  const parser = new DOMParser();
  const dom = parser.parseFromString(htmlContent, 'text/html');
  const nodes = $generateNodesFromDOM(editor, dom);
  const root = $getRoot();
  root.clear();
  root.append(...nodes);
});

const lexicalState = editor.getEditorState();
const lexicalJSON = lexicalState.toJSON();

console.log(JSON.stringify(lexicalJSON));
```

```javascript
// lib/lexical_scripts/lexical-to-html.js
const { $getRoot } = require('lexical');
const { $generateHtmlFromNodes } = require('@lexical/html');
const { createEditor } = require('lexical');

const inputData = JSON.parse(process.argv[2]);
const lexicalJSON = inputData;

const editor = createEditor({
  nodes: [
    // Add your custom nodes here
  ],
  onError: (error) => {
    console.error('Lexical error:', error);
  }
});

editor.setEditorState(editor.parseEditorState(lexicalJSON));

editor.getEditorState().read(() => {
  const htmlString = $generateHtmlFromNodes(editor, null);
  console.log(htmlString);
});
```

```javascript
// lib/lexical_scripts/extract-text.js
const { $getRoot } = require('lexical');
const { $createTextNode } = require('lexical');
const { createEditor } = require('lexical');

const inputData = JSON.parse(process.argv[2]);
const lexicalJSON = inputData;

const editor = createEditor({
  nodes: [
    // Add your custom nodes here
  ],
  onError: (error) => {
    console.error('Lexical error:', error);
  }
});

editor.setEditorState(editor.parseEditorState(lexicalJSON));

editor.getEditorState().read(() => {
  const root = $getRoot();
  let textContent = '';
  
  function extractText(node) {
    if (node.getType() === 'text') {
      textContent += node.getTextContent();
    } else {
      const children = node.getChildren();
      children.forEach(child => extractText(child));
    }
  }
  
  root.getChildren().forEach(child => extractText(child));
  console.log(textContent);
});
```

## Implementing Rails Workers

With our Lexical service and Node.js scripts in place, we can now build the Rails workers that orchestrate the entire process. Workers are perfect for this use case because they allow us to process content asynchronously without blocking the user interface.

The beauty of this approach is that users can continue editing while their content is being processed in the background. This creates a smooth, responsive experience while still enabling powerful backend operations.

Let's create different types of workers for different use cases:

### 1. Content Processing Worker

This is our main worker that handles most content processing operations. It's designed to be flexible, allowing us to perform different types of operations on content based on the parameters we pass to it.

The worker uses a case statement to handle different operation types, making it easy to extend with new functionality as your needs grow.

```ruby
# app/workers/lexical_content_processor_worker.rb
class LexicalContentProcessorWorker
  include Sidekiq::Worker
  
  sidekiq_options queue: :content_processing, retry: 3

  def perform(content_id, operation_type, options = {})
    content = Content.find(content_id)
    
    case operation_type.to_sym
    when :extract_metadata
      extract_metadata(content)
    when :validate_content
      validate_content(content)
    when :transform_content
      transform_content(content, options)
    when :generate_summary
      generate_summary(content)
    when :index_for_search
      index_for_search(content)
    else
      raise ArgumentError, "Unknown operation: #{operation_type}"
    end
  end

  private

  def extract_metadata(content)
    lexical_service = LexicalContentService.new(content.lexical_data)
    metadata = lexical_service.extract_metadata
    
    content.update!(
      word_count: metadata[:word_count],
      reading_time: metadata[:reading_time],
      has_images: metadata[:has_images],
      has_links: metadata[:has_links],
      content_structure: metadata[:structure]
    )
    
    Rails.logger.info "Extracted metadata for content #{content.id}"
  end

  def validate_content(content)
    lexical_service = LexicalContentService.new(content.lexical_data)
    validation_errors = lexical_service.validate_content
    
    if validation_errors.any?
      content.update!(
        validation_status: 'invalid',
        validation_errors: validation_errors
      )
      
      # Notify content owner about validation issues
      ContentValidationMailer.validation_failed(content, validation_errors).deliver_now
    else
      content.update!(validation_status: 'valid')
    end
  end

  def transform_content(content, options)
    lexical_service = LexicalContentService.new(content.lexical_data)
    
    # Apply transformations based on options
    transformed_service = lexical_service.transform_content do |node|
      case options[:transformation]
      when 'sanitize'
        sanitize_node(node)
      when 'add_reading_time'
        add_reading_time_annotation(node, lexical_service.extract_metadata[:reading_time])
      when 'extract_links'
        extract_and_validate_links(node)
      end
    end
    
    # Save transformed content
    content.update!(
      lexical_data: transformed_service.instance_variable_get(:@content_json),
      processed_at: Time.current
    )
  end

  def generate_summary(content)
    lexical_service = LexicalContentService.new(content.lexical_data)
    plain_text = lexical_service.to_plain_text
    
    # Use AI service to generate summary
    summary = AISummaryService.generate_summary(plain_text)
    
    content.update!(ai_generated_summary: summary)
  end

  def index_for_search(content)
    lexical_service = LexicalContentService.new(content.lexical_data)
    plain_text = lexical_service.to_plain_text
    metadata = lexical_service.extract_metadata
    
    # Index content for search
    SearchIndexer.index_content(
      content_id: content.id,
      title: content.title,
      content: plain_text,
      metadata: metadata
    )
  end

  def sanitize_node(node)
    # Remove potentially dangerous content
    # Implementation depends on your sanitization needs
  end

  def add_reading_time_annotation(node, reading_time)
    # Add reading time annotation to content
  end

  def extract_and_validate_links(node)
    # Extract and validate all links in the content
  end
end
```

### 2. Auto-save Worker

Auto-save is one of the most important features for any content editor. This worker handles the delicate balance between saving frequently enough to prevent data loss, but not so frequently that it impacts performance.

The key insight here is that we create version history entries for every auto-save, allowing users to recover their work even if something goes wrong. This gives users confidence to experiment with their content.

```ruby
# app/workers/lexical_autosave_worker.rb
class LexicalAutosaveWorker
  include Sidekiq::Worker
  
  sidekiq_options queue: :autosave, retry: 2

  def perform(content_id, lexical_data, user_id)
    content = Content.find(content_id)
    user = User.find(user_id)
    
    # Validate that user can edit this content
    unless content.editable_by?(user)
      Rails.logger.warn "User #{user_id} attempted to edit content #{content_id} without permission"
      return
    end
    
    # Process the content
    lexical_service = LexicalContentService.new(lexical_data)
    
    # Create a version history entry
    content.content_versions.create!(
      lexical_data: lexical_data,
      user: user,
      created_at: Time.current
    )
    
    # Update the main content
    content.update!(
      lexical_data: lexical_data,
      last_edited_by: user,
      last_edited_at: Time.current
    )
    
    # Queue metadata extraction for later processing
    LexicalContentProcessorWorker.perform_async(content.id, :extract_metadata)
    
    Rails.logger.info "Auto-saved content #{content.id} for user #{user_id}"
  end
end
```

### 3. Bulk Content Processing Worker

When you need to process hundreds or thousands of documents, individual workers become inefficient. This bulk processing worker acts as a coordinator, queuing up individual processing jobs for each piece of content.

This pattern is particularly useful for migrations, bulk updates, or when you need to reprocess your entire content library after making changes to your processing logic.

```ruby
# app/workers/bulk_lexical_processor_worker.rb
class BulkLexicalProcessorWorker
  include Sidekiq::Worker
  
  sidekiq_options queue: :bulk_processing, retry: 1

  def perform(content_ids, operation_type, options = {})
    content_ids.each do |content_id|
      LexicalContentProcessorWorker.perform_async(content_id, operation_type, options)
    end
    
    Rails.logger.info "Queued #{content_ids.count} content items for #{operation_type} processing"
  end
end
```

## Rails Models and Controllers

Now let's build the Rails models and controllers that tie everything together. These components provide the interface between your users and the powerful backend processing we've built.

The key is to design these components to be simple and intuitive for developers to use, while hiding the complexity of the Lexical processing behind clean, well-designed APIs.

### 1. Content Model

The Content model is the heart of our system. It stores the Lexical JSON data and provides convenient methods for working with it. Notice how we delegate complex operations to our LexicalContentService, keeping the model clean and focused on data management.

```ruby
# app/models/content.rb
class Content < ApplicationRecord
  belongs_to :user
  has_many :content_versions, dependent: :destroy
  
  validates :title, presence: true
  validates :lexical_data, presence: true
  
  scope :validated, -> { where(validation_status: 'valid') }
  scope :with_images, -> { where(has_images: true) }
  scope :recently_edited, -> { order(last_edited_at: :desc) }
  
  def editable_by?(user)
    user == self.user || user.admin?
  end
  
  def lexical_service
    @lexical_service ||= LexicalContentService.new(lexical_data)
  end
  
  def to_html
    lexical_service.to_html
  end
  
  def to_plain_text
    lexical_service.to_plain_text
  end
  
  def extract_metadata_async
    LexicalContentProcessorWorker.perform_async(id, :extract_metadata)
  end
  
  def validate_content_async
    LexicalContentProcessorWorker.perform_async(id, :validate_content)
  end
  
  def generate_summary_async
    LexicalContentProcessorWorker.perform_async(id, :generate_summary)
  end
end
```

### 2. Content Versions Model

Version control is crucial for any content management system. This model tracks every change made to content, allowing users to see the history of their work and restore previous versions if needed.

The model includes the same Lexical processing capabilities as the main Content model, so you can analyze and process any version of the content.

```ruby
# app/models/content_version.rb
class ContentVersion < ApplicationRecord
  belongs_to :content
  belongs_to :user
  
  validates :lexical_data, presence: true
  
  def lexical_service
    @lexical_service ||= LexicalContentService.new(lexical_data)
  end
  
  def to_html
    lexical_service.to_html
  end
  
  def to_plain_text
    lexical_service.to_plain_text
  end
end
```

### 3. Content Controller

The controller handles all the HTTP requests and coordinates between the frontend and our backend processing. It's designed to be fast and responsive, delegating heavy processing to background workers.

Notice how the controller triggers background processing after saving content, ensuring that users get immediate feedback while processing happens asynchronously.

```ruby
# app/controllers/contents_controller.rb
class ContentsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_content, only: [:show, :edit, :update, :destroy, :versions]
  
  def index
    @contents = current_user.contents.recently_edited
  end
  
  def show
    @content_html = @content.to_html
  end
  
  def new
    @content = current_user.contents.build
  end
  
  def create
    @content = current_user.contents.build(content_params)
    
    if @content.save
      # Queue initial processing
      @content.extract_metadata_async
      @content.validate_content_async
      
      redirect_to @content, notice: 'Content was successfully created.'
    else
      render :new
    end
  end
  
  def update
    if @content.update(content_params)
      # Queue content processing
      @content.extract_metadata_async
      @content.validate_content_async
      
      redirect_to @content, notice: 'Content was successfully updated.'
    else
      render :edit
    end
  end
  
  def autosave
    # Handle auto-save requests from the frontend
    LexicalAutosaveWorker.perform_async(
      @content.id,
      params[:lexical_data],
      current_user.id
    )
    
    render json: { status: 'saved', timestamp: Time.current }
  end
  
  def versions
    @versions = @content.content_versions.order(created_at: :desc)
  end
  
  def restore_version
    version = @content.content_versions.find(params[:version_id])
    
    if @content.update(lexical_data: version.lexical_data)
      redirect_to @content, notice: 'Content restored to previous version.'
    else
      redirect_to versions_content_path(@content), alert: 'Failed to restore version.'
    end
  end
  
  def bulk_process
    content_ids = params[:content_ids]
    operation = params[:operation]
    
    BulkLexicalProcessorWorker.perform_async(content_ids, operation)
    
    redirect_to contents_path, notice: "Queued #{content_ids.count} items for #{operation} processing."
  end
  
  private
  
  def set_content
    @content = Content.find(params[:id])
  end
  
  def content_params
    params.require(:content).permit(:title, :lexical_data)
  end
end
```

## Frontend Integration

### 1. Lexical Editor Component

```javascript
// app/javascript/components/LexicalEditor.jsx
import React, { useCallback, useEffect, useState } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

const theme = {
  // Your theme configuration
};

function AutoSavePlugin({ contentId, userId }) {
  const [editor] = useLexicalComposerContext();
  const [lastSaved, setLastSaved] = useState(null);
  
  const saveContent = useCallback(async () => {
    const editorState = editor.getEditorState();
    const lexicalData = editorState.toJSON();
    
    try {
      const response = await fetch(`/contents/${contentId}/autosave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
        },
        body: JSON.stringify({
          lexical_data: lexicalData,
          user_id: userId
        })
      });
      
      if (response.ok) {
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [editor, contentId, userId]);
  
  useEffect(() => {
    const interval = setInterval(saveContent, 30000); // Auto-save every 30 seconds
    return () => clearInterval(interval);
  }, [saveContent]);
  
  return null;
}

export default function LexicalEditor({ initialData, contentId, userId }) {
  const initialConfig = {
    namespace: 'MyEditor',
    theme,
    onError: (error) => {
      console.error('Lexical error:', error);
    },
    editorState: initialData ? JSON.stringify(initialData) : undefined
  };
  
  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="editor-container">
        <RichTextPlugin
          contentEditable={<ContentEditable className="editor-input" />}
          placeholder={<div className="editor-placeholder">Enter some text...</div>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <AutoFocusPlugin />
        <AutoSavePlugin contentId={contentId} userId={userId} />
      </div>
    </LexicalComposer>
  );
}
```

### 2. Rails View Integration

```erb
<!-- app/views/contents/edit.html.erb -->
<div class="content-editor">
  <%= form_with model: @content, local: true do |form| %>
    <div class="form-group">
      <%= form.label :title %>
      <%= form.text_field :title, class: 'form-control' %>
    </div>
    
    <div class="form-group">
      <%= form.label :content %>
      <div id="lexical-editor"></div>
      <%= form.hidden_field :lexical_data, id: 'lexical-data' %>
    </div>
    
    <div class="form-actions">
      <%= form.submit 'Save Content', class: 'btn btn-primary' %>
    </div>
  <% end %>
</div>

<script>
  document.addEventListener('DOMContentLoaded', function() {
    const editorContainer = document.getElementById('lexical-editor');
    const lexicalDataField = document.getElementById('lexical-data');
    
    // Initialize Lexical editor
    const editor = React.createElement(LexicalEditor, {
      initialData: <%= raw @content.lexical_data.to_json %>,
      contentId: <%= @content.id %>,
      userId: <%= current_user.id %>
    });
    
    ReactDOM.render(editor, editorContainer);
    
    // Update hidden field when content changes
    // This would be handled by the Lexical editor's onChange callback
  });
</script>
```

## Advanced Features

### 1. Content Analytics

```ruby
# app/workers/content_analytics_worker.rb
class ContentAnalyticsWorker
  include Sidekiq::Worker
  
  def perform(content_id)
    content = Content.find(content_id)
    lexical_service = LexicalContentService.new(content.lexical_data)
    
    analytics = {
      word_count: lexical_service.extract_metadata[:word_count],
      reading_time: lexical_service.extract_metadata[:reading_time],
      complexity_score: calculate_complexity(lexical_service),
      engagement_score: calculate_engagement_score(content),
      seo_score: calculate_seo_score(lexical_service)
    }
    
    content.update!(analytics_data: analytics)
  end
  
  private
  
  def calculate_complexity(lexical_service)
    # Calculate content complexity based on various factors
  end
  
  def calculate_engagement_score(content)
    # Calculate engagement score based on user interactions
  end
  
  def calculate_seo_score(lexical_service)
    # Calculate SEO score based on content structure and keywords
  end
end
```

### 2. Content Templates

```ruby
# app/services/content_template_service.rb
class ContentTemplateService
  def self.apply_template(content, template_name)
    template = ContentTemplate.find_by(name: template_name)
    return content unless template
    
    lexical_service = LexicalContentService.new(content.lexical_data)
    
    # Apply template transformations
    transformed_content = lexical_service.transform_content do |node|
      apply_template_rules(node, template.rules)
    end
    
    content.update!(lexical_data: transformed_content.instance_variable_get(:@content_json))
  end
  
  private
  
  def self.apply_template_rules(node, rules)
    # Apply template-specific rules to content nodes
  end
end
```

## Performance Considerations

### 1. Caching Strategies

```ruby
# app/services/lexical_cache_service.rb
class LexicalCacheService
  def self.cached_html(content_id)
    Rails.cache.fetch("content_html_#{content_id}", expires_in: 1.hour) do
      content = Content.find(content_id)
      LexicalContentService.new(content.lexical_data).to_html
    end
  end
  
  def self.cached_metadata(content_id)
    Rails.cache.fetch("content_metadata_#{content_id}", expires_in: 30.minutes) do
      content = Content.find(content_id)
      LexicalContentService.new(content.lexical_data).extract_metadata
    end
  end
  
  def self.invalidate_cache(content_id)
    Rails.cache.delete("content_html_#{content_id}")
    Rails.cache.delete("content_metadata_#{content_id}")
  end
end
```

### 2. Background Job Optimization

```ruby
# config/initializers/sidekiq.rb
Sidekiq.configure_server do |config|
  config.redis = { url: ENV['REDIS_URL'] }
  
  # Configure queues with different priorities
  config.queues = %w[critical autosave content_processing bulk_processing default]
end

Sidekiq.configure_client do |config|
  config.redis = { url: ENV['REDIS_URL'] }
end
```

## Testing Your Implementation

### 1. Unit Tests for Lexical Service

```ruby
# spec/services/lexical_content_service_spec.rb
RSpec.describe LexicalContentService do
  let(:sample_lexical_data) do
    {
      "root" => {
        "children" => [
          {
            "children" => [
              {
                "detail" => 0,
                "format" => 0,
                "mode" => "normal",
                "style" => "",
                "text" => "Hello, world!",
                "type" => "text",
                "version" => 1
              }
            ],
            "direction" => "ltr",
            "format" => "",
            "indent" => 0,
            "type" => "paragraph",
            "version" => 1
          }
        ],
        "direction" => "ltr",
        "format" => "",
        "indent" => 0,
        "type" => "root",
        "version" => 1
      }
    }
  end
  
  describe '#extract_metadata' do
    it 'extracts word count correctly' do
      service = described_class.new(sample_lexical_data)
      metadata = service.extract_metadata
      
      expect(metadata[:word_count]).to eq(2)
    end
    
    it 'calculates reading time' do
      service = described_class.new(sample_lexical_data)
      metadata = service.extract_metadata
      
      expect(metadata[:reading_time]).to eq(1)
    end
  end
  
  describe '#to_plain_text' do
    it 'extracts plain text from lexical data' do
      service = described_class.new(sample_lexical_data)
      plain_text = service.to_plain_text
      
      expect(plain_text).to eq("Hello, world!")
    end
  end
end
```

### 2. Worker Tests

```ruby
# spec/workers/lexical_content_processor_worker_spec.rb
RSpec.describe LexicalContentProcessorWorker do
  let(:content) { create(:content) }
  
  describe '#perform' do
    it 'extracts metadata when operation is extract_metadata' do
      expect(content).to receive(:update!).with(
        hash_including(:word_count, :reading_time)
      )
      
      described_class.new.perform(content.id, :extract_metadata)
    end
    
    it 'validates content when operation is validate_content' do
      expect(content).to receive(:update!).with(
        hash_including(:validation_status)
      )
      
      described_class.new.perform(content.id, :validate_content)
    end
  end
end
```

## Error Handling and Monitoring

### 1. Comprehensive Error Handling

```ruby
# app/services/lexical_error_handler.rb
class LexicalErrorHandler
  def self.handle_processing_error(error, content_id, operation)
    Rails.logger.error "Lexical processing failed for content #{content_id}: #{error.message}"
    
    # Update content with error status
    content = Content.find(content_id)
    content.update!(
      processing_status: 'failed',
      last_error: error.message,
      last_error_at: Time.current
    )
    
    # Notify administrators
    AdminNotificationMailer.lexical_processing_failed(content, error, operation).deliver_now
    
    # Retry logic for transient errors
    if retryable_error?(error)
      schedule_retry(content_id, operation)
    end
  end
  
  private
  
  def self.retryable_error?(error)
    # Define which errors are worth retrying
    error.is_a?(Timeout::Error) || 
    error.message.include?('ECONNREFUSED') ||
    error.message.include?('ENOTFOUND')
  end
  
  def self.schedule_retry(content_id, operation)
    LexicalContentProcessorWorker.perform_in(5.minutes, content_id, operation)
  end
end
```

### 2. Performance Monitoring

```ruby
# app/workers/lexical_performance_monitor.rb
class LexicalPerformanceMonitor
  include Sidekiq::Worker
  
  def perform(content_id, operation_type, start_time)
    processing_time = Time.current - start_time
    
    # Log performance metrics
    Rails.logger.info "Lexical #{operation_type} completed for content #{content_id} in #{processing_time}s"
    
    # Store metrics for analysis
    ContentProcessingMetric.create!(
      content_id: content_id,
      operation_type: operation_type,
      processing_time: processing_time,
      completed_at: Time.current
    )
    
    # Alert on slow processing
    if processing_time > 30.seconds
      AdminNotificationMailer.slow_processing_alert(content_id, operation_type, processing_time).deliver_now
    end
  end
end
```

### 3. Content Validation and Sanitization

```ruby
# app/services/lexical_content_validator.rb
class LexicalContentValidator
  def initialize(lexical_data)
    @lexical_data = lexical_data
  end
  
  def validate
    errors = []
    
    errors.concat(validate_structure)
    errors.concat(validate_content_size)
    errors.concat(validate_links)
    errors.concat(validate_images)
    errors.concat(validate_formatting)
    
    errors
  end
  
  private
  
  def validate_structure
    errors = []
    
    unless @lexical_data.dig('root', 'children')
      errors << "Invalid document structure: missing root children"
    end
    
    # Check for maximum nesting depth
    if calculate_max_depth > 10
      errors << "Document nesting too deep (max 10 levels)"
    end
    
    errors
  end
  
  def validate_content_size
    errors = []
    word_count = count_words
    
    if word_count < 10
      errors << "Content too short (minimum 10 words)"
    elsif word_count > 10000
      errors << "Content too long (maximum 10,000 words)"
    end
    
    errors
  end
  
  def validate_links
    errors = []
    links = extract_links
    
    links.each do |link|
      unless valid_url?(link['url'])
        errors << "Invalid URL: #{link['url']}"
      end
      
      if suspicious_url?(link['url'])
        errors << "Suspicious URL detected: #{link['url']}"
      end
    end
    
    errors
  end
  
  def validate_images
    errors = []
    images = extract_images
    
    images.each do |image|
      unless valid_image_url?(image['src'])
        errors << "Invalid image URL: #{image['src']}"
      end
      
      if image['alt'].blank?
        errors << "Image missing alt text: #{image['src']}"
      end
    end
    
    errors
  end
  
  def validate_formatting
    errors = []
    
    # Check for excessive formatting
    if count_formatted_text > count_total_text * 0.8
      errors << "Too much formatted text (max 80% of content)"
    end
    
    errors
  end
  
  def calculate_max_depth(node = @lexical_data['root'], current_depth = 0)
    return current_depth unless node['children']
    
    max_child_depth = node['children'].map do |child|
      calculate_max_depth(child, current_depth + 1)
    end.max || current_depth
    
    max_child_depth
  end
  
  def count_words
    # Implementation to count words in lexical data
  end
  
  def extract_links
    # Implementation to extract all links from lexical data
  end
  
  def extract_images
    # Implementation to extract all images from lexical data
  end
  
  def valid_url?(url)
    uri = URI.parse(url)
    uri.is_a?(URI::HTTP) || uri.is_a?(URI::HTTPS)
  rescue URI::InvalidURIError
    false
  end
  
  def suspicious_url?(url)
    # Check for suspicious patterns
    suspicious_domains = %w[bit.ly tinyurl.com t.co]
    suspicious_domains.any? { |domain| url.include?(domain) }
  end
  
  def valid_image_url?(url)
    valid_url?(url) && url.match?(/\.(jpg|jpeg|png|gif|webp)$/i)
  end
  
  def count_formatted_text
    # Count text nodes with formatting
  end
  
  def count_total_text
    # Count all text nodes
  end
end
```

## Deployment Considerations

### 1. Environment Setup

```yaml
# docker-compose.yml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - redis
      - sidekiq
  
  sidekiq:
    build: .
    command: bundle exec sidekiq
    environment:
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - redis
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

### 2. Monitoring and Logging

```ruby
# config/initializers/sidekiq_monitoring.rb
if Rails.env.production?
  require 'sidekiq/web'
  
  Sidekiq::Web.use Rack::Auth::Basic do |username, password|
    ActiveSupport::SecurityUtils.secure_compare(username, ENV['SIDEKIQ_USERNAME']) &
    ActiveSupport::SecurityUtils.secure_compare(password, ENV['SIDEKIQ_PASSWORD'])
  end
end
```

## Conclusion

Integrating Lexical with Rails workers opens up powerful possibilities for server-side content processing. Whether you're building content management systems, documentation platforms, or collaborative editing tools, this approach gives you the flexibility to process rich text content efficiently and asynchronously.

Key takeaways:

- **Separation of Concerns**: Keep frontend editing and backend processing separate
- **Asynchronous Processing**: Use workers for heavy content operations
- **Caching**: Cache processed content to improve performance
- **Error Handling**: Implement robust error handling for Node.js integration
- **Testing**: Test both the Lexical service and worker functionality
- **Monitoring**: Monitor worker performance and content processing metrics

The combination of Lexical's powerful editor capabilities with Rails' robust backend processing creates a solid foundation for building sophisticated content management applications.

---

**Need help implementing this?** If you're working on a complex content management system and need guidance on integrating Lexical with your Rails backend, feel free to reach out. I've helped numerous teams implement similar architectures and would love to help you succeed with your project.
