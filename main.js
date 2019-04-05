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
  radius: 25,
};

const stretchDuration = 750;

window.onload = () => {
  const body = d3.select('body').node();
  const svg = d3.select('svg');
  const media = d3.select('audio#stretch-sound').node();

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

  // const g = svg.append('g')
  //     .attr('clip-path', 'url(#clip-1)');

  // g.append('rect')
  //     .attr('x', 0)
  //     .attr('y', 0)
  //     .attr('width', s.width)
  //     .attr('height', s.height)
  //     .attr('fill', colors.next());

  // Define circle for multiple uses
  svg.select('defs')
    .append('circle')
      .attr('id', 'circle-1')
      .attr('cx', 100)
      .attr('cy', 100)
      .attr('r', 25);

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

  svg.on('click', function (d,i,nodes) {
    console.group('click:');
    // console.log('Event listener attached to:');
    // console.log(this);
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
      media.play();

      s.level++;
      s.radius = s.radius - 0.25;
      const stretchTransition = d3.transition()
          .duration(stretchDuration)
          .ease(d3.easeBackOut.overshoot(0.5));

      // Append a new circle to be <use>d
      const newCoords = getCoordsWithinCircle(s.width/2, s.height/2, d3.select(clickedURL).attr('r') * scaleFactor);
      const clipCX = newCoords.x;
      const clipCY = newCoords.y;
      d3.select('defs')
        .append('circle')
          .attr('id', 'circle-' + s.level)
          .attr('cx', clipCX)
          .attr('cy', clipCY)
          .attr('r', s.radius);

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
        .attr('transform', `translate(${s.width/2 - cx}, ${s.height/2 - cy}) translate(${cx}, ${cy}) scale(${scaleFactor}) translate(-${cx}, -${cy})`);

      // Append a nested g containing a rect and a circle for gradient/shading
      // const nestedGroup = clickedGroup.append('g')
      //     .attr('clip-path', 'url(#clip-' + s.level + ')');
      //
      // nestedGroup.append('rect')
      //     .attr('x', 0)
      //     .attr('y', 0)
      //     .attr('width', s.width)
      //     .attr('height', s.height)
      //     .attr('fill', colors.next());
      //
      // nestedGroup.append('circle')
      //     .attr('cx', clipCX)
      //     .attr('cy', clipCY)
      //     .attr('r', s.radius)
      //     .attr('fill', 'url(#gradient-1)');
    }
  });
};

/**************
Helper Functions
**************/

// Copied from MDN
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#Getting_a_random_integer_between_two_values_inclusive
function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
}

// TODO: is it risky to use recursion here at all?
/*
* Returns an object with an x and y value that lies within a circle defined by
* cx, cy, and r
*/
function getCoordsWithinCircle(cx, cy, r) {
  const minX = cx - (Math.random() * r);
  const maxX = cx + (Math.random() * r);
  const minY = cy - (Math.random() * r);
  const maxY = cy + (Math.random() * r);

  let x = getRandomIntInclusive(minX, maxX);
  let y = getRandomIntInclusive(minY, maxY);

  const leftSide = Math.pow(x - cx, 2) + Math.pow(y - cy, 2);
  const rightSide = Math.pow(r, 2);
  if (leftSide <= rightSide) {
    return {x: x, y: y};
  } else {
    return getCoordsWithinCircle(cx, cy, r);
  }
}
