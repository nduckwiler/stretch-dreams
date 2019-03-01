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

// scaleFactor should stay constant regardless of later changes to s.radius
const scaleFactor = Math.max(s.width, s.height) / (s.radius * 2);
const stretchDuration = 750;

window.onload = () => {
  const media = d3.select('audio#stretch-sound').node();

  d3.select('svg')
      .attr('height', s.height + 'px')
      .attr('width', s.width + 'px');

  d3.select('svg').on('click', function (d,i,nodes) {
    console.group('click:');
    // console.log('Event listener attached to:');
    // console.log(this);
    console.log('Event target (what was clicked):');
    console.log(d3.event.target);
    console.log('Event target\'s parent:');
    console.log(d3.event.target.parentNode);
    console.groupEnd();

    const clickedGroup = d3.select(d3.event.target.parentNode);
    const clipPathURL = clickedGroup.attr('clip-path');
    // If clipPathURL is 'url(#clip-3)', then clipPathLevel is '3'
    const clipPathLevel = clipPathURL ? clipPathURL.match(/\d+/)[0] : undefined;

    // If target's parent has clipPath and it matches the current level, increase its radius
    // AKA If you clicked the latest sphincter...
    if (clipPathURL && clipPathLevel == s.level) {
      console.log(`clip path found with url ${clipPathURL}. Expanding and adding another layer...`);
      media.play();

      s.level++;
      s.radius = s.radius - 0.25;
      const stretchTransition = d3.transition()
          .duration(stretchDuration)
          .ease(d3.easeBackOut.overshoot(0.5));

      const openParenIndex = clipPathURL.indexOf('(');
      const closeParenIndex = clipPathURL.indexOf(')');
      const clipPathID = clipPathURL.substring(openParenIndex + 1, closeParenIndex);

      // Scale up circle within clipPath
      const clippingCircle = d3.select(clipPathID + ' circle');
      clippingCircle
        .transition(stretchTransition)
          .tween('transform', function() {
            const cx = this.getAttribute('cx');
            const cy = this.getAttribute('cy');
            const start = `translate(${cx}, ${cy}) scale(1) translate(-${cx}, -${cy})`;
            const end = `translate(${cx}, ${cy}) scale(${scaleFactor}) translate(-${cx}, -${cy})`;
            const interpolator = d3.interpolateString(start, end);
            return function(t) { this.setAttribute('transform', interpolator((t))); };
          });

      // Translate clipPath to center
      const clipPath = d3.select(clipPathID);
      const cx = clipPath.select('circle').attr('cx');
      const cy = clipPath.select('circle').attr('cy');
      d3.select(clipPathID)
        .transition(stretchTransition)
          .attr('transform', `translate(${s.width/2 - cx}, ${s.height/2 - cy})`);

      // Scale up and translate gradient to center
      const gradientCircle = clickedGroup.select('circle');
      const end = gradientCircle.attr('r') * scaleFactor;
      gradientCircle
        .transition(stretchTransition)
          .attr('r', end)
          .attr('cx', s.width/2)
          .attr('cy', s.height/2);

      // Append a clipPath with a circle
      const clipCX = getRandomInt(s.radius, s.width - s.radius);
      const clipCY = getRandomInt(s.radius, s.height - s.radius);
      d3.select('defs')
        .append('clipPath')
          .attr('id', 'clip-' + s.level)
        .append('circle')
          .attr('cx', clipCX)
          .attr('cy', clipCY)
          .attr('r', s.radius);

      // Append a nested g containing a rect and a circle for gradient/shading
      const nestedGroup = clickedGroup.append('g')
          .attr('clip-path', 'url(#clip-' + s.level + ')');

      nestedGroup.append('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', s.width)
          .attr('height', s.height)
          .attr('fill', colors.next());

      nestedGroup.append('circle')
          .attr('cx', clipCX)
          .attr('cy', clipCY)
          .attr('r', s.radius)
          .attr('fill', 'url(#gradient-1)');
    }
  });
};

/**************
Helper Functions
**************/

// Copied from MDN
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#Getting_a_random_integer_between_two_values
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}
