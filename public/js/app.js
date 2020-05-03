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
            $rootScope.categories = collectionsData.categories;
            $rootScope.tasks = collectionsData.tasks;
        })
    };
    app.getCollections();

    $rootScope.$on('loadCollections', function() {
        $location.path("/home");
        app.getCollections();
    });

    $rootScope.$watch('categories', function (newVal, oldVal) {
        if(newVal != oldVal){
            app.categories = $rootScope.categories;
        }
    })

    $rootScope.$watch('tasks', function (newVal, oldVal) {
        if(newVal != oldVal){
            app.tasks = $rootScope.tasks;
        }
    })
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


listingmind.controller("editController", function ($http, $rootScope, $scope) {
    let edit = this;

    edit.editCategory = function (category) {
        $rootScope.category = category;
    }

    edit.editTask = function (task) {
        $rootScope.task = task;
    }

    edit.finishTask = function(finishedTask){
        $http.patch(url + "/task/" + finishedTask._id, { finished: finishedTask.finished }).then(function () {
            $scope.$emit('loadCollections');
        })
    }

    edit.saveCategoryEdit = function(editedCategory){
        $http.put(url + "/category/" + editedCategory._id, {name: editedCategory.name}).then(function () {
            delete $rootScope.category;
            $scope.$emit('loadCollections');
        })
    }

    edit.saveTaskEdit = function(editedTask){
        $http.put(url + "/task/" + editedTask._id, editedTask).then(function () {
            delete $rootScope.task;
            $scope.$emit('loadCollections');
        })
    }
});