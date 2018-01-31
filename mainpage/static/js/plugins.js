jQuery(document).ready(function($){
  var slidesWrapper = $('.cd-hero-slider');

  //check if a .cd-hero-slider exists in the DOM 
  if ( slidesWrapper.length > 0 ) {
    var primaryNav = $('.cd-primary-nav'),
      sliderNav = $('.cd-slider-nav'),
      navigationMarker = $('.cd-marker'),
      slidesNumber = slidesWrapper.children('li').length,
      visibleSlidePosition = 0,
      autoPlayId,
      autoPlayDelay = 5000;

    //upload videos (if not on mobile devices)
    uploadVideo(slidesWrapper);

    //autoplay slider
    setAutoplay(slidesWrapper, slidesNumber, autoPlayDelay);

    //on mobile - open/close primary navigation clicking/tapping the menu icon
    primaryNav.on('click', function(event){
      if($(event.target).is('.cd-primary-nav')) $(this).children('ul').toggleClass('is-visible');
    });
    
    //change visible slide
    sliderNav.on('click', 'li', function(event){
      event.preventDefault();
      var selectedItem = $(this);
      if(!selectedItem.hasClass('selected')) {
        // if it's not already selected
        var selectedPosition = selectedItem.index(),
          activePosition = slidesWrapper.find('li.selected').index();
        
        if( activePosition < selectedPosition) {
          nextSlide(slidesWrapper.find('.selected'), slidesWrapper, sliderNav, selectedPosition);
        } else {
          prevSlide(slidesWrapper.find('.selected'), slidesWrapper, sliderNav, selectedPosition);
        }

        //this is used for the autoplay
        visibleSlidePosition = selectedPosition;

        updateSliderNavigation(sliderNav, selectedPosition);
        updateNavigationMarker(navigationMarker, selectedPosition+1);
        //reset autoplay
        setAutoplay(slidesWrapper, slidesNumber, autoPlayDelay);
      }
    });
  }

  function nextSlide(visibleSlide, container, pagination, n){
    visibleSlide.removeClass('selected from-left from-right').addClass('is-moving').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(){
      visibleSlide.removeClass('is-moving');
    });

    container.children('li').eq(n).addClass('selected from-right').prevAll().addClass('move-left');
    checkVideo(visibleSlide, container, n);
  }

  function prevSlide(visibleSlide, container, pagination, n){
    visibleSlide.removeClass('selected from-left from-right').addClass('is-moving').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(){
      visibleSlide.removeClass('is-moving');
    });

    container.children('li').eq(n).addClass('selected from-left').removeClass('move-left').nextAll().removeClass('move-left');
    checkVideo(visibleSlide, container, n);
  }

  function updateSliderNavigation(pagination, n) {
    var navigationDot = pagination.find('.selected');
    navigationDot.removeClass('selected');
    pagination.find('li').eq(n).addClass('selected');
  }

  function setAutoplay(wrapper, length, delay) {
    if(wrapper.hasClass('autoplay')) {
      clearInterval(autoPlayId);
      autoPlayId = window.setInterval(function(){autoplaySlider(length)}, delay);
    }
  }

  function autoplaySlider(length) {
    if( visibleSlidePosition < length - 1) {
      nextSlide(slidesWrapper.find('.selected'), slidesWrapper, sliderNav, visibleSlidePosition + 1);
      visibleSlidePosition +=1;
    } else {
      prevSlide(slidesWrapper.find('.selected'), slidesWrapper, sliderNav, 0);
      visibleSlidePosition = 0;
    }
    updateNavigationMarker(navigationMarker, visibleSlidePosition+1);
    updateSliderNavigation(sliderNav, visibleSlidePosition);
  }

  function uploadVideo(container) {
    container.find('.cd-bg-video-wrapper').each(function(){
      var videoWrapper = $(this);
      if( videoWrapper.is(':visible') ) {
        // if visible - we are not on a mobile device 
        var videoUrl = videoWrapper.data('video'),
          video = $('<video loop><source src="'+videoUrl+'.mp4" type="video/mp4" /><source src="'+videoUrl+'.webm" type="video/webm" /></video>');
        video.appendTo(videoWrapper);
        // play video if first slide
        if(videoWrapper.parent('.cd-bg-video.selected').length > 0) video.get(0).play();
      }
    });
  }

  function checkVideo(hiddenSlide, container, n) {
    //check if a video outside the viewport is playing - if yes, pause it
    var hiddenVideo = hiddenSlide.find('video');
    if( hiddenVideo.length > 0 ) hiddenVideo.get(0).pause();

    //check if the select slide contains a video element - if yes, play the video
    var visibleVideo = container.children('li').eq(n).find('video');
    if( visibleVideo.length > 0 ) visibleVideo.get(0).play();
  }

  function updateNavigationMarker(marker, n) {
    marker.removeClassPrefix('item').addClass('item-'+n);
  }

  $.fn.removeClassPrefix = function(prefix) {
    //remove all classes starting with 'prefix'
      this.each(function(i, el) {
          var classes = el.className.split(" ").filter(function(c) {
              return c.lastIndexOf(prefix, 0) !== 0;
          });
          el.className = $.trim(classes.join(" "));
      });
      return this;
  };
});
/*!
 * Lightbox v2.9.0
 * by Lokesh Dhakar
 *
 * More info:
 * http://lokeshdhakar.com/projects/lightbox2/
 *
 * Copyright 2007, 2015 Lokesh Dhakar
 * Released under the MIT license
 * https://github.com/lokesh/lightbox2/blob/master/LICENSE
 */

// Uses Node, AMD or browser globals to create a module.
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require('jquery'));
    } else {
        // Browser globals (root is window)
        root.lightbox = factory(root.jQuery);
    }
}(this, function ($) {

  function Lightbox(options) {
    this.album = [];
    this.currentImageIndex = void 0;
    this.init();

    // options
    this.options = $.extend({}, this.constructor.defaults);
    this.option(options);
  }

  // Descriptions of all options available on the demo site:
  // http://lokeshdhakar.com/projects/lightbox2/index.html#options
  Lightbox.defaults = {
    albumLabel: 'Image %1 of %2',
    alwaysShowNavOnTouchDevices: false,
    fadeDuration: 600,
    fitImagesInViewport: true,
    imageFadeDuration: 600,
    // maxWidth: 800,
    // maxHeight: 600,
    positionFromTop: 50,
    resizeDuration: 700,
    showImageNumberLabel: true,
    wrapAround: false,
    disableScrolling: false,
    /*
    Sanitize Title
    If the caption data is trusted, for example you are hardcoding it in, then leave this to false.
    This will free you to add html tags, such as links, in the caption.

    If the caption data is user submitted or from some other untrusted source, then set this to true
    to prevent xss and other injection attacks.
     */
    sanitizeTitle: false
  };

  Lightbox.prototype.option = function(options) {
    $.extend(this.options, options);
  };

  Lightbox.prototype.imageCountLabel = function(currentImageNum, totalImages) {
    return this.options.albumLabel.replace(/%1/g, currentImageNum).replace(/%2/g, totalImages);
  };

  Lightbox.prototype.init = function() {
    var self = this;
    // Both enable and build methods require the body tag to be in the DOM.
    $(document).ready(function() {
      self.enable();
      self.build();
    });
  };

  // Loop through anchors and areamaps looking for either data-lightbox attributes or rel attributes
  // that contain 'lightbox'. When these are clicked, start lightbox.
  Lightbox.prototype.enable = function() {
    var self = this;
    $('body').on('click', 'a[rel^=lightbox], area[rel^=lightbox], a[data-lightbox], area[data-lightbox]', function(event) {
      self.start($(event.currentTarget));
      return false;
    });
  };

  // Build html for the lightbox and the overlay.
  // Attach event handlers to the new DOM elements. click click click
  Lightbox.prototype.build = function() {
    var self = this;
    $('<div id="lightboxOverlay" class="lightboxOverlay"></div><div id="lightbox" class="lightbox"><div class="lb-outerContainer"><div class="lb-container"><img class="lb-image" src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" /><div class="lb-nav"><a class="lb-prev" href="" ></a><a class="lb-next" href="" ></a></div><div class="lb-loader"><a class="lb-cancel"></a></div></div></div><div class="lb-dataContainer"><div class="lb-data"><div class="lb-details"><span class="lb-caption"></span><span class="lb-number"></span></div><div class="lb-closeContainer"><a class="lb-close"></a></div></div></div></div>').appendTo($('body'));

    // Cache jQuery objects
    this.$lightbox       = $('#lightbox');
    this.$overlay        = $('#lightboxOverlay');
    this.$outerContainer = this.$lightbox.find('.lb-outerContainer');
    this.$container      = this.$lightbox.find('.lb-container');
    this.$image          = this.$lightbox.find('.lb-image');
    this.$nav            = this.$lightbox.find('.lb-nav');

    // Store css values for future lookup
    this.containerPadding = {
      top: parseInt(this.$container.css('padding-top'), 10),
      right: parseInt(this.$container.css('padding-right'), 10),
      bottom: parseInt(this.$container.css('padding-bottom'), 10),
      left: parseInt(this.$container.css('padding-left'), 10)
    };

    this.imageBorderWidth = {
      top: parseInt(this.$image.css('border-top-width'), 10),
      right: parseInt(this.$image.css('border-right-width'), 10),
      bottom: parseInt(this.$image.css('border-bottom-width'), 10),
      left: parseInt(this.$image.css('border-left-width'), 10)
    };

    // Attach event handlers to the newly minted DOM elements
    this.$overlay.hide().on('click', function() {
      self.end();
      return false;
    });

    this.$lightbox.hide().on('click', function(event) {
      if ($(event.target).attr('id') === 'lightbox') {
        self.end();
      }
      return false;
    });

    this.$outerContainer.on('click', function(event) {
      if ($(event.target).attr('id') === 'lightbox') {
        self.end();
      }
      return false;
    });

    this.$lightbox.find('.lb-prev').on('click', function() {
      if (self.currentImageIndex === 0) {
        self.changeImage(self.album.length - 1);
      } else {
        self.changeImage(self.currentImageIndex - 1);
      }
      return false;
    });

    this.$lightbox.find('.lb-next').on('click', function() {
      if (self.currentImageIndex === self.album.length - 1) {
        self.changeImage(0);
      } else {
        self.changeImage(self.currentImageIndex + 1);
      }
      return false;
    });

    /*
      Show context menu for image on right-click

      There is a div containing the navigation that spans the entire image and lives above of it. If
      you right-click, you are right clicking this div and not the image. This prevents users from
      saving the image or using other context menu actions with the image.

      To fix this, when we detect the right mouse button is pressed down, but not yet clicked, we
      set pointer-events to none on the nav div. This is so that the upcoming right-click event on
      the next mouseup will bubble down to the image. Once the right-click/contextmenu event occurs
      we set the pointer events back to auto for the nav div so it can capture hover and left-click
      events as usual.
     */
    this.$nav.on('mousedown', function(event) {
      if (event.which === 3) {
        self.$nav.css('pointer-events', 'none');

        self.$lightbox.one('contextmenu', function() {
          setTimeout(function() {
              this.$nav.css('pointer-events', 'auto');
          }.bind(self), 0);
        });
      }
    });


    this.$lightbox.find('.lb-loader, .lb-close').on('click', function() {
      self.end();
      return false;
    });
  };

  // Show overlay and lightbox. If the image is part of a set, add siblings to album array.
  Lightbox.prototype.start = function($link) {
    var self    = this;
    var $window = $(window);

    $window.on('resize', $.proxy(this.sizeOverlay, this));

    $('select, object, embed').css({
      visibility: 'hidden'
    });

    this.sizeOverlay();

    this.album = [];
    var imageNumber = 0;

    function addToAlbum($link) {
      self.album.push({
        link: $link.attr('href'),
        title: $link.attr('data-title') || $link.attr('title')
      });
    }

    // Support both data-lightbox attribute and rel attribute implementations
    var dataLightboxValue = $link.attr('data-lightbox');
    var $links;

    if (dataLightboxValue) {
      $links = $($link.prop('tagName') + '[data-lightbox="' + dataLightboxValue + '"]');
      for (var i = 0; i < $links.length; i = ++i) {
        addToAlbum($($links[i]));
        if ($links[i] === $link[0]) {
          imageNumber = i;
        }
      }
    } else {
      if ($link.attr('rel') === 'lightbox') {
        // If image is not part of a set
        addToAlbum($link);
      } else {
        // If image is part of a set
        $links = $($link.prop('tagName') + '[rel="' + $link.attr('rel') + '"]');
        for (var j = 0; j < $links.length; j = ++j) {
          addToAlbum($($links[j]));
          if ($links[j] === $link[0]) {
            imageNumber = j;
          }
        }
      }
    }

    // Position Lightbox
    var top  = $window.scrollTop() + this.options.positionFromTop;
    var left = $window.scrollLeft();
    this.$lightbox.css({
      top: top + 'px',
      left: left + 'px'
    }).fadeIn(this.options.fadeDuration);

    // Disable scrolling of the page while open
    if (this.options.disableScrolling) {
      $('body').addClass('lb-disable-scrolling');
    }

    this.changeImage(imageNumber);
  };

  // Hide most UI elements in preparation for the animated resizing of the lightbox.
  Lightbox.prototype.changeImage = function(imageNumber) {
    var self = this;

    this.disableKeyboardNav();
    var $image = this.$lightbox.find('.lb-image');

    this.$overlay.fadeIn(this.options.fadeDuration);

    $('.lb-loader').fadeIn('slow');
    this.$lightbox.find('.lb-image, .lb-nav, .lb-prev, .lb-next, .lb-dataContainer, .lb-numbers, .lb-caption').hide();

    this.$outerContainer.addClass('animating');

    // When image to show is preloaded, we send the width and height to sizeContainer()
    var preloader = new Image();
    preloader.onload = function() {
      var $preloader;
      var imageHeight;
      var imageWidth;
      var maxImageHeight;
      var maxImageWidth;
      var windowHeight;
      var windowWidth;

      $image.attr('src', self.album[imageNumber].link);

      $preloader = $(preloader);

      $image.width(preloader.width);
      $image.height(preloader.height);

      if (self.options.fitImagesInViewport) {
        // Fit image inside the viewport.
        // Take into account the border around the image and an additional 10px gutter on each side.

        windowWidth    = $(window).width();
        windowHeight   = $(window).height();
        maxImageWidth  = windowWidth - self.containerPadding.left - self.containerPadding.right - self.imageBorderWidth.left - self.imageBorderWidth.right - 20;
        maxImageHeight = windowHeight - self.containerPadding.top - self.containerPadding.bottom - self.imageBorderWidth.top - self.imageBorderWidth.bottom - 120;

        // Check if image size is larger then maxWidth|maxHeight in settings
        if (self.options.maxWidth && self.options.maxWidth < maxImageWidth) {
          maxImageWidth = self.options.maxWidth;
        }
        if (self.options.maxHeight && self.options.maxHeight < maxImageWidth) {
          maxImageHeight = self.options.maxHeight;
        }

        // Is there a fitting issue?
        if ((preloader.width > maxImageWidth) || (preloader.height > maxImageHeight)) {
          if ((preloader.width / maxImageWidth) > (preloader.height / maxImageHeight)) {
            imageWidth  = maxImageWidth;
            imageHeight = parseInt(preloader.height / (preloader.width / imageWidth), 10);
            $image.width(imageWidth);
            $image.height(imageHeight);
          } else {
            imageHeight = maxImageHeight;
            imageWidth = parseInt(preloader.width / (preloader.height / imageHeight), 10);
            $image.width(imageWidth);
            $image.height(imageHeight);
          }
        }
      }
      self.sizeContainer($image.width(), $image.height());
    };

    preloader.src          = this.album[imageNumber].link;
    this.currentImageIndex = imageNumber;
  };

  // Stretch overlay to fit the viewport
  Lightbox.prototype.sizeOverlay = function() {
    this.$overlay
      .width($(document).width())
      .height($(document).height());
  };

  // Animate the size of the lightbox to fit the image we are showing
  Lightbox.prototype.sizeContainer = function(imageWidth, imageHeight) {
    var self = this;

    var oldWidth  = this.$outerContainer.outerWidth();
    var oldHeight = this.$outerContainer.outerHeight();
    var newWidth  = imageWidth + this.containerPadding.left + this.containerPadding.right + this.imageBorderWidth.left + this.imageBorderWidth.right;
    var newHeight = imageHeight + this.containerPadding.top + this.containerPadding.bottom + this.imageBorderWidth.top + this.imageBorderWidth.bottom;

    function postResize() {
      self.$lightbox.find('.lb-dataContainer').width(newWidth);
      self.$lightbox.find('.lb-prevLink').height(newHeight);
      self.$lightbox.find('.lb-nextLink').height(newHeight);
      self.showImage();
    }

    if (oldWidth !== newWidth || oldHeight !== newHeight) {
      this.$outerContainer.animate({
        width: newWidth,
        height: newHeight
      }, this.options.resizeDuration, 'swing', function() {
        postResize();
      });
    } else {
      postResize();
    }
  };

  // Display the image and its details and begin preload neighboring images.
  Lightbox.prototype.showImage = function() {
    this.$lightbox.find('.lb-loader').stop(true).hide();
    this.$lightbox.find('.lb-image').fadeIn(this.options.imageFadeDuration);

    this.updateNav();
    this.updateDetails();
    this.preloadNeighboringImages();
    this.enableKeyboardNav();
  };

  // Display previous and next navigation if appropriate.
  Lightbox.prototype.updateNav = function() {
    // Check to see if the browser supports touch events. If so, we take the conservative approach
    // and assume that mouse hover events are not supported and always show prev/next navigation
    // arrows in image sets.
    var alwaysShowNav = false;
    try {
      document.createEvent('TouchEvent');
      alwaysShowNav = (this.options.alwaysShowNavOnTouchDevices) ? true : false;
    } catch (e) {}

    this.$lightbox.find('.lb-nav').show();

    if (this.album.length > 1) {
      if (this.options.wrapAround) {
        if (alwaysShowNav) {
          this.$lightbox.find('.lb-prev, .lb-next').css('opacity', '1');
        }
        this.$lightbox.find('.lb-prev, .lb-next').show();
      } else {
        if (this.currentImageIndex > 0) {
          this.$lightbox.find('.lb-prev').show();
          if (alwaysShowNav) {
            this.$lightbox.find('.lb-prev').css('opacity', '1');
          }
        }
        if (this.currentImageIndex < this.album.length - 1) {
          this.$lightbox.find('.lb-next').show();
          if (alwaysShowNav) {
            this.$lightbox.find('.lb-next').css('opacity', '1');
          }
        }
      }
    }
  };

  // Display caption, image number, and closing button.
  Lightbox.prototype.updateDetails = function() {
    var self = this;

    // Enable anchor clicks in the injected caption html.
    // Thanks Nate Wright for the fix. @https://github.com/NateWr
    if (typeof this.album[this.currentImageIndex].title !== 'undefined' &&
      this.album[this.currentImageIndex].title !== '') {
      var $caption = this.$lightbox.find('.lb-caption');
      if (this.options.sanitizeTitle) {
        $caption.text(this.album[this.currentImageIndex].title);
      } else {
        $caption.html(this.album[this.currentImageIndex].title);
      }
      $caption.fadeIn('fast')
        .find('a').on('click', function(event) {
          if ($(this).attr('target') !== undefined) {
            window.open($(this).attr('href'), $(this).attr('target'));
          } else {
            location.href = $(this).attr('href');
          }
        });
    }

    if (this.album.length > 1 && this.options.showImageNumberLabel) {
      var labelText = this.imageCountLabel(this.currentImageIndex + 1, this.album.length);
      this.$lightbox.find('.lb-number').text(labelText).fadeIn('fast');
    } else {
      this.$lightbox.find('.lb-number').hide();
    }

    this.$outerContainer.removeClass('animating');

    this.$lightbox.find('.lb-dataContainer').fadeIn(this.options.resizeDuration, function() {
      return self.sizeOverlay();
    });
  };

  // Preload previous and next images in set.
  Lightbox.prototype.preloadNeighboringImages = function() {
    if (this.album.length > this.currentImageIndex + 1) {
      var preloadNext = new Image();
      preloadNext.src = this.album[this.currentImageIndex + 1].link;
    }
    if (this.currentImageIndex > 0) {
      var preloadPrev = new Image();
      preloadPrev.src = this.album[this.currentImageIndex - 1].link;
    }
  };

  Lightbox.prototype.enableKeyboardNav = function() {
    $(document).on('keyup.keyboard', $.proxy(this.keyboardAction, this));
  };

  Lightbox.prototype.disableKeyboardNav = function() {
    $(document).off('.keyboard');
  };

  Lightbox.prototype.keyboardAction = function(event) {
    var KEYCODE_ESC        = 27;
    var KEYCODE_LEFTARROW  = 37;
    var KEYCODE_RIGHTARROW = 39;

    var keycode = event.keyCode;
    var key     = String.fromCharCode(keycode).toLowerCase();
    if (keycode === KEYCODE_ESC || key.match(/x|o|c/)) {
      this.end();
    } else if (key === 'p' || keycode === KEYCODE_LEFTARROW) {
      if (this.currentImageIndex !== 0) {
        this.changeImage(this.currentImageIndex - 1);
      } else if (this.options.wrapAround && this.album.length > 1) {
        this.changeImage(this.album.length - 1);
      }
    } else if (key === 'n' || keycode === KEYCODE_RIGHTARROW) {
      if (this.currentImageIndex !== this.album.length - 1) {
        this.changeImage(this.currentImageIndex + 1);
      } else if (this.options.wrapAround && this.album.length > 1) {
        this.changeImage(0);
      }
    }
  };

  // Closing time. :-(
  Lightbox.prototype.end = function() {
    this.disableKeyboardNav();
    $(window).off('resize', this.sizeOverlay);
    this.$lightbox.fadeOut(this.options.fadeDuration);
    this.$overlay.fadeOut(this.options.fadeDuration);
    $('select, object, embed').css({
      visibility: 'visible'
    });
    if (this.options.disableScrolling) {
      $('body').removeClass('lb-disable-scrolling');
    }
  };

  return new Lightbox();
}));


