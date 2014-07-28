# Semantic Body Browser

This is the repository of the [Semantic Body Browser][sbb] web application. More
background information about the project can be found on the [here][about].


## Abstract

The Semantic Body Browser (SBB) is a web application for intuitively exploring
the body of an organism from the organ to the sub-cellular level and visualising
expression profiles by means of semantically annotated illustrations. It is used
to comprehend biological and medical data related to the different body
structures while relying on the strong pattern recognition capabilities of human
users.


## Requirements

All you need to get the Semantic Body Browser up and running is:

* [Apache web server][ape] with [mod_rewrite][mw] enabled
* Internet connection
* Modern [web browser][wb]


## Installation

1. Check out the repository somewhere into your Apache document root directory:

`$ git clone https://github.com/flekschas/sbb /path/to/apache/root/somewhere`

2. Open `.htaccess` and set the `Rewritebase` relative to your Apache document
root directory. (E.g. `Rewritebase /somewhere`)

3. Open `index.html` and set the same base directory as in 2. (E.g. `<base href="/somewhere">`)

4. Open with your favourite browser `localhost/somewhere`


## Technology

- [AngularJS][ng]
- [Raphaël][rp]
- [jQuery][jq]
- [Blob.js][bl]
- [FileSaver.js][fs]


## License

Application is licensed under [GNU General Public License (GPL) Version 3.0][gnu].
Unless otherwise stated content is licensed under [Creative Commons BY-SA 4.0][cc].

Copyright © 2012 Fritz Lekschas.


[about]: http://sbb.cellfinder.org/about
[ape]: https://httpd.apache.org/
[bl]: https://github.com/eligrey/Blob.js
[cc]: https://creativecommons.org/licenses/by-sa/4.0/
[fs]: https://github.com/eligrey/FileSaver.js
[gnu]: LICENSE
[jq]: https://github.com/jquery/jquery
[mw]: https://httpd.apache.org/docs/current/mod/mod_rewrite.html
[ng]: https://github.com/angular/angular.js
[rp]: https://github.com/DmitryBaranovskiy/raphael/
[sbb]: http://sbb.cellfinder.org
[wb]: http://sbb.cellfinder.org/about#compatability
