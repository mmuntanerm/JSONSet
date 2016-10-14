var fs = require("fs");

// Funció de filtrat
function filtreRuta(mobj, thisArg){
    // console.log(this.mRuta)
    sentido = this.mRuta;
    minFrj = this.minFrj;
    macro = this.mMacro;
    tpdia = this.mTipusData;
    if ((mobj.Tipodia == tpdia) &&(mobj.Ruta == sentido) &&(mobj.Macro == macro) && (mobj.franja_horaria >= minFrj) ){
        return true;
    }
    else
    {
        return false;
    }
}

function JSONtoFile( JSONData , fileName ){
  // Sends JSONObject Array to a File 'fileName'
  fs.writeFile(fileName, JSON.stringify(JSONData),  function(err) {

	if (err)
         {  console.log("ERROR ESCRITURA en fichero de texto %s ERROR :%s " , fileName, err);
     		return 0;
          }
    else
         {  console.log ( "Consulta el fichero de LOG : " +  fileName );
         	return 1;
          }
    });

}

function JSON_ObjectFieldFilter(mObj, mapped , byName){
	/*
	// Retorna només els camps seleccionats d'un Objecte determinat
	// Filtra només els camps indicats a mapped (pel seu índex) si byName es false [Valor per defecte]
	// Filtra només els camps indicacts pel seu nom si byName = true;
	*/

	var byName =  byName || false; // Default Value for byName
	var fiteredObj = {};  // Objecte amb es camps filtrats
	var ky = Object.keys(mObj);  // Claves del objeto
	for (var j = 0;  j < mapped.length; j++) {

		var aname = (byName) ? mapped[j] : ky[mapped[j]];

		// console.log (aname) ;
   		fiteredObj[aname] = mObj[aname];
	}

	return fiteredObj;
}


function JSON_ArrayFieldFilter(mObjArray, mapped, byName){
	/*
	// Filtra els CAMPS  seleccionats a mapped (pel seu índex)
	// d'un Array d'objectes JSON
	//  --> fa ús de la funció JSON_ObjectFieldFilter
	*/

	var byName =  byName || false; // Default Value for byName
	var mFiltered = new Array(); // Array d'objectes de retorn
	for (var i = mObjArray.length - 1; i >= 0; i--) {
		var myfiteredObj = {};  // inicialitzam Objecte
		myfiteredObj = JSON_ObjectFieldFilter( mObjArray[i] ,mapped, byName)  // Filtram els camps de l'objecte
		mFiltered.unshift(myfiteredObj);  // Cream l'array de retorn amb l'objecte filtrat retornat // Unshift es com push però afegeix davant per la manera de recòrrer l'array
	}
	// return mFiltered.reverse();
	return mFiltered;
}

// JSONSet
// es un Array  d'objectes homogenis en format JSON
// Aquesta classe permet Filtrar informació de l'Array per obtenir només aquells que compleixen una determnada condició
// El filtratge es fa a través d'una funció específica 'filtreRuta' dissenyada AD HOC pel conjunt de registres que es vol filtrar
// En aquest cas conté condicions de filtratge de TipusDia, linia, sentit, franges a considerar perquè aquest és l'interés inicial d'aquesta classe
//  s'ha de veure si la funció de filtratge es pot passat com una propietat més de l'objecte i aixó podria ser genèrica
//
//  La classe permet escollir els 'camps' que es volen mostrar del total dels camps. Ens podem referir als camps pel seu nom
// o per l'índex que ocupen dins l'objecte.

module.exports = class JSONSet{
	constructor(dt){
		dt = dt  || [];
		this.data = dt ;
		this.recFilterKeys = {};  // Record (JSON) Filter Keys.  exemple : {mTipusData:'LAB', mMacro:8, mRuta:1, minFrj:0}
		this.fieldFilterKeys = {mapped_keys:[], mapped_by_name: false};  // Field (JSON) Filter Keys. Type of Array filter Used.   exemple : { ['8','16','17'], false}

		}

	setRecJSONfilterKeys(ky){
		// Estableix el filtratge de registres del JSON
		// exemple: {mTipusData:'LAB', mMacro:8, mRuta:1, minFrj:0}
		// Incideix sobre la funció de filtrartge 'filtreRuta'
		// els elements de l'objecte 'ky' passat per paràmetre han d'estar d'acord amb els que espera rebre la funció de filtratge: {mTipusData:'xxx', mMacro:'yy', mRuta:'zz', minFrj:'kk'}
		ky = ky || {} // Def val No filter!
		this.recFilterKeys = ky;
		}

	setFieldJSONfilterKeys(ky){
		// Estableix el filtratge de CAMPS del JSON
		// mapped_keys : les claus de l'objecte JSON seleccionades (número d'index o bé Nom de les claus)
		// mapped_by_name : false = les claus s'indiquen per l'index numeric del 'camp' JSON ,  exemple : { ['8','16','17'], false}
		// mapped_by_name : true = les claus s'indiquen pel nom del 'camp' JSON , [ per exemple {("franja_horaria","TRealSS_media","TRealSS_desv"), true}  ]
		ky = ky || {mapped_keys:[], mapped_by_name: false} // Def val No filter!
		this.fieldFilterKeys = ky;
		}

	get dataFiltered(){
		// Returns the data filtered by the filter condition 'setRecJSONfilterKeys'
		return this.data.filter(filtreRuta,this.recFilterKeys);
	}

	get count(){
		// Returns the total amount (of records)  of the Object, not filtered
		return this.data.length;
		}

	get countFiltered(){
		// Returns total of records of the filtered object
		return this.dataFiltered.length;
		}

	get mappedFieldsFilter (){
		// Returns Selected Fields from filtered JSON records (JSON filtered)

		return JSON_ArrayFieldFilter( this.dataFiltered, this.fieldFilterKeys.mapped_keys, this.fieldFilterKeys.mapped_by_name  )
	}

	get mappedFields (){
		// Returns Selected Fields from total amount records (JSON not filtered)

		return JSON_ArrayFieldFilter( this.data, this.fieldFilterKeys.mapped_keys, this.fieldFilterKeys.mapped_by_name  )
	}


	set toFile(fileName){
		// registra en un fitxer l'objecte JSON sense filtrar (Tots els camps)
		fileName = fileName || './JSONFilteredLogfile.json'
		return JSONtoFile(this.data, fileName);
	}

	set toFileFiltered(fileName){
		// registra en un fitxer l'objecte JSON FILTRAT!!! (tots els Camps)
		fileName = fileName || './JSONFilteredLogfile.json'
		return JSONtoFile(this.dataFiltered, fileName);
	}

	set toFileMapped(fileName){
		// registra en un fitxer els objectes JSON (NO FILTRATs) només els camps seleccionats!!!
		fileName = fileName || './JSONFilteredLogfile.json'
		return JSONtoFile(this.mappedFields, fileName);
	}

	set toFileMappedFiltered(fileName){
		// registra en un fitxer els objectes JSON FILTRATs i només els camps seleccionats!!!
		fileName = fileName || './JSONFilteredLogfile.json'
		return JSONtoFile(this.mappedFieldsFilter, fileName);
	}

	sendFile(fileName){
		// Alias de toFile
		return JSONtoFile(this.data, fileName);

	}


} // End of class JSONSet