/*
* MIXITUP - A CSS3 and JQuery Filter & Sort Plugin
* Version: 1.5.5
* License: Creative Commons Attribution-NoDerivs 3.0 Unported - CC BY-ND 3.0
* http://creativecommons.org/licenses/by-nd/3.0/
* This software may be used freely on commercial and non-commercial projects with attribution to the author/copyright holder.
* Author: Patrick Kunka
* Copyright 2012-2013 Patrick Kunka, Barrel LLC, All Rights Reserved
* 
* http://mixitup.io
*/

(function($){
    
    // DECLARE METHODS
 
    var methods = {

        // "INIT" METHOD
    
        init: function(settings){

            return this.each(function(){
                
                var browser = window.navigator.appVersion.match(/Chrome\/(\d+)\./),
                    ver = browser ? parseInt(browser[1], 10) : false,
                    chromeFix = function(id){
                        var grid = document.getElementById(id),
                            parent = grid.parentElement,
                            placeholder = document.createElement('div'),
                            frag = document.createDocumentFragment();

                        parent.insertBefore(placeholder, grid);  
                        frag.appendChild(grid);
                        parent.replaceChild(grid, placeholder);
                        frag = null;
                        placeholder = null;
                    };
                
                if(ver && ver == 31 || ver == 32){
                    chromeFix(this.id);
                };
                
                // BUILD CONFIG OBJECT

                var config = {
                    
                    // PUBLIC PROPERTIES
                    
                    targetSelector : '.mix',
                    filterSelector : '.filter',
                    sortSelector : '.sort',
                    buttonEvent: 'click',
                    effects : ['fade', 'scale'],
                    listEffects : null,
                    easing : 'smooth',
                    layoutMode: 'grid',
                    targetDisplayGrid : 'inline-block',
                    targetDisplayList: 'block',
                    listClass : '',
                    gridClass : '',
                    transitionSpeed : 600,
                    showOnLoad : 'all',
                    sortOnLoad : false,
                    multiFilter : false,
                    filterLogic : 'or',
                    resizeContainer : true,
                    minHeight : 0,
                    failClass : 'fail',
                    perspectiveDistance : '3000',
                    perspectiveOrigin : '50% 50%',
                    animateGridList : true,
                    onMixLoad: null,
                    onMixStart : null,
                    onMixEnd : null,

                    // MISC

                    container : null,
                    origOrder : [],
                    startOrder : [],
                    newOrder : [],
                    origSort: [],
                    checkSort: [],
                    filter : '',
                    mixing : false,
                    origDisplay : '',
                    origLayout: '',
                    origHeight : 0, 
                    newHeight : 0,
                    isTouch : false,
                    resetDelay : 0,
                    failsafe : null,

                    // CSS
                    
                    prefix : '',
                    easingFallback : 'ease-in-out',
                    transition : {}, 
                    perspective : {}, 
                    clean : {},
                    fade : '1',
                    scale : '',
                    rotateX : '',
                    rotateY : '',
                    rotateZ : '',
                    blur : '',
                    grayscale : ''
                };
                
                if(settings){
                    $.extend(config, settings);
                };

                // ADD CONFIG OBJECT TO CONTAINER OBJECT PER INSTANTIATION
                
                this.config = config;
                
                // DETECT TOUCH
                
                $.support.touch = 'ontouchend' in document;

                if ($.support.touch) {
                    config.isTouch = true;
                    config.resetDelay = 350;
                };
                
                // LOCALIZE CONTAINER
    
                config.container = $(this);
                var $cont = config.container;
                
                // GET VENDOR PREFIX
                
                config.prefix = prefix($cont[0]);
                config.prefix = config.prefix ? '-'+config.prefix.toLowerCase()+'-' : '';
                
                // CACHE 'DEFAULT' SORTING ORDER
            
                $cont.find(config.targetSelector).each(function(){
                    config.origOrder.push($(this));
                });
                
                // PERFORM SORT ON LOAD 
                
                if(config.sortOnLoad){
                    var sortby, order;
                    if($.isArray(config.sortOnLoad)){
                        sortby = config.sortOnLoad[0], order = config.sortOnLoad[1];
                        $(config.sortSelector+'[data-sort='+config.sortOnLoad[0]+'][data-order='+config.sortOnLoad[1]+']').addClass('active');
                    } else {
                        $(config.sortSelector+'[data-sort='+config.sortOnLoad+']').addClass('active');
                        sortby = config.sortOnLoad, config.sortOnLoad = 'desc';
                    };
                    sort(sortby, order, $cont, config);
                };
                
                // BUILD TRANSITION AND PERSPECTIVE OBJECTS
                
                for(var i = 0; i<2; i++){
                    var a = i==0 ? a = config.prefix : '';
                    config.transition[a+'transition'] = 'all '+config.transitionSpeed+'ms ease-in-out';
                    config.perspective[a+'perspective'] = config.perspectiveDistance+'px';
                    config.perspective[a+'perspective-origin'] = config.perspectiveOrigin;
                };
                
                // BUILD TRANSITION CLEANER
                
                for(var i = 0; i<2; i++){
                    var a = i==0 ? a = config.prefix : '';
                    config.clean[a+'transition'] = 'none';
                };
    
                // CHOOSE GRID OR LIST
    
                if(config.layoutMode == 'list'){
                    $cont.addClass(config.listClass);
                    config.origDisplay = config.targetDisplayList;
                } else {
                    $cont.addClass(config.gridClass);
                    config.origDisplay = config.targetDisplayGrid;
                };
                config.origLayout = config.layoutMode;
                
                // PARSE 'SHOWONLOAD'
                
                var showOnLoadArray = config.showOnLoad.split(' ');
                
                // GIVE ACTIVE FILTER ACTIVE CLASS
                
                $.each(showOnLoadArray, function(){
                    $(config.filterSelector+'[data-filter="'+this+'"]').addClass('active');
                });
                
                // RENAME "ALL" CATEGORY TO "MIX_ALL"
    
                $cont.find(config.targetSelector).addClass('mix_all');
                if(showOnLoadArray[0]  == 'all'){
                    showOnLoadArray[0] = 'mix_all',
                    config.showOnLoad = 'mix_all';
                };
                
                // FADE IN 'SHOWONLOAD'
                
                var $showOnLoad = $();
                $.each(showOnLoadArray, function(){
                    $showOnLoad = $showOnLoad.add($('.'+this))
                });
                
                $showOnLoad.each(function(){
                    var $t = $(this);
                    if(config.layoutMode == 'list'){
                        $t.css('display',config.targetDisplayList);
                    } else {
                        $t.css('display',config.targetDisplayGrid);
                    };
                    $t.css(config.transition);
                });
                
                // WRAP FADE-IN TO PREVENT RACE CONDITION
                
                var delay = setTimeout(function(){
                    
                    config.mixing = true;
                    
                    $showOnLoad.css('opacity','1');
                    
                    // CLEAN UP
                    
                    var reset = setTimeout(function(){
                        if(config.layoutMode == 'list'){
                            $showOnLoad.removeStyle(config.prefix+'transition, transition').css({
                                display: config.targetDisplayList,
                                opacity: 1
                            });
                        } else {
                            $showOnLoad.removeStyle(config.prefix+'transition, transition').css({
                                display: config.targetDisplayGrid,
                                opacity: 1
                            });
                        };
                        
                        // FIRE "ONMIXLOAD" CALLBACK
                        
                        config.mixing = false;

                        if(typeof config.onMixLoad == 'function') {
                            var output = config.onMixLoad.call(this, config);

                            // UPDATE CONFIG IF DATA RETURNED

                            config = output ? output : config;
                        };
                        
                    },config.transitionSpeed);
                },10);
                
                // PRESET ACTIVE FILTER
                
                config.filter = config.showOnLoad;
            
                // BIND SORT CLICK HANDLERS
            
                $(config.sortSelector).bind(config.buttonEvent,function(){
                    
                    if(!config.mixing){
                        
                        // PARSE SORT ARGUMENTS FROM BUTTON CLASSES
                        
                        var $t = $(this),
                        sortby = $t.attr('data-sort'),
                        order = $t.attr('data-order');
                        
                        if(!$t.hasClass('active')){
                            $(config.sortSelector).removeClass('active');
                            $t.addClass('active');
                        } else {
                            if(sortby != 'random')return false;
                        };
                        
                        $cont.find(config.targetSelector).each(function(){
                            config.startOrder.push($(this));
                        });
                
                        goMix(config.filter,sortby,order,$cont, config);
                
                    };
                
                });

                // BIND FILTER CLICK HANDLERS

                $(config.filterSelector).bind(config.buttonEvent,function(){
                
                    if(!config.mixing){
                        
                        var $t = $(this);
                        
                        // PARSE FILTER ARGUMENTS FROM BUTTON CLASSES
        
                        if(config.multiFilter == false){
                            
                            // SINGLE ACTIVE BUTTON
                            
                            $(config.filterSelector).removeClass('active');
                            $t.addClass('active');
                        
                            config.filter = $t.attr('data-filter');
                        
                            $(config.filterSelector+'[data-filter="'+config.filter+'"]').addClass('active');

                        } else {
                        
                            // MULTIPLE ACTIVE BUTTONS
                            
                            var thisFilter = $t.attr('data-filter'); 
                        
                            if($t.hasClass('active')){
                                $t.removeClass('active');
                                
                                // REMOVE FILTER FROM SPACE-SEPERATED STRING
                                
                                var re = new RegExp('(\\s|^)'+thisFilter);
                                config.filter = config.filter.replace(re,'');
                            } else {
                                
                                // ADD FILTER TO SPACE-SEPERATED STRING
                                
                                $t.addClass('active');
                                config.filter = config.filter+' '+thisFilter;
                                
                            };
                        };
                        
                        // GO MIX
                        
                        goMix(config.filter, null, null, $cont, config);

                    };
                
                });
                    
            });
        },
    
        // "TOGRID" METHOD
    
        toGrid: function(){
            return this.each(function(){
                var config = this.config;
                if(config.layoutMode != 'grid'){
                    config.layoutMode = 'grid';
                    goMix(config.filter, null, null, $(this), config);
                };
            });
        },
    
        // "TOLIST" METHOD
    
        toList: function(){
            return this.each(function(){
                var config = this.config;
                if(config.layoutMode != 'list'){
                    config.layoutMode = 'list';
                    goMix(config.filter, null, null, $(this), config);
                };
            });
        },
    
        // "FILTER" METHOD
    
        filter: function(arg){
            return this.each(function(){
                var config = this.config;
                if(!config.mixing){ 
                    $(config.filterSelector).removeClass('active');
                    $(config.filterSelector+'[data-filter="'+arg+'"]').addClass('active');
                    goMix(arg, null, null, $(this), config);
                };
            }); 
        },
    
        // "SORT" METHOD
    
        sort: function(args){
            return this.each(function(){
                var config = this.config,
                    $t = $(this);
                if(!config.mixing){
                    $(config.sortSelector).removeClass('active');
                    if($.isArray(args)){
                        var sortby = args[0], order = args[1];
                        $(config.sortSelector+'[data-sort="'+args[0]+'"][data-order="'+args[1]+'"]').addClass('active');
                    } else {
                        $(config.sortSelector+'[data-sort="'+args+'"]').addClass('active');
                        var sortby = args, order = 'desc';
                    };
                    $t.find(config.targetSelector).each(function(){
                        config.startOrder.push($(this));
                    });
                    
                    goMix(config.filter,sortby,order, $t, config);
                
                };
            });
        },
        
        // "MULTIMIX" METHOD
        
        multimix: function(args){
            return this.each(function(){
                var config = this.config,
                    $t = $(this);
                    multiOut = {
                        filter: config.filter,
                        sort: null,
                        order: 'desc',
                        layoutMode: config.layoutMode
                    };
                $.extend(multiOut, args);
                if(!config.mixing){
                    $(config.filterSelector).add(config.sortSelector).removeClass('active');
                    $(config.filterSelector+'[data-filter="'+multiOut.filter+'"]').addClass('active');
                    if(typeof multiOut.sort !== 'undefined'){
                        $(config.sortSelector+'[data-sort="'+multiOut.sort+'"][data-order="'+multiOut.order+'"]').addClass('active');
                        $t.find(config.targetSelector).each(function(){
                            config.startOrder.push($(this));
                        });
                    };
                    config.layoutMode = multiOut.layoutMode;
                    goMix(multiOut.filter,multiOut.sort,multiOut.order, $t, config);
                };
            });
        },
        
        // "REMIX" METHOD

        remix: function(arg){
            return this.each(function(){
                var config = this.config,
                    $t = $(this);   
                config.origOrder = [];
                $t.find(config.targetSelector).each(function(){
                    var $th = $(this);
                    $th.addClass('mix_all'); 
                    config.origOrder.push($th);
                });
                if(!config.mixing && typeof arg !== 'undefined'){
                    $(config.filterSelector).removeClass('active');
                    $(config.filterSelector+'[data-filter="'+arg+'"]').addClass('active');
                    goMix(arg, null, null, $t, config);
                };
            });
        }
    };
    
    // DECLARE PLUGIN

    $.fn.mixitup = function(method, arg){
        if (methods[method]) {
            return methods[method].apply( this, Array.prototype.slice.call(arguments,1));
        } else if (typeof method === 'object' || ! method){
            return methods.init.apply( this, arguments );
        };
    };
    
    /* ==== THE MAGIC ==== */
    
    function goMix(filter, sortby, order, $cont, config){
        
        // WE ARE NOW MIXING

        clearInterval(config.failsafe);
        config.mixing = true;   
        
        // APPLY ARGS TO CONFIG
        
        config.filter = filter;
        
        // FIRE "ONMIXSTART" CALLBACK
        
        if(typeof config.onMixStart == 'function') {
            var output = config.onMixStart.call(this, config);
            
            // UPDATE CONFIG IF DATA RETURNED
            
            config = output ? output : config;
        };
        
        // SHORT LOCAL VARS
        
        var speed = config.transitionSpeed;
        
        // REBUILD TRANSITION AND PERSPECTIVE OBJECTS
        
        for(var i = 0; i<2; i++){
            var a = i==0 ? a = config.prefix : '';
            config.transition[a+'transition'] = 'all '+speed+'ms linear';
            config.transition[a+'transform'] = a+'translate3d(0,0,0)';
            config.perspective[a+'perspective'] = config.perspectiveDistance+'px';
            config.perspective[a+'perspective-origin'] = config.perspectiveOrigin;
        };
        
        // CACHE TARGET ELEMENTS FOR QUICK ACCESS
        
        var mixSelector = config.targetSelector,
        $targets = $cont.find(mixSelector);
        
        // ADD DATA OBJECT TO EACH TARGET
        
        $targets.each(function(){
            this.data = {};
        });
        
        // RE-DEFINE CONTAINER INCASE NOT IMMEDIATE PARENT OF TARGET ELEMENTS 
        
        var $par = $targets.parent();
    
        // ADD PERSPECTIVE TO CONTAINER 
        
        $par.css(config.perspective);
        
        // SETUP EASING

        config.easingFallback = 'ease-in-out';
        if(config.easing == 'smooth')config.easing = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        if(config.easing == 'snap')config.easing = 'cubic-bezier(0.77, 0, 0.175, 1)';
        if(config.easing == 'windback'){
            config.easing = 'cubic-bezier(0.175, 0.885, 0.320, 1.275)',
            config.easingFallback = 'cubic-bezier(0.175, 0.885, 0.320, 1)'; // Fall-back for old webkit, with no values > 1 or < 1
        };
        if(config.easing == 'windup'){
            config.easing = 'cubic-bezier(0.6, -0.28, 0.735, 0.045)',
            config.easingFallback = 'cubic-bezier(0.6, 0.28, 0.735, 0.045)';
        };
        
        // USE LIST SPECIFIC EFFECTS IF DECLARED
        
        var effectsOut = config.layoutMode == 'list' && config.listEffects != null ? config.listEffects : config.effects;
    
        // BUILD EFFECTS STRINGS & SKIP IF IE8
    
        if (Array.prototype.indexOf){
            config.fade = effectsOut.indexOf('fade') > -1 ? '0' : '';
            config.scale = effectsOut.indexOf('scale') > -1 ? 'scale(.01)' : '';
            config.rotateZ = effectsOut.indexOf('rotateZ') > -1 ? 'rotate(180deg)' : '';
            config.rotateY = effectsOut.indexOf('rotateY') > -1 ? 'rotateY(90deg)' : '';
            config.rotateX = effectsOut.indexOf('rotateX') > -1 ? 'rotateX(90deg)' : '';
            config.blur = effectsOut.indexOf('blur') > -1 ? 'blur(8px)' : '';
            config.grayscale = effectsOut.indexOf('grayscale') > -1 ? 'grayscale(100%)' : '';
        };
        
        // DECLARE NEW JQUERY OBJECTS FOR GROUPING
        
        var $show = $(), 
        $hide = $(),
        filterArray = [],
        multiDimensional = false;
        
        // BUILD FILTER ARRAY(S)
        
        if(typeof filter === 'string'){
            
            // SINGLE DIMENSIONAL FILTERING
            
            filterArray = buildFilterArray(filter);
            
        } else {
            
            // MULTI DIMENSIONAL FILTERING
            
            multiDimensional = true;
            
            $.each(filter,function(i){
                filterArray[i] = buildFilterArray(this);
            });
        };

        // "OR" LOGIC (DEFAULT)
        
        if(config.filterLogic == 'or'){
            
            if(filterArray[0] == '') filterArray.shift(); // IF FIRST ITEM IN ARRAY IS AN EMPTY SPACE, DELETE
            
            // IF NO ELEMENTS ARE DESIRED THEN HIDE ALL VISIBLE ELEMENTS
        
            if(filterArray.length < 1){
                
                $hide = $hide.add($cont.find(mixSelector+':visible'));
                
            } else {

            // ELSE CHECK EACH TARGET ELEMENT FOR ANY FILTER CATEGORY:
            
                $targets.each(function(){
                    var $t = $(this);
                    if(!multiDimensional){
                        // IF HAS ANY FILTER, ADD TO "SHOW" OBJECT
                        if($t.is('.'+filterArray.join(', .'))){
                            $show = $show.add($t);
                        // ELSE IF HAS NO FILTERS, ADD TO "HIDE" OBJECT
                        } else {
                            $hide = $hide.add($t);
                        };
                    } else {
                        
                        var pass = 0;
                        // FOR EACH DIMENSION
                        
                        $.each(filterArray,function(i){
                            if(this.length){
                                if($t.is('.'+this.join(', .'))){
                                    pass++
                                };
                            } else if(pass > 0){
                                pass++;
                            };
                        });
                        // IF PASSES ALL DIMENSIONS, SHOW
                        if(pass == filterArray.length){
                            $show = $show.add($t);
                        // ELSE HIDE
                        } else {
                            $hide = $hide.add($t);
                        };
                    };
                });
            
            };
    
        } else {
            
        // "AND" LOGIC
            
            // ADD "MIX_SHOW" CLASS TO ELEMENTS THAT HAVE ALL FILTERS
            
            $show = $show.add($par.find(mixSelector+'.'+filterArray.join('.')));
            
            // ADD "MIX_HIDE" CLASS TO EVERYTHING ELSE
            
            $hide = $hide.add($par.find(mixSelector+':not(.'+filterArray.join('.')+'):visible'));
        };
        
        // GET TOTAL NUMBER OF ELEMENTS TO SHOW
        
        var total = $show.length;
        
        // DECLARE NEW JQUERY OBJECTS

        var $tohide = $(),
        $toshow = $(),
        $pre = $();
        
        // FOR ELEMENTS TO BE HIDDEN, IF NOT ALREADY HIDDEN THEN ADD TO OBJECTS "TOHIDE" AND "PRE" 
        // TO INDICATE PRE-EXISTING ELEMENTS TO BE HIDDEN
        
        $hide.each(function(){
            var $t = $(this);
            if($t.css('display') != 'none'){
                $tohide = $tohide.add($t);
                $pre = $pre.add($t);
            };
        });
        
        // IF ALL ELEMENTS ARE ALREADY SHOWN AND THERE IS NOTHING TO HIDE, AND NOT PERFORMING A LAYOUT CHANGE OR SORT:
        
        if($show.filter(':visible').length == total && !$tohide.length && !sortby){
            
            if(config.origLayout == config.layoutMode){
                
                // THEN CLEAN UP AND GO HOME

                resetFilter();
                return false;
            } else {
                
                // IF ONLY ONE ITEM AND CHANGING FORM GRID TO LIST, MOST LIKELY POSITION WILL NOT CHANGE SO WE'RE DONE
            
                if($show.length == 1){ 
                    
                    if(config.layoutMode == 'list'){ 
                        $cont.addClass(config.listClass);
                        $cont.removeClass(config.gridClass);
                        $pre.css('display',config.targetDisplayList);
                    } else {
                        $cont.addClass(config.gridClass);
                        $cont.removeClass(config.listClass);
                        $pre.css('display',config.targetDisplayGrid);
                    };
                    
                    // THEN CLEAN UP AND GO HOME

                    resetFilter();
                    return false;
                }
            };
        };
        
        // GET CONTAINER'S STARTING HEIGHT

        config.origHeight = $par.height();
        
        // IF THERE IS SOMETHING TO BE SHOWN:

        if($show.length){
            
            // REMOVE "FAIL CLASS" FROM CONTAINER IF EXISTS
            
            $cont.removeClass(config.failClass);
            
            
            // FOR ELEMENTS TO BE SHOWN, IF NOT ALREADY SHOWN THEN ADD TO OBJECTS "TOSHOW" ELSE ADD CLASS "MIX_PRE"
            // TO INDICATE PRE-EXISTING ELEMENT

            $show.each(function(){ 
                var $t = $(this);
                if($t.css('display') == 'none'){
                    $toshow = $toshow.add($t)
                } else {
                    $pre = $pre.add($t);
                };
            });
    
            // IF NON-ANIMATED LAYOUT MODE TRANSITION:
        
            if((config.origLayout != config.layoutMode) && config.animateGridList == false){ 
            
                // ADD NEW DISPLAY TYPES, CLEAN UP AND GO HOME
                
                if(config.layoutMode == 'list'){ 
                    $cont.addClass(config.listClass);
                    $cont.removeClass(config.gridClass);
                    $pre.css('display',config.targetDisplayList);
                } else {
                    $cont.addClass(config.gridClass);
                    $cont.removeClass(config.listClass);
                    $pre.css('display',config.targetDisplayGrid);
                };
                
                resetFilter();
                return false;
            };
            
            // IF IE, FUCK OFF, AND THEN CLEAN UP AND GO HOME
        
            if(!window.atob){
                resetFilter();
                return false;
            };
            
            // OVERRIDE ANY EXISTING TRANSITION TIMING FOR CALCULATIONS
            
            $targets.css(config.clean);
            
            // FOR EACH PRE-EXISTING ELEMENT, ADD STARTING POSITION TO 'ORIGPOS' ARRAY
            
            $pre.each(function(){
                this.data.origPos = $(this).offset();
            });
    
            // TEMPORARILY SHOW ALL ELEMENTS TO SHOW (THAT ARE NOT ALREADY SHOWN), WITHOUT HIDING ELEMENTS TO HIDE
            // AND ADD/REMOVE GRID AND LIST CLASSES FROM CONTAINER
    
            if(config.layoutMode == 'list'){
                $cont.addClass(config.listClass);
                $cont.removeClass(config.gridClass);
                $toshow.css('display',config.targetDisplayList);
            } else {
                $cont.addClass(config.gridClass);
                $cont.removeClass(config.listClass);
                $toshow.css('display',config.targetDisplayGrid);
            };
            
            // FOR EACH ELEMENT NOW SHOWN, ADD ITS INTERMEDIATE POSITION TO 'SHOWINTERPOS' ARRAY
    
            $toshow.each(function(){
                this.data.showInterPos = $(this).offset();
            });
            
            // FOR EACH ELEMENT TO BE HIDDEN, BUT NOT YET HIDDEN, AND NOW MOVED DUE TO SHOWN ELEMENTS,
            // ADD ITS INTERMEDIATE POSITION TO 'HIDEINTERPOS' ARRAY

            $tohide.each(function(){
                this.data.hideInterPos = $(this).offset();
            });
            
            // FOR EACH PRE-EXISTING ELEMENT, NOW MOVED DUE TO SHOWN ELEMENTS, ADD ITS POSITION TO 'PREINTERPOS' ARRAY
    
            $pre.each(function(){
                this.data.preInterPos = $(this).offset();
            });
            
            // SET DISPLAY PROPERTY OF PRE-EXISTING ELEMENTS INCASE WE ARE CHANGING LAYOUT MODE
    
            if(config.layoutMode == 'list'){
                $pre.css('display',config.targetDisplayList);
            } else {
                $pre.css('display',config.targetDisplayGrid);
            };
            
            // IF A SORT ARGUMENT HAS BEEN SENT, RUN SORT FUNCTION SO OBJECTS WILL MOVE TO THEIR FINAL ORDER
            
            if(sortby){
                sort(sortby, order, $cont, config); 
            };
            
            // IF VISIBLE SORT ORDER IS THE SAME (WHICH WOULD NOT TRIGGER A TRANSITION EVENT)
        
            if(sortby && compareArr(config.origSort, config.checkSort)){
                
                // THEN CLEAN UP AND GO HOME
                resetFilter();
                return false;
            };
            
            // TEMPORARILY HIDE ALL SHOWN ELEMENTS TO HIDE

            $tohide.hide();
            
            // FOR EACH ELEMENT TO SHOW, AND NOW MOVED DUE TO HIDDEN ELEMENTS BEING REMOVED, 
            // ADD ITS POSITION TO 'FINALPOS' ARRAY
            
            $toshow.each(function(i){
                this.data.finalPos = $(this).offset();
            });
            
            // FOR EACH PRE-EXISTING ELEMENT NOW MOVED DUE TO HIDDEN ELEMENTS BEING REMOVED,
            // ADD ITS POSITION TO 'FINALPREPOS' ARRAY
    
            $pre.each(function(){
                this.data.finalPrePos = $(this).offset();
            });
            
            // SINCE WE ARE IN OUT FINAL STATE, GET NEW HEIGHT OF CONTAINER
    
            config.newHeight = $par.height();
            
            // IF A SORT ARGUMENT AS BEEN SENT, RUN SORT FUNCTION 'RESET' TO MOVE ELEMENTS BACK TO THEIR STARTING ORDER
            
            if(sortby){
                sort('reset', null, $cont, config);
            };
            
            // RE-HIDE ALL ELEMENTS TEMPORARILY SHOWN
            
            $toshow.hide();
            
            // SET DISPLAY PROPERTY OF PRE-EXISTING ELEMENTS BACK TO THEIR 
            // ORIGINAL PROPERTY, INCASE WE ARE CHANGING LAYOUT MODE
            
            $pre.css('display',config.origDisplay);
            
            // ADD/REMOVE GRID AND LIST CLASSES FROM CONTAINER
    
            if(config.origDisplay == 'block'){
                $cont.addClass(config.listClass);
                $toshow.css('display', config.targetDisplayList);
            } else {
                $cont.removeClass(config.listClass);
                $toshow.css('display', config.targetDisplayGrid);
            };
            
            // IF WE ARE ANIMATING CONTAINER, RESET IT TO ITS STARTING HEIGHT
        
            if(config.resizeContainer)$par.css('height', config.origHeight+'px');
    
            // ADD TRANSFORMS TO ALL ELEMENTS TO SHOW
            
            var toShowCSS = {};
            
            for(var i = 0; i<2; i++){
                var a = i==0 ? a = config.prefix : '';
                toShowCSS[a+'transform'] = config.scale+' '+config.rotateX+' '+config.rotateY+' '+config.rotateZ;
                toShowCSS[a+'filter'] = config.blur+' '+config.grayscale;
            };
            
            $toshow.css(toShowCSS);
    
            // FOR EACH PRE-EXISTING ELEMENT, SUBTRACT ITS INTERMEDIATE POSITION FROM ITS ORIGINAL POSITION 
            // TO GET ITS STARTING OFFSET
    
            $pre.each(function(){
                var data = this.data,
                $t = $(this);
                
                if ($t.hasClass('mix_tohide')){
                    data.preTX = data.origPos.left - data.hideInterPos.left;
                    data.preTY = data.origPos.top - data.hideInterPos.top;
                } else {
                    data.preTX = data.origPos.left - data.preInterPos.left;
                    data.preTY = data.origPos.top - data.preInterPos.top;
                };
                var preCSS = {};
                for(var i = 0; i<2; i++){
                    var a = i==0 ? a = config.prefix : '';
                    preCSS[a+'transform'] = 'translate('+data.preTX+'px,'+data.preTY+'px)';
                };
                
                $t.css(preCSS); 
            });
            
            // ADD/REMOVE GRID AND LIST CLASSES FROM CONTAINER
    
            if(config.layoutMode == 'list'){
                $cont.addClass(config.listClass);
                $cont.removeClass(config.gridClass);
            } else {
                $cont.addClass(config.gridClass);
                $cont.removeClass(config.listClass);
            };
            
            // WRAP ANIMATION FUNCTIONS IN 10ms TIMEOUT TO PREVENT RACE CONDITION
            
            var delay = setTimeout(function(){
        
                // APPLY TRANSITION TIMING TO CONTAINER, AND BEGIN ANIMATION TO NEW HEIGHT
                
                if(config.resizeContainer){
                    var containerCSS = {};
                    for(var i = 0; i<2; i++){
                        var a = i==0 ? a = config.prefix : '';
                        containerCSS[a+'transition'] = 'all '+speed+'ms ease-in-out';
                        containerCSS['height'] = config.newHeight+'px';
                    };
                    $par.css(containerCSS);
                };
    
                // BEGIN FADING IN/OUT OF ALL ELEMENTS TO SHOW/HIDE
                $tohide.css('opacity',config.fade);
                $toshow.css('opacity',1);
    
                // FOR EACH ELEMENT BEING SHOWN, CALCULATE ITS TRAJECTORY BY SUBTRACTING
                // ITS INTERMEDIATE POSITION FROM ITS FINAL POSITION.
                // ALSO ADD SPEED AND EASING
                
                $toshow.each(function(){
                    var data = this.data;
                    data.tX = data.finalPos.left - data.showInterPos.left;
                    data.tY = data.finalPos.top - data.showInterPos.top;
                    
                    var toShowCSS = {};
                    for(var i = 0; i<2; i++){
                        var a = i==0 ? a = config.prefix : '';
                        toShowCSS[a+'transition-property'] = a+'transform, '+a+'filter, opacity';
                        toShowCSS[a+'transition-timing-function'] = config.easing+', linear, linear';
                        toShowCSS[a+'transition-duration'] = speed+'ms';
                        toShowCSS[a+'transition-delay'] = '0';
                        toShowCSS[a+'transform'] = 'translate('+data.tX+'px,'+data.tY+'px)';
                        toShowCSS[a+'filter'] = 'none';
                    };
                    
                    $(this).css('-webkit-transition', 'all '+speed+'ms '+config.easingFallback).css(toShowCSS);
                });
                
                // FOR EACH PRE-EXISTING ELEMENT, IF IT HAS A FINAL POSITION, CALCULATE 
                // ITS TRAJETORY BY SUBTRACTING ITS INTERMEDIATE POSITION FROM ITS FINAL POSITION.
                // ALSO ADD SPEED AND EASING
                
                $pre.each(function(){
                    var data = this.data
                    data.tX = data.finalPrePos.left != 0 ? data.finalPrePos.left - data.preInterPos.left : 0;
                    data.tY = data.finalPrePos.left != 0 ? data.finalPrePos.top - data.preInterPos.top : 0;
                    
                    var preCSS = {};
                    for(var i = 0; i<2; i++){
                        var a = i==0 ? a = config.prefix : '';
                        preCSS[a+'transition'] = 'all '+speed+'ms '+config.easing;
                        preCSS[a+'transform'] = 'translate('+data.tX+'px,'+data.tY+'px)';
                    };
                    
                    $(this).css('-webkit-transition', 'all '+speed+'ms '+config.easingFallback).css(preCSS);
                });
        
                // BEGIN TRANSFORMS ON ALL ELEMENTS TO BE HIDDEN
                
                var toHideCSS = {};
                for(var i = 0; i<2; i++){
                    var a = i==0 ? a = config.prefix : '';
                    toHideCSS[a+'transition'] = 'all '+speed+'ms '+config.easing+', '+a+'filter '+speed+'ms linear, opacity '+speed+'ms linear';
                    toHideCSS[a+'transform'] = config.scale+' '+config.rotateX+' '+config.rotateY+' '+config.rotateZ;
                    toHideCSS[a+'filter'] = config.blur+' '+config.grayscale;
                    toHideCSS['opacity'] = config.fade;
                };
                
                $tohide.css(toHideCSS);
                
                // ALL ANIMATIONS HAVE NOW BEEN STARTED, NOW LISTEN FOR TRANSITION END:
                
                $par.bind('webkitTransitionEnd transitionend otransitionend oTransitionEnd',function(e){
                    
                    if (e.originalEvent.propertyName.indexOf('transform') > -1 || e.originalEvent.propertyName.indexOf('opacity') > -1){
                        
                        if(mixSelector.indexOf('.') > -1){
                        
                        // IF MIXSELECTOR IS A CLASS NAME
                        
                            if($(e.target).hasClass(mixSelector.replace('.',''))){
                                resetFilter();
                            };
                        
                        } else {
                            
                        // IF MIXSELECTOR IS A TAG
                        
                            if($(e.target).is(mixSelector)){
                                resetFilter();
                            };
                            
                        };
                        
                    };
                }); 
    
            },10);
            
            // LAST RESORT EMERGENCY FAILSAFE
            
            config.failsafe = setTimeout(function(){
                if(config.mixing){
                    resetFilter();
                };
            }, speed + 400);
    
        } else {
            
        // ELSE IF NOTHING TO SHOW, AND EVERYTHING TO BE HIDDEN
        
            // IF WE ARE RESIZING CONTAINER, SET ITS STARTING HEIGHT
    
            if(config.resizeContainer)$par.css('height', config.origHeight+'px');
            
            // IF IE, FUCK OFF, AND THEN GO HOME
            
            if(!window.atob){
                resetFilter();
                return false;
            };
            
            // GROUP ALL ELEMENTS TO HIDE INTO JQUERY OBJECT
            
            $tohide = $hide;
            
            // WRAP ANIMATION FUNCTIONS IN A 10ms DELAY TO PREVENT RACE CONDITION
    
            var delay = setTimeout(function(){
                
                // APPLY PERSPECTIVE TO CONTAINER
    
                $par.css(config.perspective);
                
                // APPLY TRANSITION TIMING TO CONTAINER, AND BEGIN ANIMATION TO NEW HEIGHT
        
                if(config.resizeContainer){
                    var containerCSS = {};
                    for(var i = 0; i<2; i++){
                        var a = i==0 ? a = config.prefix : '';
                        containerCSS[a+'transition'] = 'height '+speed+'ms ease-in-out';
                        containerCSS['height'] = config.minHeight+'px';
                    };
                    $par.css(containerCSS);
                };
    
                // APPLY TRANSITION TIMING TO ALL TARGET ELEMENTS
                
                $targets.css(config.transition);
                
                // GET TOTAL NUMBER OF ELEMENTS TO HIDE
    
                var totalHide = $hide.length;
                
                // IF SOMETHING TO HIDE:
    
                if(totalHide){
                    
                    // BEGIN TRANSFORMS ON ALL ELEMENTS TO BE HIDDEN

                    var toHideCSS = {};
                    for(var i = 0; i<2; i++){
                        var a = i==0 ? a = config.prefix : '';
                        toHideCSS[a+'transform'] = config.scale+' '+config.rotateX+' '+config.rotateY+' '+config.rotateZ;
                        toHideCSS[a+'filter'] = config.blur+' '+config.grayscale;
                        toHideCSS['opacity'] = config.fade;
                    };

                    $tohide.css(toHideCSS);
                    
                    // ALL ANIMATIONS HAVE NOW BEEN STARTED, NOW LISTEN FOR TRANSITION END:

                    $par.bind('webkitTransitionEnd transitionend otransitionend oTransitionEnd',function(e){
                        if (e.originalEvent.propertyName.indexOf('transform') > -1 || e.originalEvent.propertyName.indexOf('opacity') > -1){
                            $cont.addClass(config.failClass);
                            resetFilter();
                        };
                    });
        
                } else {
                    
                // ELSE, WE'RE DONE MIXING
                    
                    config.mixing = false;
                };
    
            }, 10);
        }; 
        
        // CLEAN UP AND RESET FUNCTION

        function resetFilter(){
            
            // UNBIND TRANSITION END EVENTS FROM CONTAINER
            
            $par.unbind('webkitTransitionEnd transitionend otransitionend oTransitionEnd');
            
            // IF A SORT ARGUMENT HAS BEEN SENT, SORT ELEMENTS TO THEIR FINAL ORDER
            
            if(sortby){
                sort(sortby, order, $cont, config);
            };
            
            // EMPTY SORTING ARRAYS
        
            config.startOrder = [], config.newOrder = [], config.origSort = [], config.checkSort = [];
        
            // REMOVE INLINE STYLES FROM ALL TARGET ELEMENTS AND SLAM THE BRAKES ON
            
            $targets.removeStyle(
                config.prefix+'filter, filter, '+config.prefix+'transform, transform, opacity, display'
            ).css(config.clean).removeAttr('data-checksum');
            
            // BECAUSE IE SUCKS
            
            if(!window.atob){
                $targets.css({
                    display: 'none',
                    opacity: '0'
                });
            };
            
            // REMOVE HEIGHT FROM CONTAINER ONLY IF RESIZING
            
            var remH = config.resizeContainer ? 'height' : '';
            
            // REMOVE INLINE STYLES FROM CONTAINER
        
            $par.removeStyle(
                config.prefix+'transition, transition, '+config.prefix+'perspective, perspective, '+config.prefix+'perspective-origin, perspective-origin, '+remH
            );
            
            // ADD FINAL DISPLAY PROPERTIES AND OPACITY TO ALL SHOWN ELEMENTS
            // CACHE CURRENT LAYOUT MODE & SORT FOR NEXT MIX
            
            if(config.layoutMode == 'list'){
                $show.css({display:config.targetDisplayList, opacity:'1'});
                config.origDisplay = config.targetDisplayList;
            } else {
                $show.css({display:config.targetDisplayGrid, opacity:'1'});
                config.origDisplay = config.targetDisplayGrid;
            };
            config.origLayout = config.layoutMode;
                
            var wait = setTimeout(function(){
                
                // LET GO OF THE BRAKES
                
                $targets.removeStyle(config.prefix+'transition, transition');
            
                // WE'RE DONE MIXING
            
                config.mixing = false;
            
                // FIRE "ONMIXEND" CALLBACK
            
                if(typeof config.onMixEnd == 'function') {
                    var output = config.onMixEnd.call(this, config);
                
                    // UPDATE CONFIG IF DATA RETURNED
                
                    config = output ? output : config;
                };
            });
        };
    };
    
    // SORT FUNCTION
    
    function sort(sortby, order, $cont, config){

        // COMPARE BY ATTRIBUTE

        function compare(a,b) {
            var sortAttrA = isNaN(a.attr(sortby) * 1) ? a.attr(sortby).toLowerCase() : a.attr(sortby) * 1,
                sortAttrB = isNaN(b.attr(sortby) * 1) ? b.attr(sortby).toLowerCase() : b.attr(sortby) * 1;
            if (sortAttrA < sortAttrB)
                return -1;
            if (sortAttrA > sortAttrB)
                return 1;
            return 0;
        };
        
        // REBUILD DOM

        function rebuild(element){
            if(order == 'asc'){
                $sortWrapper.prepend(element).prepend(' ');
            } else {
                $sortWrapper.append(element).append(' ');
            };
        };
        
        // RANDOMIZE ARRAY

        function arrayShuffle(oldArray){
            var newArray = oldArray.slice();
            var len = newArray.length;
            var i = len;
            while (i--){
                var p = parseInt(Math.random()*len);
                var t = newArray[i];
                newArray[i] = newArray[p];
                newArray[p] = t;
            };
            return newArray; 
        };
        
        // SORT
        
        $cont.find(config.targetSelector).wrapAll('<div class="mix_sorter"/>');
        
        var $sortWrapper = $cont.find('.mix_sorter');
        
        if(!config.origSort.length){
            $sortWrapper.find(config.targetSelector+':visible').each(function(){
                $(this).wrap('<s/>');
                config.origSort.push($(this).parent().html().replace(/\s+/g, ''));
                $(this).unwrap();
            });
        };
        
        
        
        $sortWrapper.empty();
        
        if(sortby == 'reset'){
            $.each(config.startOrder,function(){
                $sortWrapper.append(this).append(' ');
            });
        } else if(sortby == 'default'){
            $.each(config.origOrder,function(){
                rebuild(this);
            });
        } else if(sortby == 'random'){
            if(!config.newOrder.length){
                config.newOrder = arrayShuffle(config.startOrder);
            };
            $.each(config.newOrder,function(){
                $sortWrapper.append(this).append(' ');
            }); 
        } else if(sortby == 'custom'){
            $.each(order, function(){
                rebuild(this);
            });
        } else { 
            // SORT BY ATTRIBUTE
            
            if(typeof config.origOrder[0].attr(sortby) === 'undefined'){
                console.log('No such attribute found. Terminating');
                return false;
            };
            
            if(!config.newOrder.length){
                $.each(config.origOrder,function(){
                    config.newOrder.push($(this));
                });
                config.newOrder.sort(compare);
            };
            $.each(config.newOrder,function(){
                rebuild(this);
            });
            
        };
        config.checkSort = [];
        $sortWrapper.find(config.targetSelector+':visible').each(function(i){
            var $t = $(this);
            if(i == 0){
                
                // PREVENT COMPARE RETURNING FALSE POSITIVES ON ELEMENTS WITH NO CLASS/ATTRIBUTES
                
                $t.attr('data-checksum','1');
            };
            $t.wrap('<s/>');
            config.checkSort.push($t.parent().html().replace(/\s+/g, ''));
            $t.unwrap();
        });
        
        $cont.find(config.targetSelector).unwrap();
    };
    
    // FIND VENDOR PREFIX

    function prefix(el) {
        var prefixes = ["Webkit", "Moz", "O", "ms"];
        for (var i = 0; i < prefixes.length; i++){
            if (prefixes[i] + "Transition" in el.style){
                return prefixes[i];
            };
        };
        return "transition" in el.style ? "" : false;
    };
    
    // REMOVE SPECIFIC STYLES
    
    $.fn.removeStyle = function(style){
        return this.each(function(){
            var obj = $(this);
            style = style.replace(/\s+/g, '');
            var styles = style.split(',');
            $.each(styles,function(){
                
                var search = new RegExp(this.toString() + '[^;]+;?', 'g');
                obj.attr('style', function(i, style){
                    if(style) return style.replace(search, '');
                });
            });
        });
    };

    // COMPARE ARRAYS 
    
    function compareArr(a,b){
        if (a.length != b.length) return false;
        for (var i = 0; i < b.length; i++){
            if (a[i].compare) { 
                if (!a[i].compare(b[i])) return false;
            };
            if (a[i] !== b[i]) return false;
        };
        return true;
    };
    
    // BUILD FILTER ARRAY(S)
    
    function buildFilterArray(str){
        // CLEAN FILTER STRING
        str = str.replace(/\s{2,}/g, ' ');
        // FOR EACH PEROID SEPERATED CLASS NAME, ADD STRING TO FILTER ARRAY
        var arr = str.split(' ');
        // IF ALL, REPLACE WITH MIX_ALL
        $.each(arr,function(i){
            if(this == 'all')arr[i] = 'mix_all';
        });
        if(arr[0] == "")arr.shift(); 
        return arr;
    };

    
})(jQuery);

