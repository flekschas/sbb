angular
  .module('sbb.about')
  .factory('aboutInitData', ['$q', 'versionService',
    function ($q, versionService) {
      return function () {
        var changelog = versionService.getChangelog();
        var versions = versionService.getVersions();

        return $q.all([changelog, versions]).then(function (results) {
          return {
            changelog: results[0],
            versions: results[1]
          };
        });
      };
    }
  ]);
