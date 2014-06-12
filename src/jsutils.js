(function (undefined) {
    'use strict';

    function cloneArray(source) {
        var clone = [];
        for (var i = 0; i < source.length; i++) {
            clone.push(source[i]);
        }
        return clone;
    }

    function splitArray(source, count) {
        /// <param name='source' type='Array' />
        var arrayToSplit = cloneArray(source),
            chunks = [];
        while (arrayToSplit.length) {
            chunks.push(arrayToSplit.splice(0, count));
        }
        return chunks;
    }

    function randomizeArray(source) {
        /// <param name='source' type='Array' />
        var clone = cloneArray(source),
            result = [];

        while (clone.length) {
            var index = Math.round(Math.random() * (clone.length - 1));
            result.push(clone.splice(index, 1)[0]);
        }

        return result;
    }

    function map(array, factory) {
        var mapping = [];
        for (var i = 0; i < array.length; i++) {
            mapping.push(factory(array[i], i));
        }
        return mapping;
    }

    function find(array, match) {
        for (var i = 0; i < array.length; i++) {
            if (match(array[i], i) === true) {
                return array[i];
            }
        }
    }

    this.H = this.H || {};
    this.H.JsUtils = this.H.JsUtils || {};

    this.H.JsUtils.cloneArray = cloneArray;
    this.H.JsUtils.splitArray = splitArray;
    this.H.JsUtils.randomizeArray = randomizeArray;
    this.H.JsUtils.map = map;
    this.H.JsUtils.find = find;

}).call(this);