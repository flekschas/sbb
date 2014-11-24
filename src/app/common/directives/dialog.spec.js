describe("app.common.directive.dialog (unit testing)", function() {
  "use strict";

  var $rootScope,
      $compile,
      $timeout,
      $scope,
      baseEl,
      dialogEl;

  beforeEach(function(){
    module('sbb');

    inject(function ($injector) {
      $rootScope = $injector.get('$rootScope');
      $compile = $injector.get('$compile');
      $timeout = $injector.get('$timeout');

      baseEl = '<div><sbb-dialog></sbb-dialog><div id="other"></div></div>';
      baseEl = $compile(baseEl)($rootScope.$new());

      $rootScope.$digest();

      dialogEl = angular.element(baseEl[0].querySelector('#dialog'));
      $scope = dialogEl.scope();
    });
  });

  it('should have a `close` function',
    function () {
      expect(typeof($scope.close)).toEqual('function');
    }
  );

  it('should be closed (no `show` class) by default',
    function () {
      expect(dialogEl.hasClass('show')).toEqual(false);
    }
  );

  it('`content` element should be emtpy by default',
    function () {
      expect(dialogEl[0].querySelector('.content').childNodes.length).toEqual(0);
    }
  );

  it('should compile template, scope and show the `dialog`',
    function () {
      var data = {
            tpl: 'browser/partials/dialogs/gxe.html',
            size: 'large',
            scope: {
              title: 'title',
              repo: 'repo',
              acc: 'acc',
              url: 'url',
              pmid: [
                1, 2, 3
              ],
              desc: 'description',
              org: [
                'organisation 1', 'organisation 2', 'organisation 3'
              ],
              person: [
                'person 1', 'person 2', 'person 3'
              ]
            }
          };

      $rootScope.$broadcast('sbbDialog:open', data);
      $rootScope.$digest();

      expect($scope.large).toEqual(true);
      expect($scope.content).toEqual(data.scope);

      /*
       * Flush timeout to see if the dialog now has a `show` class.
       */
      $timeout.flush();

      expect(dialogEl.hasClass('show')).toEqual(true);

      expect(dialogEl.find('h3').text()).toEqual(data.scope.title);
    }
  );

  it('should remove the `show` class when the `close` function is called on elements not within the `.content` element',
    function () {
      expect(dialogEl.hasClass('show')).toEqual(false);

      $rootScope.$broadcast('sbbDialog:open', {});
      $rootScope.$digest();
      $timeout.flush();

      expect(dialogEl.hasClass('show')).toEqual(true);

      dialogEl.triggerHandler('click');
      $rootScope.$digest();

      expect(dialogEl.hasClass('show')).toEqual(false);

      $rootScope.$broadcast('sbbDialog:open', {});
      $rootScope.$digest();
      $timeout.flush();

      expect(dialogEl.hasClass('show')).toEqual(true);

      angular.element(dialogEl[0].querySelector('.content')).triggerHandler('click');
      $rootScope.$digest();

      expect(dialogEl.hasClass('show')).toEqual(true);

    }
  );
});
