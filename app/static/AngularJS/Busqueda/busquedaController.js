registrationModule.controller("busquedaController", function($scope, $rootScope, localStorageService, alertFactory, busquedaRepository, reporteRepository) {

    //Valores default
    $scope.factura = '';
    $scope.vin = '';
    $scope.licitacion = null;
    $scope.clientes = '';

    //Grupo de funciones de inicio
    $scope.init = function() {
        reporteRepository.getCliente().then(function(result) {
            $scope.clientes = result.data;
            //console.log($scope.clientes)
        });
        //Obtengo los datos del empleado logueado
        $rootScope.empleado = localStorageService.get('employeeLogged');
        //Se valida si existe una busqueda previa
        if (localStorageService.get('busqueda') != null || localStorageService.get('busqueda') != undefined) {
            $scope.factura2 = localStorageService.get('factura');
            $scope.vin2 = localStorageService.get('vin');
            $scope.licitacion2 = localStorageService.get('licitacion');
            if (localStorageService.get('factura') == null || localStorageService.get('factura') == undefined) {
                $scope.factura2 = '';
            }
            if (localStorageService.get('vin') == null || localStorageService.get('vin') == undefined) {
                $scope.vin2 = '';
            }
            if (localStorageService.get('licitacion') == null || localStorageService.get('licitacion') == undefined) {
                $scope.licitacion2 = '';
            }
            //Se realiza la busqueda con los parametros iniciales
            busquedaRepository.getFlotilla($scope.factura2, $scope.vin2, $scope.licitacion2)
                .success(getFlotillaSuccessCallback)
                .error(errorCallBack);
            //Se asigna el valor de la busqueda
            $('#txtVIN').val($scope.vin2);
            $('#txtFactura').val($scope.factura2);
        }
    };

    //Botón obtener la flotilla dependiendo de la factura o vin
    $scope.BuscarFlotilla = function(factura, vin, licitacion) {
        if (licitacion == undefined) {
            $scope.licitacion = '';
        } else {
            $scope.licitacion = licitacion;
        }
        if (factura == undefined) {
            factura = '';
        }
        $('#btnBuscar').button('loading');
        var datoFactura = $("#txtFactura").val();
        var datoVin = $("#txtVIN").val();
        var datoLicitacion = $("#txtLicitacion").val();
        factura = datoFactura;
        vin = datoVin;
        licitacion = datoLicitacion;
        if (factura == '' && vin == '' &&  licitacion == undefined) {
            alertFactory.warning('Seleccione al menos un criterio de búsqueda');
            //regreso el objeto a su estado original
            $('#btnBuscar').button('reset');
        } else if (factura != '' || vin != '' ) {
            busquedaRepository.getFlotilla(factura, vin, $scope.licitacion)
                .success(getFlotillaSuccessCallback)
                .error(errorCallBack);
        } else {
		if ($scope.factura == undefined )
                {$scope.factura = ''}
            if ($scope.vin == undefined )
                 {$scope.vin = ''}
            busquedaRepository.getFlotilla($scope.factura, $scope.vin, $scope.licitacion)
                .success(getFlotillaSuccessCallback)
                .error(errorCallBack);
        }
    };

    //Succes obtiene lista de objetos de las flotillas
    var getFlotillaSuccessCallback = function(data, status, headers, config) {

        //regreso el objeto a su estado original
        $('#btnBuscar').button('reset');
        $rootScope.listaUnidades = data;
        if ($scope.factura == undefined) {
            $scope.factura = '';
        }
        localStorageService.set('factura', $scope.factura);
        localStorageService.set('vin', $scope.vin);
        localStorageService.set('busqueda', data);
        localStorageService.set('licitacion', $scope.licitacion)
        //console.log(data, 'resultado de la flotilla')
        if (data.length > 0) {
            alertFactory.success('Datos de flotillas cargados.');
        } else {
            alertFactory.warning('No se encontraron flotillas');
        }

    };

    //Mensajes en caso de error
    var errorCallBack = function(data, status, headers, config) {
        alertFactory.info('No se encuentran flotillas con los criterios de búsqueda');
    };

    $scope.EnviarUnidad = function(uni) {
        localStorageService.set('currentVIN', uni);
        location.href = '/unidad';
    }
});
