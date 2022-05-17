/**
 * Used to get the data object containing testmonials
 * etc.
 *
 * @returns {Promise<Response>} the data retrieved
 */
async function getData() {
    return fetch('/data/data.json')
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
        console.log("Clicked next");
    });
    $('#tbutton-prev').on('click', function() {
        console.log("Clicked prev");
    })
}
$(document).ready(() => {

    // connect events for testimonial controls
    handleTestimonialControls();

});
