var templateApp = angular.module('templateApp',['ngRoute', 'ngAnimate']); //[] is for dependancies. aka to inject data from another module


//************FACTORIES*************************


templateApp.factory('templateFactory', function($http){

	//make function getSynonym() to store common synonyms for each test we use.
	

	var factory = {};

	factory.getMicrobes = function() {
		return $http.get('microbes.json', { data: {} }) //grab data from microbes.json and return when templateFactory.getMicrobes() is called.
	};

	factory.getTests = function() {
		return $http.get('tests.json', { data: {} }) //grab data from microbes.json and return when templateFactory.getMicrobes() is called.
	};


	return factory; //return factory and data into wherever factory is injected.

});


//**********************************************



//**************CONTROLLERS*********************
	

//could define another controller with controllers.othercontroller = function($scope) {etc}

templateApp.controller('templateController', function($scope, $rootScope, templateFactory, $location) {  //add controller to the controllers object. add factory data.


	init();

	function getTestByName(testName) {
		var array = $rootScope.tests;
		var length = array.length;
		for (i=0; i<length; i++) {
			if (array[i].className == testName) {
				var test = array[i];
				return test;
			}
		}
	}

	function addToTestsSelected(testName) {
		var test = getTestByName(testName);
		$rootScope.testsSelected.push(test);
	}

	function removeFromTestsSelected(testName) {
		var test = getTestByName(testName);
		var array = $rootScope.testsSelected;
		var length = array.length
		var index = array.indexOf(test);
		if (index < 0) {
			return false; //ends function if test not in testsSelected.
		}
		for (i=index; i<length; i++) {
			myTest = array[i];
			if ($rootScope.buttonFilters[myTest.className]) {
				delete $rootScope.buttonFilters[myTest.className];
			}
			if (myTest.posBtn) {
				myTest.posBtn ='';
			}
			if (myTest.negBtn) {
				myTest.negBtn = '';
			}
		}
		array.splice(index);
		$scope.buttonFilters = $rootScope.buttonFilters;
	}

	function init() {

		$rootScope.microbes = [];

		//load microbe data
		templateFactory.getMicrobes().success(function(data) {
			$scope.microbes = data;
			$rootScope.microbes = data;
		});

		//load test data if not already loaded.
		templateFactory.getTests().success(function(data) {
			if (!$rootScope.tests) {
				$rootScope.tests = data;
			}
		});


		//defaults display organism on view2 to first in list
		if (!$rootScope.selected) { 
			$rootScope.selected = $scope.microbes[0]; //need to debug later. not pulling up default.
		}
		//syncs up scope with rootScope values so data is saved between pages.
		if ($rootScope.buttonFilters) { 
			$scope.buttonFilters = $rootScope.buttonFilters;
			$scope.test = $rootScope.test;
		}
		else { //creates buttonFilters on first page load.
			$scope.buttonFilters = {};
			$scope.testsSelected = [];
			$rootScope.buttonFilters = $scope.buttonFilters;
			$rootScope.testsSelected = $scope.testsSelected;
		}
	}

	$scope.reset = function() {
		
		templateFactory.getTests().success(function(data) {
			$rootScope.tests = data;
		});

		$scope.buttonFilters = {};
		$rootScope.buttonFilters = $scope.buttonFilters;
		$scope.testsSelected = [];
		$rootScope.testsSelected = $scope.testsSelected;
		$scope.posQuery = '';
		$scope.negQuery = '';
		$rootScope.GSPosBtn = '';
		$rootScope.GSNegBtn = '';
	}

	$scope.addMicrobe = function(){
		if ($scope.newMicrobe.microbeName.trim() !='' && $scope.newMicrobe.gs != '') {
			$scope.microbes.push({
				name: $scope.newMicrobe.microbeName,
				gs: $scope.newMicrobe.gs
			});
		}
		
		$scope.newMicrobe.microbeName = '';
		$scope.newMicrobe.gs = '';
	}

	$scope.selectMicrobe = function(microbe) {
		$rootScope.selected = microbe;
		$location.path('/view2');
	}


	

	$rootScope.togglePos = function (test) {
		if ($rootScope.buttonFilters[test.className] == 'positive') {
			test.posBtn = '';
			delete $rootScope.buttonFilters[test.className];
			if (test.nextPosTest) {
				removeFromTestsSelected(test.nextPosTest);
			}
		}
		else {
			$rootScope.buttonFilters[test.className] = 'positive';
			test.posBtn = 'pressed';
			test.negBtn ='';
			if (test.nextNegTest) {
				removeFromTestsSelected(test.nextNegTest);
			}
			if (test.nextPosTest) {
				addToTestsSelected(test.nextPosTest);
			}
		}
	}

	$scope.toggleNeg = function (test) {
		if ($rootScope.buttonFilters[test.className] == 'negative') {
			test.negBtn = '';
			delete $rootScope.buttonFilters[test.className];
			if (test.nextNegTest) {
				removeFromTestsSelected(test.nextNegTest);
			}
		}
		else {
			$rootScope.buttonFilters[test.className] = 'negative';
			test.negBtn = 'pressed';
			test.posBtn ='';
			if (test.nextPosTest) {
				removeFromTestsSelected(test.nextPosTest);
			}
			if (test.nextNegTest) {
				addToTestsSelected(test.nextNegTest);
			}
		}
	}

	$scope.toggleGSPos = function() {
		if ($rootScope.buttonFilters.gs == 'Gram Positive') {
			$rootScope.buttonFilters.gs = '';
			$rootScope.GSPosBtn = '';
			removeFromTestsSelected('catalase');
		}
		else {
			$rootScope.buttonFilters.gs = 'Gram Positive';
			$rootScope.GSPosBtn = 'pressed';
			$rootScope.GSNegBtn ='';
			removeFromTestsSelected('oxidase');
			addToTestsSelected('catalase');
		}
	}

	$scope.toggleGSNeg = function() {
		if ($rootScope.buttonFilters.gs == 'Gram Negative') {
			$rootScope.buttonFilters.gs = '';
			$rootScope.GSNegBtn = '';
			removeFromTestsSelected('oxidase');
		}
		else{
			$rootScope.buttonFilters.gs = 'Gram Negative';
			$rootScope.GSNegBtn = 'pressed';
			$rootScope.GSPosBtn = '';
			removeFromTestsSelected('catalase');
			addToTestsSelected('oxidase');
		} 
	}


	$scope.algorithmFilter = function(test) {
		var testsSelected = $scope.testsSelected;
		if (testsSelected.indexOf(test) > -1) {
			return true;
		}
		else {
			return false;
		}
	}


	$scope.posTestFilter = function (microbe, posQuery) { 

		function arrayToLower(array) {
			var lowerArray = [];
			for (var i= 0, L=array.length; i<L; i++) {
				lowerArray[i] = array[i].toLowerCase();
			}
			return lowerArray;
		}


	    console.log(arguments.length);
        if (!$scope.posQuery) { //displays all entries if no query
        	$rootScope.posQuery = ''; //sets rootscope back to nothing when there is no query
        	return true;
        }


        $rootScope.posQuery = $scope.posQuery; //keeps query when shifting between views


        var queryArray = $scope.posQuery.split(' ');
        var posArray = arrayToLower(microbe.pos);

	    for (i=0; i<queryArray.length; i++) {
	    	var matchesone = false;

	    	if (microbe.microbeName.toLowerCase().indexOf(queryArray[i].toLowerCase()) > -1 || //checks if query is found in name or gs
	    		microbe.gs.toLowerCase().indexOf(queryArray[i].toLowerCase()) > -1) {
	    		matchesone = true;
	    	}

	    	for (j=0; j<posArray.length; j++) { //checks if query is found in positive tests, and changes matchesone to true if found.
	    		if (posArray[j].indexOf(queryArray[i].toLowerCase()) > -1) {
	    			matchesone = true;
	    			break;
	    		}
	    	}

	    	if (!matchesone) {
	    		return false; //does not display item if it doesnt match at least one query.
	    	}
	    }
        return  true; //displays query if it matches all queries.
    };

    $scope.negTestFilter = function (microbe, negQuery) { 

		function arrayToLower(array) {
			var lowerArray = [];
			for (var i= 0, L=array.length; i<L; i++) {
				lowerArray[i] = array[i].toLowerCase();
			}
			return lowerArray;
		}


	    console.log(arguments.length);
        if (!$scope.negQuery) { //displays all entries if no query
        	$rootScope.negQuery = ''; //sets rootscope back to nothing when there is no query
        	return true;
        }


        $rootScope.negQuery = $scope.negQuery; //keeps query when shifting between views


        var queryArray = $scope.negQuery.split(' ');
        var posArray = arrayToLower(microbe.neg);

	    for (i=0; i<queryArray.length; i++) {
	    	var matchesone = false;

	    	if (microbe.microbeName.toLowerCase().indexOf(queryArray[i].toLowerCase()) > -1 || //checks if query is found in name or gs
	    		microbe.gs.toLowerCase().indexOf(queryArray[i].toLowerCase()) > -1) {
	    		matchesone = true;
	    	}

	    	for (j=0; j<posArray.length; j++) { //checks if query is found in negative tests, and changes matchesone to true if found.
	    		if (posArray[j].indexOf(queryArray[i].toLowerCase()) > -1) {
	    			matchesone = true;
	    			break;
	    		}
	    	}

	    	if (!matchesone) {
	    		return false; //does not display item if it doesnt match at least one query.
	    	}
	    }
        return  true; //displays query if it matches all queries.
    };
}); //add controllers to module
	
//************************************************

//*************ROUTES*****************************

templateApp.config(function($routeProvider) {
	$routeProvider
		.when('/',
			{
				controller: 'templateController',
				templateUrl: 'view1.html'
			})
		.when('/view2', 
			{
				controller: 'templateController',
				templateUrl: 'view2.html'
			})
		//add route where '/isolateName' goes to view where data from that isolate is displayed.
		.otherwise({ redirectTo: '/' });
});