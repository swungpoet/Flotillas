registrationModule.controller("headerController",function(e,o,l,n){e.init=function(){e.empleado=l.get("employeeLogged")},e.Salir=function(){l.set("employeeLogged",null),location.href="/"}});