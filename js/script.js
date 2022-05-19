// Global Variables
let currentTestimonialIndex =0;
let testimonialData = [];
let data = null; // holds all the initial data for the application

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
