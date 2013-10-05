var General = {
	login: function() {
		var dialog = $('<div>');
		dialog.html('<form id="webLogin"><table><tbody><tr><td><label for="username">Username:&nbsp;</label></td><td width="100%"><input id="username" type="text" name="user" style="width:100%"></td></tr><tr><td><label for="password">Password:&nbsp;</label></td><td><input id="password" type="password" name="pass" style="width:100%"></td></tr><tr><td colspan="2" id="response"><input type="submit" style="position: absolute; left: -99px"/><!--hide from most browsers--></td></tr></tbody></table></form>')
			.attr('title','Web Administration Login')
			.dialog({ resizable: false, draggable: false, modal: true, closeOnEscape: false,
				buttons: General.buttonObject,
				open: function(event, ui) { 
					$('.ui-dialog-titlebar-close').hide();
					$('#webLogin', dialog).validate({
						rules: {
							user: { required: true, minlength: 2 },
							pass: { required: true, minlength: 2 }
						},
						submitHandler: function(form) {
							dialog.dialog('option', 'buttons', { } );
							
							// secure login here? -- WORK ON ASAP
							$.ajax({
								url:'/user.php',
								data: 'action=login&user=' + form.user.value + '&pass=' + form.pass.value + '&referer=blank',
								dataType:'json',
								success:function(json){
									$( '#response', '#webLogin' ).html( json.msg );
									
									if ( json.reload ) {
										setTimeout("window.location.reload();", 1000);
									} else {
										setTimeout("$('#response', '#webLogin').html('')", 4000);
										$('#password').val('');
										dialog.dialog('option', 'buttons', General.buttonObject );
									}
								}
							});
						}
					});
				},
				close: function() { dialog.dialog( 'destroy' ); dialog.remove(); }
			});
		return false;
	},
	logout: function() {
		var dialog = $('<div>');
		dialog.html('<form id="webLogout"><div id="response"></div></form>')
			.attr('title','Web Administration Logout')
			.dialog({ resizable: false, draggable: false, modal: true, closeOnEscape: false,
				buttons: {
					'Logout': function() {
						dialog.dialog('option', 'buttons', { } )
						
						$.ajax({
							url:'/user.php',
							data: 'action=logout&referer=blank',
							dataType:'json',
							success:function(json){
								$('#response', '#webLogout').html(json.msg);
								setTimeout("window.location.reload();", 1000); // remove query string here
								//dialog.dialog('close');
							}
						});//*/
					},
					Cancel: function() {
						dialog.dialog('close');
					}
				},
				open: function(event, ui) { $('.ui-dialog-titlebar-close').hide(); },
				close: function() { dialog.dialog( 'destroy' ); dialog.remove(); }
			});
		return false;
	},
	buttonObject: {
		'Login': function() {
			$('#webLogin', this).submit();
		},
		Cancel: function() {
			$(this).dialog('close');
		}
	}
};

//<form id="webLogin" action="/user.php" method="post" name="webLogin"><input type="hidden" name="direct" value="true"><input type="hidden" name="action" value="logout">
//<h3>Web Administration Logout</h3>
//<input type="submit" value="Logout"></form>