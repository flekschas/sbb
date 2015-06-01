angular
  .module('sbb.browser')
  .filter('devStage', [
    function () {
      // Reformat the developmental stage name
      return function (s, species) {
        try {
          if (species == 'mouse') {
            var regex = /cs-([0-9]+)([a-zA-Z]?)/g;
            var match = regex.exec(s);
            var theiler;
            if (match !== null) {
              // According to:
              // http://bioinformatics.oxfordjournals.org/content/28/3/397/T1.expansion.html
              switch (parseInt(match[1])) {
                case 1:
                  theiler = 1;
                  break;
                case 2:
                  theiler = 2;
                  break;
                case 3:
                  theiler = 4;
                  break;
                case 4:
                  theiler = 6;
                  break;
                case 5:
                  theiler = 8;
                  break;
                case 6:
                  theiler = 9;
                  break;
                case 7:
                  theiler = 10;
                  break;
                case 8:
                  theiler = 11;
                  break;
                case 9:
                  theiler = 12;
                  break;
                case 10:
                  theiler = 13;
                  break;
                case 11:
                  theiler = 14;
                  break;
                case 12:
                  theiler = 15;
                  break;
                case 13:
                  theiler = 16;
                  break;
                case 14:
                  theiler = 17;
                  break;
                case 15:
                  theiler = 18;
                  break;
                case 16:
                  theiler = 19;
                  break;
                case 17:
                  theiler = 20;
                  break;
                case 18:
                  theiler = 21;
                  break;
                case 19:
                  theiler = 21;
                  break;
                case 20:
                  theiler = 22;
                  break;
                default:
                  return 'Adult';
              }
            } else {
              return 'Adult';
            }
            return 'Carnegie stage ' + match[1] + match[2] +
                   ' (Theiler stage ' + theiler + match[2] + ')';
          }
          // Default return expects Carnegie Stage as the input
          return s.replace('cs-', 'Carnegie stage ');
        } catch (e) {
          return s;
        }
      };
    }
  ]);
