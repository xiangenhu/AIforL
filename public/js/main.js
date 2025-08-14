/**
 * Main JavaScript file for the Lesson Plan Generator
 */
$(document).ready(function() {
  // Initialize Bootstrap tooltips
  $('[data-bs-toggle="tooltip"]').tooltip();
  
  // Form validation
  $('.needs-validation').each(function() {
    $(this).on('submit', function(event) {
      if (!this.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      
      $(this).addClass('was-validated');
    });
  });

  // Initialize AI-generated choices for select fields
  initializeAIChoices();
  
  // Handle checkbox groups that require at least one selection
  $('.checkbox-group.required').each(function() {
    const $checkboxes = $(this).find('input[type="checkbox"]');
    const $errorMessage = $(this).find('.invalid-feedback');
    
    $checkboxes.on('change', function() {
      const checked = $checkboxes.is(':checked');
      
      $checkboxes.each(function() {
        if (checked) {
          this.setCustomValidity('');
        } else {
          this.setCustomValidity('Please select at least one option');
        }
      });
    });
  });
  
  // Handle "Suggest Objectives" button in Step 2
  setupObjectiveSuggestions();
  
  // Handle "Suggest Activities" button in Step 3
  setupActivitySuggestions();
});

/**
 * Set up the objective suggestions functionality
 */
function setupObjectiveSuggestions() {
  const $suggestBtn = $('#suggestObjectivesBtn');
  
  if ($suggestBtn.length === 0) return;
  
  // This functionality is implemented in the questions.ejs template
  // to ensure access to EJS variables
}

/**
 * Set up the activity suggestions functionality
 */
function setupActivitySuggestions() {
  const $suggestBtn = $('#suggestActivitiesBtn');
  
  if ($suggestBtn.length === 0) return;
  
  $suggestBtn.on('click', async function() {
    const subject = $('input[name="subject"]').val();
    const gradeLevel = $('input[name="gradeLevel"]').val();
    const objectives = $('textarea[name="objectives"]').val();
    
    if (!subject || !gradeLevel || !objectives) {
      alert('Please complete the previous steps first to get activity suggestions.');
      return;
    }
    
    $suggestBtn.prop('disabled', true).text('Loading suggestions...');
    
    try {
      const response = await $.ajax({
        url: '/api/suggest-activities',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          subject,
          gradeLevel,
          objectives
        })
      });
      
      if (response.success && Array.isArray(response.suggestions)) {
        displayActivitySuggestions(response.suggestions);
      } else {
        throw new Error(response.error || 'Failed to get activity suggestions');
      }
    } catch (error) {
      console.error('Error suggesting activities:', error);
      alert('An error occurred while getting suggestions. Please try again or enter activities manually.');
    } finally {
      $suggestBtn.prop('disabled', false).text('Suggest Activities');
    }
  });
}

/**
 * Display activity suggestions in the UI
 * @param {Array} activities - The suggested activities
 */
function displayActivitySuggestions(activities) {
  const $suggestionsContainer = $('#activitySuggestions');
  const $suggestionsList = $('#suggestedActivitiesList');
  
  if ($suggestionsContainer.length === 0 || $suggestionsList.length === 0) return;
  
  $suggestionsList.empty();
  
  activities.forEach(activity => {
    const $card = $('<div>').addClass('card mb-3');
    const $cardBody = $('<div>').addClass('card-body');
    
    const $title = $('<h5>').addClass('card-title').text(activity.title);
    const $description = $('<p>').addClass('card-text').text(activity.description);
    
    const $details = $('<ul>').addClass('list-group list-group-flush mt-2');
    
    const $durationItem = $('<li>').addClass('list-group-item')
      .html(`<strong>Duration:</strong> ${activity.duration}`);
    
    const $materialsItem = $('<li>').addClass('list-group-item')
      .html(`<strong>Materials:</strong> ${activity.materials}`);
    
    const $alignmentItem = $('<li>').addClass('list-group-item')
      .html(`<strong>Alignment with Objectives:</strong> ${activity.alignment}`);
    
    $details.append($durationItem, $materialsItem, $alignmentItem);
    
    const $useButton = $('<button>').addClass('btn btn-sm btn-outline-primary mt-2')
      .text('Use This Activity')
      .on('click', function() {
        const $activitiesTextarea = $('#activities');
        if ($activitiesTextarea.length > 0) {
          let currentActivities = $activitiesTextarea.val().trim();
          const activityText = `${activity.title}: ${activity.description} (${activity.duration})`;
          
          if (currentActivities) {
            $activitiesTextarea.val(currentActivities + '\n\n' + activityText);
          } else {
            $activitiesTextarea.val(activityText);
          }
        }
      });
    
    $cardBody.append($title, $description, $details, $useButton);
    $card.append($cardBody);
    $suggestionsList.append($card);
  });
  
  $suggestionsContainer.removeClass('d-none');
}

