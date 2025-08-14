/**
 * Questions page JavaScript
 * This file handles the client-side rendering and functionality for the questions page
 */

$(document).ready(function() {
  // Parse URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const currentStep = parseInt(urlParams.get('step')) || 1;
  
  // Store all parameters as previousAnswers
  const previousAnswers = {};
  urlParams.forEach((value, key) => {
    if (key !== 'step') {
      previousAnswers[key] = value;
    }
  });
  
  // Initialize the page
  initializePage(currentStep, previousAnswers);
  
  // Set up form submission
  setupFormSubmission();
  
  // Set up custom duration toggle
  setupCustomDuration();
  
  // Set up debug mode toggle
  setupDebugMode();
  
  // Set up AI suggestion buttons
  setupAISuggestions(previousAnswers);
});

/**
 * Initialize the page with the correct step and form values
 * @param {number} currentStep - The current step number
 * @param {object} previousAnswers - The previous answers from URL parameters
 */
function initializePage(currentStep, previousAnswers) {
  // Update progress bar
  updateProgressBar(currentStep);
  
  // Show the correct step
  showStep(currentStep);
  
  // Populate form fields with previous answers
  populateFormFields(previousAnswers);
  
  // If we're on step 2 and have the required parameters, automatically trigger AI suggestions
  if (currentStep === 2 && previousAnswers.subject && previousAnswers.gradeLevel) {
    // Add a small delay to ensure the page is fully loaded
    setTimeout(() => {
      // Check if we should auto-trigger AI suggestions
      if (previousAnswers.subject && previousAnswers.specificTopic && previousAnswers.gradeLevel) {
        console.log('Auto-triggering AI suggestions with:', {
          subject: previousAnswers.subject,
          specificTopic: previousAnswers.specificTopic,
          gradeLevel: previousAnswers.gradeLevel
        });
        $('#suggestObjectivesBtn').click();
      }
    }, 500);
  }
}

/**
 * Update the progress bar based on the current step
 * @param {number} currentStep - The current step number
 */
function updateProgressBar(currentStep) {
  const progressPercentage = (currentStep / 5) * 100;
  $('.progress-bar').css('width', progressPercentage + '%')
    .attr('aria-valuenow', currentStep)
    .text('Step ' + currentStep + ' of 5');
}

/**
 * Show the correct step and hide others
 * @param {number} currentStep - The current step number
 */
function showStep(currentStep) {
  // Hide all steps
  $('.question-step').addClass('d-none');
  
  // Show the current step
  $('#step' + currentStep).removeClass('d-none');
  
  // Update the form's hidden currentStep field
  $('input[name="currentStep"]').val(currentStep);
  
  // Update the next/previous buttons
  updateNavigationButtons(currentStep);
}

/**
 * Update the navigation buttons based on the current step
 * @param {number} currentStep - The current step number
 */
function updateNavigationButtons(currentStep) {
  const $prevButton = $('#prevButton');
  const $nextButton = $('#nextButton');
  
  // Update previous button
  if (currentStep > 1) {
    $prevButton.removeClass('d-none');
  } else {
    $prevButton.addClass('d-none');
  }
  
  // Update next button text
  if (currentStep < 5) {
    $nextButton.text('Next');
  } else {
    $nextButton.text('Generate Lesson Plan');
  }
}

/**
 * Populate form fields with previous answers
 * @param {object} previousAnswers - The previous answers from URL parameters
 */
function populateFormFields(previousAnswers) {
  // Loop through all previous answers and set form field values
  for (const [key, value] of Object.entries(previousAnswers)) {
    const $field = $(`[name="${key}"]`);
    
    if ($field.length > 0) {
      // Handle different field types
      if ($field.is('select')) {
        $field.val(value);
        // Trigger change event for selects (e.g., for custom duration)
        $field.trigger('change');
      } else if ($field.is('input[type="checkbox"]')) {
        // For checkboxes, we need to handle multiple values
        const values = value.split(',');
        values.forEach(val => {
          $(`input[name="${key}"][value="${val}"]`).prop('checked', true);
        });
      } else if ($field.is('textarea')) {
        $field.val(decodeURIComponent(value));
      } else {
        $field.val(value);
      }
    }
  }
}

