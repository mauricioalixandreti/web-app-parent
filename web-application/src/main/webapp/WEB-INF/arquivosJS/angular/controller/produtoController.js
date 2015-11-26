qualMeuRemedioApp
		.controller(
				'produtoController',
				[
						'$window',
						'$scope',
						'$http',
						'$filter',
						'$location',
						'$translate',
						function($window, $scope, $http, $filter, $location,
								$translate) {

							$scope.paginaInicial = true;

							$scope.pageToGet = 0;

							$scope.state = 'busy';

							$scope.lastAction = '';

							$scope.parametro = '';

							$scope.url = contextPath + "/produtos/listar";

							$scope.errorOnSubmit = false;
							$scope.errorIllegalAccess = false;
							$scope.displayMessageToUser = false;
							$scope.displayValidationError = false;
							$scope.displaySearchMessage = false;
							$scope.displaySearchButton = false;
							$scope.displayCreateContactButton = false;

							$scope.page = {
								itens : {},
								currentPage : 0,
								paginasCont : 0,
								totalContacts : 0
							};

							$scope.listar = function() {
								$scope.parametro = '';
								var isPaginator = false;
								$scope.buscaTodos(isPaginator);
							}

							$scope.buscaTodos = function(isPaginacao) {
								var url = $scope.url;
								$scope.lastAction = 'list';

								var urlConfig = {
									params : {
										page : $scope.pageToGet
									}
								};

								var promisse = $http.get(url, urlConfig);

								promisse.then(function(response) {
									$scope.errorOnSubmit = false;
									$scope.finishAjaxCallOnSuccess(
											response.data, null, isPaginacao);
									//									
								}, function(error) {
									$scope.errorOnSubmit = true;

								});
							}

							$scope.populateTable = function(data) {
								if (data.paginasCont > 0) {
									$scope.state = 'list';

									$scope.page = {
										itens : data.produtos,
										currentPage : $scope.pageToGet,
										paginasCont : data.paginasCont,
										totalContacts : data.totalProdutos
									};

									if ($scope.page.paginasCont <= $scope.page.currentPage) {
										$scope.pageToGet = $scope.page.paginasCont - 1;
										$scope.page.currentPage = $scope.page.paginasCont - 1;
									}

									$('#sch').removeClass('invisible');

									$scope.pageInitShow = false;
									$scope.schShow = true;

									$scope.displayCreateContactButton = true;
									$scope.displaySearchButton = true;
								} else {
									$scope.state = 'noresult';
									$scope.displayCreateContactButton = true;

									if (!$scope.parametro) {
										$scope.displaySearchButton = false;
									}
								}

								if (data.actionMessage || data.searchMessage) {
									$scope.displayMessageToUser = $scope.lastAction != 'search';

									$scope.page.actionMessage = data.actionMessage;
									$scope.page.searchMessage = data.searchMessage;
								} else {
									$scope.displayMessageToUser = false;
								}

							}

							$scope.mudaPagina = function(page) {
								$scope.pageToGet = page;
								var isPaginator = true;
								if ($scope.parametro) {
									$scope.buscaProduto($scope.parametro,
											isPaginator);
								} else {
									$scope.buscaTodos(isPaginator);
								}
							};

							$scope.exit = function(modalId) {
								$(modalId).modal('hide');

								$scope.contact = {};
								$scope.errorOnSubmit = false;
								$scope.errorIllegalAccess = false;
								$scope.displayValidationError = false;
							}

							$scope.finishAjaxCallOnSuccess = function(data,
									modalId, isPagination) {
								$scope.populateTable(data);
								$scope.setPaginationRanges(isPagination);
								$scope.lastAction = '';
							}

							$scope.startDialogAjaxRequest = function() {
								$scope.displayValidationError = false;
								$scope.previousState = $scope.state;
								$scope.state = 'busy';
							}

							$scope.handleErrorInDialogs = function(status) {
								$scope.state = $scope.previousState;

								if (status == 403) {
									$scope.errorIllegalAccess = true;
									return;
								}

								$scope.errorOnSubmit = true;
								$scope.lastAction = '';
							}

							$scope.addSearchParametersIfNeeded = function(
									urlConfig, isPagination) {
								if (!urlConfig.params) {
									urlConfig.params = {};
								}

								urlConfig.params.page = $scope.pageToGet;

								if ($scope.parametro) {
									urlConfig.params.parametro = $scope.parametro;
								}
							}

							$scope.buscaProduto = function(buscaProdutoForm,
									isPagination) {
								if (!($scope.parametro)
										&& (!buscaProdutoForm.$valid)) {
									$scope.displayValidationError = true;
									return;
								}

								$scope.lastAction = 'search';

								var url = $scope.url + "/" + $scope.parametro;

								$scope.startDialogAjaxRequest();

								var urlConfig = {};

								if ($scope.parametro) {
									$scope.addSearchParametersIfNeeded(
											urlConfig, isPagination);
								}

								var promisse = $http.get(url, urlConfig);

								promisse.then(function(response) {
									$scope.errorOnSubmit = false;
									$scope.finishAjaxCallOnSuccess(
											response.data, null, isPagination);
								}, function(error) {
									$('#erro').removeClass('invisible');
									$scope.errorOnSubmit = true;
								});
							};

							$scope.possuiItens = function() {
								var exibe = true;
								exibe = !$scope.erroDadosNaoEncontrados();
								if (exibe) {
									exibe = !$scope.erroFaltaParametro();
								}

								if (exibe) {
									exibe = !angular.equals({},
											$scope.page.itens);
								}

								return exibe;
							}

							$scope.erroDadosNaoEncontrados = function() {
								return $scope.state === 'noresult';
							}

							$scope.erroFaltaParametro = function() {
								return !$scope.erroDadosNaoEncontrados()
										&& $scope.errorOnSubmit;
							}

							$scope.classNumPage = function(numPage) {
								if (numPage == $scope.pageToGet) {
									return 'active';
								}
								return false;
							};

							$scope.setPaginationRanges = function(isPaginacao) {
								$scope.rangePage = [ $scope.page.paginasCont ];

								for (var i = $scope.page.paginasCont - 1; i >= 0; i--) {
									$scope.rangePage[i] = {
										"indice" : i,
										"pagina" : i + 1
									}
								}

								var visiblePages = $scope.page.paginasCont < 10 ? $scope.page.paginasCont
										: 10;

								if (isPaginacao === false) {
									if ($scope.page.paginasCont > 0) {
										$(' .pagination').html('');
										$(' .pagination')
												.html(
														'<ul id="pagination" class="pagination-sm pagination"></ul>');
										var qtdePages = $scope.page.paginasCont === 1 ? $scope.page.paginasCont
												: ($scope.page.paginasCont - 1);
										$('#pagination')
												.twbsPagination(
														{
															totalPages : qtdePages,
															visiblePages : visiblePages,
															first : 'Primeiro',
															prev : 'Voltar',
															next : 'Avan&#231;ar',
															last : '&#218;ltimo',
															onPageClick : function(
																	event, page) {
																paginando = true;
																$scope
																		.mudaPagina(page);
															}
														});
									}
								}
							};

							$scope.destacaPalavra = function(palavra) {
								if ($scope.parametro != undefined
										&& $scope.parametro
										&& palavra != undefined
										&& palavra.toLowerCase().search(
												$scope.parametro.toLowerCase()) >= 0) {
									return 'span-selected';
								}
								return false;
							}
							$('#erro').removeClass('invisible');
							waitingDialog.hide();
						} ]);
