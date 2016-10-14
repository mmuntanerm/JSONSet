


//  **********************************************************
//  ========================     test ZONE
//  **********************************************************

var Client = require('node-rest-client').Client;
var client = new Client();

// Importam la classe JSONArray
var JSONSet = require('./JSONSet.js');

var mUrl = "http://localhost:3000/mongoTR/listall";


client.get(mUrl, function (data, response) {

	var js1 = new JSONSet( data );

	my_filter = {mTipusData:'DIS', mMacro:8, mRuta:1, minFrj:0}	;
	my_fieldFilter= {mapped_keys:["franja_horaria","TRealSS_media","TRealSS_desv"] ,mapped_by_name: true};

	js1.setRecJSONfilterKeys( my_filter);
	js1.setFieldJSONfilterKeys(my_fieldFilter);

	console.log(js1.recFilterKeys)
	console.log(js1.fieldFilterKeys)
	console.log("Total de registres de l'objecte JSON: %s ", js1.count);
	console.log("Total de registres FILTRATS de l'objecte JSON: %s ", js1.countFiltered);
	console.log(js1.dataFiltered)

	js1.toFile='./json_results/WHOLEfile.json';
	js1.toFileFiltered='./json_results/FILTEREDfile.json';

	// retorna conjunto de registros filtrados, solo los campos seleccionados
	console.log("CLAVES de los campos seleccionados, %s", js1.fieldFilterKeys.mapped_keys);

	console.log(js1.mappedFields)

	js1.toFileMappedFiltered='./json_results/MappedFILTEREDfile.json';


	// Canvi de la funció de filtre en 'calent' directament (canviam el filtre també per adaptar-lo)
	js1.setRecJSONfilterKeys( {mTipusData:'LAB', mMacro:7, mSublinea:2, mRuta:1, minFrj:0});
	console.log("Les noves claus de filtratge són:  %s", JSON.stringify(js1.recFilterKeys))
	js1.filterFunc= function(mobj, thisArg){
			    // console.log(this.mRuta)
			    // Inside the FilterFunc 'this' is referred to thisArg object
			    var sentido = this.mRuta;
			    var minFrj = this.minFrj;
			    var macro = this.mMacro;
			    var Sublinea = this.mSublinea;
			    var tpdia = this.mTipusData;
			    if ((mobj.Tipodia == tpdia) &&(mobj.Ruta == sentido) &&(mobj.Macro == macro) && (mobj.Sublinea >= Sublinea) && (mobj.franja_horaria >= minFrj) ){
			        return true;
			    }
			    else
			    {
			        return false;
			    }
			};

	console.log(js1.dataFiltered)


});