/**
 * Initialize AI-generated choices for form fields
 */
function initializeAIChoices() {
  // Add AI choice generation buttons to select fields
  $('.ai-choices-select').each(function() {
    const $select = $(this);
    const fieldName = $select.attr('name');
    const fieldId = $select.attr('id');
    
    // Create refresh button
    const $refreshBtn = $('<button>')
      .addClass('btn btn-sm btn-outline-secondary ms-2 ai-refresh-btn')
      .attr('type', 'button')
      .attr('data-field', fieldName)
      .attr('data-field-type', 'select')
      .html('<i class="bi bi-arrow-clockwise"></i> AI Choices')
      .on('click', function() {
        generateAIChoices(fieldName, 'select', $select);
      });
    
    // Add button after the label
    $(`label[for="${fieldId}"]`).append($refreshBtn);
    
    // Add "Other" option handling
    $select.on('change', function() {
      const selectedValue = $(this).val();
      
      if (selectedValue === 'Other') {
        // Create custom input if it doesn't exist
        let $customInput = $(`#${fieldId}-custom`);
        
        if ($customInput.length === 0) {
          $customInput = $('<input>')
            .attr({
              type: 'text',
              id: `${fieldId}-custom`,
              name: `${fieldName}Custom`,
              class: 'form-control mt-2',
              placeholder: 'Enter custom value...'
            });
          
          $select.after($customInput);
        } else {
          $customInput.removeClass('d-none');
        }
      } else {
        // Hide custom input if it exists
        const $customInput = $(`#${fieldId}-custom`);
        if ($customInput.length > 0) {
          $customInput.addClass('d-none');
        }
      }
    });
  });
  
  // Add AI choice generation for checkbox groups
  $('.ai-choices-checkbox-group').each(function() {
    const $group = $(this);
    const fieldName = $group.data('field-name');
    
    // Create refresh button
    const $refreshBtn = $('<button>')
      .addClass('btn btn-sm btn-outline-secondary ms-2 ai-refresh-btn')
      .attr('type', 'button')
      .attr('data-field', fieldName)
      .attr('data-field-type', 'checkbox')
      .html('<i class="bi bi-arrow-clockwise"></i> AI Choices')
      .on('click', function() {
        generateAIChoices(fieldName, 'checkbox', $group);
      });
    
    // Add button after the label
    $group.find('label.form-label').first().append($refreshBtn);
    
    // Add "Other" option handling for the last checkbox
    const $lastCheckbox = $group.find('.form-check:last-child input[type="checkbox"]');
    const $lastLabel = $group.find('.form-check:last-child label');
    
    if ($lastLabel.text().trim() === 'Other') {
      $lastCheckbox.on('change', function() {
        const $customInput = $group.find('.custom-option-input');
        
        if ($(this).is(':checked')) {
          if ($customInput.length === 0) {
            const $input = $('<input>')
              .attr({
                type: 'text',
                class: 'form-control mt-2 custom-option-input',
                name: `${fieldName}Custom`,
                placeholder: 'Enter custom value...'
              });
            
            $group.find('.form-check:last-child').append($input);
          } else {
            $customInput.removeClass('d-none');
          }
        } else {
          $customInput.addClass('d-none');
        }
      });
    }
  });
}

/**
 * Generate AI choices for a form field
 * @param {string} fieldName - The name of the field
 * @param {string} fieldType - The type of field (select, checkbox)
 * @param {jQuery} $element - The jQuery element to update
 */
