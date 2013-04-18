(function( $ ) {

var ticp = {

	init: function( element ) {
		ticp.addNewDropDown( element, element.attr( 'top_cat' ), 1, 'type' );
	},

	addNewDropDown: function( element, categoryName, position, tdID ) {
		$.ajax({
			url: wgScriptPath + "/api.php",
			async: false,
			data: {
				// For parameter documentation, visit <http://en.wikipedia.org/w/api.php> and then search for "list=categorymembers"
				format: 'json',
				action: 'query',
				list: 'categorymembers',
				cmtitle: 'Category:' + categoryName,
				cmnamespace: 14,
				cmlimit: 100000
			},
			dataType: 'json',
			type: 'GET',
			success: function( data ) {
				if ( data && data.query && data.query.categorymembers ) {
					var select = $( '<select id="ticp" dropdownId="'+ position +'"></select>' );
					select.append( $('<option></option>').html( '' ) );
					$.each( data.query.categorymembers, function( i, member ) {
						subCategoryName = member.title.replace( 'Category:', '' );
						select.append(
							$('<option></option>').val( subCategoryName ).html( subCategoryName )
						);
					});
					select.bind('change', ticp.loadnext );
					if ( select.find( 'option' ).length > 1 ) {
						element.find( 'tr.headers' ).find( '#'+tdID ).show();
						element.find( 'tr.dropdowns' ).append( $( '<td/>' ) .append( select ) );
					} else {
						element.find( ".ticp-warning" ).show("slow");
					}
				} else if ( data && data.error ) {
					// Will this ever happen??
					alert( 'Error: API returned error code "' + data.error.code + '": ' + data.error.info );
				} else {
					alert( 'Error: Unknown result from API.' );
				}
			},
			error: function( xhr ) {
				// ... error ...
			}
		});
	},

	addCategoryTree: function( categoryName, options, offset ) {
		$.ajax({
			url: wgScriptPath + "/api.php",
			async: false,
			data: {
				// For parameter documentation, visit <http://en.wikipedia.org/w/api.php> and then search for "list=categorymembers"
				format: 'json',
				action: 'query',
				list: 'categorymembers',
				cmtitle: 'Category:' + categoryName,
				cmnamespace: 14,
				cmlimit: 100000
			},
			dataType: 'json',
			type: 'GET',
			success: function( data ) {
				if ( data && data.query && data.query.categorymembers ) {
					if (data.query.categorymembers.length == 0 ) {
						return;
					}
					if ( offset !== -1 )
						options.push( $('<option></option>').val( categoryName ).html( offset + categoryName ) );

					if ( offset == -1 ) {
						offset = '';
					} else {
						offset = offset  + '&nbsp;&nbsp;&nbsp;';
					}
					$.each( data.query.categorymembers, function( i, member ) {
						subCategoryName = member.title.replace( 'Category:', '' );
						ticp.addCategoryTree( subCategoryName, options, offset );
					});
				}
			}
		});
	},

	addDescendantsAndDirectChildren: function( categoryName, options, firstcall ) {
		$.ajax({
			url: wgScriptPath + "/api.php",
			async: false,
			data: {
				// For parameter documentation, visit <http://en.wikipedia.org/w/api.php> and then search for "list=categorymembers"
				format: 'json',
				action: 'query',
				list: 'categorymembers',
				cmtitle: 'Category:' + categoryName,
				cmnamespace: 14,
				cmlimit: 100000
			},
			dataType: 'json',
			type: 'GET',
			success: function( data ) {
				if ( data && data.query && data.query.categorymembers ) {
					if (data.query.categorymembers.length == 0 ) {
						options.push( $('<option></option>').val( categoryName ).html( categoryName ) );
						return;
					}
					if ( firstcall ) {
						$.each( data.query.categorymembers, function( i, member ) {
							subCategoryName = member.title.replace( 'Category:', '' );
							ticp.addDescendantsAndDirectChildren( subCategoryName, options, false );
						});
					}
				}
			}
		});
	},

	loadnext: function( e, callback ) {
		element = $( this ).closest( '.ticp' );
		element.parent().find(".ticp-warning").hide("slow");
		_this = $( this );
		selectedText = _this.find( ":selected" ).val();
		dropdownId = parseInt( _this.attr( 'dropdownId' ) );
		ticp.removeInvalidDropDowns( element, dropdownId + 1 );
		if ( selectedText !== '' ) {
			if( dropdownId < 2 ) {
				ticp.addNewDropDown( element, selectedText, dropdownId + 1, 'family' );

				// code to show last dropdown
				var options = [];
				ticp.addDescendantsAndDirectChildren( selectedText, options, true );
				var select = $( '<select id="ticp" dropdownId="4"></select>' );
				select.append( $('<option></option>').html( '' ) );
				$.each( options, function( index, element ) {
					select.append(element);
				});
				select.bind('change', ticp.loadnext );
				if ( select.find( 'option' ).length > 1 ) {
					element.find( 'tr.headers' ).find( '#productid' ).show();
					if ( element.find( 'tr.dropdowns' ).attr( 'disable_fourth_dropdown' ) == 1 ) {
						select.attr( 'disabled', 'disabled' );
					}
					element.find( 'tr.dropdowns' ).append( $( '<td/>' ) .append( select ) );
				}
			} else if ( dropdownId === 2 ) {
				var options = [], offset = -1;
				ticp.addCategoryTree( selectedText, options, offset );
				var select = $( '<select id="ticp" dropdownId="3"></select>' );
				select.append( $('<option></option>').html( '' ) );
				$.each( options, function( index, element ) {
					select.append(element);
				});
				select.bind('change', ticp.loadnext );
				if ( select.find( 'option' ).length > 1 ) {
					element.find( 'tr.headers' ).find( '#category' ).show();
					element.find( 'tr.dropdowns' ).append( $( '<td/>' ) .append( select ) );
				} else {
					element.parent().find(".ticp-warning").show("slow");
				}


				// code to show last dropdown
				var options = [];
				ticp.addDescendantsAndDirectChildren( selectedText, options, true );
				var select = $( '<select id="ticp" dropdownId="4"></select>' );
				select.append( $('<option></option>').html( '' ) );
				$.each( options, function( index, element ) {
					select.append(element);
				});
				select.bind('change', ticp.loadnext );
				if ( select.find( 'option' ).length > 1 ) {
					element.find( 'tr.headers' ).find( '#productid' ).show();
					if ( element.find( 'tr.dropdowns' ).attr( 'disable_fourth_dropdown' ) == 1 ) {
						select.attr( 'disabled', 'disabled' );
					}
					element.find( 'tr.dropdowns' ).append( $( '<td/>' ) .append( select ) );
				}
			} else if ( dropdownId == 3 ) {
				var options = [];
				ticp.addDescendantsAndDirectChildren( selectedText, options, true );
				var select = $( '<select id="ticp" dropdownId="4"></select>' );
				select.append( $('<option></option>').html( '' ) );
				$.each( options, function( index, element ) {
					select.append(element);
				});
				select.bind('change', ticp.loadnext );
				if ( select.find( 'option' ).length > 1 ) {
					element.find( 'tr.headers' ).find( '#productid' ).show();
					if ( element.find( 'tr.dropdowns' ).attr( 'disable_fourth_dropdown' ) == 1 ) {
						select.attr( 'disabled', 'disabled' );
					}
					element.find( 'tr.dropdowns' ).append( $( '<td/>' ) .append( select ) );
				} else {
					element.parent().find(".ticp-warning").show("slow");
				}
			}
			ticp.setFormInputValue( element, selectedText );

			if( typeof callback === "function" ) {
				callback();
			}
		}
	},

	removeInvalidDropDowns: function( element, position ) {
		element.find( 'select' ).each( function( i, el ) {
			select = $( el );
			if ( select.attr( 'dropdownId' ) >= position ) {
				select.parent().remove();
				element.find( 'tr.headers' ).find( 'th.'+ select.attr( 'dropdownId' ) ).hide();
			}
		});
	},

	setFormInputValue: function( element, category ) {
		element.find( '.ticp-input' ).val( category );
	},

	setCurrentValue: function( element ) {
		var j = 0;
		$tree = JSON.parse( element.attr( 'current_category_tree' ) );
		$.each( $tree, function ( i, item ) {
			$tree[i] = item.replace( /_/g, ' ' );
		});

		// set dropdowns values
		element.find( 'select#ticp[dropdownId="1"]' ).find( 'option[value="' + $tree[0] + '"]' ).attr( 'selected', 'selected' );
		element.find( 'select#ticp[dropdownId="1"]' ).trigger( 'change');

		if ( $tree.length >= 2 ) {
			element.find( 'select#ticp[dropdownId="2"]' ).find( 'option[value="' + $tree[1] + '"]' ).attr( 'selected', 'selected' );
			element.find( 'select#ticp[dropdownId="2"]' ).trigger( 'change' );
		}

		// going from rear as we always ignore the middle categories and don't have dropdowns for them
		if ( $tree.length >= 3 ) {
			if ( $tree.length == 3 ) {
				value = $tree[$tree.length-1];
			} else {
				value = $tree[$tree.length-2];
			}
			element.find( 'select#ticp[dropdownId="3"]' ).find( 'option[value="' + value + '"]' ).attr( 'selected', 'selected' );
			element.find( 'select#ticp[dropdownId="3"]' ).trigger( 'change' );
		}

		if ( $tree.length >= 4 ) {
			element.find( 'select#ticp[dropdownId="4"]' ).find( 'option[value="' + $tree[ $tree.length - 1 ] + '"]' ).attr( 'selected', 'selected' );
			element.find( 'select#ticp[dropdownId="4"]' ).trigger( 'change' );
		}
	}

};

// Jquery plugin for this extension
(function($) {

	$.fn.ticp = function( ) {
		ticp.init( this );
		ticp.setCurrentValue( this );
		return this;
	}
})($);

window.TICP = function( input_id ) {
	$( '#' + input_id ).parent().ticp();
}
} )( jQuery );
