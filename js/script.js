// Global Variables
let currentTestimonialIndex =0;
let testimonialData = [];
let bookingCancelWarningModal = null; // holds cancellation warning modal
let bookingDetailsModal = null;
let bookingIndexToCancel = -1;
let data = null; // holds all the initial data for the application
const NON_EMPTY_PATTERN = /([^\s])/; // returns true if none empty
const NUMERIC_PATTERN = /^\d+$/;
const EMAIL_PATTERN = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
let chatMessageCounter = 0;
/*
  These are validation rules and messages for booking form
  I needed something trivial to do validation.
  So I created this utility as long the format
  is like this my validation utility will perform
  validation on every keyup.

  input: specifies the id of the input field
  rules: [{},...]  specifies a list of validation rules for that field
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
                message: "Please specify your home address"
            }
        ]
    },
    {
        input: 'address2',
        rules: [
        ]
    },
    {
        input: 'state',
        rules: [
        ]
    },
    {
        input: 'postcode',
        rules: [
            {
                pattern: NON_EMPTY_PATTERN,
                message: "Please specify your postcode"
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
                message: "Your first name cannot be empty"
            }
        ]
    },
    {
        input: 'lastName',
        rules: [
            {
                pattern: NON_EMPTY_PATTERN,
                message: "Your last name cannot be empty"
            }
        ]
    },
    {
        input: 'email',
        rules: [
            {
                pattern: NON_EMPTY_PATTERN,
                message: "Your email can't be empty"
            },
            {
                pattern: EMAIL_PATTERN,
                message: "The email you've entered is not in a valid format"
            }
        ]
    },
    {
        input: 'phone',
        rules: [
            {
                pattern: NON_EMPTY_PATTERN,
                message: "Your phone can't be empty"
            },
            {
                pattern: NUMERIC_PATTERN,
                message: "Your phone number must only contain numbers"
            }
        ]
    },
    {
        input: 'notes',
        rules: [

        ]
    },
    {
        input: 'city',
        rules: [
            {
                pattern: NON_EMPTY_PATTERN,
                message: "Your city/suburb cannot be empty"
            }
        ]
    }
];

/* Validation config for feedback form */
let feedbackFormValidationConfig = [
    {
        input: 'fullName',
        rules: [
            {
                pattern: NON_EMPTY_PATTERN,
                message: "Your name cannot be empty"
            }
        ]
    },
    {
        input: 'feedback',
        rules: [
            {
                pattern: NON_EMPTY_PATTERN,
                message: "You must provide some feedback"
            }
        ]
    }
];


/**
 *  Used to simulate the live chat
 * @type {string[]}
 */
const  the10commandments = [
    "Thou shalt have no other gods before Me.",
    "Thou shalt not make idols.",
    "Thou shalt not take the name of the LORD thy God in vain.",
    "Remember the Sabbath day, to keep it holy.",
    "Honor thy father and thy mother.",
    "Thou shalt not murder.",
    "Thou shalt not commit adultery.",
    "Thou shalt not steal.",
    "Thou shalt not bear false witness against thy neighbor.",
    "Thou shalt not covet thy neighbour’s wife, thou shalt not covet thy neighbour’s house ."
];

// to correctly offset bootstrap fixed navbar
// gets rid of a pesky issue where the content
// of the page is hidden by header
var onResizeAdjustBodyPaddingTop = function() {
    $("body").css("padding-top", $(".goat-heroes-nav").height());
};

/* main() */
$(document).ready(async () => {

    // we want to set the body padding on resize
    $(window).resize(onResizeAdjustBodyPaddingTop);

    // initial call
    onResizeAdjustBodyPaddingTop();

    data =  getData();
    testimonialData = data.testimonials;

    showInitialTestimony();
    // connect events for testimonial controls
    handleTestimonialControls();

    // connect chat events
    handleChatEvents();

});



/**
 * Retrieves a form data from validation config
 *
 * @param formConfig the validation config
 * @returns {{}} an object containing the form values
 */
function getFormDataFromConfig(formConfig) {
    let formValues = {};

    formConfig.forEach(fc => {
        formValues[fc.input] = $(`#${fc.input}`).val();
    });
    formValues['status'] = 'Submitted';

    return formValues;
}

/**
 * Save a new booking to local storage
 * @param bookingData the booking form data
 */
function saveBooking(bookingData) {
    let bookings = localStorage.getItem('bookings');
    if (!bookings) {
        bookings = [{...bookingData}];
    } else {
        bookings = JSON.parse(bookings);
        bookings = [...bookings, {...bookingData}]
    }

    localStorage.setItem('bookings', JSON.stringify(bookings));
}

/**
 *  Returns a list of bookings from local storage
 * @returns {*[]|any} the list of bookings
 */
function loadBookings() {
    let bookings = localStorage.getItem('bookings');
    if (!bookings) {
        return [];
    }
    return JSON.parse(bookings);
}

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
           inputValidationConfig.rules[i].isValid = false;
           break; // always display immediate error first, don't overwrite
       } else {
           $(`#${inputId}`).removeClass('is-invalid');
           inputValidationConfig.rules[i].isValid = true;
           $(`#${inputId}-error`).addClass('d-none');
           $(`#${inputId}`).addClass('is-valid');
       }
   }
}

