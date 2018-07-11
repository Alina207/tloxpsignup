
/* ---- Functions for contact form ---- */
function fieldLevelValidation() {
	$('.optionalField').on('keyup blur change', function() {
		if ($(this).val().length > 0) {
			$(this).addClass('checkValid');
			$(this).valid();
		} else {
			$(this).removeClass('checkValid');
			$(this).removeClass('valid');
		}
		toggleSubmitButton('formID');
	});
	$('.checkValid').on('keyup blur change', function() {
		$(this).valid();


		var $form = $(this).closest('form');
		toggleSubmitButton($form);
	});
}

function toggleSubmitButton(_$form) {
	var validFlag = true;

	$(' .checkValid', _$form).each(function(index, element) {
		if ($(element).hasClass('optionalField') && !$(element).hasClass('valid')) {
			validFlag = false;
		} else if (!$(element).hasClass('valid')) {
			validFlag = false;
		}
	});
	if (validFlag) {
		$(' .submitButton', _$form).prop('disabled', false);
	} else {
		$('.submitButton', _$form).prop('disabled', 'disabled');
	}
}

/**
 * Converts form submission to ajax call that looks for success or failure
 * Also adds a blocking element into the form that can be used to show info
 * @param  {object} _evt Form submission event
 */
function submitForm(_evt) {
	//prevent the default submit
	_evt.preventDefault();

	var $form = $(_evt.currentTarget);
	var submission = $.Deferred();

	var successMessage = '<div class="formMessage successMessage">' +
		'<i class="fa fa-fw fa-check-circle-o fa-3x"></i>' +
		'<div class="messageContent">'+$.validator.messages.submission.success+'</div>' +
		'</div>'; //Thanks! We\'ll get back to you soon.

	var failureMessage = '<div class="formMessage failureMessage">' +
		'<i class="fa fa-fw fa-exclamation-circle fa-3x"></i>' +
		'<div class="messageContent">'+$.validator.messages.submission.failed+'</div>' +
		'</div>';

	var reCaptchaMessage = '<div class="alert alert-warning"><span class="fa tufa-alert fa-2x alertIcon"></span>'+$.validator.messages.submission.recaptchaFailure+'</div>';

	var persMessage = '<div class="formMessage personalMessage">' +
		'<i class="fa fa-fw tufa-info-circle fa-3x"></i>' +
		'<div class="messageContent">' +
		$.validator.messages.submission.personalMessage +
		'</div>' +
		'</div>';

	/* Form field filtering */

	var comment = '';
	if ($('.commentsLength').length > 0) {
		comment = $('.commentsLength', $form).val().toLowerCase().replace(/[$.,!]/g, '');
	}
	var filters = [
		'1795',
		'1799',
		'19',
		'1995',
		'1999',
		'2995',
		'2999',
		'cancel',
		'cancelled',
		'court order',
		'death',
		'deceased',
		'deduct',
		'dispute',
		'free credit report',
		'freeze',
		'freezelift',
		'http',
		'my child',
		'my credit',
		'my daughter',
		'my son',
		'racist',
		'scam',
		'scammed',
		'scammer',
		'stolen',
		'trial',
		'unfreeze',
		'unsubscribe',
		'victim'
	];
	var reg = new RegExp(filters.join('|'), 'i');

	if (!$form.data('blocked')) {
		$form.Block();
	}

	if (comment.match(reg)) {
		$form
			.data('blocked', false)
			.closest('section, .col-lg-10, .insightSubscribeWrapper, .emailRightColumnWrapper, .emailWrapper, .formWrapper')
			.append(persMessage);
		$form.hide();
		$form.closest('section, .col-lg-10, .insightSubscribeWrapper, .emailRightColumnWrapper, .emailWrapper, .formWrapper').children('.inProgress').hide();
	} else {
		$.ajax({
			type: "POST",
			url: $form.attr('action'),
			data: $form.serialize(),
			success: function(_data) {

				/* tag manager function for form submission */
				TagManagerPush('form', 'Form Submit', $form.attr('id'), $form.data('formtype'));

				if (_data === 'Success') {
					submission.resolve();
				} else if (_data === 'Failure') {
					submission.reject();
				} else if (_data === 'Invalid') {
					submission.reject('reCaptcha');
				} else {
					submission.reject();
				}
			},
			error: function() {
				submission.reject();

				/* tag manager function for form errors */
				TagManagerPush('form', 'Form Error', $form.attr('id'), $form.data('formtype'));
			},
			dataType: 'text'
		});
	}

	$.when(submission).done(function() {
		$form
			.data('blocked', false)
			.closest('section, .col-lg-10, .insightSubscribeWrapper, .emailRightColumnWrapper, .emailWrapper, .formWrapper')
			.append(successMessage);
		$form.prop('disabled', true).hide();
	}).fail(function(data) {
		if (data === 'reCaptcha') {
			$form
				.data('blocked', false)
				.prepend(reCaptchaMessage);
		} else {
			$form
				.data('blocked', false)
				.closest('section, .col-lg-10, .insightSubscribeWrapper, .emailRightColumnWrapper, .emailWrapper, .formWrapper')
				.append(failureMessage);
			$form.hide();
		}
	}).always(function() {
		$form.closest('section, .col-lg-10, .insightSubscribeWrapper, .emailRightColumnWrapper, .emailWrapper, .formWrapper').children('.inProgress').hide();
	});
}

