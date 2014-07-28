# Changelog

## 1.4.2 / 2014-07-28

AngularJS and third party libraries update.

Updates:

* AngularJS from 1.2.16 to 1.2.21.
* Filesaver.js with Blob.js

## 1.4.1 / 2014-05-26

Minor bug fixes.

Bug Fixes:

* Fixed a couple of minor bugs.

## 1.4.0 / 2014-05-09

New expression data for the human body gross view added. Expression values
changed from RPKM to TPM.

Enhancements:

* Added adrenal gland to the human adult female and male body gross view.
* Added a single gene isolation mode in the heatmap mode to easily display the
  RNA expression of a single gene.
* Added stacked bars underneath each biological entity in the heatmap mode to
  indicate each genes impact on the accumulative RNA expression level.
* Human BodyMap 2.0 from Ilumina added to the heat map modus of the human body
  gross view.

Updates:

* AngularJS to version 1.2.16.
* About page has been updated.
* RPKM expression values have been replaced by TPM.

Bug Fixes:

* Minor bug fixes.

## 1.3.2 / 2014-02-20

Mainly patches and minor visual enhancements.

Enhancements:

* Entities show expression value in heat map mode.
* Added button for downloading the current illustrations as it is viewed.

Updates:

* Information panel has been enhanced.
* jQuery from version 1.10 to 1.11.
* AngularJS from version 1.2.5 to 1.2.15.
* Renamed "unit" to "entities".

Bug Fixes:

* Couple of minor bugs have been fixed.

## 1.3.1 / 2014-02-05

Changed license of the application from Creative Commons to GNU GPLv3.

Updates:

* Changed license of the web application from Creative Commons to GNU GPL v3.

## 1.3 / 2013-12-15

Two new organs: liver and gall bladder, have been added. Update to AngularJS 1.2
and code clean-up.

Enhancements:

* 6 new illustration for exploring the liver and gall bladder in human and mouse
  have been added.

Updates:

* Changed expression color scheme to avoid misleading interpreation of 'red' vs
  'green'. The expression data does not represent under vs over expressed genes
  but rather expression vs high expression.
* Added small notification when the heat map modus is activated.
* General code clean-up. And reduction of third party libraries.
* RaphaelJS updated  to 2.1.2
* AngularJS migration from 1.0.8 to 1.2.3.

Bug Fixes:

* Auto transparency for highlighted units has been replaced by explicit
  mechanism to avoid unwanted effects.
* Lots of smaller bug fixes.

## 1.2 / 2013-11-15

Version 1.2 adds heatmap coloring to the Semantic Body Browser. Using the RNA
Seq Atlas as the source of RNA expressions it's possible to color the human body
ullistration according to the expression (RPKM) of a selection of different
genes. This feature is currently a proof of concept only as it has been
discovered that RPKM values are not proof for cross sample comparison. We are
working on recalculating the the expression values Apart from that this release
features technical improvements, bug fixes and sligh design refreshments.

Enhancements:

* Made the Semantic Body Browser indexable for search engines.
* Breadcrumb bar of the current zoom level.
* Compatability table.
* Heat map coloring using the RNA Seq Atlas for the human dult gross body view.

Updates:

* Autozoom for two small units has been added.
* The interface got a subtle retouch.
* Use CSS3 for simplified and smooth animations e.g. dragging and scaling.


## 1.1 / 2013-11-15

This release features a couple of important changes. First of all the unit
filtering as been replaced by a system wide search which dramatically simplyfies
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

Enhancements:

* Interactive help has been added to give a quick overview and explanations of
  the features.
* Gender distinction is now available for the human adult gross body view.
* Search has been implemented and replaces the 'unit filtering' to allow quick
  access to all views and units.

Updates:

* AngularJS to 1.0.8.
* Third party libraries.
* Human body illustration has been extended.
* Illustrations have been annotated with RDFA.
* Start page has been updated to allow quick searching.

Bug Fixes:

* Several smaller bugs have been fixed.

## 1.0 / 2012-10-26

Initial release.

