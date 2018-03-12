var searchUrl = global_settings.urlCORS + '/api/flotillaApi/';
var searchUrlGPS = global_settings.urlGPS ;

registrationModule.factory('busquedaRepository', function ($http) {
    return {
        getFlotilla: function ( vin, placa, idlicitacion) {
            return $http.get(searchUrl + '1|' + vin + '|' + placa + '|' + idlicitacion);
        },
        getGerente: function (idpersona) {
            return $http.get(searchUrl + '3|' + idpersona);
        },
        getGps: function(vin){
            return $http.get(searchUrlGPS + vin);
        }
    };
});