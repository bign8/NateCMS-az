$(document).ready(function () {
	// Drag and drop content for pages
	Editor.list = $( '.sortable' ).sortable({
		start: function (e, ui) { /*ui.placeholder.html('Content Destination');*/ }, // pretty up placeholder
		opacity: 0.6,
		cursor: 'move',
		placeholder: 'block-state-highlight',
		forcePlaceholderSize: true,
		connectWith: '.sortable',
		items: '.block-edit',
		disabled: true,
		update: Editor.orderBlock
	}).disableSelection();

	// Initialize loader content on each block location
	$('.block-edit').each(Editor.initBlock);
});

var Editor = {
	// --- VARIABLES ---
	name: 'Main Editor Object',
	version: '1.0',
	list: [],
	openEditors: [],

	// --- GENERAL EDITOR FUNCTIONS ---

	makePage: function() {
		$.ajax({
			url:'/edit.php',
			data:'action=insertPage&path=' + document.location.pathname,
			success:function(txt){
				if (txt == 'check') {
					document.location.reload();
				} else {
					alert('There has been an error with your request.\nPlease contact the developers');
				}
			}
		});
		return false;
	},

	// initBlock is called in initilize the editer on each editable block
	initBlock: function(index, that) {
		// Load block edit menu on each edit block
		$(that).prepend('<span class="controls">'+
			'<span class="edit ui-icon ui-icon-pencil" title="Edit content" onClick="Editor.editBlock(this);"></span>'+
			// '<span class="move ui-icon ui-icon-transferthick-e-w" title="Move content" style="display:none"></span>'+
			'<span class="delete ui-icon ui-icon-closethick" title="Delete coontent" onClick="Editor.removeBlock(this);" ></span>'+
		'</span>');

		// Listen to close events on each edit object
		$(that).on('closeEdit', function(evt) {
			$('.controls', evt.target).show();
			var id = $(evt.target).data('contentid'); // remove from openEditors
			var index = Editor.openEditors.indexOf( id );
			Editor.openEditors.splice( index, 1 );
			$('#orderEnable').toggle( Editor.openEditors.length == 0 ); // enable orderEnable?
		});
	},

	// Called when a user clicks the edit link on the editor menu, this hides the editer controls and enables the custom editor
	editBlock: function(that) {
		var obj = $(that).parent().parent(); // parent 1 -> .controls / parent 2 -> .block-edit
		obj.find('.controls').hide();
		obj.trigger('startEdit');
		Editor.openEditors.push( obj.data('contentid') );
		$('#orderEnable').hide(); // disable orderEnable
	},

	// Called by a button in the footer during mode=edit, this enables sortable.
	orderEnable: function() {
		$('.block-edit').trigger('enableMove');
		Editor.list.sortable('enable');
		$('.edit,.move,.delete,#orderEnable,#orderDisable').toggle();
		return false;
	},

	// called by a button in the footer during mode=edit, this saves and disables sortable
	orderDisable: function() {
		$('.block-edit').trigger('disableMove');
		Editor.list.sortable('disable');
		$('.edit,.move,.delete,#orderEnable,#orderDisable').toggle();
		return false;
	},

	// Called as the sortable callback, this iterates through all the blocks on a page and saves their order.
	orderBlock: function() {
		Editor.list.sortable('disable');
		var orders = [], data = 'action=updateOrder';
		var rotatingClass = 'ui-icon-arrowrefresh-1-n', moveIcon = 'ui-icon-transferthick-e-w';

		$('.sortable span.move').toggleClass(moveIcon + " " + rotatingClass);
		var timer = setInterval(function() {
			var old = rotatingClass;
			switch(old){
				case 'ui-icon-arrowrefresh-1-n': rotatingClass = 'ui-icon-arrowrefresh-1-e'; break;
				case 'ui-icon-arrowrefresh-1-e': rotatingClass = 'ui-icon-arrowrefresh-1-s'; break;
				case 'ui-icon-arrowrefresh-1-s': rotatingClass = 'ui-icon-arrowrefresh-1-w'; break;
				case 'ui-icon-arrowrefresh-1-w': rotatingClass = 'ui-icon-arrowrefresh-1-n'; break;
			}
			$('.sortable span.move').toggleClass(old + ' ' + rotatingClass);
		}, 100);
		
		$('.sortable').children().each(function(i, item){
			if ($(item).data('contentid') == undefined) return; // only elements with id's please
			
			parent = $(item).parent().attr('id'); // locationName,
			if (orders.hasOwnProperty(parent)) { orders[parent]++; } else { orders[parent] = 1; }
			
			data += '&data['+i+'][id]=' + $(item).data('contentid') + '&data['+i+'][ord]=' + orders[parent] + '&data['+i+'][dest]=' + parent
		});
		
		$.ajax({
			url:'/edit.php',
			data:data,
			success:function(txt){
				Editor.list.sortable('enable');
				clearInterval(timer);
				$('.sortable span.move').toggleClass(moveIcon + ' ' + rotatingClass);
				if (txt != 'check') Editor.updateError();
			}
		});
	},

	// Remove content from pages, called from the editor control menu
	removeBlock: function(that) {
		var remObj = $(that).parent().parent();
		if (remObj.data('contentid') == undefined) alert('Assert Failed! Block needs data-contentid to be deleted')

		var dialog = $('<div/>', {title: 'Delete Content?'});
		dialog.html('<span class="ui-icon ui-icon-alert" style="float:left; margin:0 7px 0 0;"></span>This item will be permanently deleted and cannot be recovered. Are you absolutely sure?')
			.dialog({ resizable: false, draggable: false, modal: true, closeOnEscape: false,
				buttons: {
					'Delete this item': function() {
						dialog.dialog('option', 'buttons', { } ).html('<div id="progress"></div>');
						var progress = $('#progress').progressbar();
						var timer = setInterval(function() {
							value = progress.progressbar('value')+1;
							progress.progressbar('value', value % 101);
						}, 10);
						$.ajax({
							url:'/edit.php',
							data:'action=removeContent&remID=' + remObj.data('contentid'),
							success:function(txt){
								if (txt != 'check') Editor.updateError();
								clearInterval(timer);
								progress.progressbar( 'destroy' );
								dialog.dialog('close');
								remObj.delay(500).fadeOut('slow', function() {$(this).remove();});
							}
						});
					},
					Cancel: function() { dialog.dialog('close'); }
				},
				open: function(event, ui) { $('.ui-dialog-titlebar-close').hide(); },
				close: function() { dialog.dialog( 'destroy' ); dialog.remove(); }
			});
	},

	// --- ADD CONTENT BLOCK FUNCTIONS ---

	// This functions opens the adding content block form
	displayAddForm: function(that) {
		$('.add-new-text', that).hide();
		$('.add-new-form', that).show();
	},

	// When the user changes selection, this loads the appropriate description
	loadDesc: function(that) {
		var val = $('option:selected', that).data('desc');
		$(that).children().first().attr('disabled', 'disabled');
		$(that).parent().find('.add-new-form-desc').html(val);
	},

	// Makes the connection to server and activley adds content to the page
	addContent: function(vfs, loc, that) {
		var val = that['type_id'].value;
		if (val == 'null') { Editor.revert(that); return false; } // User did not select anything
		
		var data = 'action=addContent&vfsID=' + vfs + '&loc=' + loc + '&blockID=' + val;
		$.ajax({
			url:'/edit.php',
			data:data,
			dataType:'json',
			success:function(json) {
				if (json.check != 'check') Editor.updateError();
				var newObj = $('#' + loc).append(json.html).fadeIn('slow').children().last(); // selects last child
				Editor.initBlock(-1, newObj); // initilized editor on newObj
				$('#' + loc + ' .add-new').appendTo('#' + loc); // move add content link to bottom

				document.location.reload(); // need to re-design here to we have forced dependencies - can't init textEdit or any specific listeners
				
				// script insertion parser
				var temp, srcObj;
				for (srcObj in json.src){
					temp = json.src[srcObj];
					if (temp.type == 'js') { // no css magic yet
						/*$.getScript(temp.script, function() {
							alert('Load Complete : ' + temp.script);
							//temp.json.load();
						});*/
						//document.writeln('<script type="text/javascript" src="'+temp.script+'"></script>');
						var script = document.createElement('script');
						script.setAttribute("type","text/javascript");
						script.setAttribute("src", temp.script);
						if (typeof script!="undefined")
							document.getElementsByTagName("head")[0].appendChild(script);
					}
				}
				
				
				Editor.revert(that);
			}
		});
		
		$('input', that).toggle();
		$('.loader', that).toggle();
		return false;
	},

	// User chooses cancle on the add element form
	revert: function(that) {
		var item = $(that).parent();
		$('.add-new-text, .add-new-form', item).toggle();
		$('.add-new-form-desc', item).html('Content type');
		$('[name="type_id"]', item).val('null');
		$('input', that).show();
		$('.loader', that).hide();
	},
	
	// --- EDITING CONTENT FUNCTIONS ---

	// Called by a custom editor, this saves content changes to the server
	updateContent: function(id, con, cb) {
		con = encodeURIComponent(con);
		var data = 'action=updateContent&cID=' + id + '&content=' + con;
		$.ajax({
			url:'/edit.php',
			data:data,
			success:function(txt){
				if (txt != 'check') Editor.updateError();
				if(typeof(cb) == 'function') cb();
			}
		});
	},

	// This occurs when there is an error updating content
	updateError: function() {
		alert('error updating\nplease refresh page');
		// ajax log call here
	}
};