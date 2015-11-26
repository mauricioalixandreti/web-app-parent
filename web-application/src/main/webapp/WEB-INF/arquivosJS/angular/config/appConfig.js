var contextPath = "/qualmeuremedio";
var qualMeuRemedioApp = angular.module("qualMeuRemedioApp",
		[ 'pascalprecht.translate' ]);


qualMeuRemedioApp.config(function($translateProvider) {
	$translateProvider.translations('pt_br', msg_pt_br);
	
	$translateProvider.preferredLanguage('pt_br');
	$translateProvider.useSanitizeValueStrategy(null);
});


qualMeuRemedioApp.directive("modalShow", function ($parse) {
    return {
        restrict: "A",
        link: function (scope, element, attrs) {

            scope.showModal = function (visible, elem) {
                if (!elem)
                    elem = element;

                if (visible)
                    $(elem).modal("show");                     
                else
                    $(elem).modal("hide");
            }

            scope.$watch(attrs.modalShow, function (newValue, oldValue) {
                scope.showModal(newValue, attrs.$$element);
            });

            $(element).bind("hide.bs.modal", function () {
                $parse(attrs.modalShow).assign(scope, false);
                if (!scope.$$phase && !scope.$root.$$phase)
                    scope.$apply();
            });
        }

    };
});



