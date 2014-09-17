# Semantic Body Browser

<p align="center">
  <img src="http://sbb.cellfinder.org/github.svg"
       alt="Semantic Body Browser" />
</p>

This is the repository of the [Semantic Body Browser][sbb] web application. More
background information about the project can be found on the project's
[about][about] page.


## Abstract

The Semantic Body Browser (SBB) is a web application for intuitively exploring
the body of an organism from the organ to the sub-cellular level and visualising
expression profiles by means of semantically annotated illustrations. It is used
to comprehend biological and medical data related to the different body
structures while relying on the strong pattern recognition capabilities of human
users.


## Requirements

All you need to get the Semantic Body Browser up and running is:

* [Apache web server][ape] with [mod_rewrite][mrw] enabled
* Internet connection
* [Node.js][nodejs] with [NPM][npm] (1)
* Modern [web browser][wb]

1) You can also download a pre-compiled version then you don't need Node.js.


## Installation

1. Check out the repository somewhere into your Apache document root directory:

   `git clone https://github.com/flekschas/sbb /path/to/apache/root/somewhere`

2. Edit `build.config.json` and set `apache_root` to your Apache document root
   directory.

4. Install Grunt, Bower and Karma:
  * `npm install -g grunt-cli bower`
  * `npm install`
  * `bower install`

5. Build and compile the application:
   `grunt`

6. Point your favourite browser to `localhost/somewhere/bin`.

7. Be happy and start exploring!


## Contributions & Hacking

If you feel like hacking the SBB the easiest way to do so is to run
`grunt watch`, open `localhost/somewhere/build` and activate [live reload][lr].
Any changed to the source code will invoke the linting and testing and reload
the page automatically.

If you found bugs or have suggestions please let us know by [filing an issue][i]
on GitHub. In case you are so great and already fixed bugs or implemented a new
feature please send a [pull request][p].


## Implementation

The Semantic Body Browser is a JavaScript web application build with Angular.
We make use of the following great frameworks and libraries:

* [Angular][ng]
* [Raphaël][rp]
* [jQuery][jq]
* [BindOnce][bo]
* [Mousewheel][mw]
* [Hammer.js][ha]
* [FileSaver][fs]
* [Blob][bl]
* [Spin.js][sp]
* [isMobile][im]

### Folder Structure

We organise code by the *[folders-by-features][fbf]* directory structure and
stick to the [LIFT][lift] paradigm.

    app/
        about/
            directives/
                directiveOne.html
                directiveOne.js
                directiveOne.spec.js
                ...
            filters/
                filterOne.js
                filterOne.spec.js
                ...
            services/
                serviceOne.js
                serviceOne.spec.js
                ...
            partials/
                snippetOne.html
                ...
            controller.js
            controller.spec.js
            module.js
            module.spec.js
            route.js
            template.html
        browser/
            ...
        common/
            ...
        home/
            ...
        legals/
            ...
        app.config.js
        app.controller.js
        app.controller.spec.js
        app.libraries.js
        app.module.js
        app.module.spec.js
        app.settings.js
    assets/
        fonts/
        illustrations/
        images/
    common/
        directives/
            directiveOne/
                directiveOne.html
                directiveOne.js
                directiveOne.spec.js
            ...
        filters/
            filterOne/
                filterOne.js
                filterOne.spec.js
            ...
        services/
            serviceOne/
                serviceOne.js
                serviceOne.spec.js
            ...
    styles/
        app.scss
        ...
    .htaccess
    index.html

In general we omit prefixes for file names as they only make names longer
without adding information that isn't already given by the folder structure. So
instead of for example `sbbAboutDirectiveNameOne.js` we just call them
`nameOne.js`. Having said that the actual name of the directive, filter or
service keeps the prefix the same.

Also, we distinguish between directives, services and filter specific for:

* a feature
* the application
* or are generic

### Build System

We use [Grunt][grunt] for our build system and based it on 
[ngBoilerplate ][ngbp] and [Yeoman][yo].


## License

Web application is licensed under [GNU General Public License (GPL) Version 3.0][gnu].
Unless otherwise stated content is licensed under [Creative Commons BY-SA 4.0][cc].

Copyright © 2012-2014 Lekschas et al.


[about]: http://sbb.cellfinder.org/about
[ape]: https://httpd.apache.org/
[bl]: https://github.com/eligrey/Blob.js
[bo]: https://github.com/Pasvaz/bindonce
[cc]: https://creativecommons.org/licenses/by-sa/4.0/
[fbf]: https://github.com/johnpapa/angularjs-styleguide#application-structure-lift-principle
[fs]: https://github.com/eligrey/FileSaver.js
[gnu]: LICENSE
[grunt]: http://gruntjs.com/
[ha]: https://github.com/hammerjs/hammer.js
[i]: https://github.com/flekschas/sbb/issues
[im]: https://github.com/kaimallea/isMobile
[jq]: https://github.com/jquery/jquery
[lift]: https://github.com/johnpapa/angularjs-styleguide#application-structure-lift-principle
[lr]: http://livereload.com/
[mrw]: https://httpd.apache.org/docs/current/mod/mod_rewrite.html
[mw]: https://github.com/brandonaaron/jquery-mousewheel
[ng]: https://github.com/angular/angular.js
[ngbp]: https://github.com/ngbp/ngbp
[nodejs]: http://nodejs.org/
[npm]: https://www.npmjs.org/
[p]: https://github.com/flekschas/sbb/pulls
[rp]: https://github.com/DmitryBaranovskiy/raphael/
[sbb]: http://sbb.cellfinder.org
[sp]: https://github.com/fgnass/spin.js
[wb]: http://sbb.cellfinder.org/about#compatability
[yo]: https://github.com/yeoman/generator-angular