/*set up the form submission listener */
$(document).ready(function() {

	//loop through all the forms and set up submit handlers
	$('form[data-formtype^="contact"]').each(function() {
		var $this = $(this);

		$this.on('submit', submitForm);

	});
	
});

/**
 * Tag Manager Functions
 */

/**
 * Pushes the tag manager data object to the dataLayer
 * @param {String} _event    
 * @param {String} _category 
 * @param {String} _action   
 * @param {String} _label    
 */
function TagManagerPush(_event, _category, _action, _label) {
	var obj;

	obj = {
		'event': _event,
		gaEvent: {
			'category': _category,
			'action': _action,
			'label': _label,
		},
	};

	//console.log(JSON.stringify(obj));

	dataLayer.push(obj);
}

/**
 * Sets up a timer that looks for addthis and sets listeners once it is loaded
 */
(function() {
	var addThisTimer = setInterval(function() {
		if (typeof addthis !== 'undefined') {
			clearInterval(addThisTimer);

			//once add this has been loaded wait for the addthis.ready listener
			addthis.addEventListener('addthis.ready', function() {

				//whenever a page is shared the event is sent to the tagManager
				addthis.addEventListener('addthis.menu.share', function(_evt) {
					TagManagerPush('social', 'Social Share', _evt.data.service, _evt.data.url);
				});
			});
		}
	}, 100);
})();

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
function setHiddenSource(sourceParam){ 

	//Initialize parameter from URL and field to be set
	var parameterValue = getParameterByName(sourceParam);

	//Get stored value if parameter doesn't exist
	if (!parameterValue) { 
		parameterValue = getCookie(sourceParam);
	}

	var parameterField = "#"+sourceParam;

	//If parameter and field exist - populate field
	if (parameterValue !== null && $(parameterField).length) {
		$("[id="+sourceParam+"]").val(parameterValue);
	}

}

/**
* Sets hidden field value from url parameter
* @param {String} sourceParam form field to be set
*/
function storeParameterByName(paramName){
    var paramValue = getParameterByName(paramName);
    if(paramValue){
        setCookie(paramName, paramValue, 30);
    }
}

/**
* Sets cookie
* @param {String} cname name of cookie
* @param {String} cvalue value of cookie
* @param {String} exdays time for cookie to expire
*/
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

/**
* Gets cookie
* @param {String} cname name of cookie
* @returns {String} cookie
*/
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length,c.length);
        }
    }
    return "";
}

