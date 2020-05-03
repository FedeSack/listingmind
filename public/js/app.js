let listingmind = angular.module('listingmind', [
    'ngRoute',
    'mobile-angular-ui',
]);

let url = "http://localhost:3000";

listingmind.config(function ($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'views/home.html',
        reloadOnSearch: false
    });
    $routeProvider.otherwise({
        redirectTo: '/'
    });
});

listingmind.controller("appController", function ($http, $location, $route, $rootScope) {
    let app = this;

    app.getCollections = function () {
        $http.get(url).then(function (collections) {
            let collectionsData = collections.data;
            app.categories = collectionsData.categories;
            app.tasks = collectionsData.tasks;
        })
    };
    app.getCollections();

    $rootScope.$on('loadCollections', function() {
        $location.path("/home");
        app.getCollections();
    });
});

listingmind.controller("addController", function ($http, $scope) {
    let add = this;

    add.createCategory = function(newCategory){
        $http.post(url + "/category", {name: newCategory}).then(function () {
            $scope.$emit('loadCollections');
        })
    }

    add.createTask = function(newTask){
        $http.post(url + "/task", newTask).then(function () {
            $scope.$emit('loadCollections');
        })
    }
});

listingmind.controller("deleteController", function ($http, $scope) {
    let app = this;

    app.deleteCategory = function(category){
        let deleteConf = confirm("Do you want to delete the category \"" + category.name + "\" and its tasks?");
        if (deleteConf == true) {
            $http.delete(url + "/category/" + category._id).then(function () {
                $scope.$emit('loadCollections');
            })
        }
    }

    app.deleteTask = function(task){
        let deleteConf = confirm("Do you want to delete the task \"" + task.name + "\"?");
        if (deleteConf == true) {
            $http.delete(url + "/task/" + task._id).then(function () {
                $scope.$emit('loadCollections');
            })
        }
    }
})