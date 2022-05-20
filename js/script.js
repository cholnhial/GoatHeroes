// Global Variables
let currentTestimonialIndex =0;
let testimonialData = [];
let data = null; // holds all the initial data for the application
const NON_EMPTY_PATTERN = /([^\s])/; // returns true if none empty
const NUMERIC_PATTERN = /^\d+$/;
const EMAIL_PATTERN = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

/*
  These are validation rules and messages for booking form
 */
let bookingFormValidationConfig = [
    {
        input: 'goats',
        rules: [
            {
                pattern: NON_EMPTY_PATTERN,
                message: "Please specify the number of goats you want between 1-100"
            }
        ]
    },
    {
        input: 'datetime',
        rules: [
            {
                pattern: NON_EMPTY_PATTERN,
                message: "Please specify a date and time"
            }
        ]
    },
    {
        input: 'address',
        rules: [
            {
                pattern: NON_EMPTY_PATTERN,
                message: "Please specify your home address",
            }
        ]
    },
    {
        input: 'postcode',
        rules: [
            {
                pattern: NON_EMPTY_PATTERN,
                message: "Please specify your postcode",
            },
            {
                pattern: NUMERIC_PATTERN,
                message: 'Please make sure your postcode is numeric'
            }
        ]
    },
    {
        input: 'firstName',
        rules: [
            {
                pattern: NON_EMPTY_PATTERN,
                message: "Your first name cannot be empty",
            }
        ]
    },
    {
        input: 'lastName',
        rules: [
            {
                pattern: NON_EMPTY_PATTERN,
                message: "Your last name cannot be empty",
            }
        ]
    },
    {
        input: 'email',
        rules: [
            {
                pattern: NON_EMPTY_PATTERN,
                message: "Your email can't be empty",
            },
            {
                pattern: EMAIL_PATTERN,
                message: "The email you've entered is not in a valid format",
            }
        ]
    },
    {
        input: 'phone',
        rules: [
            {
                pattern: NON_EMPTY_PATTERN,
                message: "Your phone can't be empty",
            },
            {
                pattern: NUMERIC_PATTERN,
                message: "Your phone number must only contain numbers",
            }
        ]
    }
];

/**
 * Processes the validation rules for an input element and
 * displays warnings/errors accordingly/
 * @param inputId the id of the input element
 * @param value the value being validated
 * @param validationsConfig the global form validation config
 */
function runValidationForInput(inputId,value, validationsConfig) {
    let inputValidationConfig = validationsConfig.find(vc => vc.input === inputId);

    // process rules and display warnings
   for(let i = 0; i < inputValidationConfig.rules.length; i++) {
       if(!value.match(inputValidationConfig.rules[i].pattern)) {
           $(`#${inputId}-error`).html(inputValidationConfig.rules[i].message);
           $(`#${inputId}-error`).removeClass('d-none');
           $(`#${inputId}`).removeClass('is-valid');
           $(`#${inputId}`).addClass('is-invalid');
           break; // always display immediate error first, don't overwrite
       } else {
           $(`#${inputId}`).removeClass('is-invalid');
           $(`#${inputId}-error`).addClass('d-none');
           $(`#${inputId}`).addClass('is-valid');
       }
   }
}

/**
 * Connects to an inputs keyup event and fires the validation
 * method to display warnings
 * @param validationsConfig
 */
function configureInputValidation(validationsConfig) {
    validationsConfig.forEach(vc => {
        $(`#${vc.input}`).on('keyup', (e) => {
            runValidationForInput(vc.input, e.target.value, bookingFormValidationConfig);
        })
    });
}




/**
 *  Triggers animation
 * @param element the element to animate
 * @param animateClasses the animation classes
 */
function restartAnimation(element, animateClasses) {
    $(element).removeClass(animateClasses);
// trigger a DOM reflow
    $(element).width();
    $(element).addClass(animateClasses);
}


/**
 * Shows a testimonial in the position specified
 * @param index the index position in the data
 */
function showTestimonialAt(index) {
    const testimonial = testimonialData[index];
    $('#tavatar').attr("src", testimonial.avatar);
    $('#ttext').html(testimonial.testimony);
    $('#tname').html(testimonial.name);
}

/**
 * Shows the initial testimony which is the first one
 * in the list
 */
function showInitialTestimony() {
    showTestimonialAt(0);
}

/**
 * Used to get the data object containing testimonials
 * etc.
 *
 * @returns {Promise<Response>} the data retrieved
 */
async function getData() {
    return fetch('files/data/data.json')
        .then(async function(resp) {
            return await resp.json();
        });
}

/**
 *  Connect event handlers for testimonials on controls
 *  on home page.
 */
function handleTestimonialControls () {
    $('#tbutton-next').on('click', function() {
        if (currentTestimonialIndex + 1 < testimonialData.length ) {
            currentTestimonialIndex++;
            $('#tcontent-container').removeClass('animate__object move__fadeInRight');
            restartAnimation('#tcontent-container', 'animate__object move__fadeInLeft')
            showTestimonialAt(currentTestimonialIndex);
        }
    });
    $('#tbutton-prev').on('click', function() {
        if (currentTestimonialIndex > 0) {
            currentTestimonialIndex--;
            $('#tcontent-container').removeClass('animate__object move__fadeInLeft');
            restartAnimation('#tcontent-container', 'animate__object move__fadeInRight')
            showTestimonialAt(currentTestimonialIndex);
        }
    })
}

$(document).ready(async () => {
    data = await getData();
    testimonialData = data.testimonials;

    showInitialTestimony();
    // connect events for testimonial controls
    handleTestimonialControls();


});