$(document).ready(function() {
	//check if there are any contact forms 
	var $contactForms = $('form[data-formtype="contact"]');

	//adding in the one time form start event
	if ($contactForms.length > 0) {

		//one time click listener for Form Start tag
		$(document).one('click', 'form[data-formtype^="contact"] input, form[data-formtype^="contact"] textarea, form[data-formtype^="contact"] select', function(_evt) {
			var $input,
				$form,
				obj;

			$input = $(_evt.currentTarget);
			$form = $input.closest('form');

			TagManagerPush('form', 'Form Start', $form.attr('id'), $form.data('formtype'));

		});

		//adding in the click listener to the inputs for Form tracking tag
		$(document).on('click', 'form[data-formtype^="contact"] input, form[data-formtype^="contact"] textarea, form[data-formtype^="contact"] select', function(_evt) {
			var $input,
				$form,
				obj;

			$input = $(_evt.currentTarget);
			$form = $input.closest('form');

			TagManagerPush('form', 'Form Tracking', $form.attr('id'), $input.attr('name'));
		});

		//Add hidden fields here that should be populated - only if form present
		setHiddenSource("utmsource");
		setHiddenSource("utmmedium");
		setHiddenSource("utmkeyword");

	}

	//Store parameter in cookie - applies to every page
	storeParameterByName("utmsource");
	storeParameterByName("utmmedium");
	storeParameterByName("utmkeyword");

	/* Business login tag manager stuffs */
	$('#bizLoginNav').on('click', 'li', function(_evt) {
		var obj,
			appName;

		appName = $(_evt.currentTarget).find('a').text();

		TagManagerPush('login', 'businesslogin', appName, 'Home');
	});

	/* Scroll information */
	var prevHeight = 0,
		$modules = $('.wrapper'),
		lastId;

	$(window).scroll(function() {
		var fromTop = $(this).scrollTop(),
			body = document.body,
			html = document.documentElement,
			height = Math.max(body.scrollHeight, body.offsetHeight,
				html.clientHeight, html.scrollHeight, html.offsetHeight);

		var currentHeight = Math.floor((fromTop / (height - screen.height)) * 10) * 10;

		if (prevHeight < currentHeight) {

			prevHeight = currentHeight;

			TagManagerPush('scroll', 'Max Scroll', location.href, (currentHeight - 9) + '-' + (currentHeight));

		}


		fromTop += (screen.height / 2);

		var cur = $modules.map(function() {

			if ($(this).offset().top + ($(this).height() / 2) < fromTop) {
				return this;
			}
		});

		// Get the id of the current element
		cur = cur[cur.length - 1];
		var id = cur ? cur.id : "";
		if (lastId !== id && cur !== "") {
			lastId = id;
			TagManagerPush('scroll', 'Page Scroll', 'module', id);
		}
	});
	
	// Resets video when modal is closed - for mixed media wall
	$('#mixedMediaVideoModal').on('hidden.bs.modal', function (e) {
		var iFrameSRC = $('#mixedMediaVideoModal iframe').attr('src');
		$('#mixedMediaVideoModal iframe').attr('src', iFrameSRC);
	});

});


/* ---- Main Contact Form ---- */
function enableContactForm() {
	$('.contactForm').show();
	$('.consumerPicker').hide();
}


/* ---- Form handlers ---- */
function labelMove(whichLabel) {
	$(whichLabel).removeClass('inForm');
	//$('#' + $(whichLabel).attr('for')).focus();
}


/* ---- Set the state of various elements, i.e. navigations on Media Query state change and onload ---- */
function checkMediaQueryState() {
	resetNavigation();
	carouselFunctions();
	initMobileMenuScroll();
	initMainNavMoreInfo();
	initHeaderMenus();
}

/* ---- Navigation media query reset ---- */
function resetNavigation() {
	if (Modernizr.mq(mqXs)) {
		$('.footerContent:visible').hide();
		//$('.sideNavContainer .mainSideNav:visible').hide();
		$('#solutionsAndProductsSubNav').show();
		$('#solutionsNavContent, #productsNavContent').hide();
	} else if (Modernizr.mq(mqSmRange)) {
		$('#solutionsAndProductsSubNav').show();
		$('#solutionsNavContent, #productsNavContent').hide();
	} else {
		$('body').removeClass('mobileMenuOpen');
		$('#targetNav').removeClass('targetShadowed');
		$('.footerContent').not(':visible').show();
		//$('.sideNavContainer .mainSideNav').not(':visible').show();
		$('#solutionsAndProductsSubNav').hide();
		$('#solutionsNavContent').show();
		hideSearchField();
	}
}

/* ---- Carousel media query reset ---- 
 * Carousel functions is run onload and on window resize. It will turn 
 * on and off the carousel functionality toggling between displaying the items 
 * as a banner or a carousel. ---- */
function carouselFunctions() {
	var $carousels = $('.responsive-carousel');

	if (Modernizr.mq(mqXs)) {
		//removes all but one of the active items and one of the active indicators
		$carousels.each(function(_idx, _carousel) {
			$(_carousel).find('.active + .active')
				.removeClass('active');
			$(_carousel).carousel({ interval: 7500 });
		});
	} else {
		//adds active to all the carousel items so they all display
		$carousels.each(function(_idx, _carousel) {
			$(_carousel).find('.item').addClass('active');
		});
	}

}

