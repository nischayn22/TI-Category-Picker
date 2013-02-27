(function( $, mw ) {

var ticp = {

	init: function() {
		ticp.addNewDropDown( $( $.find( '.ticp' ) ).attr( 'top_cat' ), 1 );
	},

	addNewDropDown: function( categoryName, position ) {
		$.ajax({
			url: mw.util.wikiScript( 'api' ),
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
						$( $.find( '.ticp' ) ).append( select );
					} else {
						alert( 'no more categories' );
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
			url: mw.util.wikiScript( 'api' ),
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
							offset = offset  + '&nbsp;&nbsp;';
						}
						ticp.addCategoryTree( subCategoryName, options, offset );
					});
				}
			}
		});
	},

	addDescendants: function( categoryName, options ) {
		$.ajax({
			url: mw.util.wikiScript( 'api' ),
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

					$.each( data.query.categorymembers, function( i, member ) {
						subCategoryName = member.title.replace( 'Category:', '' );
						ticp.addDescendants( subCategoryName, options );
					});
				}
			}
		});
	},

	loadnext: function( e, callback ) {
		_this = $( this );
		selectedText = _this.find( ":selected" ).val();
		dropdownId = parseInt( _this.attr( 'dropdownId' ) );
		ticp.removeInvalidDropDowns( dropdownId + 1 );
		if ( selectedText !== '' ) {
			if( dropdownId < 2 ) {
				ticp.addNewDropDown( selectedText, dropdownId + 1 );
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
					$( $.find( '.ticp' ) ).append( select );
				} else {
					alert( 'no more categories' );
				}
			} else if ( dropdownId == 3 ) {
				var options = [];
				ticp.addDescendants( selectedText, options );
				var select = $( '<select id="ticp" dropdownId="4"></select>' );
				select.append( $('<option></option>').html( '' ) );
				$.each( options, function( index, element ) {
					select.append(element);
				});
				select.bind('change', ticp.loadnext );
				if ( select.find( 'option' ).length > 1 ) {
					$( $.find( '.ticp' ) ).append( select );
				} else {
					alert( 'no more categories' );
				}
			}
			ticp.setFormInputValue( selectedText );

			if( typeof callback === "function" ) {
				callback();
			}
		}
	},

	removeInvalidDropDowns: function( position ) {
		$( 'select#ticp' ).each( function( i, element ) {
			select = $( element );
			if ( select.attr( 'dropdownId' ) >= position ) {
				select.remove();
			}
		});
	},

	setFormInputValue: function( category ) {
		$( '.ticp-input' ).val( category );
	},

	setCurrentValue: function() {
		var j = 0;
		$tree = JSON.parse( $( '.ticp' ).attr( 'current_category_tree' ) );
		$.each( $tree, function ( i, item ) {
			$tree[i] = item.replace( '_', ' ' );
		});
		$( 'select#ticp[dropdownId="1"]' ).find( 'option[value="' + $tree[0] + '"]' ).attr( 'selected', 'selected' );

		$( 'select#ticp[dropdownId="1"]' ).trigger( 'change', function () {
			$( 'select#ticp[dropdownId="2"]' ).find( 'option[value="' + $tree[1] + '"]' ).attr( 'selected', 'selected' );
		});

		$( 'select#ticp[dropdownId="2"]' ).trigger( 'change', function () {
			$( 'select#ticp[dropdownId="3"]' ).find( 'option[value="' + $tree[ $tree.length -2 ] + '"]' ).attr( 'selected', 'selected' );
		});

		$( 'select#ticp[dropdownId="3"]' ).trigger( 'change', function () {
			$( 'select#ticp[dropdownId="4"]' ).find( 'option[value="' + $tree[ $tree.length -1 ] + '"]' ).attr( 'selected', 'selected' );
		});
	}

};

ticp.init();
ticp.setCurrentValue();
} )( jQuery, mediaWiki );
