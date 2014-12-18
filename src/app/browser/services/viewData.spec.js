describe("browser.service.viewData (unit testing)", function() {
  "use strict";

  /*****************************************************************************
   * Global Variables
   ****************************************************************************/

  var $rootScope,
      $httpBackend,
      viewData,
      settings,
      fakeViewData = {
          "view": {
              "name": "human-pretubular-aggregate",
              "level": "nephron",
              "gender": null,
              "genderOntId": null,
              "stage": "cs-17a",
              "species": "human",
              "speciesOntId": "NCBITaxon_9606",
              "ontId": "CELDA_000001474",
              "imgSrc": "",
              "prefix": "renal",
              "license": "Creative Commons BY-SA 4.0",
              "holdCopyright": 1
          },
          "units": [
              {
                  "view": "human-pretubular-aggregate",
                  "name": "cap-mesenchyme",
                  "ont_id": "UBERON_0005107",
                  "custom_zoom": null,
                  "generic_zoom": null,
                  "title": null,
                  "custom_prefix": null,
                  "overlayed": null,
                  "uberon": null,
                  "url": null,
                  "zoom": null
              }
          ],
          "zoomOutLevels": [
              {
                  "level": "body",
                  "male": "human-adult-male-body",
                  "female": "human-adult-female-body"
              }
          ],
          "definitions": [],
          "synonyms": [],
          "pictures": [],
          "prefixes": [
              {
                  "abbr": "celda",
                  "prefix": "http://ontology.cellfinder.org/CELDA.owl#"
              }
          ],
          "expDatasets": null
      },
      fakeIllustration = {
        "uri": null,
        "elements": [],
        "id": "collecting-duct"
      },
      fakeDevStages = [
          {
              "name": "mouse-adult-kidney",
              "level": "kidney",
              "stage": "adult",
              "species": "mouse",
              "gender": null,
              "order": "27"
          }
      ];


  /*****************************************************************************
   * Global Setting / Setup
   ****************************************************************************/

  beforeEach(function() {
    module('sbb');
    module('sbb.browser');

    inject(function ($injector) {
      viewData = $injector.get('viewData');

      $rootScope = $injector.get('$rootScope');
      $httpBackend = $injector.get('$httpBackend');
      settings = $injector.get('settings');
    });
  });


  /*****************************************************************************
   * General / Existance Testing
   ****************************************************************************/

  it('should contain the viewData',
    function () {
      expect(viewData).not.toEqual(null);
    }
  );

  it('exists the `getView` function',
    function () {
      expect(typeof(viewData.getView)).toEqual('function');
    }
  );

  it('exists the `getIllustration` function',
    function () {
      expect(typeof(viewData.getIllustration)).toEqual('function');
    }
  );

  it('exists the `getDevStages` function',
    function () {
      expect(typeof(viewData.getDevStages)).toEqual('function');
    }
  );


  /*****************************************************************************
   * Functional Testing
   ****************************************************************************/

  it('should resolve promises',
    function () {
      var path = 'test',
          imgSrc = 'test',
          level = 'test',
          view,
          illustration,
          devStages;

      $httpBackend
        .expectGET(settings.apiPath + path)
        .respond(fakeViewData);

      $httpBackend
        .expectGET(settings.illuPath + imgSrc + '.json')
        .respond(fakeIllustration);

      $httpBackend
        .expectGET(settings.apiPath + 'find/' + level)
        .respond(fakeDevStages);

      viewData.getView(path)
        .then(function(data){
          view = data;
        });

      viewData.getIllustration(imgSrc)
        .then(function(data){
          illustration = data;
        });

      viewData.getDevStages(level)
        .then(function(data){
          devStages = data;
        });

      $httpBackend.flush();
      $rootScope.$digest();

      expect(view).toEqual(fakeViewData);
      expect(illustration).toEqual(fakeIllustration);
      expect(devStages).toEqual(fakeDevStages);
    }
  );

  it('should reject errors',
    function () {
      var path = 'test',
          imgSrc = 'test',
          level = 'test',
          viewErr,
          illustrationErr,
          devStagesErr;

      $httpBackend
        .expectGET(settings.apiPath + path)
        .respond(500, 'error');

      $httpBackend
        .expectGET(settings.illuPath + imgSrc + '.json')
        .respond(500, 'error');

      $httpBackend
        .expectGET(settings.apiPath + 'find/' + level)
        .respond(500, 'error');

      viewData
        .getView(path)
        .catch(function (e) {
          viewErr = e;
        });

      viewData
        .getIllustration(imgSrc)
        .catch(function (e) {
          illustrationErr = e;
        });

      viewData
        .getDevStages(level)
        .catch(function (e) {
          devStagesErr = e;
        });

      $httpBackend.flush();
      $rootScope.$digest();

      expect(viewErr).toEqual('error');
      expect(illustrationErr).toEqual('error');
      expect(devStagesErr).toEqual('error');
    }
  );

});