/**
 * Creates a click listener for all anchor tags that have a href=#'something'
 */
function addPageScrollAnimation() {
	//Creates the on click listener for the body that catches an clicks on <a> tags 
	$('body').on('click', 'a[href*=#]:not([href=#])', function() {
		if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
			var target = $(this.hash);
			target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
			if (target.length) {
				$('html,body').animate({
					scrollTop: target.offset().top
				}, 500);
				return false;
			}
		}
	});
}

/* ---- Looks for SVG Support and if not found replaces src attribute with PNG ---- */
function checkSVGSupport() {
	if (!Modernizr.svg) {
		var newSrc;
		$("img[src$='.svg']").each(function(index, element) {
			newSrc = $(element).attr('src').slice(0, -3) + 'png';
		}).attr("src", newSrc);
	}
}


/* ---- Scripts Initiated by Page Load ---- */
$(document).ready(function() {
	initializeAffixTop();
	initializeAffixBottom();
	fieldLevelValidation();

	$('.inForm').each(function(index, element) {
		var $parentDiv = $(element).closest('div');
		var fieldId = $(element).attr('for');
		var $field = $('#' + fieldId, $parentDiv);
		$field.on('input click keypress change focus', function(event) {
			labelMove(element);
		});
	});

	$('#searchContact #searchBox').bind('click keypress change focus', function(event) {
		if ($(this).val().length) {
			$('#searchContact .clearBtn').show();
		} else {
			$('#searchContact .clearBtn').hide();
		}
	});

	$('.searchBox .searchField').bind('click keypress change focus', function(event) {
		if ($(this).val().length) {
			$('.searchBox .clearBtn').show();
		} else {
			$('.searchBox .clearBtn').hide();
		}
	});

	$('.clearBtn').click(function() {
		$(this).hide();
	});
	
	$("#productsSolutionsSelect").change(function() {
		filterComponents('productsSolutionsComponent', $(this).val(), $('#productsSolutionsSelect option:selected').text());
	});

	/* ---- Various state checks such as carousels and navigations
			are assigned to the window resize event and also run once at dom load ---- */
	$(window).resize(function() {
		checkMediaQueryState();
	});
	checkMediaQueryState();

	/* If Hero or Blue Box Carousel is present, enable */
	if ($('.carousel.tabContentFeature, .carousel.heroWrapper, .carousel.contentFeature').length) {
    	$('.carousel.tabContentFeature, .carousel.heroWrapper, .carousel.contentFeature').carousel({
			interval: 7500
		})
	}

	enableCarouselTouchEvents();
	addPageScrollAnimation();
	initMobileMenuScroll();
	initMainNavMoreInfo();
	showEllipsis();
	initHeaderMenus();
	checkSVGSupport();
});

/* ---- Functions to Affix elements to the top and bottom of the screen using Bootstraps affix function ---- */

/**
 * Initializes all the setAffixTops and changes their offsets accordingly
 */
