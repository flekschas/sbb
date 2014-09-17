angular
  .module( 'sbb.browser' )
  .directive( 'sbbGender', [ 'storage',
    function(storage) {
      return function(scope) {
        scope.genderEnabled = false;

        scope.$watch('gender', function() {
          switch (scope.gender) {
            case 'male':
              scope.genderIcon = '2';
              break;
            case 'female':
              scope.genderIcon = 'f';
              break;
          }
        });

        // Look for views of different species with the same developmental stage
        scope.$watch('similarViews', function(value) {
          if (value) {
            for (var i = value.length; i--;) {
              if (value[i].stage === scope.data.view.stage && value[i].species === scope.data.view.species && value[i].gender !== scope.gender && value[i].gender !== null) {
                scope.genderLink = value[i].name;
                scope.genderEnabled = true;
              }
            }
          }
        });

        scope.changeGender = function() {
          scope.setLocation(scope.genderLink, true);
        };
      };
    }
  ]);
