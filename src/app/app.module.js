angular.module( 'sbb', [
  /*
   * HTML in JS templates for All-In-One loading
   */
  'templates-app',
  'templates-common',

  /*
   * Third party modules
   */

  /*
   * Angular modules
   */
  'ngRoute',
  'ngTouch',

  /*
   * Common
   */
  'errors',

  /*
   * Semantic Body Browser modules
   */
  'sbb.home',
  'sbb.about',
  'sbb.legals',
  'sbb.browser'
]);
