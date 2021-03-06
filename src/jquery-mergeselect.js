'use strict';
// Based by on https://github.com/mgibbs189/fSelect
// https://github.com/umdjs/umd

// Uses CommonJS, AMD or browser globals to create a jQuery plugin.

// Similar to jqueryPlugin.js but also tries to
// work in a CommonJS environment.

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node/CommonJS
        module.exports = factory(require('jquery'));
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    var pluginName = 'mergeSelect';
    var classPrefix = '.' + pluginName + ' ';


    var uid = function (i) {
        return function () {
            return pluginName + '-' + (++i);
        };
    }(0);

    var labelTextFunction = function () {
        var settings = this.settings;
        var labelText = [];

        this.$wrap.find('.ms-option.ms-selected').each(function (i, el) {
            labelText.push($(el).find('.ms-option-label').text());
        });

        if (labelText.length < 1) {
            labelText = settings.placeholder;
        }
        else if (labelText.length > settings.numDisplayed) {
            var overflowText = settings.overflowText;
            if (typeof overflowText == 'function') {
                overflowText = overflowText.apply(this, [labelText])
            }
            labelText = overflowText.replace('{n}', labelText.length);
        }
        else {
            labelText = labelText.join(', ');
        }
        return labelText
    };

    var defaults = {
        selects: null,
        placeholder: 'Select some options',
        numDisplayed: 3,
        overflowText: '{n} selected',
        labelText: labelTextFunction
    };

    var classNameSuffix = '.ms-';

    // TODO
    var classNames = {
        wrap: 'wrap',
        option: 'option',
        selected: 'selected',
        label: 'label',
        labelWrap: 'label-wrap',
        optionLabel: 'option-label',
        dropdown: 'dropdown',
        hidden: 'hidden',
        arrow: 'arrow',
        optgroup: 'optgroup',
        optgroupLabel: 'optgroup-label',
        search: 'search'
    };

    /*
     Constructor
     */
    var mergeSelect = function (el, settings) {
        this.el = el;
        this.$el = $(el);
        this.settings = settings;
        this.selects = settings.selects;
        this.$selects = $(this.selects);
        this.selects_map = {};
        var selects_map = this.selects_map;

        this.$selects.each(function (index, value) {
            if (!value.id) {
                value.id = uid();
            }
            selects_map[value.id] = $(value);
        });

        this.create();
    };

    mergeSelect.prototype = {
        create: function () {
            // TODO добавить возможность объединения разных типов
            var multiple = this.$selects.is('[multiple]') ? ' multiple' : '';
            this.$el.append('<div class="' + pluginName + '"></div>');
            var $container = this.$el.find('.' + pluginName);

            $container.append('<div class="ms-wrap' + multiple + '"></div>');

            var $wrap = $container.find('.ms-wrap');

            $wrap.append(
                '<div class="ms-label-wrap">'
                + '<div class="ms-label">'
                + this.settings.placeholder
                + '</div>'
                + '<span class="ms-arrow"></span></div>'
            );

            $wrap.append('<div class="ms-dropdown hidden">'
                + '<div class="ms-options">'
                + '</div></div>');

            //$wrap.addClass('hidden');

            this.$container = $container;

            this.$wrap = $wrap;

            this.reload();
        },
        reload: function () {
            var self = this;
            if (this.settings.showSearch) {
                var search = '<div class="ms-search"><input type="search" placeholder="' + this.settings.searchText + '" /></div>';
                this.$wrap.find('.ms-dropdown').prepend(search);
            }

            var choices = '';
            this.$selects.each(function (index, value) {
                    choices += self.buildOptions($(value))
                }
            ).get();
            this.$wrap.find('.ms-options').html(choices);
            this.reloadDropdownLabel();
        },

        buildOptions: function ($element) {
            var $this = this;
            var choices = '';
            var $select = $element.closest('select');
            var has_multiple = $select.is('[multiple]');

            if ($element.tagName == 'select' || $element.data('label')) {
                // TODO formgroup
                choices += '<div class="ms-optgroup">';
                choices += '<div class="ms-optgroup-label">' + $element.data('label') + '</div>';
                choices += '</div>';
            }

            $element.children().each(function (i, el) {
                var $el = $(el);

                if ('optgroup' == $el.prop('nodeName').toLowerCase()) {
                    choices += '<div class="ms-optgroup">';
                    choices += '<div class="ms-optgroup-label">' + $el.prop('label') + '</div>';
                    choices += $this.buildOptions($el);
                    choices += '</div>';
                }
                else {
                    var selected = $el.is(':selected') ? ' selected' : '';
                    var checked = selected ? 'checked="checked"' : '';
                    var input_type = has_multiple ? 'checkbox' : 'radio';

                    choices += '<div class="ms-option'
                        + selected + '" data-value="'
                        + $el.prop('value')
                        + '"'
                        + 'data-select-id="' + $select.prop('id')
                        + '"><div class="ms-option-label"><input type="' + input_type + '"' + checked + '"/>'
                        + $el.html()
                        + '</div></div>';
                }
            });

            return choices;
        },
        reloadDropdownLabel: function () {
            var labelText = this.settings.labelText.apply(this);
            this.$wrap.find('.ms-label').html(labelText);

            this.$selects.each(function (index, value) {
                $(value).change()

            });
        }

    };


    $.fn[pluginName] = function (options) {

        var settings = $.extend(defaults, options);

        return this.each(function () {
            var $container = $(this).find(classPrefix);
            var data = $container.data(pluginName);

            if (!data) {
                data = new mergeSelect(this, settings);
                data.$container.data(pluginName, data);
            }

            if (typeof settings == 'string') {
                data[settings]();
            }
        });

    };

    /* Events */
    window[pluginName] = {
        'active': null,
        'idx': -1
    };
    function setIndexes($wrap) {
        $wrap.find('.ms-option:not(.hidden)').each(function (i, el) {
            $(el).attr('data-index', i);
            $wrap.find('.ms-option').removeClass('ms-hl');
        });
        $wrap.find('.ms-search input').focus();
        window[pluginName].idx = -1;
    }

    function setScroll($wrap) {
        var $container = $wrap.find('.ms-options');
        var $selected = $wrap.find('.ms-option.ms-hl');

        var itemMin = $selected.offset().top + $container.scrollTop();
        var itemMax = itemMin + $selected.outerHeight();
        var containerMin = $container.offset().top + $container.scrollTop();
        var containerMax = containerMin + $container.outerHeight();

        var to = null;
        if (itemMax > containerMax) { // scroll down
            to = $container.scrollTop() + itemMax - containerMax;
            $container.scrollTop(to);
        }
        else if (itemMin < containerMin) { // scroll up
            to = $container.scrollTop() - containerMin - itemMin;
            $container.scrollTop(to);
        }
    }

    $(document).on('click', classPrefix + '.ms-option', function () {
        var $option = $(this);
        var $wrap = $option.closest('.ms-wrap');

        var $container = $wrap.closest(classPrefix);
        var _mergeSelect = $container.data(pluginName);

        var selected_map = {};
        $.map(_mergeSelect.selects_map, function (value, key) {
            selected_map[key] = null;
        });


        var hasMultiple = $wrap.hasClass('multiple');
        /* todo mixin multiple and simple select */
        if (!hasMultiple) {
            /* TODO remove from only select */
            var select_id = $option.data('select-id');

            $wrap.find(".option[data-select-id='" + select_id + "']")
                .removeClass('ms-selected')
                .find('input').prop('checked', null)
            ;

            $option.addClass('ms-selected').find('input').prop('checked', true);
            $wrap.find('.ms-dropdown').addClass('hidden');
        }

        if (hasMultiple) {
            $option.toggleClass('ms-selected');
            $option.find('input').prop('checked', $option.hasClass('ms-selected'));
        }

        $wrap.find('.ms-option.selected').each(function (i, el) {
            var $el = $(el);
            var selected = selected_map[$el.data('select-id')] || [];
            selected.push($el.data('value'));
            selected_map[$el.data('select-id')] = selected;
        });

        $.map(selected_map, function (value, key) {
            var $select = _mergeSelect.selects_map[key];
            $select.val(value);
            _mergeSelect.reloadDropdownLabel();
        });
    });


    $(document).on('keyup', classPrefix + '.ms-search input', function (e) {
        if (40 == e.which) {
            $(this).blur();
            return;
        }

        var $wrap = $(this).closest('.ms-wrap');
        var keywords = $(this).val();

        $wrap.find('.ms-option, .ms-optgroup-label').removeClass('hidden');

        if ('' != keywords) {
            $wrap.find('.ms-option').each(function () {
                var regex = new RegExp(keywords, 'gi');
                if (null === $(this).find('.ms-option-label').text().match(regex)) {
                    $(this).addClass('hidden');
                }
            });

            $wrap.find('.ms-optgroup-label').each(function () {
                var num_visible = $(this).closest('.ms-optgroup').find('.option:not(.hidden)').length;
                if (num_visible < 1) {
                    $(this).addClass('hidden');
                }
            });
        }

        setIndexes($wrap);
    });

    $(document).on('click', function (e) {
        var $el = $(e.target);
        var $wrap = $el.closest('.ms-wrap');

        if (0 < $wrap.length) {
            if ($el.hasClass('ms-label')) {
                window[pluginName].active = $wrap;
                var is_hidden = $wrap.find('.ms-dropdown').hasClass('hidden');
                $('.ms-dropdown').addClass('hidden');

                if (is_hidden) {
                    $wrap.find('.ms-dropdown').removeClass('hidden');
                }
                else {
                    $wrap.find('.ms-dropdown').addClass('hidden');
                }

                setIndexes($wrap);
            }
        }
        else {
            $('.ms-dropdown').addClass('hidden');
            window[pluginName].active = null;
        }
    });

    $(document).on('keydown', function (e) {
        var $wrap = window[pluginName].active;

        if (null === $wrap) {
            return null;
        }
        else if (38 == e.which) { // up
            e.preventDefault();

            $wrap.find('.ms-option').removeClass('hl');

            if (window[pluginName].idx > 0) {
                window[pluginName].idx--;
                $wrap.find('.ms-option[data-index=' + window[pluginName].idx + ']').addClass('hl');
                setScroll($wrap);
            }
            else {
                window[pluginName].idx = -1;
                $wrap.find('.ms-search input').focus();
            }
        }
        else if (40 == e.which) { // down
            e.preventDefault();
            var last_index = $wrap.find('.ms-option:last').attr('data-index');
            if (window[pluginName].idx < parseInt(last_index)) {
                window[pluginName].idx++;
                $wrap.find('.ms-option').removeClass('ms-hl');
                $wrap.find('.ms-option[data-index=' + window[pluginName].idx + ']').addClass('hl');
                setScroll($wrap);
            }
        }
        else if (32 == e.which || 13 == e.which) { // space, enter
            $wrap.find('.ms-option.ms-hl').click();
        }
        else if (27 == e.which) { // esc
            $('.ms-dropdown').addClass('ms-hidden');
            window[pluginName].active = null;
        }
    });
}));
