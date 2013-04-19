(function( $ ) {

var counter = 1, counterA = 1;
var ticp = {

	init: function( element ) {
		ticp.addNewDropDown( element, element.attr( 'top_cat' ), 1, 'type' );
	},

	addNewDropDown: function( element, categoryName, position, tdID ) {
		$.ajax({
			url: wgScriptPath + "/api.php",
			async: true,
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

	addCategoryTree: function( categoryName, options, offset, callback ) {
		$.ajax({
			url: wgScriptPath + "/api.php",
			async: true,
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
				console.log(counterA);
					if (data.query.categorymembers.length == 0 ) {
						counterA--;
						if ( counterA == 0 ) {
							callback();
							counterA = 1;
						}
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
						counterA++;
						ticp.addCategoryTree( subCategoryName, options, offset, callback );
					});
					counterA--;
					if ( counterA == 0 ) {
						callback();
						counterA = 1;
					}
				}
			}
		});
	},

	addDescendantsAndDirectChildren: function( categoryName, options, firstcall, callback ) {
		$.ajax({
			url: wgScriptPath + "/api.php",
			async: true,
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
					if ( firstcall ) {
						$.each( data.query.categorymembers, function( i, member ) {
							subCategoryName = member.title.replace( 'Category:', '' );
							counter++;
							ticp.addDescendantsAndDirectChildren( subCategoryName, options, false, callback );
						});
					}
					counter--;
					if (data.query.categorymembers.length == 0 && !firstcall) {
						options.push( $('<option></option>').val( categoryName ).html( categoryName ) );
					}
					if ( counter == 0 ) {
						callback();
						counter = 1;
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
				var options = [],
				callback = function () {
					var select = $( '<select id="ticp" dropdownId="4"></select>' );
					select.append( $('<option></option>').html( '' ) );
					$.each( options, function( index, element ) {
						select.append(element);
					});
					console.log( select );
					select.bind('change', ticp.loadnext );
					if ( select.find( 'option' ).length > 1 ) {
						element.find( 'tr.headers' ).find( '#productid' ).show();
						if ( element.find( 'tr.dropdowns' ).attr( 'disable_fourth_dropdown' ) == 1 ) {
							select.attr( 'disabled', 'disabled' );
						}
						element.find( 'tr.dropdowns' ).append( $( '<td/>' ) .append( select ) );
					}
				};
				ticp.addDescendantsAndDirectChildren( selectedText, options, true, callback );
			} else if ( dropdownId === 2 ) {
				var optionsA = [], offset = -1,
				callbackA = function () {
					var selectA = $( '<select id="ticp" dropdownId="3"></select>' );
					selectA.append( $('<option></option>').html( '' ) );
					$.each( optionsA, function( index, element ) {
						selectA.append(element);
					});
					selectA.bind('change', ticp.loadnext );
					if ( selectA.find( 'option' ).length > 1 ) {
						element.find( 'tr.headers' ).find( '#category' ).show();
						element.find( 'tr.dropdowns' ).append( $( '<td/>' ) .append( selectA ) );
					} else {
						element.parent().find(".ticp-warning").show("slow");
					}

					// code to show last dropdown
					var optionsB = [],
					callbackB = function () {
						var selectB = $( '<select id="ticp" dropdownId="4"></select>' );
						selectB.append( $('<option></option>').html( '' ) );
						$.each( optionsB, function( index, element ) {
							selectB.append(element);
						});
						selectB.bind('change', ticp.loadnext );
						if ( selectB.find( 'option' ).length > 1 ) {
							element.find( 'tr.headers' ).find( '#productid' ).show();
							if ( element.find( 'tr.dropdowns' ).attr( 'disable_fourth_dropdown' ) == 1 ) {
								selectB.attr( 'disabled', 'disabled' );
							}
							element.find( 'tr.dropdowns' ).append( $( '<td/>' ) .append( selectB ) );
						}
					};
					ticp.addDescendantsAndDirectChildren( selectedText, optionsB, true, callbackB );
				};
				ticp.addCategoryTree( selectedText, optionsA, offset, callbackA );
			} else if ( dropdownId == 3 ) {
				var optionsC = [],
				callbackC = function () {
					var selectC = $( '<select id="ticp" dropdownId="4"></select>' );
					selectC.append( $('<option></option>').html( '' ) );
					$.each( optionsC, function( index, element ) {
						selectC.append(element);
					});
					selectC.bind('change', ticp.loadnext );
					if ( selectC.find( 'option' ).length > 1 ) {
						element.find( 'tr.headers' ).find( '#productid' ).show();
						if ( element.find( 'tr.dropdowns' ).attr( 'disable_fourth_dropdown' ) == 1 ) {
							selectC.attr( 'disabled', 'disabled' );
						}
						element.find( 'tr.dropdowns' ).append( $( '<td/>' ) .append( selectC ) );
					} else {
						element.parent().find(".ticp-warning").show("slow");
					}
				};
				ticp.addDescendantsAndDirectChildren( selectedText, optionsC, true, callbackC );
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
