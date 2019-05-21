//TODO: enable media to play on top of each
const colors = {
  rainbow: [
    '#217C8D', // carpet green
    '#834845', // dark pink
    '#8D1003', // chuckie orange
    '#77628A', // hairtie purple
    '#4A1F6C', // purple
    '#779DAE', // tommy blue
  ],
  index: 2,
  next: function() {
    const modulatedIndex = this.index % this.rainbow.length;
    this.index++;
    return this.rainbow[modulatedIndex];
  }
}

// state object
const s = {
  level: 1,
  width: 300,
  height: 200,
  radius: 50,
};

const stretchDuration = 750;
const stretchIncrement = 0.25;

window.onload = () => {
  const body = d3.select('body').node();
  const svg = d3.select('svg#stretch-dreams');
  const enterButton = d3.select('#enter-btn');
  const infoButton = d3.select('#info-btn');
  const soundButton = d3.select('#sound-btn');
  const landingContainer = d3.select('#landing-container');
  const media = d3.select('audio#stretch-sound').node();
  const ambience = d3.select('audio#ambience').node();

  // Set svg to size of body
  // which should 100% of viewport (100vw and 100vh)
  s.width = body.clientWidth;
  s.height = body.clientHeight;
  svg
      .attr('height', s.height + 'px')
      .attr('width', s.width + 'px');

  // scaleFactor should stay constant regardless of later changes to s.radius
  const scaleFactor = Math.max(s.width, s.height) / (s.radius * 2);

  // Add "background"
  svg.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', s.width)
      .attr('height', s.height)
      .attr('fill', colors.next());

  // Define circle for multiple uses
  svg.select('defs')
    .append('circle')
      .attr('id', 'circle-1')
      .attr('cx', s.width/2)
      .attr('cy', s.height/2)
      .attr('r', s.radius);

  // Append a <g>
  const g = svg.append('g')
      .attr('id', 'group-1');

  // Append a solid shape <use>ing the circle
  g.append('use')
      .attr('href', '#circle-1')
      .attr('xlink:href', '#circle-1')
      .attr('fill', colors.next());

  // Append a gradient shape <use>ing the circle
  g.append('use')
      .attr('href', '#circle-1')
      .attr('xlink:href', '#circle-1')
      .attr('fill', 'url(#gradient-1)');

  // Append a clipPath <use>ing the circle
  svg.select('defs')
    .append('clipPath')
      .attr('id', 'clip-1')
    .append('use')
      .attr('href', '#circle-1')
      .attr('xlink:href', '#circle-1');

  // Display visuals and audio when enter button is clicked
  enterButton.on('click', async function() {
    // Attempt to play ambience
    ambience.volume = 0.8;
    asyncPlay(ambience);

    landingContainer.transition()
      .style('background-color', 'rgba(0,0,0,0)')
      .style('color', 'rgba(255,255,255,0)')
      .on('end', function(d, i) {
        d3.select(this).transition()
            .style('display', 'none');
      });
  });

  // Helper function
  function showHideInfo() {
    const creditsContainer = d3.select('#credits-container');
    const innerContainer = d3.select('#inner-credits-container');
    if (creditsContainer.classed('shown')) {
      d3.selectAll('.credits').classed('shown', false);
      ambience.volume = 0.8;
    } else {
      d3.selectAll('.credits').classed('shown', true);
      ambience.volume = 0.3;
    }
  }

  // Show or hide info when either info button is clicked or Escape is pressed
  infoButton.on('click', showHideInfo);

  body.addEventListener('keyup', function(event) {
    if (event.key == "Escape" || event.key == "Esc") {
      showHideInfo();
    }
  });

  // Helper function
  function swapActiveIcon(active, inactive) {
    active.classed('active-icon', false)
    active.classed('inactive-icon', true)
    inactive.classed('active-icon', true)
    inactive.classed('inactive-icon', false)
  }

  // Pause/play audio when sound button is clicked
  soundButton.on('click', function() {
    const active = soundButton.select('svg.active-icon');
    const inactive = soundButton.select('svg.inactive-icon');

    if (active.attr('id') === 'icon-unmuted') {
      console.log('clicked unmuted icon, muting audio');
      ambience.pause()
      media.volume = 0;
      swapActiveIcon(active, inactive);
    } else {
      console.log('clicked muted icon, unmuting audio');
      ambience.play()
      media.volume = 1;
      swapActiveIcon(active, inactive);
    }
  });

  /*
  From MDN's example for Page Visibility API.
  https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API#Example
  */
  // Set the name of the hidden property and the change event for visibility
  let hidden, visibilityChange;
  if (typeof document.hidden !== 'undefined') { // Opera 12.10 and Firefox 18 and later support
    hidden = 'hidden';
    visibilityChange = 'visibilitychange';
  } else if (typeof document.msHidden !== 'undefined') {
    hidden = 'msHidden';
    visibilityChange = 'msvisibilitychange';
  } else if (typeof document.webkitHidden !== 'undefined') {
    hidden = 'webkitHidden';
    visibilityChange = 'webkitvisibilitychange';
  }

  // Pause/play audio when tab is visible/not visible
  document.addEventListener(visibilityChange, function () {
    if (document[hidden]) {
      ambience.pause();
    } else {
      ambience.play();
    }
  });

  // Main game mechanic when main svg is clicked
  svg.on('click', function (d,i,nodes) {
    console.group('click:');
    console.log('Event target (what was clicked):');
    console.log(d3.event.target);
    console.log('Event target\'s parent:');
    console.log(d3.event.target.parentNode);
    console.groupEnd();

    const clicked = d3.select(d3.event.target);
    const clickedGroup = d3.select(d3.event.target.parentNode);
    const clickedURL = clicked.attr('href');
    // If clickedURL is '#circle-3', then clickedLevel is '3'
    const clickedLevel = clickedURL ? clickedURL.match(/\d+/)[0] : undefined;

    // If target is a <use> and it's linked circle matches the current level, increase its radius
    // AKA If you clicked the latest sphincter...
    if (clicked.node().tagName === 'use' && clickedLevel == s.level) {
      console.log(`<use> found with href ${clickedURL}. Expanding and adding another layer...`);
      media.currentTime = 0;
      media.play();

      s.level++;
      s.radius = s.radius - 0.25;
      const stretchTransition = d3.transition()
          .duration(stretchDuration)
          .ease(d3.easeBackOut.overshoot(0.5));

      const entranceTransition = d3.transition()
          .duration(stretchDuration)
          .ease(d3.easeBackOut.overshoot(0));

      // Append a new circle to be <use>d
      // if circle was scaled up by scaleFactor, its radius increased by srqt(1/2) * scaleFactor
      const sqrtOfHalf = Math.sqrt(1/2);
      const newCoords = getCoordsWithinCircle(s.width/2, s.height/2, d3.select(clickedURL).attr('r') * scaleFactor * sqrtOfHalf, s.width/5);
      const clipCX = newCoords.x;
      const clipCY = newCoords.y;
      const fromCenterX = s.width/2 - clipCX;
      const fromCenterY = s.height/2 - clipCY;

      d3.select('defs')
        .append('circle')
          .attr('id', 'circle-' + s.level)
          .attr('cx', clipCX)
          .attr('cy', clipCY)
          .attr('r', s.radius)
          // Start it off small and farther away from center
          .attr('transform', `translate(${-fromCenterX},${-fromCenterY}) translate(${clipCX}, ${clipCY}) scale(${0.3}) translate(${-clipCX}, ${-clipCY})`)
        .transition(entranceTransition)
          .attr('transform', '');

      // Append a new clipPath <use>ing the new circle
      svg.select('defs')
        .append('clipPath')
          .attr('id', 'clip-' + s.level)
        .append('use')
          .attr('href', '#circle-' + s.level)
          .attr('xlink:href', '#circle-' + s.level);

      // Append a g, clipped by the previous circle
      const g = svg.append('g')
          .attr('id', 'group-' + s.level)
          .attr('clip-path', `url(#clip-${s.level - 1})`);

      // Append a solid shape <use>ing the new circle
      g.append('use')
          .attr('href', '#circle-' + s.level)
          .attr('xlink:href', '#circle-' + s.level)
          .attr('fill', colors.next());

      // Append a gradient shape <use>ing the new circle
      g.append('use')
          .attr('href', '#circle-' + s.level)
          .attr('xlink:href', '#circle-' + s.level)
          .attr('fill', 'url(#gradient-1)');


      // Scale up previous circle. It should scale up all elements <use>ing it
      const usedCircle = d3.select(clickedURL);
      const cx = usedCircle.attr('cx');
      const cy = usedCircle.attr('cy');

      usedCircle
        .transition(stretchTransition)
        .attr('transform', `translate(${s.width/2 - cx}, ${s.height/2 - cy}) translate(${cx}, ${cy}) scale(${scaleFactor}) translate(${-cx}, ${-cy})`);

      // Incrementally stretch all circles except the latest circle
      svg.selectAll('defs circle')
        // Filter out any circle:
        // - that is the currently clicked level
        // - with no transform attribute
        // - with a transform attribute but no scale transformation
        .filter(function(d,i,nodes) {
          if ('#' + this.getAttribute('id') === clickedURL) { return false; }
          const transform = this.getAttribute('transform');
          if (!transform) { return false; }
          const matchesArr = this.getAttribute('transform').match(/scale\(([\d\.,]*)\)/);
          return matchesArr[1];
        })
        .transition(stretchTransition)
          .attr('transform', function(d, i, nodes) {
            const cx = this.getAttribute('cx');
            const cy = this.getAttribute('cy');
            const r = this.getAttribute('r');
            const transform = this.getAttribute('transform');
            const matchesArr = transform.match(/scale\(([\d\.,]*)\)/);
            const currentScale = parseFloat(matchesArr[1]);
            return `translate(${s.width/2 - cx}, ${s.height/2 - cy}) translate(${cx}, ${cy}) scale(${currentScale+stretchIncrement}) translate(${-cx}, ${-cy})`;
          })
    }
  });
};

/**************
Helper Functions
**************/

/*
* Returns an object with an x and y value that lies within a circle defined by
* cx, cy, and r
*/
function getCoordsWithinCircle(cx, cy, r, padding) {
  const newR = (r-padding) * Math.sqrt(Math.random());
  const theta = Math.random() * 2 * Math.PI;
  const newX = cx + newR * Math.cos(theta);
  const newY = cy + newR * Math.sin(theta);
  return {x: newX, y: newY};
}

/*
 * Calls .play() on a HTMLMediaElement
 * Calls successFn if returned promise resolves
 * Calls failureFn if returned promise errs
*/
async function asyncPlay(node, successFn, failureFn) {
  try {
    await node.play();
    console.log('play successful!');
    if (successFn) { successFn(); }
 } catch(err) {
    console.log(`play unsuccessful: ${err}`);
    if (failureFn) { failureFn(); }
  };
}
