
function handleTestimonialControls () {
    $('#tbutton-next').on('click', function() {
        console.log("Clicked next");
    });
    $('#tbutton-prev').on('click', function() {
        console.log("Clicked prev");
    })
}
$(document).ready(() => {

    // connect events
    handleTestimonialControls();

});
