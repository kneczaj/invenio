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


define(function(require, exports, module) {
  "use strict";
  var $ = require('jquery');
  var QueryGenerator = require('js/search/query_generator');
  var HashStorage = require('js/search/hash_storage');
  // provides $.fn.facet
  require('js/search/facets/facet_engine');

  function SearchResultsPage(options) {

    var options = $.extend({}, SearchResultsPage.defaults, options);

    this.$facets_element = options.$facets_element;
    this.$search_results = options.$search_results;
    this.$search_query_field = options.$search_query_field;

    this.previous_search_query = options.request_args.p;
    this.request_args = options.request_args;
    this.search_url = options.search_url;

    this.setUpFacets(options.facets_configuration, options.facets_content);
    this.facet_engine = this.$facets_element.data('facet-engine');
    this.connectEvents();

    // Load facets state on page load
    if (document.location.hash.length > 2) {
      var facets_state = HashStorage.getContent();
      this.facet_engine.loadState(facets_state);
    }
  }

  SearchResultsPage.prototype = {

    connectEvents: function() {
      var that = this;
      this.$facets_element.on('updated', function(event) {

        var facet_query = QueryGenerator.generateQuery(
          that.facet_engine.getQueryStructure(),
          !!that.previous_search_query
        );
        var merged_search_query = QueryGenerator.merge(
          [that.previous_search_query, facet_query], 'AND');

        that.$search_query_field.val(merged_search_query);

        HashStorage.update(that.facet_engine.getState());

        that.request_args.p = merged_search_query;

        that.updateSearchResults(that.request_args, that.search_url);
      });

      // Rebuild facet filter on hash change.
      $(window).bind('hashchange', function() {
        var facets_state = HashStorage.getContent();
        if (JSON.stringify(that.facet_engine.getState()) != JSON.stringify(facets_state)) {
          that.facet_engine.loadState(facets_state);
        }
      });
    },

    setUpFacets: function(facet_configuration, facets_content) {

      this.$facets_element.facet($.extend({}, facet_configuration, {
        facets: facets_content,
        activate_modifier_keys: true
      }));
    },

    updateSearchResults: function() {
      $.ajax(this.search_url, {
        type: 'GET',
        data: this.request_args,
        context: this,
      }).done(function(data) {
        this.$search_results.html(data);
      });
    }
  };

  /**
   * The default values can be put here, although this section is to document
   * the parameters too.
   */
  SearchResultsPage.defaults = {
    /**
     * @param The jQuery selector of an DOM element on which the facets will be
     *  shown (usually a div section)
     */
    $facets_element: undefined,
    /**
     * @param Configuration of displaying the facets. The default one is
     *  js/search/facet/configuration/links/main.js
     */
    facets_configuration: {},
    /**
     * @param Facets configuration received from server from
     *  modules.search.registry.FacetRegistry.get_facets_config
     */
    facets_content: '',
    /**
     * @param Search results frame
     */
    $search_results: '',
    /**
     * @param search query field
     */
    $search_query_field: '',
    /**
     * @param stored arguments of the search request made
     */
    request_args: [],
    /**
     * The general URL for search requests
     */
    search_url: '',
  };

  module.exports = SearchResultsPage;
});