function initializeAffixTop() {
	$('.pageTitle', '#specialtyNavComponent').on('click', function(_evt) {
		$(_evt.target).closest('section').toggleClass('open');
		window.location = '#specialtyNavComponent';
	});

	$('.careers-side-nav a', '#specialtyNavComponent').on('click', function(_evt){
		var li = $(_evt.target).closest('li');
		var $children = li.find('li');

		//remove active class from all siblings
		li.siblings().removeClass('active');
		$children.removeClass('active');
		if($children.length > 0 ){
			_evt.preventDefault();
		}
		li.toggleClass('active');
	});

	$('body').on('click', function(_evt){
		var $nav = $('#specialtyNavComponent');
		if ($nav.length > 0) {
			if (!jQuery.contains($nav.get(0), _evt.target)) {
				var results = $nav.find('li');
				results.removeClass('active');
			}
		}
	});

	$('.specialtyNav.setAffixTop, .specialtyNav-menu.setAffixTop').each(function(index, element) {
		var affixTop = $(element).offset().top,
			resizeTimer;

		$(element).parent().height($(element).outerHeight());

		//fixes an issue with offset 0 causing it to switch between states constantly
		if (affixTop <= 0) { affixTop = 1; }

		$(element).affix({
			offset: {
				top: $(element).offset().top,
				bottom: calcFooterOffset()
			}
		});

		$(element)
			.on('affixed.bs.affix', function() {
				$(element).css('position', '');
			})
			.on('affixed-top.bs.affix', function() {
				$(element).css('position', '');
			})
			.on('affixed-bottom.bs.affix', function() {
				$(element).css('position', '');
			});

		$(window).resize(function() {
			//$(element).off('affix');

			clearTimeout(resizeTimer);

			//we have to give a buffer so that items can resize before we recalculate
			resizeTimer = setTimeout(function() {

				var affixTop = $(element).offset().top;

				$(element).parent().height($(element).outerHeight());

				//fixes an issue with offset 0 causing it to switch between states constantly
				if (affixTop <= 0) { affixTop = 1; }

				if ($(element).data('bs.affix')) {
					$(element).data('bs.affix').options.offset.top = affixTop;
					$(element).data('bs.affix').options.offset.bottom = calcFooterOffset();

				}

				$(element).affix('checkPosition');
			}, 250);
		});
	});

	$('.titleContent.setAffixTop, .contentNav.setAffixTop').each(function(index, element) {
		var affixTop = $(element).offset().top,
			resizeTimer;

		affixTop += $(element).hasClass('specialtyNav') ? calcHeaderOffset() : 0;

		$(element).parent().height($(element).outerHeight());

		affixTop -= calcHeaderOffset();

		//fixes an issue with offset 0 causing it to switch between states constantly
		if (affixTop <= 0) { affixTop = 1; }

		$(element).affix({
			offset: {
				top: affixTop,
				bottom: calcFooterOffset()
			}
		});

		$(element)
			.on('affixed.bs.affix', function() {
				$(element).css('position', '');
			})
			.on('affixed-top.bs.affix', function() {
				$(element).css('position', '');
			})
			.on('affixed-bottom.bs.affix', function() {
				$(element).css('position', '');
			});

		$(window).resize(function() {
			//$(element).off('affix');

			clearTimeout(resizeTimer);

			//we have to give a buffer so that items can resize before we recalculate
			resizeTimer = setTimeout(function() {

				var affixTop = $(element).offset().top;

				affixTop += $(element).hasClass('specialtyNav') ? calcHeaderOffset() : 0;

				$(element).parent().height($(element).outerHeight());

				affixTop -= calcHeaderOffset();

				//fixes an issue with offset 0 causing it to switch between states constantly
				if (affixTop <= 0) { affixTop = 1; }

				if ($(element).data('bs.affix')) {
					$(element).data('bs.affix').options.offset.top = affixTop;
					$(element).data('bs.affix').options.offset.bottom = calcFooterOffset();

				}

				$(element).affix('checkPosition');
			}, 250);
		});
	});


	$('.mainSideNav.articleSideNav').each(function(index, element) {
		//set the css top value
		$(element).css('top', '');

		var affixTop = $(element).parent().offset().top,
			resizeTimer,
			headerOffset = 0,
			titleOffset = 0;

		//calculate the heights of the 
		var $row = $(element).closest('.row');
		$row.css('min-height', ($row.height() + 100) + 'px');

		headerOffset = calcHeaderOffset();

		if (!Modernizr.mq(mqMd) || !$(element).hasClass('listSideNav')) {
			titleOffset = calcTitleOffset();
		}

		affixTop -= titleOffset;
		affixTop -= headerOffset;

		//fixes an issue with offset 0 causing it to switch between states constantly
		//if(affixTop <= 0){affixTop = 1;}

		//set the css top value
		$(element).css('top', titleOffset + headerOffset);

		$(element).affix({
			offset: {
				top: affixTop,
				bottom: calcFooterOffset()
			}
		});

		//resize functionality for the mainSideNav
		$(window).resize(function() {

			//remove the open from the parent
			$(element).parent().removeClass('open');

			//set the css top value
			$(element).css('top', '');

			$(element).removeClass('affix affix-top affix-bottom');

			clearTimeout(resizeTimer);

			//we have to give a buffer so that items can resize before we recalculate
			resizeTimer = setTimeout(function() {

				var affixTop = $(element).parent().offset().top,
					titleOffset = 0,
					headerOffset = 0;

				//$(element).parent().height($(element).outerHeight());
				headerOffset = calcHeaderOffset();

				if (!Modernizr.mq(mqMd) || !$(element).hasClass('listSideNav')) {
					titleOffset = calcTitleOffset();
				}

				affixTop -= headerOffset;
				affixTop -= titleOffset;

				//fixes an issue with offset 0 causing it to switch between states constantly
				//if(affixTop <= 0){affixTop = 1;}

				//set the css top value
				$(element).css('top', titleOffset + headerOffset);

				if ($(element).data('bs.affix')) {
					$(element).data('bs.affix').options.offset.top = affixTop;
					$(element).data('bs.affix').options.offset.bottom = calcFooterOffset();
				}
			}, 250);

			$(element).affix('checkPosition');
		});
	});

	$('.mainSideNav.listSideNav').each(function(index, element) {
		//set the css top value
		$(element).css('top', '');

		var affixTop = $(element).parent().offset().top,
			resizeTimer,
			headerOffset = 0,
			titleOffset = 0;

		//calculate the heights of the 
		var $row = $(element).closest('.row');
		$row.css('min-height', ($row.height() + 100) + 'px');

		headerOffset = calcHeaderOffset();

		if (!Modernizr.mq(mqMd)) {
			titleOffset = calcTitleOffset();
		}

		affixTop -= titleOffset;
		affixTop -= headerOffset;

		//fixes an issue with offset 0 causing it to switch between states constantly
		//if(affixTop <= 0){affixTop = 1;}

		//set the css top value
		$(element).css('top', titleOffset + headerOffset);

		$(element).affix({
			offset: {
				top: affixTop,
				bottom: calcFooterOffset()
			}
		});

		//resize functionality for the mainSideNav
		$(window).resize(function() {

			//remove the open from the parent
			$(element).parent().removeClass('open');

			//set the css top value
			$(element).css('top', '');

			$(element).removeClass('affix affix-top affix-bottom');

			clearTimeout(resizeTimer);

			//we have to give a buffer so that items can resize before we recalculate
			resizeTimer = setTimeout(function() {

				var affixTop = $(element).parent().offset().top,
					titleOffset = 0,
					headerOffset = 0;

				//$(element).parent().height($(element).outerHeight());
				headerOffset = calcHeaderOffset();

				if (!Modernizr.mq(mqMd) || !$(element).hasClass('listSideNav')) {
					titleOffset = calcTitleOffset();
				}

				affixTop -= headerOffset;
				affixTop -= titleOffset;

				//fixes an issue with offset 0 causing it to switch between states constantly
				//if(affixTop <= 0){affixTop = 1;}

				//set the css top value
				$(element).css('top', titleOffset + headerOffset);

				if ($(element).data('bs.affix')) {
					$(element).data('bs.affix').options.offset.top = affixTop;
					$(element).data('bs.affix').options.offset.bottom = calcFooterOffset();
				}
			}, 250);

			$(element).affix('checkPosition');
		});
	});
}

