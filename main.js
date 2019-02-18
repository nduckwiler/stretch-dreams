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
let radius = 25;

// state object
const s = {
  level: 1,
  width: 300,
  height: 200,
};

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
    const clipPathLevel = clipPathURL ? clipPathURL.match(/\d+/)[0] : undefined;
    // If target's parent has clipPath and it matches the current level, increase its radius
    if (clipPathURL && clipPathLevel == s.level) {
      console.log(`clip path found with url ${clipPathURL}. Expanding and adding another layer...`);
      media.play();

      s.level++;
      radius = radius - 0.25;
      const openParenIndex = clipPathURL.indexOf('(');
      const closeParenIndex = clipPathURL.indexOf(')');
      const clipPathID = clipPathURL.substring(openParenIndex + 1, closeParenIndex);
      // Expand the clip and the gradient shadow
      // Use Math.pow() because ** operator because is not supported in IE
      d3.select(clipPathID + ' circle')
          .transition()
          .duration(500)
          .attr('r', Math.sqrt(Math.pow(200,2) + Math.pow(300,2)))
      clickedGroup.select('circle')
          .transition()
          .duration(1500)
          .attr('r', Math.sqrt(Math.pow(200,2) + Math.pow(300,2)))

      // Add a clipPath, nested g, and a rect
      const clipCX = getRandomInt(radius, s.width - radius);
      const clipCY = getRandomInt(radius, s.height - radius);
      d3.select('defs')
        .append('clipPath')
          .attr('id', 'clip-' + s.level)
        .append('circle')
          .attr('cx', clipCX)
          .attr('cy', clipCY)
          .attr('r', radius);

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
          .attr('r', radius)
          .attr('fill', 'url(#gradient-1)');

      // Add a gradient to the SVG
      // d3.select(this).append('circle')
      //    .attr('cx', s.width/2)
      //    .attr('cy', s.height/2)
      //    .attr('r', Math.sqrt(Math.pow(200,2) + Math.pow(300,2)) / 2)
      //    .attr('fill', 'url(#gradient-1)')
      //    .attr('fill-opacity', '0')
      //    .transition()
      //    .duration(1500)
      //    .attr('fill-opacity', '1');

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
