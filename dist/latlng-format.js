/****************************************************************************
latlng-format, a class to validate, format, and transform positions (eq. leaflet LatLng)

    (c) 2015, FCOO

    https://github.com/fcoo/latlng-format
    https://github.com/fcoo

****************************************************************************/

(function ($, window/*, document, undefined*/) {
    "use strict";

    //Options for the tree posible formats. Placed in seperate namespace
    window.LATLNGFORMAT_DMSS = 0; //Degrees Minutes Seconds Decimal Seconds: N65d30'15.3"  d='degree sign'
    window.LATLNGFORMAT_DMM  = 1; //Degrees Decimal minutes                : N65d30.258'
    window.LATLNGFORMAT_DD   = 2; //Decimal degrees                        : N41.1234d

    //Determinate the decimal separator. Only "." or "," are used even that Windows (apparantly) accepts up to tree chars
    var n = 1.1;
    n = n.toLocaleString();
    window.LATLNGFORMAT_DEFAULTDECIMALSEPARATOR =
        n.indexOf('.') > -1 ? '.' :
        n.indexOf(',') > -1 ? ',' :
        '.';

    // _split - Input: position (number) Return: {hemisphere, degrees, degreesDecimal, minutes, minutesDecimal, seconds, secondsDecimal}
    function _split( position ){
        var result = {};
        result.hemisphere = position >= 0 ? +1 : -1;
        position = Math.abs(position);
        result.degrees = Math.floor(position);
        result.degreesDecimal = Math.min(9999, Math.round((position - result.degrees)*10000) );

        position = position*60 % 60; //Minutes
        result.minutes = Math.floor(position);
        result.minutesDecimal = Math.min( 999, Math.round((position - result.minutes)*1000) );

        position = position*60 % 60; //seconds
        result.seconds = Math.floor(position);
        result.secondsDecimal = Math.min( 9, Math.floor/*round*/((position - result.seconds)*10) );


        return result;
    }

    /**********************************************************************
    LatLngFormat( formatId )
    **********************************************************************/
    function LatLngFormat( formatId ){
        this.options = {
            decimalSeparator: window.LATLNGFORMAT_DEFAULTDECIMALSEPARATOR,
            degreeChar            : '&#176;' //or '&deg;'
        };

        this.setFormat( formatId );
    }

  // expose access to the constructor
  window.LatLngFormat = LatLngFormat;


    //Extend the prototype
    window.LatLngFormat.prototype = {

        //**********************************************************
        //setFormat
        setFormat: function( formatId ){
            this.options.formatId = formatId;
            this._updateFormat();
        },

        //**********************************************************
        //setDecimalSeparator
        setDecimalSeparator: function( decimalSeparator ){
            this.options.decimalSeparator = decimalSeparator;
            this._updateFormat();
        },

        //**********************************************************
        //valid - Return true if the input is a valid position
        valid   : function( latLng ){ return Array.isArray(latLng) ? [ this.validLat(latLng[0]), this.validLng(latLng[1]) ] : []; },
        validLat: function( lat )   { return this._valid( 0, lat ); },
        validLng: function( lng )   { return this._valid( 1, lng ); },

        //**********************************************************
        //textToDegrees - Converts value (string masked as editMask) to decimal degrees.
        textToDegrees   : function( values ){ return Array.isArray(values) ? [ this.textToDegreesLat(values[0]), this.textToDegreesLng(values[1]) ] : []; },
        textToDegreesLat: function( value  ){ return this._textToDegrees( 0, value ); },
        textToDegreesLng: function( value  ){ return this._textToDegrees( 1, value ); },

        //**********************************************************
        //format - Converts number value (signed decimal degrees) to a string, using this.displayMask or this.editMask
        format   : function( latLng, useEditMask ){ return Array.isArray(latLng) ? [ this.formatLat(latLng[0], useEditMask), this.formatLng(latLng[1], useEditMask) ] : []; },
        formatLat: function( lat, useEditMask    ){ return this._format( 0, lat, useEditMask ); },
        formatLng: function( lng, useEditMask    ){ return this._format( 1, lng, useEditMask ); },

        //**********************************************************
        //convert - If value is valid in orgLatlngFormat => convert it to this' format and return it as text-string, else return original input-string
        convert   : function( values, orgLatLngFormat ){ return Array.isArray(values) ? [ this.convertLat(values[0], orgLatLngFormat), this.convertLng(values[1], orgLatLngFormat) ] : []; },
        convertLat: function( value, orgLatLngFormat  ){ return this._convert( 0, value, orgLatLngFormat ); },
        convertLng: function( value, orgLatLngFormat  ){ return this._convert( 1, value, orgLatLngFormat ); },

        //**********************************************************
        //asText DEPRECATED
        asText   : function( latLng, useEditMask ){ return this.format   ( latLng, useEditMask ); },
        asTextLat: function( lat, useEditMask    ){ return this.formatLat( lat,    useEditMask ); },
        asTextLng: function( lng, useEditMask    ){ return this.formatLng( lng,    useEditMask ); },


        //**********************************************************
        //_valid - Return true if the positionInput is a valid position
        _valid: function(regexpIndex, value){
            //The regexp is prefixed with ^(?: and suffixed with )$ to make it full-match-only.
            return (new RegExp( '^(?:' + this.options.regexp[regexpIndex] + ')$' )).test(value);
        },

        //**********************************************************
        //_ textToDegrees - Converts value (string masked as editMask) to decimal degrees.
        //Using convertMask to convert the different part of the text. Any space is ignored
        _textToDegrees: function(regexpIndex,  value){
            //toDecimal - Convert a integer value v to a decimal. Eq    toDecimal(89)    = 0.89, toDecimal(9) = 0.9, toDecimal(1234)    = 0.1234
            function toDecimal(v) {
                var l = v.toString().length;
                return v / Math.pow(10, l);
            }

            value = value.toUpperCase().trim();
            if ((value === '') || !this._valid(regexpIndex,  value))
                return null;

            //Convert N or E to +1 and S or W to -1
            var sign = 1;
            if ( (value.indexOf('S') > -1) || (value.indexOf('W') > -1) )
                sign = -1;

            var split = value.split(/\D/),
                    result = 0,
                    convertMaskIndex = 0,
                    i, nextValue;
            for (i=0; i<split.length; i++ ){
                nextValue = parseInt(split[i]);
                if (!isNaN(nextValue)){
                    switch (this.options.convertMask[convertMaskIndex]){
                        case 'DDD' : result = result + nextValue;                 break;
                        case 'MM'  : result = result + nextValue/60;              break;
                        case 'mmm' : result = result + toDecimal(nextValue)/60;   break;
                        case 's'   : result = result + toDecimal(nextValue)/3600; break;
                        case 'SS'  : result = result + nextValue/3600;            break;
                        case 'dddd': result = result + toDecimal(nextValue);      break;
                    }
                    convertMaskIndex++;
                    if (convertMaskIndex >= this.options.convertMask.length)
                        break;
                }
            }
            return sign*result;
        },

        //**********************************************************
        //_format - Converts numberValue (signed decimal degrees) to a string, using this.displayMask or this.editMask
        _format: function(regexpIndex, numberValue, useEditMask){
            function trim(value, lgd)  {var result = ''+value; while (result.length < lgd) result = '0'+result; return result; }
            function append(value, lgd){var result = ''+value; while (result.length < lgd) result = result+'0'; return result; }

            if (typeof numberValue != 'number')
                return '';

            var parts = _split(numberValue);
            var result = (useEditMask ? this.options.editMask : this.options.displayMask).replace('H', regexpIndex ? (parts.hemisphere == 1 ? 'E' : 'W') : (parts.hemisphere == 1 ? 'N' : 'S') );
            result = result.replace(/DDD/ , parts.degrees                   );
            result = result.replace(/dddd/, append(parts.degreesDecimal,4)  );
            result = result.replace(/MM/  , trim(parts.minutes, 2)          );
            result = result.replace(/mmm/ , append(parts.minutesDecimal, 3) );
            result = result.replace(/SS/  , trim(parts.seconds, 2)          );
            result = result.replace(/s/   , trim(parts.secondsDecimal, 1)   );
            return result;
        },


        //**********************************************************
        //_convert - If value is valid in orgLatlngFormat => convert it to this' format and return it as text-string, else return original input-string
        _convert: function( regexpIndex, value, orgLatLngFormat){
            if (orgLatLngFormat && orgLatLngFormat._valid( regexpIndex, value )){
                var numberValue = orgLatLngFormat._textToDegrees( regexpIndex, value );
                return this._format( regexpIndex, numberValue, true/*useEditMask*/);
            }
            return value;
        },


        //**********************************************************
        //_updateFormat - Create editMask,convertMask, regexp, placeholder in options based on options.formatId and options.decimalSeparator
        _updateFormat: function(){

            /*********************************************************
            Regular expressions for different type of position input
            The regexp are 'build' using regexp for the sub-parts:
                H=Hemisphere        : [n,N,s,S]
                DD=Degrees          : 0-9, 00-09, 10-89
                dddd=Degrees decimal: 0-9999
                MM=Minutes          : 0-9, 00-09, 10-59
                SS=Seconds          : 0-59
                .=seperator         : blank, "." or ","
                mmm=decimal min     :    0-999
            *********************************************************/
            var _regexp = {
                anySpace      : '\\s*',
                hemisphereLat : '([nNsS])?',    //H=Hemisphere  : [n,N,s,S] (optional,
                hemisphereLong: '([eEwW])?',    //H=Hemisphere : [e,E,w,W] (optional,

                DD            : '((0?[0-9])|[1-8][0-9])',  //DD=Degrees 0-89        :    0-9, 00-09 or 10-89
                DDD           : '((\\d?\\d)|1[0-7][0-9])', //DDD=Degrees 0-179    :    0-9, 00-99 or 100-179

                MM            : '\\s' + '((0?[0-9])|[1-5][0-9])', //MM=Minutes: 0-9, 00-09 or 10-59 (allways with a seperator in front)
            };
            _regexp.SS        = _regexp.MM;
            _regexp.seperator = _regexp.anySpace + '[\\s\\.,]' + _regexp.anySpace; //seperator: blank, "." or ",". Allow any number of spac,

            _regexp.dddd      = '(' + _regexp.seperator + '\\d{1,4}' + ')?'; //dddd=decimal degrees (0-9999) optional

            _regexp.MMmmm     = '(' + _regexp.MM + '(' + _regexp.seperator + '\\d{1,3}' + ')?' + ')?';                           //MMmmm=Minutes and Decimal minutes = [MM[0-999]]
            _regexp.MMSSs     = '(' + _regexp.MM + '(' + _regexp.SS + '(' + _regexp.seperator + '\\d{1,1}' + ')?' + ')?' + ')?'; //MMSSss= Minutes Second and Decimal Seconds = [MM[ SS[0-99]]]

            var dS = this.options.decimalSeparator,
                dC = this.options.degreeChar,
                newOptions = {};

            switch (this.options.formatId){
                case window.LATLNGFORMAT_DMSS:
                    newOptions = { //Degrees Minutes Seconds (N41d25'01")
                        displayMask: "DDD"+dC+"MM'SS"+dS+"s\"H",
                        editMask   : "DDD MM SS"+dS+"sH",
                        convertMask: ['DDD', 'MM', 'SS', 's'],
                        regexp     : [ _regexp.anySpace + '(90|'  + _regexp.DD  + _regexp.anySpace + _regexp.MMSSs + ')' + _regexp.anySpace + _regexp.hemisphereLat  + _regexp.anySpace,
                                       _regexp.anySpace + '(180|' + _regexp.DDD + _regexp.anySpace + _regexp.MMSSs + ')' + _regexp.anySpace + _regexp.hemisphereLong + _regexp.anySpace  ],
                        placeholder: ["89 59 59"+dS+"9N", "179 59 59"+dS+"9E"],
                    };
                    break;

                case window.LATLNGFORMAT_DMM:
                    newOptions = { //Degrees Decimal minutes (N41d25.123')
                        displayMask: "DDD"+dC+"MM"+dS+"mmm'H",
                        editMask   : "DDD MM"+dS+"mmmH",
                        convertMask: ['DDD', 'MM', 'mmm'],
                        regexp     : [ _regexp.anySpace + '(90|'  + _regexp.DD  + _regexp.anySpace + _regexp.MMmmm + ')' + _regexp.anySpace + _regexp.hemisphereLat  + _regexp.anySpace,
                                       _regexp.anySpace + '(180|' + _regexp.DDD + _regexp.anySpace + _regexp.MMmmm + ')' + _regexp.anySpace + _regexp.hemisphereLong + _regexp.anySpace  ],
                        placeholder: ["89 59"+dS+"999N", "179 59"+dS+"999E"],
                    };
                    break;

                case window.LATLNGFORMAT_DD:
                    newOptions = { //Decimal degrees (N41.1234d)
                        displayMask: "DDD"+dS+"dddd"+dC+"H",
                        editMask   : "DDD"+dS+"ddddH",
                        convertMask: ['DDD', 'dddd'],
                        regexp     : [ _regexp.anySpace + '(90|'  + _regexp.DD  + _regexp.anySpace + _regexp.dddd + ')' + _regexp.anySpace + _regexp.hemisphereLat  + _regexp.anySpace,
                                       _regexp.anySpace + '(180|' + _regexp.DDD + _regexp.anySpace + _regexp.dddd + ')' + _regexp.anySpace + _regexp.hemisphereLong + _regexp.anySpace  ],
                        placeholder: ["89.9999N", "179.9999E"],
                    };
                    break;
            }

            $.extend( this.options, newOptions );
        }
    };

}(jQuery, this, document));