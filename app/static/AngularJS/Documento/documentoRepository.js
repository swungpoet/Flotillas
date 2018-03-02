var documentoUrl = global_settings.urlCORS + '/api/documentoApi/';
var ruta = global_settings.uploadPath;

registrationModule.factory('documentoRepository', function ($http) {
    return {        
        saveFile: function (vin, idDocumento, name, consecutivo) {
        	return $http({
                url: documentoUrl,
                method: "POST",
                params: { id: '1|' + vin + '|' + idDocumento + '|' + ruta + name + '|' + consecutivo}
            });
        },
        getCartaFactura: function(vin,unidad,persona,idempleado,iddocumento,consecutivo) {
            return $http.get(documentoUrl + '1|' + vin + '|' + unidad.idEmpresa + '|'+ unidad.idSucursal + '|' + persona.nombre + '|' + persona.puesto + '|' + idempleado + '|' + persona.idCatPersona + '|' + iddocumento + '|'+ consecutivo);
        }
    };
});