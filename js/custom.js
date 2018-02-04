/**
 * Protect window.console method calls, e.g. console is not defined on IE
 * unless dev tools are open, and IE doesn't define console.debug
 */
(function() {
  if (!window.console) {
    window.console = {};
  }
  // union of Chrome, FF, IE, and Safari console methods
  var m = [
    "log", "info", "warn", "error", "debug", "trace", "dir", "group",
    "groupCollapsed", "groupEnd", "time", "timeEnd", "profile", "profileEnd",
    "dirxml", "assert", "count", "markTimeline", "timeStamp", "clear"
  ];
  // define undefined methods as noops to prevent errors
  for (var i = 0; i < m.length; i++) {
    if (!window.console[m[i]]) {
      window.console[m[i]] = function() {};
    }    
  } 
})();

function getParameterByName(name) {
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regexS = "[\\?&]" + name + "=([^&#]*)";
	var regex = new RegExp(regexS);
	var results = regex.exec(window.location.search);
	if(results == null) {
		return "";
	} else {
		return decodeURIComponent(results[1].replace(/\+/g, " "));
	}
}



function checkFields() {
		
	$('#contact-form input[type=text]').each(function() {
		var fieldName = this.getAttribute('name');
		var required = $(document.getElementsByName(fieldName)).hasClass('required');
		var email = $(document.getElementsByName(fieldName)).hasClass('email');
		
		if(this.value == '' && required) {
			$(document.getElementsByName(fieldName)).addClass('field-error');
		} else {
			$(document.getElementsByName(fieldName)).removeClass('field-error');
		}
		
		if (email) {
			console.log("checking email");
			if (validateEmail(this.value)) {
				console.log("email is CORRECT");
				$(document.getElementsByName(fieldName)).removeClass('field-error');				
			} else {
				console.log("email is incorrect because value is: " + this.value);
				$(document.getElementsByName(fieldName)).addClass('field-error');
			}
		}
	});
	
}

function validateEmail(email) {
	
	var re = /^[_\.0-9a-zA-Z-]+@([0-9a-zA-Z][0-9a-zA-Z-]+\.)+[a-zA-Z]{2,6}$/i;
	console.log("the test is: " + re.test(email));
	return re.test(email);
   
}





/**
* Sets hidden field value from url parameter
* @param {String} sourceParam form field to be set
*/
function setHiddenSource(sourceParam){ 

    //Initialize parameter from URL and field to be set
    var parameterValue = getParameterByName(sourceParam);
    var parameterField = "#"+sourceParam;

    //If parameter is in URL and field exists - populate field
    if (parameterValue !== null && $(parameterField).length) {
        $(parameterField).val(parameterValue);
    }

}


// Smooth scroll to defined place on site
$(document).ready(function(){

    //Add hidden fields here that should be populated
    setHiddenSource("utmsource");


	$('#contact-form form').find('input').on('keyup blur focus', function(e) {
		
		// Cache our selectors
		var $this = $(this);
		var $previous = $this.prev();
			
		// Add or remove classes
		if (e.type == 'keyup') {
			//alert('keyup');
			if( $this.val() == '' && $.support.placeholder ) {
				$previous.removeClass('js-show-label'); 
			} else {
				$previous.addClass('js-show-label'); 				
			}

		}
		if (e.type == 'keyup' && formSubmitted) {
			checkFields();
		}	

	});    
	
	
	// get domain
	var tokens = document.domain.split('.');
    var domain = tokens[tokens.length - 2] + '.' + tokens[tokens.length - 1];

	// set cookie if cust parameter is passed
	var cust = getParameterByName("cust");
	if( cust && cust != '' ){
		var now = new Date();
		var expiresDate = new Date();
		expiresDate.setDate(now.getDate() + 365);
		$.cookie('InternetRetailer1017', '1',  { expires: expiresDate, path: '/', domain: '.' + domain });
		$.cookie('customerEmail', cust,  { expires: expiresDate, path: '/', domain: '.' + domain });		
	}

	$('#contact-form input').focus(function() {
		$(this).removeClass('error');
	});	

	// variable to hold request
	var request;

	// bind to the submit event of our form
	$("#contact-form").submit(function(event){
	  // abort any pending request
	  if (request) {
	      request.abort();
	  }
	  
	  // setup some local variables
	  var $form = $(this);
	  
	  // let's select and cache all the fields
	  var $inputs = $form.find("input, select, button, textarea");

	  // serialize the data in the form
	  var serializedData = $form.serialize();

	  // let's disable the inputs for the duration of the ajax request
	  $inputs.prop("disabled", true);

	  // fire off the request to /form.php
	  request = $.ajax({
	      url: "contact_form.php",
	      type: "post",
	      data: serializedData
	  });

	  // callback handler that will be called on success
	  request.done(function (response, textStatus, jqXHR){
	      // log a message to the console
	      console.log(response);
	      var obj = jQuery.parseJSON( response );

	      if( obj.type == 'success' ){
	      	$('#rightBar').hide();

			var now = new Date();
			var expiresDate = new Date();
			expiresDate.setDate(now.getDate() + 365);
			$.cookie('InternetRetailer1017', '1',  { expires: expiresDate, path: '/', domain: '.' + domain });
			$.cookie('customerEmail', obj.email,  { expires: expiresDate, path: '/', domain: '.' + domain });	      	

	        $('.form-message').html('<div style=" padding:10px; border-radius:10px; text-align:center;"><h2 class="text-center feature-title">Thank you for your interest in an IDVision demo!</h2><p style="color: #000000;">A TransUnion representative will contact you shortly.</p></div>');
		
		// window.location = "thank-you.html";
			
	        console.log("form submitted");            

	      } else {
	      	//obj.returned_val
	      	console.log(obj.returned_val);
	      	var fields = obj.returned_val.split(',');
	      	var fieldsLength = fields.length-1;

	      	$('#contact-form *').removeClass('error');

	      	for (var f=0; f < fieldsLength; f++) {
	      		$('#contact-form *[name='+fields[f]+']').addClass('error');
	      		//console.log(fields[f]);
	      	}
			
			checkFields();
	        $('.error-message').html('Please complete all fields.').removeClass('text-success').addClass('text-error').addClass('form-status');
		//	$('.req-message').removeClass('text-success').addClass('text-error').addClass('form-status');
	      }
	      
	  });

	  // callback handler that will be called on failure
	  request.fail(function (jqXHR, textStatus, errorThrown){
	      // log the error to the console
	      console.error("The following error occured: " + textStatus, errorThrown);
	  });

	  // callback handler that will be called regardless
	  // if the request failed or succeeded
	  request.always(function () {
	      // reenable the inputs
	      $inputs.prop("disabled", false);
	  });

	  // prevent default posting of form
	  event.preventDefault();
	});   

});