/**
 * Set up form submission
 */
function setupFormSubmission() {
  $('#questionForm').on('submit', function(e) {
    e.preventDefault();
    
    const currentStep = parseInt($('input[name="currentStep"]').val());
    const nextStep = currentStep + 1;
    
    // Collect all form data
    const formData = new FormData(this);
    const formObject = {};
    
    formData.forEach((value, key) => {
      // Handle checkbox groups (multiple values with same name)
      if (formObject[key]) {
        if (!Array.isArray(formObject[key])) {
          formObject[key] = [formObject[key]];
        }
        formObject[key].push(value);
      } else {
        formObject[key] = value;
      }
    });
    
    // Convert arrays to comma-separated strings
    for (const key in formObject) {
      if (Array.isArray(formObject[key])) {
        formObject[key] = formObject[key].join(',');
      }
    }
    
    // Build the URL for the next step or result page
    let url;
    if (nextStep > 5) {
      // If we've reached the end, go to the result page
      url = '/result?' + new URLSearchParams(formObject).toString();
    } else {
      // Otherwise, go to the next step
      formObject.step = nextStep;
      url = '/questions?' + new URLSearchParams(formObject).toString();
    }
    
    window.location.href = url;
  });
  
  // Set up previous button
  $('#prevButton').on('click', function(e) {
    e.preventDefault();
    
    const currentStep = parseInt($('input[name="currentStep"]').val());
    const prevStep = currentStep - 1;
    
    if (prevStep < 1) return;
    
    // Collect all form data
    const formData = new FormData($('#questionForm')[0]);
    const formObject = {};
    
    formData.forEach((value, key) => {
      formObject[key] = value;
    });
    
    // Build the URL for the previous step
    formObject.step = prevStep;
    const url = '/questions?' + new URLSearchParams(formObject).toString();
    
    window.location.href = url;
  });
}

/**
 * Set up custom duration toggle
 */
function setupCustomDuration() {
  const $durationSelect = $('#duration');
  const $customDurationContainer = $('#customDurationContainer');
  
  $durationSelect.on('change', function() {
    if ($(this).val() === 'custom') {
      $customDurationContainer.removeClass('d-none');
    } else {
      $customDurationContainer.addClass('d-none');
    }
  });
}

/**
 * Set up debug mode toggle
 */
function setupDebugMode() {
  const $debugModeSwitch = $('#debugModeSwitch');
  let debugMode = localStorage.getItem('debugMode') === 'true';
  
  // Initialize debug mode from localStorage
  $debugModeSwitch.prop('checked', debugMode);
  
  // Handle debug mode toggle
  $debugModeSwitch.on('change', async function() {
    debugMode = $(this).is(':checked');
    localStorage.setItem('debugMode', debugMode);
    
    // If debug panel exists, toggle its visibility
    if ($('#debugPanel').length) {
      if (debugMode) {
        $('#debugPanel').removeClass('d-none');
      } else {
        $('#debugPanel').addClass('d-none');
      }
    }
    
    // Update server-side debug mode
    try {
      await $.ajax({
        url: '/api/debug/toggle',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          enabled: debugMode,
          verbose: debugMode,
          logLLMRequests: debugMode,
          logLLMResponses: debugMode
        })
      });
      
      console.log(`Debug mode ${debugMode ? 'enabled' : 'disabled'} on server`);
    } catch (error) {
      console.error('Error toggling debug mode on server:', error);
    }
  });
  
  // Check server debug status on page load
  (async function() {
    try {
      const response = await $.ajax({
        url: '/api/debug/status',
        type: 'GET'
      });
      
      if (response.success && response.debug) {
        // If server has debug enabled but client doesn't, sync them
        if (response.debug.enabled && !debugMode) {
          debugMode = true;
          $debugModeSwitch.prop('checked', true);
          localStorage.setItem('debugMode', 'true');
        }
      }
    } catch (error) {
      console.error('Error checking server debug status:', error);
    }
  })();
}

