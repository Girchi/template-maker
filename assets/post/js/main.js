$(function() {
	'use strict';
	var contactForm = function() {
		if ($('#contactForm').length > 0 ) {
			$( "#contactForm" ).validate( {
				rules: {
					name: "required",
					photo: "required",
					
					message: {
						required: true,
						minlength: 5
					}
				},
				messages: {
					name: "ავტორის სახელის შეყვანა აუცილებელია",
					email: "",
					message: "განცხადების შეყვანა აუცილებელია",
					photo: "ფოტოს ატვირთვა აუცილებელია"
				},				
			});
		}
	};
	contactForm();
});