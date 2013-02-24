(function( $, mw ) {

var ticp = {

	init: function() {
		ticp.addNewDropDown( $( $.find( '.ticp' ) ).attr( 'top_cat' ), 1 );
	},

	addNewDropDown: function( categoryName, position ) {
		$.ajax({
			url: mw.util.wikiScript( 'api' ),
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
					select.append( $('<option></option>').html( '-' ) );
					$.each( data.query.categorymembers, function( i, member ) {
						categoryName = member.title.replace( 'Category:', '' );
						select.append(
							$('<option></option>').val( categoryName ).html( categoryName )
						);
					});
					select.bind('change', ticp.loadnext );
					$( $.find( '.ticp' ) ).append( select );
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

	loadnext: function() {
		_this = $( this );
		selectedText = _this.find( ":selected" ).text();
		dropdownId = parseInt( _this.attr( 'dropdownId' ) );
		ticp.removeInvalidDropDowns( dropdownId + 1 );
		if ( selectedText !== '-' ) {
			ticp.addNewDropDown( selectedText, dropdownId + 1 );
			ticp.setFormInputValue( selectedText );
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
	}

};

ticp.init();

} )( jQuery, mediaWiki );
