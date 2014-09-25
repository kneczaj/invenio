/*
 * This file is part of Invenio.
 * Copyright (C) 2014 CERN.
 *
 * Invenio is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as
 * published by the Free Software Foundation; either version 2 of the
 * License, or (at your option) any later version.
 *
 * Invenio is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Invenio; if not, write to the Free Software Foundation, Inc.,
 * 59 Temple Place, Suite 330, Boston, MA 02111-1307, USA.
 */

define([
  'js_tests/helpers/events_checker'
], function() {

  jasmine.getFixtures().fixturesPath = '/base/js_tests/fixtures/';

  loadFixtures('simple_div.html');

  var $d1 = $('#simpleDiv');

  var links = '<div class="main">' +
      '<a class="link1">1</a>' +
      '<a class="link2">2</a>' +
      '<a class="link3">3</a>' +
    '</div>';

  $d1.append(links);

  describe('Events Checker', function() {

    function Class1($element) {
      this.$element = $element;

      var that = this;
      this.$link1 = this.$element.find('.link1');
      this.$link2 = this.$element.find('.link2');
      this.$link3 = this.$element.find('.link3');

      this.$link1.on('clicked', function (event) {
        that.$element.trigger('link1_clicked');
      });

      this.$link2.on('custom_event', function (event) {
        that.$element.trigger('link2_custom_event');
      });

      this.$link3.on('clicked', function (event) {
        that.on_link3Clicked();
      });
    }

    Class1.prototype = {

      update: function () {
        this.$element.trigger('updated');
      },

      on_link3Clicked: function () {},

      callUpdate: function () {
        this.update();
      },

      updateIfCalledWithTrue: function(arg1, arg2) {
        if (arg1 === true && arg2 === true) {
          this.$element.trigger('updated');
        }
      }
    };

    var obj1;
    var checker;
    var testedConnections;

    beforeEach(function () {
      checker = new jasmine.EventsChecker();
      obj1 = new Class1($d1);
      testedConnections = [];
    });

    afterEach(function () {
      obj1 = undefined;
      checker = undefined;
      testedConnections = undefined;
    });

    var eventEventConnections = [
      {
        triggered: {
          $element: $d1.find('.link1'),
          event: 'clicked'
        },
        expected: {
          $element: $d1,
          event: 'link1_clicked'
        }
      },
      {
        triggered: {
          $element: $d1.find('.link2'),
          event: 'custom_event'
        },
        expected: {
          $element: $d1,
          event: 'link2_custom_event'
        }
      },
    ];

    describe('passes a test' , function() {
      afterEach(function () {
        checker.init(testedConnections);
        expect(checker).toPassConnectionTests();
      });

      describe('checking of event->event connections', function() {

        it('with events correctly triggering other events',
          function () {
          }
        );

        it('even if it tests twice the same connections,' +
            'because spies should be resetted every run',
          function () {
            checker.init(eventEventConnections);
            expect(checker).toPassConnectionTests();
          }
        );
      });

      describe('checking of mixed connections', function() {

        afterEach(function() {
          checker.init(testedConnections);
        });

        it('with functions correctly triggering events', function () {
          testedConnections.push({
            triggered: {
              object: obj1,
              methodName: 'update',
            },
            expected: {
              $element: obj1.$element,
              event: 'updated'
            }
          },
          {
            triggered: {
              object: obj1,
              methodName: 'updateIfCalledWithTrue',
              args: [true, true]
            },
            expected: {
              $element: obj1.$element,
              event: 'updated',
            }
          });
        });

        it('with functions correctly triggering functions', function () {
          testedConnections.push({
            triggered: {
              object: obj1,
              methodName: 'callUpdate',
            },
            expected: {
              object: obj1,
              methodName: 'update',
            }
          });
        });

        describe('with events correctly triggering functions', function () {

          beforeEach(function() {
            testedConnections.push({
              triggered: {
                $element: obj1.$link3,
                event: 'clicked'
              },
              expected: {
                object: obj1,
                methodName: 'on_link3Clicked',
              },
            });
          });

          it('just goes through', function() {});

          it('event if init is tun twice, cause the spies are reseted', function() {
            checker.init(testedConnections);
          });
        });

      });
    });

    describe('fails a test', function() {
      afterEach(function () {
        checker.init(testedConnections);
        expect(checker).not.toPassConnectionTests();
      });

      it('cause there is one not existing connection',
        function () {
          testedConnections.push({
            triggered: {
              $element: $d1.find('.link2'),
              event: 'custom_event'
            },
            expected: {
              $element: $d1,
              event: 'link3_custom_event'
            }
          });
        }
      );

      it('cause `this` pointer is invalid', function () {
        testedConnections.push({
          triggered: {
            //object: obj1,
            methodName: 'update',
          },
          expected: {
            $element: obj1.$element,
            event: 'updated'
          }
        });
      });
    });




  });

});
