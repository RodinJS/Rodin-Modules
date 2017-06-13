(function () {
    'use strict';

    app.controller('MainCtrl', function ($rootScope,
                                         $scope,
                                         $http,
                                         $q,
                                         $cookieStore,
                                         $location,
                                         $route,
                                         apiRequests,
                                         loadStatuses,
                                         $timeout,
                                         $window,
                                         dataBuilder,
                                         ganttBuilder,
                                         Notifications,
                                         Socket,
                                         checkLogin,
                                         googleMap,
                                         $debounce,
                                         $filter,
                                         $sce,
                                         FR8Cookies,
                                         $interval,
                                         $uibModal,
                                         searchLoads) {

        $scope.$route = $route;
        $scope.modalActivate = false;
        $scope.mapLoaded = false;
        $scope.clientOs = $window.jscd.os;
        $scope.clientBrowser = $window.jscd.browser ? $window.jscd.browser.toLowerCase() : 'unknown';
        $scope.isIE = detectIE() ? 'ie ' + '_' + detectIE() : '';
        $scope.contentLoaded = false;
        $scope.notificationBadge = 0;
        $rootScope.firstLogIn = false;
        $scope.alerts = [];
        $scope.socketBuffer = [];
        $scope.orderDetailsForm = {shipperInfo: {}, consigneeInfo: {}, brokerInfo: {}};
        $scope.env = Configs.CUR_ENV.toLowerCase();
        $scope.isFleet = $cookieStore.get('role') == 'FLEET' ? true : false;

        $timeout(function(){
           $scope.ctrl =  $scope.$route.current.$$route.controller.toLowerCase();
        }, 1000);

        $scope.contentLoaded = false;
        $scope.modalIsOpen = false;
        $scope.weekStart = moment().subtract(1, 'days').startOf('day');
        $scope.weekEnd = moment().add(2, 'days').endOf('day');

        $scope.consigneeEditMode = false;
        $scope.noteEditMode = false;
        $scope.refIdEditMode = false;
        $scope.shipperEditMode = false;

        $rootScope.endorsements = [
            {id: 1, name: 'T'},
            {id: 2, name: 'N'},
            {id: 3, name: 'H'},
            {id: 4, name: 'MIL'},
            {id: 5, name: 'TEAM'}
        ];


        $scope.$watch('contentLoaded', function () {
            if ($scope.contentLoaded && !$scope.sharedCtrl && !$scope.mainCtrlInited) initMainCtr();
        });

        $scope.$watch('alerts', function (newVal, oldVal) {
            _.each($scope.alerts, function (val, key) {
                if (!val.timeout) {
                    $scope.alerts[key]['timeout'] = setTimeout(function () {
                        $scope.$apply(function () {
                            $scope.alerts.shift();
                        });
                    }, Configs.CLEAR_ALERTS);
                }
            })
        }, true);

        $scope.$on('alertMessage', function (event, message) {
            $scope.alerts.push({type: message.type, message: message.message});
        });

        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };

        function initMainCtr() {

            $scope.$on('createOrderOpen', checkCreateOrderOpen);

            $scope.mainCtrlInited = true;
            $scope.logOut = function () {
                $scope.contentLoaded = false;
                $cookieStore.remove('jwt');
                $cookieStore.remove('socketToken');
                $cookieStore.remove('role');
                FR8Cookies.deleteCookie('jwt', '/', $location.host());
                FR8Cookies.deleteCookie('socketToken', '/', $location.host());
                FR8Cookies.deleteCookie('role', '/', $location.host());

                if ($window.ga) {
                    $window.ga('send', 'event', 'app', 'logOut', 'logOut');
                }

                $scope.socketSubscribeToken = undefined;

                var redirectURL;
                switch (Configs.CUR_ENV) {
                    case "STAGE":
                        redirectURL = 'http://site.stage.fr8.guru/';
                        break;
                    case "DEV":
                        redirectURL = 'http://fr8.dev/';
                        break;
                    case "PROD":
                        redirectURL = 'http://www.fr8.guru/';
                        break;
                    case "STABLE":
                        redirectURL = 'https://stable.fr8.guru/';
                        break;
                }
                window.location.href = redirectURL;
            };

            /**
             * Open load details modal
             * Call drivers profile,
             * itialize google map.
             * @param serverID
             */
            $scope.loadDetalisEvent = function (serverID) {
                $scope.loadDetailsMovementId = serverID;
                $scope.createOrderModalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: './modules/global/orderDetails/index.html',
                    controller: 'OrderDetailsCtrl',
                    controllerAs: 'vm',
                    windowClass: 'event-details',
                    size: 'lg',
                    resolve: {
                        movementId: function () {
                            return $scope.loadDetailsMovementId;
                        },
                        orderDetails:false,
                        shareToken:false,
                    }
                });

                $scope.createOrderModalInstance.result.then(function (selectedItem) {
                    $scope.selected = selectedItem;
                }, function () {
                    $('.modal-backdrop').remove();
                    //createOrder.destroy();
                });

            };

            $scope.redirectToFindLoads = function(event, gapInfo){
                var dateValidate = gapInfo.endWindowEnd > moment().unix()*1000;
                if($(event.target).hasClass('equipments') || !dateValidate) return;
                var gapData = {
                    startAddress:gapInfo.startAddress,
                    endAddress:gapInfo.endAddress,
                    maxStartDeadhead:150,
                    maxEndDeadhead:gapInfo.endAddress ? 150 : false,
                    startDate: gapInfo.from < moment(new Date()) ? moment(new Date()).toDate() :  gapInfo.from.toDate(),
                    endDate:gapInfo.to.toDate(),
                    startUnix:gapInfo.from < moment(new Date()) ? moment(new Date()).unix()*1000 : gapInfo.unixStart,
                    endUnix:gapInfo.unixEnd,
                    equipment:gapInfo.equipments,
                    forceClick:true
                };
                searchLoads.collectedData = gapData;
                $location.path('findloads');
            };

            var confirmInProgress = false;

            $scope.confirmNotification = function (data, rate, rate_class) {
                if(confirmInProgress) return;
                confirmInProgress = true;
                if (rate) $scope.rating[data.serverId] = rate;
                Notifications.confirm(data, rate, $scope.notifications, $scope.allNotifications, function (response) {
                    $scope.notifications = response.notifications;
                    $scope.allNotifications = response.allNotifications;
                    if($scope.notifications.length <=3 && $scope.allNotifications.length > 0){
                        $scope.notificationsFrom = 0;
                        $scope.notificationTo = 10;
                        $scope.loadMoreNotifications();
                    }
                    $scope.rating = [];
                    confirmInProgress = false;
                });
            };

            $scope.updateNotification = function (data) {
                var newNotifications = dataBuilder.notificationsMapper(data);
                _.each(newNotifications, function (val, key) {
                    $scope.allNotifications.unshift(val);
                    $scope.notifications.unshift(val);
                });
                $scope.notificationBadge = $scope.notifications.length;
                $timeout(function(){
                    if(!$scope.$$phase) {
                        $scope.$apply();
                    }
                })
            };

            $scope.socketSubscribeToken = $cookieStore.get('socketToken');

            $scope.$on('reconnectSocket', function (event, message) {
                initSocketNotifications();
            });

            $scope.$watch('firstLogIn', function (val) {
                if (val) initSocketNotifications();
            });

            $scope.$on('openOrderDetails', function (event, message) {
                $scope.loadDetalisEvent(message.movementId);
            });

            $scope.$on('socketToken', function (event, data) {
                initSocketToken(data.socketToken);
            });


            /**
             * Initialize notifications service
             * and socket service
             * Each socket push will broadcast to depending controller
             *
             */
            function initSocketToken(socketToken) {
                if (socketToken) $scope.socketSubscribeToken = socketToken;
                if ($scope.socketSubscribeToken) {
                    $timeout(function () {
                        Notifications.get(dataBuilder, function (response) {
                            $scope.allNotifications = response.notifications.filter(function (element) {
                                return !!element;
                            });
                            $scope.notifications = [];
                            $scope.notificationBadge = response.notificationBadge;
                            $scope.notificationsFrom = 0;
                            $scope.notificationTo = 10;
                        });
                    }, 500);
                    var notificationsBusy = false;
                    $scope.loadMoreNotifications = function () {
                        if (notificationsBusy || $scope.allNotifications.length == $scope.notifications.length) return;
                        notificationsBusy = true;
                        var splittedData = $scope.allNotifications.slice($scope.notificationsFrom, $scope.notificationTo);
                        $scope.notifications = $scope.notifications.concat(splittedData);
                        $scope.notificationsFrom += 10;
                        $scope.notificationTo += 10;
                        notificationsBusy = false;
                    }
                }
            }

            function broadcastSocket(data){
                _.each(data, function (update) {
                    switch (update.type) {
                        case 1:
                            $scope.updateNotification(update.notificationUpdate.notifications);
                            break;
                        case 2:
                        case 3:
                        case 4:
                        case 14:
                            $debounce(ganttBuilder.reloadDriversData(update.driver, function (response) {
                                $scope.$broadcast('updateDriver', {
                                    item: update.driver,
                                    type: update.type
                                });
                                $rootScope.$broadcast('updateOrderDetialsDriver', update.driver);
                            }), 500);
                            $debounce($rootScope.$broadcast('updateDriverInTeam', {}), 500);
                            break;
                        case 5:
                            $debounce($scope.$broadcast('updateAll', update));
                            break;
                        case 6:
                            $debounce($rootScope.$broadcast('orderDetailsUpdate', update), 500);
                            $debounce($rootScope.$broadcast('orderUpdated', update.schedule), 300);
                            if(update.schedule.type == 6){
                                $debounce($scope.$broadcast('ganttUpdate', {
                                    item: update.schedule,
                                    type: 'edit'
                                }), 300);
                            }
                            break;
                        case 7:
                            $debounce($scope.$broadcast('ganttUpdate', {
                                item: update.deletedId,
                                type: 'delete'
                            }), 300);
                            break;
                        case 8:
                        case 9:
                        case 10:
                        case 11:
                        case 16:
                        case 17:
                            $debounce($scope.$broadcast('updatePredefineFilter', update), 300);
                            break;
                        case 15:
                        case 13:
                            $debounce($scope.$broadcast('updateAll', update));
                            break;
                        case 18:
                            $debounce($rootScope.$broadcast('pushToSchedule', update));
                            break;
                        case 12:
                            $debounce($scope.$broadcast('freeCapUpdate', {message: 'capUpdate'}), 300);
                            break;
                        case 19:
                            $debounce($rootScope.$broadcast('orderDetailsUpdate', update), 500);
                            $debounce($rootScope.$broadcast('orderUpdated', update.order), 300);
                            break;
                        case 21:
                            $debounce($scope.$broadcast('updateDriverOrders', update), 300);
                            $debounce($rootScope.$broadcast('newData', {}), 500);
                            break;
                    }
                });
                $scope.socketBuffer = [];
            }

            initSocketToken();

            function initSocketNotifications() {
                $scope.rating = [];
                if ($scope.socketSubscribeToken) {

                    if (!Socket.scope) Socket.scope = $scope;

                    Socket.init(function () {
                        Socket.subscribe("/topic/socketUpdates/" + $scope.socketSubscribeToken + "", function (response) {
                            var responseBody = JSON.parse(response.body);
                            console.log('sock.:', responseBody);

                            var deletedOrders = _.filter(responseBody, function (responses) {
                                return responses.type == 20;
                            });

                            if (deletedOrders.length > 0) {
                                deletedOrders = _.map(deletedOrders, function (obj) {
                                    return obj.deletedId;
                                });
                                $rootScope.$broadcast('removeOrders', deletedOrders);
                            }

                            if($scope.blockSocketPushes){
                                return $scope.socketBuffer = $scope.socketBuffer.concat(responseBody);
                            }
                            broadcastSocket(responseBody);
                        });
                    });
                }
            }

            initSocketNotifications();

            function checkCreateOrderOpen(event, isOpen){
                $scope.blockSocketPushes = isOpen;
                console.log($scope.socketBuffer);
                if(!isOpen && $scope.socketBuffer.length > 0){
                    broadcastSocket($scope.socketBuffer);
                }
            }
        }

    });

    String.prototype.capitalize = function () {
        return this.replace(/(?:^|\s)\S/g, function (a) {
            return a.toUpperCase();
        });
    };


}());

