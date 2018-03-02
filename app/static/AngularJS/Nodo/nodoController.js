registrationModule.controller("nodoController", function($scope, $rootScope, $filter, $routeParams, $window, $location, localStorageService, alertFactory, nodoRepository, unidadRepository, documentoRepository, busquedaRepository, Utils, loginRepository) {

    //Propiedades
    $scope.idProceso = 1;
    $scope.perfil = 1;
    $scope.idRol = 20;
    $scope.idFase = 1;
    $scope.currentDocId = 0;
    $scope.listaDocumentos = null;
    $scope.modificado = null;
    $scope.url = null;
    $scope.frente = null;
    $scope.costadoDer = null;
    $scope.costadoIzq = null;
    $scope.trasera = null;
    $scope.idFrente = 26;
    $scope.idTrasera = 27;
    $scope.idCostadoIzq = 28;
    $scope.idCostadoDer = 29;
    $scope.listaDocumentosMultiple = '';
    $scope.consecutivo = '';
    var ruta = '';
    $scope.nombreArchivo = '';
    $scope.consecutivoEliminar = '';
    $scope.fechaModificada = 0;
    $scope.datoVinUrl = '';
    $scope.gerente = '';
    $scope.gerenteSel = false;
    $scope.mostrarGerente = true;
    $scope.date = new Date().toJSON().slice(0, 10).replace(/-/g, '/');
    $scope.fecha = '';
    $scope.dia = '';
    $scope.mes = '';
    $scope.anio = '';
    $scope.fechaNueva = '';

    //Mensajes en caso de error
    var errorCallBack = function(data, status, headers, config) {
        $('#btnEnviar').button('reset');
        alertFactory.error('Ocurrio un problema');
    };

    //Grupo de funciones de inicio
    $scope.init = function() {
        $scope.calendario();
        //Fecha de eld ia hoy para fechas y para guardar la foto 
        $scope.fecha = $scope.date.split('/');
        $scope.dia = $scope.fecha[2];
        $scope.mes = $scope.fecha[1];
        $scope.anio = $scope.fecha[0];
        $scope.fechaNueva = $scope.dia + '/' + $scope.mes + '/' + $scope.anio
            //console.log('nueva fecha ', $scope.fechaNueva)
            //.getDate() + "/" + ($scope.date.getMonth() + 1) + "/" + $scope.date.getFullYear();
            //console.log($scope.fecha);
            //Obtengo los datos del empleado logueado
            //console.log($location.path(), 'Soy la ruta')
        $scope.empleado = localStorageService.get('employeeLogged');
        if ($location.path() != '/unidad') {
            loginRepository.loginUrl($routeParams.usuario).then(function(result) {
                $scope.empleado = result.data
                localStorageService.set('employeeLogged', $scope.empleado);
                //Obtengo el idUsuario
                $scope.idUsuario = $scope.empleado.idUsuario;
                $scope.idRol = $scope.empleado.idRol;
                localStorageService.set('idUsuario', $scope.idUsuario);
                localStorageService.set('idRol', $scope.idRol);
                busquedaRepository.getFlotilla('', $routeParams.vin, '').then(function(result) {
                    $scope.datoVinUrl = result.data[0];
                    localStorageService.set('currentVIN', $scope.datoVinUrl);
                    $scope.unidad = localStorageService.get('currentVIN');
                    unidadRepository.getHeader(localStorageService.get('currentVIN').vin)
                        .success(obtieneHeaderSuccessCallback)
                        .error(errorCallBack);
                    getListaDocumentos();
                    $location.path('/unidad');
                    $window.location.reload();
                    // $window.location.reload();
                });
                //localStorageService.set('currentVIN', $routeParams.vin);
                //$scope.unidad = localStorageService.get('currentVIN');


            });
        } else {
            //Obtengo el idUsuario
            $scope.idUsuario = $scope.empleado.idUsuario;
            $scope.idRol = $scope.empleado.idRol;
            localStorageService.set('idUsuario', $scope.idUsuario);
            localStorageService.set('idRol', $scope.idRol);
            //Obtengo los datos del VIN
            $scope.unidad = localStorageService.get('currentVIN');

            unidadRepository.getHeader(localStorageService.get('currentVIN').vin)
                .success(obtieneHeaderSuccessCallback)
                .error(errorCallBack);

            getListaDocumentos();
        }

        $('#placaDoc').hide();
        $('[data-toggle="popover"]').popover()
        $scope.desabilitaBtnCerrar();
        localStorageService.set('currentDocId', null);

    };

    //Funcion para iniciar el datepicker
    $scope.calendario = function() {
        $('.input-group.date').datepicker({
            todayBtn: "linked",
            keyboardNavigation: true,
            forceParse: false,
            calendarWeeks: true,
            autoclose: true,
            todayHighlight: true,
            format: "dd/mm/yyyy"
        });
    }

    /////////////////////
    ///Header
    ////////////////////

    var obtieneHeaderSuccessCallback = function(data, status, headers, config) {
        $scope.unidadHeader = data;
        $scope.valVin = $scope.unidadHeader.vin;
        //Obtengo los datos del empleado logueado       
        $scope.currentPage = $scope.unidadHeader.faseActual;

        //Obtengo la lista de fases
        nodoRepository.getFasePermiso($scope.empleado.idRol)
            .success(obtieneNodosSuccessCallback)
            .error(errorCallBack);
    };

    var getListaDocumentos = function() {
        nodoRepository.getRolPermiso(localStorageService.get('idRol'), localStorageService.get('currentVIN').vin)
            .success(obtieneRolPermisoSuccesCallback)
            .error(errorCallBack);
    }

    var obtieneRolPermisoSuccesCallback = function(data, status, headers, config) {
        $scope.listaDocumentos = data;
        //console.log($scope.listaDocumentos, 'antes de modificar')
        $scope.fechaModificada = 24;
        if (localStorageService.get('currentDocId') != null) {
            $('#btnDoc' + localStorageService.get('currentDocId')).show();
            $('#ready' + localStorageService.get('currentDocId')).show();
        }

        while ($scope.fechaModificada <= 50) {
            if ($scope.fechaModificada === 24) {
                modificarFechas($scope.fechaModificada);
                $scope.fechaModificada = 47;
            } else {
                modificarFechas($scope.fechaModificada);
                $scope.fechaModificada++;
            }
        }
        $scope.frente = $scope.listaDocumentos[$scope.idFrente].valor;
        $scope.costadoDer = $scope.listaDocumentos[$scope.idCostadoDer].valor;
        $scope.costadoIzq = $scope.listaDocumentos[$scope.idCostadoIzq].valor;
        $scope.trasera = $scope.listaDocumentos[$scope.idTrasera].valor;
        localStorageService.set('frente', $scope.frente);
        localStorageService.set('costadoDer', $scope.costadoDer);
        localStorageService.set('costadoIzq', $scope.costadoIzq);
        localStorageService.set('trasera', $scope.trasera);
        //Se cargan las imagenes de autos
        if (localStorageService.get('frente') != null) {
            var ext = ObtenerExtArchivo(localStorageService.get('frente'));
            url = global_settings.downloadPath + localStorageService.get('currentVIN').vin + '/' + ($scope.idFrente + 1) + ext;
            $('#fotoFrente').attr("src", url);
        }
        if (localStorageService.get('trasera') != null) {
            var ext = ObtenerExtArchivo(localStorageService.get('trasera'));
            url = global_settings.downloadPath + localStorageService.get('currentVIN').vin + '/' + ($scope.idTrasera + 1) + ext;
            $('#fotoTrasera').attr("src", url);
        }
        if (localStorageService.get('costadoIzq') != null) {
            var ext = ObtenerExtArchivo(localStorageService.get('costadoIzq'));
            url = global_settings.downloadPath + localStorageService.get('currentVIN').vin + '/' + ($scope.idCostadoIzq + 1) + ext;
            $('#fotoIzquierda').attr("src", url);
        }
        if (localStorageService.get('costadoDer') != null) {
            var ext = ObtenerExtArchivo(localStorageService.get('costadoDer'));
            url = global_settings.downloadPath + localStorageService.get('currentVIN').vin + '/' + ($scope.idCostadoDer + 1) + ext;
            $('#fotoDerecha').attr("src", url);
        }

        Apply();
    };
    //*******************************************************************
    //Inicia Modificaciones para reestructura de fechas
    //*******************************************************************
    var modificarFechas = function(fecha) {
        $scope.fechaEntrega = $scope.listaDocumentos[fecha].valor;
        var dateFechaEntregaModificadda = '';
        var fechaEntregaModificada = '';
        var fechaEntregadia = '';
        var fechaEntregames = '';
        var fechaEntregaanio = '';
        var fechaEntergaNueva = '';
        if ($scope.fechaEntrega == 'Invalid Date') {
            $scope.fechaEntregaUni = {
                value: new Date($scope.listaDocumentos[fecha].valor)
            };
            $scope.listaDocumentos[fecha].valor = $scope.fechaEntregaUni.value;
        } else if ($scope.fechaEntrega == '') {
            $scope.listaDocumentos[fecha].valor = $scope.fechaNueva;
        } else {
            var dateFechaEntrega = new Date($scope.fechaEntrega);            
            if ($scope.fechaEntrega.length <= 10) { //Cuando la fecha esta guardada con el formato dd/mm/yyyy
                $scope.listaDocumentos[fecha].valor = $scope.fechaEntrega;                
            } else { //Cuando la fecha esta guardadda con el formato Mon Jan 30 2017 19:08:36 GMT-0600 (Hora estándar central (México))
                dateFechaEntregaModificadda = dateFechaEntrega.toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric' }).split(' ').join('-'); 
                fechaEntregaModificada = dateFechaEntregaModificadda.split('/');                
                fechaEntergaNueva = fechaEntregaModificada[0] + '/' + fechaEntregaModificada[1] + '/' + fechaEntregaModificada[2];               
                $scope.listaDocumentos[fecha].valor = fechaEntergaNueva;                
            }
        }
        // $scope.fechaEntrega = $scope.listaDocumentos[24].valor;
        // var dia = $scope.fechaEntrega.substring(0, 2);
        // var mes = $scope.fechaEntrega.substring(3, 5);
        // var anio = $scope.fechaEntrega.substring(6, $scope.fechaEntrega.length);
        // var date = new Date(Date.UTC(anio, mes, dia));

        // if (date == 'Invalid Date') {
        //     $scope.fechaEntregaUni = {
        //         value: new Date($scope.listaDocumentos[24].valor)
        //     };
        //     $scope.listaDocumentos[24].valor = $scope.fechaEntregaUni.value;
        // } else {
        //     $scope.listaDocumentos[24].valor = date;
        // }


    };
    //*******************************************************************
    //Termina Modificaciones para reestructura de fechas
    //*******************************************************************

    //Abre una orden padre o hijo
    $scope.VerOrdenPadre = function(exp) {
        location.href = '/?id=' + exp.folioPadre + '&employee=1';
    };

    $scope.VerOrdenHijo = function(exp) {
        location.href = '/?id=' + exp.folioHijo + '&employee=1';
    };

    ////////////////////////////////////////////////////////////////////////////
    //Genero Nodos
    ////////////////////////////////////////////////////////////////////////////
    var obtieneNodosSuccessCallback = function(data, status, headers, config) {
        //$scope.listaNodos = _Nodes;
        $scope.listaNodos = data;
        //$scope.numElements = _Nodes.length;
        $scope.numElements = data.length;
        //leo la página inicial y voy a ella
        //GetCurrentPage();

        setTimeout(function() {
            $('ul#standard').roundabout({
                btnNext: ".next",
                btnNextCallback: function() {
                    goToPageTrigger('.next');
                },
                btnPrev: ".prev",
                btnPrevCallback: function() {
                    goToPageTrigger('.prev');
                },
                clickToFocusCallback: function() {
                    goToPageTrigger('.next');
                }
            });
            //Voy a la página actual 
            //Siempre es 1
            goToPage($scope.currentPage);

        }, 1);

        unidadRepository.getUnidad($scope.unidadHeader.vin)
            .success(getUnidadSuccessCallback)
            .error(errorCallBack);
    };

    //Succes obtiene lista de documetos por fase y por perfil
    var getUnidadSuccessCallback = function(data, status, headers, config) {
        $scope.unidad = data;
        alertFactory.success('Datos de la unidad cargados.');
    };

    ////////////////////////////////////////////////////////////////////////////
    //Gestión de nodos y validación
    ////////////////////////////////////////////////////////////////////////////

    //Reacciona a los triggers de NEXT PREV CLIC
    var goToPageTrigger = function(button) {
        //Veo la página actual
        $scope.currentPage = $('ul#standard').roundabout("getChildInFocus") + 1;
        if ($scope.listaNodos[$scope.currentPage - 1].enabled != 0) {
            goToPage($scope.currentPage);
        } else {
            alertFactory.warning('El nodo ' + $scope.currentPage + ' no está disponible para su perfil.');
            $(button).click();
        }
    };

    //LLeva a un nodo específico desde la navegación
    $scope.setPage = function(nodo) {
        $scope.currentPage = nodo.idFase;
        goToPage($scope.currentPage);
    };

    //Ir a una página específica
    var goToPage = function(page) {
        $('ul#standard').roundabout("animateToChild", (page - 1));
        $scope.currentNode = $scope.listaNodos[page - 1];
        //Marco el nodo activo en NavBar
        SetActiveNav();
    };

    //Establece la clase de navegación del nodo actual
    var SetActiveNav = function() {
        angular.forEach($scope.listaNodos, function(value, key) {
            if (key == ($scope.currentPage - 1))
                value.active = 1;
            else
                value.active = 0;
        });
        //Ejecuto apply
        Apply();
    }

    //Ejecuta un apply en funciones jQuery
    var Apply = function() {
        if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest')
            $scope.$apply();
    };

    //Carga de Documento
    $scope.Cargar = function(id) {
        $('#frameUpload').attr('src', '/uploader')
        $('#modalUpload').modal('show');
        $rootScope.currentUpload = doc;
        localStorageService.set('currentDocId', id);
    };

    $scope.mostrarAccesorio = function() {
        $('#viewAccesorio').modal('show');
    }

    $scope.ocultarAccesorio = function() {
        $('#viewAccesorio').modal('hide');
    };

    $('[data-toggle="popover"]').popover();

    //animación de switches
    $(".switch").bootstrapSwitch();

    $('#35').hide($('#33').bootstrapSwitch('state'));
    $('#33').on('switchChange.bootstrapSwitch', function(event, state) {
        if (state == true) {
            $('#35').show(1000, function() {
                $('#33').bootstrapSwitch('state');
            });
        } else {
            $scope.Guardar(35, '');
            $('#35').hide(1000, function() {
                $('#33').bootstrapSwitch('state');
            });
        }
    });

    ///Guardar Imagen
    $scope.FinishUpload = function(name) {
        var doc = $rootScope.currentUpload;
        var currentIdDoc = localStorageService.get('currentDocId');
        var ext = ObtenerExtArchivo(name);
        $scope.nombreArchivo = currentIdDoc + ext;
        $scope.nombre = name;

        //Inserta o actualiza el documento
        unidadRepository.updateDocumento(localStorageService.get('currentVIN').vin, currentIdDoc, name, localStorageService.get('idUsuario'))
            .success(getSaveSuccessCallback)
            .error(errorCallBack);

        alertFactory.success('Imagen ' + name + ' guardada');
    };


    $('.showCtrl').hide();
    var Control = 0;
    //insert o actualizar el documento
    $scope.Guardar = function(idDocumento, valor) {

        if (idDocumento != null && ($scope.listaDocumentos[idDocumento - 1].accion != null || valor != '')) {
            Control = idDocumento;
            $('#ready' + Control).hide();
            $('#loader' + Control).show();

            unidadRepository.updateDocumento(localStorageService.get('currentVIN').vin, idDocumento, valor, localStorageService.get('idUsuario'))
                .success(getSaveDosSuccessCallback)
                .error(errorCallBack);

            if (idDocumento == 35) {
                $scope.Guardar(33, $('#33').bootstrapSwitch('state'));
            }
        }
    }

    //actualiza o inserta el accesorio para la unidad(accesorio)
    $('.switch').on('switchChange.bootstrapSwitch', function(event, state) {
        Control = this.id
        if (this.id != 33 && initSwitches != 0) {
            unidadRepository.updateDocumento(localStorageService.get('currentVIN').vin, this.id, state, localStorageService.get('idUsuario'))
                .success(getSaveSuccessCallback)
                .error(errorCallBack);
        }
    });

    //recorre los switches para obtener los estados en los que se guardaron
    var switchState = false;
    var initSwitches;
    $('#btnAccesorio').click(function() {
        initSwitches = 0;
        getListaDocumentos();
        $('#divSwitchAcc input:checkbox').each(function(index) {
            switchState = $scope.listaDocumentos[this.id - 1].valor;
            if (switchState == 'true') {
                $('#' + this.id).bootstrapSwitch('state', true);
            } else {
                $('#' + this.id).bootstrapSwitch('state', false);
            }
        });
        initSwitches = 1;
    });

    //success para validar si existe el documento
    var getExisteDocumentoSuccessCallback = function(data, status, headers, config) {
        $scope.existeDocumento = data;
        alertFactory.success('Datos de unidad propiedad cargados.');
    };

    //success de insercción y actualización
    var getSaveSuccessCallback = function(data, status, headers, config) {
        alertFactory.success('Datos de la unidad guardados.');
        getListaDocumentos();
        $('#loader' + Control).hide();
        $('#ready' + Control).show();
        actualizaPropiedadUnidad();
        $scope.desabilitaBtnCerrar();
        if (data != null) {
            $scope.consecutivo = data;
            //Se guarda el archivo en el servidor
            documentoRepository.saveFile(localStorageService.get('currentVIN').vin, localStorageService.get('currentDocId'), $scope.nombre, $scope.consecutivo)
                .success(getSaveFileSuccessCallback)
                .error(errorCallBack);
        }

    };
    //*************************************************************************
    //*************************************************************************
    var getSaveDosSuccessCallback = function(data, status, headers, config) {
        alertFactory.success('Datos de la unidad guardados.');
        getListaDocumentos();
        $('#loader' + Control).hide();
        $('#ready' + Control).show();
        actualizaPropiedadUnidad();
        $scope.desabilitaBtnCerrar();


    };
    //*************************************************************************
    //*************************************************************************

    //Success de actualizacion de imagen
    var getSaveFileSuccessCallback = function(data, status, headers, config) {
        $scope.rutaNueva = data;
        //Se valida el id de BD y se sustituye la imágen con la nueva ruta   
        if (localStorageService.get('currentDocId') == ($scope.idFrente + 1)) {
            $('#fotoFrente').attr("src", data);
        }
        if (localStorageService.get('currentDocId') == ($scope.idTrasera + 1)) {
            $('#fotoTrasera').attr("src", data);
        }
        if (localStorageService.get('currentDocId') == ($scope.idCostadoIzq + 1)) {
            $('#fotoIzquierda').attr("src", data);
        }
        if (localStorageService.get('currentDocId') == ($scope.idCostadoDer + 1)) {
            $('#fotoDerecha').attr("src", data);
        }

        alertFactory.success('Imágen Guardada.');
    }

    //Botón regresar
    $scope.Regresar = function(campo) {
        location.href = '/busqueda';
    };

    //Success de actualizacion de PDF
    var getSavePdfSuccessCallback = function(data, status, headers, config) {
        $scope.rutaNueva = data;
        alertFactory.success('Archivo Guardado.');
        getListaDocumentos();
    }

    $scope.verFactura = function(vin) {
        //var pdf_link = 'http://192.168.20.18/Documentos/' + localStorageService.get('currentVIN').vin + 'factura.pdf';
        //var iframe = '<div id="hideFullContent"><div id="hideFullMenu" onclick="nodisponible()" ng-controller="nodoController"> </div> <object id="ifDocument" data="' + pdf_link + '" type="application/pdf" width="100%" height="100%"></object></div>';
        var iframe = '<div class="modal-body"><div id="pdfInvoceContent"><div ng-show="loadingOrder" class="sk-spinner sk-spinner-double-bounce"><div class="sk-double-bounce1"></div><div class="sk-double-bounce2"></div></div></div></div>';
        $.createModal({
            message: iframe,
            closeButton: false,
            scrollable: false
        });
        getPdf(vin);

    }
    var getPdf = function(vin) {
        nodoRepository.getPdf(vin).then(function(d) {
            if (d.data.mensajeresultadoField == "") {
                var pdf = URL.createObjectURL(Utils.b64toBlob(d.data.arrFacturasField, "application/pdf"))
                    //console.log(pdf)
                $("<object class='filesInvoce' data='" + pdf + "' width='100%' height='500px' >").appendTo('#pdfInvoceContent');
            } else {
                $("<h2 class='filesInvoce'>" + d.data.mensaje + "</h2>").appendTo('#pdfInvoceContent');
            }
            $scope.loadingOrder = false;
        })
    }


    //oculta los popovers al dar clic en el body
    $('[data-toggle="popover"]').popover();

    $('body').on('click', function(e) {
        $('[data-toggle="popover"]').each(function() {

            if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
                $(this).popover('hide');
            }
        });
    });

    //Método para mostrar documento PDF, JPG o PNG
    $scope.VerDocumento = function(idDoc, valor, consecutivo) {
        $('#documentosModal').appendTo("body").modal('hide');
        var ext = ObtenerExtArchivo(valor);
        var type = '';

        if (ext == '.jpg') {
            type = "image/jpg";
        } else if (ext == '.png') {
            type = "image/png";
        } else {
            type = "application/pdf";
        }

        if (consecutivo == null || consecutivo == '') {
            ruta = global_settings.downloadPath + localStorageService.get('currentVIN').vin + '/' + idDoc + ext;
        } else {
            ruta = global_settings.downloadPath + localStorageService.get('currentVIN').vin + '/' + idDoc + '_' + consecutivo + ext;
        }

        var pdf_link = ruta;
        var titulo = ' :: ' + localStorageService.get('currentVIN').vin + ' :: ';
        var iframe = '<div id="hideFullContent"><div id="hideFullMenu" onclick="nodisponible()" ng-controller="nodoController"> </div> <object id="ifDocument" data="' + pdf_link + '" type="' + type + '" width="100%" height="100%"></object><a type="button" class="dropdown-toggle alerta-form btn btn-info" href="' + pdf_link + '" target="_parent" download="Documento"><span class="glyphicon glyphicon-save"></span></a></div>';
        $.createModal({
            title: titulo,
            message: iframe,
            closeButton: false,
            scrollable: false
        });
    };

    //Método para obtener la extension del archivo
    var ObtenerExtArchivo = function(file) {
        $scope.file = file;
        var res = $scope.file.substring($scope.file.length - 4, $scope.file.length)
        return res;
    }

    //deshabilitar botón de cerrar licitación
    $scope.desabilitaBtnCerrar = function() {
        var subidos, total;
        if (localStorageService.get('currentVIN').estatus != 'Cerrado') {
            if ($scope.numDocumento == null) {
                subidos = parseInt(localStorageService.get('currentVIN').subidos);
                total = parseInt(localStorageService.get('currentVIN').total);
            } else {
                subidos = parseInt($scope.numDocumento[0].subidos);
                total = parseInt($scope.numDocumento[0].total);
            }

            if (subidos == total)
                return false;
            else
                return true;

        } else
            return true;

    }

    //cierra documentación final del automóvil de la licitación
    $scope.cierraLicitacionVIN = function() {
        $('#btnCerrarUnidad').button('loading');
        unidadRepository.updateLicitacionVIN(localStorageService.get('currentVIN').vin, localStorageService.get('currentVIN').idLicitacion, 'Cerrado')
            .success(getUpdLicitacionVINSuccessCallback)
            .error(errorCallBack);

    }

    //mensaje de éxito del cierre de entrega de documentos del vehículo para una licitación determinada
    var getUpdLicitacionVINSuccessCallback = function(data, status, headers, config) {
        alertFactory.success('Estatus de licitación del automóvil Cerrado.');
        $scope.unidadHeader.estatus = 'Cerrado';
        $('#btnCerrarUnidad').button('reset');
    };

    //actualiza los datos del localStorage de la unidad
    var actualizaPropiedadUnidad = function() {
        busquedaRepository.getFlotilla('', localStorageService.get('currentVIN').vin, localStorageService.get('currentVIN').idLicitacion)
            .success(getFlotillaSuccessCallback)
            .error(errorCallBack);
    }

    //Succes obtiene lista de objetos de las flotillas
    var getFlotillaSuccessCallback = function(data, status, headers, config) {
        $scope.numDocumento = data;
    };

    //Muestra la modal de los documentos
    $scope.showModal = function(idDocumento) {
        listaDocumentosMultiple = [];
        $('#documentosModal').appendTo("body").modal('show');
        obtenerDocumentos(idDocumento);
    }

    //Se obtienen los documentos por idDocumento
    var obtenerDocumentos = function(idDocumento) {
        unidadRepository.getListaDocumentos(localStorageService.get('currentVIN').vin,
                idDocumento)
            .success(getListaDocumentosSuccessCallback)
            .error(errorCallBack);
    }

    //Success de los documentos del vin por idDocumento
    var getListaDocumentosSuccessCallback = function(data, status, headers, config) {
        alertFactory.success('Documentos cargados');
        $scope.listaDocumentosMultiple = data;
    }

    //eliminar elemento de unidad propiedad
    $scope.eliminar = function(documento) {
        if (documento.consecutivo == null) {
            $scope.consecutivoEliminar = 0;
        } else {
            $scope.consecutivoEliminar = documento.consecutivo;
        }
        if (confirm('¿Seguro que desea eliminar este documento?')) {
            unidadRepository.deleteUnidadPropiedad(localStorageService.get('currentVIN').vin, documento.idDocumento, documento.valor,
                    $scope.consecutivoEliminar)
                .success(getDeleteSuccessCallback)
                .error(errorCallBack);
        }
    }

    //Succes de eliminar elemento
    var getDeleteSuccessCallback = function(data, status, headers, config) {
        alertFactory.success('Archivo eliminado');
        $('#documentosModal').appendTo("body").modal('hide');
        getListaDocumentos();
    }

    //**************************************************************************
    //**Obtiene el Gerente para CARTA FACTURA
    $scope.cartaFactura = function(unidad) {
            busquedaRepository.getGerente(0).then(function(result) {
                $scope.gerente = result.data;
                $('#cartaFactura').modal('show');
            });
        }
        //**************************************************************************
        //** Para inhabilitar los gerentes una vez seleccionado
    $scope.gerenteSeleccionado = function(info) {
            $scope.gerenteSel = true;
        }
        //**************************************************************************
        //**Para Activar los gerentes despues de cerrar la pantalla
    $scope.gerenteAct = function() {
            $scope.gerenteSel = false;
            $scope.mostrarGerente = true;
            //reload();
        }
        //**************************************************************************
        //**Para obtener la CARTA FACTURA y generarla
    $scope.generarCF = function(infogerente, unidad, documento) {
            $("#elimina").remove();
            //var consecutivo = [];
            $scope.mostrarGerente = false;
            //console.log(infogerente);
            angular.forEach(infogerente, function(value, key) {
                if (value.seleccionado == true) {
                    //console.log(value, 'El elegido');
                    unidadRepository.getListaDocumentos(localStorageService.get('currentVIN').vin, documento.idDocumento).then(function(listadocumentos) {
                        // if (listadocumentos.data.length == 0) {
                        //     consecutivo = 1;
                        // } else {
                        //     consecutivo = listadocumentos.data.length + 1;
                        // }
                        var date2 = new Date();
                        var hora = '';
                        var minuto = '';
                        minuto = date2.getMinutes();
                        hora = date2.getHours();
                        unidadRepository.updateDocumento(localStorageService.get('currentVIN').vin, documento.idDocumento, 'Carta Factura ' + $scope.dia + '_' + $scope.mes + '_' + $scope.anio + '_' + hora + '_' + minuto + '.pdf', $scope.empleado.idUsuario).then(function(result) {
                            //console.log(result)
                            documentoRepository.getCartaFactura(localStorageService.get('currentVIN').vin, unidad, value, $scope.empleado.idUsuario, documento.idDocumento, result.data).then(function(result) {
                                //console.log(result)
                                var pdf = URL.createObjectURL(Utils.b64toBlob(result.data, "application/pdf"))
                                    //console.log(pdf)
                                $("<object id='elimina' class='filesInvoce' data='" + pdf + "' width='100%' height='500px' >").appendTo('#CartaFacturaPdf');

                            });
                        });
                    });
                }
            });
        }
        //**************************************************************************
});
