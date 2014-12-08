angular
  .module( 'fileReader', [] )
  .factory( 'fileReader', [
    function () {
      var files = [];

      /*
       * Test if the browser fully supports the HTML5 File-API
       */
      function isSupported () {
        if (window.File && window.FileReader && window.FileList && window.Blob) {
          return true;
        } else {
          return false;
        }
      }

      function link ( scope, element, attrs ) {
        var supported = isSupported();

        function handleFileSelect (evt) {
          files = evt.target.files;
        }

        function handleFileDrop (evt) {
          evt.stopPropagation();
          evt.preventDefault();

          files = evt.dataTransfer.files;
        }

        function handleFileDragOver (evt) {
          evt.stopPropagation();
          evt.preventDefault();
          evt.dataTransfer.dropEffect = 'copy';
        }

        if (type === 'drag') {
          element.on('dragover', handleFileDragOver);
          element.on('drop', handleFileDrop);
        } else if (type === 'select') {
          element.on('change', handleFileSelect);
        }
      }

      return {
        link: link,
        replace: true,
        restrict: 'E',
        scope: true,
        templateUrl: 'directives/fileReader/fileReader.html'
      };
    }
  ]);
