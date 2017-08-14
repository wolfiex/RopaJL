//moving particles

var flow = class particleflow {
constructor(startPoint, endPoint,size){
this.startPoint= startPoint; this.endPoint = endPoint;
var numPoints = 30,numParticles=100*size;
this.animationPoints = [];
for(var i=0; i <= numPoints; i ++){
        var thisPoint = startPoint.clone().lerp(endPoint, i/numPoints);
        this.animationPoints.push(thisPoint);
      }

var particleGeometry = new THREE.Geometry();
  //add particles to scene
  for ( i = 0; i < numParticles; i ++ ) {
  var desiredIndex = i / numParticles * this.animationPoints.length;
  function constrain(v, min, max){
    if( v < min )
    v = min;
    else
    if( v > max )
    v = max;
    return v;
  }
  var rIndex = constrain(Math.floor(desiredIndex),0,this.animationPoints.length-1);
  var particle = new THREE.Vector3();
  var particle = this.animationPoints[rIndex].clone();
  particle.moveIndex = rIndex;
  particle.nextIndex = rIndex+1;
  if(particle.nextIndex >= this.animationPoints.length )
  particle.nextIndex = 0;
  particle.lerpN = 0;
  particle.path = this.animationPoints;
  particleGeometry.vertices.push( particle );
  }

  //set particle material

  var pMaterial = new THREE.ParticleBasicMaterial({
    //color: window.color(size),
    size: 3* (1-size),

  blending: THREE.AdditiveBlending,
  transparent: true
  });

this.particles = new THREE.ParticleSystem( particleGeometry, pMaterial );
    this.particles.sortParticles = true;
    this.particles.dynamic = true;
    scene.add(this.particles);
}


 UpdateParticles(){
    for( var i = 0; i < this.particles.geometry.vertices.length; i++ ){
      var particle = this.particles.geometry.vertices[i];
      var path = particle.path;
      particle.lerpN += 0.05;
      if(particle.lerpN > 1){
        particle.lerpN = 0;
        particle.moveIndex = particle.nextIndex;
        particle.nextIndex++;
        if( particle.nextIndex >= path.length ){
          particle.moveIndex = 0;
          particle.nextIndex = 1;
        }
      }

      var currentPoint = path[particle.moveIndex];
      var nextPoint = path[particle.nextIndex];


      particle.copy( currentPoint );
      particle.lerp( nextPoint, particle.lerpN );
    }
    this.particles.geometry.verticesNeedUpdate = true;
  };
}



////////////////////////////////////////////////////////////////////////////////


var ThreeLayout;
( function (ThreeLayout) {

    var Graph = ThreeLayout.Graph = (function () {
        function Graph(parentObject, graph) {
            var _this = this;
            var n = graph.nodes.length
            this.edgeList = [];
            this.parentObject = parentObject;
            this.rootObject = new THREE.Object3D();
            parentObject.add(this.rootObject);
            // Create all the node meshes
            this.nodeMeshes = Array(n);
            for (var i = 0; i < n; ++i) {
                var con = window.concs[i];

                if (isNaN(con)){con = 0.01};
                var sphere = this.nodeMeshes[i] = new THREE.Mesh(
                  new THREE.SphereGeometry(2+10*window.concs[i] ,  50, 50), //radius, segments, rings  (i)=> {isNan(conc[i])?0.1:2+ 12*conc[i]}
                  new THREE.MeshPhongMaterial( {
          color: window.color1(concs[i]),
          specular: 0x050505,
          shininess: 100
      } )
                     //new THREE.MeshLambertMaterial({ color: window.color1(graph.nodes[i].s)})
                   );
                this.rootObject.add(sphere);
            }
            // Create all the edges
            graph.links.forEach(function (e) {
                _this.edgeList.push(
                  new Edge(_this.rootObject, _this.nodeMeshes[e.source.index].position,
                     _this.nodeMeshes[e.target.index].position, (isNaN(window.concs[e.id])?0:concs[e.id]))); ///////// (isNaN(window.concs[e.id])?0:concs[e.id])

                     ////// concs here
                     ////// concs here
                     ////// concs here
                     ////// concs here
                     ////// concs here
                     ////// concs here
                     ////// concs here




            });
        }
        Graph.prototype.setNodePositions = function (graph) {

            for (var i = 0; i < this.nodeMeshes.length; ++i) {1
                var p = this.nodeMeshes[i].position;
                var nd = graph.nodes[i]
                p.x = nd.x;
                p.y = nd.y;
                p.z = nd.z;
                this.nodeMeshes[i].position = p             }
        };


        Graph.prototype.addflow = function () {
            this.edgeList.forEach(function (e) {return e.addflow(); });
        };

        Graph.prototype.river = function () {
            this.edgeList.forEach(function (e) {return e.flowfeed.UpdateParticles(); });
        };



        Graph.prototype.update = function () {
            this.edgeList.forEach(function (e) {return e.update(); });
        };
        // Remove self from the scene so that the object can be GC'ed
        Graph.prototype.destroy = function () {
            this.parentObject.remove(this.rootObject);
        };
        return Graph;
    })();




    var Edge = ThreeLayout.Edge = (function () {
        function Edge(parentObject, sourcePoint, targetPoint,strength ) {
            this.parentObject = parentObject;
            this.sourcePoint = sourcePoint;
            this.targetPoint = targetPoint;


            this.strength=strength;
            this.shape = this.makeCylinder();
            parentObject.add(this.shape);

        }

        Edge.prototype.makeCylinder = function () {
            var n = 12, points = [], cosh = function (v) { return (Math.pow(Math.E, v) + Math.pow(Math.E, -v)) / 2; };
            var xmax = 2.3 , m = (0.4+this.strength/2) * cosh(xmax);
            for (var i = 0; i < n + 1; i++) {
                var x = 2 * xmax * (i - n / 2) / n;
                points.push(new THREE.Vector3(cosh(x) / m, 0, (i - n / 2) / n));
            }
            var material =   new THREE.MeshPhongMaterial( {
    color: window.color(this.strength),
    specular: 0x050505,
    shininess: 100
} )
//new THREE.MeshLambertMaterial({ color: window.color(this.strength)}),
                 geometry = new THREE.LatheGeometry(points, 12),
                 cylinder = new THREE.Mesh(geometry, material);
            return cylinder;
        };

        Edge.prototype.addflow=function(){
          this.flowfeed = new flow(this.sourcePoint,this.targetPoint,this.strength);
          window.help=true;
};





        Edge.prototype.update = function () {

            var a = this.sourcePoint, b = this.targetPoint;

            var m = new THREE.Vector3();
            m.addVectors(a, b).divideScalar(2);
            this.shape.position = m;
            var origVec = new THREE.Vector3(0,0,1); //vector of cylinder
            var targetVec = new THREE.Vector3();
            targetVec.subVectors(b, a);
            var l = targetVec.length();

            //this.shape.scale.set(2,parseInt(4*(1-this.strength)), l);
            this.shape.scale.set(1,1, l);

            targetVec.normalize();
            var angle = Math.acos(origVec.dot(targetVec));
            var axis = new THREE.Vector3();
            axis.crossVectors(origVec, targetVec);
            axis.normalize();

            var quaternion = new THREE.Quaternion();
            quaternion.setFromAxisAngle(axis, angle);
            this.shape.quaternion = quaternion;
        };
        return Edge;
    })();


})

(ThreeLayout || (ThreeLayout = {}));
