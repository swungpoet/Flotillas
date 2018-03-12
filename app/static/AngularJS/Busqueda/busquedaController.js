registrationModule.controller("busquedaController", function ($scope, $rootScope, localStorageService, alertFactory, busquedaRepository, reporteRepository) {

    //Valores default
    $scope.factura = '';
    $scope.vin = '';
    $scope.licitacion = null;
    $scope.clientes = '';
    $scope.placa = '';
    $scope.longitud = '';
    $scope.latitud = '';

    //Grupo de funciones de inicio
    $scope.init = function () {
        reporteRepository.getCliente().then(function (result) {
            $scope.clientes = result.data;
            //console.log($scope.clientes)
        });
        //Obtengo los datos del empleado logueado
        $rootScope.empleado = localStorageService.get('employeeLogged');
        //Se valida si existe una busqueda previa
        if (localStorageService.get('busqueda') != null || localStorageService.get('busqueda') != undefined) {
            $scope.vin2 = localStorageService.get('vin');
            $scope.placa2 = localStorageService.get('placa');
            $scope.licitacion2 = localStorageService.get('licitacion');
            if (localStorageService.get('vin') == null || localStorageService.get('vin') == undefined) {
                $scope.vin2 = '';
            }
            if (localStorageService.get('placa') == null || localStorageService.get('placa') == undefined) {
                $scope.placa2 = '';
            }
            if (localStorageService.get('licitacion') == null || localStorageService.get('licitacion') == undefined) {
                $scope.licitacion2 = '';
            }
            //Se realiza la busqueda con los parametros iniciales
            busquedaRepository.getFlotilla($scope.vin2, $scope.placa2, $scope.licitacion2)
                .success(getFlotillaSuccessCallback)
                .error(errorCallBack);
            //Se asigna el valor de la busqueda
            $('#txtVIN').val($scope.vin2);
            $('#txtPlaca').val($scope.placa2);
        }
    };

    //Botón obtener la flotilla dependiendo de la factura o vin
    $scope.BuscarFlotilla = function (vin, placa, licitacion) {
        if (licitacion == undefined) {
            $scope.licitacion = '';
        } else {
            $scope.licitacion = licitacion;
        }
        if (placa == undefined) {
            placa = '';
        }
        $('#btnBuscar').button('loading');
        var datoPlaca = $("#txtPlaca").val();
        var datoVin = $("#txtVIN").val();
        var datoLicitacion = $("#txtLicitacion").val();
        //console.log("VIN: " +datoVin, "PLACA: " + datoPlaca, "LICITACION: " + datoLicitacion);
        placa = datoPlaca;
        vin = datoVin;
        licitacion = datoLicitacion;
        if (placa == '' && vin == '' && licitacion == undefined) {
            alertFactory.warning('Seleccione al menos un criterio de búsqueda');
            //regreso el objeto a su estado original
            $('#btnBuscar').button('reset');
        } else if (placa != '' || vin != '') {
            busquedaRepository.getFlotilla(vin, placa, $scope.licitacion)
                .success(getFlotillaSuccessCallback)
                .error(errorCallBack);
        } else {
            if ($scope.placa == undefined) { $scope.placa = '' }
            if ($scope.vin == undefined) { $scope.vin = '' }
            busquedaRepository.getFlotilla($scope.placa, $scope.vin, $scope.licitacion)
                .success(getFlotillaSuccessCallback)
                .error(errorCallBack);
        }
    };

    //Succes obtiene lista de objetos de las flotillas
    var getFlotillaSuccessCallback = function (data, status, headers, config) {

        //regreso el objeto a su estado original
        $('#btnBuscar').button('reset');
        $rootScope.listaUnidades = data;
        if ($scope.placa == undefined) {
            $scope.placa = '';
        }
        localStorageService.set('placa', $scope.placa);
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
    var errorCallBack = function (data, status, headers, config) {
        alertFactory.info('No se encuentran flotillas con los criterios de búsqueda');
    };


    $scope.EnviarUnidad = function (uni) {
        localStorageService.set('currentVIN', uni);
        location.href = '/unidad';
    }

    //Crear mapa
    $scope.buscarGPS = function (vin) {
        var datoVin = $scope.vin;
        busquedaRepository.getGps(vin)
            .success(getGPSSuccessCallback);

    }

    var getGPSSuccessCallback = function (data, status, headers, config) {
        console.log('resultado de la Longitud= ', data.longitud, ' latitud', data.latitud)

        var lat = data.latitud;
        var long = data.longitud;

        console.log(lat, long);

        if (lat== 0 && long == 0) {
            alertFactory.error('No existen coordenadas.');
        } else {
        //var myLatlng2 = new google.maps.LatLng(19.4270245,-99.16766469999999);
        document.getElementById("map").style.visibility="visible";
        document.getElementById("btnCerrar").style.visibility="visible";
        document.getElementById("contenedor").style.visibility="hidden";
        

        var myLatlng = new google.maps.LatLng(lat, long);
      
        //console.log(myLatlng);
        var myOptions = {
            center: myLatlng,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            zoom: 12,
            panControl: true,
            zoomControl: true,
            mapTypeControl: true,
            scaleControl: true,
            streetViewControl: true,
            overviewMapControl: true,
            rotateControl: true,
        };

        var map = new google.maps.Map($("#map").get(0), myOptions);
        var marker = new google.maps.Marker({
            position: myLatlng,
            map: map
        });
    }
    };

    $scope.cerrarVentana = function () {
        document.getElementById("btnCerrar").style.visibility="hidden";
        document.getElementById("map").style.visibility="hidden";
        document.getElementById("contenedor").style.visibility="visible";
    }

$scope.verificarCheckbox = function(vin){
    if($scope.checkstate){
        console.log($scope.vin)
       //mande el arreglo[0]
    }else{
       //mande el arreglo[1]
    }
}

});