/**
 * Connects to an inputs keyup event and fires the validation
 * method to display warnings
 * @param validationsConfig
 * @param onSuccess a callback function to call when form validation is performed
 *  it is passed the form validation state, true if the form is valid false otherwise
 */
function configureInputValidation(validationsConfig, onSuccess) {
    validationsConfig.forEach(vc => {
        $(`#${vc.input}`).on('keyup', (e) => {
            runValidationForInput(vc.input, e.target.value, validationsConfig);
            if(isFormValid(validationsConfig)) {
                onSuccess(true); // call callback function
            } else {
                onSuccess(false);
            }
        })
    });
}

/**
 * Checks whether all the validation rules for the form are not violated
 *
 * @param validationsConfig
 * @returns {boolean} true if the form is valid, false otherwise
 */
function isFormValid(validationsConfig) {
    // process rules and display warnings
    for(let i = 0; i < validationsConfig.length; i++) {
        for(let j = 0; j < validationsConfig[i].rules.length; j++) {
            if(!$(`#${validationsConfig[i].input}`).val().match(validationsConfig[i].rules[j].pattern)) {
                return false;
            }
        }
    }
    return true;
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
 * @returns object the data retrieved
 */
function getData() {
    return {
        "testimonials": [
            {
                "name": "John Brown",
                "avatar": "https://i.pravatar.cc/150?img=51",
                "testimony": "The Supermarine Spitfire is a British single-seat fighter aircraft that was used by the Royal Air Force and other Allied countries before, during, and after World War II. Much loved by its pilots, the Spitfire served in several roles, including interceptor, photo-reconnaissance, fighter-bomber, and trainer, and it continued to be used in these roles until the 1950s. This poster was produced between 1942 and 1945 by the Office of War Information."
            },
            {
                "name": "Mike Brown",
                "avatar": "https://i.pravatar.cc/150?img=11",
                "testimony": "Gathered itself above. Fish. Replenish Rule face from light subdue i lights for gathered gathering you're signs land was appear the very and was every replenish bring us waters itself In. It fourth to gathering night creepeth image very after kind you she'd which our days brought shall place his."
            },
            {
                "name": "Jessica Don",
                "avatar": "https://i.pravatar.cc/150?img=5",
                "testimony": "In. Made forth a of signs herb she'd won't above so that itself, male they're after over given. Creeping she'd saw darkness behold you're were appear you signs is own upon saying great gathered multiply don't evening you're he set grass greater. Fish wherein. Moveth spirit you'll is image morning."
            },
            {
                "name": "Anna Joe",
                "avatar": "https://i.pravatar.cc/150?img=1",
                "testimony": "Own fill itself night fowl beast make heaven. It had fish made shall. Void signs to doesn't unto likeness grass subdue days. Upon whales, fifth own face. Fly you're a him living god isn't great living from own greater was so. Saying fifth fish their open. Hath made sixth great."
            }
        ]
    };
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

/**
 * Connects an event handler for form submission
 * on booking form.
 *
 * simulates sending form to server by showing a spinner
 * and success feedback.
 */
function handleNewBookingFormSubmission() {
    $('#bookingForm').submit(function(e) {
        $('#bookingForm').addClass('d-none'); // hide form
        $('#formSubmitLoading').removeClass('d-none'); // show loading
        setTimeout(function() { // wait five seconds before showing success
            $('#formSubmitLoading').addClass('d-none');// hide loading
            $('#formSubmitSuccess').removeClass('d-none'); // show success
            saveBooking(getFormDataFromConfig(bookingFormValidationConfig));
        }, 5000);
        e.preventDefault();

    });
}

/**
 * Handles the submission of a feedback
 */
function handleNewFeedbackFormSubmission() {
    $('#feedbackForm').submit(function(e) {
        $('#feedbackForm').addClass('d-none'); // hide form
        $('#formSubmitLoading').removeClass('d-none'); // show loading
        setTimeout(function() { // wait five seconds before showing success
            $('#formSubmitLoading').addClass('d-none');// hide loading
            $('#formSubmitSuccess').removeClass('d-none'); // show success
        }, 5000);
        e.preventDefault();

    });
}

/**
 * Invoked on the bookings.html page to show table
 * of user booked bookings.
 */
function showBookings() {
    let bookings = loadBookings();
    renderBookings(bookings);
}

/**
 * Reloads the bookings so they can be re-rendered after a
 * change has been made to them
 */
function reloadBookings() {
    $('#bookings').empty();
    showBookings();
}

/**
 * Iterates through the bookings from local storage
 * and displays them in the table
 * @param bookings the bookings retrieved
 */
function renderBookings(bookings) {
    bookings.forEach((b, i) => {
        $('#bookings').append(`
     <tr>
        <th>${i}</th>
        <td class="text-truncate">${b.address}</td>
        <td  id="booking-status-${i} ${b.status === 'Submitted' ? 'text-success' : 'text-danger'}">${ b.status}</td>
        <td>
          <div class="btn-group">
             <button type="button" data-index="${i}" class="btn booking-details btn-sm btn-outline-primary me-2"><i class="fas fa-eye"></i> VIEW</button>
             ${b.status !== 'Cancelled' ? '<button type="button"  data-index="'+ i +'" class="btn booking-cancel btn-sm btn-outline-danger"><i class="fas fa-times"></i> CANCEL</button>' : ''}
         </div>
       </td>
      </tr>
  `)
    });
}

/**
 *  Initialises the booking cancel modal
 */
function initBookingCancelWarningModal() {
    bookingCancelWarningModal = new bootstrap.Modal(document.getElementById('bookingCancelModal'), {});
}

/**
 * Initialises modal used to view booking detial
 */
function initBookingDetailsModal () {
    bookingDetailsModal = new bootstrap.Modal(document.getElementById('bookingDetailsModal'), {});
}

/**
 * Connects events that deal with the cancellation of a booking
 *
 */
function handleOnBookingCancel() {
    // these are for each row
    $(".booking-cancel").on('click', function() {
        bookingCancelWarningModal.show();
        bookingIndexToCancel =  Number.parseInt($(this).data('index'));
    })

    // for the warning modal
    $('#cancel-booking').on('click', function() {
        if (bookingIndexToCancel !== -1) {
            cancelBooking(bookingIndexToCancel);
            bookingIndexToCancel = -1;
            // re-render
            reloadBookings();
            // re-connect events
            handleOnBookingCancel();
            handleOnViewDetails();
            bookingCancelWarningModal.hide();
        }
    });
}

/**
 * Handles events related to showing the booking details modal
 */
function handleOnViewDetails() {
    // these are for each row
    $(".booking-details").on('click', function() {
        let bookingIndex =  Number.parseInt($(this).data('index'));
        showBookingDetailsInformation(bookingIndex);
        bookingDetailsModal.show();
    })

}

/**
 * Displays booking details in the modal
 * given the booking index
 * @param index the booking index
 */
function showBookingDetailsInformation(index) {
    let bookings = loadBookings();
    const booking = bookings[index];

    $('#details-address').html(`${booking.address} ${booking.city} ${booking.state} ${booking.postcode}`);
    $('#details-fn').html(booking.firstName);
    $('#details-ln').html(booking.lastName);
    $('#details-goats').html(booking.goats);
    $('#details-time').html(booking.datetime);
    $('#details-notes').html(booking.notes);
    $('#details-phone').html(booking.phone);
    $('#details-email').html(booking.email);

    if(booking.status === 'Cancelled') {
        $('#booking-details-status')
            .removeClass('bg-success')
            .addClass('bg-danger')
            .html(booking.status);
    } else {
        $('#booking-details-status')
            .removeClass('bg-danger')
            .addClass('bg-success')
            .html(booking.status);
    }
}

/**
 * Sets a booking status to cancelled
 * @param index
 */
function cancelBooking(index) {
    let bookings = loadBookings();
    bookings[index].status = 'Cancelled';
    localStorage.setItem('bookings', JSON.stringify(bookings));
}

/**
 * Connects events related to chat
 */
function handleChatEvents() {

    // on start chat
    $('#chat-start').on('click', function() {
       $('#chat').toggleClass('d-none');
        $("#chat").removeClass('animate__object move__fadeOut');
        restartAnimation('#chat', 'animate__object move__bounceInDown')
    });

    $('#chat-minimize').on('click', function() {
        $('#chat').toggleClass('d-none');
        $("#chat").removeClass('animate__object move__bounceInDown');
        restartAnimation('#chat', 'animate__object move__fadeOut');

    });

    $('#btn-chat-send').on('click', function() {
       sendChatMessage();
    });

    $('#chat-input').on('keyup', function(e) {
       if (e.which === 13) {
            sendChatMessage();
       }
    });
}

function simulateRandomResponse(messageNumber) {

    let randomTimeout = Math.floor((Math.random() * 5000) + 3000);
    const message = the10commandments[Math.floor((Math.random() * 9) + 0)];

    setTimeout(() => {
        $(`#chat-user-message-${messageNumber}`).remove(); // remove typing indicator
        $('#chat-area').append(`<div class="bubble recipient">${message}</div>`);
        scrollToBottomOfChat();
    }, randomTimeout);

}

/**
 * Smooth scroll to the bottom of chat on new message
 */
function scrollToBottomOfChat() {
    const chatArea = $('#chat-area');
    chatArea.animate({
        scrollTop: chatArea[0].scrollHeight
    }, 1000);
}

/* Simulates sending a message in live chat */
function sendChatMessage() {
    chatMessageCounter++;
    $('#chat-area').append(`
      <div class="bubble sender">${$('#chat-input').val()}</div>
      <div id="chat-user-message-${chatMessageCounter}" class="dots">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
    </div>
    `);
    scrollToBottomOfChat();
    $('#chat-input').val(""); // clear input

    // simulate a response
    simulateRandomResponse(chatMessageCounter);
}