/**
 * Calculates the header offset based on screen size
 */
function calcTitleOffset() {
	//set the changes based on screen size
	var result = 57;
	if (Modernizr.mq(mqLg)) {
		result = 100;
	}

	return result;
}

/**
 * Calculates the header offset based on screen size
 */
function calcHeaderOffset() {
	//set the changes based on screen size
	var result = 51;
	if (Modernizr.mq(mqMd)) {
		result = 64;
	}

	return result;
}

/**
 * Calculates the header offset based on screen size
 */
function calcFooterOffset() {
	//set the changes based on screen size
	var result = 0;
	if (Modernizr.mq(mqMd)) {
		result = 440;
	}

	return result;
}

function initializeAffixBottom() {
	$('.setAffixBottom').each(function(index, element) {
		$(element).parent().height($(element).outerHeight());
		var affixBottom = $(window).height() - $(element).offset().top - $(element).outerHeight();
		$(element).affix({
			offset: {
				bottom: affixBottom
			}
		});
	});
}


/**
 * Recaptcha injectors and validation
 */
var recaptchaDef = new $.Deferred();

function recaptchaValidate($input, response) {
	$input.addClass('valid');
	toggleSubmitButton($input.closest('form'));
}

function recaptchaOnload() {
	recaptchaDef.resolve();
}

$.when(recaptchaDef).then(function() {
	$('[id^=g-recaptcha-]').each(function(_index, _item) {
		var id = $(_item).attr('id');
		grecaptcha.render(id, {
			sitekey: '6LeNQhATAAAAAKypLuGEOOJTo4Bl0CFw9-J8Nywe',
			callback: recaptchaValidate.bind(null, $(_item))
		});
	});
});


