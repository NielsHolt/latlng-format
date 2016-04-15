# latlng-format
A class to validate, format, and transform positions (eq. leaflet LatLng)

Can handle tree different formats:

1. Degrees Minutes Seconds Decimal Seconds: `N65°30'15.3"`
2. Degrees Decimal minutes: `N65°30.258'`
3. Decimal degrees: `N65.5043°`
 

## Installation
### bower
`bower install https://github.com/fcoo/latlng-format.git --save`

## Usage
```var myLatLngFormat = new LatLngFormat( formatId )```

Where `formatId`is a number between 0-2, or use one of the following const 

	window.LATLNGFORMAT_DMSS = 0; //Degrees Minutes Seconds Decimal Seconds: N65°30'15.3"
	window.LATLNGFORMAT_DMM	 = 1; //Degrees Decimal minutes				  : N65°30.258'
	window.LATLNGFORMAT_DD	 = 2; //Decimal degrees						  : N65.5043°
	
The decimal separator is automatic determinated (only `"."` or `","`) and saved as

	window.LATLNGFORMAT_DEFAULTDECIMALSEPARATOR

You can change the default decimal separator by using the method `LatLngFormat.setDecimalSeparator( char );`


### Methods

#### Change format
	LatLngFormat.setFormat( formatId );                   //Change the format. formatId = 0,1,2 
	LatLngFormat.setDecimalSeparator( decimalSeparator ); //Change the decimal separator

#### Validate and convert
All format and validation methods come in tree versions:

	LatLngFormat.METHOD = function( {(number|string)[]} ) return {(number|string|boolean)[]}
	LatLngFormat.METHODLat = function( {(number|string)} ) return {(number|string|boolean)}
	LatLngFormat.METHODLng = function( {(number|string)} ) return {(number|string|boolean)}


##### valid(..)
Input: A position as formatted string. Eq. `"N41.1234°"` 	 
Output: `{boolean}` or `{boolean[]}` if `input` is a valid position

		LatLngFormat.valid( {string[]} )
		LatLngFormat.validLat( {string} )
		LatLngFormat.validLng( {string} )
	
##### textToDegrees(..)
Converts positions as formatted string `{string}` to decimal degrees `{number}`
Input: A position as formatted string. Eq. `"N41.1234°"`
Output: Decimal degrees (`{number[]}` or `{number}`).

	LatLngFormat.textToDegrees( {string[]} )
	LatLngFormat.textToDegreesLat( {string} )
	LatLngFormat.textToDegreesLng( {string} )

##### asText(..)
Converts signed decimal degrees `({number})` to a string
Input: A position as decimal degrees (`{number[]}` or `{number}`).
Output: The position as formatted string. Eq. `"N41.1234°"`

	LatLngFormat.asText( {number[]} )
	LatLngFormat.asTextLat( {number} )
	LatLngFormat.asTextLng( {number} )

##### convert(..)
Converts between two different formats
Input: The position as formatted string in the original format and the original `LatLngFormat`
Output:The position as formatted string in the new format (= `this`)

		LatLngFormat.convert( {string[]}, {LatLngFormat} )
		LatLngFormat.convertLat( {string}, {LatLngFormat} )
		LatLngFormat.convertLng( {string}, {LatLngFormat} )

## Copyright and License
This plugin is licensed under the [MIT license](https://github.com/fcoo/latlng-format/LICENSE).

Copyright (c) 2015 [FCOO](https://github.com/FCOO)

## Contact information

[Niels Holt](https://github.com/NielsHolt)