/**
 * Set up AI suggestion buttons
 * @param {object} previousAnswers - The previous answers from URL parameters
 */
function setupAISuggestions(previousAnswers) {
  // Function to add debug panel
  function addDebugPanel(data) {
    console.log('Adding debug panel with data:', data);
    
    // Remove existing debug panel if it exists
    $('#debugPanel').remove();
    
    const debugMode = localStorage.getItem('debugMode') === 'true';
    
    if (!debugMode) {
      console.log('Debug mode is disabled, not adding debug panel');
      return;
    }
    
    if (!data) {
      console.log('No data provided for debug panel');
      return;
    }
    
    // Create debug panel
    const $debugPanel = $('<div>')
      .attr('id', 'debugPanel')
      .addClass('card mt-3 border-danger'); // Changed to danger for more visibility
    
    const $debugHeader = $('<div>')
      .addClass('card-header bg-danger text-white d-flex justify-content-between align-items-center')
      .html('<strong>DEBUG INFORMATION</strong>');
    
    const $collapseButton = $('<button>')
      .addClass('btn btn-sm btn-light')
      .text('Toggle')
      .on('click', function() {
        $('#debugPanelBody').toggleClass('d-none');
      });
    
    $debugHeader.append($collapseButton);
    
    const $debugBody = $('<div>')
      .attr('id', 'debugPanelBody')
      .addClass('card-body');
    
    // Format debug data
    let debugContent = '<h5 class="text-danger">Debug Information</h5>';
    
    // Add debug status
    debugContent += '<h6>Debug Status:</h6>';
    debugContent += `<pre>${JSON.stringify({
      clientDebugMode: debugMode,
      serverDebugEnabled: data._debug?.debugEnabled || false,
      serverVerboseEnabled: data._debug?.verboseEnabled || false,
      timestamp: new Date().toISOString()
    }, null, 2)}</pre>`;
    
    if (data._debug) {
      debugContent += '<h6>API Debug Info:</h6>';
      debugContent += `<pre>${JSON.stringify(data._debug, null, 2)}</pre>`;
    }
    
    if (data.suggestions && data.suggestions._debug) {
      debugContent += '<h6>Content Debug Info:</h6>';
      debugContent += `<pre>${JSON.stringify(data.suggestions._debug, null, 2)}</pre>`;
    }
    
    // Add raw response if available
    if (data.suggestions && data.suggestions.rawResponse) {
      debugContent += '<h6>Raw Response:</h6>';
      debugContent += `<pre>${data.suggestions.rawResponse}</pre>`;
    } else {
      debugContent += '<h6>No Raw Response Available</h6>';
      debugContent += '<p>Enable verbose mode to see raw responses</p>';
    }
    
    // Add general response info
    debugContent += '<h6>Response Structure:</h6>';
    debugContent += `<pre>${JSON.stringify({
      success: data.success,
      objectivesCount: data.suggestions?.objectives?.length || 0,
      priorKnowledgeCount: data.suggestions?.priorKnowledge?.length || 0,
      standardsCount: data.suggestions?.standards?.length || 0
    }, null, 2)}</pre>`;
    
    $debugBody.html(debugContent);
    $debugPanel.append($debugHeader, $debugBody);
    
    // Add to page - add it directly to the body for maximum visibility
    $('body').append($debugPanel);
    
    console.log('Debug panel added to page');
  }
  
  // Common function to create suggestion items
  function createSuggestionItem(item, targetTextareaId) {
    const randomId = 'suggestion-' + Math.random().toString(36).substr(2, 9);
    
    // Check if item is an object with text and type properties
    const itemText = typeof item === 'object' ? item.text : item;
    const itemType = typeof item === 'object' && item.type ? item.type : null;
    
    const $div = $('<div>').addClass('form-check mb-2');
    const $input = $('<input>')
      .addClass('form-check-input')
      .attr({
        type: 'checkbox',
        id: randomId,
        value: itemText
      });
    
    const $labelContainer = $('<div>').addClass('d-flex flex-column');
    
    const $label = $('<label>')
      .addClass('form-check-label')
      .attr('for', randomId)
      .text(itemText);
    
    $labelContainer.append($label);
    
    // Add type badge if available
    if (itemType) {
      const $typeBadge = $('<small>')
        .addClass('text-muted ms-4 mt-1')
        .html(`<span class="badge bg-light text-dark">Type: ${itemType}</span>`);
      $labelContainer.append($typeBadge);
    }
    
    $div.append($input, $labelContainer);
    
    $input.on('change', function() {
      const $textarea = $(`#${targetTextareaId}`);
      let currentText = $textarea.val().trim();
      
      if ($(this).is(':checked')) {
        if (currentText) {
          $textarea.val(currentText + '\n- ' + $(this).val());
        } else {
          $textarea.val('- ' + $(this).val());
        }
      } else {
        $textarea.val(
          currentText
            .split('\n')
            .filter(line => !line.includes($(this).val()))
            .join('\n')
        );
      }
    });
    
    return $div;
  }
  
  // Function to check if required fields are filled
  function checkRequiredFields() {
    const subject = previousAnswers.subject || '';
    const specificTopic = previousAnswers.specificTopic || '';
    const gradeLevel = previousAnswers.gradeLevel || '';
    
    if (!subject || !gradeLevel) {
      return {
        valid: false,
        message: 'Please complete Step 1 first to get AI suggestions.'
      };
    }
    
    return {
      valid: true,
      data: {
        subject,
        specificTopic,
        gradeLevel
      }
    };
  }
  
  // Function to make API request for suggestions
  async function fetchSuggestions(type) {
    const check = checkRequiredFields();
    
    if (!check.valid) {
      alert(check.message);
      return null;
    }
    
    const debugMode = localStorage.getItem('debugMode') === 'true';
    
    const requestData = {
      ...check.data,
      type: type // Add type to specify which suggestions to fetch
    };
    
    if (debugMode) {
      requestData.debug = true;
      requestData.verbose = true;
    }
    
    try {
      const response = await $.ajax({
        url: '/api/suggest-lesson-content',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(requestData)
      });
      
      // Add debug panel if debug mode is enabled
      if (debugMode) {
        addDebugPanel(response);
      }
      
      return response;
    } catch (error) {
      console.error(`Error fetching ${type} suggestions:`, error);
      return null;
    }
  }
  
  // Learning Objectives suggestions
  const $suggestObjectivesBtn = $('#suggestObjectivesBtn');
  const $objectivesSuggestions = $('#objectivesSuggestions');
  const $suggestedObjectivesList = $('#suggestedObjectivesList');
  
  if ($suggestObjectivesBtn.length > 0) {
    $suggestObjectivesBtn.on('click', async function() {
      $suggestObjectivesBtn.prop('disabled', true).text('Generating...');
      
      try {
        // Show loading indicator
        $objectivesSuggestions.removeClass('d-none');
        const loadingHtml = '<div class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div><p class="mt-2">Generating suggestions...</p></div>';
        $suggestedObjectivesList.html(loadingHtml);
        
        const response = await fetchSuggestions('objectives');
        
        if (response && response.success && response.suggestions) {
          if (Array.isArray(response.suggestions.objectives) && response.suggestions.objectives.length > 0) {
            $suggestedObjectivesList.empty();
            
            response.suggestions.objectives.forEach(objective => {
              const $item = createSuggestionItem(objective, 'objectives');
              $suggestedObjectivesList.append($item);
            });
          } else {
            $suggestedObjectivesList.html('<div class="alert alert-warning">No learning objectives could be generated.</div>');
          }
        } else {
          $suggestedObjectivesList.html('<div class="alert alert-warning">No suggestions could be generated. Please try again or enter content manually.</div>');
        }
      } catch (error) {
        console.error('Error suggesting objectives:', error);
        $suggestedObjectivesList.html('<div class="alert alert-danger">An error occurred while getting suggestions. Please try again or enter content manually.</div>');
      } finally {
        $suggestObjectivesBtn.prop('disabled', false).text('AI Suggestions');
      }
    });
  }
  
  // Prior Knowledge suggestions
  const $suggestPriorKnowledgeBtn = $('#suggestPriorKnowledgeBtn');
  const $priorKnowledgeSuggestions = $('#priorKnowledgeSuggestions');
  const $suggestedPriorKnowledgeList = $('#suggestedPriorKnowledgeList');
  
  if ($suggestPriorKnowledgeBtn.length > 0) {
    $suggestPriorKnowledgeBtn.on('click', async function() {
      // Check if objectives are filled
      const objectives = $('#objectives').val().trim();
      if (!objectives) {
        alert('Please fill in learning objectives first to get relevant prior knowledge suggestions.');
        return;
      }
      
      $suggestPriorKnowledgeBtn.prop('disabled', true).text('Generating...');
      
      try {
        // Show loading indicator
        $priorKnowledgeSuggestions.removeClass('d-none');
        const loadingHtml = '<div class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div><p class="mt-2">Generating suggestions...</p></div>';
        $suggestedPriorKnowledgeList.html(loadingHtml);
        
        const response = await fetchSuggestions('priorKnowledge');
        
        if (response && response.success && response.suggestions) {
          if (Array.isArray(response.suggestions.priorKnowledge) && response.suggestions.priorKnowledge.length > 0) {
            $suggestedPriorKnowledgeList.empty();
            
            response.suggestions.priorKnowledge.forEach(item => {
              const $item = createSuggestionItem(item, 'priorKnowledge');
              $suggestedPriorKnowledgeList.append($item);
            });
          } else {
            $suggestedPriorKnowledgeList.html('<div class="alert alert-warning">No prior knowledge items could be generated.</div>');
          }
        } else {
          $suggestedPriorKnowledgeList.html('<div class="alert alert-warning">No suggestions could be generated. Please try again or enter content manually.</div>');
        }
      } catch (error) {
        console.error('Error suggesting prior knowledge:', error);
        $suggestedPriorKnowledgeList.html('<div class="alert alert-danger">An error occurred while getting suggestions. Please try again or enter content manually.</div>');
      } finally {
        $suggestPriorKnowledgeBtn.prop('disabled', false).text('AI Suggestions');
      }
    });
  }
  
  // Educational Standards suggestions
  const $suggestStandardsBtn = $('#suggestStandardsBtn');
  const $standardsSuggestions = $('#standardsSuggestions');
  const $suggestedStandardsList = $('#suggestedStandardsList');
  
  if ($suggestStandardsBtn.length > 0) {
    $suggestStandardsBtn.on('click', async function() {
      // Check if prior knowledge is filled
      const priorKnowledge = $('#priorKnowledge').val().trim();
      if (!priorKnowledge) {
        alert('Please fill in prior knowledge first to get relevant educational standards suggestions.');
        return;
      }
      
      $suggestStandardsBtn.prop('disabled', true).text('Generating...');
      
      try {
        // Show loading indicator
        $standardsSuggestions.removeClass('d-none');
        const loadingHtml = '<div class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div><p class="mt-2">Generating suggestions...</p></div>';
        $suggestedStandardsList.html(loadingHtml);
        
        const response = await fetchSuggestions('standards');
        
        if (response && response.success && response.suggestions) {
          if (Array.isArray(response.suggestions.standards) && response.suggestions.standards.length > 0) {
            $suggestedStandardsList.empty();
            
            response.suggestions.standards.forEach(standard => {
              const $item = createSuggestionItem(standard, 'standards');
              $suggestedStandardsList.append($item);
            });
          } else {
            $suggestedStandardsList.html('<div class="alert alert-warning">No educational standards could be generated.</div>');
          }
        } else {
          $suggestedStandardsList.html('<div class="alert alert-warning">No suggestions could be generated. Please try again or enter content manually.</div>');
        }
      } catch (error) {
        console.error('Error suggesting standards:', error);
        $suggestedStandardsList.html('<div class="alert alert-danger">An error occurred while getting suggestions. Please try again or enter content manually.</div>');
      } finally {
        $suggestStandardsBtn.prop('disabled', false).text('AI Suggestions');
      }
    });
  }
}
