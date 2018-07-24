/*


Inspired by:
	Makio135's sketch www.openprocessing.org/sketch/385808
 */

var freq = [261.63, 293.66, 329.63, 392.00, 440.00, 493.88]

var filter, filterFreq, filterRes, reverb;;

var attackLevel = 0.6;
var releaseLevel = 0;

var attackTime = 0.1
var decayTime = 0.9;
var susPercent = 0.6;
var releaseTime = 1.1;

var env, triOsc;

var allParticles = [];
var maxLevel = 5;
var useFill = false;

var data = [];
var value = 0;


function Particle(x, y, level) {
  this.level = level;
  this.life = 0;

  this.pos = new p5.Vector(x, y);
  this.vel = p5.Vector.random2D();
  this.vel.mult(map(this.level, 0, maxLevel, 5, 2));

  this.move = function() {
    this.life++;

    // Add friction.
    this.vel.mult(0.9);

    this.pos.add(this.vel);

    // Spawn a new particle if conditions are met.
    if (this.life % 10 == 0) {
      if (this.level > 0) {
        this.level -= 1;
        var newParticle = new Particle(this.pos.x, this.pos.y, this.level - 1);
        allParticles.push(newParticle);
      }
    }
  }
}


function setup() {
  reverb = new p5.Reverb();
  filter = new p5.LowPass();
  env = new p5.Env();
  env.setADSR(attackTime, decayTime, susPercent, releaseTime);
  env.setRange(attackLevel, releaseLevel);

  triOsc = new p5.Oscillator('sine');
  triOsc.amp(env);
  triOsc.start();
  // triOsc.disconnect();

  createCanvas(windowWidth, windowHeight);
  // triOsc.disconnect();
  reverb.process(triOsc, 4, 3);
  reverb.connect(filter);
  colorMode(HSB, 360);

  textAlign(CENTER);

  background(255);
}


function draw() {

  // frequency (150Hz) to the highest (15050) that humans can hear
  filterFreq = map(mouseX, 0, windowWidth, 150, 10050);
  // console.log(filterFreq)
  // Map mouseY to resonance (volume boost) at the cutoff frequency
  filterRes = (10);

  // set filter parameters
  filter.set(filterFreq, filterRes);
  // Create fade effect.
  noStroke();
  fill(360, 30);
  rect(0, 0, width, height);
  // Move and spawn particles.
  // Remove any that is below the velocity threshold.
  for (var i = allParticles.length - 1; i > -1; i--) {
    allParticles[i].move();

    if (allParticles[i].vel.mag() < 0.7) {
      allParticles.splice(i, 1);
    }
  }

  if (allParticles.length > 0) {
    // Run script to get points to create triangles with.
    data = Delaunay.triangulate(allParticles.map(function(pt) {
      return [pt.pos.x, pt.pos.y];
    }));

    strokeWeight(0.1);

    // Display triangles individually.
    for (var i = 0; i < data.length; i += 3) {
      // Collect particles that make this triangle.
      var p1 = allParticles[data[i]];
      var p2 = allParticles[data[i + 1]];
      var p3 = allParticles[data[i + 2]];

      // Don't draw triangle if its area is too big.
      var distThresh = 75;

      if (dist(p1.pos.x, p1.pos.y, p2.pos.x, p2.pos.y) > distThresh) {
        continue;
      }

      if (dist(p2.pos.x, p2.pos.y, p3.pos.x, p3.pos.y) > distThresh) {
        continue;
      }

      if (dist(p1.pos.x, p1.pos.y, p3.pos.x, p3.pos.y) > distThresh) {
        continue;
      }

      // Base its hue by the particle's life.

      noStroke();
      fill(165 + p1.life * 1.5, 360, 360);


      triangle(p1.pos.x, p1.pos.y,
        p2.pos.x, p2.pos.y,
        p3.pos.x, p3.pos.y);
    }
  }

  noStroke();
  fill(255, 0, 0);



}

function mouseReleased() {
  env.triggerRelease();
}

function envAttack() {

  env.triggerAttack();
}



var nota_attuale = freq[1];

window.addEventListener('load', function(){ // on page load

    document.body.addEventListener('touchmove', function(e){
      envAttack();

      allParticles.push(new Particle(mouseX, mouseY, maxLevel));

      console.log("move Y:" +e.changedTouches[0].pageY) // alert pageX coordinate of touch point




    },
    false)


}, false)






function mouseDragged() {

  // envAttack();
  //
  // allParticles.push(new Particle(mouseX, mouseY, maxLevel));
  // griglia()
  if (mouseY > 0 && mouseY < (windowHeight / 2) / 2) {
    // console.log("Soglia 1")



    // nota_attuale++
    triOsc.freq(nota_attuale)
  }
  if (mouseY > (windowHeight / 3) && mouseY < (windowHeight / 2)) {
    // console.log("Soglia 2")


    triOsc.freq(freq[2])
  }
  if (mouseY > (windowHeight / 2) && mouseY < windowHeight / 6 + (windowHeight / 2)) {
    // console.log("Soglia 3")


    triOsc.freq(freq[3])

  }
  if (mouseY > windowHeight / 6 + (windowHeight / 2) && mouseY < (windowHeight + (windowHeight / 2)) / 2) {
    // console.log("Soglia 4")


    triOsc.freq(freq[4])

  }
  if (mouseY > (windowHeight + (windowHeight / 2)) / 2 && mouseY < windowHeight / 3 + (windowHeight + 2)) {
    // console.log("Soglia 5")


    triOsc.freq(freq[5])

  }
  // masterVolume(map(mouseX,0,windowWidth,0.1,0.6));
}
