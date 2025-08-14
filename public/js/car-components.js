/**
 * CAR Framework jQuery Components
 * Modular components for AI-assisted language learning
 */

(function($) {
  'use strict';

  // Project Stage Wizard Component
  $.fn.carProjectWizard = function(options) {
    const settings = $.extend({
      stages: ['define', 'collect', 'create', 'present'],
      onStageChange: null,
      projectId: null
    }, options);

    return this.each(function() {
      const $wizard = $(this);
      let currentStage = 0;

      // Initialize stage UI
      function initStages() {
        $wizard.find('.stage-item').on('click', function() {
          const stage = $(this).data('stage');
          const index = settings.stages.indexOf(stage);
          if (index >= 0 && index <= currentStage) {
            navigateToStage(index);
          }
        });
      }

      // Navigate to specific stage
      function navigateToStage(index) {
        currentStage = index;
        const stage = settings.stages[index];
        
        // Update UI
        $('.stage-item').removeClass('active completed');
        $('.stage-panel').removeClass('active');
        
        // Mark completed stages
        for (let i = 0; i < index; i++) {
          $(`.stage-item[data-stage="${settings.stages[i]}"]`).addClass('completed');
        }
        
        // Mark current stage
        $(`.stage-item[data-stage="${stage}"]`).addClass('active');
        $(`#${stage}Stage`).addClass('active');
        
        // Update navigation buttons
        $('#prevStageBtn').prop('disabled', index === 0);
        $('#nextStageBtn').prop('disabled', index === settings.stages.length - 1);
        
        // Trigger callback
        if (settings.onStageChange) {
          settings.onStageChange(stage, index);
        }
        
        // Track stage progression in xAPI
        if (settings.projectId) {
          trackStageProgression(stage);
        }
      }

      // Track stage progression
      function trackStageProgression(stage) {
        $.ajax({
          url: `/api/projects/${settings.projectId}/stage`,
          method: 'PUT',
          data: { stage: stage },
          success: function(response) {
            console.log('Stage progression tracked:', stage);
          }
        });
      }

      // Navigation handlers
      $('#nextStageBtn').on('click', function() {
        if (currentStage < settings.stages.length - 1) {
          navigateToStage(currentStage + 1);
        }
      });

      $('#prevStageBtn').on('click', function() {
        if (currentStage > 0) {
          navigateToStage(currentStage - 1);
        }
      });

      initStages();
    });
  };

  // AI Tool Selector Component
  $.fn.aiToolSelector = function(options) {
    const settings = $.extend({
      tools: ['elsaSpeak', 'talkPalAI', 'doubao'],
      onToolSelect: null,
      projectId: null
    }, options);

    return this.each(function() {
      const $selector = $(this);
      
      // Render tool buttons
      settings.tools.forEach(tool => {
        const $btn = $(`<button class="ai-tool-btn" data-tool="${tool}">
          <i class="bi bi-robot"></i> ${formatToolName(tool)}
        </button>`);
        
        $btn.on('click', function() {
          selectTool(tool);
        });
        
        $selector.append($btn);
      });

      function selectTool(tool) {
        $('.ai-tool-btn').removeClass('active');
        $(`.ai-tool-btn[data-tool="${tool}"]`).addClass('active');
        
        if (settings.onToolSelect) {
          settings.onToolSelect(tool);
        }
        
        // Track AI tool usage
        if (settings.projectId) {
          trackAIToolUsage(tool);
        }
      }

      function trackAIToolUsage(tool) {
        $.ajax({
          url: `/api/projects/${settings.projectId}/ai-tool`,
          method: 'POST',
          data: { tool: tool, purpose: 'language_learning' },
          success: function(response) {
            console.log('AI tool usage tracked:', tool);
          }
        });
      }

      function formatToolName(tool) {
        const names = {
          'elsaSpeak': 'ELSA Speak',
          'talkPalAI': 'TalkPal AI',
          'doubao': 'Doubao'
        };
        return names[tool] || tool;
      }
    });
  };

  // Prompt Engineering Component
  $.fn.promptEngineer = function(options) {
    const settings = $.extend({
      templates: [],
      onPromptSubmit: null
    }, options);

    return this.each(function() {
      const $container = $(this);
      
      // Create prompt interface
      const html = `
        <div class="prompt-engineer-container">
          <div class="prompt-input-area">
            <h6>Your Prompt</h6>
            <textarea class="form-control prompt-textarea" rows="5" 
                      placeholder="Enter your prompt here..."></textarea>
            <div class="prompt-controls mt-3">
              <button class="btn btn-primary test-prompt-btn">Test Prompt</button>
              <button class="btn btn-secondary refine-prompt-btn">Refine with AI</button>
            </div>
            <div class="prompt-result mt-3" style="display:none;">
              <h6>AI Response</h6>
              <div class="response-content"></div>
            </div>
          </div>
          <div class="prompt-tips">
            <h6>Prompt Templates</h6>
            <div class="template-list"></div>
          </div>
        </div>
      `;
      
      $container.html(html);
      
      // Load templates
      const defaultTemplates = [
        { name: 'Brainstorm', prompt: 'Help me brainstorm ideas for...' },
        { name: 'Outline', prompt: 'Create an outline for...' },
        { name: 'Improve', prompt: 'Improve the following text...' }
      ];
      
      (settings.templates.length ? settings.templates : defaultTemplates).forEach(template => {
        const $template = $(`<div class="prompt-template" data-prompt="${template.prompt}">
          <strong>${template.name}</strong>
          <p class="small mb-0">${template.prompt}</p>
        </div>`);
        
        $template.on('click', function() {
          $('.prompt-textarea').val($(this).data('prompt'));
        });
        
        $('.template-list').append($template);
      });
      
      // Event handlers
      $('.test-prompt-btn').on('click', testPrompt);
      $('.refine-prompt-btn').on('click', refinePrompt);
      
      function testPrompt() {
        const prompt = $('.prompt-textarea').val();
        if (settings.onPromptSubmit) {
          settings.onPromptSubmit(prompt, function(response) {
            $('.response-content').html(response);
            $('.prompt-result').show();
          });
        }
      }
      
      function refinePrompt() {
        // Implement Chain-of-Thought refinement
        const original = $('.prompt-textarea').val();
        const refined = `Let's think step by step:\n${original}\n\nFirst, I'll...`;
        $('.prompt-textarea').val(refined);
      }
    });
  };

  // ILO Progress Tracker
  $.fn.iloProgress = function(options) {
    const settings = $.extend({
      ilos: [
        { id: 'use-explain-evaluate', name: 'Use & Evaluate AI', progress: 0 },
        { id: 'apply-ethical-guidelines', name: 'Ethical Use', progress: 0 },
        { id: 'design-refine-prompts', name: 'Prompt Engineering', progress: 0 },
        { id: 'critically-assess-output', name: 'Critical Assessment', progress: 0 },
        { id: 'integrate-personalized-learning', name: 'Personalized Learning', progress: 0 }
      ]
    }, options);

    return this.each(function() {
      const $container = $(this);
      
      settings.ilos.forEach(ilo => {
        const $progress = $(`
          <div class="ilo-item mb-2">
            <label class="small">${ilo.name}</label>
            <div class="progress">
              <div class="progress-bar" role="progressbar" 
                   style="width: ${ilo.progress}%"
                   aria-valuenow="${ilo.progress}" 
                   aria-valuemin="0" aria-valuemax="100">
                ${ilo.progress}%
              </div>
            </div>
          </div>
        `);
        
        $container.append($progress);
      });
    });
  };

  // Initialize components on document ready
  $(document).ready(function() {
    // Initialize project wizard
    $('#projectWizard').carProjectWizard({
      onStageChange: function(stage, index) {
        console.log('Stage changed to:', stage);
      }
    });
    
    // Initialize ILO progress
    $('#iloProgressWidget').iloProgress();
    
    // Open prompt engineer modal
    window.openPromptEngineer = function(type) {
      $('#promptEngineerWidget').promptEngineer({
        onPromptSubmit: function(prompt, callback) {
          // Simulate AI response
          setTimeout(() => {
            callback('AI response would appear here...');
          }, 1000);
        }
      });
      $('#promptEngineerModal').modal('show');
    };
  });

})(jQuery);