/**
 * BxSlider v4.1.1 - Fully loaded, responsive content slider
 * http://bxslider.com
 *
 * Copyright 2013, Steven Wanderski - http://stevenwanderski.com - http://bxcreative.com
 * Written while drinking Belgian ales and listening to jazz
 *
 * Released under the MIT license - http://opensource.org/licenses/MIT
 */

;(function($){

	var plugin = {};

	var defaults = {

		// GENERAL
		mode: 'horizontal',
		slideSelector: '',
		infiniteLoop: true,
		hideControlOnEnd: false,
		speed: 500,
		easing: null,
		slideMargin: 0,
		startSlide: 0,
		randomStart: false,
		captions: false,
		ticker: false,
		tickerHover: false,
		adaptiveHeight: false,
		adaptiveHeightSpeed: 500,
		video: false,
		useCSS: true,
		preloadImages: 'visible',
		responsive: true,

		// TOUCH
		touchEnabled: true,
		swipeThreshold: 50,
		oneToOneTouch: true,
		preventDefaultSwipeX: true,
		preventDefaultSwipeY: false,

		// PAGER
		pager: true,
		pagerType: 'full',
		pagerShortSeparator: ' / ',
		pagerSelector: null,
		buildPager: null,
		pagerCustom: null,

		// CONTROLS
		controls: true,
		nextText: 'Next',
		prevText: 'Prev',
		nextSelector: null,
		prevSelector: null,
		autoControls: false,
		startText: 'Start',
		stopText: 'Stop',
		autoControlsCombine: false,
		autoControlsSelector: null,

		// AUTO
		auto: false,
		pause: 4000,
		autoStart: true,
		autoDirection: 'next',
		autoHover: false,
		autoDelay: 0,

		// CAROUSEL
		minSlides: 1,
		maxSlides: 1,
		moveSlides: 0,
		slideWidth: 0,

		// CALLBACKS
		onSliderLoad: function() {},
		onSlideBefore: function() {},
		onSlideAfter: function() {},
		onSlideNext: function() {},
		onSlidePrev: function() {}
	}

	$.fn.bxSlider = function(options){

		if(this.length == 0) return this;

		// support mutltiple elements
		if(this.length > 1){
			this.each(function(){$(this).bxSlider(options)});
			return this;
		}

		// create a namespace to be used throughout the plugin
		var slider = {};
		// set a reference to our slider element
		var el = this;
		plugin.el = this;

		/**
		 * Makes slideshow responsive
		 */
		// first get the original window dimens (thanks alot IE)
		var windowWidth = $(window).width();
		var windowHeight = $(window).height();



		/**
		 * ===================================================================================
		 * = PRIVATE FUNCTIONS
		 * ===================================================================================
		 */

		/**
		 * Initializes namespace settings to be used throughout plugin
		 */
		var init = function(){
			// merge user-supplied options with the defaults
			slider.settings = $.extend({}, defaults, options);
			// parse slideWidth setting
			slider.settings.slideWidth = parseInt(slider.settings.slideWidth);
			// store the original children
			slider.children = el.children(slider.settings.slideSelector);
			// check if actual number of slides is less than minSlides / maxSlides
			if(slider.children.length < slider.settings.minSlides) slider.settings.minSlides = slider.children.length;
			if(slider.children.length < slider.settings.maxSlides) slider.settings.maxSlides = slider.children.length;
			// if random start, set the startSlide setting to random number
			if(slider.settings.randomStart) slider.settings.startSlide = Math.floor(Math.random() * slider.children.length);
			// store active slide information
			slider.active = { index: slider.settings.startSlide }
			// store if the slider is in carousel mode (displaying / moving multiple slides)
			slider.carousel = slider.settings.minSlides > 1 || slider.settings.maxSlides > 1;
			// if carousel, force preloadImages = 'all'
			if(slider.carousel) slider.settings.preloadImages = 'all';
			// calculate the min / max width thresholds based on min / max number of slides
			// used to setup and update carousel slides dimensions
			slider.minThreshold = (slider.settings.minSlides * slider.settings.slideWidth) + ((slider.settings.minSlides - 1) * slider.settings.slideMargin);
			slider.maxThreshold = (slider.settings.maxSlides * slider.settings.slideWidth) + ((slider.settings.maxSlides - 1) * slider.settings.slideMargin);
			// store the current state of the slider (if currently animating, working is true)
			slider.working = false;
			// initialize the controls object
			slider.controls = {};
			// initialize an auto interval
			slider.interval = null;
			// determine which property to use for transitions
			slider.animProp = slider.settings.mode == 'vertical' ? 'top' : 'left';
			// determine if hardware acceleration can be used
			slider.usingCSS = slider.settings.useCSS && slider.settings.mode != 'fade' && (function(){
				// create our test div element
				var div = document.createElement('div');
				// css transition properties
				var props = ['WebkitPerspective', 'MozPerspective', 'OPerspective', 'msPerspective'];
				// test for each property
				for(var i in props){
					if(div.style[props[i]] !== undefined){
						slider.cssPrefix = props[i].replace('Perspective', '').toLowerCase();
						slider.animProp = '-' + slider.cssPrefix + '-transform';
						return true;
					}
				}
				return false;
			}());
			// if vertical mode always make maxSlides and minSlides equal
			if(slider.settings.mode == 'vertical') slider.settings.maxSlides = slider.settings.minSlides;
			// save original style data
			el.data("origStyle", el.attr("style"));
			el.children(slider.settings.slideSelector).each(function() {
			  $(this).data("origStyle", $(this).attr("style"));
			});
			// perform all DOM / CSS modifications
			setup();
		}

		/**
		 * Performs all DOM and CSS modifications
		 */
		var setup = function(){
			// wrap el in a wrapper
			el.wrap('<div class="bx-wrapper"><div class="bx-viewport"></div></div>');
			// store a namspace reference to .bx-viewport
			slider.viewport = el.parent();
			// add a loading div to display while images are loading
			slider.loader = $('<div class="bx-loading" />');
			slider.viewport.prepend(slider.loader);
			// set el to a massive width, to hold any needed slides
			// also strip any margin and padding from el
			el.css({
				width: slider.settings.mode == 'horizontal' ? (slider.children.length * 100 + 215) + '%' : 'auto',
				position: 'relative'
			});
			// if using CSS, add the easing property
			if(slider.usingCSS && slider.settings.easing){
				el.css('-' + slider.cssPrefix + '-transition-timing-function', slider.settings.easing);
			// if not using CSS and no easing value was supplied, use the default JS animation easing (swing)
			}else if(!slider.settings.easing){
				slider.settings.easing = 'swing';
			}
			var slidesShowing = getNumberSlidesShowing();
			// make modifications to the viewport (.bx-viewport)
			slider.viewport.css({
				width: '100%',
				overflow: 'hidden',
				position: 'relative'
			});
			slider.viewport.parent().css({
				maxWidth: getViewportMaxWidth()
			});
			// make modification to the wrapper (.bx-wrapper)
			if(!slider.settings.pager) {
				slider.viewport.parent().css({
				margin: '0 auto 0px'
				});
			}
			// apply css to all slider children
			slider.children.css({
				'float': slider.settings.mode == 'horizontal' ? 'left' : 'none',
				listStyle: 'none',
				position: 'relative'
			});
			// apply the calculated width after the float is applied to prevent scrollbar interference
			slider.children.css('width', getSlideWidth());
			// if slideMargin is supplied, add the css
			if(slider.settings.mode == 'horizontal' && slider.settings.slideMargin > 0) slider.children.css('marginRight', slider.settings.slideMargin);
			if(slider.settings.mode == 'vertical' && slider.settings.slideMargin > 0) slider.children.css('marginBottom', slider.settings.slideMargin);
			// if "fade" mode, add positioning and z-index CSS
			if(slider.settings.mode == 'fade'){
				slider.children.css({
					position: 'absolute',
					zIndex: 0,
					display: 'none'
				});
				// prepare the z-index on the showing element
				slider.children.eq(slider.settings.startSlide).css({zIndex: 50, display: 'block'});
			}
			// create an element to contain all slider controls (pager, start / stop, etc)
			slider.controls.el = $('<div class="bx-controls" />');
			// if captions are requested, add them
			if(slider.settings.captions) appendCaptions();
			// check if startSlide is last slide
			slider.active.last = slider.settings.startSlide == getPagerQty() - 1;
			// if video is true, set up the fitVids plugin
			if(slider.settings.video) el.fitVids();
			// set the default preload selector (visible)
			var preloadSelector = slider.children.eq(slider.settings.startSlide);
			if (slider.settings.preloadImages == "all") preloadSelector = slider.children;
			// only check for control addition if not in "ticker" mode
			if(!slider.settings.ticker){
				// if pager is requested, add it
				if(slider.settings.pager) appendPager();
				// if controls are requested, add them
				if(slider.settings.controls) appendControls();
				// if auto is true, and auto controls are requested, add them
				if(slider.settings.auto && slider.settings.autoControls) appendControlsAuto();
				// if any control option is requested, add the controls wrapper
				if(slider.settings.controls || slider.settings.autoControls || slider.settings.pager) slider.viewport.after(slider.controls.el);
			// if ticker mode, do not allow a pager
			}else{
				slider.settings.pager = false;
			}
			// preload all images, then perform final DOM / CSS modifications that depend on images being loaded
			loadElements(preloadSelector, start);
		}

		var loadElements = function(selector, callback){
			var total = selector.find('img, iframe').length;
			if (total == 0){
				callback();
				return;
			}
			var count = 0;
			selector.find('img, iframe').each(function(){
				$(this).one('load', function() {
				  if(++count == total) callback();
				}).each(function() {
				  if(this.complete) $(this).load();
				});
			});
		}

		/**
		 * Start the slider
		 */
		var start = function(){
			// if infinite loop, prepare additional slides
			if(slider.settings.infiniteLoop && slider.settings.mode != 'fade' && !slider.settings.ticker){
				var slice = slider.settings.mode == 'vertical' ? slider.settings.minSlides : slider.settings.maxSlides;
				var sliceAppend = slider.children.slice(0, slice).clone().addClass('bx-clone');
				var slicePrepend = slider.children.slice(-slice).clone().addClass('bx-clone');
				el.append(sliceAppend).prepend(slicePrepend);
			}
			// remove the loading DOM element
			slider.loader.remove();
			// set the left / top position of "el"
			setSlidePosition();
			// if "vertical" mode, always use adaptiveHeight to prevent odd behavior
			if (slider.settings.mode == 'vertical') slider.settings.adaptiveHeight = true;
			// set the viewport height
			slider.viewport.height(getViewportHeight());
			// make sure everything is positioned just right (same as a window resize)
			el.redrawSlider();
			// onSliderLoad callback
			slider.settings.onSliderLoad(slider.active.index);
			// slider has been fully initialized
			slider.initialized = true;
			// bind the resize call to the window
			if (slider.settings.responsive) $(window).bind('resize', resizeWindow);
			// if auto is true, start the show
			if (slider.settings.auto && slider.settings.autoStart) initAuto();
			// if ticker is true, start the ticker
			if (slider.settings.ticker) initTicker();
			// if pager is requested, make the appropriate pager link active
			if (slider.settings.pager) updatePagerActive(slider.settings.startSlide);
			// check for any updates to the controls (like hideControlOnEnd updates)
			if (slider.settings.controls) updateDirectionControls();
			// if touchEnabled is true, setup the touch events
			if (slider.settings.touchEnabled && !slider.settings.ticker) initTouch();
		}

		/**
		 * Returns the calculated height of the viewport, used to determine either adaptiveHeight or the maxHeight value
		 */
		var getViewportHeight = function(){
			var height = 0;
			// first determine which children (slides) should be used in our height calculation
			var children = $();
			// if mode is not "vertical" and adaptiveHeight is false, include all children
			if(slider.settings.mode != 'vertical' && !slider.settings.adaptiveHeight){
				children = slider.children;
			}else{
				// if not carousel, return the single active child
				if(!slider.carousel){
					children = slider.children.eq(slider.active.index);
				// if carousel, return a slice of children
				}else{
					// get the individual slide index
					var currentIndex = slider.settings.moveSlides == 1 ? slider.active.index : slider.active.index * getMoveBy();
					// add the current slide to the children
					children = slider.children.eq(currentIndex);
					// cycle through the remaining "showing" slides
					for (i = 1; i <= slider.settings.maxSlides - 1; i++){
						// if looped back to the start
						if(currentIndex + i >= slider.children.length){
							children = children.add(slider.children.eq(i - 1));
						}else{
							children = children.add(slider.children.eq(currentIndex + i));
						}
					}
				}
			}
			// if "vertical" mode, calculate the sum of the heights of the children
			if(slider.settings.mode == 'vertical'){
				children.each(function(index) {
				  height += $(this).outerHeight();
				});
				// add user-supplied margins
				if(slider.settings.slideMargin > 0){
					height += slider.settings.slideMargin * (slider.settings.minSlides - 1);
				}
			// if not "vertical" mode, calculate the max height of the children
			}else{
				height = Math.max.apply(Math, children.map(function(){
					return $(this).outerHeight(false);
				}).get());
			}
			return height;
		}

		/**
		 * Returns the calculated width to be used for the outer wrapper / viewport
		 */
		var getViewportMaxWidth = function(){
			var width = '100%';
			if(slider.settings.slideWidth > 0){
				if(slider.settings.mode == 'horizontal'){
					width = (slider.settings.maxSlides * slider.settings.slideWidth) + ((slider.settings.maxSlides - 1) * slider.settings.slideMargin);
				}else{
					width = slider.settings.slideWidth;
				}
			}
			return width;
		}

		/**
		 * Returns the calculated width to be applied to each slide
		 */
		var getSlideWidth = function(){
			// start with any user-supplied slide width
			var newElWidth = slider.settings.slideWidth;
			// get the current viewport width
			var wrapWidth = slider.viewport.width();
			// if slide width was not supplied, or is larger than the viewport use the viewport width
			if(slider.settings.slideWidth == 0 ||
				(slider.settings.slideWidth > wrapWidth && !slider.carousel) ||
				slider.settings.mode == 'vertical'){
				newElWidth = wrapWidth;
			// if carousel, use the thresholds to determine the width
			}else if(slider.settings.maxSlides > 1 && slider.settings.mode == 'horizontal'){
				if(wrapWidth > slider.maxThreshold){
					// newElWidth = (wrapWidth - (slider.settings.slideMargin * (slider.settings.maxSlides - 1))) / slider.settings.maxSlides;
				}else if(wrapWidth < slider.minThreshold){
					newElWidth = (wrapWidth - (slider.settings.slideMargin * (slider.settings.minSlides - 1))) / slider.settings.minSlides;
				}
			}
			return newElWidth;
		}

		/**
		 * Returns the number of slides currently visible in the viewport (includes partially visible slides)
		 */
		var getNumberSlidesShowing = function(){
			var slidesShowing = 1;
			if(slider.settings.mode == 'horizontal' && slider.settings.slideWidth > 0){
				// if viewport is smaller than minThreshold, return minSlides
				if(slider.viewport.width() < slider.minThreshold){
					slidesShowing = slider.settings.minSlides;
				// if viewport is larger than minThreshold, return maxSlides
				}else if(slider.viewport.width() > slider.maxThreshold){
					slidesShowing = slider.settings.maxSlides;
				// if viewport is between min / max thresholds, divide viewport width by first child width
				}else{
					var childWidth = slider.children.first().width();
					slidesShowing = Math.floor(slider.viewport.width() / childWidth);
				}
			// if "vertical" mode, slides showing will always be minSlides
			}else if(slider.settings.mode == 'vertical'){
				slidesShowing = slider.settings.minSlides;
			}
			return slidesShowing;
		}

		/**
		 * Returns the number of pages (one full viewport of slides is one "page")
		 */
		var getPagerQty = function(){
			var pagerQty = 0;
			// if moveSlides is specified by the user
			if(slider.settings.moveSlides > 0){
				if(slider.settings.infiniteLoop){
					pagerQty = slider.children.length / getMoveBy();
				}else{
					// use a while loop to determine pages
					var breakPoint = 0;
					var counter = 0
					// when breakpoint goes above children length, counter is the number of pages
					while (breakPoint < slider.children.length){
						++pagerQty;
						breakPoint = counter + getNumberSlidesShowing();
						counter += slider.settings.moveSlides <= getNumberSlidesShowing() ? slider.settings.moveSlides : getNumberSlidesShowing();
					}
				}
			// if moveSlides is 0 (auto) divide children length by sides showing, then round up
			}else{
				pagerQty = Math.ceil(slider.children.length / getNumberSlidesShowing());
			}
			return pagerQty;
		}

		/**
		 * Returns the number of indivual slides by which to shift the slider
		 */
		var getMoveBy = function(){
			// if moveSlides was set by the user and moveSlides is less than number of slides showing
			if(slider.settings.moveSlides > 0 && slider.settings.moveSlides <= getNumberSlidesShowing()){
				return slider.settings.moveSlides;
			}
			// if moveSlides is 0 (auto)
			return getNumberSlidesShowing();
		}

		/**
		 * Sets the slider's (el) left or top position
		 */
		var setSlidePosition = function(){
			// if last slide, not infinite loop, and number of children is larger than specified maxSlides
			if(slider.children.length > slider.settings.maxSlides && slider.active.last && !slider.settings.infiniteLoop){
				if (slider.settings.mode == 'horizontal'){
					// get the last child's position
					var lastChild = slider.children.last();
					var position = lastChild.position();
					// set the left position
					setPositionProperty(-(position.left - (slider.viewport.width() - lastChild.width())), 'reset', 0);
				}else if(slider.settings.mode == 'vertical'){
					// get the last showing index's position
					var lastShowingIndex = slider.children.length - slider.settings.minSlides;
					var position = slider.children.eq(lastShowingIndex).position();
					// set the top position
					setPositionProperty(-position.top, 'reset', 0);
				}
			// if not last slide
			}else{
				// get the position of the first showing slide
				var position = slider.children.eq(slider.active.index * getMoveBy()).position();
				// check for last slide
				if (slider.active.index == getPagerQty() - 1) slider.active.last = true;
				// set the repective position
				if (position != undefined){
					if (slider.settings.mode == 'horizontal') setPositionProperty(-position.left, 'reset', 0);
					else if (slider.settings.mode == 'vertical') setPositionProperty(-position.top, 'reset', 0);
				}
			}
		}

		/**
		 * Sets the el's animating property position (which in turn will sometimes animate el).
		 * If using CSS, sets the transform property. If not using CSS, sets the top / left property.
		 *
		 * @param value (int)
		 *  - the animating property's value
		 *
		 * @param type (string) 'slider', 'reset', 'ticker'
		 *  - the type of instance for which the function is being
		 *
		 * @param duration (int)
		 *  - the amount of time (in ms) the transition should occupy
		 *
		 * @param params (array) optional
		 *  - an optional parameter containing any variables that need to be passed in
		 */
		var setPositionProperty = function(value, type, duration, params){
			// use CSS transform
			if(slider.usingCSS){
				// determine the translate3d value
				var propValue = slider.settings.mode == 'vertical' ? 'translate3d(0, ' + value + 'px, 0)' : 'translate3d(' + value + 'px, 0, 0)';
				// add the CSS transition-duration
				el.css('-' + slider.cssPrefix + '-transition-duration', duration / 1000 + 's');
				if(type == 'slide'){
					// set the property value
					el.css(slider.animProp, propValue);
					// bind a callback method - executes when CSS transition completes
					el.bind('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function(){
						// unbind the callback
						el.unbind('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd');
						updateAfterSlideTransition();
					});
				}else if(type == 'reset'){
					el.css(slider.animProp, propValue);
				}else if(type == 'ticker'){
					// make the transition use 'linear'
					el.css('-' + slider.cssPrefix + '-transition-timing-function', 'linear');
					el.css(slider.animProp, propValue);
					// bind a callback method - executes when CSS transition completes
					el.bind('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function(){
						// unbind the callback
						el.unbind('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd');
						// reset the position
						setPositionProperty(params['resetValue'], 'reset', 0);
						// start the loop again
						tickerLoop();
					});
				}
			// use JS animate
			}else{
				var animateObj = {};
				animateObj[slider.animProp] = value;
				if(type == 'slide'){
					el.animate(animateObj, duration, slider.settings.easing, function(){
						updateAfterSlideTransition();
					});
				}else if(type == 'reset'){
					el.css(slider.animProp, value)
				}else if(type == 'ticker'){
					el.animate(animateObj, speed, 'linear', function(){
						setPositionProperty(params['resetValue'], 'reset', 0);
						// run the recursive loop after animation
						tickerLoop();
					});
				}
			}
		}

		/**
		 * Populates the pager with proper amount of pages
		 */
		var populatePager = function(){
			var pagerHtml = '';
			var pagerQty = getPagerQty();
			// loop through each pager item
			for(var i=0; i < pagerQty; i++){
				var linkContent = '';
				// if a buildPager function is supplied, use it to get pager link value, else use index + 1
				if(slider.settings.buildPager && $.isFunction(slider.settings.buildPager)){
					linkContent = slider.settings.buildPager(i);
					slider.pagerEl.addClass('bx-custom-pager');
				}else{
					linkContent = i + 1;
					slider.pagerEl.addClass('bx-default-pager');
				}
				// var linkContent = slider.settings.buildPager && $.isFunction(slider.settings.buildPager) ? slider.settings.buildPager(i) : i + 1;
				// add the markup to the string
				pagerHtml += '<div class="bx-pager-item"><a href="" data-slide-index="' + i + '" class="bx-pager-link">' + linkContent + '</a></div>';
			};
			// populate the pager element with pager links
			slider.pagerEl.html(pagerHtml);
		}

		/**
		 * Appends the pager to the controls element
		 */
		var appendPager = function(){
			if(!slider.settings.pagerCustom){
				// create the pager DOM element
				slider.pagerEl = $('<div class="bx-pager" />');
				// if a pager selector was supplied, populate it with the pager
				if(slider.settings.pagerSelector){
					$(slider.settings.pagerSelector).html(slider.pagerEl);
				// if no pager selector was supplied, add it after the wrapper
				}else{
					slider.controls.el.addClass('bx-has-pager').append(slider.pagerEl);
				}
				// populate the pager
				populatePager();
			}else{
				slider.pagerEl = $(slider.settings.pagerCustom);
			}
			// assign the pager click binding
			slider.pagerEl.delegate('a', 'click', clickPagerBind);
		}

		/**
		 * Appends prev / next controls to the controls element
		 */
		var appendControls = function(){
			slider.controls.next = $('<a class="bx-next" href="">' + slider.settings.nextText + '</a>');
			slider.controls.prev = $('<a class="bx-prev" href="">' + slider.settings.prevText + '</a>');
			// bind click actions to the controls
			slider.controls.next.bind('click', clickNextBind);
			slider.controls.prev.bind('click', clickPrevBind);
			// if nextSlector was supplied, populate it
			if(slider.settings.nextSelector){
				$(slider.settings.nextSelector).append(slider.controls.next);
			}
			// if prevSlector was supplied, populate it
			if(slider.settings.prevSelector){
				$(slider.settings.prevSelector).append(slider.controls.prev);
			}
			// if no custom selectors were supplied
			if(!slider.settings.nextSelector && !slider.settings.prevSelector){
				// add the controls to the DOM
				slider.controls.directionEl = $('<div class="bx-controls-direction" />');
				// add the control elements to the directionEl
				slider.controls.directionEl.append(slider.controls.prev).append(slider.controls.next);
				// slider.viewport.append(slider.controls.directionEl);
				slider.controls.el.addClass('bx-has-controls-direction').append(slider.controls.directionEl);
			}
		}

		/**
		 * Appends start / stop auto controls to the controls element
		 */
		var appendControlsAuto = function(){
			slider.controls.start = $('<div class="bx-controls-auto-item"><a class="bx-start" href="">' + slider.settings.startText + '</a></div>');
			slider.controls.stop = $('<div class="bx-controls-auto-item"><a class="bx-stop" href="">' + slider.settings.stopText + '</a></div>');
			// add the controls to the DOM
			slider.controls.autoEl = $('<div class="bx-controls-auto" />');
			// bind click actions to the controls
			slider.controls.autoEl.delegate('.bx-start', 'click', clickStartBind);
			slider.controls.autoEl.delegate('.bx-stop', 'click', clickStopBind);
			// if autoControlsCombine, insert only the "start" control
			if(slider.settings.autoControlsCombine){
				slider.controls.autoEl.append(slider.controls.start);
			// if autoControlsCombine is false, insert both controls
			}else{
				slider.controls.autoEl.append(slider.controls.start).append(slider.controls.stop);
			}
			// if auto controls selector was supplied, populate it with the controls
			if(slider.settings.autoControlsSelector){
				$(slider.settings.autoControlsSelector).html(slider.controls.autoEl);
			// if auto controls selector was not supplied, add it after the wrapper
			}else{
				slider.controls.el.addClass('bx-has-controls-auto').append(slider.controls.autoEl);
			}
			// update the auto controls
			updateAutoControls(slider.settings.autoStart ? 'stop' : 'start');
		}

		/**
		 * Appends image captions to the DOM
		 */
		var appendCaptions = function(){
			// cycle through each child
			slider.children.each(function(index){
				// get the image title attribute
				var title = $(this).find('img:first').attr('title');
				// append the caption
				if (title != undefined && ('' + title).length) {
                    $(this).append('<div class="bx-caption"><span>' + title + '</span></div>');
                }
			});
		}

		/**
		 * Click next binding
		 *
		 * @param e (event)
		 *  - DOM event object
		 */
		var clickNextBind = function(e){
			// if auto show is running, stop it
			if (slider.settings.auto) el.stopAuto();
			el.goToNextSlide();
			e.preventDefault();
		}

		/**
		 * Click prev binding
		 *
		 * @param e (event)
		 *  - DOM event object
		 */
		var clickPrevBind = function(e){
			// if auto show is running, stop it
			if (slider.settings.auto) el.stopAuto();
			el.goToPrevSlide();
			e.preventDefault();
		}

		/**
		 * Click start binding
		 *
		 * @param e (event)
		 *  - DOM event object
		 */
		var clickStartBind = function(e){
			el.startAuto();
			e.preventDefault();
		}

		/**
		 * Click stop binding
		 *
		 * @param e (event)
		 *  - DOM event object
		 */
		var clickStopBind = function(e){
			el.stopAuto();
			e.preventDefault();
		}

		/**
		 * Click pager binding
		 *
		 * @param e (event)
		 *  - DOM event object
		 */
		var clickPagerBind = function(e){
			// if auto show is running, stop it
			if (slider.settings.auto) el.stopAuto();
			var pagerLink = $(e.currentTarget);
			var pagerIndex = parseInt(pagerLink.attr('data-slide-index'));
			// if clicked pager link is not active, continue with the goToSlide call
			if(pagerIndex != slider.active.index) el.goToSlide(pagerIndex);
			e.preventDefault();
		}

		/**
		 * Updates the pager links with an active class
		 *
		 * @param slideIndex (int)
		 *  - index of slide to make active
		 */
		var updatePagerActive = function(slideIndex){
			// if "short" pager type
			var len = slider.children.length; // nb of children
			if(slider.settings.pagerType == 'short'){
				if(slider.settings.maxSlides > 1) {
					len = Math.ceil(slider.children.length/slider.settings.maxSlides);
				}
				slider.pagerEl.html( (slideIndex + 1) + slider.settings.pagerShortSeparator + len);
				return;
			}
			// remove all pager active classes
			slider.pagerEl.find('a').removeClass('active');
			// apply the active class for all pagers
			slider.pagerEl.each(function(i, el) { $(el).find('a').eq(slideIndex).addClass('active'); });
		}

		/**
		 * Performs needed actions after a slide transition
		 */
		var updateAfterSlideTransition = function(){
			// if infinte loop is true
			if(slider.settings.infiniteLoop){
				var position = '';
				// first slide
				if(slider.active.index == 0){
					// set the new position
					position = slider.children.eq(0).position();
				// carousel, last slide
				}else if(slider.active.index == getPagerQty() - 1 && slider.carousel){
					position = slider.children.eq((getPagerQty() - 1) * getMoveBy()).position();
				// last slide
				}else if(slider.active.index == slider.children.length - 1){
					position = slider.children.eq(slider.children.length - 1).position();
				}
				if (slider.settings.mode == 'horizontal') { setPositionProperty(-position.left, 'reset', 0);; }
				else if (slider.settings.mode == 'vertical') { setPositionProperty(-position.top, 'reset', 0);; }
			}
			// declare that the transition is complete
			slider.working = false;
			// onSlideAfter callback
			slider.settings.onSlideAfter(slider.children.eq(slider.active.index), slider.oldIndex, slider.active.index);
		}

		/**
		 * Updates the auto controls state (either active, or combined switch)
		 *
		 * @param state (string) "start", "stop"
		 *  - the new state of the auto show
		 */
		var updateAutoControls = function(state){
			// if autoControlsCombine is true, replace the current control with the new state
			if(slider.settings.autoControlsCombine){
				slider.controls.autoEl.html(slider.controls[state]);
			// if autoControlsCombine is false, apply the "active" class to the appropriate control
			}else{
				slider.controls.autoEl.find('a').removeClass('active');
				slider.controls.autoEl.find('a:not(.bx-' + state + ')').addClass('active');
			}
		}

		/**
		 * Updates the direction controls (checks if either should be hidden)
		 */
		var updateDirectionControls = function(){
			if(getPagerQty() == 1){
				slider.controls.prev.addClass('disabled');
				slider.controls.next.addClass('disabled');
			}else if(!slider.settings.infiniteLoop && slider.settings.hideControlOnEnd){
				// if first slide
				if (slider.active.index == 0){
					slider.controls.prev.addClass('disabled');
					slider.controls.next.removeClass('disabled');
				// if last slide
				}else if(slider.active.index == getPagerQty() - 1){
					slider.controls.next.addClass('disabled');
					slider.controls.prev.removeClass('disabled');
				// if any slide in the middle
				}else{
					slider.controls.prev.removeClass('disabled');
					slider.controls.next.removeClass('disabled');
				}
			}
		}

		/**
		 * Initialzes the auto process
		 */
		var initAuto = function(){
			// if autoDelay was supplied, launch the auto show using a setTimeout() call
			if(slider.settings.autoDelay > 0){
				var timeout = setTimeout(el.startAuto, slider.settings.autoDelay);
			// if autoDelay was not supplied, start the auto show normally
			}else{
				el.startAuto();
			}
			// if autoHover is requested
			if(slider.settings.autoHover){
				// on el hover
				el.hover(function(){
					// if the auto show is currently playing (has an active interval)
					if(slider.interval){
						// stop the auto show and pass true agument which will prevent control update
						el.stopAuto(true);
						// create a new autoPaused value which will be used by the relative "mouseout" event
						slider.autoPaused = true;
					}
				}, function(){
					// if the autoPaused value was created be the prior "mouseover" event
					if(slider.autoPaused){
						// start the auto show and pass true agument which will prevent control update
						el.startAuto(true);
						// reset the autoPaused value
						slider.autoPaused = null;
					}
				});
			}
		}

		/**
		 * Initialzes the ticker process
		 */
		var initTicker = function(){
			var startPosition = 0;
			// if autoDirection is "next", append a clone of the entire slider
			if(slider.settings.autoDirection == 'next'){
				el.append(slider.children.clone().addClass('bx-clone'));
			// if autoDirection is "prev", prepend a clone of the entire slider, and set the left position
			}else{
				el.prepend(slider.children.clone().addClass('bx-clone'));
				var position = slider.children.first().position();
				startPosition = slider.settings.mode == 'horizontal' ? -position.left : -position.top;
			}
			setPositionProperty(startPosition, 'reset', 0);
			// do not allow controls in ticker mode
			slider.settings.pager = false;
			slider.settings.controls = false;
			slider.settings.autoControls = false;
			// if autoHover is requested
			if(slider.settings.tickerHover && !slider.usingCSS){
				// on el hover
				slider.viewport.hover(function(){
					el.stop();
				}, function(){
					// calculate the total width of children (used to calculate the speed ratio)
					var totalDimens = 0;
					slider.children.each(function(index){
					  totalDimens += slider.settings.mode == 'horizontal' ? $(this).outerWidth(true) : $(this).outerHeight(true);
					});
					// calculate the speed ratio (used to determine the new speed to finish the paused animation)
					var ratio = slider.settings.speed / totalDimens;
					// determine which property to use
					var property = slider.settings.mode == 'horizontal' ? 'left' : 'top';
					// calculate the new speed
					var newSpeed = ratio * (totalDimens - (Math.abs(parseInt(el.css(property)))));
					tickerLoop(newSpeed);
				});
			}
			// start the ticker loop
			tickerLoop();
		}

		/**
		 * Runs a continuous loop, news ticker-style
		 */
		var tickerLoop = function(resumeSpeed){
			speed = resumeSpeed ? resumeSpeed : slider.settings.speed;
			var position = {left: 0, top: 0};
			var reset = {left: 0, top: 0};
			// if "next" animate left position to last child, then reset left to 0
			if(slider.settings.autoDirection == 'next'){
				position = el.find('.bx-clone').first().position();
			// if "prev" animate left position to 0, then reset left to first non-clone child
			}else{
				reset = slider.children.first().position();
			}
			var animateProperty = slider.settings.mode == 'horizontal' ? -position.left : -position.top;
			var resetValue = slider.settings.mode == 'horizontal' ? -reset.left : -reset.top;
			var params = {resetValue: resetValue};
			setPositionProperty(animateProperty, 'ticker', speed, params);
		}

		/**
		 * Initializes touch events
		 */
		var initTouch = function(){
			// initialize object to contain all touch values
			slider.touch = {
				start: {x: 0, y: 0},
				end: {x: 0, y: 0}
			}
			slider.viewport.bind('touchstart', onTouchStart);
		}

		/**
		 * Event handler for "touchstart"
		 *
		 * @param e (event)
		 *  - DOM event object
		 */
		var onTouchStart = function(e){
			if(slider.working){
				e.preventDefault();
			}else{
				// record the original position when touch starts
				slider.touch.originalPos = el.position();
				var orig = e.originalEvent;
				// record the starting touch x, y coordinates
				slider.touch.start.x = orig.changedTouches[0].pageX;
				slider.touch.start.y = orig.changedTouches[0].pageY;
				// bind a "touchmove" event to the viewport
				slider.viewport.bind('touchmove', onTouchMove);
				// bind a "touchend" event to the viewport
				slider.viewport.bind('touchend', onTouchEnd);
			}
		}

		/**
		 * Event handler for "touchmove"
		 *
		 * @param e (event)
		 *  - DOM event object
		 */
		var onTouchMove = function(e){
			var orig = e.originalEvent;
			// if scrolling on y axis, do not prevent default
			var xMovement = Math.abs(orig.changedTouches[0].pageX - slider.touch.start.x);
			var yMovement = Math.abs(orig.changedTouches[0].pageY - slider.touch.start.y);
			// x axis swipe
			if((xMovement * 3) > yMovement && slider.settings.preventDefaultSwipeX){
				e.preventDefault();
			// y axis swipe
			}else if((yMovement * 3) > xMovement && slider.settings.preventDefaultSwipeY){
				e.preventDefault();
			}
			if(slider.settings.mode != 'fade' && slider.settings.oneToOneTouch){
				var value = 0;
				// if horizontal, drag along x axis
				if(slider.settings.mode == 'horizontal'){
					var change = orig.changedTouches[0].pageX - slider.touch.start.x;
					value = slider.touch.originalPos.left + change;
				// if vertical, drag along y axis
				}else{
					var change = orig.changedTouches[0].pageY - slider.touch.start.y;
					value = slider.touch.originalPos.top + change;
				}
				setPositionProperty(value, 'reset', 0);
			}
		}

		/**
		 * Event handler for "touchend"
		 *
		 * @param e (event)
		 *  - DOM event object
		 */
		var onTouchEnd = function(e){
			slider.viewport.unbind('touchmove', onTouchMove);
			var orig = e.originalEvent;
			var value = 0;
			// record end x, y positions
			slider.touch.end.x = orig.changedTouches[0].pageX;
			slider.touch.end.y = orig.changedTouches[0].pageY;
			// if fade mode, check if absolute x distance clears the threshold
			if(slider.settings.mode == 'fade'){
				var distance = Math.abs(slider.touch.start.x - slider.touch.end.x);
				if(distance >= slider.settings.swipeThreshold){
					slider.touch.start.x > slider.touch.end.x ? el.goToNextSlide() : el.goToPrevSlide();
					el.stopAuto();
				}
			// not fade mode
			}else{
				var distance = 0;
				// calculate distance and el's animate property
				if(slider.settings.mode == 'horizontal'){
					distance = slider.touch.end.x - slider.touch.start.x;
					value = slider.touch.originalPos.left;
				}else{
					distance = slider.touch.end.y - slider.touch.start.y;
					value = slider.touch.originalPos.top;
				}
				// if not infinite loop and first / last slide, do not attempt a slide transition
				if(!slider.settings.infiniteLoop && ((slider.active.index == 0 && distance > 0) || (slider.active.last && distance < 0))){
					setPositionProperty(value, 'reset', 200);
				}else{
					// check if distance clears threshold
					if(Math.abs(distance) >= slider.settings.swipeThreshold){
						distance < 0 ? el.goToNextSlide() : el.goToPrevSlide();
						el.stopAuto();
					}else{
						// el.animate(property, 200);
						setPositionProperty(value, 'reset', 200);
					}
				}
			}
			slider.viewport.unbind('touchend', onTouchEnd);
		}

		/**
		 * Window resize event callback
		 */
		var resizeWindow = function(e){
			// get the new window dimens (again, thank you IE)
			var windowWidthNew = $(window).width();
			var windowHeightNew = $(window).height();
			// make sure that it is a true window resize
			// *we must check this because our dinosaur friend IE fires a window resize event when certain DOM elements
			// are resized. Can you just die already?*
			if(windowWidth != windowWidthNew || windowHeight != windowHeightNew){
				// set the new window dimens
				windowWidth = windowWidthNew;
				windowHeight = windowHeightNew;
				// update all dynamic elements
				el.redrawSlider();
			}
		}

		/**
		 * ===================================================================================
		 * = PUBLIC FUNCTIONS
		 * ===================================================================================
		 */

		/**
		 * Performs slide transition to the specified slide
		 *
		 * @param slideIndex (int)
		 *  - the destination slide's index (zero-based)
		 *
		 * @param direction (string)
		 *  - INTERNAL USE ONLY - the direction of travel ("prev" / "next")
		 */
		el.goToSlide = function(slideIndex, direction){
			// if plugin is currently in motion, ignore request
			if(slider.working || slider.active.index == slideIndex) return;
			// declare that plugin is in motion
			slider.working = true;
			// store the old index
			slider.oldIndex = slider.active.index;
			// if slideIndex is less than zero, set active index to last child (this happens during infinite loop)
			if(slideIndex < 0){
				slider.active.index = getPagerQty() - 1;
			// if slideIndex is greater than children length, set active index to 0 (this happens during infinite loop)
			}else if(slideIndex >= getPagerQty()){
				slider.active.index = 0;
			// set active index to requested slide
			}else{
				slider.active.index = slideIndex;
			}
			// onSlideBefore, onSlideNext, onSlidePrev callbacks
			slider.settings.onSlideBefore(slider.children.eq(slider.active.index), slider.oldIndex, slider.active.index);
			if(direction == 'next'){
				slider.settings.onSlideNext(slider.children.eq(slider.active.index), slider.oldIndex, slider.active.index);
			}else if(direction == 'prev'){
				slider.settings.onSlidePrev(slider.children.eq(slider.active.index), slider.oldIndex, slider.active.index);
			}
			// check if last slide
			slider.active.last = slider.active.index >= getPagerQty() - 1;
			// update the pager with active class
			if(slider.settings.pager) updatePagerActive(slider.active.index);
			// // check for direction control update
			if(slider.settings.controls) updateDirectionControls();
			// if slider is set to mode: "fade"
			if(slider.settings.mode == 'fade'){
				// if adaptiveHeight is true and next height is different from current height, animate to the new height
				if(slider.settings.adaptiveHeight && slider.viewport.height() != getViewportHeight()){
					slider.viewport.animate({height: getViewportHeight()}, slider.settings.adaptiveHeightSpeed);
				}
				// fade out the visible child and reset its z-index value
				slider.children.filter(':visible').fadeOut(slider.settings.speed).css({zIndex: 0});
				// fade in the newly requested slide
				slider.children.eq(slider.active.index).css('zIndex', 51).fadeIn(slider.settings.speed, function(){
					$(this).css('zIndex', 50);
					updateAfterSlideTransition();
				});
			// slider mode is not "fade"
			}else{
				// if adaptiveHeight is true and next height is different from current height, animate to the new height
				if(slider.settings.adaptiveHeight && slider.viewport.height() != getViewportHeight()){
					slider.viewport.animate({height: getViewportHeight()}, slider.settings.adaptiveHeightSpeed);
				}
				var moveBy = 0;
				var position = {left: 0, top: 0};
				// if carousel and not infinite loop
				if(!slider.settings.infiniteLoop && slider.carousel && slider.active.last){
					if(slider.settings.mode == 'horizontal'){
						// get the last child position
						var lastChild = slider.children.eq(slider.children.length - 1);
						position = lastChild.position();
						// calculate the position of the last slide
						moveBy = slider.viewport.width() - lastChild.outerWidth();
					}else{
						// get last showing index position
						var lastShowingIndex = slider.children.length - slider.settings.minSlides;
						position = slider.children.eq(lastShowingIndex).position();
					}
					// horizontal carousel, going previous while on first slide (infiniteLoop mode)
				}else if(slider.carousel && slider.active.last && direction == 'prev'){
					// get the last child position
					var eq = slider.settings.moveSlides == 1 ? slider.settings.maxSlides - getMoveBy() : ((getPagerQty() - 1) * getMoveBy()) - (slider.children.length - slider.settings.maxSlides);
					var lastChild = el.children('.bx-clone').eq(eq);
					position = lastChild.position();
				// if infinite loop and "Next" is clicked on the last slide
				}else if(direction == 'next' && slider.active.index == 0){
					// get the last clone position
					position = el.find('> .bx-clone').eq(slider.settings.maxSlides).position();
					slider.active.last = false;
				// normal non-zero requests
				}else if(slideIndex >= 0){
					var requestEl = slideIndex * getMoveBy();
					position = slider.children.eq(requestEl).position();
				}

				/* If the position doesn't exist
				 * (e.g. if you destroy the slider on a next click),
				 * it doesn't throw an error.
				 */
				if ("undefined" !== typeof(position)) {
					var value = slider.settings.mode == 'horizontal' ? -(position.left - moveBy) : -position.top;
					// plugin values to be animated
					setPositionProperty(value, 'slide', slider.settings.speed);
				}
			}
		}

		/**
		 * Transitions to the next slide in the show
		 */
		el.goToNextSlide = function(){
			// if infiniteLoop is false and last page is showing, disregard call
			if (!slider.settings.infiniteLoop && slider.active.last) return;
			var pagerIndex = parseInt(slider.active.index) + 1;
			el.goToSlide(pagerIndex, 'next');
		}

		/**
		 * Transitions to the prev slide in the show
		 */
		el.goToPrevSlide = function(){
			// if infiniteLoop is false and last page is showing, disregard call
			if (!slider.settings.infiniteLoop && slider.active.index == 0) return;
			var pagerIndex = parseInt(slider.active.index) - 1;
			el.goToSlide(pagerIndex, 'prev');
		}

		/**
		 * Starts the auto show
		 *
		 * @param preventControlUpdate (boolean)
		 *  - if true, auto controls state will not be updated
		 */
		el.startAuto = function(preventControlUpdate){
			// if an interval already exists, disregard call
			if(slider.interval) return;
			// create an interval
			slider.interval = setInterval(function(){
				slider.settings.autoDirection == 'next' ? el.goToNextSlide() : el.goToPrevSlide();
			}, slider.settings.pause);
			// if auto controls are displayed and preventControlUpdate is not true
			if (slider.settings.autoControls && preventControlUpdate != true) updateAutoControls('stop');
		}

		/**
		 * Stops the auto show
		 *
		 * @param preventControlUpdate (boolean)
		 *  - if true, auto controls state will not be updated
		 */
		el.stopAuto = function(preventControlUpdate){
			// if no interval exists, disregard call
			if(!slider.interval) return;
			// clear the interval
			clearInterval(slider.interval);
			slider.interval = null;
			// if auto controls are displayed and preventControlUpdate is not true
			if (slider.settings.autoControls && preventControlUpdate != true) updateAutoControls('start');
		}

		/**
		 * Returns current slide index (zero-based)
		 */
		el.getCurrentSlide = function(){
			return slider.active.index;
		}

		/**
		 * Returns number of slides in show
		 */
		el.getSlideCount = function(){
			return slider.children.length;
		}

		/**
		 * Update all dynamic slider elements
		 */
		el.redrawSlider = function(){
			// resize all children in ratio to new screen size
			slider.children.add(el.find('.bx-clone')).outerWidth(getSlideWidth());
			// adjust the height
			slider.viewport.css('height', getViewportHeight());
			// update the slide position
			if(!slider.settings.ticker) setSlidePosition();
			// if active.last was true before the screen resize, we want
			// to keep it last no matter what screen size we end on
			if (slider.active.last) slider.active.index = getPagerQty() - 1;
			// if the active index (page) no longer exists due to the resize, simply set the index as last
			if (slider.active.index >= getPagerQty()) slider.active.last = true;
			// if a pager is being displayed and a custom pager is not being used, update it
			if(slider.settings.pager && !slider.settings.pagerCustom){
				populatePager();
				updatePagerActive(slider.active.index);
			}
		}

		/**
		 * Destroy the current instance of the slider (revert everything back to original state)
		 */
		el.destroySlider = function(){
			// don't do anything if slider has already been destroyed
			if(!slider.initialized) return;
			slider.initialized = false;
			$('.bx-clone', this).remove();
			slider.children.each(function() {
				$(this).data("origStyle") != undefined ? $(this).attr("style", $(this).data("origStyle")) : $(this).removeAttr('style');
			});
			$(this).data("origStyle") != undefined ? this.attr("style", $(this).data("origStyle")) : $(this).removeAttr('style');
			$(this).unwrap().unwrap();
			if(slider.controls.el) slider.controls.el.remove();
			if(slider.controls.next) slider.controls.next.remove();
			if(slider.controls.prev) slider.controls.prev.remove();
			if(slider.pagerEl) slider.pagerEl.remove();
			$('.bx-caption', this).remove();
			if(slider.controls.autoEl) slider.controls.autoEl.remove();
			clearInterval(slider.interval);
			if(slider.settings.responsive) $(window).unbind('resize', resizeWindow);
		}

		/**
		 * Reload the slider (revert all DOM changes, and re-initialize)
		 */
		el.reloadSlider = function(settings){
			if (settings != undefined) options = settings;
			el.destroySlider();
			init();
		}

		init();

		// returns the current jQuery object
		return this;
	}

})(jQuery);
