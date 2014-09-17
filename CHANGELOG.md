Changelog
=========

1.6.0 / 2014-09-xx
------------------

Linked data from EBI RDF integrated and completely re-organised directory
structure utilising *folders-by-feature*. Please see
the [README][README.md#Folder-Structure] for details.

**Enhancements:**

* Source code now organised by *folders-by-feature*.
* Gene expression experiments can now be searched. Double click on an entity and
  click on `Gene Expression`.
* Much more sophisticated build system with a growing number of tests.
* Re-implemented, responsive accordion. 
* Re-implemented results bars for displaying several different results depending
  on what has been searched. (I.e. SBB, EBI RDF, etc.)
* Re-implemented dialogs.
* API calls now encapsulated into services.

**Updates:**

* New icon for the drop down panel of the tree of resolutions. It now shows an
  actual tree instead of a magnifier.
* New icon for the drop down panel of the developmental stages. Should show the
  meiosis of a cell. Feedback is very welcome.
* Search inputs now feature a magnifier icon.
* AngularJS from 1.2.22 to 1.2.25

**Bug Fixes:**

* Lots of smaller bug fixes.


1.5.1 / 2014-09-08
------------------

A few minor bug and typo fixes.


1.5.0 / 2014-08-19
------------------

AngularJS and third party libraries update.

***Attention:*** Firefox 3.6.x is no longer being supported. Problems concerning
AngularJS and inline SVGs led to this decision. If you need support please
check out version [1.4.2][https://github.com/flekschas/sbb/releases/tag/v1.4.2]
which provides full support. The oldest version of Firefox supported.

**Enhancements:**

* Replaced the zoom-in / zoom-out list with a browse tree in the zoom drop down.
* Illustration is centered and scaled to fit perfectly when activating the help.
* Displaying copyright and license information about histological images in the
  bottom left corner.

**Updates:**

* AngularJS from 1.2.21 to 1.2.22.
* Normalize.css from 2.1.1 to 3.0.1.
* Hammer.js from 1.x to 2.0.2.
* Anatomical entities mapped to UBERON where possible.
* Updated and extended the about page with further supplementary information.

**Bug Fixes:**

* Search results for the entities had not been displayed on the home page even
  though they had been found.
* Fixed some annotations.


1.4.2 / 2014-07-28
------------------

AngularJS and third party libraries update.

**Updates:**

* AngularJS from 1.2.16 to 1.2.21.
* Filesaver.js with Blob.js


1.4.1 / 2014-05-26
------------------

Minor bug fixes.

**Bug Fixes:**

* Fixed a couple of minor bugs.


1.4.0 / 2014-05-09
------------------

New expression data for the human body gross view added. Expression values
changed from RPKM to TPM.

**Enhancements:**

* Added adrenal gland to the human adult female and male body gross view.
* Added a single gene isolation mode in the heatmap mode to easily display the
  RNA expression of a single gene.
* Added stacked bars underneath each biological entity in the heatmap mode to
  indicate each genes impact on the accumulative RNA expression level.
* Human BodyMap 2.0 from Ilumina added to the heat map modus of the human body
  gross view.

**Updates:**

* AngularJS to version 1.2.16.
* About page has been updated.
* RPKM expression values have been replaced by TPM.

**Bug Fixes:**

* Minor bug fixes.


1.3.2 / 2014-02-20
------------------

Mainly patches and minor visual enhancements.

**Enhancements:**

* Entities show expression value in heat map mode.
* Added button for downloading the current illustrations as it is viewed.

**Updates:**

* Information panel has been enhanced.
* jQuery from version 1.10 to 1.11.
* AngularJS from version 1.2.5 to 1.2.15.
* Renamed "unit" to "entities".

**Bug Fixes:**

* Couple of minor bugs have been fixed.


1.3.1 / 2014-02-05
------------------

Changed license of the application from Creative Commons to GNU GPLv3.

**Updates:**

* Changed license of the web application from Creative Commons to GNU GPL v3.


1.3.0 / 2013-12-15
------------------

Two new organs: liver and gall bladder, have been added. Update to AngularJS 1.2
and code clean-up.

**Enhancements:**

* 6 new illustration for exploring the liver and gall bladder in human and mouse
  have been added.

**Updates:**

* Changed expression color scheme to avoid misleading interpreation of 'red' vs
  'green'. The expression data does not represent under vs over expressed genes
  but rather expression vs high expression.
* Added small notification when the heat map modus is activated.
* General code clean-up. And reduction of third party libraries.
* RaphaelJS updated  to 2.1.2
* AngularJS migration from 1.0.8 to 1.2.3.

**Bug Fixes:**

* Auto transparency for highlighted units has been replaced by explicit
  mechanism to avoid unwanted effects.
* Lots of smaller bug fixes.


1.2.0 / 2013-11-15
------------------

Version 1.2 adds heatmap coloring to the Semantic Body Browser. Using the RNA
Seq Atlas as the source of RNA expressions it's possible to color the human body
illustration according to the expression (RPKM) of a selection of different
genes. This feature is currently a proof of concept only as it has been
discovered that RPKM values are not proof for cross sample comparison. We are
working on recalculating the the expression values Apart from that this release
features technical improvements, bug fixes and slight design refreshments.

**Enhancements:**

* Made the Semantic Body Browser indexable for search engines.
* Breadcrumb bar of the current zoom level.
* Compatability table.
* Heat map coloring using the RNA Seq Atlas for the human dult gross body view.

**Updates:**

* Autozoom for two small units has been added.
* The interface got a subtle retouch.
* Use CSS3 for simplified and smooth animations e.g. dragging and scaling.


1.1.0 / 2013-11-15
------------------

This release features a couple of important changes. First of all the unit
filtering as been replaced by a system wide search which dramatically simplifies
the process of finding specific illustrations. This search can be accessed
anywhere except on this about page. The second most notable change is the
refined overview of the human body which finally distinguishes between the
gender. This means we opened up a new dimension for browsing making it: time,
resolution, species and gender. Moreover the liver and gallbladder have been
added to expand the collection of organs. The third big addition is the help.
It can be activated anywhere while browsing and features an interactive
communication to explain all features of the Semantic Body Browser. Last but not
least we have added full RDFA annotations meaning that all illustration are
semantically annotated by the W3C standard. Finally the start page and numbers
of smaller bugs have been fixed since the initial release.

**Enhancements:**

* Interactive help has been added to give a quick overview and explanations of
  the features.
* Gender distinction is now available for the human adult gross body view.
* Search has been implemented and replaces the 'unit filtering' to allow quick
  access to all views and units.

**Updates:**

* AngularJS to 1.0.8.
* Third party libraries.
* Human body illustration has been extended.
* Illustrations have been annotated with RDFA.
* Start page has been updated to allow quick searching.

**Bug Fixes:**

* Several smaller bugs have been fixed.


1.0.0 / 2012-10-26
------------------

Initial release.
