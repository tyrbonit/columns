/***
 * Copyright (c) 2015
 * Licensed under the MIT License.
 *
 * Author: Michael Eisenbraun
 * Version: 3.0.0
 * Documentation: http://michaeleisenbraun.com/columns/
 * Dependencies: jQuery, Mustache.js
 */

 ;(function($) {
   "use strict";

   var Columns = function(options) {
    var defaults = {
          page: 1,
          size: 5,
          template: '{{> search}} {{#table}} <div class="ui-columns-table" data-columns-table="true"> <table class="ui-table"><thead> {{#thead}} {{#sortable}} <th class="ui-table-sortable" data-columns-sortby="{{key}}">{{header}}</th> {{/sortable}}  {{#sortedUp}} <th class="ui-table-sort-up ui-table-sortable" data-columns-sortby="{{key}}">{{header}} <span class="ui-arrow">&#x25B2;</span></th> {{/sortedUp}} {{#sortedDown}} <th class="ui-table-sort-down ui-table-sortable" data-columns-sortby="{{key}}">{{header}} <span class="ui-arrow">&#x25BC;</span></th> {{/sortedDown}} {{^sortable}} <th class="">{{header}}</th> {{/sortable}} {{/thead}} </thead><tbody>{{#tbody}}<tr>{{{.}}}</tr>{{/tbody}}</tbody></table>{{/table}} {{> footer}}</div>',
          templateRow: '{{#row}}<td>{{.}}</td>{{/row}}',
          templateSearch: '{{#search}} <div class="ui-columns-search"> <input class="ui-table-search" placeholder="Search" type="text" name="query" data-columns-search="true" value="{{query}}" /> </div> {{/search}}',
          templateFooter: '{{#footer}}<div class="ui-table-footer"> <span class="ui-table-size">Show rows: {{{showRowsMenu}}}</span> {{#range}}<span class="ui-table-results">Results: <strong>{{range.start}} &ndash; {{range.end}}</strong> of <strong>{{range.total}}</strong></span>{{/range}} <span class="ui-table-controls"> {{#prevPageExists}} <span class="ui-table-control-prev" data-columns-page="{{prevPage}}"> &lt; </span> {{/prevPageExists}} {{^prevPageExists}} <span class="ui-table-control-disabled"> &lt; </span> {{/prevPageExists}} {{#nextPageExists}} <span class="ui-table-control-next" data-columns-page="{{nextPage}}"> &gt; </span> {{/nextPageExists}} {{^nextPageExists}} <span class="ui-table-control-disabled"> &gt; </span> {{/nextPageExists}} </span> </div>{{/footer}}'
        },
        settings = $.extend({}, defaults, options),
        master = [],
        date = /^(Jan|January|Feb|February|Mar|March|Apr|April|May|Jun|June|Jul|July|Aug|August|Sep|September|Oct|October|Nov|November|Dec|December|(0?\d{1})|(10|11|12))(-|\s|\/|\.)(0?[1-9]|(1|2)[0-9]|3(0|1))(-|\s|\/|\.|,\s)(19|20)?\d\d$/i;


    /* Private Helper Functions */

    /* Model Helpers */
    var buildSchema = function(data) {
      if(settings.schema) {
        return settings.schema;
      } else {
        var schema = [];

        for(key in data[0]) {
           schema.push({header:key, key:key});
        }

        return schema;
      }
    };

    var buildTheadModel = function(schema) {
      var thead = [];

      for(var i = 0, length = schema.length; i < length; i++) {
        if(!schema[i].hide) {
          thead.push(schema[i]);
        }
      }

      return thead;
    };

    var buildTbodyModel = function(schema, data) {
      var tbody = [];

      for(var i = 0, length = data.length; i < length; i++) {
        tbody.push(buildRowModel(schema, data[i]));
      }

      return tbody;
    };

    var buildRowModel = function(schema, data) {
      var row = [],
          template = settings.templateRow;

      for(var i = 0, length = schema.length; i < length; i++) {
        if(!schema[i].hide) {
          row.push(data[schema[i].key]);
        }
      }

      return Mustache.render(template, {row: row});
    };

    var buildFooterModel = function() {
      return {range: settings.range}
    };


    /* Data Helpers */
    var copyData = function() {
      master = settings.data.slice(0);
    }

    var resetData = function() {
      settings.data = master.slice(0);
    }

    var objectSort = function(field, reverse, primer){
        reverse = (reverse) ? -1 : 1;

        return function(a,b){

            a = a[field];
            b = b[field];

            if (date.test(a) && date.test(b)) {
                a = new Date(a);
                a = Date.parse(a);

                b = new Date(b);
                b = Date.parse(b);
            } else if (typeof(primer) !== 'undefined'){
                a = primer(a);
                b = primer(b);
            }

            if (a<b) {
                return reverse * -1;
            }

            if (a>b) {
                return reverse * 1;
            }

            return 0;
        };
    }


    /* Page Helpers */
    var getPages = function() {
      return Math.ceil(getTotalRows()/settings.size);
    }

    var setPage = function(page) {
      settings.page = (page && page <= getPages() ? page : 1);
    }

    var getPage = function(page) {
      return settings.page;
    }

    var getTotalRows = function() {
      return settings.data.length;
    }

    var setRange = function(currentPage, numberOfRows, totalRows) {
      var start = ((currentPage -1) * (numberOfRows)),
          end = (start + numberOfRows < totalRows) ? start + numberOfRows : totalRows;

      return settings.range = {
        start: start+1,
        end: end,
        total: totalRows
      }
    };


    /* Private Methods */

    /**
    * FILTER:
    * Filters out all row from the data object that does not match the search
    * query
    *
    * Only searchable fields will be checked as declared in the searchable
    * property inside the schema. By default, all columns are searchable.
    **/
    var filterData = function(data, query, schema) {
      var key;
      return data.filter(function(row) {
        for(var i = 0, length = schema.length; i < length; i++) {

          if(schema[i].searchable !== false) {
            key = schema[i].key;

            if(typeof row[key] === 'string') {
              if(row[key].match(query)) {
                return true;
              }
            } else if(typeof row[schema[i]] === 'number') {
              if(row[key] == query) {
                return true;
              }
            }
          }
        }

        return false;
      });
    }

    /**
    * SORT:
    * Arranges the data object in the order based on the object key
    * stored in the variable `sortBy` and the direction stored in the
    * variable `reverse`.
    *
    * A date primer has been created. If the object value matches the
    * date pattern, it be sorted as a date instead or a string or number.
    *
    * Uses the objectSort helpter function
    **/

    var sortData = function(data, sortBy, reverse) {
        if (sortBy && typeof data[0][sortBy] !== 'undefined') {
            return data.sort(objectSort(sortBy, reverse));
        }
    };

    /**
    * PAGINATE:
    * Returns the data for the current page
    **/
    var paginateData = function(data) {
        /** set range of rows */
        var range = setRange(getPage(), settings.size, getTotalRows());

        return data.slice(range.start-1, range.end);
    };


    //creates the table
    var createTable = function() {
      resetData(); //reset data from master

      var temp = settings.data,
          template = settings.template;

      if(settings.query) {
        temp = filterData(temp, settings.query, settings.schema);
      }

      if(settings.sortBy) {
        temp = sortData(temp, settings.sortBy, settings.reverse );
      }

      if(settings.size) {
        temp = paginateData(temp);
      }

      var model = {
        table: true,
        search: true,
        thead: buildTheadModel(settings.schema),
        tbody: buildTbodyModel(settings.schema, temp),
        footer: buildFooterModel()
      }

      settings.$el.html(Mustache.render(template, model, {
        search: settings.templateSearch,
        footer: settings.templateFooter
      }));
    };

    /* Initializing Plugin */
    copyData(); //create a master copy of the data
    settings.schema = buildSchema(settings.data);

    createTable();

    /* Public Methods and Properties */
    return {
       VERSION: '3.0.0',
       data: function() {
         return settings.data;
       },
       schema: function() {
         return settings.schema;
       }
    };

  };

  $.fn.columns = function(options) {
      for(var i = 0, length = this.length; i < length; i++) {
        var instance = $.data(this[i], 'columns');

        if(typeof options === 'string') {
             if (typeof instance !== 'undefined' && $.isFunction(instance[options])) {
               return instance[options]();
             } else {
               return $.error('No such method "' + options + '" for Columns');
             }
        } else {
           $.extend(options, {$el: $(this[i])});
           return $.data(this[i], 'columns', new Columns(options));
        }
      }
  };
})(jQuery);


// var wrapper = $( "<div />" )
//     .attr( settings.wrapperAttrs )
//     .appendTo( settings.container );
//
// // Easy to reference later...
// wrapper.append( "..." );
