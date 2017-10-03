webpackJsonp([0],[
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

const ScrollReveal = __webpack_require__(1);
const SmoothScroll = __webpack_require__(2);
const styles = __webpack_require__(4);

window.sr = ScrollReveal({ duration: 600, easing: 'ease-out', viewFactor: .3 });
sr.reveal('.animate');
new SmoothScroll('a[href*="#"]');

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_RESULT__;/////    /////    /////    /////
/////    /////    /////    /////
/////    /////    /////    /////
/////    /////    /////    /////
/////             /////    /////
/////             /////    /////
/////    /////    /////    /////
/////    /////    /////    /////
         /////    /////
         /////    /////
/////    /////    /////    /////
/////    /////    /////    /////
/////    /////    /////    /////
/////    /////    /////    /////

/**
 * ScrollReveal
 * ------------
 * Version : 3.3.6
 * Website : scrollrevealjs.org
 * Repo    : github.com/jlmakes/scrollreveal.js
 * Author  : Julian Lloyd (@jlmakes)
 */

;(function () {
  'use strict'

  var sr
  var _requestAnimationFrame

  function ScrollReveal (config) {
    // Support instantiation without the `new` keyword.
    if (typeof this === 'undefined' || Object.getPrototypeOf(this) !== ScrollReveal.prototype) {
      return new ScrollReveal(config)
    }

    sr = this // Save reference to instance.
    sr.version = '3.3.6'
    sr.tools = new Tools() // *required utilities

    if (sr.isSupported()) {
      sr.tools.extend(sr.defaults, config || {})

      sr.defaults.container = _resolveContainer(sr.defaults)

      sr.store = {
        elements: {},
        containers: []
      }

      sr.sequences = {}
      sr.history = []
      sr.uid = 0
      sr.initialized = false
    } else if (typeof console !== 'undefined' && console !== null) {
      // Note: IE9 only supports console if devtools are open.
      console.log('ScrollReveal is not supported in this browser.')
    }

    return sr
  }

  /**
   * Configuration
   * -------------
   * This object signature can be passed directly to the ScrollReveal constructor,
   * or as the second argument of the `reveal()` method.
   */

  ScrollReveal.prototype.defaults = {
    // 'bottom', 'left', 'top', 'right'
    origin: 'bottom',

    // Can be any valid CSS distance, e.g. '5rem', '10%', '20vw', etc.
    distance: '20px',

    // Time in milliseconds.
    duration: 500,
    delay: 0,

    // Starting angles in degrees, will transition from these values to 0 in all axes.
    rotate: { x: 0, y: 0, z: 0 },

    // Starting opacity value, before transitioning to the computed opacity.
    opacity: 0,

    // Starting scale value, will transition from this value to 1
    scale: 0.9,

    // Accepts any valid CSS easing, e.g. 'ease', 'ease-in-out', 'linear', etc.
    easing: 'cubic-bezier(0.6, 0.2, 0.1, 1)',

    // `<html>` is the default reveal container. You can pass either:
    // DOM Node, e.g. document.querySelector('.fooContainer')
    // Selector, e.g. '.fooContainer'
    container: window.document.documentElement,

    // true/false to control reveal animations on mobile.
    mobile: true,

    // true:  reveals occur every time elements become visible
    // false: reveals occur once as elements become visible
    reset: false,

    // 'always' — delay for all reveal animations
    // 'once'   — delay only the first time reveals occur
    // 'onload' - delay only for animations triggered by first load
    useDelay: 'always',

    // Change when an element is considered in the viewport. The default value
    // of 0.20 means 20% of an element must be visible for its reveal to occur.
    viewFactor: 0.2,

    // Pixel values that alter the container boundaries.
    // e.g. Set `{ top: 48 }`, if you have a 48px tall fixed toolbar.
    // --
    // Visual Aid: https://scrollrevealjs.org/assets/viewoffset.png
    viewOffset: { top: 0, right: 0, bottom: 0, left: 0 },

    // Callbacks that fire for each triggered element reveal, and reset.
    beforeReveal: function (domEl) {},
    beforeReset: function (domEl) {},

    // Callbacks that fire for each completed element reveal, and reset.
    afterReveal: function (domEl) {},
    afterReset: function (domEl) {}
  }

  /**
   * Check if client supports CSS Transform and CSS Transition.
   * @return {boolean}
   */
  ScrollReveal.prototype.isSupported = function () {
    var style = document.documentElement.style
    return 'WebkitTransition' in style && 'WebkitTransform' in style ||
      'transition' in style && 'transform' in style
  }

  /**
   * Creates a reveal set, a group of elements that will animate when they
   * become visible. If [interval] is provided, a new sequence is created
   * that will ensure elements reveal in the order they appear in the DOM.
   *
   * @param {Node|NodeList|string} [target]   The node, node list or selector to use for animation.
   * @param {Object}               [config]   Override the defaults for this reveal set.
   * @param {number}               [interval] Time between sequenced element animations (milliseconds).
   * @param {boolean}              [sync]     Used internally when updating reveals for async content.
   *
   * @return {Object} The current ScrollReveal instance.
   */
  ScrollReveal.prototype.reveal = function (target, config, interval, sync) {
    var container
    var elements
    var elem
    var elemId
    var sequence
    var sequenceId

    // No custom configuration was passed, but a sequence interval instead.
    // let’s shuffle things around to make sure everything works.
    if (config !== undefined && typeof config === 'number') {
      interval = config
      config = {}
    } else if (config === undefined || config === null) {
      config = {}
    }

    container = _resolveContainer(config)
    elements = _getRevealElements(target, container)

    if (!elements.length) {
      console.log('ScrollReveal: reveal on "' + target + '" failed, no elements found.')
      return sr
    }

    // Prepare a new sequence if an interval is passed.
    if (interval && typeof interval === 'number') {
      sequenceId = _nextUid()

      sequence = sr.sequences[sequenceId] = {
        id: sequenceId,
        interval: interval,
        elemIds: [],
        active: false
      }
    }

    // Begin main loop to configure ScrollReveal elements.
    for (var i = 0; i < elements.length; i++) {
      // Check if the element has already been configured and grab it from the store.
      elemId = elements[i].getAttribute('data-sr-id')
      if (elemId) {
        elem = sr.store.elements[elemId]
      } else {
        // Otherwise, let’s do some basic setup.
        elem = {
          id: _nextUid(),
          domEl: elements[i],
          seen: false,
          revealing: false
        }
        elem.domEl.setAttribute('data-sr-id', elem.id)
      }

      // Sequence only setup
      if (sequence) {
        elem.sequence = {
          id: sequence.id,
          index: sequence.elemIds.length
        }

        sequence.elemIds.push(elem.id)
      }

      // New or existing element, it’s time to update its configuration, styles,
      // and send the updates to our store.
      _configure(elem, config, container)
      _style(elem)
      _updateStore(elem)

      // We need to make sure elements are set to visibility: visible, even when
      // on mobile and `config.mobile === false`, or if unsupported.
      if (sr.tools.isMobile() && !elem.config.mobile || !sr.isSupported()) {
        elem.domEl.setAttribute('style', elem.styles.inline)
        elem.disabled = true
      } else if (!elem.revealing) {
        // Otherwise, proceed normally.
        elem.domEl.setAttribute('style',
          elem.styles.inline +
          elem.styles.transform.initial
        )
      }
    }

    // Each `reveal()` is recorded so that when calling `sync()` while working
    // with asynchronously loaded content, it can re-trace your steps but with
    // all your new elements now in the DOM.

    // Since `reveal()` is called internally by `sync()`, we don’t want to
    // record or intiialize each reveal during syncing.
    if (!sync && sr.isSupported()) {
      _record(target, config, interval)

      // We push initialization to the event queue using setTimeout, so that we can
      // give ScrollReveal room to process all reveal calls before putting things into motion.
      // --
      // Philip Roberts - What the heck is the event loop anyway? (JSConf EU 2014)
      // https://www.youtube.com/watch?v=8aGhZQkoFbQ
      if (sr.initTimeout) {
        window.clearTimeout(sr.initTimeout)
      }
      sr.initTimeout = window.setTimeout(_init, 0)
    }

    return sr
  }

  /**
   * Re-runs `reveal()` for each record stored in history, effectively capturing
   * any content loaded asynchronously that matches existing reveal set targets.
   * @return {Object} The current ScrollReveal instance.
   */
  ScrollReveal.prototype.sync = function () {
    if (sr.history.length && sr.isSupported()) {
      for (var i = 0; i < sr.history.length; i++) {
        var record = sr.history[i]
        sr.reveal(record.target, record.config, record.interval, true)
      }
      _init()
    } else {
      console.log('ScrollReveal: sync failed, no reveals found.')
    }
    return sr
  }

  /**
   * Private Methods
   * ---------------
   */

  function _resolveContainer (config) {
    if (config && config.container) {
      if (typeof config.container === 'string') {
        return window.document.documentElement.querySelector(config.container)
      } else if (sr.tools.isNode(config.container)) {
        return config.container
      } else {
        console.log('ScrollReveal: invalid container "' + config.container + '" provided.')
        console.log('ScrollReveal: falling back to default container.')
      }
    }
    return sr.defaults.container
  }

  /**
   * check to see if a node or node list was passed in as the target,
   * otherwise query the container using target as a selector.
   *
   * @param {Node|NodeList|string} [target]    client input for reveal target.
   * @param {Node}                 [container] parent element for selector queries.
   *
   * @return {array} elements to be revealed.
   */
  function _getRevealElements (target, container) {
    if (typeof target === 'string') {
      return Array.prototype.slice.call(container.querySelectorAll(target))
    } else if (sr.tools.isNode(target)) {
      return [target]
    } else if (sr.tools.isNodeList(target)) {
      return Array.prototype.slice.call(target)
    }
    return []
  }

  /**
   * A consistent way of creating unique IDs.
   * @returns {number}
   */
  function _nextUid () {
    return ++sr.uid
  }

  function _configure (elem, config, container) {
    // If a container was passed as a part of the config object,
    // let’s overwrite it with the resolved container passed in.
    if (config.container) config.container = container
    // If the element hasn’t already been configured, let’s use a clone of the
    // defaults extended by the configuration passed as the second argument.
    if (!elem.config) {
      elem.config = sr.tools.extendClone(sr.defaults, config)
    } else {
      // Otherwise, let’s use a clone of the existing element configuration extended
      // by the configuration passed as the second argument.
      elem.config = sr.tools.extendClone(elem.config, config)
    }

    // Infer CSS Transform axis from origin string.
    if (elem.config.origin === 'top' || elem.config.origin === 'bottom') {
      elem.config.axis = 'Y'
    } else {
      elem.config.axis = 'X'
    }
  }

  function _style (elem) {
    var computed = window.getComputedStyle(elem.domEl)

    if (!elem.styles) {
      elem.styles = {
        transition: {},
        transform: {},
        computed: {}
      }

      // Capture any existing inline styles, and add our visibility override.
      // --
      // See section 4.2. in the Documentation:
      // https://github.com/jlmakes/scrollreveal.js#42-improve-user-experience
      elem.styles.inline = elem.domEl.getAttribute('style') || ''
      elem.styles.inline += '; visibility: visible; '

      // grab the elements existing opacity.
      elem.styles.computed.opacity = computed.opacity

      // grab the elements existing transitions.
      if (!computed.transition || computed.transition === 'all 0s ease 0s') {
        elem.styles.computed.transition = ''
      } else {
        elem.styles.computed.transition = computed.transition + ', '
      }
    }

    // Create transition styles
    elem.styles.transition.instant = _generateTransition(elem, 0)
    elem.styles.transition.delayed = _generateTransition(elem, elem.config.delay)

    // Generate transform styles, first with the webkit prefix.
    elem.styles.transform.initial = ' -webkit-transform:'
    elem.styles.transform.target = ' -webkit-transform:'
    _generateTransform(elem)

    // And again without any prefix.
    elem.styles.transform.initial += 'transform:'
    elem.styles.transform.target += 'transform:'
    _generateTransform(elem)
  }

  function _generateTransition (elem, delay) {
    var config = elem.config

    return '-webkit-transition: ' + elem.styles.computed.transition +
      '-webkit-transform ' + config.duration / 1000 + 's ' +
      config.easing + ' ' +
      delay / 1000 + 's, opacity ' +
      config.duration / 1000 + 's ' +
      config.easing + ' ' +
      delay / 1000 + 's; ' +

      'transition: ' + elem.styles.computed.transition +
      'transform ' + config.duration / 1000 + 's ' +
      config.easing + ' ' +
      delay / 1000 + 's, opacity ' +
      config.duration / 1000 + 's ' +
      config.easing + ' ' +
      delay / 1000 + 's; '
  }

  function _generateTransform (elem) {
    var config = elem.config
    var cssDistance
    var transform = elem.styles.transform

    // Let’s make sure our our pixel distances are negative for top and left.
    // e.g. origin = 'top' and distance = '25px' starts at `top: -25px` in CSS.
    if (config.origin === 'top' || config.origin === 'left') {
      cssDistance = /^-/.test(config.distance)
        ? config.distance.substr(1)
        : '-' + config.distance
    } else {
      cssDistance = config.distance
    }

    if (parseInt(config.distance)) {
      transform.initial += ' translate' + config.axis + '(' + cssDistance + ')'
      transform.target += ' translate' + config.axis + '(0)'
    }
    if (config.scale) {
      transform.initial += ' scale(' + config.scale + ')'
      transform.target += ' scale(1)'
    }
    if (config.rotate.x) {
      transform.initial += ' rotateX(' + config.rotate.x + 'deg)'
      transform.target += ' rotateX(0)'
    }
    if (config.rotate.y) {
      transform.initial += ' rotateY(' + config.rotate.y + 'deg)'
      transform.target += ' rotateY(0)'
    }
    if (config.rotate.z) {
      transform.initial += ' rotateZ(' + config.rotate.z + 'deg)'
      transform.target += ' rotateZ(0)'
    }
    transform.initial += '; opacity: ' + config.opacity + ';'
    transform.target += '; opacity: ' + elem.styles.computed.opacity + ';'
  }

  function _updateStore (elem) {
    var container = elem.config.container

    // If this element’s container isn’t already in the store, let’s add it.
    if (container && sr.store.containers.indexOf(container) === -1) {
      sr.store.containers.push(elem.config.container)
    }

    // Update the element stored with our new element.
    sr.store.elements[elem.id] = elem
  }

  function _record (target, config, interval) {
    // Save the `reveal()` arguments that triggered this `_record()` call, so we
    // can re-trace our steps when calling the `sync()` method.
    var record = {
      target: target,
      config: config,
      interval: interval
    }
    sr.history.push(record)
  }

  function _init () {
    if (sr.isSupported()) {
      // Initial animate call triggers valid reveal animations on first load.
      // Subsequent animate calls are made inside the event handler.
      _animate()

      // Then we loop through all container nodes in the store and bind event
      // listeners to each.
      for (var i = 0; i < sr.store.containers.length; i++) {
        sr.store.containers[i].addEventListener('scroll', _handler)
        sr.store.containers[i].addEventListener('resize', _handler)
      }

      // Let’s also do a one-time binding of window event listeners.
      if (!sr.initialized) {
        window.addEventListener('scroll', _handler)
        window.addEventListener('resize', _handler)
        sr.initialized = true
      }
    }
    return sr
  }

  function _handler () {
    _requestAnimationFrame(_animate)
  }

  function _setActiveSequences () {
    var active
    var elem
    var elemId
    var sequence

    // Loop through all sequences
    sr.tools.forOwn(sr.sequences, function (sequenceId) {
      sequence = sr.sequences[sequenceId]
      active = false

      // For each sequenced elemenet, let’s check visibility and if
      // any are visible, set it’s sequence to active.
      for (var i = 0; i < sequence.elemIds.length; i++) {
        elemId = sequence.elemIds[i]
        elem = sr.store.elements[elemId]
        if (_isElemVisible(elem) && !active) {
          active = true
        }
      }

      sequence.active = active
    })
  }

  function _animate () {
    var delayed
    var elem

    _setActiveSequences()

    // Loop through all elements in the store
    sr.tools.forOwn(sr.store.elements, function (elemId) {
      elem = sr.store.elements[elemId]
      delayed = _shouldUseDelay(elem)

      // Let’s see if we should revealand if so,
      // trigger the `beforeReveal` callback and
      // determine whether or not to use delay.
      if (_shouldReveal(elem)) {
        elem.config.beforeReveal(elem.domEl)
        if (delayed) {
          elem.domEl.setAttribute('style',
            elem.styles.inline +
            elem.styles.transform.target +
            elem.styles.transition.delayed
          )
        } else {
          elem.domEl.setAttribute('style',
            elem.styles.inline +
            elem.styles.transform.target +
            elem.styles.transition.instant
          )
        }

        // Let’s queue the `afterReveal` callback
        // and mark the element as seen and revealing.
        _queueCallback('reveal', elem, delayed)
        elem.revealing = true
        elem.seen = true

        if (elem.sequence) {
          _queueNextInSequence(elem, delayed)
        }
      } else if (_shouldReset(elem)) {
        //Otherwise reset our element and
        // trigger the `beforeReset` callback.
        elem.config.beforeReset(elem.domEl)
        elem.domEl.setAttribute('style',
          elem.styles.inline +
          elem.styles.transform.initial +
          elem.styles.transition.instant
        )
        // And queue the `afterReset` callback.
        _queueCallback('reset', elem)
        elem.revealing = false
      }
    })
  }

  function _queueNextInSequence (elem, delayed) {
    var elapsed = 0
    var delay = 0
    var sequence = sr.sequences[elem.sequence.id]

    // We’re processing a sequenced element, so let's block other elements in this sequence.
    sequence.blocked = true

    // Since we’re triggering animations a part of a sequence after animations on first load,
    // we need to check for that condition and explicitly add the delay to our timer.
    if (delayed && elem.config.useDelay === 'onload') {
      delay = elem.config.delay
    }

    // If a sequence timer is already running, capture the elapsed time and clear it.
    if (elem.sequence.timer) {
      elapsed = Math.abs(elem.sequence.timer.started - new Date())
      window.clearTimeout(elem.sequence.timer)
    }

    // Start a new timer.
    elem.sequence.timer = { started: new Date() }
    elem.sequence.timer.clock = window.setTimeout(function () {
      // Sequence interval has passed, so unblock the sequence and re-run the handler.
      sequence.blocked = false
      elem.sequence.timer = null
      _handler()
    }, Math.abs(sequence.interval) + delay - elapsed)
  }

  function _queueCallback (type, elem, delayed) {
    var elapsed = 0
    var duration = 0
    var callback = 'after'

    // Check which callback we’re working with.
    switch (type) {
      case 'reveal':
        duration = elem.config.duration
        if (delayed) {
          duration += elem.config.delay
        }
        callback += 'Reveal'
        break

      case 'reset':
        duration = elem.config.duration
        callback += 'Reset'
        break
    }

    // If a timer is already running, capture the elapsed time and clear it.
    if (elem.timer) {
      elapsed = Math.abs(elem.timer.started - new Date())
      window.clearTimeout(elem.timer.clock)
    }

    // Start a new timer.
    elem.timer = { started: new Date() }
    elem.timer.clock = window.setTimeout(function () {
      // The timer completed, so let’s fire the callback and null the timer.
      elem.config[callback](elem.domEl)
      elem.timer = null
    }, duration - elapsed)
  }

  function _shouldReveal (elem) {
    if (elem.sequence) {
      var sequence = sr.sequences[elem.sequence.id]
      return sequence.active &&
        !sequence.blocked &&
        !elem.revealing &&
        !elem.disabled
    }
    return _isElemVisible(elem) &&
      !elem.revealing &&
      !elem.disabled
  }

  function _shouldUseDelay (elem) {
    var config = elem.config.useDelay
    return config === 'always' ||
      (config === 'onload' && !sr.initialized) ||
      (config === 'once' && !elem.seen)
  }

  function _shouldReset (elem) {
    if (elem.sequence) {
      var sequence = sr.sequences[elem.sequence.id]
      return !sequence.active &&
        elem.config.reset &&
        elem.revealing &&
        !elem.disabled
    }
    return !_isElemVisible(elem) &&
      elem.config.reset &&
      elem.revealing &&
      !elem.disabled
  }

  function _getContainer (container) {
    return {
      width: container.clientWidth,
      height: container.clientHeight
    }
  }

  function _getScrolled (container) {
    // Return the container scroll values, plus the its offset.
    if (container && container !== window.document.documentElement) {
      var offset = _getOffset(container)
      return {
        x: container.scrollLeft + offset.left,
        y: container.scrollTop + offset.top
      }
    } else {
      // Otherwise, default to the window object’s scroll values.
      return {
        x: window.pageXOffset,
        y: window.pageYOffset
      }
    }
  }

  function _getOffset (domEl) {
    var offsetTop = 0
    var offsetLeft = 0

      // Grab the element’s dimensions.
    var offsetHeight = domEl.offsetHeight
    var offsetWidth = domEl.offsetWidth

    // Now calculate the distance between the element and its parent, then
    // again for the parent to its parent, and again etc... until we have the
    // total distance of the element to the document’s top and left origin.
    do {
      if (!isNaN(domEl.offsetTop)) {
        offsetTop += domEl.offsetTop
      }
      if (!isNaN(domEl.offsetLeft)) {
        offsetLeft += domEl.offsetLeft
      }
      domEl = domEl.offsetParent
    } while (domEl)

    return {
      top: offsetTop,
      left: offsetLeft,
      height: offsetHeight,
      width: offsetWidth
    }
  }

  function _isElemVisible (elem) {
    var offset = _getOffset(elem.domEl)
    var container = _getContainer(elem.config.container)
    var scrolled = _getScrolled(elem.config.container)
    var vF = elem.config.viewFactor

      // Define the element geometry.
    var elemHeight = offset.height
    var elemWidth = offset.width
    var elemTop = offset.top
    var elemLeft = offset.left
    var elemBottom = elemTop + elemHeight
    var elemRight = elemLeft + elemWidth

    return confirmBounds() || isPositionFixed()

    function confirmBounds () {
      // Define the element’s functional boundaries using its view factor.
      var top = elemTop + elemHeight * vF
      var left = elemLeft + elemWidth * vF
      var bottom = elemBottom - elemHeight * vF
      var right = elemRight - elemWidth * vF

      // Define the container functional boundaries using its view offset.
      var viewTop = scrolled.y + elem.config.viewOffset.top
      var viewLeft = scrolled.x + elem.config.viewOffset.left
      var viewBottom = scrolled.y - elem.config.viewOffset.bottom + container.height
      var viewRight = scrolled.x - elem.config.viewOffset.right + container.width

      return top < viewBottom &&
        bottom > viewTop &&
        left < viewRight &&
        right > viewLeft
    }

    function isPositionFixed () {
      return (window.getComputedStyle(elem.domEl).position === 'fixed')
    }
  }

  /**
   * Utilities
   * ---------
   */

  function Tools () {}

  Tools.prototype.isObject = function (object) {
    return object !== null && typeof object === 'object' && object.constructor === Object
  }

  Tools.prototype.isNode = function (object) {
    return typeof window.Node === 'object'
      ? object instanceof window.Node
      : object && typeof object === 'object' &&
        typeof object.nodeType === 'number' &&
        typeof object.nodeName === 'string'
  }

  Tools.prototype.isNodeList = function (object) {
    var prototypeToString = Object.prototype.toString.call(object)
    var regex = /^\[object (HTMLCollection|NodeList|Object)\]$/

    return typeof window.NodeList === 'object'
      ? object instanceof window.NodeList
      : object && typeof object === 'object' &&
        regex.test(prototypeToString) &&
        typeof object.length === 'number' &&
        (object.length === 0 || this.isNode(object[0]))
  }

  Tools.prototype.forOwn = function (object, callback) {
    if (!this.isObject(object)) {
      throw new TypeError('Expected "object", but received "' + typeof object + '".')
    } else {
      for (var property in object) {
        if (object.hasOwnProperty(property)) {
          callback(property)
        }
      }
    }
  }

  Tools.prototype.extend = function (target, source) {
    this.forOwn(source, function (property) {
      if (this.isObject(source[property])) {
        if (!target[property] || !this.isObject(target[property])) {
          target[property] = {}
        }
        this.extend(target[property], source[property])
      } else {
        target[property] = source[property]
      }
    }.bind(this))
    return target
  }

  Tools.prototype.extendClone = function (target, source) {
    return this.extend(this.extend({}, target), source)
  }

  Tools.prototype.isMobile = function () {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  /**
   * Polyfills
   * --------
   */

  _requestAnimationFrame = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60)
    }

  /**
   * Module Wrapper
   * --------------
   */
  if (true) {
    !(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
      return ScrollReveal
    }.call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__))
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScrollReveal
  } else {
    window.ScrollReveal = ScrollReveal
  }
})();


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*! smooth-scroll v12.1.5 | (c) 2017 Chris Ferdinandi | MIT License | http://github.com/cferdinandi/smooth-scroll */
!(function(e,t){ true?!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function(){return t(e)}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)):"object"==typeof exports?module.exports=t(e):e.SmoothScroll=t(e)})("undefined"!=typeof global?global:"undefined"!=typeof window?window:this,(function(e){"use strict";var t="querySelector"in document&&"addEventListener"in e&&"requestAnimationFrame"in e&&"closest"in e.Element.prototype,n={ignore:"[data-scroll-ignore]",header:null,speed:500,offset:0,easing:"easeInOutCubic",customEasing:null,before:function(){},after:function(){}},o=function(){for(var e={},t=0,n=arguments.length;t<n;t++){var o=arguments[t];!(function(t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])})(o)}return e},a=function(t){return parseInt(e.getComputedStyle(t).height,10)},r=function(e){"#"===e.charAt(0)&&(e=e.substr(1));for(var t,n=String(e),o=n.length,a=-1,r="",i=n.charCodeAt(0);++a<o;){if(0===(t=n.charCodeAt(a)))throw new InvalidCharacterError("Invalid character: the input contains U+0000.");t>=1&&t<=31||127==t||0===a&&t>=48&&t<=57||1===a&&t>=48&&t<=57&&45===i?r+="\\"+t.toString(16)+" ":r+=t>=128||45===t||95===t||t>=48&&t<=57||t>=65&&t<=90||t>=97&&t<=122?n.charAt(a):"\\"+n.charAt(a)}return"#"+r},i=function(e,t){var n;return"easeInQuad"===e.easing&&(n=t*t),"easeOutQuad"===e.easing&&(n=t*(2-t)),"easeInOutQuad"===e.easing&&(n=t<.5?2*t*t:(4-2*t)*t-1),"easeInCubic"===e.easing&&(n=t*t*t),"easeOutCubic"===e.easing&&(n=--t*t*t+1),"easeInOutCubic"===e.easing&&(n=t<.5?4*t*t*t:(t-1)*(2*t-2)*(2*t-2)+1),"easeInQuart"===e.easing&&(n=t*t*t*t),"easeOutQuart"===e.easing&&(n=1- --t*t*t*t),"easeInOutQuart"===e.easing&&(n=t<.5?8*t*t*t*t:1-8*--t*t*t*t),"easeInQuint"===e.easing&&(n=t*t*t*t*t),"easeOutQuint"===e.easing&&(n=1+--t*t*t*t*t),"easeInOutQuint"===e.easing&&(n=t<.5?16*t*t*t*t*t:1+16*--t*t*t*t*t),e.customEasing&&(n=e.customEasing(t)),n||t},u=function(){return Math.max(document.body.scrollHeight,document.documentElement.scrollHeight,document.body.offsetHeight,document.documentElement.offsetHeight,document.body.clientHeight,document.documentElement.clientHeight)},c=function(e,t,n){var o=0;if(e.offsetParent)do{o+=e.offsetTop,e=e.offsetParent}while(e);return o=Math.max(o-t-n,0)},s=function(e){return e?a(e)+e.offsetTop:0},l=function(t,n,o){o||(t.focus(),document.activeElement.id!==t.id&&(t.setAttribute("tabindex","-1"),t.focus(),t.style.outline="none"),e.scrollTo(0,n))},f=function(t){return!!("matchMedia"in e&&e.matchMedia("(prefers-reduced-motion)").matches)};return function(a,d){var m,h,g,p,v,b,y,S={};S.cancelScroll=function(){cancelAnimationFrame(y)},S.animateScroll=function(t,a,r){var f=o(m||n,r||{}),d="[object Number]"===Object.prototype.toString.call(t),h=d||!t.tagName?null:t;if(d||h){var g=e.pageYOffset;f.header&&!p&&(p=document.querySelector(f.header)),v||(v=s(p));var b,y,E,I=d?t:c(h,v,parseInt("function"==typeof f.offset?f.offset():f.offset,10)),O=I-g,A=u(),C=0,w=function(n,o){var r=e.pageYOffset;if(n==o||r==o||(g<o&&e.innerHeight+r)>=A)return S.cancelScroll(),l(t,o,d),f.after(t,a),b=null,!0},Q=function(t){b||(b=t),C+=t-b,y=C/parseInt(f.speed,10),y=y>1?1:y,E=g+O*i(f,y),e.scrollTo(0,Math.floor(E)),w(E,I)||(e.requestAnimationFrame(Q),b=t)};0===e.pageYOffset&&e.scrollTo(0,0),f.before(t,a),S.cancelScroll(),e.requestAnimationFrame(Q)}};var E=function(e){h&&(h.id=h.getAttribute("data-scroll-id"),S.animateScroll(h,g),h=null,g=null)},I=function(t){if(!f()&&0===t.button&&!t.metaKey&&!t.ctrlKey&&(g=t.target.closest(a))&&"a"===g.tagName.toLowerCase()&&!t.target.closest(m.ignore)&&g.hostname===e.location.hostname&&g.pathname===e.location.pathname&&/#/.test(g.href)){var n;try{n=r(decodeURIComponent(g.hash))}catch(e){n=r(g.hash)}if("#"===n){t.preventDefault(),h=document.body;var o=h.id?h.id:"smooth-scroll-top";return h.setAttribute("data-scroll-id",o),h.id="",void(e.location.hash.substring(1)===o?E():e.location.hash=o)}h=document.querySelector(n),h&&(h.setAttribute("data-scroll-id",h.id),h.id="",g.hash===e.location.hash&&(t.preventDefault(),E()))}},O=function(e){b||(b=setTimeout((function(){b=null,v=s(p)}),66))};return S.destroy=function(){m&&(document.removeEventListener("click",I,!1),e.removeEventListener("resize",O,!1),S.cancelScroll(),m=null,h=null,g=null,p=null,v=null,b=null,y=null)},S.init=function(a){t&&(S.destroy(),m=o(n,a||{}),p=m.header?document.querySelector(m.header):null,v=s(p),document.addEventListener("click",I,!1),e.addEventListener("hashchange",E,!1),p&&e.addEventListener("resize",O,!1))},S.init(d),S}}));
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)))

/***/ }),
/* 3 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 4 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ })
],[0]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9qcy9zY3JpcHRzLmpzIiwid2VicGFjazovLy8uLi9ub2RlX21vZHVsZXMvc2Nyb2xscmV2ZWFsL2Rpc3Qvc2Nyb2xscmV2ZWFsLmpzIiwid2VicGFjazovLy8uLi9ub2RlX21vZHVsZXMvc21vb3RoLXNjcm9sbC9kaXN0L2pzL3Ntb290aC1zY3JvbGwubWluLmpzIiwid2VicGFjazovLy8uLi9ub2RlX21vZHVsZXMvd2VicGFjay9idWlsZGluL2dsb2JhbC5qcyIsIndlYnBhY2s6Ly8vLi9zY3NzL3N0eWxlLnNjc3MiXSwibmFtZXMiOlsiU2Nyb2xsUmV2ZWFsIiwicmVxdWlyZSIsIlNtb290aFNjcm9sbCIsInN0eWxlcyIsIndpbmRvdyIsInNyIiwiZHVyYXRpb24iLCJlYXNpbmciLCJ2aWV3RmFjdG9yIiwicmV2ZWFsIl0sIm1hcHBpbmdzIjoiOzs7O0FBQUEsTUFBTUEsZUFBZSxtQkFBQUMsQ0FBUSxDQUFSLENBQXJCO0FBQ0EsTUFBTUMsZUFBZSxtQkFBQUQsQ0FBUSxDQUFSLENBQXJCO0FBQ0EsTUFBTUUsU0FBUyxtQkFBQUYsQ0FBUSxDQUFSLENBQWY7O0FBRUFHLE9BQU9DLEVBQVAsR0FBWUwsYUFBYSxFQUFFTSxVQUFVLEdBQVosRUFBaUJDLFFBQVEsVUFBekIsRUFBcUNDLFlBQVksRUFBakQsRUFBYixDQUFaO0FBQ0FILEdBQUdJLE1BQUgsQ0FBVSxVQUFWO0FBQ0EsSUFBSVAsWUFBSixDQUFpQixjQUFqQixFOzs7Ozs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsQ0FBQztBQUNEOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSwrQ0FBK0M7O0FBRS9DOztBQUVBO0FBQ0Esb0JBQW9CO0FB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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDJCQUEyQjtBQUMzQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxrQkFBa0I7QUFDbEI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQSxxQ0FBcUM7QUFDckM7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFBQTtBQUNMLEdBQUc7QUFDSDtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsQ0FBQzs7Ozs7Ozs4Q0MzMUJEO0FBQ0EsZ0JBQWdCLHNGQUE0RCxZQUFZO0FBQUEsc0tBQW9FLHdGQUF3RixhQUFhLDBIQUEwSCwwSEFBMEgsb0JBQW9CLGNBQWMsWUFBWSx3QkFBd0IsSUFBSSxLQUFLLG1CQUFtQixjQUFjLGdEQUFnRCxLQUFLLFNBQVMsZUFBZSxpREFBaUQsZUFBZSxtQ0FBbUMsNkRBQTZELE1BQU0sRUFBRSw0R0FBNEcsbU1BQW1NLFlBQVksaUJBQWlCLE1BQU0sMm1CQUEybUIsY0FBYyxvTkFBb04sbUJBQW1CLFFBQVEscUJBQXFCLGdDQUFnQyxTQUFTLDJCQUEyQixlQUFlLDRCQUE0QixtQkFBbUIsb0lBQW9JLGVBQWUsOEVBQThFLHFCQUFxQix1QkFBdUIsMEJBQTBCLHdCQUF3QixpQ0FBaUMsa0JBQWtCLGlGQUFpRixTQUFTLG9CQUFvQiwrREFBK0Qsb0hBQW9ILG9CQUFvQixpR0FBaUcsZUFBZSxzSUFBc0ksK0ZBQStGLGtCQUFrQiw4RUFBOEUsZUFBZSwwTkFBME4sTUFBTSxJQUFJLGdDQUFnQyxTQUFTLFlBQVksWUFBWSxtQ0FBbUMsb0NBQW9DLCtHQUErRyxtSUFBbUksZUFBZSw2QkFBNkIsY0FBYyxRQUFRLDRCQUE0Qix1SkFBdUosb0JBQW9CLDJCQUEyQiw4S0FBOEssY0FBYyxHOzs7Ozs7O0FDRHAxSTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsNENBQTRDOztBQUU1Qzs7Ozs7OztBQ3BCQSx5QyIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgU2Nyb2xsUmV2ZWFsID0gcmVxdWlyZSgnc2Nyb2xscmV2ZWFsJyk7XG5jb25zdCBTbW9vdGhTY3JvbGwgPSByZXF1aXJlKCdzbW9vdGgtc2Nyb2xsJyk7XG5jb25zdCBzdHlsZXMgPSByZXF1aXJlKCcuLi9zY3NzL3N0eWxlLnNjc3MnKTtcblxud2luZG93LnNyID0gU2Nyb2xsUmV2ZWFsKHsgZHVyYXRpb246IDYwMCwgZWFzaW5nOiAnZWFzZS1vdXQnLCB2aWV3RmFjdG9yOiAuMyB9KTtcbnNyLnJldmVhbCgnLmFuaW1hdGUnKTtcbm5ldyBTbW9vdGhTY3JvbGwoJ2FbaHJlZio9XCIjXCJdJyk7XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vanMvc2NyaXB0cy5qcyIsIi8vLy8vICAgIC8vLy8vICAgIC8vLy8vICAgIC8vLy8vXG4vLy8vLyAgICAvLy8vLyAgICAvLy8vLyAgICAvLy8vL1xuLy8vLy8gICAgLy8vLy8gICAgLy8vLy8gICAgLy8vLy9cbi8vLy8vICAgIC8vLy8vICAgIC8vLy8vICAgIC8vLy8vXG4vLy8vLyAgICAgICAgICAgICAvLy8vLyAgICAvLy8vL1xuLy8vLy8gICAgICAgICAgICAgLy8vLy8gICAgLy8vLy9cbi8vLy8vICAgIC8vLy8vICAgIC8vLy8vICAgIC8vLy8vXG4vLy8vLyAgICAvLy8vLyAgICAvLy8vLyAgICAvLy8vL1xuICAgICAgICAgLy8vLy8gICAgLy8vLy9cbiAgICAgICAgIC8vLy8vICAgIC8vLy8vXG4vLy8vLyAgICAvLy8vLyAgICAvLy8vLyAgICAvLy8vL1xuLy8vLy8gICAgLy8vLy8gICAgLy8vLy8gICAgLy8vLy9cbi8vLy8vICAgIC8vLy8vICAgIC8vLy8vICAgIC8vLy8vXG4vLy8vLyAgICAvLy8vLyAgICAvLy8vLyAgICAvLy8vL1xuXG4vKipcbiAqIFNjcm9sbFJldmVhbFxuICogLS0tLS0tLS0tLS0tXG4gKiBWZXJzaW9uIDogMy4zLjZcbiAqIFdlYnNpdGUgOiBzY3JvbGxyZXZlYWxqcy5vcmdcbiAqIFJlcG8gICAgOiBnaXRodWIuY29tL2psbWFrZXMvc2Nyb2xscmV2ZWFsLmpzXG4gKiBBdXRob3IgIDogSnVsaWFuIExsb3lkIChAamxtYWtlcylcbiAqL1xuXG47KGZ1bmN0aW9uICgpIHtcbiAgJ3VzZSBzdHJpY3QnXG5cbiAgdmFyIHNyXG4gIHZhciBfcmVxdWVzdEFuaW1hdGlvbkZyYW1lXG5cbiAgZnVuY3Rpb24gU2Nyb2xsUmV2ZWFsIChjb25maWcpIHtcbiAgICAvLyBTdXBwb3J0IGluc3RhbnRpYXRpb24gd2l0aG91dCB0aGUgYG5ld2Aga2V5d29yZC5cbiAgICBpZiAodHlwZW9mIHRoaXMgPT09ICd1bmRlZmluZWQnIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZih0aGlzKSAhPT0gU2Nyb2xsUmV2ZWFsLnByb3RvdHlwZSkge1xuICAgICAgcmV0dXJuIG5ldyBTY3JvbGxSZXZlYWwoY29uZmlnKVxuICAgIH1cblxuICAgIHNyID0gdGhpcyAvLyBTYXZlIHJlZmVyZW5jZSB0byBpbnN0YW5jZS5cbiAgICBzci52ZXJzaW9uID0gJzMuMy42J1xuICAgIHNyLnRvb2xzID0gbmV3IFRvb2xzKCkgLy8gKnJlcXVpcmVkIHV0aWxpdGllc1xuXG4gICAgaWYgKHNyLmlzU3VwcG9ydGVkKCkpIHtcbiAgICAgIHNyLnRvb2xzLmV4dGVuZChzci5kZWZhdWx0cywgY29uZmlnIHx8IHt9KVxuXG4gICAgICBzci5kZWZhdWx0cy5jb250YWluZXIgPSBfcmVzb2x2ZUNvbnRhaW5lcihzci5kZWZhdWx0cylcblxuICAgICAgc3Iuc3RvcmUgPSB7XG4gICAgICAgIGVsZW1lbnRzOiB7fSxcbiAgICAgICAgY29udGFpbmVyczogW11cbiAgICAgIH1cblxuICAgICAgc3Iuc2VxdWVuY2VzID0ge31cbiAgICAgIHNyLmhpc3RvcnkgPSBbXVxuICAgICAgc3IudWlkID0gMFxuICAgICAgc3IuaW5pdGlhbGl6ZWQgPSBmYWxzZVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmIGNvbnNvbGUgIT09IG51bGwpIHtcbiAgICAgIC8vIE5vdGU6IElFOSBvbmx5IHN1cHBvcnRzIGNvbnNvbGUgaWYgZGV2dG9vbHMgYXJlIG9wZW4uXG4gICAgICBjb25zb2xlLmxvZygnU2Nyb2xsUmV2ZWFsIGlzIG5vdCBzdXBwb3J0ZWQgaW4gdGhpcyBicm93c2VyLicpXG4gICAgfVxuXG4gICAgcmV0dXJuIHNyXG4gIH1cblxuICAvKipcbiAgICogQ29uZmlndXJhdGlvblxuICAgKiAtLS0tLS0tLS0tLS0tXG4gICAqIFRoaXMgb2JqZWN0IHNpZ25hdHVyZSBjYW4gYmUgcGFzc2VkIGRpcmVjdGx5IHRvIHRoZSBTY3JvbGxSZXZlYWwgY29uc3RydWN0b3IsXG4gICAqIG9yIGFzIHRoZSBzZWNvbmQgYXJndW1lbnQgb2YgdGhlIGByZXZlYWwoKWAgbWV0aG9kLlxuICAgKi9cblxuICBTY3JvbGxSZXZlYWwucHJvdG90eXBlLmRlZmF1bHRzID0ge1xuICAgIC8vICdib3R0b20nLCAnbGVmdCcsICd0b3AnLCAncmlnaHQnXG4gICAgb3JpZ2luOiAnYm90dG9tJyxcblxuICAgIC8vIENhbiBiZSBhbnkgdmFsaWQgQ1NTIGRpc3RhbmNlLCBlLmcuICc1cmVtJywgJzEwJScsICcyMHZ3JywgZXRjLlxuICAgIGRpc3RhbmNlOiAnMjBweCcsXG5cbiAgICAvLyBUaW1lIGluIG1pbGxpc2Vjb25kcy5cbiAgICBkdXJhdGlvbjogNTAwLFxuICAgIGRlbGF5OiAwLFxuXG4gICAgLy8gU3RhcnRpbmcgYW5nbGVzIGluIGRlZ3JlZXMsIHdpbGwgdHJhbnNpdGlvbiBmcm9tIHRoZXNlIHZhbHVlcyB0byAwIGluIGFsbCBheGVzLlxuICAgIHJvdGF0ZTogeyB4OiAwLCB5OiAwLCB6OiAwIH0sXG5cbiAgICAvLyBTdGFydGluZyBvcGFjaXR5IHZhbHVlLCBiZWZvcmUgdHJhbnNpdGlvbmluZyB0byB0aGUgY29tcHV0ZWQgb3BhY2l0eS5cbiAgICBvcGFjaXR5OiAwLFxuXG4gICAgLy8gU3RhcnRpbmcgc2NhbGUgdmFsdWUsIHdpbGwgdHJhbnNpdGlvbiBmcm9tIHRoaXMgdmFsdWUgdG8gMVxuICAgIHNjYWxlOiAwLjksXG5cbiAgICAvLyBBY2NlcHRzIGFueSB2YWxpZCBDU1MgZWFzaW5nLCBlLmcuICdlYXNlJywgJ2Vhc2UtaW4tb3V0JywgJ2xpbmVhcicsIGV0Yy5cbiAgICBlYXNpbmc6ICdjdWJpYy1iZXppZXIoMC42LCAwLjIsIDAuMSwgMSknLFxuXG4gICAgLy8gYDxodG1sPmAgaXMgdGhlIGRlZmF1bHQgcmV2ZWFsIGNvbnRhaW5lci4gWW91IGNhbiBwYXNzIGVpdGhlcjpcbiAgICAvLyBET00gTm9kZSwgZS5nLiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZm9vQ29udGFpbmVyJylcbiAgICAvLyBTZWxlY3RvciwgZS5nLiAnLmZvb0NvbnRhaW5lcidcbiAgICBjb250YWluZXI6IHdpbmRvdy5kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsXG5cbiAgICAvLyB0cnVlL2ZhbHNlIHRvIGNvbnRyb2wgcmV2ZWFsIGFuaW1hdGlvbnMgb24gbW9iaWxlLlxuICAgIG1vYmlsZTogdHJ1ZSxcblxuICAgIC8vIHRydWU6ICByZXZlYWxzIG9jY3VyIGV2ZXJ5IHRpbWUgZWxlbWVudHMgYmVjb21lIHZpc2libGVcbiAgICAvLyBmYWxzZTogcmV2ZWFscyBvY2N1ciBvbmNlIGFzIGVsZW1lbnRzIGJlY29tZSB2aXNpYmxlXG4gICAgcmVzZXQ6IGZhbHNlLFxuXG4gICAgLy8gJ2Fsd2F5cycg4oCUIGRlbGF5IGZvciBhbGwgcmV2ZWFsIGFuaW1hdGlvbnNcbiAgICAvLyAnb25jZScgICDigJQgZGVsYXkgb25seSB0aGUgZmlyc3QgdGltZSByZXZlYWxzIG9jY3VyXG4gICAgLy8gJ29ubG9hZCcgLSBkZWxheSBvbmx5IGZvciBhbmltYXRpb25zIHRyaWdnZXJlZCBieSBmaXJzdCBsb2FkXG4gICAgdXNlRGVsYXk6ICdhbHdheXMnLFxuXG4gICAgLy8gQ2hhbmdlIHdoZW4gYW4gZWxlbWVudCBpcyBjb25zaWRlcmVkIGluIHRoZSB2aWV3cG9ydC4gVGhlIGRlZmF1bHQgdmFsdWVcbiAgICAvLyBvZiAwLjIwIG1lYW5zIDIwJSBvZiBhbiBlbGVtZW50IG11c3QgYmUgdmlzaWJsZSBmb3IgaXRzIHJldmVhbCB0byBvY2N1ci5cbiAgICB2aWV3RmFjdG9yOiAwLjIsXG5cbiAgICAvLyBQaXhlbCB2YWx1ZXMgdGhhdCBhbHRlciB0aGUgY29udGFpbmVyIGJvdW5kYXJpZXMuXG4gICAgLy8gZS5nLiBTZXQgYHsgdG9wOiA0OCB9YCwgaWYgeW91IGhhdmUgYSA0OHB4IHRhbGwgZml4ZWQgdG9vbGJhci5cbiAgICAvLyAtLVxuICAgIC8vIFZpc3VhbCBBaWQ6IGh0dHBzOi8vc2Nyb2xscmV2ZWFsanMub3JnL2Fzc2V0cy92aWV3b2Zmc2V0LnBuZ1xuICAgIHZpZXdPZmZzZXQ6IHsgdG9wOiAwLCByaWdodDogMCwgYm90dG9tOiAwLCBsZWZ0OiAwIH0sXG5cbiAgICAvLyBDYWxsYmFja3MgdGhhdCBmaXJlIGZvciBlYWNoIHRyaWdnZXJlZCBlbGVtZW50IHJldmVhbCwgYW5kIHJlc2V0LlxuICAgIGJlZm9yZVJldmVhbDogZnVuY3Rpb24gKGRvbUVsKSB7fSxcbiAgICBiZWZvcmVSZXNldDogZnVuY3Rpb24gKGRvbUVsKSB7fSxcblxuICAgIC8vIENhbGxiYWNrcyB0aGF0IGZpcmUgZm9yIGVhY2ggY29tcGxldGVkIGVsZW1lbnQgcmV2ZWFsLCBhbmQgcmVzZXQuXG4gICAgYWZ0ZXJSZXZlYWw6IGZ1bmN0aW9uIChkb21FbCkge30sXG4gICAgYWZ0ZXJSZXNldDogZnVuY3Rpb24gKGRvbUVsKSB7fVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGNsaWVudCBzdXBwb3J0cyBDU1MgVHJhbnNmb3JtIGFuZCBDU1MgVHJhbnNpdGlvbi5cbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIFNjcm9sbFJldmVhbC5wcm90b3R5cGUuaXNTdXBwb3J0ZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHN0eWxlID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlXG4gICAgcmV0dXJuICdXZWJraXRUcmFuc2l0aW9uJyBpbiBzdHlsZSAmJiAnV2Via2l0VHJhbnNmb3JtJyBpbiBzdHlsZSB8fFxuICAgICAgJ3RyYW5zaXRpb24nIGluIHN0eWxlICYmICd0cmFuc2Zvcm0nIGluIHN0eWxlXG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIHJldmVhbCBzZXQsIGEgZ3JvdXAgb2YgZWxlbWVudHMgdGhhdCB3aWxsIGFuaW1hdGUgd2hlbiB0aGV5XG4gICAqIGJlY29tZSB2aXNpYmxlLiBJZiBbaW50ZXJ2YWxdIGlzIHByb3ZpZGVkLCBhIG5ldyBzZXF1ZW5jZSBpcyBjcmVhdGVkXG4gICAqIHRoYXQgd2lsbCBlbnN1cmUgZWxlbWVudHMgcmV2ZWFsIGluIHRoZSBvcmRlciB0aGV5IGFwcGVhciBpbiB0aGUgRE9NLlxuICAgKlxuICAgKiBAcGFyYW0ge05vZGV8Tm9kZUxpc3R8c3RyaW5nfSBbdGFyZ2V0XSAgIFRoZSBub2RlLCBub2RlIGxpc3Qgb3Igc2VsZWN0b3IgdG8gdXNlIGZvciBhbmltYXRpb24uXG4gICAqIEBwYXJhbSB7T2JqZWN0fSAgICAgICAgICAgICAgIFtjb25maWddICAgT3ZlcnJpZGUgdGhlIGRlZmF1bHRzIGZvciB0aGlzIHJldmVhbCBzZXQuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSAgICAgICAgICAgICAgIFtpbnRlcnZhbF0gVGltZSBiZXR3ZWVuIHNlcXVlbmNlZCBlbGVtZW50IGFuaW1hdGlvbnMgKG1pbGxpc2Vjb25kcykuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gICAgICAgICAgICAgIFtzeW5jXSAgICAgVXNlZCBpbnRlcm5hbGx5IHdoZW4gdXBkYXRpbmcgcmV2ZWFscyBmb3IgYXN5bmMgY29udGVudC5cbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0fSBUaGUgY3VycmVudCBTY3JvbGxSZXZlYWwgaW5zdGFuY2UuXG4gICAqL1xuICBTY3JvbGxSZXZlYWwucHJvdG90eXBlLnJldmVhbCA9IGZ1bmN0aW9uICh0YXJnZXQsIGNvbmZpZywgaW50ZXJ2YWwsIHN5bmMpIHtcbiAgICB2YXIgY29udGFpbmVyXG4gICAgdmFyIGVsZW1lbnRzXG4gICAgdmFyIGVsZW1cbiAgICB2YXIgZWxlbUlkXG4gICAgdmFyIHNlcXVlbmNlXG4gICAgdmFyIHNlcXVlbmNlSWRcblxuICAgIC8vIE5vIGN1c3RvbSBjb25maWd1cmF0aW9uIHdhcyBwYXNzZWQsIGJ1dCBhIHNlcXVlbmNlIGludGVydmFsIGluc3RlYWQuXG4gICAgLy8gbGV04oCZcyBzaHVmZmxlIHRoaW5ncyBhcm91bmQgdG8gbWFrZSBzdXJlIGV2ZXJ5dGhpbmcgd29ya3MuXG4gICAgaWYgKGNvbmZpZyAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiBjb25maWcgPT09ICdudW1iZXInKSB7XG4gICAgICBpbnRlcnZhbCA9IGNvbmZpZ1xuICAgICAgY29uZmlnID0ge31cbiAgICB9IGVsc2UgaWYgKGNvbmZpZyA9PT0gdW5kZWZpbmVkIHx8IGNvbmZpZyA9PT0gbnVsbCkge1xuICAgICAgY29uZmlnID0ge31cbiAgICB9XG5cbiAgICBjb250YWluZXIgPSBfcmVzb2x2ZUNvbnRhaW5lcihjb25maWcpXG4gICAgZWxlbWVudHMgPSBfZ2V0UmV2ZWFsRWxlbWVudHModGFyZ2V0LCBjb250YWluZXIpXG5cbiAgICBpZiAoIWVsZW1lbnRzLmxlbmd0aCkge1xuICAgICAgY29uc29sZS5sb2coJ1Njcm9sbFJldmVhbDogcmV2ZWFsIG9uIFwiJyArIHRhcmdldCArICdcIiBmYWlsZWQsIG5vIGVsZW1lbnRzIGZvdW5kLicpXG4gICAgICByZXR1cm4gc3JcbiAgICB9XG5cbiAgICAvLyBQcmVwYXJlIGEgbmV3IHNlcXVlbmNlIGlmIGFuIGludGVydmFsIGlzIHBhc3NlZC5cbiAgICBpZiAoaW50ZXJ2YWwgJiYgdHlwZW9mIGludGVydmFsID09PSAnbnVtYmVyJykge1xuICAgICAgc2VxdWVuY2VJZCA9IF9uZXh0VWlkKClcblxuICAgICAgc2VxdWVuY2UgPSBzci5zZXF1ZW5jZXNbc2VxdWVuY2VJZF0gPSB7XG4gICAgICAgIGlkOiBzZXF1ZW5jZUlkLFxuICAgICAgICBpbnRlcnZhbDogaW50ZXJ2YWwsXG4gICAgICAgIGVsZW1JZHM6IFtdLFxuICAgICAgICBhY3RpdmU6IGZhbHNlXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQmVnaW4gbWFpbiBsb29wIHRvIGNvbmZpZ3VyZSBTY3JvbGxSZXZlYWwgZWxlbWVudHMuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgLy8gQ2hlY2sgaWYgdGhlIGVsZW1lbnQgaGFzIGFscmVhZHkgYmVlbiBjb25maWd1cmVkIGFuZCBncmFiIGl0IGZyb20gdGhlIHN0b3JlLlxuICAgICAgZWxlbUlkID0gZWxlbWVudHNbaV0uZ2V0QXR0cmlidXRlKCdkYXRhLXNyLWlkJylcbiAgICAgIGlmIChlbGVtSWQpIHtcbiAgICAgICAgZWxlbSA9IHNyLnN0b3JlLmVsZW1lbnRzW2VsZW1JZF1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIE90aGVyd2lzZSwgbGV04oCZcyBkbyBzb21lIGJhc2ljIHNldHVwLlxuICAgICAgICBlbGVtID0ge1xuICAgICAgICAgIGlkOiBfbmV4dFVpZCgpLFxuICAgICAgICAgIGRvbUVsOiBlbGVtZW50c1tpXSxcbiAgICAgICAgICBzZWVuOiBmYWxzZSxcbiAgICAgICAgICByZXZlYWxpbmc6IGZhbHNlXG4gICAgICAgIH1cbiAgICAgICAgZWxlbS5kb21FbC5zZXRBdHRyaWJ1dGUoJ2RhdGEtc3ItaWQnLCBlbGVtLmlkKVxuICAgICAgfVxuXG4gICAgICAvLyBTZXF1ZW5jZSBvbmx5IHNldHVwXG4gICAgICBpZiAoc2VxdWVuY2UpIHtcbiAgICAgICAgZWxlbS5zZXF1ZW5jZSA9IHtcbiAgICAgICAgICBpZDogc2VxdWVuY2UuaWQsXG4gICAgICAgICAgaW5kZXg6IHNlcXVlbmNlLmVsZW1JZHMubGVuZ3RoXG4gICAgICAgIH1cblxuICAgICAgICBzZXF1ZW5jZS5lbGVtSWRzLnB1c2goZWxlbS5pZClcbiAgICAgIH1cblxuICAgICAgLy8gTmV3IG9yIGV4aXN0aW5nIGVsZW1lbnQsIGl04oCZcyB0aW1lIHRvIHVwZGF0ZSBpdHMgY29uZmlndXJhdGlvbiwgc3R5bGVzLFxuICAgICAgLy8gYW5kIHNlbmQgdGhlIHVwZGF0ZXMgdG8gb3VyIHN0b3JlLlxuICAgICAgX2NvbmZpZ3VyZShlbGVtLCBjb25maWcsIGNvbnRhaW5lcilcbiAgICAgIF9zdHlsZShlbGVtKVxuICAgICAgX3VwZGF0ZVN0b3JlKGVsZW0pXG5cbiAgICAgIC8vIFdlIG5lZWQgdG8gbWFrZSBzdXJlIGVsZW1lbnRzIGFyZSBzZXQgdG8gdmlzaWJpbGl0eTogdmlzaWJsZSwgZXZlbiB3aGVuXG4gICAgICAvLyBvbiBtb2JpbGUgYW5kIGBjb25maWcubW9iaWxlID09PSBmYWxzZWAsIG9yIGlmIHVuc3VwcG9ydGVkLlxuICAgICAgaWYgKHNyLnRvb2xzLmlzTW9iaWxlKCkgJiYgIWVsZW0uY29uZmlnLm1vYmlsZSB8fCAhc3IuaXNTdXBwb3J0ZWQoKSkge1xuICAgICAgICBlbGVtLmRvbUVsLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCBlbGVtLnN0eWxlcy5pbmxpbmUpXG4gICAgICAgIGVsZW0uZGlzYWJsZWQgPSB0cnVlXG4gICAgICB9IGVsc2UgaWYgKCFlbGVtLnJldmVhbGluZykge1xuICAgICAgICAvLyBPdGhlcndpc2UsIHByb2NlZWQgbm9ybWFsbHkuXG4gICAgICAgIGVsZW0uZG9tRWwuc2V0QXR0cmlidXRlKCdzdHlsZScsXG4gICAgICAgICAgZWxlbS5zdHlsZXMuaW5saW5lICtcbiAgICAgICAgICBlbGVtLnN0eWxlcy50cmFuc2Zvcm0uaW5pdGlhbFxuICAgICAgICApXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRWFjaCBgcmV2ZWFsKClgIGlzIHJlY29yZGVkIHNvIHRoYXQgd2hlbiBjYWxsaW5nIGBzeW5jKClgIHdoaWxlIHdvcmtpbmdcbiAgICAvLyB3aXRoIGFzeW5jaHJvbm91c2x5IGxvYWRlZCBjb250ZW50LCBpdCBjYW4gcmUtdHJhY2UgeW91ciBzdGVwcyBidXQgd2l0aFxuICAgIC8vIGFsbCB5b3VyIG5ldyBlbGVtZW50cyBub3cgaW4gdGhlIERPTS5cblxuICAgIC8vIFNpbmNlIGByZXZlYWwoKWAgaXMgY2FsbGVkIGludGVybmFsbHkgYnkgYHN5bmMoKWAsIHdlIGRvbuKAmXQgd2FudCB0b1xuICAgIC8vIHJlY29yZCBvciBpbnRpaWFsaXplIGVhY2ggcmV2ZWFsIGR1cmluZyBzeW5jaW5nLlxuICAgIGlmICghc3luYyAmJiBzci5pc1N1cHBvcnRlZCgpKSB7XG4gICAgICBfcmVjb3JkKHRhcmdldCwgY29uZmlnLCBpbnRlcnZhbClcblxuICAgICAgLy8gV2UgcHVzaCBpbml0aWFsaXphdGlvbiB0byB0aGUgZXZlbnQgcXVldWUgdXNpbmcgc2V0VGltZW91dCwgc28gdGhhdCB3ZSBjYW5cbiAgICAgIC8vIGdpdmUgU2Nyb2xsUmV2ZWFsIHJvb20gdG8gcHJvY2VzcyBhbGwgcmV2ZWFsIGNhbGxzIGJlZm9yZSBwdXR0aW5nIHRoaW5ncyBpbnRvIG1vdGlvbi5cbiAgICAgIC8vIC0tXG4gICAgICAvLyBQaGlsaXAgUm9iZXJ0cyAtIFdoYXQgdGhlIGhlY2sgaXMgdGhlIGV2ZW50IGxvb3AgYW55d2F5PyAoSlNDb25mIEVVIDIwMTQpXG4gICAgICAvLyBodHRwczovL3d3dy55b3V0dWJlLmNvbS93YXRjaD92PThhR2haUWtvRmJRXG4gICAgICBpZiAoc3IuaW5pdFRpbWVvdXQpIHtcbiAgICAgICAgd2luZG93LmNsZWFyVGltZW91dChzci5pbml0VGltZW91dClcbiAgICAgIH1cbiAgICAgIHNyLmluaXRUaW1lb3V0ID0gd2luZG93LnNldFRpbWVvdXQoX2luaXQsIDApXG4gICAgfVxuXG4gICAgcmV0dXJuIHNyXG4gIH1cblxuICAvKipcbiAgICogUmUtcnVucyBgcmV2ZWFsKClgIGZvciBlYWNoIHJlY29yZCBzdG9yZWQgaW4gaGlzdG9yeSwgZWZmZWN0aXZlbHkgY2FwdHVyaW5nXG4gICAqIGFueSBjb250ZW50IGxvYWRlZCBhc3luY2hyb25vdXNseSB0aGF0IG1hdGNoZXMgZXhpc3RpbmcgcmV2ZWFsIHNldCB0YXJnZXRzLlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IFRoZSBjdXJyZW50IFNjcm9sbFJldmVhbCBpbnN0YW5jZS5cbiAgICovXG4gIFNjcm9sbFJldmVhbC5wcm90b3R5cGUuc3luYyA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoc3IuaGlzdG9yeS5sZW5ndGggJiYgc3IuaXNTdXBwb3J0ZWQoKSkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzci5oaXN0b3J5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciByZWNvcmQgPSBzci5oaXN0b3J5W2ldXG4gICAgICAgIHNyLnJldmVhbChyZWNvcmQudGFyZ2V0LCByZWNvcmQuY29uZmlnLCByZWNvcmQuaW50ZXJ2YWwsIHRydWUpXG4gICAgICB9XG4gICAgICBfaW5pdCgpXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKCdTY3JvbGxSZXZlYWw6IHN5bmMgZmFpbGVkLCBubyByZXZlYWxzIGZvdW5kLicpXG4gICAgfVxuICAgIHJldHVybiBzclxuICB9XG5cbiAgLyoqXG4gICAqIFByaXZhdGUgTWV0aG9kc1xuICAgKiAtLS0tLS0tLS0tLS0tLS1cbiAgICovXG5cbiAgZnVuY3Rpb24gX3Jlc29sdmVDb250YWluZXIgKGNvbmZpZykge1xuICAgIGlmIChjb25maWcgJiYgY29uZmlnLmNvbnRhaW5lcikge1xuICAgICAgaWYgKHR5cGVvZiBjb25maWcuY29udGFpbmVyID09PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4gd2luZG93LmRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yKGNvbmZpZy5jb250YWluZXIpXG4gICAgICB9IGVsc2UgaWYgKHNyLnRvb2xzLmlzTm9kZShjb25maWcuY29udGFpbmVyKSkge1xuICAgICAgICByZXR1cm4gY29uZmlnLmNvbnRhaW5lclxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1Njcm9sbFJldmVhbDogaW52YWxpZCBjb250YWluZXIgXCInICsgY29uZmlnLmNvbnRhaW5lciArICdcIiBwcm92aWRlZC4nKVxuICAgICAgICBjb25zb2xlLmxvZygnU2Nyb2xsUmV2ZWFsOiBmYWxsaW5nIGJhY2sgdG8gZGVmYXVsdCBjb250YWluZXIuJylcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHNyLmRlZmF1bHRzLmNvbnRhaW5lclxuICB9XG5cbiAgLyoqXG4gICAqIGNoZWNrIHRvIHNlZSBpZiBhIG5vZGUgb3Igbm9kZSBsaXN0IHdhcyBwYXNzZWQgaW4gYXMgdGhlIHRhcmdldCxcbiAgICogb3RoZXJ3aXNlIHF1ZXJ5IHRoZSBjb250YWluZXIgdXNpbmcgdGFyZ2V0IGFzIGEgc2VsZWN0b3IuXG4gICAqXG4gICAqIEBwYXJhbSB7Tm9kZXxOb2RlTGlzdHxzdHJpbmd9IFt0YXJnZXRdICAgIGNsaWVudCBpbnB1dCBmb3IgcmV2ZWFsIHRhcmdldC5cbiAgICogQHBhcmFtIHtOb2RlfSAgICAgICAgICAgICAgICAgW2NvbnRhaW5lcl0gcGFyZW50IGVsZW1lbnQgZm9yIHNlbGVjdG9yIHF1ZXJpZXMuXG4gICAqXG4gICAqIEByZXR1cm4ge2FycmF5fSBlbGVtZW50cyB0byBiZSByZXZlYWxlZC5cbiAgICovXG4gIGZ1bmN0aW9uIF9nZXRSZXZlYWxFbGVtZW50cyAodGFyZ2V0LCBjb250YWluZXIpIHtcbiAgICBpZiAodHlwZW9mIHRhcmdldCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChjb250YWluZXIucXVlcnlTZWxlY3RvckFsbCh0YXJnZXQpKVxuICAgIH0gZWxzZSBpZiAoc3IudG9vbHMuaXNOb2RlKHRhcmdldCkpIHtcbiAgICAgIHJldHVybiBbdGFyZ2V0XVxuICAgIH0gZWxzZSBpZiAoc3IudG9vbHMuaXNOb2RlTGlzdCh0YXJnZXQpKSB7XG4gICAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwodGFyZ2V0KVxuICAgIH1cbiAgICByZXR1cm4gW11cbiAgfVxuXG4gIC8qKlxuICAgKiBBIGNvbnNpc3RlbnQgd2F5IG9mIGNyZWF0aW5nIHVuaXF1ZSBJRHMuXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqL1xuICBmdW5jdGlvbiBfbmV4dFVpZCAoKSB7XG4gICAgcmV0dXJuICsrc3IudWlkXG4gIH1cblxuICBmdW5jdGlvbiBfY29uZmlndXJlIChlbGVtLCBjb25maWcsIGNvbnRhaW5lcikge1xuICAgIC8vIElmIGEgY29udGFpbmVyIHdhcyBwYXNzZWQgYXMgYSBwYXJ0IG9mIHRoZSBjb25maWcgb2JqZWN0LFxuICAgIC8vIGxldOKAmXMgb3ZlcndyaXRlIGl0IHdpdGggdGhlIHJlc29sdmVkIGNvbnRhaW5lciBwYXNzZWQgaW4uXG4gICAgaWYgKGNvbmZpZy5jb250YWluZXIpIGNvbmZpZy5jb250YWluZXIgPSBjb250YWluZXJcbiAgICAvLyBJZiB0aGUgZWxlbWVudCBoYXNu4oCZdCBhbHJlYWR5IGJlZW4gY29uZmlndXJlZCwgbGV04oCZcyB1c2UgYSBjbG9uZSBvZiB0aGVcbiAgICAvLyBkZWZhdWx0cyBleHRlbmRlZCBieSB0aGUgY29uZmlndXJhdGlvbiBwYXNzZWQgYXMgdGhlIHNlY29uZCBhcmd1bWVudC5cbiAgICBpZiAoIWVsZW0uY29uZmlnKSB7XG4gICAgICBlbGVtLmNvbmZpZyA9IHNyLnRvb2xzLmV4dGVuZENsb25lKHNyLmRlZmF1bHRzLCBjb25maWcpXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIE90aGVyd2lzZSwgbGV04oCZcyB1c2UgYSBjbG9uZSBvZiB0aGUgZXhpc3RpbmcgZWxlbWVudCBjb25maWd1cmF0aW9uIGV4dGVuZGVkXG4gICAgICAvLyBieSB0aGUgY29uZmlndXJhdGlvbiBwYXNzZWQgYXMgdGhlIHNlY29uZCBhcmd1bWVudC5cbiAgICAgIGVsZW0uY29uZmlnID0gc3IudG9vbHMuZXh0ZW5kQ2xvbmUoZWxlbS5jb25maWcsIGNvbmZpZylcbiAgICB9XG5cbiAgICAvLyBJbmZlciBDU1MgVHJhbnNmb3JtIGF4aXMgZnJvbSBvcmlnaW4gc3RyaW5nLlxuICAgIGlmIChlbGVtLmNvbmZpZy5vcmlnaW4gPT09ICd0b3AnIHx8IGVsZW0uY29uZmlnLm9yaWdpbiA9PT0gJ2JvdHRvbScpIHtcbiAgICAgIGVsZW0uY29uZmlnLmF4aXMgPSAnWSdcbiAgICB9IGVsc2Uge1xuICAgICAgZWxlbS5jb25maWcuYXhpcyA9ICdYJ1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIF9zdHlsZSAoZWxlbSkge1xuICAgIHZhciBjb21wdXRlZCA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsZW0uZG9tRWwpXG5cbiAgICBpZiAoIWVsZW0uc3R5bGVzKSB7XG4gICAgICBlbGVtLnN0eWxlcyA9IHtcbiAgICAgICAgdHJhbnNpdGlvbjoge30sXG4gICAgICAgIHRyYW5zZm9ybToge30sXG4gICAgICAgIGNvbXB1dGVkOiB7fVxuICAgICAgfVxuXG4gICAgICAvLyBDYXB0dXJlIGFueSBleGlzdGluZyBpbmxpbmUgc3R5bGVzLCBhbmQgYWRkIG91ciB2aXNpYmlsaXR5IG92ZXJyaWRlLlxuICAgICAgLy8gLS1cbiAgICAgIC8vIFNlZSBzZWN0aW9uIDQuMi4gaW4gdGhlIERvY3VtZW50YXRpb246XG4gICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vamxtYWtlcy9zY3JvbGxyZXZlYWwuanMjNDItaW1wcm92ZS11c2VyLWV4cGVyaWVuY2VcbiAgICAgIGVsZW0uc3R5bGVzLmlubGluZSA9IGVsZW0uZG9tRWwuZ2V0QXR0cmlidXRlKCdzdHlsZScpIHx8ICcnXG4gICAgICBlbGVtLnN0eWxlcy5pbmxpbmUgKz0gJzsgdmlzaWJpbGl0eTogdmlzaWJsZTsgJ1xuXG4gICAgICAvLyBncmFiIHRoZSBlbGVtZW50cyBleGlzdGluZyBvcGFjaXR5LlxuICAgICAgZWxlbS5zdHlsZXMuY29tcHV0ZWQub3BhY2l0eSA9IGNvbXB1dGVkLm9wYWNpdHlcblxuICAgICAgLy8gZ3JhYiB0aGUgZWxlbWVudHMgZXhpc3RpbmcgdHJhbnNpdGlvbnMuXG4gICAgICBpZiAoIWNvbXB1dGVkLnRyYW5zaXRpb24gfHwgY29tcHV0ZWQudHJhbnNpdGlvbiA9PT0gJ2FsbCAwcyBlYXNlIDBzJykge1xuICAgICAgICBlbGVtLnN0eWxlcy5jb21wdXRlZC50cmFuc2l0aW9uID0gJydcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVsZW0uc3R5bGVzLmNvbXB1dGVkLnRyYW5zaXRpb24gPSBjb21wdXRlZC50cmFuc2l0aW9uICsgJywgJ1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIENyZWF0ZSB0cmFuc2l0aW9uIHN0eWxlc1xuICAgIGVsZW0uc3R5bGVzLnRyYW5zaXRpb24uaW5zdGFudCA9IF9nZW5lcmF0ZVRyYW5zaXRpb24oZWxlbSwgMClcbiAgICBlbGVtLnN0eWxlcy50cmFuc2l0aW9uLmRlbGF5ZWQgPSBfZ2VuZXJhdGVUcmFuc2l0aW9uKGVsZW0sIGVsZW0uY29uZmlnLmRlbGF5KVxuXG4gICAgLy8gR2VuZXJhdGUgdHJhbnNmb3JtIHN0eWxlcywgZmlyc3Qgd2l0aCB0aGUgd2Via2l0IHByZWZpeC5cbiAgICBlbGVtLnN0eWxlcy50cmFuc2Zvcm0uaW5pdGlhbCA9ICcgLXdlYmtpdC10cmFuc2Zvcm06J1xuICAgIGVsZW0uc3R5bGVzLnRyYW5zZm9ybS50YXJnZXQgPSAnIC13ZWJraXQtdHJhbnNmb3JtOidcbiAgICBfZ2VuZXJhdGVUcmFuc2Zvcm0oZWxlbSlcblxuICAgIC8vIEFuZCBhZ2FpbiB3aXRob3V0IGFueSBwcmVmaXguXG4gICAgZWxlbS5zdHlsZXMudHJhbnNmb3JtLmluaXRpYWwgKz0gJ3RyYW5zZm9ybTonXG4gICAgZWxlbS5zdHlsZXMudHJhbnNmb3JtLnRhcmdldCArPSAndHJhbnNmb3JtOidcbiAgICBfZ2VuZXJhdGVUcmFuc2Zvcm0oZWxlbSlcbiAgfVxuXG4gIGZ1bmN0aW9uIF9nZW5lcmF0ZVRyYW5zaXRpb24gKGVsZW0sIGRlbGF5KSB7XG4gICAgdmFyIGNvbmZpZyA9IGVsZW0uY29uZmlnXG5cbiAgICByZXR1cm4gJy13ZWJraXQtdHJhbnNpdGlvbjogJyArIGVsZW0uc3R5bGVzLmNvbXB1dGVkLnRyYW5zaXRpb24gK1xuICAgICAgJy13ZWJraXQtdHJhbnNmb3JtICcgKyBjb25maWcuZHVyYXRpb24gLyAxMDAwICsgJ3MgJyArXG4gICAgICBjb25maWcuZWFzaW5nICsgJyAnICtcbiAgICAgIGRlbGF5IC8gMTAwMCArICdzLCBvcGFjaXR5ICcgK1xuICAgICAgY29uZmlnLmR1cmF0aW9uIC8gMTAwMCArICdzICcgK1xuICAgICAgY29uZmlnLmVhc2luZyArICcgJyArXG4gICAgICBkZWxheSAvIDEwMDAgKyAnczsgJyArXG5cbiAgICAgICd0cmFuc2l0aW9uOiAnICsgZWxlbS5zdHlsZXMuY29tcHV0ZWQudHJhbnNpdGlvbiArXG4gICAgICAndHJhbnNmb3JtICcgKyBjb25maWcuZHVyYXRpb24gLyAxMDAwICsgJ3MgJyArXG4gICAgICBjb25maWcuZWFzaW5nICsgJyAnICtcbiAgICAgIGRlbGF5IC8gMTAwMCArICdzLCBvcGFjaXR5ICcgK1xuICAgICAgY29uZmlnLmR1cmF0aW9uIC8gMTAwMCArICdzICcgK1xuICAgICAgY29uZmlnLmVhc2luZyArICcgJyArXG4gICAgICBkZWxheSAvIDEwMDAgKyAnczsgJ1xuICB9XG5cbiAgZnVuY3Rpb24gX2dlbmVyYXRlVHJhbnNmb3JtIChlbGVtKSB7XG4gICAgdmFyIGNvbmZpZyA9IGVsZW0uY29uZmlnXG4gICAgdmFyIGNzc0Rpc3RhbmNlXG4gICAgdmFyIHRyYW5zZm9ybSA9IGVsZW0uc3R5bGVzLnRyYW5zZm9ybVxuXG4gICAgLy8gTGV04oCZcyBtYWtlIHN1cmUgb3VyIG91ciBwaXhlbCBkaXN0YW5jZXMgYXJlIG5lZ2F0aXZlIGZvciB0b3AgYW5kIGxlZnQuXG4gICAgLy8gZS5nLiBvcmlnaW4gPSAndG9wJyBhbmQgZGlzdGFuY2UgPSAnMjVweCcgc3RhcnRzIGF0IGB0b3A6IC0yNXB4YCBpbiBDU1MuXG4gICAgaWYgKGNvbmZpZy5vcmlnaW4gPT09ICd0b3AnIHx8IGNvbmZpZy5vcmlnaW4gPT09ICdsZWZ0Jykge1xuICAgICAgY3NzRGlzdGFuY2UgPSAvXi0vLnRlc3QoY29uZmlnLmRpc3RhbmNlKVxuICAgICAgICA/IGNvbmZpZy5kaXN0YW5jZS5zdWJzdHIoMSlcbiAgICAgICAgOiAnLScgKyBjb25maWcuZGlzdGFuY2VcbiAgICB9IGVsc2Uge1xuICAgICAgY3NzRGlzdGFuY2UgPSBjb25maWcuZGlzdGFuY2VcbiAgICB9XG5cbiAgICBpZiAocGFyc2VJbnQoY29uZmlnLmRpc3RhbmNlKSkge1xuICAgICAgdHJhbnNmb3JtLmluaXRpYWwgKz0gJyB0cmFuc2xhdGUnICsgY29uZmlnLmF4aXMgKyAnKCcgKyBjc3NEaXN0YW5jZSArICcpJ1xuICAgICAgdHJhbnNmb3JtLnRhcmdldCArPSAnIHRyYW5zbGF0ZScgKyBjb25maWcuYXhpcyArICcoMCknXG4gICAgfVxuICAgIGlmIChjb25maWcuc2NhbGUpIHtcbiAgICAgIHRyYW5zZm9ybS5pbml0aWFsICs9ICcgc2NhbGUoJyArIGNvbmZpZy5zY2FsZSArICcpJ1xuICAgICAgdHJhbnNmb3JtLnRhcmdldCArPSAnIHNjYWxlKDEpJ1xuICAgIH1cbiAgICBpZiAoY29uZmlnLnJvdGF0ZS54KSB7XG4gICAgICB0cmFuc2Zvcm0uaW5pdGlhbCArPSAnIHJvdGF0ZVgoJyArIGNvbmZpZy5yb3RhdGUueCArICdkZWcpJ1xuICAgICAgdHJhbnNmb3JtLnRhcmdldCArPSAnIHJvdGF0ZVgoMCknXG4gICAgfVxuICAgIGlmIChjb25maWcucm90YXRlLnkpIHtcbiAgICAgIHRyYW5zZm9ybS5pbml0aWFsICs9ICcgcm90YXRlWSgnICsgY29uZmlnLnJvdGF0ZS55ICsgJ2RlZyknXG4gICAgICB0cmFuc2Zvcm0udGFyZ2V0ICs9ICcgcm90YXRlWSgwKSdcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5yb3RhdGUueikge1xuICAgICAgdHJhbnNmb3JtLmluaXRpYWwgKz0gJyByb3RhdGVaKCcgKyBjb25maWcucm90YXRlLnogKyAnZGVnKSdcbiAgICAgIHRyYW5zZm9ybS50YXJnZXQgKz0gJyByb3RhdGVaKDApJ1xuICAgIH1cbiAgICB0cmFuc2Zvcm0uaW5pdGlhbCArPSAnOyBvcGFjaXR5OiAnICsgY29uZmlnLm9wYWNpdHkgKyAnOydcbiAgICB0cmFuc2Zvcm0udGFyZ2V0ICs9ICc7IG9wYWNpdHk6ICcgKyBlbGVtLnN0eWxlcy5jb21wdXRlZC5vcGFjaXR5ICsgJzsnXG4gIH1cblxuICBmdW5jdGlvbiBfdXBkYXRlU3RvcmUgKGVsZW0pIHtcbiAgICB2YXIgY29udGFpbmVyID0gZWxlbS5jb25maWcuY29udGFpbmVyXG5cbiAgICAvLyBJZiB0aGlzIGVsZW1lbnTigJlzIGNvbnRhaW5lciBpc27igJl0IGFscmVhZHkgaW4gdGhlIHN0b3JlLCBsZXTigJlzIGFkZCBpdC5cbiAgICBpZiAoY29udGFpbmVyICYmIHNyLnN0b3JlLmNvbnRhaW5lcnMuaW5kZXhPZihjb250YWluZXIpID09PSAtMSkge1xuICAgICAgc3Iuc3RvcmUuY29udGFpbmVycy5wdXNoKGVsZW0uY29uZmlnLmNvbnRhaW5lcilcbiAgICB9XG5cbiAgICAvLyBVcGRhdGUgdGhlIGVsZW1lbnQgc3RvcmVkIHdpdGggb3VyIG5ldyBlbGVtZW50LlxuICAgIHNyLnN0b3JlLmVsZW1lbnRzW2VsZW0uaWRdID0gZWxlbVxuICB9XG5cbiAgZnVuY3Rpb24gX3JlY29yZCAodGFyZ2V0LCBjb25maWcsIGludGVydmFsKSB7XG4gICAgLy8gU2F2ZSB0aGUgYHJldmVhbCgpYCBhcmd1bWVudHMgdGhhdCB0cmlnZ2VyZWQgdGhpcyBgX3JlY29yZCgpYCBjYWxsLCBzbyB3ZVxuICAgIC8vIGNhbiByZS10cmFjZSBvdXIgc3RlcHMgd2hlbiBjYWxsaW5nIHRoZSBgc3luYygpYCBtZXRob2QuXG4gICAgdmFyIHJlY29yZCA9IHtcbiAgICAgIHRhcmdldDogdGFyZ2V0LFxuICAgICAgY29uZmlnOiBjb25maWcsXG4gICAgICBpbnRlcnZhbDogaW50ZXJ2YWxcbiAgICB9XG4gICAgc3IuaGlzdG9yeS5wdXNoKHJlY29yZClcbiAgfVxuXG4gIGZ1bmN0aW9uIF9pbml0ICgpIHtcbiAgICBpZiAoc3IuaXNTdXBwb3J0ZWQoKSkge1xuICAgICAgLy8gSW5pdGlhbCBhbmltYXRlIGNhbGwgdHJpZ2dlcnMgdmFsaWQgcmV2ZWFsIGFuaW1hdGlvbnMgb24gZmlyc3QgbG9hZC5cbiAgICAgIC8vIFN1YnNlcXVlbnQgYW5pbWF0ZSBjYWxscyBhcmUgbWFkZSBpbnNpZGUgdGhlIGV2ZW50IGhhbmRsZXIuXG4gICAgICBfYW5pbWF0ZSgpXG5cbiAgICAgIC8vIFRoZW4gd2UgbG9vcCB0aHJvdWdoIGFsbCBjb250YWluZXIgbm9kZXMgaW4gdGhlIHN0b3JlIGFuZCBiaW5kIGV2ZW50XG4gICAgICAvLyBsaXN0ZW5lcnMgdG8gZWFjaC5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3Iuc3RvcmUuY29udGFpbmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICBzci5zdG9yZS5jb250YWluZXJzW2ldLmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIF9oYW5kbGVyKVxuICAgICAgICBzci5zdG9yZS5jb250YWluZXJzW2ldLmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIF9oYW5kbGVyKVxuICAgICAgfVxuXG4gICAgICAvLyBMZXTigJlzIGFsc28gZG8gYSBvbmUtdGltZSBiaW5kaW5nIG9mIHdpbmRvdyBldmVudCBsaXN0ZW5lcnMuXG4gICAgICBpZiAoIXNyLmluaXRpYWxpemVkKSB7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBfaGFuZGxlcilcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIF9oYW5kbGVyKVxuICAgICAgICBzci5pbml0aWFsaXplZCA9IHRydWVcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHNyXG4gIH1cblxuICBmdW5jdGlvbiBfaGFuZGxlciAoKSB7XG4gICAgX3JlcXVlc3RBbmltYXRpb25GcmFtZShfYW5pbWF0ZSlcbiAgfVxuXG4gIGZ1bmN0aW9uIF9zZXRBY3RpdmVTZXF1ZW5jZXMgKCkge1xuICAgIHZhciBhY3RpdmVcbiAgICB2YXIgZWxlbVxuICAgIHZhciBlbGVtSWRcbiAgICB2YXIgc2VxdWVuY2VcblxuICAgIC8vIExvb3AgdGhyb3VnaCBhbGwgc2VxdWVuY2VzXG4gICAgc3IudG9vbHMuZm9yT3duKHNyLnNlcXVlbmNlcywgZnVuY3Rpb24gKHNlcXVlbmNlSWQpIHtcbiAgICAgIHNlcXVlbmNlID0gc3Iuc2VxdWVuY2VzW3NlcXVlbmNlSWRdXG4gICAgICBhY3RpdmUgPSBmYWxzZVxuXG4gICAgICAvLyBGb3IgZWFjaCBzZXF1ZW5jZWQgZWxlbWVuZXQsIGxldOKAmXMgY2hlY2sgdmlzaWJpbGl0eSBhbmQgaWZcbiAgICAgIC8vIGFueSBhcmUgdmlzaWJsZSwgc2V0IGl04oCZcyBzZXF1ZW5jZSB0byBhY3RpdmUuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNlcXVlbmNlLmVsZW1JZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZWxlbUlkID0gc2VxdWVuY2UuZWxlbUlkc1tpXVxuICAgICAgICBlbGVtID0gc3Iuc3RvcmUuZWxlbWVudHNbZWxlbUlkXVxuICAgICAgICBpZiAoX2lzRWxlbVZpc2libGUoZWxlbSkgJiYgIWFjdGl2ZSkge1xuICAgICAgICAgIGFjdGl2ZSA9IHRydWVcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBzZXF1ZW5jZS5hY3RpdmUgPSBhY3RpdmVcbiAgICB9KVxuICB9XG5cbiAgZnVuY3Rpb24gX2FuaW1hdGUgKCkge1xuICAgIHZhciBkZWxheWVkXG4gICAgdmFyIGVsZW1cblxuICAgIF9zZXRBY3RpdmVTZXF1ZW5jZXMoKVxuXG4gICAgLy8gTG9vcCB0aHJvdWdoIGFsbCBlbGVtZW50cyBpbiB0aGUgc3RvcmVcbiAgICBzci50b29scy5mb3JPd24oc3Iuc3RvcmUuZWxlbWVudHMsIGZ1bmN0aW9uIChlbGVtSWQpIHtcbiAgICAgIGVsZW0gPSBzci5zdG9yZS5lbGVtZW50c1tlbGVtSWRdXG4gICAgICBkZWxheWVkID0gX3Nob3VsZFVzZURlbGF5KGVsZW0pXG5cbiAgICAgIC8vIExldOKAmXMgc2VlIGlmIHdlIHNob3VsZCByZXZlYWxhbmQgaWYgc28sXG4gICAgICAvLyB0cmlnZ2VyIHRoZSBgYmVmb3JlUmV2ZWFsYCBjYWxsYmFjayBhbmRcbiAgICAgIC8vIGRldGVybWluZSB3aGV0aGVyIG9yIG5vdCB0byB1c2UgZGVsYXkuXG4gICAgICBpZiAoX3Nob3VsZFJldmVhbChlbGVtKSkge1xuICAgICAgICBlbGVtLmNvbmZpZy5iZWZvcmVSZXZlYWwoZWxlbS5kb21FbClcbiAgICAgICAgaWYgKGRlbGF5ZWQpIHtcbiAgICAgICAgICBlbGVtLmRvbUVsLnNldEF0dHJpYnV0ZSgnc3R5bGUnLFxuICAgICAgICAgICAgZWxlbS5zdHlsZXMuaW5saW5lICtcbiAgICAgICAgICAgIGVsZW0uc3R5bGVzLnRyYW5zZm9ybS50YXJnZXQgK1xuICAgICAgICAgICAgZWxlbS5zdHlsZXMudHJhbnNpdGlvbi5kZWxheWVkXG4gICAgICAgICAgKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVsZW0uZG9tRWwuc2V0QXR0cmlidXRlKCdzdHlsZScsXG4gICAgICAgICAgICBlbGVtLnN0eWxlcy5pbmxpbmUgK1xuICAgICAgICAgICAgZWxlbS5zdHlsZXMudHJhbnNmb3JtLnRhcmdldCArXG4gICAgICAgICAgICBlbGVtLnN0eWxlcy50cmFuc2l0aW9uLmluc3RhbnRcbiAgICAgICAgICApXG4gICAgICAgIH1cblxuICAgICAgICAvLyBMZXTigJlzIHF1ZXVlIHRoZSBgYWZ0ZXJSZXZlYWxgIGNhbGxiYWNrXG4gICAgICAgIC8vIGFuZCBtYXJrIHRoZSBlbGVtZW50IGFzIHNlZW4gYW5kIHJldmVhbGluZy5cbiAgICAgICAgX3F1ZXVlQ2FsbGJhY2soJ3JldmVhbCcsIGVsZW0sIGRlbGF5ZWQpXG4gICAgICAgIGVsZW0ucmV2ZWFsaW5nID0gdHJ1ZVxuICAgICAgICBlbGVtLnNlZW4gPSB0cnVlXG5cbiAgICAgICAgaWYgKGVsZW0uc2VxdWVuY2UpIHtcbiAgICAgICAgICBfcXVldWVOZXh0SW5TZXF1ZW5jZShlbGVtLCBkZWxheWVkKVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKF9zaG91bGRSZXNldChlbGVtKSkge1xuICAgICAgICAvL090aGVyd2lzZSByZXNldCBvdXIgZWxlbWVudCBhbmRcbiAgICAgICAgLy8gdHJpZ2dlciB0aGUgYGJlZm9yZVJlc2V0YCBjYWxsYmFjay5cbiAgICAgICAgZWxlbS5jb25maWcuYmVmb3JlUmVzZXQoZWxlbS5kb21FbClcbiAgICAgICAgZWxlbS5kb21FbC5zZXRBdHRyaWJ1dGUoJ3N0eWxlJyxcbiAgICAgICAgICBlbGVtLnN0eWxlcy5pbmxpbmUgK1xuICAgICAgICAgIGVsZW0uc3R5bGVzLnRyYW5zZm9ybS5pbml0aWFsICtcbiAgICAgICAgICBlbGVtLnN0eWxlcy50cmFuc2l0aW9uLmluc3RhbnRcbiAgICAgICAgKVxuICAgICAgICAvLyBBbmQgcXVldWUgdGhlIGBhZnRlclJlc2V0YCBjYWxsYmFjay5cbiAgICAgICAgX3F1ZXVlQ2FsbGJhY2soJ3Jlc2V0JywgZWxlbSlcbiAgICAgICAgZWxlbS5yZXZlYWxpbmcgPSBmYWxzZVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiBfcXVldWVOZXh0SW5TZXF1ZW5jZSAoZWxlbSwgZGVsYXllZCkge1xuICAgIHZhciBlbGFwc2VkID0gMFxuICAgIHZhciBkZWxheSA9IDBcbiAgICB2YXIgc2VxdWVuY2UgPSBzci5zZXF1ZW5jZXNbZWxlbS5zZXF1ZW5jZS5pZF1cblxuICAgIC8vIFdl4oCZcmUgcHJvY2Vzc2luZyBhIHNlcXVlbmNlZCBlbGVtZW50LCBzbyBsZXQncyBibG9jayBvdGhlciBlbGVtZW50cyBpbiB0aGlzIHNlcXVlbmNlLlxuICAgIHNlcXVlbmNlLmJsb2NrZWQgPSB0cnVlXG5cbiAgICAvLyBTaW5jZSB3ZeKAmXJlIHRyaWdnZXJpbmcgYW5pbWF0aW9ucyBhIHBhcnQgb2YgYSBzZXF1ZW5jZSBhZnRlciBhbmltYXRpb25zIG9uIGZpcnN0IGxvYWQsXG4gICAgLy8gd2UgbmVlZCB0byBjaGVjayBmb3IgdGhhdCBjb25kaXRpb24gYW5kIGV4cGxpY2l0bHkgYWRkIHRoZSBkZWxheSB0byBvdXIgdGltZXIuXG4gICAgaWYgKGRlbGF5ZWQgJiYgZWxlbS5jb25maWcudXNlRGVsYXkgPT09ICdvbmxvYWQnKSB7XG4gICAgICBkZWxheSA9IGVsZW0uY29uZmlnLmRlbGF5XG4gICAgfVxuXG4gICAgLy8gSWYgYSBzZXF1ZW5jZSB0aW1lciBpcyBhbHJlYWR5IHJ1bm5pbmcsIGNhcHR1cmUgdGhlIGVsYXBzZWQgdGltZSBhbmQgY2xlYXIgaXQuXG4gICAgaWYgKGVsZW0uc2VxdWVuY2UudGltZXIpIHtcbiAgICAgIGVsYXBzZWQgPSBNYXRoLmFicyhlbGVtLnNlcXVlbmNlLnRpbWVyLnN0YXJ0ZWQgLSBuZXcgRGF0ZSgpKVxuICAgICAgd2luZG93LmNsZWFyVGltZW91dChlbGVtLnNlcXVlbmNlLnRpbWVyKVxuICAgIH1cblxuICAgIC8vIFN0YXJ0IGEgbmV3IHRpbWVyLlxuICAgIGVsZW0uc2VxdWVuY2UudGltZXIgPSB7IHN0YXJ0ZWQ6IG5ldyBEYXRlKCkgfVxuICAgIGVsZW0uc2VxdWVuY2UudGltZXIuY2xvY2sgPSB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAvLyBTZXF1ZW5jZSBpbnRlcnZhbCBoYXMgcGFzc2VkLCBzbyB1bmJsb2NrIHRoZSBzZXF1ZW5jZSBhbmQgcmUtcnVuIHRoZSBoYW5kbGVyLlxuICAgICAgc2VxdWVuY2UuYmxvY2tlZCA9IGZhbHNlXG4gICAgICBlbGVtLnNlcXVlbmNlLnRpbWVyID0gbnVsbFxuICAgICAgX2hhbmRsZXIoKVxuICAgIH0sIE1hdGguYWJzKHNlcXVlbmNlLmludGVydmFsKSArIGRlbGF5IC0gZWxhcHNlZClcbiAgfVxuXG4gIGZ1bmN0aW9uIF9xdWV1ZUNhbGxiYWNrICh0eXBlLCBlbGVtLCBkZWxheWVkKSB7XG4gICAgdmFyIGVsYXBzZWQgPSAwXG4gICAgdmFyIGR1cmF0aW9uID0gMFxuICAgIHZhciBjYWxsYmFjayA9ICdhZnRlcidcblxuICAgIC8vIENoZWNrIHdoaWNoIGNhbGxiYWNrIHdl4oCZcmUgd29ya2luZyB3aXRoLlxuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgY2FzZSAncmV2ZWFsJzpcbiAgICAgICAgZHVyYXRpb24gPSBlbGVtLmNvbmZpZy5kdXJhdGlvblxuICAgICAgICBpZiAoZGVsYXllZCkge1xuICAgICAgICAgIGR1cmF0aW9uICs9IGVsZW0uY29uZmlnLmRlbGF5XG4gICAgICAgIH1cbiAgICAgICAgY2FsbGJhY2sgKz0gJ1JldmVhbCdcbiAgICAgICAgYnJlYWtcblxuICAgICAgY2FzZSAncmVzZXQnOlxuICAgICAgICBkdXJhdGlvbiA9IGVsZW0uY29uZmlnLmR1cmF0aW9uXG4gICAgICAgIGNhbGxiYWNrICs9ICdSZXNldCdcbiAgICAgICAgYnJlYWtcbiAgICB9XG5cbiAgICAvLyBJZiBhIHRpbWVyIGlzIGFscmVhZHkgcnVubmluZywgY2FwdHVyZSB0aGUgZWxhcHNlZCB0aW1lIGFuZCBjbGVhciBpdC5cbiAgICBpZiAoZWxlbS50aW1lcikge1xuICAgICAgZWxhcHNlZCA9IE1hdGguYWJzKGVsZW0udGltZXIuc3RhcnRlZCAtIG5ldyBEYXRlKCkpXG4gICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KGVsZW0udGltZXIuY2xvY2spXG4gICAgfVxuXG4gICAgLy8gU3RhcnQgYSBuZXcgdGltZXIuXG4gICAgZWxlbS50aW1lciA9IHsgc3RhcnRlZDogbmV3IERhdGUoKSB9XG4gICAgZWxlbS50aW1lci5jbG9jayA9IHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIC8vIFRoZSB0aW1lciBjb21wbGV0ZWQsIHNvIGxldOKAmXMgZmlyZSB0aGUgY2FsbGJhY2sgYW5kIG51bGwgdGhlIHRpbWVyLlxuICAgICAgZWxlbS5jb25maWdbY2FsbGJhY2tdKGVsZW0uZG9tRWwpXG4gICAgICBlbGVtLnRpbWVyID0gbnVsbFxuICAgIH0sIGR1cmF0aW9uIC0gZWxhcHNlZClcbiAgfVxuXG4gIGZ1bmN0aW9uIF9zaG91bGRSZXZlYWwgKGVsZW0pIHtcbiAgICBpZiAoZWxlbS5zZXF1ZW5jZSkge1xuICAgICAgdmFyIHNlcXVlbmNlID0gc3Iuc2VxdWVuY2VzW2VsZW0uc2VxdWVuY2UuaWRdXG4gICAgICByZXR1cm4gc2VxdWVuY2UuYWN0aXZlICYmXG4gICAgICAgICFzZXF1ZW5jZS5ibG9ja2VkICYmXG4gICAgICAgICFlbGVtLnJldmVhbGluZyAmJlxuICAgICAgICAhZWxlbS5kaXNhYmxlZFxuICAgIH1cbiAgICByZXR1cm4gX2lzRWxlbVZpc2libGUoZWxlbSkgJiZcbiAgICAgICFlbGVtLnJldmVhbGluZyAmJlxuICAgICAgIWVsZW0uZGlzYWJsZWRcbiAgfVxuXG4gIGZ1bmN0aW9uIF9zaG91bGRVc2VEZWxheSAoZWxlbSkge1xuICAgIHZhciBjb25maWcgPSBlbGVtLmNvbmZpZy51c2VEZWxheVxuICAgIHJldHVybiBjb25maWcgPT09ICdhbHdheXMnIHx8XG4gICAgICAoY29uZmlnID09PSAnb25sb2FkJyAmJiAhc3IuaW5pdGlhbGl6ZWQpIHx8XG4gICAgICAoY29uZmlnID09PSAnb25jZScgJiYgIWVsZW0uc2VlbilcbiAgfVxuXG4gIGZ1bmN0aW9uIF9zaG91bGRSZXNldCAoZWxlbSkge1xuICAgIGlmIChlbGVtLnNlcXVlbmNlKSB7XG4gICAgICB2YXIgc2VxdWVuY2UgPSBzci5zZXF1ZW5jZXNbZWxlbS5zZXF1ZW5jZS5pZF1cbiAgICAgIHJldHVybiAhc2VxdWVuY2UuYWN0aXZlICYmXG4gICAgICAgIGVsZW0uY29uZmlnLnJlc2V0ICYmXG4gICAgICAgIGVsZW0ucmV2ZWFsaW5nICYmXG4gICAgICAgICFlbGVtLmRpc2FibGVkXG4gICAgfVxuICAgIHJldHVybiAhX2lzRWxlbVZpc2libGUoZWxlbSkgJiZcbiAgICAgIGVsZW0uY29uZmlnLnJlc2V0ICYmXG4gICAgICBlbGVtLnJldmVhbGluZyAmJlxuICAgICAgIWVsZW0uZGlzYWJsZWRcbiAgfVxuXG4gIGZ1bmN0aW9uIF9nZXRDb250YWluZXIgKGNvbnRhaW5lcikge1xuICAgIHJldHVybiB7XG4gICAgICB3aWR0aDogY29udGFpbmVyLmNsaWVudFdpZHRoLFxuICAgICAgaGVpZ2h0OiBjb250YWluZXIuY2xpZW50SGVpZ2h0XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gX2dldFNjcm9sbGVkIChjb250YWluZXIpIHtcbiAgICAvLyBSZXR1cm4gdGhlIGNvbnRhaW5lciBzY3JvbGwgdmFsdWVzLCBwbHVzIHRoZSBpdHMgb2Zmc2V0LlxuICAgIGlmIChjb250YWluZXIgJiYgY29udGFpbmVyICE9PSB3aW5kb3cuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KSB7XG4gICAgICB2YXIgb2Zmc2V0ID0gX2dldE9mZnNldChjb250YWluZXIpXG4gICAgICByZXR1cm4ge1xuICAgICAgICB4OiBjb250YWluZXIuc2Nyb2xsTGVmdCArIG9mZnNldC5sZWZ0LFxuICAgICAgICB5OiBjb250YWluZXIuc2Nyb2xsVG9wICsgb2Zmc2V0LnRvcFxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBPdGhlcndpc2UsIGRlZmF1bHQgdG8gdGhlIHdpbmRvdyBvYmplY3TigJlzIHNjcm9sbCB2YWx1ZXMuXG4gICAgICByZXR1cm4ge1xuICAgICAgICB4OiB3aW5kb3cucGFnZVhPZmZzZXQsXG4gICAgICAgIHk6IHdpbmRvdy5wYWdlWU9mZnNldFxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIF9nZXRPZmZzZXQgKGRvbUVsKSB7XG4gICAgdmFyIG9mZnNldFRvcCA9IDBcbiAgICB2YXIgb2Zmc2V0TGVmdCA9IDBcblxuICAgICAgLy8gR3JhYiB0aGUgZWxlbWVudOKAmXMgZGltZW5zaW9ucy5cbiAgICB2YXIgb2Zmc2V0SGVpZ2h0ID0gZG9tRWwub2Zmc2V0SGVpZ2h0XG4gICAgdmFyIG9mZnNldFdpZHRoID0gZG9tRWwub2Zmc2V0V2lkdGhcblxuICAgIC8vIE5vdyBjYWxjdWxhdGUgdGhlIGRpc3RhbmNlIGJldHdlZW4gdGhlIGVsZW1lbnQgYW5kIGl0cyBwYXJlbnQsIHRoZW5cbiAgICAvLyBhZ2FpbiBmb3IgdGhlIHBhcmVudCB0byBpdHMgcGFyZW50LCBhbmQgYWdhaW4gZXRjLi4uIHVudGlsIHdlIGhhdmUgdGhlXG4gICAgLy8gdG90YWwgZGlzdGFuY2Ugb2YgdGhlIGVsZW1lbnQgdG8gdGhlIGRvY3VtZW504oCZcyB0b3AgYW5kIGxlZnQgb3JpZ2luLlxuICAgIGRvIHtcbiAgICAgIGlmICghaXNOYU4oZG9tRWwub2Zmc2V0VG9wKSkge1xuICAgICAgICBvZmZzZXRUb3AgKz0gZG9tRWwub2Zmc2V0VG9wXG4gICAgICB9XG4gICAgICBpZiAoIWlzTmFOKGRvbUVsLm9mZnNldExlZnQpKSB7XG4gICAgICAgIG9mZnNldExlZnQgKz0gZG9tRWwub2Zmc2V0TGVmdFxuICAgICAgfVxuICAgICAgZG9tRWwgPSBkb21FbC5vZmZzZXRQYXJlbnRcbiAgICB9IHdoaWxlIChkb21FbClcblxuICAgIHJldHVybiB7XG4gICAgICB0b3A6IG9mZnNldFRvcCxcbiAgICAgIGxlZnQ6IG9mZnNldExlZnQsXG4gICAgICBoZWlnaHQ6IG9mZnNldEhlaWdodCxcbiAgICAgIHdpZHRoOiBvZmZzZXRXaWR0aFxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIF9pc0VsZW1WaXNpYmxlIChlbGVtKSB7XG4gICAgdmFyIG9mZnNldCA9IF9nZXRPZmZzZXQoZWxlbS5kb21FbClcbiAgICB2YXIgY29udGFpbmVyID0gX2dldENvbnRhaW5lcihlbGVtLmNvbmZpZy5jb250YWluZXIpXG4gICAgdmFyIHNjcm9sbGVkID0gX2dldFNjcm9sbGVkKGVsZW0uY29uZmlnLmNvbnRhaW5lcilcbiAgICB2YXIgdkYgPSBlbGVtLmNvbmZpZy52aWV3RmFjdG9yXG5cbiAgICAgIC8vIERlZmluZSB0aGUgZWxlbWVudCBnZW9tZXRyeS5cbiAgICB2YXIgZWxlbUhlaWdodCA9IG9mZnNldC5oZWlnaHRcbiAgICB2YXIgZWxlbVdpZHRoID0gb2Zmc2V0LndpZHRoXG4gICAgdmFyIGVsZW1Ub3AgPSBvZmZzZXQudG9wXG4gICAgdmFyIGVsZW1MZWZ0ID0gb2Zmc2V0LmxlZnRcbiAgICB2YXIgZWxlbUJvdHRvbSA9IGVsZW1Ub3AgKyBlbGVtSGVpZ2h0XG4gICAgdmFyIGVsZW1SaWdodCA9IGVsZW1MZWZ0ICsgZWxlbVdpZHRoXG5cbiAgICByZXR1cm4gY29uZmlybUJvdW5kcygpIHx8IGlzUG9zaXRpb25GaXhlZCgpXG5cbiAgICBmdW5jdGlvbiBjb25maXJtQm91bmRzICgpIHtcbiAgICAgIC8vIERlZmluZSB0aGUgZWxlbWVudOKAmXMgZnVuY3Rpb25hbCBib3VuZGFyaWVzIHVzaW5nIGl0cyB2aWV3IGZhY3Rvci5cbiAgICAgIHZhciB0b3AgPSBlbGVtVG9wICsgZWxlbUhlaWdodCAqIHZGXG4gICAgICB2YXIgbGVmdCA9IGVsZW1MZWZ0ICsgZWxlbVdpZHRoICogdkZcbiAgICAgIHZhciBib3R0b20gPSBlbGVtQm90dG9tIC0gZWxlbUhlaWdodCAqIHZGXG4gICAgICB2YXIgcmlnaHQgPSBlbGVtUmlnaHQgLSBlbGVtV2lkdGggKiB2RlxuXG4gICAgICAvLyBEZWZpbmUgdGhlIGNvbnRhaW5lciBmdW5jdGlvbmFsIGJvdW5kYXJpZXMgdXNpbmcgaXRzIHZpZXcgb2Zmc2V0LlxuICAgICAgdmFyIHZpZXdUb3AgPSBzY3JvbGxlZC55ICsgZWxlbS5jb25maWcudmlld09mZnNldC50b3BcbiAgICAgIHZhciB2aWV3TGVmdCA9IHNjcm9sbGVkLnggKyBlbGVtLmNvbmZpZy52aWV3T2Zmc2V0LmxlZnRcbiAgICAgIHZhciB2aWV3Qm90dG9tID0gc2Nyb2xsZWQueSAtIGVsZW0uY29uZmlnLnZpZXdPZmZzZXQuYm90dG9tICsgY29udGFpbmVyLmhlaWdodFxuICAgICAgdmFyIHZpZXdSaWdodCA9IHNjcm9sbGVkLnggLSBlbGVtLmNvbmZpZy52aWV3T2Zmc2V0LnJpZ2h0ICsgY29udGFpbmVyLndpZHRoXG5cbiAgICAgIHJldHVybiB0b3AgPCB2aWV3Qm90dG9tICYmXG4gICAgICAgIGJvdHRvbSA+IHZpZXdUb3AgJiZcbiAgICAgICAgbGVmdCA8IHZpZXdSaWdodCAmJlxuICAgICAgICByaWdodCA+IHZpZXdMZWZ0XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXNQb3NpdGlvbkZpeGVkICgpIHtcbiAgICAgIHJldHVybiAod2luZG93LmdldENvbXB1dGVkU3R5bGUoZWxlbS5kb21FbCkucG9zaXRpb24gPT09ICdmaXhlZCcpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFV0aWxpdGllc1xuICAgKiAtLS0tLS0tLS1cbiAgICovXG5cbiAgZnVuY3Rpb24gVG9vbHMgKCkge31cblxuICBUb29scy5wcm90b3R5cGUuaXNPYmplY3QgPSBmdW5jdGlvbiAob2JqZWN0KSB7XG4gICAgcmV0dXJuIG9iamVjdCAhPT0gbnVsbCAmJiB0eXBlb2Ygb2JqZWN0ID09PSAnb2JqZWN0JyAmJiBvYmplY3QuY29uc3RydWN0b3IgPT09IE9iamVjdFxuICB9XG5cbiAgVG9vbHMucHJvdG90eXBlLmlzTm9kZSA9IGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICByZXR1cm4gdHlwZW9mIHdpbmRvdy5Ob2RlID09PSAnb2JqZWN0J1xuICAgICAgPyBvYmplY3QgaW5zdGFuY2VvZiB3aW5kb3cuTm9kZVxuICAgICAgOiBvYmplY3QgJiYgdHlwZW9mIG9iamVjdCA9PT0gJ29iamVjdCcgJiZcbiAgICAgICAgdHlwZW9mIG9iamVjdC5ub2RlVHlwZSA9PT0gJ251bWJlcicgJiZcbiAgICAgICAgdHlwZW9mIG9iamVjdC5ub2RlTmFtZSA9PT0gJ3N0cmluZydcbiAgfVxuXG4gIFRvb2xzLnByb3RvdHlwZS5pc05vZGVMaXN0ID0gZnVuY3Rpb24gKG9iamVjdCkge1xuICAgIHZhciBwcm90b3R5cGVUb1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmplY3QpXG4gICAgdmFyIHJlZ2V4ID0gL15cXFtvYmplY3QgKEhUTUxDb2xsZWN0aW9ufE5vZGVMaXN0fE9iamVjdClcXF0kL1xuXG4gICAgcmV0dXJuIHR5cGVvZiB3aW5kb3cuTm9kZUxpc3QgPT09ICdvYmplY3QnXG4gICAgICA/IG9iamVjdCBpbnN0YW5jZW9mIHdpbmRvdy5Ob2RlTGlzdFxuICAgICAgOiBvYmplY3QgJiYgdHlwZW9mIG9iamVjdCA9PT0gJ29iamVjdCcgJiZcbiAgICAgICAgcmVnZXgudGVzdChwcm90b3R5cGVUb1N0cmluZykgJiZcbiAgICAgICAgdHlwZW9mIG9iamVjdC5sZW5ndGggPT09ICdudW1iZXInICYmXG4gICAgICAgIChvYmplY3QubGVuZ3RoID09PSAwIHx8IHRoaXMuaXNOb2RlKG9iamVjdFswXSkpXG4gIH1cblxuICBUb29scy5wcm90b3R5cGUuZm9yT3duID0gZnVuY3Rpb24gKG9iamVjdCwgY2FsbGJhY2spIHtcbiAgICBpZiAoIXRoaXMuaXNPYmplY3Qob2JqZWN0KSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgXCJvYmplY3RcIiwgYnV0IHJlY2VpdmVkIFwiJyArIHR5cGVvZiBvYmplY3QgKyAnXCIuJylcbiAgICB9IGVsc2Uge1xuICAgICAgZm9yICh2YXIgcHJvcGVydHkgaW4gb2JqZWN0KSB7XG4gICAgICAgIGlmIChvYmplY3QuaGFzT3duUHJvcGVydHkocHJvcGVydHkpKSB7XG4gICAgICAgICAgY2FsbGJhY2socHJvcGVydHkpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBUb29scy5wcm90b3R5cGUuZXh0ZW5kID0gZnVuY3Rpb24gKHRhcmdldCwgc291cmNlKSB7XG4gICAgdGhpcy5mb3JPd24oc291cmNlLCBmdW5jdGlvbiAocHJvcGVydHkpIHtcbiAgICAgIGlmICh0aGlzLmlzT2JqZWN0KHNvdXJjZVtwcm9wZXJ0eV0pKSB7XG4gICAgICAgIGlmICghdGFyZ2V0W3Byb3BlcnR5XSB8fCAhdGhpcy5pc09iamVjdCh0YXJnZXRbcHJvcGVydHldKSkge1xuICAgICAgICAgIHRhcmdldFtwcm9wZXJ0eV0gPSB7fVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuZXh0ZW5kKHRhcmdldFtwcm9wZXJ0eV0sIHNvdXJjZVtwcm9wZXJ0eV0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0YXJnZXRbcHJvcGVydHldID0gc291cmNlW3Byb3BlcnR5XVxuICAgICAgfVxuICAgIH0uYmluZCh0aGlzKSlcbiAgICByZXR1cm4gdGFyZ2V0XG4gIH1cblxuICBUb29scy5wcm90b3R5cGUuZXh0ZW5kQ2xvbmUgPSBmdW5jdGlvbiAodGFyZ2V0LCBzb3VyY2UpIHtcbiAgICByZXR1cm4gdGhpcy5leHRlbmQodGhpcy5leHRlbmQoe30sIHRhcmdldCksIHNvdXJjZSlcbiAgfVxuXG4gIFRvb2xzLnByb3RvdHlwZS5pc01vYmlsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gL0FuZHJvaWR8d2ViT1N8aVBob25lfGlQYWR8aVBvZHxCbGFja0JlcnJ5fElFTW9iaWxlfE9wZXJhIE1pbmkvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpXG4gIH1cblxuICAvKipcbiAgICogUG9seWZpbGxzXG4gICAqIC0tLS0tLS0tXG4gICAqL1xuXG4gIF9yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgIHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGNhbGxiYWNrLCAxMDAwIC8gNjApXG4gICAgfVxuXG4gIC8qKlxuICAgKiBNb2R1bGUgV3JhcHBlclxuICAgKiAtLS0tLS0tLS0tLS0tLVxuICAgKi9cbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGRlZmluZS5hbWQgPT09ICdvYmplY3QnICYmIGRlZmluZS5hbWQpIHtcbiAgICBkZWZpbmUoZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIFNjcm9sbFJldmVhbFxuICAgIH0pXG4gIH0gZWxzZSBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFNjcm9sbFJldmVhbFxuICB9IGVsc2Uge1xuICAgIHdpbmRvdy5TY3JvbGxSZXZlYWwgPSBTY3JvbGxSZXZlYWxcbiAgfVxufSkoKTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4uL25vZGVfbW9kdWxlcy9zY3JvbGxyZXZlYWwvZGlzdC9zY3JvbGxyZXZlYWwuanNcbi8vIG1vZHVsZSBpZCA9IDFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyohIHNtb290aC1zY3JvbGwgdjEyLjEuNSB8IChjKSAyMDE3IENocmlzIEZlcmRpbmFuZGkgfCBNSVQgTGljZW5zZSB8IGh0dHA6Ly9naXRodWIuY29tL2NmZXJkaW5hbmRpL3Ntb290aC1zY3JvbGwgKi9cbiEoZnVuY3Rpb24oZSx0KXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFtdLChmdW5jdGlvbigpe3JldHVybiB0KGUpfSkpOlwib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzP21vZHVsZS5leHBvcnRzPXQoZSk6ZS5TbW9vdGhTY3JvbGw9dChlKX0pKFwidW5kZWZpbmVkXCIhPXR5cGVvZiBnbG9iYWw/Z2xvYmFsOlwidW5kZWZpbmVkXCIhPXR5cGVvZiB3aW5kb3c/d2luZG93OnRoaXMsKGZ1bmN0aW9uKGUpe1widXNlIHN0cmljdFwiO3ZhciB0PVwicXVlcnlTZWxlY3RvclwiaW4gZG9jdW1lbnQmJlwiYWRkRXZlbnRMaXN0ZW5lclwiaW4gZSYmXCJyZXF1ZXN0QW5pbWF0aW9uRnJhbWVcImluIGUmJlwiY2xvc2VzdFwiaW4gZS5FbGVtZW50LnByb3RvdHlwZSxuPXtpZ25vcmU6XCJbZGF0YS1zY3JvbGwtaWdub3JlXVwiLGhlYWRlcjpudWxsLHNwZWVkOjUwMCxvZmZzZXQ6MCxlYXNpbmc6XCJlYXNlSW5PdXRDdWJpY1wiLGN1c3RvbUVhc2luZzpudWxsLGJlZm9yZTpmdW5jdGlvbigpe30sYWZ0ZXI6ZnVuY3Rpb24oKXt9fSxvPWZ1bmN0aW9uKCl7Zm9yKHZhciBlPXt9LHQ9MCxuPWFyZ3VtZW50cy5sZW5ndGg7dDxuO3QrKyl7dmFyIG89YXJndW1lbnRzW3RdOyEoZnVuY3Rpb24odCl7Zm9yKHZhciBuIGluIHQpdC5oYXNPd25Qcm9wZXJ0eShuKSYmKGVbbl09dFtuXSl9KShvKX1yZXR1cm4gZX0sYT1mdW5jdGlvbih0KXtyZXR1cm4gcGFyc2VJbnQoZS5nZXRDb21wdXRlZFN0eWxlKHQpLmhlaWdodCwxMCl9LHI9ZnVuY3Rpb24oZSl7XCIjXCI9PT1lLmNoYXJBdCgwKSYmKGU9ZS5zdWJzdHIoMSkpO2Zvcih2YXIgdCxuPVN0cmluZyhlKSxvPW4ubGVuZ3RoLGE9LTEscj1cIlwiLGk9bi5jaGFyQ29kZUF0KDApOysrYTxvOyl7aWYoMD09PSh0PW4uY2hhckNvZGVBdChhKSkpdGhyb3cgbmV3IEludmFsaWRDaGFyYWN0ZXJFcnJvcihcIkludmFsaWQgY2hhcmFjdGVyOiB0aGUgaW5wdXQgY29udGFpbnMgVSswMDAwLlwiKTt0Pj0xJiZ0PD0zMXx8MTI3PT10fHwwPT09YSYmdD49NDgmJnQ8PTU3fHwxPT09YSYmdD49NDgmJnQ8PTU3JiY0NT09PWk/cis9XCJcXFxcXCIrdC50b1N0cmluZygxNikrXCIgXCI6cis9dD49MTI4fHw0NT09PXR8fDk1PT09dHx8dD49NDgmJnQ8PTU3fHx0Pj02NSYmdDw9OTB8fHQ+PTk3JiZ0PD0xMjI/bi5jaGFyQXQoYSk6XCJcXFxcXCIrbi5jaGFyQXQoYSl9cmV0dXJuXCIjXCIrcn0saT1mdW5jdGlvbihlLHQpe3ZhciBuO3JldHVyblwiZWFzZUluUXVhZFwiPT09ZS5lYXNpbmcmJihuPXQqdCksXCJlYXNlT3V0UXVhZFwiPT09ZS5lYXNpbmcmJihuPXQqKDItdCkpLFwiZWFzZUluT3V0UXVhZFwiPT09ZS5lYXNpbmcmJihuPXQ8LjU/Mip0KnQ6KDQtMip0KSp0LTEpLFwiZWFzZUluQ3ViaWNcIj09PWUuZWFzaW5nJiYobj10KnQqdCksXCJlYXNlT3V0Q3ViaWNcIj09PWUuZWFzaW5nJiYobj0tLXQqdCp0KzEpLFwiZWFzZUluT3V0Q3ViaWNcIj09PWUuZWFzaW5nJiYobj10PC41PzQqdCp0KnQ6KHQtMSkqKDIqdC0yKSooMip0LTIpKzEpLFwiZWFzZUluUXVhcnRcIj09PWUuZWFzaW5nJiYobj10KnQqdCp0KSxcImVhc2VPdXRRdWFydFwiPT09ZS5lYXNpbmcmJihuPTEtIC0tdCp0KnQqdCksXCJlYXNlSW5PdXRRdWFydFwiPT09ZS5lYXNpbmcmJihuPXQ8LjU/OCp0KnQqdCp0OjEtOCotLXQqdCp0KnQpLFwiZWFzZUluUXVpbnRcIj09PWUuZWFzaW5nJiYobj10KnQqdCp0KnQpLFwiZWFzZU91dFF1aW50XCI9PT1lLmVhc2luZyYmKG49MSstLXQqdCp0KnQqdCksXCJlYXNlSW5PdXRRdWludFwiPT09ZS5lYXNpbmcmJihuPXQ8LjU/MTYqdCp0KnQqdCp0OjErMTYqLS10KnQqdCp0KnQpLGUuY3VzdG9tRWFzaW5nJiYobj1lLmN1c3RvbUVhc2luZyh0KSksbnx8dH0sdT1mdW5jdGlvbigpe3JldHVybiBNYXRoLm1heChkb2N1bWVudC5ib2R5LnNjcm9sbEhlaWdodCxkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsSGVpZ2h0LGRvY3VtZW50LmJvZHkub2Zmc2V0SGVpZ2h0LGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5vZmZzZXRIZWlnaHQsZG9jdW1lbnQuYm9keS5jbGllbnRIZWlnaHQsZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCl9LGM9ZnVuY3Rpb24oZSx0LG4pe3ZhciBvPTA7aWYoZS5vZmZzZXRQYXJlbnQpZG97bys9ZS5vZmZzZXRUb3AsZT1lLm9mZnNldFBhcmVudH13aGlsZShlKTtyZXR1cm4gbz1NYXRoLm1heChvLXQtbiwwKX0scz1mdW5jdGlvbihlKXtyZXR1cm4gZT9hKGUpK2Uub2Zmc2V0VG9wOjB9LGw9ZnVuY3Rpb24odCxuLG8pe298fCh0LmZvY3VzKCksZG9jdW1lbnQuYWN0aXZlRWxlbWVudC5pZCE9PXQuaWQmJih0LnNldEF0dHJpYnV0ZShcInRhYmluZGV4XCIsXCItMVwiKSx0LmZvY3VzKCksdC5zdHlsZS5vdXRsaW5lPVwibm9uZVwiKSxlLnNjcm9sbFRvKDAsbikpfSxmPWZ1bmN0aW9uKHQpe3JldHVybiEhKFwibWF0Y2hNZWRpYVwiaW4gZSYmZS5tYXRjaE1lZGlhKFwiKHByZWZlcnMtcmVkdWNlZC1tb3Rpb24pXCIpLm1hdGNoZXMpfTtyZXR1cm4gZnVuY3Rpb24oYSxkKXt2YXIgbSxoLGcscCx2LGIseSxTPXt9O1MuY2FuY2VsU2Nyb2xsPWZ1bmN0aW9uKCl7Y2FuY2VsQW5pbWF0aW9uRnJhbWUoeSl9LFMuYW5pbWF0ZVNjcm9sbD1mdW5jdGlvbih0LGEscil7dmFyIGY9byhtfHxuLHJ8fHt9KSxkPVwiW29iamVjdCBOdW1iZXJdXCI9PT1PYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodCksaD1kfHwhdC50YWdOYW1lP251bGw6dDtpZihkfHxoKXt2YXIgZz1lLnBhZ2VZT2Zmc2V0O2YuaGVhZGVyJiYhcCYmKHA9ZG9jdW1lbnQucXVlcnlTZWxlY3RvcihmLmhlYWRlcikpLHZ8fCh2PXMocCkpO3ZhciBiLHksRSxJPWQ/dDpjKGgsdixwYXJzZUludChcImZ1bmN0aW9uXCI9PXR5cGVvZiBmLm9mZnNldD9mLm9mZnNldCgpOmYub2Zmc2V0LDEwKSksTz1JLWcsQT11KCksQz0wLHc9ZnVuY3Rpb24obixvKXt2YXIgcj1lLnBhZ2VZT2Zmc2V0O2lmKG49PW98fHI9PW98fChnPG8mJmUuaW5uZXJIZWlnaHQrcik+PUEpcmV0dXJuIFMuY2FuY2VsU2Nyb2xsKCksbCh0LG8sZCksZi5hZnRlcih0LGEpLGI9bnVsbCwhMH0sUT1mdW5jdGlvbih0KXtifHwoYj10KSxDKz10LWIseT1DL3BhcnNlSW50KGYuc3BlZWQsMTApLHk9eT4xPzE6eSxFPWcrTyppKGYseSksZS5zY3JvbGxUbygwLE1hdGguZmxvb3IoRSkpLHcoRSxJKXx8KGUucmVxdWVzdEFuaW1hdGlvbkZyYW1lKFEpLGI9dCl9OzA9PT1lLnBhZ2VZT2Zmc2V0JiZlLnNjcm9sbFRvKDAsMCksZi5iZWZvcmUodCxhKSxTLmNhbmNlbFNjcm9sbCgpLGUucmVxdWVzdEFuaW1hdGlvbkZyYW1lKFEpfX07dmFyIEU9ZnVuY3Rpb24oZSl7aCYmKGguaWQ9aC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXNjcm9sbC1pZFwiKSxTLmFuaW1hdGVTY3JvbGwoaCxnKSxoPW51bGwsZz1udWxsKX0sST1mdW5jdGlvbih0KXtpZighZigpJiYwPT09dC5idXR0b24mJiF0Lm1ldGFLZXkmJiF0LmN0cmxLZXkmJihnPXQudGFyZ2V0LmNsb3Nlc3QoYSkpJiZcImFcIj09PWcudGFnTmFtZS50b0xvd2VyQ2FzZSgpJiYhdC50YXJnZXQuY2xvc2VzdChtLmlnbm9yZSkmJmcuaG9zdG5hbWU9PT1lLmxvY2F0aW9uLmhvc3RuYW1lJiZnLnBhdGhuYW1lPT09ZS5sb2NhdGlvbi5wYXRobmFtZSYmLyMvLnRlc3QoZy5ocmVmKSl7dmFyIG47dHJ5e249cihkZWNvZGVVUklDb21wb25lbnQoZy5oYXNoKSl9Y2F0Y2goZSl7bj1yKGcuaGFzaCl9aWYoXCIjXCI9PT1uKXt0LnByZXZlbnREZWZhdWx0KCksaD1kb2N1bWVudC5ib2R5O3ZhciBvPWguaWQ/aC5pZDpcInNtb290aC1zY3JvbGwtdG9wXCI7cmV0dXJuIGguc2V0QXR0cmlidXRlKFwiZGF0YS1zY3JvbGwtaWRcIixvKSxoLmlkPVwiXCIsdm9pZChlLmxvY2F0aW9uLmhhc2guc3Vic3RyaW5nKDEpPT09bz9FKCk6ZS5sb2NhdGlvbi5oYXNoPW8pfWg9ZG9jdW1lbnQucXVlcnlTZWxlY3RvcihuKSxoJiYoaC5zZXRBdHRyaWJ1dGUoXCJkYXRhLXNjcm9sbC1pZFwiLGguaWQpLGguaWQ9XCJcIixnLmhhc2g9PT1lLmxvY2F0aW9uLmhhc2gmJih0LnByZXZlbnREZWZhdWx0KCksRSgpKSl9fSxPPWZ1bmN0aW9uKGUpe2J8fChiPXNldFRpbWVvdXQoKGZ1bmN0aW9uKCl7Yj1udWxsLHY9cyhwKX0pLDY2KSl9O3JldHVybiBTLmRlc3Ryb3k9ZnVuY3Rpb24oKXttJiYoZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsSSwhMSksZS5yZW1vdmVFdmVudExpc3RlbmVyKFwicmVzaXplXCIsTywhMSksUy5jYW5jZWxTY3JvbGwoKSxtPW51bGwsaD1udWxsLGc9bnVsbCxwPW51bGwsdj1udWxsLGI9bnVsbCx5PW51bGwpfSxTLmluaXQ9ZnVuY3Rpb24oYSl7dCYmKFMuZGVzdHJveSgpLG09byhuLGF8fHt9KSxwPW0uaGVhZGVyP2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3IobS5oZWFkZXIpOm51bGwsdj1zKHApLGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLEksITEpLGUuYWRkRXZlbnRMaXN0ZW5lcihcImhhc2hjaGFuZ2VcIixFLCExKSxwJiZlLmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIixPLCExKSl9LFMuaW5pdChkKSxTfX0pKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuLi9ub2RlX21vZHVsZXMvc21vb3RoLXNjcm9sbC9kaXN0L2pzL3Ntb290aC1zY3JvbGwubWluLmpzXG4vLyBtb2R1bGUgaWQgPSAyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBnO1xyXG5cclxuLy8gVGhpcyB3b3JrcyBpbiBub24tc3RyaWN0IG1vZGVcclxuZyA9IChmdW5jdGlvbigpIHtcclxuXHRyZXR1cm4gdGhpcztcclxufSkoKTtcclxuXHJcbnRyeSB7XHJcblx0Ly8gVGhpcyB3b3JrcyBpZiBldmFsIGlzIGFsbG93ZWQgKHNlZSBDU1ApXHJcblx0ZyA9IGcgfHwgRnVuY3Rpb24oXCJyZXR1cm4gdGhpc1wiKSgpIHx8ICgxLGV2YWwpKFwidGhpc1wiKTtcclxufSBjYXRjaChlKSB7XHJcblx0Ly8gVGhpcyB3b3JrcyBpZiB0aGUgd2luZG93IHJlZmVyZW5jZSBpcyBhdmFpbGFibGVcclxuXHRpZih0eXBlb2Ygd2luZG93ID09PSBcIm9iamVjdFwiKVxyXG5cdFx0ZyA9IHdpbmRvdztcclxufVxyXG5cclxuLy8gZyBjYW4gc3RpbGwgYmUgdW5kZWZpbmVkLCBidXQgbm90aGluZyB0byBkbyBhYm91dCBpdC4uLlxyXG4vLyBXZSByZXR1cm4gdW5kZWZpbmVkLCBpbnN0ZWFkIG9mIG5vdGhpbmcgaGVyZSwgc28gaXQnc1xyXG4vLyBlYXNpZXIgdG8gaGFuZGxlIHRoaXMgY2FzZS4gaWYoIWdsb2JhbCkgeyAuLi59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGc7XHJcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4uL25vZGVfbW9kdWxlcy93ZWJwYWNrL2J1aWxkaW4vZ2xvYmFsLmpzXG4vLyBtb2R1bGUgaWQgPSAzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIHJlbW92ZWQgYnkgZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zY3NzL3N0eWxlLnNjc3Ncbi8vIG1vZHVsZSBpZCA9IDRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIl0sInNvdXJjZVJvb3QiOiIifQ==