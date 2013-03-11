(function( $, mw ) {

var ticp = {

	init: function( element ) {
		ticp.addNewDropDown( element, element.attr( 'top_cat' ), 1 );
	},

	addNewDropDown: function( element, categoryName, position ) {
		$.ajax({
			url: wgScriptPath + "/api.php",
			async: false,
			data: {
				// For parameter documentation, visit <http://en.wikipedia.org/w/api.php> and then search for "list=categorymembers"
				format: 'json',
				action: 'query',
				list: 'categorymembers',
				cmtitle: 'Category:' + categoryName,
				cmtype: 'subcat',
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
						element.append( select );
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
				cmtype: 'subcat',
			},
			dataType: 'json',
			type: 'GET',
			success: function( data ) {
				if ( data && data.query && data.query.categorymembers ) {
					if (data.query.categorymembers.length == 0 ) {
						return;
					}
					if( offset !== -1 )
						options.push( $('<option></option>').val( categoryName ).html( offset + categoryName ) );

					$.each( data.query.categorymembers, function( i, member ) {
						subCategoryName = member.title.replace( 'Category:', '' );
						if( offset == -1 ) {
							offset = '';
						} else {
							offset = offset  + '&nbsp;';
						}
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
				cmtype: 'subcat',
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
		element = $( this ).parent();
		element.parent().find(".ticp-warning").hide("slow");
		_this = $( this );
		selectedText = _this.find( ":selected" ).val();
		dropdownId = parseInt( _this.attr( 'dropdownId' ) );
		ticp.removeInvalidDropDowns( element, dropdownId + 1 );
		if ( selectedText !== '' ) {
			if( dropdownId < 2 ) {
				ticp.addNewDropDown( element, selectedText, dropdownId + 1 );
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
					element.append( select );
				} else {
					element.parent().find(".ticp-warning").show("slow");
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
					element.append( select );
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
		element.find( 'select' ).each( function( i, element ) {
			select = $( element );
			if ( select.attr( 'dropdownId' ) >= position ) {
				select.remove();
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
			$tree[i] = item.replace( '_', ' ' );
		});
		element.find( 'select#ticp[dropdownId="1"]' ).find( 'option[value="' + $tree[0] + '"]' ).attr( 'selected', 'selected' );

		if ( $tree.length > 2 ) {
			$( 'select#ticp[dropdownId="1"]' ).trigger( 'change', function () {
				$( 'select#ticp[dropdownId="2"]' ).find( 'option[value="' + $tree[1] + '"]' ).attr( 'selected', 'selected' );
			});
		}

		// going from rear as we always ignore the middle categories and don't have dropdowns for them
		if ( $tree.length > 3 ) {
			$( 'select#ticp[dropdownId="2"]' ).trigger( 'change', function () {
				$( 'select#ticp[dropdownId="3"]' ).find( 'option[value="' + $tree[ $tree.length -2 ] + '"]' ).attr( 'selected', 'selected' );
			});
		}

		if ( $tree.length > 4 ) {
			$( 'select#ticp[dropdownId="3"]' ).trigger( 'change', function () {
				$( 'select#ticp[dropdownId="4"]' ).find( 'option[value="' + $tree[ $tree.length -1 ] + '"]' ).attr( 'selected', 'selected' );
			});
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
} )( jQuery, mediaWiki );
