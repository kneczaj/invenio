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
  'js/search/facets/states',
  './mocks',
  'js/search/facets/facet_filter',
  'js/search/facets/facet_engine',
], function(states, mocks, FacetFilter) {

  jasmine.getFixtures().fixturesPath = '/base/js_tests/fixtures/';

  loadFixtures('simple_div.html');

  var engine;

  var $engine = $('#simpleDiv');

  function attachFacets() {
    $engine.facet({
      option_details: mocks.optionConfiguration,
      facets: mocks.facetsContentMock,
      activate_modifier_keys: true
    });
    engine = $engine.data('facet-engine');
  }

  function removeFacets() {
    engine.destroy();
    engine = undefined;
  }

  describe('Facet engine', function() {

    beforeEach(function() {
      jasmine.Ajax.install();
      attachFacets();
    });

    afterEach(function() {
      removeFacets();
    });

    it('has all properties initialized', function() {
      expect(engine).toHaveAllPropertiesInitialized();
      expect(engine).toHaveNoEmptyJQueryObjects();
    });

    describe('after the content is loaded', function() {

      var collectionRequest;
      var yearRequest;
      var $filters;
      var collectionFilter;
      var yearFilter;

      beforeEach(function() {
        collectionRequest = jasmine.Ajax.requests.filter('/facet/collection/mock').pop();
        yearRequest = jasmine.Ajax.requests.filter('/facet/year/mock').pop();
        yearRequest.response(mocks.listEntriesQueryMock.success);
        collectionRequest.response(mocks.getResponse(200, mocks.collectionResponseMock));
        $filters = engine.$element.children().filter('.facet-filter');
        collectionFilter = $($filters[1]).data('facet-filter');
        yearFilter = $($filters[0]).data('facet-filter');
      });

      afterEach(function() {
        collectionRequest = undefined;
        yearRequest = undefined;
        collectionFilter = undefined;
        yearFilter = undefined;
        $filters = undefined;
      });

      it('has internal events connected', function() {
        var checker = new jasmine.EventsChecker();
        var testedConnections = [
          {
            triggered: {
              $element: collectionFilter.$element,
              event: collectionFilter.events.updated,
            },
            expected: {
              $element: engine.$element,
              event: engine.events.updated
            },
          },
          {
            triggered: {
              $element: yearFilter.$element,
              event: yearFilter.events.updated,
            },
            expected: {
              $element: engine.$element,
              event: engine.events.updated
            },
          },
        ];
        checker.init(testedConnections);
        expect(checker).toPassConnectionTests();
      });

      it('does not include inactive filters in getState()', function() {
        yearFilter.getOption('2002').activate('+');
        expect(engine.getState()).toEqual({
          year: {
            filter_collections: {
              '+': ['2002']
            }
          }
        })
      });

    });

  });

});