async function generateAIChoices(fieldName, fieldType, $element) {
  // Get context from the form
  const context = {
    subject: $('select[name="subject"]').val() || '',
    specificTopic: $('input[name="specificTopic"]').val() || '',
    gradeLevel: $('select[name="gradeLevel"]').val() || '',
    objectives: $('textarea[name="objectives"]').val() || ''
  };
  
  // Find and disable the refresh button
  const $refreshBtn = $(`.ai-refresh-btn[data-field="${fieldName}"]`);
  $refreshBtn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...');
  
  try {
    // Call the API to get AI-generated choices
    const response = await $.ajax({
      url: '/api/generate-choices',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        fieldName,
        fieldType,
        context
      })
    });
    
    if (response.success && Array.isArray(response.choices)) {
      // Update the form field with the new choices
      if (fieldType === 'select') {
        updateSelectOptions($element, response.choices);
      } else if (fieldType === 'checkbox') {
        updateCheckboxOptions($element, response.choices, fieldName);
      }
    } else {
      throw new Error(response.error || 'Failed to generate choices');
    }
  } catch (error) {
    console.error('Error generating choices:', error);
    alert('An error occurred while generating choices. Please try again.');
  } finally {
    // Re-enable the refresh button
    $refreshBtn.prop('disabled', false).html('<i class="bi bi-arrow-clockwise"></i> AI Choices');
  }
}

/**
 * Update select options with AI-generated choices
 * @param {jQuery} $select - The select element to update
 * @param {Array} choices - The new choices
 */
function updateSelectOptions($select, choices) {
  // Save the current value
  const currentValue = $select.val();
  
  // Clear existing options except the first one (placeholder)
  $select.find('option:not(:first-child)').remove();
  
  // Add new options
  choices.forEach(choice => {
    const $option = $('<option>')
      .attr('value', choice)
      .text(choice);
    
    $select.append($option);
  });
  
  // Restore the selected value if it still exists
  if (choices.includes(currentValue)) {
    $select.val(currentValue);
  } else {
    $select.val('');
  }
}

/**
 * Update checkbox options with AI-generated choices
 * @param {jQuery} $group - The checkbox group container
 * @param {Array} choices - The new choices
 * @param {string} fieldName - The field name
 */
function updateCheckboxOptions($group, choices, fieldName) {
  // Get currently checked values
  const checkedValues = [];
  $group.find('input[type="checkbox"]:checked').each(function() {
    checkedValues.push($(this).val());
  });
  
  // Clear existing checkboxes
  $group.find('.form-check').remove();
  
  // Add new checkboxes
  choices.forEach(choice => {
    const randomId = `${fieldName}-${Math.random().toString(36).substr(2, 9)}`;
    
    const $div = $('<div>').addClass('form-check');
    const $input = $('<input>')
      .addClass('form-check-input')
      .attr({
        type: 'checkbox',
        id: randomId,
        name: fieldName,
        value: choice
      });
    
    // Check if this value was previously checked
    if (checkedValues.includes(choice)) {
      $input.prop('checked', true);
    }
    
    const $label = $('<label>')
      .addClass('form-check-label')
      .attr('for', randomId)
      .text(choice);
    
    $div.append($input, $label);
    $group.append($div);
    
    // Add custom input handler for "Other" option
    if (choice === 'Other') {
      $input.on('change', function() {
        const $customInput = $group.find('.custom-option-input');
        
        if ($(this).is(':checked')) {
          if ($customInput.length === 0) {
            const $input = $('<input>')
              .attr({
                type: 'text',
                class: 'form-control mt-2 custom-option-input',
                name: `${fieldName}Custom`,
                placeholder: 'Enter custom value...'
              });
            
            $div.append($input);
          } else {
            $customInput.removeClass('d-none');
          }
        } else {
          $customInput.addClass('d-none');
        }
      });
      
      // Trigger change event if "Other" was checked
      if (checkedValues.includes('Other')) {
        $input.trigger('change');
      }
    }
  });
}

/**
 * Format a lesson plan for display
 * @param {Object} lessonPlan - The lesson plan object
 * @returns {string} HTML representation of the lesson plan
 */
function formatLessonPlan(lessonPlan) {
  // This functionality is implemented in the result.ejs template
}
