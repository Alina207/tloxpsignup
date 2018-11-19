// JavaScript Document

/**
 * Gets parameter value from URL
 * @param {String} name parameter name
 * @param {String} url
 */
function getParameterByName(name, url) {

	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, " "));

}
/**
 * Sets hidden field value from url parameter
 * @param {String} sourceParam form field to be set
 */
function setHiddenSource(sourceParam) {

	//Initialize parameter from URL and field to be set
	var parameterValue = getParameterByName(sourceParam);
	var parameterField = "#" + sourceParam;

	//If parameter is in URL and field exists - populate field
	if (parameterValue !== null && $(parameterField).length) {
		$(parameterField).val(parameterValue);
	}

}


/**form validations **/
function checkFields() {

	$('#formFreeTrialSignupLeft input[type=text], #formFreeTrialSignupLeft select').each(function () {
		var fieldName = this.getAttribute('name');

		var required = $(document.getElementsByName(fieldName)).hasClass('required');
		var email = $(document.getElementsByName(fieldName)).hasClass('email');

		if (this.value == '' && required) {
			$(document.getElementsByName(fieldName)).addClass('field-error');
		} else {
			$(document.getElementsByName(fieldName)).removeClass('field-error');
		}

		if (email) {
			if (validateEmail(this.value)) {
				$(document.getElementsByName(fieldName)).removeClass('field-error');
			} else {
				$(document.getElementsByName(fieldName)).addClass('field-error');
			}
		}
	});

}

function validateEmail(email) {

	var re = /^[_\.0-9a-zA-Z-]+@([0-9a-zA-Z][0-9a-zA-Z-]+\.)+[a-zA-Z]{2,6}$/i;
	return re.test(email);

}

function checkFieldsInstant(element) {


	var fieldName = element.getAttribute('name');
	var field = $(document.getElementsByName(fieldName));


	var required = $(document.getElementsByName(fieldName)).hasClass('required');
	var email = $(document.getElementsByName(fieldName)).hasClass('email');
	var phone = $(document.getElementsByName(fieldName)).hasClass('phone');
	var fieldLength = field.val().length;
	var minValue = element.getAttribute('data-min-length');

	if (!email && !phone) {
		console.log("checked regular field");
		if (fieldLength < 1 && required) {
			field.parent().addClass('field-error');
			field.parent().removeClass('field-success');
		} else {
			field.parent().removeClass('field-error');
			field.parent().addClass('field-success');
		}
	}

	if (email) {
		console.log("checked email");
		if (validateEmail(field.val())) {
			field.parent().removeClass('field-error');
			field.parent().addClass('field-success');
		} else {
			field.parent().addClass('field-error');
			field.parent().removeClass('field-success');
		}
	}

	if (phone) {
		console.log("checked phone");
		if (fieldLength < 8 && required) {
			field.parent().addClass('field-error');
			field.parent().removeClass('field-success');

		} else {
			field.parent().removeClass('field-error');
			field.parent().addClass('field-success');
		}
	}

}

$(document).ready(function() {
    var formSubmitted = !1;
    $.support.placeholder = (function() {
        var i = document.createElement('input');
        return 'placeholder' in i
    })();
    if (!$.support.placeholder) {
        $('#formFreeTrialSignupLeft label').each(function() {
            $(this).addClass('js-show-label')
        })
    }
    $('#formFreeTrialSignupLeft').find('input').on('input change keyup blur focus', function(e) {
        var $this = $(this);
        var $previous = $this.parent().prev();
        if (e.type == 'keyup') {
            if ($this.val() == '' && $.support.placeholder) {
                $previous.removeClass('js-show-label')
            } else {
                $previous.addClass('js-show-label')
            }
        }
        checkFieldsInstant(this)
    });
    $('#formFreeTrialSignupLeft').find('select').on('input change keyup blur focus click', function(e) {
        var $this = $(this);
        var $previous = $this.parent().prev();
        if (e.type == 'click' || e.type == 'keyup') {
            if ($this.val() == '' && $.support.placeholder) {
                $previous.removeClass('js-show-label')
            } else {
                $previous.addClass('js-show-label')
            }
        }
        checkFieldsInstant(this)
    });



	//set hidden fields to capture in URL
	setHiddenSource("utmsource");

	//form submit ajax steps

	// Get the form and message div 
	var form = $('#formFreeTrialSignupLeft');
	var formMessages = $('#form-message');

	// event listener for the form
	$(form).submit(function (event) {

		// Serialize the form data.
		var formData = $(form).serialize();

		// Form submit steps through AJAX - post, success and fail message.
		$.ajax({
				type: 'POST',
				url: '/admin/eloqua-form-submit',
				data: $('#formFreeTrialSignupLeft').serialize()
			})
			.done(function (response) {
				$('#formFreeTrialSignupLeft').hide();
				$('.thank-you-box').removeClass("hidden");

				// Make sure that the formMessages div has the 'success' class.
				$(formMessages).removeClass('error');
				$(formMessages).addClass('success');
				// Set the sucess message/behavior box to show

			})
			.fail(function (data) {
				// Make sure that the formMessages div has the 'error' class.
				$(formMessages).removeClass('success');
				$(formMessages).addClass('error');

				// Set the error message.
				if (data.responseText !== '') {
					$(formMessages).text(data.responseText);
				} else {
					$(formMessages).text('An error occured. Please try again.');
				}
			});

		// Stop the browser from submitting the form automatically
		event.preventDefault();
	});

});


